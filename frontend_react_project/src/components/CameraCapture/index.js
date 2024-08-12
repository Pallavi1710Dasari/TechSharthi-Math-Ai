import React, { useRef } from 'react';
import Webcam from 'react-webcam';
import { FaTimes } from 'react-icons/fa';
import { TbHandClick } from "react-icons/tb";
import './index.css'; // Import the CSS file

const CameraCapture = ({ onCapture, onClose }) => {
  const webcamRef = useRef(null);

  const handleClose = () => {
    console.log('Close button clicked'); // Debugging
    onClose(); // This should trigger the function passed from MainSection
  };

  const capture = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    console.log('Capture button clicked');
    onCapture(imageSrc);
  };

  return (
    <div className="camera-capture">
      <FaTimes onClick={handleClose} className="close-icon" />
      <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        className="webcam"
      />
      <TbHandClick onClick={capture} className="capture-icon" />
      <p className="capture-text">Capture</p>
    </div>
  );
};

export default CameraCapture;
