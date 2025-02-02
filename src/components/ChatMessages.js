// ChatMessages.jsx
import React from "react";
import Message from "./Message";

const ChatMessages = ({ messages, messagesEndRef }) => {
  return (
    <div className="chat-messages">
      {messages.map((msg, index) => (
        <div key={index} className="message">
          {msg.profileImage && (
            <div className="profile-image-container">
              <img
                src={msg.profileImage}
                alt="Profile"
                className="message-profile-image"
              />
            </div>
          )}
          <Message msg={msg} />
        </div>
      ))}
      <div ref={messagesEndRef}></div>
    </div>
  );
};

export default ChatMessages;
