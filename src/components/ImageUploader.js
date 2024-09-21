import React, { useState, useEffect } from 'react';
import { uploadFiles } from './apiservice.js';

const ImageUploader = ({ handleImageUpload }) => {
  const [imagePreviews, setImagePreviews] = useState([]);

  useEffect(() => {
    const handlePaste = async (e) => {
      const clipboardItems = e.clipboardData.items;
      const imageFiles = [];

      for (const item of clipboardItems) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) {
            imageFiles.push(file);
          }
        }
      }

      if (imageFiles.length > 0) {
        await uploadFiles(imageFiles);
        const previews = [];

        for (const file of imageFiles) {
          const reader = new FileReader();
          reader.onload = (event) => {
            previews.push(event.target.result);
            if (previews.length === imageFiles.length) {
              setImagePreviews(previews);
              handleImageUpload(imageFiles); // Pass the image files to the parent
            }
          };
          reader.readAsDataURL(file);
        }
      }
    };

    window.addEventListener('paste', handlePaste);

    return () => {
      window.removeEventListener('paste', handlePaste);
    };
  }, [handleImageUpload]);

  const handleFileChange = async (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      await uploadFiles(files);
      const previews = [];

      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (event) => {
          previews.push(event.target.result);
          if (previews.length === files.length) {
            setImagePreviews(previews);
            handleImageUpload(files); // Pass the image files to the parent
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  return (
    <div className="input-section">
      <h3>Upload Image or Paste Screenshot</h3>
      <input
        type="file"
        id="image-upload"
        accept="image/*"
        onChange={handleFileChange}
        multiple
      />
      <div id="image-display" className="image-display">
        {imagePreviews.length > 0 ? (
          <div>
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

export default ImageUploader;