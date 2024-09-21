import React, { useState, useEffect } from 'react';
import './styles.css';
import Header from './components/Header';
import ImageUploader from './components/ImageUploader';
import FolderUploader from './components/FolderUploader';
import VideoURL from './components/VideoURL';
import Chatbox from './components/Chatbox';
import { uploadFiles } from './components/apiservice';

function App() {
  const [isImageView, setIsImageView] = useState(true);
  const [extractedText, setExtractedText] = useState('Text from image or video will appear here...');

  const handleImageUpload = async (files) => {
    try {
      const responses = await uploadFiles(files);
      // Assuming each response contains the extracted text
      const extractedTexts = responses.map(response => response.message).join(', '); // Join multiple texts if necessary
      setExtractedText(extractedTexts || 'No text extracted.');
    } catch (error) {
      console.error("Error during image upload:", error);
      setExtractedText("Failed to extract text.");
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
          <Chatbox />
        </div>
      </div>
      <footer>
        <p>Created by Aditya Zunder</p>
      </footer>
    </div>
  );
}

export default App;