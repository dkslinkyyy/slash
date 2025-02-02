import React, { useState, useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid"; // Import UUID library
import "./App.css";
import ChatMessages from "./components/ChatMessages";
import SettingsMenu from "./components/menu/SettingsMenu"; // Updated import to SettingsMenu

function ChatApp() {
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState(""); // For chat message input
  const [username, setUsername] = useState(""); // For storing the actual username
  const [profileImage, setProfileImage] = useState("/assets/slash-logo-sm.png"); // For storing the profile image (base64 or URL)
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const wsRef = useRef(null);
  const sentMessageIds = useRef(new Set()); // Store sent message IDs
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null); // Reference to the textarea

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [messages]);

  useEffect(() => {
    const ws = new WebSocket("ws://16.171.141.188:8080/ws");

    wsRef.current = ws;

    ws.onopen = () => {
      console.log("Connected to WebSocket");
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);

      // Ignore messages that the client itself sent
      if (!sentMessageIds.current.has(message.id)) {
        setMessages((prev) => [...prev, message]);
      }
    };

    ws.onclose = () => {
      console.log("WebSocket disconnected");
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    return () => ws.close();
  }, []);

  // Auto-resize the textarea on input
  useEffect(() => {
    const textarea = textareaRef.current;
    const autoResize = () => {
      textarea.style.height = "auto"; // Reset height
      textarea.style.height = `${textarea.scrollHeight}px`; // Set to scrollHeight
    };

    if (textarea) {
      textarea.addEventListener("input", autoResize, false);
    }

    // Clean up event listener
    return () => {
      if (textarea) {
        textarea.removeEventListener("input", autoResize);
      }
    };
  }, []);

  const sendMessage = () => {
    if (!username) {
      alert("Your username is not set");
      return; // Exit early if username is not set
    }
    if (wsRef.current && messageInput.trim()) {
      const message = {
        id: uuidv4(), // Generate a unique ID
        content: messageInput,
        sender: username,
        timestamp: new Date().toISOString(),
        profileImage: profileImage, // Include the profile image in the message
      };

      wsRef.current.send(JSON.stringify(message));
      sentMessageIds.current.add(message.id); // Store sent message ID
      setMessages((prev) => [...prev, message]); // No need to reverse manually
      setMessageInput(""); // Clear the chat message input
    }
  };

  const handleClose = () => {
    setIsMenuOpen(false);
  };

  return (
    <div className="chat-app">
      <button
        className="bg-blue-500 h-7 fixed top-5 left-5"
        onClick={() => setIsMenuOpen(true)}
      >
        Settings
      </button>

      {isMenuOpen && (
        <SettingsMenu
          onClose={handleClose}
          username={username}
          setUsername={setUsername}
          profileImage={profileImage}
          setProfileImage={setProfileImage}
        />
      )}

      {/* Chat Messages */}
      <ChatMessages messages={messages} messagesEndRef={messagesEndRef} />

      {/* Message Input */}
      <div className="chat-input">
        <textarea
          ref={textareaRef}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              sendMessage(); // Send message when pressing Enter
            }
          }}
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          placeholder="Type a message..."
          className="chat-input-textarea"
        />
      </div>
    </div>
  );
}

export default ChatApp;
