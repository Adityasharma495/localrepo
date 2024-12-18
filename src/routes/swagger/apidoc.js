const { createUser, createUserBody } = require('./users');

const apiDocumentation = {
    openapi: "3.1.0",
    info: {
        title: "Cloud Telephony API with Swagger",
        version: "0.0.1",
        description: "Cloud Telephony API application documented with Swagger",
        contact: {
          name: "Noblestack",
          url: "https://noblestack.com"
        }
      },
      servers: [
        {
          url: "http://localhost:3900",
          description: "Local server"
        }
    ],
    tags: [
        {
          name: 'Users',
        },
        {
          name: 'Call Centres',
        },
    ],
    apis: ["./routes/*.js"],
    paths: {
        users: {
            post: createUser
        }
    },
    components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT'
          }
        },
        schemas: {
          createUserBody
        }
    }
}

module.exports = apiDocumentation;