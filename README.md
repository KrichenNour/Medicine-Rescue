# MedSurplus Connect

An application for connecting medical surplus.

## Getting Started

To run the project locally, follow these steps:

1.  **Install dependencies:**

    ```bash
    npm install
    ```

2.  **Run the development server:**

    ```bash
    npm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.


To run the BACKEND locally, follow these steps:

1.  **Install Dependencies**
   Make sure Node.js and npm are installed. Then, in the project folder:
   npm install
2.  **Set Up PostgreSQL**
   *Make sure PostgreSQL is installed and running.
   *Open a terminal and log in as the PostgreSQL user:
    psql -U postgres

    *Create the database:
    CREATE DATABASE myapp;

   *Run migrations to create the tables:
   \i path/to/backend/migrations/create_user_table.sql
   \i path/to/backend/migrations/create_requests_table.sql
   \i path/to/backend/migrations/create_medicine_table.sql
   ⚠️⚠️ Adjust the paths to match your repo structure.

3.  **Configure Environment Variables**
IN .env file in the backend :

PG_USER=postgres
PG_PASSWORD=*****   # Replace with your PostgreSQL password
PG_HOST=localhost
PG_PORT=5432
PG_DATABASE=myapp
JWT_SECRET=VotreSecretPourJWT

4.  **Run the Backend**
node server.js


