import {readFileSync} from 'fs';
import {createContainer, dynamoDbSetup, dynamoDbTeardown, s3Setup, s3Teardown} from '../testContainer';
import SheetIngestionController from '../../app/controllers/SheetIngestionController';
import S3Model from '../../app/models/S3Model';
import {SheetIngestionMessage} from '../../app/types/requests';
import Configurator from '../../app/components/Configurator';

describe('Sheet Controller', () => {
	const container = createContainer('sheet-ingestion-controller');
	const controller = container.get<SheetIngestionController>('sheetIngestionController');
	const s3Model = container.get<S3Model>('s3Model');
	const configurator = container.get<Configurator>('configurator');
	const bucketName = configurator.parameters('s3.buckets.raw');

	beforeAll(async () => {
		await Promise.all([
			s3Setup(container),
			dynamoDbSetup(container),
		]);
	});

	afterAll(async () => {
		await Promise.all([
			s3Teardown(container),
			dynamoDbTeardown(container),
		]);
	});

	test('should call the default action', async () => {
		//expect.assertions(1);

		const inputMessage: SheetIngestionMessage = {
			type: 'sheet-ingestion',
			payload: {
				id: 'sample',
			},
		};

		const file = readFileSync(__dirname + '/../sample.xlsx');
		await s3Model.putObject(bucketName, inputMessage.payload.id + '.xlsx', file);

		await expect(controller.actionDefault(inputMessage)).resolves.toBeTruthy();
	});
});
