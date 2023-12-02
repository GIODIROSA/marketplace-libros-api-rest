const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

/**
 *
 * Metadata
 *
 */

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Castros Libros",
      version: "1.0.0",
    },
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: ["./src/index.js"],
};

/**
 *
 * Documentación JSON format
 *
 */

const swaggerSpec = swaggerJSDoc(options);

/**
 *
 * Function setup
 *
 */

const swaggerDocs = (app, port) => {
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.get("/docs.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });

  console.log(`Version 1 docs http://localhost:${port}/docs`);
};

module.exports = {
  swaggerDocs,
};
