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
aws dynamodb create-table --table-name Posts --attribute-definitions AttributeName=uuid,AttributeType=S --key-schema AttributeName=uuid,KeyType=HASH --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 
```

```bash
# Create Users table
aws dynamodb create-table --table-name Users --attribute-definitions AttributeName=username,AttributeType=S --key-schema AttributeName=username,KeyType=HASH --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 
```

```bash
# Create Users table
aws s3api create-bucket --bucket media-bucket-5lamb --region eu-west-3 --create-bucket-configuration LocationConstraint=eu-west-3
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

