import React from "react";
import Menu from "./Menu";

const SettingsMenu = ({
  onClose,
  username,
  setUsername,
  profileImage,
  setProfileImage,
}) => {
  const handleUsernameChange = (e) => {
    setUsername(e.target.value); // Update the username
  };

  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result); // Update the profile image
      };
      reader.readAsDataURL(file); // Convert image to base64
    }
  };

  return (
    <Menu title="Settings" onClose={onClose}>
      <div className="settings-content">
        <div className="username-section">
          <label>Username: </label>
          <input
            type="text"
            value={username}
            onChange={handleUsernameChange}
            placeholder="Enter username"
          />
        </div>

        <div className="profile-image-section">
          <label>Profile Image: </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleProfileImageChange}
          />
          {profileImage && (
            <div className="profile-image-container">
              <img src={profileImage} alt="Profile" className="profile-image" />
            </div>
          )}
        </div>
      </div>
    </Menu>
  );
};

export default SettingsMenu;
