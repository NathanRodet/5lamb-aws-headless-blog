import { PutObjectCommand, S3Client, ListObjectsV2Command, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
} from "@aws-sdk/lib-dynamodb";


// S3 Bucket
const BucketClient = new S3Client({});
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
  let isTruncated = true;
  let statusCode = 200;
  const headers = {
    "Content-Type": "application/json",
  };

  try {
    switch (event.routeKey) {
      case "DELETE /medias/{postId}/{filename}":
        await BucketClient.send(
          new DeleteObjectCommand({
            Bucket: bucketName,
            Key: `${event.pathParameters.postId}/${event.pathParameters.filename}`,
          })
        );

        post = await dynamo.send(
          new GetCommand({
            TableName: tableName,
            Key: {
              id: event.pathParameters.postId,
            },
          })
        );

        await dynamo.send(
          new PutCommand({
            TableName: tableName,
            Item: {
              id: post.id,
              mediaIds: post.mediaIds.filter(item => item !== event.pathParameters.filename),
            },
          })
        );

        body = `DELETE media ${event.pathParameters.postId}/${event.pathParameters.filename}`;
        break;
      case "GET /medias/{postId}":
        while (isTruncated) {
          const { Contents, IsTruncated, NextContinuationToken } = await BucketClient.send(
            new ListObjectsV2Command({
              Bucket: `${bucketName}/${event.pathParameters.postId}`,
              MaxKeys: 20,
            }));

          const contentsList = Contents.map((c) => ` • ${c.Key}`).join("\n");
          body += contentsList + "\n";
          isTruncated = IsTruncated;
          command.input.ContinuationToken = NextContinuationToken;
        }
        break;
      case "GET /medias/{postId}/{filename}":
        body = await BucketClient.send(
          new GetObjectCommand({
            Bucket: bucketName,
            Key: `${event.pathParameters.postId}/${event.pathParameters.filename}`,
          })
        );
        break;
      case "POST /medias/{postId}":
        parsedFile = JSON.parse(event.body.file);

        await BucketClient.send(
          new PutObjectCommand({
            Bucket: bucketName,
            Key: `${event.pathParameters.postId}/${parsedFile.filename}`,
            Body: parsedFile.file,
          })
        );

        post = await dynamo.send(
          new GetCommand({
            TableName: tableName,
            Key: {
              id: event.pathParameters.postId,
            },
          })
        );

        await dynamo.send(
          new PutCommand({
            TableName: tableName,
            Item: {
              id: post.id,
              mediaIds: post.mediaIds.push(parsedBody.filename),
            },
          })
        );
        body = `POST media ${event.pathParameters.postId}/${event.pathParameters.filename}`;
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