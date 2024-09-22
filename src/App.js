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
  const [summary, setSummary] = useState('');

  const handleImageUpload = async (files) => {
    try {
      const responses = await uploadFiles(files);
      const extractedTexts = responses.map(response => response.message).join('\n\n'); // Add two newlines for space
  
      // Append new extracted text to the existing one with an empty line between entries
      setExtractedText(prevText => 
        prevText === 'Text from image or video will appear here...' ? extractedTexts : prevText + '\n\n' + extractedTexts
      );
  
      // Assuming the summary comes from the API response
      const summaryResponse = responses[0]?.summary;
      setSummary(summaryResponse || 'No summary available.');
  
    } catch (error) {
      console.error("Error during image upload:", error);
      setExtractedText("Failed to extract text.");
      setSummary(''); // Reset summary on error
    }
  };
  

  const handleFolderUpload = (folderFiles) => {
    console.log("Folder of images uploaded:", folderFiles);
    setExtractedText("Folder uploaded successfully.");
  };

  const handleVideoURL = (e) => {
    const videoURL = e.target.value;
    console.log("Entered video URL:", videoURL);
  };

  const resetApp = () => {
    setIsImageView(true);
    setExtractedText('Text from image or video will appear here...');
    setSummary(''); // Reset summary on reset
  };

  return (
    <div className="App">
      <Header switchToImage={() => setIsImageView(true)} switchToURL={() => setIsImageView(false)} />
      <div className="container">
        {isImageView ? (
          <div className="left-section">
            <ImageUploader handleImageUpload={handleImageUpload} />
            <FolderUploader handleFolderUpload={handleFolderUpload} />
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
          <Chatbox summary={summary} /> {/* Pass summary to Chatbox */}
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