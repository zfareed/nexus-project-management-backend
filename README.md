# Nexus Project Management Backend

This is the backend for the Nexus Project Management application, built with [NestJS](https://nestjs.com/) and [Prisma](https://www.prisma.io/).

## Prerequisites

Before running this project, ensure you have the following installed:

*   **Node.js** (v18 or higher recommended)
*   **npm** (comes with Node.js)
*   **PostgreSQL** (running locally or via Docker)

## Installation

1.  **Clone the repository**

    ```bash
    git clone https://github.com/zfareed/nexus-project-management-backend
    cd nexus-project-management-backend
    ```

2.  **Install dependencies**

    ```bash
    npm install
    ```

## Configuration

1.  **Environment Variables**

    Create a `.env` file in the root directory by copying the example file:

    ```bash
    cp .env.example .env
    ```

2.  **Update `.env`**

    Open the `.env` file and update the `DATABASE_URL` with your PostgreSQL credentials. The default example assumes:
    *   User: `postgres`
    *   Password: `your_password_here`
    *   Database: `nexus-app`
    *   Host: `localhost`
    *   Port: `5432`

    Example `DATABASE_URL`:
    ```
    postgresql://postgres:password@localhost:5432/nexus-app
    ```

## Database Setup

1.  **Create the Database**

    Ensure your PostgreSQL server is running and create a database named `nexus-app` (or whatever you specified in `DATABASE_URL`).

2.  **Run Migrations**

    Push the Prisma schema to your database to create the necessary tables:

    ```bash
    npm run prisma:migrate
    ```

3.  **Seed the Database (Optional)**

    Populate the database with initial test data:

    ```bash
    npm run prisma:seed
    ```

## Running the Application

1.  **Development Mode**

    To start the application in development mode with hot-reloading:

    ```bash
    npm run start:dev
    ```

    The server will start on `http://localhost:3000` (or the port defined in `.env`).

2.  **Production Mode**

    To build and start the application for production:

    ```bash
    npm run build
    npm run start:prod
    ```

## Testing

Run the test suite using Jest:

```bash
# Unit tests
npm run test

# e2e tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## API Documentation

This project uses Swagger for API documentation.

*   **Swagger UI**: Visit `http://localhost:3000/api/docs` after starting the server to view the interactive API documentation.
*   **OpenAPI Spec**: The `swagger.yaml` file in the root directory contains the OpenAPI specification.