import React from 'react';
import { Link, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse, faFolder, faCircleQuestion, faStar, faCartArrowDown, faBullhorn, faGraduationCap, faBriefcase } from '@fortawesome/free-solid-svg-icons';

export default function SideNavigation() {
    const location = useLocation();

    const isActive = (path) => {
        return location.pathname.startsWith(path);
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
                    <FontAwesomeIcon icon={faBullhorn} />
                </span>
                Collaborations
            </Link>

            <Link 
                to="/get-help" 
                className={isActive("/get-help") ? "active" : ""}
            >
                <span className='icon-container'>
                    <FontAwesomeIcon icon={faCircleQuestion} />
                </span>
                Get Help
            </Link>

            <Link 
                to="/mentorships" 
                className={isActive("/mentorships") ? "active" : ""}
            >
                <span className='icon-container'>
                    <FontAwesomeIcon icon={faStar} />
                </span>
                Mentorships
            </Link>

            <Link 
                to="/share-resources" 
                className={isActive("/share-resources") ? "active" : ""}
            >
                <span className='icon-container'>
                    <FontAwesomeIcon icon={faCartArrowDown} />
                </span>
                Share Resources
            </Link>

            <Link 
                to="/jobs" 
                className={isActive("/jobs") ? "active" : ""}
            >
                <span className='icon-container'>
                    <FontAwesomeIcon icon={faBriefcase} />
                </span>
                Explore Jobs
            </Link>

            <Link 
                to="/learning-center" 
                className={isActive("/learning-center") ? "active" : ""}
            >
                <span className='icon-container'>
                    <FontAwesomeIcon icon={faGraduationCap} />
                </span>
                Learning Center
            </Link>
        </div>
    );
}
