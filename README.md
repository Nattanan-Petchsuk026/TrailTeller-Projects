# Trail Teller

This project appears to be a web application built with TypeScript and Node.js, set up to run using Docker. This guide will walk you through setting up your local development environment.

## Prerequisites

Before you begin, ensure you have the following tools installed on your system:
* **Git**
* **[Docker](https://docs.docker.com/get-docker/)**
* **[Docker Compose](https://docs.docker.com/compose/install/)**
* **[Node.js](https://nodejs.org/)** (for local development or if you choose not to use Docker)

---

## How to Start Coding (Docker Method)

This is the recommended method as the project is already configured with Docker.

### 1\. Clone the Repository

First, clone the project to your local machine and navigate into the directory:

```sh
git clone [https://github.com/Kittikanning/TrailTeller.git](https://github.com/Nattanan-Petchsuk026/TrailTeller-Projects/tree/main)
cd trail-teller
```

### 2\. Set Up Environment Variables

The backend service likely requires environment variables (like database credentials or API keys) to run.

1.  Navigate to the backend folder:
    ```sh
    cd backend
    ```
2.  Create a `.env` file. You may find a `.env.example` file to copy from. If not, create an empty one.
    ```sh
    # If .env.example exists:
    cp .env.example .env

    # If not, create an empty one:
    touch .env
    ```
3.  **Edit the `.env` file** with your code editor. You will need to add the necessary configuration. Look inside the `docker-compose.yaml` file and the `backend` source code (e.g., `backend/src/config.ts` or `index.ts`) to see which variables are required (e.g., `DATABASE_URL`, `POSTGRES_USER`, `POSTGRES_PASSWORD`).

### 3\. Build and Run with Docker Compose

The `docker-compose.yaml` file at the root of the project contains all the instructions to build and run the application and its services (like a database).

1.  Return to the root of the project:
    ```sh
    cd ..
    ```
2.  Build and start all services in detached mode:
    ```sh
    docker-compose up --build -d
    ```
      * `--build`: This forces Docker to build the images from the `Dockerfile` (e.g., for the `backend`).
      * `-d`: This runs the containers in the background.

Your application should now be running. You can check the `docker-compose.yaml` file for the `ports` definition to see which port the application is available on (e.g., `http://localhost:8000`).

### 4\. Start Coding

You can now open the `backend` folder in your code editor. The Docker setup likely uses a **volume** to mount your local `backend` directory into the container.

This means you can edit the `.ts` files on your machine, and the service running inside the container (likely using `nodemon` or `ts-node-dev`) will automatically detect the changes and restart, allowing you to see your changes live.

To see logs from the running services:

```sh
docker-compose logs -f
```

To stop the services:

```sh
docker-compose down
```

-----

## (Alternative) Running the Backend Locally

If you prefer not to use Docker, you can try to run the backend service directly on your machine.

1.  **Install Dependencies:**

    ```sh
    cd backend
    npm install
    ```

2.  **Run the Database:**
    You must still provide a database. The easiest way is to run *just* the database from the `docker-compose.yaml` file:

    ```sh
    # From the project root
    docker-compose up -d db 
    ```

    *(Note: This assumes the database service is named `db` in the `docker-compose.yaml` file).*

3.  **Configure `.env`:**
    Make sure your `backend/.env` file points to the database (e.g., `DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/DATABASE_NAME`).

4.  **Run the Project:**
    Check the `scripts` section of `backend/package.json` for the command to start the development server.

    ```sh
    # It is likely one of these:
    npm run dev
    # or
    npm start
    ```

After cloning, in the backend folder, delete these duplicate/generated folders to avoid conflicts:
  ```
backend/activity/
backend/booking/
backend/hotel/
backend/payment/
backend/recommendation/
 ```



This [Docker Compose for Beginners](https://www.youtube.com/watch?v=KQUiICpM_u0) video may be helpful as it explains how to use `docker-compose.yml` files to run services, which is central to this project's setup.





