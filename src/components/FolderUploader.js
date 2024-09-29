import React, { useState } from 'react';
import { uploadFiles } from './apiservice.js';

const FolderUploader = ({ handleImageUpload }) => {
  const [imagePreviews, setImagePreviews] = useState([]);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleFolderChange = async (e) => {
    const folderFiles = e.target.files;
    console.log("Total files:", folderFiles.length);
  
    if (folderFiles.length > 0) {
      const validFiles = Array.from(folderFiles).filter(file => 
        file.name && !file.name.endsWith('.DS_Store') && file.size > 0 // Filter unnecessary files
      );
  
      console.log("Valid files:", validFiles.length);
  
      if (validFiles.length > 0) {
        try {
          // Delay the upload slightly to ensure the backend is ready
          setTimeout(async () => {
            await handleFilesUpload(validFiles);  // Call the function to upload files
          }, 5000);  // Delay upload by 5000ms
        } catch (error) {
          console.error("Error uploading files:", error);
          setErrorMessage("Error uploading files. Please try again."); // Set error message
        }
      } else {
        alert("No valid files to upload.");
      }
    }
  };

  const handleFilesUpload = async (files) => {
    try {
      const responses = await uploadFiles(files); // API call to upload files
      const previews = await Promise.all(files.map(file => readFileAsDataURL(file))); // Async file reading
      
      setImagePreviews((prevPreviews) => [...prevPreviews, ...previews]); // Append new previews
      handleImageUpload(files); // Notify parent of image upload

      alert(`${files.length} file(s) uploaded successfully.`);
    } catch (error) {
      console.error("Error reading files:", error);
      setErrorMessage("Failed to read or upload some files.");
    }
  };

  // Helper function to read file and return a Promise
  const readFileAsDataURL = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => resolve(event.target.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  return (
    <div className="input-section">
      <h3>Upload Folder of Images</h3>
      <input
        type="file"
        id="folder-upload"
        name="folder-upload"
        webkitdirectory="true"
        directory="true"
        multiple
        onChange={handleFolderChange}
      />
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
      <div id="folder-display" className="folder-display">
        {imagePreviews.length > 0 ? (
          <div className="scroll-container">
            {imagePreviews.map((preview, index) => (
              <img key={index} src={preview} alt={`Preview ${index}`} style={{ maxWidth: '100%', marginBottom: '10px' }} />
            ))}
          </div>
        ) : (
          <p>No images uploaded yet.</p>
        )}
      </div>
    </div>
  );
};

export default FolderUploader;