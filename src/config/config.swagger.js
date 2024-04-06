module.exports = options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Library APIs",
      version: "1.0.0",
      description: "Clothing store library APIs",
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT}`,
      },
    ],
    components: {
      responses: {},
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        BearerAuth: [],
      },
    ],
  },
  apis: ["./src/routes/**/*.js"],
};
