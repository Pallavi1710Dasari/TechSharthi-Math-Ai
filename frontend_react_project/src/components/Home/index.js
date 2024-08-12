import './index.css';
import React, { useState } from 'react';
import SideBar from "../SideBar/index.js"
import MainSection from '../MainSection';
//import RightSidebar from '../RightSidebar/index.js';

function Home() {
    const [isExpanded, setExpand] = useState(false);
    const onChangesidebar = () => {
        setExpand(!isExpanded);
      };

    let sideClassName = isExpanded ? "sidebar-opened" : "sidebar-closed";
    let containerClassName = isExpanded ? "body-container-with-full-sidebar" : "body-container-without-full-sidebar";
    let cardsContainerClassName = isExpanded ? "cards-container-with-full-sidebar" : "cards-container-without-full-sidebar"
 

    return(
        <div className='home-con'>
            <SideBar sideClassName={sideClassName} onChangesidebar={onChangesidebar} isExpanded={isExpanded} />
            <MainSection containerClassName={containerClassName} cardsContainerClassName={cardsContainerClassName}/>
            {/*<RightSidebar/>*/}
        </div>
    )
}
export default Home;
