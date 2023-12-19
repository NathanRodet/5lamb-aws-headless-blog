# supinfo-5lamb

An headless blog built over AWS serverless services.

## Core features

- CRUD endpoints for users management.
- Login / Register endpoints for authentification and RBAC for authorization.
- CRD endpoints for file management.
- CRUD endpoints for blog post management.
- API Gateway.

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