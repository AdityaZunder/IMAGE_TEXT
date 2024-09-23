import React, { useState } from 'react';
import { uploadFiles } from './apiservice.js';

const FolderUploader = ({ handleImageUpload }) => {  // Ensure the function is passed as a prop
  const [imagePreviews, setImagePreviews] = useState([]);

  const handleFolderChange = async (e) => {
    const folderFiles = e.target.files;
    console.log("Total files:", folderFiles.length); // Debugging

    if (folderFiles.length > 0) {
      const validFiles = Array.from(folderFiles).filter(file => 
        file.name && !file.name.endsWith('.DS_Store') && file.size > 0 // Filter out unnecessary files
      );

      console.log("Valid files:", validFiles.length); // Debugging

      if (validFiles.length > 0) {
        try {
          await handleFilesUpload(validFiles);  // Call the function to upload files
        } catch (error) {
          console.error("Error uploading files:", error);
        }
      } else {
        alert("No valid files to upload.");
      }
    }
  };

  const handleFilesUpload = async (files) => {
    const responses = await uploadFiles(files);
    
    const previews = [];
    files.forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        previews.push(event.target.result);
        if (previews.length === files.length) {
          setImagePreviews((prevPreviews) => [...prevPreviews, ...previews]); // Append new images
          handleImageUpload(files);  // Pass the images to the parent component's function
        }
      };
      reader.readAsDataURL(file);
    });

    alert(`${files.length} file(s) uploaded.`);
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