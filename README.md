# supinfo-5lamb

An headless blog built over AWS serverless services.

## Core features

- CRUD endpoints for users management.
- Login / Register endpoints for authentification and RBAC for authorization.
- CRD endpoints for file management.
- CRUD endpoints for blog post management.
- API Gateway.

## Connect to AWS CLI

```bash
# Configure AWS CLI with Access Key ID and Secret Access Key (we used eu-west-3 region as default)
aws configure
```

## Create Users, Posts DynamoDB tables and S3 Bucket for media storage

```bash
# Create Posts table
aws dynamodb create-table --table-name Posts --attribute-definitions AttributeName=id,AttributeType=S --key-schema AttributeName=id,KeyType=HASH --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5
```

```bash
# Create Users table
aws dynamodb create-table --table-name Users --attribute-definitions AttributeName=id,AttributeType=S --key-schema AttributeName=id,KeyType=HASH --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5
```

```bash
# Create Users table
aws s3api create-bucket --bucket media-bucket-5lamb --region eu-west-3 --create-bucket-configuration LocationConstraint=eu-west-3
```

## Posts Lambda

```bash
# Zip Posts lambda sources
zip -r lambdaPosts.zip .

# Deploy Posts lambda
aws lambda create-function --function-name posts-5lamb \
--runtime nodejs20.x --handler index.handler \
--role arn:aws:iam::878901825461:role/5lamb \
--zip-file fileb://lambdaPosts.zip

# Update lambda code
aws lambda update-function-code --function-name posts-5lamb \
--region eu-west-3 \
--zip-file fileb://lambdaPosts.zip
```

```bash
# Deploy API Gateway
aws apigateway create-rest-api --name 'api-gateway-5lamb --description 'REST API for headless blog' --region eu-west-3 --endpoint-configuration '{ "types": ["REGIONAL"] }'
```

## Medias Lambda

```bash
# Zip Medias lambda sources
zip -r lambdaMedias.zip .

# Deploy Medias lambda
aws lambda create-function --function-name medias-5lamb \
--runtime nodejs20.x --handler index.handler \
--role arn:aws:iam::878901825461:role/5lamb \
--zip-file fileb://lambdaMedias.zip

# Update lambda code
aws lambda update-function-code --function-name medias-5lamb \
--region eu-west-3 \
--zip-file fileb://lambdaMedias.zip
```

## How to use the repository : ferris example

Be sure to replace AWS ID and lambda role in script !

```bash
# Configurate AWS CLI with Access Key ID and Secret Access Key (we used eu-west-3 region as default)
aws configure

# Install rust : https://www.rust-lang.org/tools/install
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Install cargo-lambda : https://docs.aws.amazon.com/lambda/latest/dg/rust-package.html
pip3 install cargo-lambda

# Go to an app, here : ferris
cd ./ferris

# Deploy the lambda
./deploy.sh

# Play the lambda
./play.sh
```
