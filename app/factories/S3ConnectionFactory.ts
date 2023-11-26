import {S3Client} from "@aws-sdk/client-s3";
import {fromEnv} from "@aws-sdk/credential-providers";
import AWSXRay from "aws-xray-sdk-core";
import Configurator from "../components/Configurator";

export default class S3ConnectionFactory {
	static createInstance(configurator: Configurator): S3Client {
		const region = configurator.parameters<string>('s3.region');
		const endpoint = configurator.parameters<string>('s3.endpoint');

		return AWSXRay.captureAWSv3Client(new S3Client({
			forcePathStyle: true,
			region,
			endpoint: endpoint ?? undefined,
			credentials: fromEnv(),
		}));
	}
}
