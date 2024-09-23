import React, { useState } from 'react';
import './styles.css';
import Header from './components/Header';
import ImageUploader from './components/ImageUploader';
import FolderUploader from './components/FolderUploader';
import VideoURL from './components/VideoURL';
import Chatbox from './components/Chatbox';
import Reset from './components/Reset';
import { uploadFiles } from './components/apiservice';

function App() {
  const [isImageView, setIsImageView] = useState(true);
  const [extractedText, setExtractedText] = useState('Text from image or video will appear here...');
  const [summaries, setSummaries] = useState([]); // Changed to an array

  const handleImageUpload = async (files) => {
    try {
      const responses = await uploadFiles(files);
      const extractedTexts = responses.map(response => response.message).join('\n\n'); // Add two newlines for space

      // Append new extracted text to the existing one with an empty line between entries
      setExtractedText(prevText => 
        prevText === 'Text from image or video will appear here...' ? extractedTexts : prevText + '\n\n' + extractedTexts
      );

      // Collect summaries and append them
      const newSummaries = responses.map(response => response.summary).filter(Boolean);
      setSummaries(prevSummaries => [...prevSummaries, ...newSummaries]);

    } catch (error) {
      console.error("Error during image upload:", error);
      setExtractedText("Failed to extract text.");
      setSummaries([]); // Reset summaries on error
    }
  };

  const handleVideoURL = (e) => {
    const videoURL = e.target.value;
    console.log("Entered video URL:", videoURL);
  };

  const resetApp = () => {
    setIsImageView(true);
    setExtractedText('Text from image or video will appear here...');
    setSummaries([]); // Reset summaries on reset
  };

  return (
    <div className="App">
      <Header switchToImage={() => setIsImageView(true)} switchToURL={() => setIsImageView(false)} />
      <div className="container">
        {isImageView ? (
          <div className="left-section">
            <ImageUploader handleImageUpload={handleImageUpload} />
            <FolderUploader handleImageUpload={handleImageUpload} /> {/* Pass handleImageUpload here */}
          </div>
        ) : (
          <VideoURL handleVideoURL={handleVideoURL} />
        )}
        <div className="right-section">
          <div className="ai-output">
            <h3>Extracted Text</h3>
            <div id="extracted-text" className="extracted-text">
              {extractedText}
            </div>
          </div>
          <Chatbox summaries={summaries} /> {/* Pass summaries to Chatbox */}
        </div>
      </div>
      <Reset resetApp={resetApp} />
      <footer>
        <p>Created by Aditya Zunder</p>
      </footer>
    </div>
  );
}

export default App;