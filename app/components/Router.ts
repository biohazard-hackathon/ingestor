import BaseController from '../controllers/BaseController';

export default class Router {

	private readonly controllers: Record<string, BaseController>;

	constructor(controllers: BaseController[]) {

		this.controllers = Object.assign({}, ...controllers.map(instance => ({
			//@ts-ignore
			[instance.constructor.IDENTIFIER]: instance,
		})));
	}

	getController(identifier: string) {
		if (Object.keys(this.controllers).includes(identifier)) {
			return this.controllers[identifier] as BaseController;
		}

		throw new Error(`Unknown type:', ${identifier}, 'Try one of those:', ${Object.keys(this.controllers)}`);
	}
}
