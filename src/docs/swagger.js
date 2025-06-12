import swaggerJSDoc from 'swagger-jsdoc';

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API Rekbr Service',
            version: '1.0.0',
            description: 'API documentation for Rekbr App',
        },
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                }
            }
        },
        security: [
            {
                bearerAuth: [],
            }
        ],
        servers: [
            {
                url: 'https://kvnpp4pb-3000.asse.devtunnels.ms', // sesuai base URL server
            },
            {
                url: 'http://localhost:3000', // sesuai base URL server
            },
        ],
    },
    apis: ['./src/**/*.js'], // lokasi file dengan anotasi Swagger (pakai JSDoc-style)
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);
export default swaggerSpec;