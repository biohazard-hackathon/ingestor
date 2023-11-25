import {join} from 'path';
import {ContainerBuilder, YamlFileLoader} from 'node-dependency-injection';

//@ts-ignore
export const createContainer = (postfix?: string): ContainerBuilder => {
	const srcDir = join(__dirname, '../app');
	const container = new ContainerBuilder(true, srcDir);

	const loader = new YamlFileLoader(container);
	loader.load(__dirname + '/../app/config/services.yml');

	container.compile();

	return container;
};
