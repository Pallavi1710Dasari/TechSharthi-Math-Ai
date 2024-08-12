import {useState} from "react"
import {useNavigate} from "react-router-dom"
import { FaRegFilePdf } from "react-icons/fa6";
import { BsPersonWorkspace } from "react-icons/bs";
import { RiChatHistoryLine } from "react-icons/ri";
import { CgProfile } from "react-icons/cg";
import { CiSquarePlus } from "react-icons/ci";
import { MdOutlineCoPresent } from "react-icons/md";
import { FaPencilAlt } from "react-icons/fa";
import { MdKeyboardDoubleArrowRight } from "react-icons/md";
import { MdKeyboardDoubleArrowLeft } from "react-icons/md";
import techSharthiLogo from "../../public/techSharthiLogo.webp"
 
import "./index.css";
 
const SideBar = ({ isExpanded, onChangesidebar, sideClassName }) => {
  const navigate = useNavigate()
 
  const [selectedTab, setTab] = useState("tab1")
 
  const sidebarToggle = () => {
    onChangesidebar();
  };
 
const onClickPdf = () =>{
    setTab("tab2")
    navigate("/pdfpage")
}
 
const onPlusClick = () =>{
  navigate("/")
}
 
  return (
    <div className={`sidebar-container ${sideClassName}`}>
      <div className={`sidebar-background ${isExpanded ? "expanded" : ""}`}>
        <div className="card-icons">
        <div className="profile-success-container" style={{marginLeft: isExpanded && "30px"}}>
            <img
              className="logo"
              src={techSharthiLogo}
              alt="logo"
            />
            {isExpanded &&
            <div className="logo-text">
              <h1 className="title gradient-title">Equati<span className="subtitle gradient-subtitle">AI</span></h1>
            </div>  
            }
          </div>
          <div className="icons">
            <div className={`sidebar-item chat-icon ${selectedTab === "tab1" && "blue-icon"}`} onClick={onPlusClick}>
              <CiSquarePlus className="nav-item-mobile-link" />
              {isExpanded && <p className="sidebar-description">Chat</p>}
            </div>
            <div className={`sidebar-item ${selectedTab === "tab2" && "blue-icon"}`} onClick={onClickPdf}>
              <FaRegFilePdf className="nav-item-mobile-link" />
              {isExpanded && <p className="sidebar-description">Chat PDF</p>}
            </div>
            <div className="sidebar-item">
              <MdOutlineCoPresent className="nav-item-mobile-link" />
              {isExpanded && <p className="sidebar-description">AI Presentation</p>}
            </div>
            <div className="sidebar-item">
              <FaPencilAlt className="nav-item-mobile-link" />
              {isExpanded && <p className="sidebar-description">AI Writer</p>}
            </div>
            <div className="sidebar-item">
              <BsPersonWorkspace className="nav-item-mobile-link" />
              {isExpanded && <p className="sidebar-description">Workspace</p>}
            </div>
            <div className="sidebar-item">
              <RiChatHistoryLine className="nav-item-mobile-link" />
              {isExpanded && <p className="sidebar-description">Chat History</p>}
            </div>
          </div>
        </div>
        <div className="sidebar-item last-item">
        {!isExpanded && <CgProfile className="nav-item-mobile-link" />}  
        </div>
        {isExpanded && <div className="sidebar-footer">
          <button className="sidebar-button">Sign up / Log in</button>
        </div>}
      </div>
      <button className="sidebar-toggle-button" onClick={sidebarToggle}>
        {isExpanded ? <MdKeyboardDoubleArrowLeft/> : <MdKeyboardDoubleArrowRight/>}
      </button>
    </div>
  );
};
 
export default SideBar;