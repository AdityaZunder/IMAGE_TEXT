export const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  // Log FormData contents for debugging
  for (let [key, value] of formData.entries()) {
    console.log(`${key}: ${value}`);
  }

  const response = await fetch('http://127.0.0.1:5000/upload', {
    method: 'POST',
    body: formData,
  });

  const responseData = await response.json();
  console.log(responseData);

  if (!response.ok) {
    throw new Error(`File upload failed: ${responseData.error || 'Unknown error'}`);
  }

  return responseData;
};

export const uploadFiles = async (files) => {
  try {
    const uploadPromises = Array.from(files).map(file => uploadFile(file));
    return Promise.all(uploadPromises);
  } catch (error) {
    console.error("Error uploading files:", error);
    throw error; // Re-throw to handle in the calling function
  }
};