const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Finance Tracker API',
      version: '2.0.0',
      description: 'Production-ready Finance Tracker SaaS API',
    },
    servers: [
      { url: 'http://localhost:5000', description: 'Local' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['src/modules/**/*.routes.js'],
};

const spec = swaggerJsdoc(options);

function registerSwagger(app) {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(spec));
}

module.exports = { registerSwagger };
