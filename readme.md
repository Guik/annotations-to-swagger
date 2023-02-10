# annotations-to-swagger
Scan js files in the current directory, look for annotations based on the JSDoc format (https://brikev.github.io/express-jsdoc-swagger-docs)
- generate an openapi.json file
- generate a swagger documentation UI (based on openapi.json using swagger-to-static)

Ideal for integrating with serverless scriptable hooks to generate documentation on the fly.

# Usage

## Install

`npm install annotations-to-swagger --save-dev`

or

`yarn add annotations-to-swagger --dev`

## Use

The generated openapi.json file & swagger will be located in the docs folder

- @param {string} serviceName - The name of the service
- @param {string} description - The description of the service
- @param {string} servers - The servers of the service (comma separated)
- @param {string} destinationPath - The path where documentation files will be generated (optional, default: ./docs)


Usage: ```node ./node_modules/annotations-to-swagger/index.js <serviceName> <description> <servers> <destinationPath> <folderToScan>```

Example: ```node ./node_modules/annotations-to-swagger/index.js myServiceName "This is a description of my service" "https://example.com/dev,https://example.com/prod" ./docs ./src/*.js```

serverless usage: 
``` 
environment:
    DOC_DESCRIPTION: "myServiceName"
    DOC_SERVERS: "https://example.com/dev,https://example.com/prod"
custom:
    scriptable:
        hooks:
            before:package:initialize: node ./node_modules/annotations-to-swagger/index.js ${self:service} "${self:provider.environment.DOC_DESCRIPTION}" "${self:provider.environment.DOC_SERVERS}"
```