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
    switch (true) {
      case event.httpMethod === "DELETE" && event.pathParameters.id !== null:
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
      case event.httpMethod === "GET" && event.path === "/posts":
        const { Items } = await dynamo.send(new ScanCommand({ TableName: tableName }));
        body = Items;
        break;
      case event.httpMethod === "GET" && event.pathParameters !== null && event.pathParameters.id !== null:
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

      case event.httpMethod === "PUT" && event.pathParameters.id !== null:
        const updateBody = JSON.parse(event.body);
        await dynamo.send(
          new PutCommand({
            TableName: tableName,
            Item: {
              id: event.pathParameters.id,
              name: updateBody.title,
              description: updateBody.description,
              content: updateBody.content,
              ownerId: updateBody.ownerId,
              mediaIds: updateBody.mediaId | null,
              editorIds: updateBody.ownerId
            },
          })
        );
        body = `PUT item `;
        break;
        case event.httpMethod === "POST" && event.path === "/posts":
        const postsBody = JSON.parse(event.body);
        await dynamo.send(
          new PutCommand({
            TableName: tableName,
            Item: {
              id: uuidv4(),
              name: postsBody.title,
              description: postsBody.description,
              content: postsBody.content,
              ownerId: postsBody.ownerId,
              mediaIds: null,
              editorIds: postsBody.ownerId
            },
          })
        );
        body = `POST item`;
        break;
      default:
        throw new Error(`Unsupported route: "${event.path}"`);
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