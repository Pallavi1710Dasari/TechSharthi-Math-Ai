import './index.css';
import React, { useState } from 'react';
import Header from "../Header";
import Footer from "../Footer"; 
import '@fortawesome/fontawesome-free/css/all.min.css';
import ReactLoading from 'react-loading';
import { sendMessageToApi, uploadFileToApi } from '../../service/serviceApi';
import { FaFilePdf } from 'react-icons/fa6';
import Modal from 'react-modal';
import CameraCapture from '../CameraCapture';
import RightSidebar from '../RightSidebar';

// Set the app element for accessibility
Modal.setAppElement('#root');

function MainSection({ containerClassName, pdfpage, cardsContainerClassName}) {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [fileSelected, setFileSelected] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCameraCaptureOpen, setIsCameraCaptureOpen] = useState(false);

  const handleSendMessage = async () => {
    if (userInput.trim()) {
      const newMessage = { role: 'user', content: [{ type: 'text', text: userInput }] };
      setMessages(prevMessages => [...prevMessages, newMessage]);
      setUserInput('');
      setLoading(true);

      try {
        const response = await sendMessageToApi([...messages, newMessage]);

        if (response.messages) {
          const assistantMessageContent = response.messages
            .map(msg => msg.content.map(c => c.text || '').join(' '))
            .join('\n\n');

          const assistantMessage = {
            role: 'assistant',
            content: [{ type: 'text', text: assistantMessageContent }],
          };
          setMessages(prevMessages => [...prevMessages, assistantMessage]);
        }
      } catch (error) {
        console.error('Error sending message:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    setFileSelected(true);
    if (file) {
      setLoading(true);

      try {
        const response = await uploadFileToApi(file);

        if (response.image_url) {
          const newImageMessage = { role: 'user', content: [{ type: 'image_url', image_url: { url: response.image_url } }] };
          setMessages(prevMessages => [...prevMessages, newImageMessage]);
        } else if (response.image_urls) {
          const newImageMessages = response.image_urls.map(url => ({
            role: 'user', content: [{ type: 'image_url', image_url: { url } }],
          }));
          setMessages(prevMessages => [...prevMessages, ...newImageMessages]);
        }
      } catch (error) {
        console.error('Error uploading file:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCapture = async (imageSrc) => {
    setLoading(true);

    try {
      const response = await fetch(imageSrc);
      const blob = await response.blob();

      const file = new File([blob], 'captured-image.jpg', { type: 'image/jpeg' });
      const uploadResponse = await uploadFileToApi(file);

      if (uploadResponse.image_url) {
        const newImageMessage = {
          role: 'user',
          content: [{ type: 'image_url', image_url: { url: uploadResponse.image_url } }],
        };
        setMessages(prevMessages => [...prevMessages, newImageMessage]);
      }
    } catch (error) {
      console.error('Error capturing and uploading image:', error);
    } finally {
      setLoading(false);
      setIsCameraCaptureOpen(false); // Hide the camera capture UI after capturing
    }
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleCameraClick = () => {
    closeModal(); // Close the modal first, then show the camera capture UI
    setIsCameraCaptureOpen(true);
  };

  const handleCloseCameraCapture = () => {
    setIsCameraCaptureOpen(false);
  };

  const renderMessageContent = (content) => {
    if (content[0].type === 'text') {
      const formattedText = content[0].text.split('\n').map((str, index) => {
        const boldItalic = str.replace(/\*\*(.*?)\*\*/g, '<b><i>$1</i></b>') // Bold and Italic
                              .replace(/\*(.*?)\*/g, '<i>$1</i>') // Italic
                              .replace(/__(.*?)__/g, '<b>$1</b>'); // Bold
        return <p key={index} dangerouslySetInnerHTML={{ __html: boldItalic }} />;
      });
      return formattedText;
    } else if (content[0].type === 'image_url') {
      return <img src={content[0].image_url.url} alt="Uploaded" style={{ maxWidth: '100%' }} />;
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSendMessage();
    }
  };

  // Custom button styles
  const buttonStyle = {
    display: 'block',
    width: '100%',
    padding: '12px 0',
    margin: '10px 0',
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#fff',
    backgroundColor: '#007BFF', // Blue background for the buttons
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
  };

  const closeButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#dc3545', // Red background for the close button
  };

  return (
    <div>
      <div className={containerClassName}>
        {/*<Header />*/}
        <div id="chat-container">
          {pdfpage && !fileSelected && (
            <div className='upload-pdf-con'>
              <label id="file-upload-label" htmlFor="file-upload">
                <FaFilePdf />Upload PDF File Here
              </label>
              <input
                type="file"
                id="file-upload"
                accept=".pdf"
                onChange={handleFileChange}
              />
            </div>
          )}
          {messages.map((message, index) => (
            <div key={index} className={`message ${message.role}`}>
              {renderMessageContent(message.content)}
            </div>
          ))}
          {loading && (
            <div className="message assistant">
              <ReactLoading type="bubbles" color="#000" height={24} width={24} />
            </div>
          )}
        </div>
        <div id="input-container">
          <input
            type="text"
            id="user-input"
            placeholder="Hi! Ask me anything..."
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyPress={handleKeyPress} // Listen for the Enter key
          />
          {!pdfpage && (
            <>
              <label id="file-upload-label" onClick={openModal}>
                <i className="fas fa-plus"></i>
              </label>
              <Modal
                isOpen={isModalOpen}
                onRequestClose={closeModal}
                contentLabel="Upload Options"
                className="modal"
                overlayClassName="overlay"
                style={{
                  content: {
                    top: '200px', // Adjust as needed for better positioning
                    left: '50%',
                    right: 'auto',
                    bottom: 'auto',
                    transform: 'translateX(-50%)',
                    width: '350px', // Slightly wider for better spacing
                    padding: '25px', // Increase padding for more space inside
                    border: '2px solid #ccc', // Subtle border for better separation
                    borderRadius: '12px', // Slightly more rounded corners
                    backgroundColor: '#f9f9f9', // Light grey background for a softer look
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', // Add a shadow for depth
                  },
                  overlay: {
                    backgroundColor: 'rgba(0, 0, 0, 0.75)', // Darker overlay for more focus
                  },
                }}
              >
                <h2 style={{ 
                  fontSize: '20px', 
                  marginBottom: '20px', 
                  textAlign: 'center', 
                  color: '#333', 
                  fontFamily: 'Arial, sans-serif' 
                }}>
                  Select an Option
                </h2>
                <button 
                  onClick={() => document.getElementById('file-upload').click()} 
                  style={buttonStyle}>
                  Upload File
                </button>
                <button onClick={handleCameraClick} style={buttonStyle}>
                  Use Camera
                </button>
                <button onClick={closeModal} style={closeButtonStyle}>
                  Close
                </button>
              </Modal>

              <input
                type="file"
                id="file-upload"
                accept=".png,.jpg,.jpeg,.pdf"
                onChange={handleFileChange}
                style={{ display: 'none' }} // Hidden input, triggered by button
              />
            </>
          )}
          <button id="send-button" onClick={handleSendMessage}>
            <i className="fas fa-paper-plane"></i>
          </button>
        </div>
        <RightSidebar cardsContainerClassName={cardsContainerClassName}/>
        {isCameraCaptureOpen && (
          <div id="camera-capture" style={{ position: 'absolute', top: '50px', left: '50%', transform: 'translateX(-50%)' }}>
            <CameraCapture onCapture={handleCapture} onClose={handleCloseCameraCapture} />
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

export default MainSection;
