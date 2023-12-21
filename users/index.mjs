import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  ScanCommand,
  PutCommand,
  GetCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";
import bcrypt from "bcrypt";

const client = new DynamoDBClient({});

const dynamo = DynamoDBDocumentClient.from(client);

export const hashPassword = async (password) => {
  const hiddenSecretSalt = "ranDom1SecRet2SalT3";

  const hash = await bcrypt.hash(password, hiddenSecretSalt);
  return hash;
};

export const handler = async (event, context) => {

  const userTableName = "Users";
  let body;
  let statusCode = 200;
  const headers = {
    "Content-Type": "application/json",
  };

  try {
    switch (true) {
      case event.httpMethod === "DELETE" && event.pathParameters.name !== null:
        await dynamo.send(
          new DeleteCommand({
            TableName: userTableName,
            Key: {
              name: event.pathParameters.name,
            },
          })
        );
        body = `Deleted user ${event.pathParameters.name}`;
        break;
      case event.httpMethod === "GET" && event.pathParameters.name !== null:
        body = await dynamo.send(
          new GetCommand({
            TableName: userTableName,
            Key: {
              name: event.pathParameters.name,
            },
          })
        );

        if (!body.Item) {
          statusCode = 404;
          body = `User ${event.pathParameters.name} not found`;
        } else {
          body = {
            ...body.Item,
            password: "********",
          };
        }

        break;
      case event.httpMethod === "GET" && event.path === "/users":
        const { Users } = await dynamo.send(new ScanCommand({ TableName: userTableName }));
        body = Users;
        break;
      case event.httpMethod === "PUT" && event.pathParameters.name !== null:
        const updateBody = JSON.parse(event.body);
        await dynamo.send(
          new PutCommand({
            TableName: userTableName,
            Item: {
              name: event.pathParameters.name,  // Change to userId
              ...updateBody,  // Assuming the body contains user fields or rejected by validation
            },
          })
        );

        body = `Put user password with name ${event.pathParameters.name}`;
        break;
      case event.httpMethod === "POST" && event.path === "/users":
        const userBody = JSON.parse(event.body);
        await dynamo.send(
          new PutCommand({
            TableName: userTableName,
            Item: {
              ...userBody,  // Assuming the body contains user fields
            },
          })
        );
        body = `POST user`;
        break;
      default:
        throw new Error(`Unsupported route`);
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