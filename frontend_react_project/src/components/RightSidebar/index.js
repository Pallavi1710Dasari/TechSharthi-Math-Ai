import React from 'react';
import {Link} from "react-router-dom"
import './index.css'; // Import the CSS file for styling
 
const RightSidebar = ({cardsContainerClassName}) => {
    return (
        <div className={cardsContainerClassName}>
            <Link to="/students" className='link'>
                <div className="card">
                    <h3>🧑🏻‍🏫 For Students</h3>
                    <p>Prepare for exams and homework. Generate custom presentation outline and speaker notes for your presentations.</p>
                </div>
            </Link>
            <Link to="/researcher" className='link'>
                <div className="card">
                    <h3>🎓 For Researchers</h3>
                    <p>Upload research papers and get information you need with just one click. Summarize paper abstract.</p>
                </div>
            </Link>
        </div>
    );
};
 
export default RightSidebar;