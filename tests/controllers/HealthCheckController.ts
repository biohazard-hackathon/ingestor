import HealthCheckController from '../../app/controllers/HealthCheckController';
import {createContainer} from '../testContainer';

describe('Test Controller', () => {
	const container = createContainer('health-check-controller');
	const controller = container.get<HealthCheckController>('healthCheckController');

	test('should call the default action', () => {
		expect.assertions(1);

		return expect(controller.actionDefault()).resolves.toBeTruthy();
	});
});
