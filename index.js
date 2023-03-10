'use strict';

  /* 
  * Scan js files in the current directory and generate an openapi.json file
  * Then generate the swagger documentation using swagger-to-static
  * 
  * The plugin try to find the root application path by looking for the node_modules folder
  * 
  * @param {string} serviceName - The name of the service
  * @param {string} description - The description of the service
  * @param {string} servers - The servers of the service (comma separated)
  * @param {string} destinationPath - The path where documentation files will be generated (default: ./docs)
  * @param {string} pathToScan - The path to scan for js files (default: ./*.js)
  * 
  * Usage: node index.js <serviceName> <description> <servers>
  * 
  * Example: node index.js myService "This is a description of my service" "https://example.com/dev,https://example.com/prod"
  * 
  * The generated openapi.json file & swagger will be located in the docs folder
  * 
  */

const fs = require('fs');
const path = require('path');

const express = require('express');
const app = express();
const { exec } = require("child_process");
const expressJSDocSwagger = require('express-jsdoc-swagger');

var args = process.argv.slice(2);

if (args.length === 0) {
  throw new Error("No service name provided in cli parameter")
}

var applicationPath = findRootApplicationPath();
var serviceName = args[0]
var description = args[1] || "No description"
var servers = args[2] || "https://example.com/dev"
var destinationPath = applicationPath+(args[3] || "/docs")
var pathToScan = applicationPath+(args[4] || "/*.js")

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
  baseDir: applicationPath,  // Base directory which we use to locate your JSDOC files
  filesPattern: [pathToScan],  // Glob pattern to find your jsdoc files (multiple patterns can be added in an array)
  swaggerUIPath: destinationPath,  // URL where SwaggerUI will be rendered
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
    
    console.log('The openapi file has been saved to '+destinationPath);
    var cmdGenDoc = "node "+__dirname+"/node_modules/swagger-to-static/index.js "+PATH_TO_JSON+" "+destinationPath;
    await runCmd(cmdGenDoc);
    console.log("Swagger html documentation generated in "+destinationPath)
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

// Find the root application path, a bit hacky but works
function findRootApplicationPath() {
  const fullPath = path.dirname(require.main.filename);
  var regexResp = /^(.*?)node_modules/.exec(fullPath);
  return regexResp ? regexResp[1] : fullPath;
}
