import React from 'react';
import {Link} from "react-router-dom"
import './index.css'; // Import the CSS file for styling
 
const RightSidebar = ({isSidebarExtended}) => {
    return (
        <div style={{width:"75vw", backgroundColor:"transparent", height: '60vh', backgroundSize: 'cover', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
            <Link to="/students" className='link'>
                <div className="card" style={{width: isSidebarExtended ? "18vw" : "19vw"}}>
                    <h3>🧑🏻‍🏫 For Students</h3>
                    <p>Prepare for exams and homework. Generate custom presentation outline and speaker notes for your presentations.</p>
                </div>
            </Link>
            <Link to="/researcher" className='link'>
                <div className="card" style={{width: isSidebarExtended ? "18vw" : "19vw",}}>
                    <h3>🎓 For Researchers</h3>
                    <p>Upload research papers and get information you need with just one click. Summarize paper abstract.</p>
                </div>
            </Link>
            <Link to="/researcher" className='link'>
                <div className="card" style={{width: isSidebarExtended ? "18vw" : "19vw",}}>
                    <h3>💼 For Professionals</h3>
                    <p>Create an onboarding manual and training materials.Read contracts and financial reports 10X faster.</p>
                </div>
            </Link>
        </div>
    );
};
 
export default RightSidebar;