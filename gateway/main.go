package main

import (
	"fmt"
	"net"
	"net/http"
	"sync"

	"github.com/gorilla/websocket"
)

// allow for requests from Vite
var upgrader = websocket.Upgrader{CheckOrigin: func(r *http.Request) bool { return true }}

var clients = make(map[*websocket.Conn]bool)
var broadcast = make(chan []byte)
var mutex = &sync.Mutex{}

func main() {
	// listening to UDP (data from Rust)
	go startUDPServer()

	// WebSocket server start
	http.HandleFunc("/ws", handleConnections)

	fmt.Println("Gateway listening on :8080 (WS) and :8000 (UDP)...")
	err := http.ListenAndServe(":8080", nil)
	if err != nil {
		panic(err)
	}

}

func startUDPServer() {
	addr, _ := net.ResolveUDPAddr("udp", ":8000")
	conn, err := net.ListenUDP("udp", addr)
	if err != nil {
		panic(err)
	}
	defer conn.Close()

	buf := make([]byte, 1024)
	for {
		n, _, err := conn.ReadFromUDP(buf)
		if err != nil {
			continue
		}
		broadcast <- buf[:n]
	}
}

func handleConnections(w http.ResponseWriter, r *http.Request) {
	ws, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		fmt.Println(err)
		return
	}
	defer ws.Close()

	mutex.Lock()
	clients[ws] = true
	mutex.Unlock()

	for msg := range broadcast {
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
