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
          Image To Text
        </button>
        <button 
          className={`tab-button ${activeTab === 'video' ? 'active' : ''}`} 
          onClick={switchToURL}
        >
          Youtube Video to Text
        </button>
      </div>
    </header>
  );
};

export default Header;