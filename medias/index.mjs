import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  ScanCommand,
  PutCommand,
  GetCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";


// S3 Bucket
const S3_client = new S3Client({});
const bucketName = "media-bucket-5lamb";

// DynamoDB
const db_client = new DynamoDBClient({});
const dynamo = DynamoDBDocumentClient.from(db_client);
const tableName = "Posts";

// export const parsoToBase64 = async (file) => {
//   const parsedBody = JSON.parse(file.body);
//   const base64File = parsedBody.file;
//   const decodedFile = Buffer.from(base64File.replace(/^data:image\/\w+;base64,/, ""), "base64");

//   return decodedFile;
// };

export const handler = async (event, context) => {

  let body;
  let parsedFile;
  let post;
  let statusCode = 200;
  const headers = {
    "Content-Type": "application/json",
  };

  try {
    switch (event.routeKey) {
      case "DELETE /medias/{id}":
        await dynamo.send(
          new DeleteCommand({
            TableName: tableName,
            Key: {
              id: event.pathParameters.id,
            },
          })
        );
        body = `DELETE media ${event.pathParameters.id}`;
        break;
      case "GET /medias/{id}":
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
      case "GET /medias":
        body = await dynamo.send(
          new ScanCommand({ TableName: tableName })
        );
        body = body.Items;
        break;
      case "POST /medias":
        parsedFile = JSON.parse(event.body.file);
        // let base64File = await parsoToBase64(event.file);

        await S3_client.send(
          new PutObjectCommand({
            Bucket: bucketName,
            Key: event.postId + "/" + parsedFile.filename,
            Body: parsedFile.file,
          }));

        post = await dynamo.send(
          new GetCommand({
            TableName: tableName,
            Key: {
              id: event.body.postId,
            },
          })
        );

        await dynamo.send(
          new PutCommand({
            TableName: tableName,
            Item: {
              id: post.id,
              fileIds: post.fileIds.push(parsedBody.filename),
            },
          })
        );
        body = `POST media ${event.body.id}`;
        break;
      default:
        throw new Error(`Unsupported route or HTTP method: "${event.routeKey}"`);
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