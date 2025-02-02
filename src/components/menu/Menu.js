import React from "react";

const Menu = ({ title, children, onClose }) => {
  return (
    <div className="menu-overlay">
      <div className="menu-container">
        <h2>{title}</h2>
        <div class="test">
          <button className="close-button" onClick={onClose}>
            X
          </button>
        </div>

        <div className="menu-content">{children}</div>
      </div>
    </div>
  );
};

export default Menu;
