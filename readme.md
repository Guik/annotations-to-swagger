# annotations-to-swagger
Scan js files in the current directory, look for annotations based on the JSDoc format (https://brikev.github.io/express-jsdoc-swagger-docs)
- generate an openapi.json file
- generate a swagger documentation UI (based on openapi.json using swagger-to-static)

Ideal for integrating with serverless scriptable hooks to generate documentation on the fly.

# Usage

## Install

`npm install annotations-to-swagger --save --include=dev`

or

`yarn add annotations-to-swagger --dev`

## Use

The generated openapi.json file & swagger will be located in the docs folder

- @param {string} destinationPath - The path where documentation files will be generated
- @param {string} serviceName - The name of the service
- @param {string} description - The description of the service
- @param {string} servers - The servers of the service (comma separated)

Usage: ```node index.js <destinationPath> <serviceName> <description> <servers>```

Example: ```node ./node_modules/annotations-to-swagger/index.js ./docs myService "This is a description of my service" "https://example.com/dev,https://example.com/prod"```

serverless usage: 
``` 
custom:
    scriptable:
        hooks:
            before:package:initialize: node ./node_modules/annotations-to-swagger/index.js ./docs ${self:service} "${self:provider.environment.DOC_DESCRIPTION}" "${self:provider.environment.DOC_SERVERS}"
```