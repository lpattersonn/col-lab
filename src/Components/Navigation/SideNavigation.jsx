import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse, faFolder, faGlobe, faStar, faCartArrowDown, faBullhorn } from '@fortawesome/free-solid-svg-icons';

export default function SideNavigation() {
    return (
        <>
            <div className="side-navigation">
                <Link to="/dashboard"><span className='icon-container'><FontAwesomeIcon icon={faHouse} /></span>Dashboard</Link>
                <Link to="/collaborations"><span className='icon-container'><FontAwesomeIcon icon={faFolder} /></span>Collaboations</Link>
                <Link to="/contact-us"><span className='icon-container'><FontAwesomeIcon icon={faGlobe} /></span>Get Help</Link>
                <Link to="/mentorship-opportunities"><span className='icon-container'><FontAwesomeIcon icon={faStar} /></span>Mentorships</Link>
                <Link to="/borrow-items"><span className='icon-container'><FontAwesomeIcon icon={faBullhorn} /></span>Share Resources</Link>
                <Link to="/jobs"><span className='icon-container'><FontAwesomeIcon icon={faBullhorn} /></span>Explore Jobs</Link>
                <Link to="/learning-center"><span className='icon-container'><FontAwesomeIcon icon={faCartArrowDown} /></span>Learning Center</Link>
            </div>
        </>
    );
}