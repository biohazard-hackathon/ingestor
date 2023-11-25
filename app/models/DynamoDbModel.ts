import BaseModel from "./BaseModel";
import {
	CreateTableCommand,
	CreateTableCommandInput,
	CreateTableCommandOutput,
	DeleteTableCommand,
	DeleteTableCommandInput,
	DeleteTableCommandOutput,
	DynamoDBClient,
	PutItemCommand,
	PutItemCommandInput,
	PutItemCommandOutput,
} from "@aws-sdk/client-dynamodb";
import {
	AttributeDefinition,
	AttributeValue,
	KeySchemaElement,
} from '@aws-sdk/client-dynamodb/dist-types/models/models_0';


export class DynamoDbModel extends BaseModel {
	constructor(
		private readonly dynamoDBClient: DynamoDBClient,
	) {
		super();
	}

	public async createTable(tableName: string, keySchema: KeySchemaElement[], attrs: AttributeDefinition[], params?: Omit<CreateTableCommandInput, "TableName" | "KeySchema" | "AttributeDefinitions">): Promise<CreateTableCommandOutput> {
		const input: CreateTableCommandInput = {
			TableName: tableName,
			KeySchema: keySchema,
			AttributeDefinitions: attrs,
			BillingMode: 'PAY_PER_REQUEST',
			...params,
		};

		const command = new CreateTableCommand(input);

		return this.dynamoDBClient.send(command);
	}

	public async deleteTable(tableName: string, params?: Omit<DeleteTableCommandInput, "TableName">): Promise<DeleteTableCommandOutput> {
		const input: DeleteTableCommandInput = {
			TableName: tableName,
			...params,
		};

		const command = new DeleteTableCommand(input);

		return this.dynamoDBClient.send(command);
	}

	public async putItem(tableName: string, item: Record<string, AttributeValue>, params?: Omit<PutItemCommandInput, "TableName" | "Item">): Promise<PutItemCommandOutput> {
		const input: PutItemCommandInput = {
			TableName: tableName,
			Item: item,
			...params,
		};

		const command = new PutItemCommand(input);

		return this.dynamoDBClient.send(command);
	}
}
