import {Logger} from '@aws-lambda-powertools/logger';
import xlsx from 'node-xlsx';
import {marshall} from '@aws-sdk/util-dynamodb';

import BaseController from './BaseController';
import {tracer} from '../factories/TracerFactory';
import {SheetIngestionMessage} from '../types/requests';
import S3Model from '../models/S3Model';
import Configurator from '../components/Configurator';
import EventBridgeModel from '../models/EventBridgeModel';
import {Status} from '../types/event';
import {Required} from '../types/columns';
import {DynamoDbModel} from '../models/DynamoDbModel';

function sleep(ms: number): Promise<any> {
	return new Promise(resolve => setTimeout(resolve, ms));
}

export default class SheetIngestionController extends BaseController {

	static IDENTIFIER = 'sheet-ingestion';

	private readonly bucketName: string;
	private readonly eventBusName: string;
	private readonly eventBridgeEnabled: boolean;
	private readonly reportTableName: string;

	constructor(
		private readonly logger: Logger,
		private readonly s3Model: S3Model,
		private readonly eventBridgeModel: EventBridgeModel,
		private readonly dynamoDbModel: DynamoDbModel,
		configurator: Configurator,
	) {
		super();
		this.bucketName = configurator.parameters('s3.buckets.raw');
		this.eventBusName = configurator.parameters('eventbridge.name');
		this.eventBridgeEnabled = configurator.parameters<boolean>('eventbridge.enabled');
		this.reportTableName = configurator.parameters<string>('dynamoDb.tables.report');
	}

	@tracer.captureMethod({subSegmentName: 'SheetIngestionController::default'})
	public async actionDefault(data: SheetIngestionMessage) {
		this.logger.info('payload', {data});

		const id = data.payload.id;
		const fileName = id + '.xlsx';
		let file;

		try {
			file = await this.s3Model.getObject(this.bucketName, fileName);
		} catch(exception) {
			console.log(await this.sendEvent(id, Status.ERROR, JSON.stringify({
				message: 'File not found',
				fileName,
			})));
			return false;
		}

		const fileContents = await file.Body?.transformToByteArray();

		await sleep(2000);

		await this.sendEvent(id, Status.SHEET_LOADED, JSON.stringify({
			size: fileContents?.length,
		}));

		const sheet = xlsx.parse(fileContents);
		const validTabs = sheet.filter((tab) => tab.name.toLowerCase().startsWith('variants'));
		const availableTabNames = sheet.map((tab) => ({
			name: tab.name,
		}));

		if (validTabs.length != 1) {
			await this.sendEvent(id, Status.ERROR, JSON.stringify({
				message: 'We could not find the Variants tab',
				availableTabNames,
			}));
			return false;
		}

		const mainTab = validTabs[0];
		const blockId = mainTab.name
			.toUpperCase()
			.replace('VARIANTS-', '')
			.replace('DG-', '')
			.replace('...', '')
			.trim()
			.replace(/_(.*)$/, '')
			.trim();

		await sleep(2000);

		await this.sendEvent(id, Status.SHEET_PARSED, JSON.stringify({
			availableTabNames,
			usingTab: mainTab.name,
			blockId,
		}));

		if (mainTab.data.length < 2) {
			await this.sendEvent(id, Status.ERROR, JSON.stringify({
				message: 'This sheet has less then 2 lines',
				numberOfLines: mainTab.data.length,
				usingTab: mainTab.name,
				blockId,
			}));
			return false;
		}

		const rawHeadings = mainTab.data[0];

		const headings: string[] = [];

		for (const heading of rawHeadings) {
			const cleanHeading = this.camelize(heading.trim()).replace('/', '');

			if (cleanHeading === 'originTracks') {
				headings.push('typeOfMutation');
			} else if (cleanHeading === 'tMBv4_GRCh38') {
				headings.push('geneName');
			} else {
				headings.push(cleanHeading);
			}
		}

		const missingHeadings = [];

		for (const heading of Required) {
			if (!headings.includes(heading)) {
				missingHeadings.push(heading);
			}
		}

		if (missingHeadings.length > 0) {
			await this.sendEvent(id, Status.ERROR, JSON.stringify({
				message: 'This sheet has missing columns',
				missingHeadings,
				rawHeadings,
				usingTab: mainTab.name,
				blockId,
			}));
			return false;
		}

		await sleep(2000);

		await this.sendEvent(id, Status.SHEET_VALIDATED, JSON.stringify({
			availableTabNames,
			usingTab: mainTab.name,
			rawHeadings,
			transformedHeadings: headings,
			blockId,
		}));

		const results: Record<string, Record<string, string>> = {};

		mainTab.data.shift();

		// @ts-ignore
		for (const row of mainTab.data) {
			//console.log(row);
			const result: Record<string, string> = {};
			for (const index in headings) {
				const key = headings[index];
				result[key] = row[index];
			}

			results[result.codingRegionChange] = result;
		}

		const marshalled = marshall({
			id,
			blockId,
			results,
		}, {
			removeUndefinedValues: true,
		});

		await this.dynamoDbModel.putItem(this.reportTableName, marshalled);

		await sleep(2000);

		await this.sendEvent(id, Status.SHEET_TRANSFORMED, JSON.stringify({
			availableTabNames,
			usingTab: mainTab.name,
			rawHeadings,
			transformedHeadings: headings,
			blockId,
			transformedRows: Object.keys(results).length
		}));

		await sleep(2000);

		await this.sendEvent(id, Status.COMPLETED, JSON.stringify({
			finished: true,
		}));

		return true;
	}

	private async sendEvent(id: string, status: string, output: string) {
		try {
			this.logger.debug('Publishing event', {detail: {id, status, output}});
			if (this.eventBridgeEnabled) {
				return this.eventBridgeModel.sendEvent(this.eventBusName, 'ingestion.status', id, status, output);
			}
		} catch (exception) {
			this.logger.error('Failed to send event', {exception});
		}
		return;
	}

	private camelize(str: string): string {
		return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
			return index === 0 ? word.toLowerCase() : word.toUpperCase();
		}).replace(/\s+/g, '');
	}
}
