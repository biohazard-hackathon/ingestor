import { join } from 'path';
import { ContainerBuilder, YamlFileLoader } from 'node-dependency-injection';

export default class ContainerFactory {
	static createInstance(): ContainerBuilder {
		const srcDir = join(__dirname, '../');
		const container = new ContainerBuilder(true, srcDir);

		const loader = new YamlFileLoader(container);
		loader.load(__dirname + '/../config/services.yml');

		container.compile();

		return container;
	}
}
