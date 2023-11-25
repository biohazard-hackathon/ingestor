import middy from '@middy/core';
import {captureLambdaHandler} from '@aws-lambda-powertools/tracer';
import {Context} from 'aws-lambda';
import {run} from './app/app';
import {tracer} from './app/factories/TracerFactory';

export const handler = middy()
	.use(captureLambdaHandler(tracer))
	.handler(async (event, context: Context) => {
		context.callbackWaitsForEmptyEventLoop = false;

		console.log(event);
		// @ts-ignore
		return run(context, event);
	});
