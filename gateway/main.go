// Package main is the entry point for the application.
package main

import (
	"fmt"      // For formatted I/O (like printing to the console)
	"net"      // For networking operations (UDP)
	"net/http" // For building HTTP servers and clients (WebSocket is built on top of HTTP)
	"sync"     // Provides synchronization primitives, like mutexes

	"github.com/gorilla/websocket" // A popular Go library for working with WebSockets
)

// --- WebSocket Configuration ---

// upgrader holds the WebSocket upgrader configuration.
// We configure it to allow all origins, which is useful for development
// when the web client is served from a different port (Vite dev server).
// SYNTAX: `var` declares a variable. `upgrader` is the variable name.
// `websocket.Upgrader{...}` is creating an instance of a struct.
var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		// `func(...) bool { ... }` is an anonymous function.
		// It returns `true` to indicate that any request origin is acceptable.
		return true
	},
}

// --- Global State for Connection Management ---

// clients is a map to store all active WebSocket client connections.
// The keys are pointers to websocket.Conn objects, and the values are booleans.
// We use a map for efficient addition and removal of clients.
// SYNTAX: `make(map[keyType]valueType)` creates a map.
var clients = make(map[*websocket.Conn]bool)

// broadcast is a channel that acts as a queue for messages received from the simulation.
// Messages sent to this channel will be forwarded to all connected WebSocket clients.
// SYNTAX: `make(chan dataType)` creates a channel. Channels are a core concurrency feature in Go for safe communication.
var broadcast = make(chan []byte)

// mutex is a "mutual exclusion lock". It's used to prevent race conditions
// when multiple goroutines (concurrent threads) access the `clients` map simultaneously.
// SYNTAX: `&sync.Mutex{}` creates a pointer to a new Mutex object.
var mutex = &sync.Mutex{}

// --- Main Application Logic ---

// main is the entry function for the application.
func main() {
	// Start a new goroutine to listen for UDP data from the Rust simulation.
	// SYNTAX: `go` keyword starts a new goroutine, which is like a lightweight thread managed by the Go runtime.
	go startUDPServer()

	// now it doesn't block the UDP server
	go startBroadcaster()

	// Register the handleConnections function to handle all incoming HTTP requests to the "/ws" endpoint.
	// This is where clients will connect to establish a WebSocket connection.
	http.HandleFunc("/ws", handleConnections)

	// Start the HTTP server.
	fmt.Println("Gateway listening on :8081 (WS) and :8000 (UDP)...")
	// http.ListenAndServe starts a server that listens on the specified TCP network address.
	// This is a blocking call, so the main goroutine will be "stuck" here, keeping the server alive.
	// The ":8081" is the port inside the Docker container.
	err := http.ListenAndServe(":8081", nil) // inside port of the docker container
	if err != nil {
		// If the server fails to start (e.g., port is already in use), the program will exit.
		// `panic` is a built-in function that stops the ordinary flow of control and begins panicking.
		panic(err)
	}
}

// --- Concurrent Goroutines ---

// startUDPServer listens for incoming UDP packets from the simulation service.
func startUDPServer() {
	// Resolve the UDP address. ":8000" means it will listen on port 8000 on all available network interfaces.
	// SYNTAX: `_` is the blank identifier. It's used to discard values you don't need. Here, we ignore the error.
	addr, _ := net.ResolveUDPAddr("udp", ":8000")

	// Start listening for UDP packets on the resolved address.
	conn, err := net.ListenUDP("udp", addr)
	if err != nil {
		panic(err)
	}
	// `defer` schedules a function call to be run immediately before the function `startUDPServer` returns.
	// It's a great way to ensure resources are cleaned up.
	defer conn.Close()

	// Create a buffer to hold the incoming data. 1024 bytes is a common size.
	buf := make([]byte, 1024)

	// `for {}` is an infinite loop, so the server listens indefinitely.
	for {
		// Read data from the UDP connection into the buffer.
		// `n` is the number of bytes read.
		n, _, err := conn.ReadFromUDP(buf)
		if err != nil {
			// If there's an error, skip to the next iteration.
			continue
		}

		// fmt.Println(buf[:n])

		// Send the received data (a slice of the buffer from the start to `n`) to the broadcast channel.
		// This will be picked up by the `handleConnections` function.
		// SYNTAX: `channel <- value` sends a value into a channel.
		broadcast <- buf[:n]
	}
}

// handleConnections is called for each new client connecting to the "/ws" WebSocket endpoint.
func handleConnections(w http.ResponseWriter, r *http.Request) {
	// Upgrade the initial HTTP connection to a persistent WebSocket connection.
	ws, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		fmt.Println(err)
		return
	}
	// Ensure the connection is closed when the function returns.
	defer ws.Close()

	// --- Register New Client ---
	// Lock the mutex to ensure that no other goroutine can access the `clients` map at the same time.
	mutex.Lock()
	// Add the new client connection to our map of clients.
	clients[ws] = true
	// Unlock the mutex so other goroutines can use it.
	mutex.Unlock()

	for {
		if _, _, err := ws.ReadMessage(); err != nil {
			mutex.Lock()
			delete(clients, ws)
			mutex.Unlock()
			break
		}
	}
}

func startBroadcaster() {
	for {
		msg := <-broadcast
		mutex.Lock()
		for client := range clients {
			err := client.WriteMessage(websocket.TextMessage, msg)
			if err != nil {
				client.Close()
				delete(clients, client)
			}
		}
		mutex.Unlock()
	}
}
