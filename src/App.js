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
  const [summaries, setSummaries] = useState([]);

  const handleImageUpload = async (files) => {
    try {
      const responses = await uploadFiles(files);
      const extractedTexts = responses.map(response => response.message).join('\n\n');
      
      setExtractedText(prevText => 
        prevText === 'Text from image or video will appear here...' ? extractedTexts : prevText + '\n\n' + extractedTexts
      );

      const newSummaries = responses.map(response => response.summary).filter(Boolean);
      setSummaries(prevSummaries => [...prevSummaries, ...newSummaries]);
    } catch (error) {
      console.error("Error during image upload:", error);
      setExtractedText("Failed to extract text.");
      setSummaries([]);
    }
  };

  const handleVideoURL = async (videoURL) => {
    console.log("Entered video URL:", videoURL);
  
    try {
      const response = await fetch('http://127.0.0.1:5000/video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: videoURL }),
      });
  
      const responseData = await response.json();
      if (response.ok && responseData.message) {
        setExtractedText(prevText =>
          prevText === 'Text from image or video will appear here...' ? responseData.message : prevText + '\n\n' + responseData.message
        );
        if (responseData.summary) {
          setSummaries(prevSummaries => [...prevSummaries, responseData.summary]);
        }
      } else {
        throw new Error(responseData.error || 'Unknown error');
      }
    } catch (error) {
      console.error("Error during video processing:", error);
      setExtractedText("Failed to extract video transcript.");
      setSummaries([]);
    }
  };

  const resetApp = () => {
    setIsImageView(true);
    setExtractedText('Text from image or video will appear here...');
    setSummaries([]);
  };

  return (
    <div className="App">
      <Header switchToImage={() => setIsImageView(true)} switchToURL={() => setIsImageView(false)} />
      <div className="container">
        {isImageView ? (
          <div className="left-section">
            <ImageUploader handleImageUpload={handleImageUpload} />
            <FolderUploader handleImageUpload={handleImageUpload} />
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
          <Chatbox summaries={summaries} />
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