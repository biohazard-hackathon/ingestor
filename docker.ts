import { Context } from 'aws-lambda';
import express from 'express';
import {run} from './app/app';

const app = express();

const port = 4000;

app.use(express.json({limit: '1mb'}));
app.use(express.urlencoded({extended: true, limit: '1mb'})); // REST API requirements

app.post('/message', async (request, response) => {
	try {
		const result = await run({} as Context, request.body);
		response.send(result);
	} catch (error) {
		console.error(error);
		response.status(500).send(error);
	}
});

console.log(`listening on http://localhost:${port}/message`);
app.listen(port);
