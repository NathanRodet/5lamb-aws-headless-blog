#!/bin/bash

# We use arm64 because it's supported by Rust and it's a cheaper option on AWS
cargo lambda build --release --arm64

# We use a custom runtime (Amazon Linux 2) to support ARM64 
cargo lambda deploy --iam-role arn:aws:iam::210878325243:role/5lamb --runtime provided.al2 --enable-function-url 