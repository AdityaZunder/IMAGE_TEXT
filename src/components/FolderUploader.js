import React, { useState } from 'react';
import { uploadFiles } from './apiservice.js';

const FolderUploader = ({ handleFolderUpload }) => {
  const [imagePreviews, setImagePreviews] = useState([]);

  const handleFolderChange = async (e) => {
    const folderFiles = e.target.files;
    if (folderFiles.length > 0) {
      try {
        await uploadFiles(folderFiles); // Upload folder files

        const previews = [];
        for (const file of folderFiles) {
          const reader = new FileReader();
          reader.onload = (event) => {
            previews.push(event.target.result);
            if (previews.length === folderFiles.length) {
              setImagePreviews(previews);
              handleFolderUpload(folderFiles); // Pass the folder files to the parent component
            }
          };
          reader.readAsDataURL(file);
        }
      } catch (error) {
        console.error("Error uploading files:", error);
      }
    }
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
          <div className="image-previews">
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