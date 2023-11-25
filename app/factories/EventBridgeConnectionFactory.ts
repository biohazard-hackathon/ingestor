import {fromEnv} from "@aws-sdk/credential-providers";
import AWSXRay from "aws-xray-sdk-core";
import Configurator from "../components/Configurator";
import {EventBridgeClient} from '@aws-sdk/client-eventbridge';

export default class EventBridgeConnectionFactory {
	static createInstance(configurator: Configurator): EventBridgeClient {
		const region = configurator.parameters<string>('eventbridge.region');
		const endpoint = configurator.parameters<string>('eventbridge.endpoint');

		return AWSXRay.captureAWSv3Client(new EventBridgeClient({
			region,
			endpoint: endpoint ?? undefined,
			credentials: fromEnv(),
		}));
	}
}
