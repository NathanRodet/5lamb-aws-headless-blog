import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  ScanCommand,
  PutCommand,
  GetCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";

const client = new DynamoDBClient({});

const dynamo = DynamoDBDocumentClient.from(client);

const tableName = "Posts";

export const handler = async (event, context) => {
  let body;
  let statusCode = 200;
  const headers = {
    "Content-Type": "application/json",
  };

  try {
    switch (event.routeKey) {
      case "DELETE /posts/{id}":
        await dynamo.send(
          new DeleteCommand({
            TableName: tableName,
            Key: {
              id: event.pathParameters.id,
            },
          })
        );
        body = `Deleted item ${event.pathParameters.id}`;
        break;
      case "GET /items/{id}":
        body = await dynamo.send(
          new GetCommand({
            TableName: tableName,
            Key: {
              id: event.pathParameters.id,
            },
          })
        );
        body = body.Item;
        break;
      case "GET /posts":
        body = await dynamo.send(
          new ScanCommand({ TableName: tableName })
        );
        body = body.Items;
        break;
      case "PUT /posts":
        await dynamo.send(
          new PutCommand({
            TableName: tableName,
            Item: {
              id: event.body.id,
              name: event.body.name,
              description: event.body.description,
              content: event.body.content,
              mediaIds: event.body.mediaIds,
              editorIds: event.body.ownerId
            },
          })
        );
        body = `PUT item ${event.body.id}`;
        break;
      case "POST /posts":
        await dynamo.send(
          new PutCommand({
            TableName: tableName,
            Item: {
              id: uuidv4(),
              name: event.body.name,
              description: event.body.description,
              content: event.body.content,
              ownerId: event.body.ownerId,
              mediaIds: event.body.mediaIds,
              editorIds: event.body.ownerId
            },
          })
        );
        body = `POST item ${event.body.id}`;
        break;
      default:
        throw new Error(`Unsupported route: "${event.routeKey}"`);
    }
  } catch (err) {
    statusCode = 400;
    body = err.message;
  } finally {
    body = JSON.stringify(body);
  }

  return {
    statusCode,
    body,
    headers,
  };
};