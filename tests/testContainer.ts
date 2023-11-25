import {join} from 'path';
import {ContainerBuilder, YamlFileLoader} from 'node-dependency-injection';
import S3Model from '../app/models/S3Model';
import Configurator from '../app/components/Configurator';

//@ts-ignore
export const createContainer = (postfix?: string): ContainerBuilder => {
	const srcDir = join(__dirname, '../app');
	const container = new ContainerBuilder(true, srcDir);

	const loader = new YamlFileLoader(container);
	loader.load(__dirname + '/../app/config/services.yml');

	container.compile();

	return container;
};

export const s3Setup = async (container: ContainerBuilder): Promise<void> => {
	const s3 = container.get<S3Model>('s3Model');
	const configurator = container.get<Configurator>('configurator');
	const bucketName = configurator.parameters<string>('s3.buckets.raw');

	await s3.createBucket(bucketName);
};

export const s3Teardown = async (container: ContainerBuilder): Promise<void> => {
	const s3 = container.get<S3Model>('s3Model');
	const configurator = container.get<Configurator>('configurator');
	const bucketName = configurator.parameters<string>('s3.buckets.raw');

	try {
		await s3.emptyBucket(bucketName);
	} catch (error) {
		console.warn(bucketName, error);
	}
	await s3.deleteBucket(bucketName);
};
