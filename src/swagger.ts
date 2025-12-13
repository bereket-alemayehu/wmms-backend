import swaggerJSDoc from "swagger-jsdoc";
import path from "path";
const BASE_URL = process.env.BASE_URL ;

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "WMMS API",
      version: "1.0.0",
      description: "Waste Management Management System API documentation",
    },
    servers: [
      {
        url: BASE_URL,
        description: "Local server",
      },
    ],
  },
  apis: [
    path.resolve(__dirname, "./routes/*.ts"),
    path.resolve(__dirname, "./routes/swagger/*.ts"), // <-- Add this line
  ],
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;