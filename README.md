# Robot Swarm Simulation Platform

A real-time robot swarm simulation and visualization platform. The project utilizes a microservices architecture divided into a computing layer (Rust), a communication layer (Go), and a presentation layer (React/Three.js).

## Architecture

- **Simulation (`/simulation`)**: High-performance backend written in Rust. Responsible for rigid-body physics, swarm logic, and sensor simulation (Lidar).

- **Gateway (`/gateway`)**: Communication middleware written in Go. Orchestrates data flow from the simulation and broadcasts it to clients via WebSockets.

- **Web (`/web`)**: Visualization frontend powered by React + Vite + React Three Fiber.

## Quick Start (Docker)

The most efficient way to spin up the entire development environment:

```bash
# 1. Start all services
docker compose up --build

# 2. Access the application
# Open in browser: http://localhost:5173
```

To stop the environment: `Ctrl+C` or `docker compose down`.

## Manual Setup & Commands

If you prefer running services locally for better IDE performance or profiling, follow the instructions below.

### 1. Simulation (Rust)

Requirements: `rustup`, `cargo`.

```bash
cd simulation

# Build and install dependencies
cargo build

# Execute simulation
cargo run

# Code formatting
cargo fmt

# Run unit and logic tests
cargo test
```

### 2. Gateway (Go)

Requirements: `go` 1.23+.

```bash
cd gateway

# Fetch dependencies
go mod tidy

# Run the server
go run main.go

# Format source code
go fmt ./...
```

### 3. Web (React/Vite)

Requirements: `node`, `npm`.

```bash
cd web

# Install dependencies
npm install

# Start development server
npm run dev

# Production build
npm run build
```

## 🔌 IDE Configuration (VS Code)

To ensure type safety and consistent formatting, install the following extensions:

- `Rust Analyzer` (for `/simulation`)
- `Go` (for `/gateway`)
- `ESLint` / `Prettier` (for `/web`)

Formatting is applied automatically on save via `.vscode/settings.json`.

## 📝 Architectural Decision Records (ADR)

You can find it in [docs/](./docs).
