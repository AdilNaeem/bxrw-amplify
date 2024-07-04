# Setup Instructions for Amplify
## AWS Credentials setup
You should receive `config` and `credentials` files that look like this:

```
[profile amplify-dev]
region=eu-west-2
```

```
[amplify-dev]
aws_access_key_id=...
aws_secret_access_key=...
```

Place these in a folder called `.aws` in your home directory.

## Setup Node.js and npm
Install 
* Node.js v14.x or later
* npm v6.14.4 or later

See [Downloading and installing node.js and npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)

## Install amplify CLI
`npm install -g @aws-amplify/cli`
