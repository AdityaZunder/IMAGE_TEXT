export const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch('http://127.0.0.1:5000/upload', {
      method: 'POST',
      body: formData,
    });

    const responseData = await response.json();
    if (!response.ok) {
      throw new Error(`File upload failed: ${responseData.error || 'Unknown error'}`);
    }

    return responseData; // Ensure this returns the expected format
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error; // Re-throw to be handled in the calling function
  }
};

// Modify the uploadFiles function to introduce a delay between each file upload.
export const uploadFiles = async (files) => {
  try {
    const uploadPromises = [];

    // Add a delay between each file upload to avoid overloading the backend
    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      const uploadPromise = new Promise((resolve) => {
        setTimeout(async () => {
          const response = await uploadFile(file);
          resolve(response);
        }, i * 500); // 500ms delay between each file
      });

      uploadPromises.push(uploadPromise);
    }

    // Wait for all uploads to complete
    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error("Error uploading files:", error);
    throw error;
  }
};

// Updated uploadFolder function to use uploadFiles
export const uploadFolder = async (files) => {
  try {
    return await uploadFiles(files);
  } catch (error) {
    console.error("Error uploading folder:", error);
    throw error; // Re-throw to handle in the calling function
  }
};