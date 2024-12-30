package main

import (
	"fmt"
	"log"
	"net/http"
	"sync"

	"github.com/gorilla/websocket"
	"golang.org/x/crypto/chacha20poly1305"
)

type ChatServer struct {
	activeUsers map[*websocket.Conn]string
	sessionKeys map[*websocket.Conn][]byte
	mu          sync.Mutex
	upgrader    websocket.Upgrader
}

type Message struct {
	Type     string `json:"type"`
	Message  string `json:"message,omitempty"`
	Username string `json:"username,omitempty"`
}

func NewChatServer() *ChatServer {
	return &ChatServer{
		activeUsers: make(map[*websocket.Conn]string),
		sessionKeys: make(map[*websocket.Conn][]byte),
		upgrader: websocket.Upgrader{
			CheckOrigin: func(r *http.Request) bool { return true },
		},
	}
}

func (server *ChatServer) handleConnection(conn *websocket.Conn) {
	defer conn.Close()
	fmt.Println("New connection: ", conn.RemoteAddr())

	for {
		var msg Message
		err := conn.ReadJSON(&msg)
		if err != nil {
			log.Println("Error reading message:", err)
			return
		}

		switch msg.Type {
		case "requestSessionKey":
			if msg.Username == "" {
				conn.WriteJSON(Message{Type: "Error", Message: "Username is required for session key requests."})
				return
			}

			sessionKey := generateSessionKey()
			server.mu.Lock()
			server.sessionKeys[conn] = sessionKey
			server.activeUsers[conn] = msg.Username
			server.mu.Unlock()

			encodedSessionKey := encodeKey(sessionKey)
			conn.WriteJSON(Message{Type: "sessionKey", Message: encodedSessionKey})

			fmt.Println("Session key generated for username:", msg.Username)

		case "message":
			sessionKey, ok := server.sessionKeys[conn]
			if !ok {
				conn.WriteJSON(Message{Type: "Error", Message: "Session key not found."})
				return
			}

			decryptedMessage, err := decrypt(msg.Message, sessionKey)
			if err != nil {
				conn.WriteJSON(Message{Type: "Error", Message: "Decryption failed."})
				return
			}

			username := server.activeUsers[conn]
			if username != "" {
				encryptedMessage := encrypt(decryptedMessage, sessionKey)
				server.broadcast(Message{
					Username: username,
					Message:  encryptedMessage,
				})
			} else {
				conn.WriteJSON(Message{Type: "Error", Message: "User not registered."})
			}

		default:
			conn.WriteJSON(Message{Type: "Error", Message: "Invalid message type."})
		}
	}
}

func (server *ChatServer) broadcast(msg Message) {
	server.mu.Lock()
	defer server.mu.Unlock()

	for conn := range server.activeUsers {
		err := conn.WriteJSON(msg)
		if err != nil {
			log.Println("Error broadcasting message:", err)
			conn.Close()
			delete(server.activeUsers, conn)
			delete(server.sessionKeys, conn)
		}
	}
}

func generateSessionKey() []byte {
	key := make([]byte, chacha20poly1305.KeySize)
	// Here, you should generate a secure random key
	return key
}

func encodeKey(key []byte) string {
	return fmt.Sprintf("%x", key) // Simply returning the key as a hex string
}

func encrypt(message string, key []byte) string {
	// Use a symmetric encryption algorithm like ChaCha20-Poly1305 or AES for encryption
	// Placeholder for actual encryption implementation
	return message
}

func decrypt(message string, key []byte) (string, error) {
	// Use the corresponding decryption algorithm
	// Placeholder for actual decryption implementation
	return message, nil
}

func main() {
	server := NewChatServer()

	http.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		conn, err := server.upgrader.Upgrade(w, r, nil)
		if err != nil {
			log.Println("Error upgrading connection:", err)
			return
		}

		go server.handleConnection(conn)
	})

	log.Println("Server started on :8080")
	if err := http.ListenAndServe(":8080", nil); err != nil {
		log.Fatal("ListenAndServe:", err)
	}
}
