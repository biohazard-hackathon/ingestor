import {
	CreateBucketCommand,
	CreateBucketCommandInput,
	CreateBucketCommandOutput,
	DeleteBucketCommand,
	DeleteBucketCommandInput,
	DeleteBucketCommandOutput,
	DeleteObjectsCommand,
	DeleteObjectsCommandInput,
	DeleteObjectsCommandOutput, GetObjectCommand, GetObjectCommandInput, GetObjectCommandOutput,
	ListObjectsV2Command,
	ListObjectsV2CommandInput,
	ListObjectsV2CommandOutput,
	ObjectIdentifier,
	PutObjectCommand,
	PutObjectCommandInput,
	PutObjectCommandOutput,
	S3Client,
} from "@aws-sdk/client-s3";
import {tracer} from "../factories/TracerFactory";
import BaseModel from "./BaseModel";
import assert from "assert";

export default class S3Model extends BaseModel {

	constructor(private readonly s3Client: S3Client) {
		super();
	}

	public createBucket(bucket: string, params?: Omit<CreateBucketCommandInput, "Bucket">): Promise<CreateBucketCommandOutput> {
		const input: CreateBucketCommandInput = {
			Bucket: bucket,
			...params,
		};

		const command = new CreateBucketCommand(input);
		return this.s3Client.send(command);
	}

	public deleteBucket(bucket: string, params?: Omit<DeleteBucketCommandInput, "Bucket">): Promise<DeleteBucketCommandOutput> {
		const input: DeleteBucketCommandInput = {
			Bucket: bucket,
			...params,
		};

		const command = new DeleteBucketCommand(input);
		return this.s3Client.send(command);
	}

	@tracer.captureMethod({subSegmentName: 'S3Model::deleteObjects'})
	public deleteObjects(bucket: string, objects: ObjectIdentifier[], params?: Omit<DeleteObjectsCommandInput, "Bucket">): Promise<DeleteObjectsCommandOutput> {
		const input: DeleteObjectsCommandInput = {
			Bucket: bucket,
			...params,
			Delete: {
				Objects: objects,
			},
		};

		const command = new DeleteObjectsCommand(input);
		return this.s3Client.send(command);
	}

	@tracer.captureMethod({subSegmentName: 'S3Model::putObject'})
	public putObject(bucket: string, key: string, body: string | Uint8Array | Buffer, params?: Omit<PutObjectCommandInput, "Bucket" | "Key">): Promise<PutObjectCommandOutput> {
		const input: PutObjectCommandInput = {
			Bucket: bucket,
			Key: key,
			Body: body,
			...params,
		};

		const command = new PutObjectCommand(input);
		return this.s3Client.send(command);
	}

	@tracer.captureMethod({subSegmentName: 'S3Model::getObject'})
	public getObject(bucket: string, key: string, params?: Omit<GetObjectCommandInput, "Bucket" | "Key">): Promise<GetObjectCommandOutput> {
		const input: GetObjectCommandInput = {
			Bucket: bucket,
			Key: key,
			...params,
		};

		const command = new GetObjectCommand(input);
		return this.s3Client.send(command);
	}

	@tracer.captureMethod({subSegmentName: 'S3Model::listObjects'})
	public listObjects(bucket: string, prefix = '', params?: Omit<ListObjectsV2CommandInput, "Bucket" | "Prefix">): Promise<ListObjectsV2CommandOutput> {
		const input: ListObjectsV2CommandInput = {
			Bucket: bucket,
			Prefix: prefix,
			...params,
		};

		const command = new ListObjectsV2Command(input);
		return this.s3Client.send(command);
	}

	@tracer.captureMethod({subSegmentName: 'S3Model::listAllObjects'})
	public async listAllObjects(bucketName: string, prefix = ''): Promise<string[]> {
		let continuationToken: string | undefined;
		const keys: string[] = [];
		do {
			const list = await this.listObjects(bucketName, prefix, {
				ContinuationToken: continuationToken,
			});
			continuationToken = list.NextContinuationToken;

			assert.ok(list.Contents, 'S3 Object list is empty');

			for (const object of list.Contents) {
				assert.ok(object.Key, 'S3 Object key is missing');
				keys.push(object.Key);
			}
		} while (continuationToken);

		return keys;
	}

	public async emptyBucket(bucket: string): Promise<void> {
		const allObjects = await this.listAllObjects(bucket);
		const keys: ObjectIdentifier[] = allObjects.map((key) => ({Key: key}));

		while (keys.length > 0) {
			const batch = keys.splice(0, 1000);
			await this.deleteObjects(bucket, batch);
		}
	}
}
