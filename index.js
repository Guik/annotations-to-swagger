'use strict';

  /* Scan js files in the current directory and generate an openapi.json file
  * Then generate the swagger documentation using swagger-to-static

  * @param {string} destinationPath - The path where documentation files will be generated
  * @param {string} serviceName - The name of the service
  * @param {string} description - The description of the service
  * @param {string} servers - The servers of the service (comma separated)
  * 
  * Usage: node index.js <serviceName> <description> <servers>
  * 
  * Example: node index.js myService "This is a description of my service" "https://example.com/dev,https://example.com/prod"
  * 
  * The generated openapi.json file & swagger will be located in the docs folder
  * 
  */

const fs = require('fs');
const express = require('express');
const app = express();
const { exec } = require("child_process");
const expressJSDocSwagger = require('express-jsdoc-swagger');

var args = process.argv.slice(2);

if (args.length === 0) {
  throw new Error("No service name provided in cli parameter")
}
var destinationPath = args[0]
var serviceName = args[1]
var description = args[2] || "No description"
var servers = args[3] || "https://example.com/dev"

var PATH_TO_JSON = destinationPath + '/openapi.json';

servers = servers.split(',').map(function (item) {
  return {
    url: item
  }
})

const options = {
  info: {
    version: '1.0.0',
    title: serviceName || 'Local Test (No service name provided)',
    description: description
  },
  baseDir: __dirname,  // Base directory which we use to locate your JSDOC files
  filesPattern: ['./*.js'],  // Glob pattern to find your jsdoc files (multiple patterns can be added in an array)
  swaggerUIPath: '/docs',  // URL where SwaggerUI will be rendered
  exposeSwaggerUI: true,   // Expose OpenAPI UI
  exposeApiDocs: false,   // Expose Open API JSON Docs documentation in `apiDocsPath` path.
  servers: servers
};

const listener = expressJSDocSwagger(app)(options);

listener.on('finish', swaggerObject => {

  if (!fs.existsSync(destinationPath)){
    fs.mkdirSync(destinationPath);
  }

  fs.writeFile(PATH_TO_JSON, JSON.stringify(swaggerObject, null, 2), async (err) => {
    if (err) throw err;
    
    console.log('The file has been saved to '+destinationPath);
    var cmdGenDoc = "node "+__dirname+"/node_modules/swagger-to-static/index.js "+PATH_TO_JSON+" "+destinationPath;

    await runCmd(cmdGenDoc);
  });
}).on('error', err => {
  console.error(err);
})

async function runCmd(cmd) {
  return new Promise((resolve) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.warn(`error: ${error.message}`);
      }
      if (stderr)
        console.log(`stderr: ${stderr}`);

      resolve(stdout ? stdout : stderr);
    });
  });
}

