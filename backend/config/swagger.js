const swaggerJsdoc = require("swagger-jsdoc");

const PORT = process.env.PORT || 3001;

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Todo API",
      version: "1.0.0",
      description: "A simple Todo API with Swagger docs",
    },
    servers: [{ url: `http://localhost:${PORT}` }],
  },
  apis: ["./server.js"], // Path to your API docs
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

module.exports = swaggerSpec;
