/* eslint-disable */
/**
 * Setup swagger options.
 *
 * Separated from index.ts and written in ES5 for compatibility with swagger-jsdoc
 * CLI for exporting to JSON
 */
const swaggerJsDoc = require("swagger-jsdoc");

const options = {
  swaggerDefinition: {
    openapi: "3.0.1",
    info: {
      title: "TartanHacks Backend",
      version: "0.0.1",
    },
    basePath: "/",
    components: {
      securitySchemes: {
        apiKeyAuth: {
          type: "apiKey",
          in: "header",
          name: "x-access-token",
        },
      },
    },
  },
  apis: ["**/*.ts"],
};
const swaggerSpecification = swaggerJsDoc(options);

module.exports = swaggerSpecification;
