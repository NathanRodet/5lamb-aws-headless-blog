import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  ScanCommand,
  PutCommand,
  GetCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from 'uuid';
import bcrypt from "bcrypt";

const client = new DynamoDBClient({});

const dynamo = DynamoDBDocumentClient.from(client);

const userTableName = "Users";

const hiddenSecretSalt = "ranDom1SecRet2SalT3";

export const hashPassword = async (password) => {
  const hash = await bcrypt.hash(password, hiddenSecretSalt);
  return hash;
};

export const handler = async (event, context) => {
  let body;
  let statusCode = 200;
  const headers = {
    "Content-Type": "application/json",
  };

  try {
    switch (event.routeKey) {
      case "DELETE /users/{id}":
        await dynamo.send(
          new DeleteCommand({
            TableName: userTableName,
            Key: {
              id: event.pathParameters.id,
            },
          })
        );
        body = `Deleted user ${event.pathParameters.id}`;
        break;
      case "GET /users/{id}":
        body = await dynamo.send(
          new GetCommand({
            TableName: userTableName,
            Key: {
              id: event.pathParameters.id,
            },
          })
        );
        body = {
          ...body.Item,
          password: "********",
        };
        break;
      case "GET /users":
        body = await dynamo.send(
          new ScanCommand({ TableName: userTableName })
        );
        body = {
          ...body,
          Items: body.Items.map((item) => ({
            ...item,
            password: "********",
          })),
        };
        break;
      case "PUT /users/{id}":
        await dynamo.send(
          new PutCommand({
            TableName: userTableName,
            Item: {
              id: event.body.id,
              password: hashPassword(event.body.password),
            },
          })
        );
        body = `Put user ${event.body.id} with username ${event.body.username}`;
        break;
      case "POST /users":
        await dynamo.send(
          new PutCommand({
            TableName: userTableName,
            Item: {
              id: uuidv4(),
              username: event.body.username,
              password: hashPassword(event.body.password),
            },
          })
        );
        body = `POST user ${event.body.id} with username ${event.body.username}`;
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