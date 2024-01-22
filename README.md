# Headless Blog - AWS Serverless Architecture

An headless blog built over AWS serverless services.

## Core features

- CRUD endpoints for users management.
- Authentification with Cognito.
- CRD endpoints for file management.
- CRUD endpoints for blog post management.
- API Gateway.

## Connect to AWS CLI

```bash
# Configure AWS CLI with Access Key ID and Secret Access Key (we used eu-west-3 region as default)
aws configure
```

## Create Users, Posts DynamoDB tables and S3 Bucket for media storage

### Posts Table

```bash
# Create Posts table
aws dynamodb create-table --table-name Posts --attribute-definitions AttributeName=id,AttributeType=S --key-schema AttributeName=id,KeyType=HASH --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5
```

### Users Table

```bash
# Create Users table
aws dynamodb create-table --table-name Users --attribute-definitions AttributeName=name,AttributeType=S --key-schema AttributeName=name,KeyType=HASH --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5
```

### media-bucket-5lamb - S3 Bucket

```bash
# Create S3 Bucket
aws s3api create-bucket --bucket media-bucket-5lamb --region eu-west-3 --create-bucket-configuration LocationConstraint=eu-west-3
```

## Lambdas

### posts-5lamb - Posts CRUD

```bash
# Install dependancies
npm clean-install

# Zip Posts lambda sources
zip -r lambdaPosts.zip .

# Deploy Posts lambda
aws lambda create-function --function-name posts-5lamb \
--runtime nodejs20.x --handler index.handler \
--role arn:aws:iam::878901825461:role/5lamb \
--zip-file fileb://lambdaPosts.zip

# Update lambda code
aws lambda update-function-code --function-name posts-5lamb --region eu-west-3 --zip-file fileb://lambdaPosts.zip
```

### medias-5lamb - Medias CRD

```bash
# Install dependancies
npm clean-install

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

### users-5lamb - Users CRUD

```bash
# Install dependancies
npm clean-install

# Zip Users lambda sources
zip -r lambdaUsers.zip .

# Deploy Users lambda
aws lambda create-function --function-name users-5lamb \
--runtime nodejs20.x --handler index.handler \
--role arn:aws:iam::878901825461:role/5lamb \
--zip-file fileb://lambdaUsers.zip

# Update lambda code
aws lambda update-function-code --function-name users-5lamb --region eu-west-3 --zip-file fileb://lambdaUsers.zip
```

### auth-5lamb - Authorization

```bash
# Install dependancies
npm clean-install

# Zip Users lambda sources
zip -r lambdaAuth.zip .

# Deploy Users lambda
aws lambda create-function --function-name auth-5lamb --runtime nodejs20.x --handler index.handler --role arn:aws:iam::878901825461:role/5lamb --zip-file fileb://lambdaAuth.zip

# Update lambda code
aws lambda update-function-code --function-name auth-5lamb --region eu-west-3 --zip-file fileb://lambdaAuth.zip
```

### login-5lamb - Login

```bash
# Install dependancies
npm clean-install

# Zip Users lambda sources
zip -r lambdaLogin.zip .

# Deploy Users lambda
aws lambda create-function --function-name login-5lamb --runtime nodejs20.x --handler index.handler --role arn:aws:iam::878901825461:role/5lamb --zip-file fileb://lambdaLogin.zip

# Update lambda code
aws lambda update-function-code --function-name login-5lamb --region eu-west-3 --zip-file fileb://lambdaLogin.zip
```

## api-gate-5lamb - API Gateway

```bash
# Create the REST API Gateway
aws apigateway create-rest-api --name 'api-gateway-5lamb' --region eu-west-3 --endpoint-configuration  '{ "types": ["REGIONAL"] }'

# Fetch the API Gateway ID
aws apigateway get-rest-apis | jq -r '.items[] | select(.name == "api-gateway-5lamb") | .id'

# Create route endpoints in API Gateway
aws apigateway create-resource --api-id $(aws apigateway get-rest-apis | jq -r '.items[] | select(.name == "api-gateway-5lamb") | .id') --authorization-type 'NONE' --target arn:aws:lambda:eu-west-3:878901825461:function:posts-5lamb
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
