import React, { useState, useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import "./App.css";
import ChatMessages from "./components/ChatMessages";
import SettingsMenu from "./components/menu/SettingsMenu";

function ChatApp() {
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [username, setUsername] = useState("");
  const [profileImage, setProfileImage] = useState("/assets/slash-logo-sm.png");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [typingUser, setTypingUser] = useState(""); // Track who is typing

  const wsRef = useRef(null);
  const sentMessageIds = useRef(new Set());
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [messages]);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080/ws");

    console.log(ws);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("Connected to WebSocket");
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);

        console.log(message);
        if (message.type === "typing") {
          setTypingUser(message.user);

          // Remove typing status after 2 seconds
          clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = setTimeout(() => setTypingUser(""), 2000);
        } else {
          setMessages((prev) => [...prev, message]);
        }
      } catch (error) {
        console.error("Error parsing message:", error);
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

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const autoResize = () => {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    };

    textarea.addEventListener("input", autoResize);

    return () => {
      textarea.removeEventListener("input", autoResize);
    };
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      // Prevent default behavior (adding a new line)
      e.preventDefault();

      // Send the message if it's not empty
      if (messageInput.trim()) {
        sendMessage();
      }
    }
    // Allow Shift + Enter to add a new line
  };

  const sendMessage = () => {
    if (!username) {
      alert("Your username is not set");
      return;
    }

    if (wsRef.current && messageInput.trim()) {
      const message = {
        username: username,
        message: messageInput,
      };
      wsRef.current.send(JSON.stringify(message).trim());
      sentMessageIds.current.add(message.id);
      setMessages((prev) => [...prev, message]);
      setMessageInput("");
    }
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
          onClose={() => setIsMenuOpen(false)}
          username={username}
          setUsername={setUsername}
          profileImage={profileImage}
          setProfileImage={setProfileImage}
        />
      )}

      {/* Chat Messages */}
      <ChatMessages messages={messages} messagesEndRef={messagesEndRef} />

      {/* Chat Input Section */}
      <div className="chat-input-container">
        {/* Typing Indicator */}
        {typingUser && (
          <div className="typing-indicator">{typingUser} is typing...</div>
        )}
        <div className="chat-input">
          <textarea
            ref={textareaRef}
            onKeyDown={handleKeyDown}
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            placeholder="Type a message..."
            className="chat-input-textarea"
          />
        </div>
      </div>
    </div>
  );
}

export default ChatApp;
