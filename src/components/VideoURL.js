import React, { useState } from 'react';

const VideoURL = ({ handleVideoURL }) => {
  const [url, setUrl] = useState('');
  const [videoId, setVideoId] = useState('');

  const handleInputChange = (e) => {
    setUrl(e.target.value);
  };

  const handleSubmit = () => {
    if (url) {
      // Extract video ID from the URL
      const id = url.split('v=')[1]?.split('&')[0];
      if (id) {
        setVideoId(id); // Set the video ID
      }
      handleVideoURL(url); // Pass the URL to the parent handler
      setUrl(''); // Clear the input field after sending
    }
  };

  return (
    <div className="left-section">
      <h2>Enter Video URL</h2>
      <div className="input-section">
        <h3>Enter Video URL</h3>
        <input 
          type="text" 
          id="url-upload" 
          placeholder="Paste Video URL Here" 
          value={url}
          onChange={handleInputChange} 
        />
        <button onClick={handleSubmit}>Submit</button>
      </div>

      {/* Display video player if videoId is set */}
      {videoId && (
        <div id="video-player">
          <iframe
            width="560"
            height="315"
            src={`https://www.youtube.com/embed/${videoId}`}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      )}
    </div>
  );
};

export default VideoURL;