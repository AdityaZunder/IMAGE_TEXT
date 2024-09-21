import React from 'react';

const VideoURL = ({ handleVideoURL }) => {
  return (
    <div className="left-section">
      <h2>Enter Video URL</h2>
      <div className="input-section">
        <h3>Enter Video URL</h3>
        <input type="text" id="url-upload" placeholder="Paste Video URL Here" onBlur={handleVideoURL} />
        <div id="url-display"></div>
      </div>
    </div>
  );
};

export default VideoURL;