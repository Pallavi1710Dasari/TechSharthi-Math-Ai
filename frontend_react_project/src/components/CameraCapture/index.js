import React, { useRef } from 'react';
import Webcam from 'react-webcam';

const CameraCapture = ({ onCapture }) => {
  const webcamRef = useRef(null);

  const capture = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    onCapture(imageSrc);
  };

  return (
    <div className="camera-capture">
      <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        className="webcam"
      />
      <button onClick={capture} className="capture-button">Capture</button>
    </div>
  );
};

export default CameraCapture;
