# Useful Commands Cheat Sheet

This file contains a collection of the most common commands you'll use when working with the different services in this project.

---

## 🐳 Docker

Docker is used to containerize and run the entire application stack.

-   **Build and start all services:**
    ```bash
    docker compose up --build
    ```
    *This is the primary command to start the development environment. The `--build` flag forces a rebuild of the images if the Dockerfile or context has changed.*

-   **Start services in detached mode:**
    ```bash
    docker compose up -d
    ```
    *Runs the containers in the background. You won't see the logs directly, but the terminals will be free.*

-   **Stop all services:**
    ```bash
    docker compose down
    ```
    *Stops and removes the containers, networks, and volumes created by `up`.*

-   **View logs for all services:**
    ```bash
    docker compose logs -f
    ```
    *Follows the log output (`-f`) of all running services. Useful for debugging when running in detached mode.*

-   **View logs for a specific service:**
    ```bash
    docker compose logs -f <service_name>
    # Example: docker compose logs -f robot_sim_core_rust
    ```

-   **List running containers:**
    ```bash
    docker ps
    ```

-   **Access a running container's shell:**
    ```bash
    docker exec -it <container_name> /bin/sh
    # Example: docker exec -it robot_gateway_golang /bin/sh
    ```
    *Lets you run commands directly inside a container. `/bin/bash` is also a common shell.*

---

## 🦀 Rust / Cargo

Cargo is Rust's build system and package manager. These commands are typically run inside the `/simulation` directory.

-   **Build the project:**
    ```bash
    cargo build
    ```
    *Compiles the code and places the executable in `target/debug/`.*

-   **Build for production (optimized):**
    ```bash
    cargo build --release
    ```
    *Creates a highly optimized executable in `target/release/`.*

-   **Run the project:**
    ```bash
    cargo run
    ```
    *Builds and runs the executable.*

-   **Check for errors without compiling:**
    ```bash
    cargo check
    ```
    *A quick way to see if the code compiles without the overhead of producing an executable.*

-   **Run tests:**
    ```bash
    cargo test
    ```

-   **Format code:**
    ```bash
    cargo fmt
    ```

-   **Update dependencies:**
    ```bash
    cargo update
    ```

---

## 🐹 Go

Go has built-in tools for managing dependencies and running code. These commands are typically run inside the `/gateway` directory.

-   **Run the application:**
    ```bash
    go run main.go
    ```
    *Compiles and runs the `main.go` file.*

-   **Build an executable:**
    ```bash
    go build .
    ```
    *Compiles the current project into an executable file in the same directory.*

-   **Format code:**
    ```bash
    go fmt ./...
    ```
    *Formats all `.go` files in the current directory and all subdirectories.*

-   **Manage dependencies:**
    ```bash
    go mod tidy
    ```
    *Ensures the `go.mod` file matches the source code's dependencies. It adds missing ones and removes unused ones.*

-   **Run tests:**
    ```bash
    go test ./...
    ```

---

## ⚛️ React / Vite

NPM (Node Package Manager) is used to manage the frontend dependencies. These commands are typically run inside the `/web` directory.

-   **Install dependencies:**
    ```bash
    npm install
    ```
    *Reads the `package.json` file and installs all the required libraries into the `node_modules` folder.*

-   **Start the development server:**
    ```bash
    npm run dev
    ```
    *Starts the Vite development server with Hot Module Replacement (HMR), which provides a fast and smooth development experience.*

-   **Create a production build:**
    ```bash
    npm run build
    ```
    *Bundles and optimizes the React app for production. The output is placed in the `/dist` folder.*

-   **Run linters and formatters:**
    ```bash
    npm run lint
    ```
    *Often configured in `package.json` to run tools like ESLint to check for code quality and style issues.*
