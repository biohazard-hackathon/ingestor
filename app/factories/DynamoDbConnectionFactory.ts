import {DynamoDBClient} from "@aws-sdk/client-dynamodb";
import {fromEnv} from "@aws-sdk/credential-providers";
import AWSXRay from "aws-xray-sdk-core";
import Configurator from "../components/Configurator";

export default class DynamoDbConnectionFactory {
	static createInstance(configurator: Configurator): DynamoDBClient {
		const region = configurator.parameters<string>('dynamoDb.region');
		const endpoint = configurator.parameters<string>('dynamoDb.endpoint');

		return AWSXRay.captureAWSv3Client(new DynamoDBClient({
			region,
			endpoint: endpoint ?? undefined,
			credentials: fromEnv(),
		}));
	}
}
