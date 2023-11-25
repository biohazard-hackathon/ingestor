import {Context} from 'aws-lambda';
import Router from './components/Router';
import ContainerFactory from './factories/ContainerFactory';
import {Message} from './types/requests';

const container = ContainerFactory.createInstance();

export async function run(context: Context, message: Message) {
	// Validation
	if (!('type' in message)) {
		throw new Error('Message does not contain `type` property.');
	}

	if (!('payload' in message)) {
		throw new Error('Message does not contain `payload` property.');
	}

	const router = container.get<Router>('router');

	const controller = router.getController(message.type);
	return controller.actionDefault(message);
}
