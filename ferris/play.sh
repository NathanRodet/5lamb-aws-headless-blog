#!/bin/bash

# A request to the lambda function without exposing it to the internet
cargo lambda invoke --remote --data-ascii '{ "command": "hi" }' --output-format json ferris
