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
import backgroundImage from "../../public/backgroundImage.jpeg";

// Set the app element for accessibility
Modal.setAppElement('#root');

function MainSection({ containerClassName, pdfpage, isSidebarExtended }) {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [fileSelected, setFileSelected] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCameraCaptureOpen, setIsCameraCaptureOpen] = useState(false);
  const [showChat, setShowChat] = useState(false); // State to control whether to show chat

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

  const handleStartChat = () => {
    setShowChat(true);
  };

  return (
    <div>
      <div className={containerClassName}>
        {!showChat ? (
          <div>
          <div 
            id="background-container" 
            style={{
              backgroundImage: `url(${backgroundImage})`, 
              width: isSidebarExtended ? "65vw" : "75vw", 
              borderRadius: "10px", 
              height: '60vh', 
              margin: "10px", 
              backgroundSize: 'cover', 
              display: 'flex', 
              flexDirection: 'column', 
              justifyContent: 'center', 
              alignItems: 'center', 
              overflow: "hidden", 
              padding: "15px"
            }}
          >
            <RightSidebar isSidebarExtended={isSidebarExtended} /> 
            <button 
              onClick={handleStartChat} 
              style={{ 
                padding: '10px 20px', 
                fontSize: '18px', 
                cursor: 'pointer', 
                borderRadius: '5px', 
                backgroundColor: '#007BFF', 
                color: '#fff' 
              }}
            >
              Start Chat
            </button>
          </div>
          <Footer />
          </div>
        ) : (
          <div id="chat-container">
            {pdfpage && !fileSelected && (
              <div className='upload-pdf-con'>
                <label id="file-upload-label" htmlFor="file-upload">
                  <FaFilePdf /> Upload PDF File Here
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
        )}
        {showChat && (
          <>
            <div id="input-container" style={{width: isSidebarExtended ? "55vw" : "75vw", margin:"20px",}}>
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
                        borderRadius: '12px', // Rounder corners for a softer look
                        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', // Softer shadow for depth
                      },
                    }}
                  >
                    <div>
                      <h2>Choose Upload Method</h2>
                      <button style={buttonStyle}>
                        <label htmlFor="file-upload">
                          <i className="fas fa-file"></i> Upload File
                        </label>
                        <input
                          type="file"
                          id="file-upload"
                          accept="image/*"
                          onChange={handleFileChange}
                          style={{ display: 'none' }}
                        />
                      </button>
                      <button onClick={handleCameraClick} style={buttonStyle}>
                        <i className="fas fa-camera"></i> Capture Photo
                      </button>
                      <button onClick={closeModal} style={closeButtonStyle}>
                        <i className="fas fa-times"></i> Close
                      </button>
                    </div>
                  </Modal>
                  {isCameraCaptureOpen && (
                    <CameraCapture
                      onCapture={handleCapture}
                      onClose={handleCloseCameraCapture}
                    />
                  )}
                </>
              )}
              <button
                id="send-button"
                onClick={handleSendMessage}
                disabled={!userInput.trim() && !fileSelected} // Disable button if input is empty and no file is selected
              >
                <i className="fas fa-paper-plane"></i>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default MainSection;
