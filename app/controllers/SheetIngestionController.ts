import {Logger} from '@aws-lambda-powertools/logger';
import xlsx from 'node-xlsx';

import BaseController from './BaseController';
import {tracer} from '../factories/TracerFactory';
import {SheetIngestionMessage} from '../types/requests';
import S3Model from '../models/S3Model';
import Configurator from '../components/Configurator';
import EventBridgeModel from '../models/EventBridgeModel';
import {Status} from '../types/event';

export default class SheetIngestionController extends BaseController {

	static IDENTIFIER = 'sheet-ingestion';

	private readonly bucketName: string;
	private readonly eventBusName: string;
	private readonly eventBridgeEnabled: boolean;

	constructor(
		private readonly logger: Logger,
		private readonly s3Model: S3Model,
		private readonly eventBridgeModel: EventBridgeModel,
		configurator: Configurator,
	) {
		super();
		this.bucketName = configurator.parameters('s3.buckets.raw');
		this.eventBusName = configurator.parameters('eventbridge.name');
		this.eventBridgeEnabled = configurator.parameters<boolean>('eventbridge.enabled');
	}

	@tracer.captureMethod({subSegmentName: 'SheetIngestionController::default'})
	public async actionDefault(data: SheetIngestionMessage) {
		this.logger.info('payload', {data});

		const id = data.payload.id;
		const fileName = id + '.xlsx';

		const file = await this.s3Model.getObject('raw', fileName);
		const fileContents = await file.Body?.transformToByteArray();

		await this.sendEvent(id, Status.SHEET_LOADED, JSON.stringify({
			size: fileContents?.length,
		}));

		const sheet = xlsx.parse(fileContents);
		const mainTab = sheet.filter((tab) => tab.name.startsWith('Variants'));
		const availableTabNames = sheet.map((tab) => ({
			name: tab.name,
		}));

		if (mainTab.length != 1) {
			await this.sendEvent(id, Status.ERROR, JSON.stringify({
				message: 'We could not find the Variants tab',
				availableTabNames,
			}));
			return;
		}

		await this.sendEvent(id, Status.SHEET_PARSED, JSON.stringify({
			availableTabNames,
			usingTab: mainTab.name,
		}));

		console.log(sheet);

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
}
