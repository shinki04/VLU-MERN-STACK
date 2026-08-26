# Dockerizing MERN Stack Application

## Introduction
As a MERN Stack application grows, managing the environment for each service individually can become complex. Docker solves this by packaging the application source code and its dependencies into a self-contained **Container**, ensuring consistency across developers' machines and production environments.

This guide walk you through containerizing each service in the MERN Stack project (Server, Client-Admin, Client-Customer) and linking them together using **Docker Compose**.

---

## Prerequisites

Before you begin containerizing the project, ensure that the required tools are installed and running correctly on your system.

### 1. Install Node.js and npm
The MERN Stack project requires Node.js and npm. A step-by-step guide to installing and verifying Node.js and npm versions is detailed in [Lab 1](../labs/lab1.md#nodejs). Please complete the Node.js installation in Lab 1 before proceeding.

### 2. Download and Install Docker Desktop (Docker GUI)
Docker Desktop provides a user-friendly Graphical User Interface (GUI) to visually manage containers, images, networks, and volumes without needing terminal commands.

* **Download the Installer:** Visit the official [Docker Desktop Download](https://www.docker.com/products/docker-desktop/) page and select the installer for your OS (Windows, macOS, or Linux).
* **Installation Process:**
  - **On Windows:** Run the downloaded `.exe` installer. Make sure to check **Use WSL 2 instead of Hyper-V** when prompted for optimal container performance.
  - **Virtualization Note:** Ensure Virtualization is enabled in your system's BIOS/UEFI settings (you can verify this under Task Manager -> Performance tab -> CPU on Windows).
  - **Start Docker:** After installation, launch the Docker Desktop app from your Desktop or Start menu.

::: tip Installation Troubleshooting
If you encounter the **"Docker Virtualization not enabled on your machine"** error during Docker Desktop startup, check out our self-help guide at [Docker Virtualization Troubleshooting](../troubleshooting/docker-virtualization.md).
:::

### 3. Verify Docker is Running
Launch the Docker Desktop application. Once running, open your Terminal and execute:
```bash
docker --version
```
To ensure that the Docker Engine is active and running correctly, spin up a test container:
```bash
docker run hello-world
```
If you see the **"Hello from Docker!"** message, Docker Desktop is configured successfully and you can proceed with the guide.

---

## Network Architecture & Port Mapping Diagram

Below is the diagram showing how Docker containers run isolatedly and map their internal ports to your computer (Host Machine) for browser or Postman access:

```text
            HOST MACHINE (YOUR COMPUTER)
┌──────────────────────────────────────────────┐
│  Browser/Postman                             │
│       │               │              │       │
│  (Port 3000)     (Port 3001)    (Port 3002)  │
│       │               │              │       │
│───────┼───────────────┼──────────────┼───────│
│       ▼               ▼              ▼       │
│  ┌─────────┐     ┌─────────┐    ┌──────────┐ │
│  │ server  │     │  admin  │    │ customer │ │
│  │ (3000)  │     │ (3001)  │    │  (3002)  │ │
│  └─────────┘     └─────────┘    └──────────┘ │
│       ▲               │              │       │
│       └───────────────┴──────────────┘       │
│         Docker Bridge Network (Internal)     │
│                                              │
│                  DOCKER ENGINE               │
└──────────────────────────────────────────────┘
```

---

## Part 1: Setting up Dockerfile for Each Service

For Docker to build the environment for each application, we need to define a **Dockerfile** and **.dockerignore** in each project directory.

### 1. Backend Server (`server/`)

Create `server/Dockerfile`:
```dockerfile
# Use Node.js version 20 image as the base environment
FROM node:20-alpine

# Set default working directory inside the Container
WORKDIR /app

# Copy package.json and package-lock.json to install dependencies
COPY package*.json ./

# Install all required dependencies based on lockfile
RUN npm install

# Copy all remaining source code into the Container
COPY . .

# Expose server port 3000
EXPOSE 3000

# Start server in dev mode
CMD ["npm", "run", "dev"]
```

Create `server/.dockerignore`:
```text
node_modules
.env
```
*(Note: Ignore the local `node_modules` directory so that Docker installs the dependencies inside the Container directly, avoiding OS compatibility issues).*

::: warning Security Alert & Best Practices
**Never** copy the `.env` configuration file into the Docker Image. If you do not include `.env` in `.dockerignore`, sensitive credentials (like database passwords or secret keys) will be permanently baked into the Image. Anyone who pulls your Image from a public registry like Docker Hub would be able to extract these secrets easily.

The standard best practice is to ignore `.env` during build time, and instead inject it dynamically using the `--env-file` parameter in `docker run` or the `env_file` block in Docker Compose.
:::

---

### 2. Client Admin (`client-admin/`)

Create `client-admin/Dockerfile`:
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Define environment port variable for React Admin
ENV PORT=3001
EXPOSE 3001

CMD ["npm", "start"]
```

Create `client-admin/.dockerignore`:
```text
node_modules
build
```

---

### 3. Client Customer (`client-customer/`)

Create `client-customer/Dockerfile`:
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Define environment port variable for React Customer
ENV PORT=3002
EXPOSE 3002

CMD ["npm", "start"]
```

Create `client-customer/.dockerignore`:
```text
node_modules
build
```

---

## Part 2: Build & Run Each Container Manually

### Step 1: Build Docker Images for Services
Navigate to each directory and run the build command:

1. **Build Backend Server Image:**
   ```bash
   cd server
   docker build -t mern-server:1.0 .
   ```
2. **Build Client Admin Image:**
   ```bash
   cd ../client-admin
   docker build -t mern-client-admin:1.0 .
   ```
3. **Build Client Customer Image:**
   ```bash
   cd ../client-customer
   docker build -t mern-client-customer:1.0 .
   ```

*Command Explanation:*
- `docker build`: Directs the Docker Engine to build a new Docker Image.
- `-t mern-server:1.0`: Tags/names the Image `mern-server` with version `1.0`.
- `.`: Sets the current directory as the build context.

---

### Step 2: Run Independent Containers
Once built, spin up each Container:

1. **Run Backend Server:**
   ```bash
   docker run -d --name mern-server-container --env-file .env -p 3000:3000 mern-server:1.0
   ```
2. **Run Client Admin:**
   ```bash
   docker run -d --name mern-admin-container -p 3001:3001 mern-client-admin:1.0
   ```
3. **Run Client Customer:**
   ```bash
   docker run -d --name mern-customer-container -p 3002:3002 mern-client-customer:1.0
   ```

*Command Explanation:*
- `-d` (detached mode): Runs the container in the background, freeing your terminal window.
- `--name`: Sets a human-readable identifier name for the running container.
- `-p <HostPort>:<ContainerPort>`: Maps ports between your host computer and the container.
- `--env-file .env`: Loads environment variables from the local `.env` file into the container at startup. Since we ignored this file in `.dockerignore` for security reasons, we must inject it at runtime so the server has database connection details.

---

### Step 3: Verification & Testing

#### 1. Test Backend Server via Postman
- **Request Type:** `GET`
- **URL:** `http://localhost:3000/hello` or `http://localhost:3000/api/admin/categories` (with logged-in `x-access-token` header).
- **Expected Outcome:** Receive JSON formatted output response from the server.

#### 2. Test Admin & Customer Clients via Web Browser
- **Admin Panel URL:** Open your browser and visit `http://localhost:3001/admin`
- **Customer Store URL:** Open your browser and visit `http://localhost:3002/`
- **Expected Outcome:** React UI loads and performs page requests correctly.

---

## Part 3: Orchestrating with Docker Compose

Running individual commands to start each service container takes time. **Docker Compose** allows managing and configuring all 3 services inside a single configuration file.

Create a `docker-compose.yml` file at the root directory of the project:
```yaml
version: '3.8'

services:
  server:
    build: ./server
    ports:
      - "3000:3000"
    env_file:
      - ./server/.env
    volumes:
      - ./server:/app
      - /app/node_modules

  client-admin:
    build: ./client-admin
    ports:
      - "3001:3001"
    environment:
      - PORT=3001
    stdin_open: true
    tty: true
    extra_hosts:
      - "localhost:host-gateway"
    volumes:
      - ./client-admin:/app
      - /app/node_modules
    depends_on:
      - server

  client-customer:
    build: ./client-customer
    ports:
      - "3002:3002"
    environment:
      - PORT=3002
    stdin_open: true
    tty: true
    extra_hosts:
      - "localhost:host-gateway"
    volumes:
      - ./client-customer:/app
      - /app/node_modules
    depends_on:
      - server
```

### Explaining `docker-compose.yml` properties:
- `build`: Relative path pointing to the folder containing the service's `Dockerfile` for auto build.
- `ports`: Port mapping definitions matching `-p` in the CLI.
- `env_file`: Automatically loads environment variables from the `.env` file.
- `volumes`: Maps files on your host machine to the `/app` folder in the container (excluding `node_modules`). This enables instant source code hot-reloading without rebuilding images.
- `depends_on`: Sets service startup order. The API server starts first, followed by the React client UIs.
- `stdin_open` & `tty`: Required for certain React-Scripts versions to prevent React containers from automatically exiting upon startup.
- `extra_hosts`: Defines internal IP mapping. Using `"localhost:host-gateway"` routes the API proxy request targeting `localhost:3000` (which is configured in React's `package.json` proxy) from the React container through the host machine to the `server` container running on port 3000. This solves loopback network resolution issues inside individual containers.

---

## Service Communication & Internal Networking in Docker Compose

When using Docker Compose, an isolated network (**Default Bridge Network**) is automatically created to connect all containers belonging to the project.

### Service Discovery via DNS
Inside the virtual Docker network, Docker runs a built-in DNS server. Containers can communicate directly with each other using the **Service Name** defined in `docker-compose.yml` instead of dynamic IP addresses.

*Example:*
In your React client's proxy or Axios API endpoints configuration, instead of using:
`http://localhost:3000/api/admin/...`
You can link internally using the Backend service name:
`http://server:3000/api/admin/...`

---

## Common Docker Compose CLI Commands

Open your Terminal at the root directory containing `docker-compose.yml` to execute:

- **Build and Start all containers:**
  ```bash
  docker compose up --build
  ```
  *(Add `-d` at the end to run in the background).*

- **Stop and remove containers:**
  ```bash
  docker compose down
  ```

- **Follow active logs of all containers:**
  ```bash
  docker compose logs -f
  ```
