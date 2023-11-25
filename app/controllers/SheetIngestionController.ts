import {Logger} from '@aws-lambda-powertools/logger';

import BaseController from './BaseController';
import {tracer} from '../factories/TracerFactory';
import {SheetIngestionMessage} from '../types/requests';

export default class SheetIngestionController extends BaseController {

	static IDENTIFIER = 'sheet-ingestion';

	constructor(
		private readonly logger: Logger,
	) {
		super();
	}

	@tracer.captureMethod({subSegmentName: 'SheetIngestionController::default'})
	public async actionDefault(data: SheetIngestionMessage) {
		this.logger.info('payload', {data});
	}
}
