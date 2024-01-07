import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand
} from "@aws-sdk/lib-dynamodb";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const client = new DynamoDBClient({
  marshallOptions: {
    removeUndefinedValues: false
  }
});

const dynamo = DynamoDBDocumentClient.from(client);

export const hashPassword = async (password) => {
  const hiddenSecretSalt = "ranDom1SecRet2SalT3";

  const hash = await bcrypt.hash(password, hiddenSecretSalt);
  return hash;
};

export const handler = async (event, context) => {
  const tableName = "Users";
  const signature_key = "secret1Signature2Key3";
  let body;
  let statusCode = 200;
  const headers = {
    "Content-Type": "application/json",
  };

  try {
    switch (true) {
      case event.httpMethod === "POST" && event.path === "/login":
        const parsedBody = JSON.parse(event.body);
        body = await dynamo.send(
          new GetCommand({
            TableName: tableName,
            Key: {
              name: parsedBody.name,
            },
          })
        );

        if (body.Item.password === parsedBody.password && body.Item.name === parsedBody.name) {
          const token = jwt.sign(
            {
              name: parsedBody.name,
              role: body.Item.role,
            },
            signature_key
          );
          body = {
            token,
          };
        } else {
          statusCode = 401;
          body = "Bad credentials";
        }
        break;
      case "XXXXXXXXXXXXXX":
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