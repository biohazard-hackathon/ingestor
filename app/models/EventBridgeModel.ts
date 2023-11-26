import {tracer} from "../factories/TracerFactory";
import BaseModel from "./BaseModel";
import {EventBridgeClient, PutEventsCommand, PutEventsCommandOutput} from '@aws-sdk/client-eventbridge';
import {PutEventsCommandInput} from '@aws-sdk/client-eventbridge/dist-types/commands/PutEventsCommand';
import {PutEventsRequestEntry} from '@aws-sdk/client-eventbridge/dist-types/models/models_0';
import {Status} from '../types/event';

export default class EventBridgeModel extends BaseModel {

	constructor(private readonly eventBridgeClient: EventBridgeClient) {
		super();
	}

	@tracer.captureMethod({subSegmentName: 'EventBridge::putEvents'})
	public putEvents(entries: PutEventsRequestEntry[], params?: Omit<PutEventsCommandInput, "Entries">): Promise<PutEventsCommandOutput> {
		const input: PutEventsCommandInput = {
			Entries: entries,
			...params,
		};

		const command = new PutEventsCommand(input);
		return this.eventBridgeClient.send(command);
	}

	@tracer.captureMethod({subSegmentName: 'EventBridge::sendEvent'})
	public sendEvent(eventBusName: string, source: string, id: string, status: string, output: string): Promise<PutEventsCommandOutput> {
		const event: PutEventsRequestEntry = {
			Source: source,
			EventBusName: eventBusName,
			Detail: JSON.stringify({
				id,
				status,
				output,
			}),
			DetailType: 'Ingestor',
		};

		return this.putEvents([event]);
	}
}
