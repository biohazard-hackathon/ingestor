import {Logger} from '@aws-lambda-powertools/logger';

import Configurator from '../components/Configurator';
import Version from '../components/Version';

export default class LoggerFactory {
	static createInstance(configurator: Configurator, version: Version): Logger {
		return new Logger({
			serviceName: 'ingestor',
			logLevel: configurator.parameters('logger.level'),
			persistentLogAttributes: {
				version: version.getVersion(),
				buildDate: version.getBuildDate(),
				nodeVersion: process.version,
			},
		});
	}
}
