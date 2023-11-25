import {Logger} from '@aws-lambda-powertools/logger';

import BaseController from './BaseController';
import Version from '../components/Version';
import {tracer} from '../factories/TracerFactory';

export default class HealthCheckController extends BaseController {

	static IDENTIFIER = 'health-check';

	constructor(
		private readonly version: Version,
		private readonly logger: Logger,
	) {
		super();
	}

	@tracer.captureMethod({subSegmentName: 'HealthCheckController::default'})
	public async actionDefault() {
		const result = {
			status: 'Healthy :)',
			version: this.version.getVersion(),
			stable: this.version.isStable(),
			buildDate: this.version.getBuildDate(),
		};

		this.logger.info('Health Check', {result});

		return result;
	}
}
