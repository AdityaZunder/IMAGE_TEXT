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

export const uploadFiles = async (files) => {
  try {
    const uploadPromises = Array.from(files).map(file => uploadFile(file));
    return await Promise.all(uploadPromises); // Wait for all uploads to finish
  } catch (error) {
    console.error("Error uploading files:", error);
    throw error; // Re-throw to handle in the calling function
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