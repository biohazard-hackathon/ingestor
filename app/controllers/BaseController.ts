import {Message} from '../types/requests';

export default abstract class BaseController {
	abstract actionDefault(data: Message): Promise<any>;
}
