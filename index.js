'use strict';

var docsPath = __dirname + '/docs';

const fs = require('fs');
const express = require('express');
const app = express();
const { exec } = require("child_process");

const expressJSDocSwagger = require('express-jsdoc-swagger');

var args = process.argv.slice(2);

var PATH_TO_JSON = docsPath + '/openapi.json';

if (args.length === 0) {
  throw new Error("No service name provided in cli parameter")
}
var serviceName = args[0]
var description = args[1] || "No description"

const options = {
  info: {
    version: '1.0.0',
    title: serviceName || 'Local Test (No service name provided)',
    description: description
  },
  baseDir: __dirname,  // Base directory which we use to locate your JSDOC files
  filesPattern: ['./index.js'],  // Glob pattern to find your jsdoc files (multiple patterns can be added in an array)
  swaggerUIPath: '/docs',  // URL where SwaggerUI will be rendered
  exposeSwaggerUI: true,   // Expose OpenAPI UI
  exposeApiDocs: false,   // Expose Open API JSON Docs documentation in `apiDocsPath` path.
  servers: [
    {
      "url": "https://"+serviceName+".lambda.randi.adswizz.com/dev",
      "description": "Development server"
    },
    {
      "url": "https://"+serviceName+".lambda.randi.adswizz.com/prod",
      "description": "Production server"
    }
  ]
};

const listener = expressJSDocSwagger(app)(options);

listener.on('finish', swaggerObject => {

  if (!fs.existsSync(docsPath)){
    fs.mkdirSync(docsPath);
  }

  fs.writeFile(PATH_TO_JSON, JSON.stringify(swaggerObject, null, 2), async (err) => {
    if (err) throw err;
    
    console.log('The file has been saved!');
    var cmdGenDoc = "node "+__dirname+"/node_modules/swagger-to-static/index.js "+PATH_TO_JSON+" "+docsPath;

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

