import React from 'react';

const Header = ({ switchToImage, switchToURL, activeTab }) => {
  return (
    <header>
      <h1>Welcome to Converting Your Content to Text</h1>
      <div className="tab-container">
        <button 
          className={`tab-button ${activeTab === 'image' ? 'active' : ''}`} 
          onClick={switchToImage}
        >
          Image Upload
        </button>
        <button 
          className={`tab-button ${activeTab === 'video' ? 'active' : ''}`} 
          onClick={switchToURL}
        >
          Video URL
        </button>
      </div>
    </header>
  );
};

export default Header;