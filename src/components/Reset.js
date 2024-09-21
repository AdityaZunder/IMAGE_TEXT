// src/components/Reset.js
import React from 'react';

const Reset = ({ resetApp }) => {
  const handleReset = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (response.ok) {
        console.log(data.message);
        resetApp(); // Call the resetApp function to reset your application state
        window.location.reload(); // Reload the page
      } else {
        console.error(data.error);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <button onClick={handleReset} className="reset-button">
      Reset - press if you want the ai to reset it's information
    </button>
  );
};

export default Reset;