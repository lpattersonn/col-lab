import React from 'react';
import { Link, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse, faFolder, faGlobe, faStar, faCartArrowDown, faBullhorn } from '@fortawesome/free-solid-svg-icons';

export default function SideNavigation() {
    const location = useLocation();

    const isActive = (path) => {
        return location.pathname.includes(path);
    };

    return (
        <div className="side-navigation">
            {/* <Link 
                to="/dashboard" 
                className={isActive("/dashboard") ? "active" : ""}
            >
                <span className='icon-container'>
                    <FontAwesomeIcon icon={faHouse} />
                </span>
                Dashboard
            </Link> */}

            <Link 
                to="/collaborations" 
                className={isActive("/collaborations") ? "active" : ""}
            >
                <span className='icon-container'>
                    <FontAwesomeIcon icon={faFolder} />
                </span>
                Collaborations
            </Link>

            <Link 
                to="/contact-us" 
                className={isActive("/contact-us") ? "active" : ""}
            >
                <span className='icon-container'>
                    <FontAwesomeIcon icon={faGlobe} />
                </span>
                Get Help
            </Link>

            <Link 
                to="/mentorship-opportunities" 
                className={isActive("/mentorship-opportunities") ? "active" : ""}
            >
                <span className='icon-container'>
                    <FontAwesomeIcon icon={faStar} />
                </span>
                Mentorships
            </Link>

            <Link 
                to="/borrow-items" 
                className={isActive("/borrow-items") ? "active" : ""}
            >
                <span className='icon-container'>
                    <FontAwesomeIcon icon={faBullhorn} />
                </span>
                Share Resources
            </Link>

            <Link 
                to="/jobs" 
                className={isActive("/jobs") ? "active" : ""}
            >
                <span className='icon-container'>
                    <FontAwesomeIcon icon={faBullhorn} />
                </span>
                Explore Jobs
            </Link>

            <Link 
                to="/learning-center" 
                className={isActive("/learning-center") ? "active" : ""}
            >
                <span className='icon-container'>
                    <FontAwesomeIcon icon={faCartArrowDown} />
                </span>
                Learning Center
            </Link>
        </div>
    );
}
