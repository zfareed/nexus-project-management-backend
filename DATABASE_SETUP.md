# Database Setup Guide

## PostgreSQL Connection Setup

This project is configured to connect to a PostgreSQL database named `nexus-app`.

### Prerequisites

1. **Install PostgreSQL** if you haven't already:
   - Download from: https://www.postgresql.org/download/
   - Or use a package manager (e.g., `choco install postgresql` on Windows)

### Setup Steps

#### 1. Create the Database

Open PostgreSQL command line (psql) or use pgAdmin and run:

```sql
CREATE DATABASE "nexus-app";
```

Alternatively, using psql command line:

```bash
psql -U postgres
CREATE DATABASE "nexus-app";
\q
```

#### 2. Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Update the `.env` file with your PostgreSQL credentials:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=your_actual_password
   DB_DATABASE=nexus-app
   ```

   **Important**: Replace `your_actual_password` with your PostgreSQL password.

#### 3. Verify Connection

Start the development server:

```bash
npm run start:dev
```

If the connection is successful, you should see:
- No database connection errors in the console
- The application running on port 3000 (or your configured PORT)

### Database Configuration Details

The database connection is configured in `src/app.module.ts` using:

- **TypeORM**: ORM for database operations
- **ConfigModule**: Environment variable management
- **PostgreSQL Driver**: `pg` package

### Features Enabled

- **Auto-sync**: In development mode, TypeORM will automatically synchronize your entity schemas with the database
- **Entity Auto-loading**: All files matching `*.entity.ts` or `*.entity.js` will be automatically loaded
- **Environment-based Config**: Different settings for development/production

### Troubleshooting

#### Connection Refused
- Ensure PostgreSQL service is running
- Check if the port (default 5432) is correct
- Verify firewall settings

#### Authentication Failed
- Double-check username and password in `.env`
- Ensure the PostgreSQL user has proper permissions

#### Database Does Not Exist
- Create the database using the SQL command above
- Verify the database name matches exactly (case-sensitive)

### Testing the Connection

You can test the database connection by:

1. Creating a simple endpoint that queries the database
2. Checking the application logs for connection success/errors
3. Using a database client (pgAdmin, DBeaver) to verify tables are created

### Next Steps

- Create more entities for your project management features
- Set up migrations for production environments
- Add database seeding for initial data
- Configure connection pooling for better performance
