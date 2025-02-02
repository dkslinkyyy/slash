import React from "react";

const Message = ({ msg }) => {
  return (
    <div className="message-wrap">
      <div className="message-details">
        <span className="message-sender">{msg.sender}</span>
        <span>{new Date(msg.timestamp).toLocaleTimeString()}</span>
      </div>
      <span className="message-content">{msg.content}</span>
    </div>
  );
};

export default Message;
