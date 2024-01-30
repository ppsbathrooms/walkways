import React, { useState, useEffect } from 'react';
import './header.css';

function Header({ user }) {
  const [showDropdown, setShowDropdown] = useState(false);

  const showSettings = () => {
    // show settings logic
  };

  const handleSignIn = () => {
    window.location.href = "http://localhost:42068/auth/google";
  };

  const handleSignOut = () => {
    window.location.href = "/logout";
  };

  const handleLogoClick = () => {
    if (window.location.pathname !== '/') {
      window.location.href = "/";
    }
  };

  const handleUserPhotoClick = () => {
    setShowDropdown(!showDropdown);
  };

  useEffect(() => {
  }, [user]);

  useEffect(() => {
    if (user) {
      console.log("User logged in:", user);
    } else {
      console.log("No user logged in");
    }
  }, [user]);

  return (
    <>
      <div className="navbar fv">
        <div className="logo" onClick={handleLogoClick}>
          <h1>Walkways</h1>
        </div>
        <div className="flex fv">
          {user ? (
            <>
              <img id="user-photo" src={user?.picture} alt="User" onClick={handleUserPhotoClick} />
              {showDropdown && (
                <div id="user-dropdown">
                  <p id="settings-button" onClick={showSettings}>Settings</p>
                  <p id="sign-out-button" onClick={handleSignOut}>Sign Out</p>
                </div>
              )}
            </>
          ) : (
            <div className="signIn fh fv" id="sign-in-button" onClick={handleSignIn}>
              Sign In
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Header;
