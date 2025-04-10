import React, { useState, useEffect } from 'react';
import Navigation from './Navigation';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSuitcase, faCoins, faMoneyBill, faHouse, faPen } from '@fortawesome/free-solid-svg-icons';
import { TailSpin } from "react-loader-spinner";
import ReactPaginate from 'react-paginate';
import { Tab, initMDB } from "mdb-ui-kit";
import UserComment from "../Images/user-comment.svg";
import axios from 'axios';
import { submitReport, renderedQuestion } from '../helper';

export default function LearningCenter() {
    const userDetails = JSON.parse(localStorage.getItem('userDetails'));
    const [ search, setSearch ] = useState('');
    const [ collaborations, setCollaborations ] = useState([]);
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState([]);

    useEffect(() => {
        Promise.all([
            axios({
                url: `${process.env.REACT_APP_API_URL}/wp-json/wp/v2/learning-center`,
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${userDetails.token}`
                }
            }),
            axios.get(`${process.env.REACT_APP_API_URL}/wp-json/wp/v2/users`, 
                {
                    headers: {
                        Authorization: `Bearer ${userDetails.token}`
                      }
                }
            )
        ])
        .then(([allLearningItems, allUsers]) => {
            initMDB({ Tab });
            // Set learning center items
            setCollaborations(allLearningItems?.data);

            // Set all users
            setUsers(allUsers.data);

            setLoading(false);
        })
        .catch((error) => {
            console.error(error);
        })
    }, []);
    
    // Start paginated active jobs
function ActiveItem({ currentItems }) {
    const [optionDisplay, setOptionDisplay] = useState({});
    let [buttonClick, setButtonClick] = useState(0);

    const handleToggleOptions = (index) => {
        setOptionDisplay(prevState => ({
            ...prevState,
            [index]: prevState[index] === 'show' ? 'hide' : 'show'
        }));
    };

    const handleHideCollaboration = (index) => {
        setButtonClick(prev => prev + 1); // Trigger a re-render by updating state
    };

    return (
      <>
        {currentItems.map((collaboration, index) => {

            let showOpportunity =  localStorage.getItem(`show_learning${index}`);
        
            let posted = Date.now() - new Date(collaboration.date);
            // let days = Math.floor(posted/(86400 * 1000));

            // Calculate total days
            let totalDays = Math.floor(posted / (86400 * 1000));

            // Calculate years
            let years = Math.floor(totalDays / 365);

            // Calculate remaining days after extracting years
            let remainingDaysAfterYears = totalDays % 365;

            // Calculate months
            let months = Math.floor(remainingDaysAfterYears / 30);

            // Calculate remaining days after extracting months
            let days = remainingDaysAfterYears % 30;

            let userProfile = "";
    
            for (let name of users) {
                if ( name.id == collaboration.author) {
                userProfile = name;
                }
            }

            function commentCount() {
            return axios.get(`${collaboration._links.replies['0'].href}`)
            .then((response) => {
                localStorage.setItem(`learning_count${index}`, response.data.length);
            }).catch((err) => {});
            }

            commentCount();

            // Toggle option display

            let dateNow = new Date();
            let deadLine = new Date(collaboration?.acf?.learning_deadline);

            if (dateNow < deadLine) {
                if (search.length > 0 && collaboration?.name?.toLowerCase().includes(`${search?.toLowerCase()}`) || collaboration?.title?.rendered?.toLowerCase().includes(search?.toLowerCase()) || collaboration?.acf?.learning_pay?.toLowerCase().includes(search?.toLowerCase())) {     
                    return ( 
                            <div className={`${showOpportunity} mb-4 col-lg-6`} key={index}>
                                <div className="card collaboration">
                                    <div className="card-body">
                                    {/* Top Section */}
                                        <div className="collaboration-header">
                                            <div className="d-flex flex-direction-row">
                                                <div className="d-flex" style={{marginRight: "6rem"}}>
                                                    <div>
                                                        <img className="collaboration-details-name-img" src={userProfile?.acf?.user_profile_picture} alt={userProfile.name} loading="lazy" />
                                                    </div>
                                                    <div>
                                                        <p className="my-0"><strong>{userProfile?.name}</strong> | {userProfile?.acf?.["user-job-Insitution"]} | {userProfile?.acf?.["user-country-of-residence"]}</p>
                                                        <div className="d-flex flex-row align-items-center" >
                                                            <span className="option-button" style={{marginRight: ".5rem"}}></span><p style={{marginBottom: 0}}>{years > 0 ? `${years} years ago` : months > 0 ? `${months} months ago` : days == 0 ? "Posted today" : `${days} days ago`}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="options-container">
                                                <div className='d-flex flex-direction-row justify-content-end options' onClick={() => handleToggleOptions(index)}>
                                                    <div className="option-button"></div>
                                                    <div className="option-button"></div>
                                                    <div className="option-button"></div>
                                                </div>
                                                <div className={`option-items ${optionDisplay[index]}`}>
                                                    <div className="option-item" onClick={() => {
                                                        localStorage.setItem(`show_learning${index}`, 'hide')
                                                        handleHideCollaboration(index)
                                                        }}>Hide</div>
                                                    <div className="option-item" onClick={()=>{
                                                        submitReport(collaboration, userDetails);
                                                    }}>Report</div>
                                                </div>
                                            </div>
                                        </div>
                                        {/* Middle Section */}
                                        <div style={{marginBottom: "1.8rem"}}>
                                            <h3 style={{fontSize: "1.4rem", marginBottom: "1.5rem"}}>{collaboration?.acf?.learning_description}</h3>
                                            <div>{collaboration?.acf?.learning_features?.length > 250 ? collaboration?.acf?.learning_features?.slice(0, 250)+"..." : collaboration?.acf?.learning_features}</div>
                                            <div className="d-flex flex-direction-row mt-4">
                                                <div className="designation-button">
                                                    <span className="small">{collaboration?.acf?.["learning_pay"]}</span>
                                                </div>
                                                <div className="due-button">
                                                    <span className="small">Deadline {collaboration?.acf?.["learning_deadline"]}</span>
                                                </div>
                                            </div>
                                        </div>
                                        {/* Bottom Section */}
                                        <div className="row d-flex justify-content-between flex-row">                                        
                                            <div className="mt-2 col-auto d-flex flex-row align-items-center p-0" style={{marginRight: "6rem"}}><img src={UserComment} className="collaboration-icon" alt="Collaboration icon" style={{width: "3rem", paddingRight: ".3rem"}} /> {localStorage.getItem(`learning_count${index}`)} people responded to this</div>
                                            {userDetails.id != collaboration.author ?
                                            <div className="col-auto ml-auto">
                                                <a href={`/collaboration-chat/${collaboration.id}`} className="btn btn-primary collab-btn">Chat</a>
                                            </div>
                                            : ""
                                            }
                                        </div>
                                    </div>
                                </div>
                            </div>
                    )
                }
            }
         }
    )}
      </>
    );
  }
  
  function ActivePaginatedLearning({ itemsPerPage }) {
    // Here we use item offsets; we could also use page offsets
    // following the API or data you're working with.
    const [itemOffset, setItemOffset] = useState(0);
  
    // Simulate fetching items from another resources.
    // (This could be items from props; or items loaded in a local state
    // from an API endpoint with useEffect and useState)
    const endOffset = itemOffset + itemsPerPage;

    
    const currentItems = collaborations.slice(itemOffset, endOffset);
    const pageCount = Math.ceil(collaborations.length / itemsPerPage);
  
    // Invoke when user click to request another page.
    const handlePageClick = (event) => {
      const newOffset = (event.selected * itemsPerPage) % collaborations.length;

      setItemOffset(newOffset);
    };
  
    return (
      <>
        <div className='row d-flex'>
            <ActiveItem currentItems={currentItems} />
        </div>
        <div className="col-12">
            <ReactPaginate
            breakLabel="..."
            nextLabel="»"
            onPageChange={handlePageClick}
            pageRangeDisplayed={3}
            pageCount={pageCount}
            previousLabel="«"
            renderOnZeroPageCount={null}
            />
        </div>
      </>
    );
    
  }
  
// End paginated active jobs

    // Start paginated expired jobs
    function ExpiredItem({ currentItems }) {
        const [optionDisplay, setOptionDisplay] = useState({});
        let [buttonClick, setButtonClick] = useState(0);
    
        const handleToggleOptions = (index) => {
            setOptionDisplay(prevState => ({
                ...prevState,
                [index]: prevState[index] === 'show' ? 'hide' : 'show'
            }));
        };
    
        const handleHideCollaboration = (index) => {
            setButtonClick(prev => prev + 1); // Trigger a re-render by updating state
        };
    
        return (
          <>
            {currentItems.map((collaboration, index) => {
    
                let showOpportunity =  localStorage.getItem(`show_learning${index}`);
            
                let posted = Date.now() - new Date(collaboration.date);
                // let days = Math.floor(posted/(86400 * 1000));
    
                // Calculate total days
                let totalDays = Math.floor(posted / (86400 * 1000));
    
                // Calculate years
                let years = Math.floor(totalDays / 365);
    
                // Calculate remaining days after extracting years
                let remainingDaysAfterYears = totalDays % 365;
    
                // Calculate months
                let months = Math.floor(remainingDaysAfterYears / 30);
    
                // Calculate remaining days after extracting months
                let days = remainingDaysAfterYears % 30;
    
                let userProfile = "";
        
                for (let name of users) {
                    if ( name.id == collaboration.author) {
                    userProfile = name;
                    }
                }
    
                function commentCount() {
                return axios.get(`${collaboration._links.replies['0'].href}`)
                .then((response) => {
                    localStorage.setItem(`learning_count${index}`, response.data.length);
                }).catch((err) => {});
                }
    
                commentCount();
    
                // Toggle option display
    
                let dateNow = new Date();
                let deadLine = new Date(collaboration?.acf?.learning_deadline);
    
                if (dateNow > deadLine) {
                    if (search.length > 0 && collaboration?.name?.toLowerCase().includes(`${search?.toLowerCase()}`) || collaboration?.title?.rendered?.toLowerCase().includes(search?.toLowerCase()) || collaboration?.acf?.learning_pay?.toLowerCase().includes(search?.toLowerCase())) {     
                        return ( 
                                <div className={`${showOpportunity} mb-4 col-lg-6`} key={index}>
                                    <div className="card collaboration">
                                        <div className="card-body">
                                        {/* Top Section */}
                                            <div className="collaboration-header">
                                                <div className="d-flex flex-direction-row">
                                                    <div className="d-flex" style={{marginRight: "6rem"}}>
                                                        <div>
                                                            <img className="collaboration-details-name-img" src={userProfile?.acf?.user_profile_picture} alt={userProfile.name} loading="lazy" />
                                                        </div>
                                                        <div>
                                                            <p className="my-0"><strong>{userProfile?.name}</strong> | {userProfile?.acf?.["user-job-Insitution"]} | {userProfile?.acf?.["user-country-of-residence"]}</p>
                                                            <div className="d-flex flex-row align-items-center" >
                                                                <span className="option-button" style={{marginRight: ".5rem"}}></span><p style={{marginBottom: 0}}>{years > 0 ? `${years} years ago` : months > 0 ? `${months} months ago` : days == 0 ? "Posted today" : `${days} days ago`}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="options-container">
                                                    <div className='d-flex flex-direction-row justify-content-end options' onClick={() => handleToggleOptions(index)}>
                                                        <div className="option-button"></div>
                                                        <div className="option-button"></div>
                                                        <div className="option-button"></div>
                                                    </div>
                                                    <div className={`option-items ${optionDisplay[index]}`}>
                                                        <div className="option-item" onClick={() => {
                                                            localStorage.setItem(`show_learning${index}`, 'hide')
                                                            handleHideCollaboration(index)
                                                            }}>Hide</div>
                                                        <div className="option-item" onClick={()=>{
                                                            submitReport(collaboration, userDetails);
                                                        }}>Report</div>
                                                    </div>
                                                </div>
                                            </div>
                                            {/* Middle Section */}
                                            <div style={{marginBottom: "1.8rem"}}>
                                                <h3 style={{fontSize: "1.4rem", marginBottom: "1.5rem"}}>{collaboration?.acf?.learning_description}</h3>
                                                <div>{collaboration?.acf?.learning_features?.length > 250 ? collaboration?.acf?.learning_features?.slice(0, 250)+"..." : collaboration?.acf?.learning_features}</div>
                                                <div className="d-flex flex-direction-row mt-4">
                                                    <div className="designation-button">
                                                        <span className="small">{collaboration?.acf?.["learning_pay"]}</span>
                                                    </div>
                                                    <div className="due-button">
                                                        <span className="small">Deadline {collaboration?.acf?.["learning_deadline"]}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            {/* Bottom Section */}
                                            <div className="row d-flex justify-content-between flex-row">                                        
                                                <div className="mt-2 col-auto d-flex flex-row align-items-center p-0" style={{marginRight: "6rem"}}><img src={UserComment} className="collaboration-icon" alt="Collaboration icon" style={{width: "3rem", paddingRight: ".3rem"}} /> {localStorage.getItem(`learning_count${index}`)} people responded to this</div>
                                                {userDetails.id != collaboration.author ?
                                                <div className="col-auto ml-auto">
                                                    <a href={`/collaboration-chat/${collaboration.id}`} className="btn btn-primary collab-btn">Chat</a>
                                                </div>
                                                : ""
                                                }
                                            </div>
                                        </div>
                                    </div>
                                </div>
                        )
                    }
                }
             }
        )}
          </>
        );
      }
      
      function ExpiredPaginatedLearning({ itemsPerPage }) {
        // Here we use item offsets; we could also use page offsets
        // following the API or data you're working with.
        const [itemOffset, setItemOffset] = useState(0);
      
        // Simulate fetching items from another resources.
        // (This could be items from props; or items loaded in a local state
        // from an API endpoint with useEffect and useState)
        const endOffset = itemOffset + itemsPerPage;
    
        
        const currentItems = collaborations.slice(itemOffset, endOffset);
        const pageCount = Math.ceil(collaborations.length / itemsPerPage);
      
        // Invoke when user click to request another page.
        const handlePageClick = (event) => {
          const newOffset = (event.selected * itemsPerPage) % collaborations.length;
    
          setItemOffset(newOffset);
        };
      
        return (
          <>
            <div className='row d-flex'>
                <ExpiredItem currentItems={currentItems} />
            </div>
            <div className="col-12">
                <ReactPaginate
                breakLabel="..."
                nextLabel="»"
                onPageChange={handlePageClick}
                pageRangeDisplayed={3}
                pageCount={pageCount}
                previousLabel="«"
                renderOnZeroPageCount={null}
                />
            </div>
          </>
        );
        
      }
      
    // End paginated active jobs

    if (userDetails !== null) {
        if (loading === false) {
    return (
        <>
            <Navigation />
            <main className='collaborations'>
                <div className='container primary'>
                    <div className='get-help-details'>
                        <div className="row mb-5">
                            <div className="col-6 d-flex align-item-center">
                                <Link to="/" className="link-dark small d-flex align-items-center"><FontAwesomeIcon icon={faHouse} /></Link><span className="breadcrumb-slash d-flex align-items-center">>></span><span className="small d-flex align-items-center">Learning Center</span>
                            </div>
                        </div>
                        <div className="row mb-5">
                            <div className="col-lg-12">
                                <p className="lead"><strong>Teaching reinforces knowledge. Train your peers and earn a certificate of expertise to show off your skills!</strong></p>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-lg-4">
                                <p><strong>Browse all teaching opportunities</strong></p>
                            </div>
                            <div className="col-lg-4">
                                <input type="search" name="search" className="form-control" placeholder='Start typing to search' value={search} onChange={(e) => {
                                    setSearch(e.target.value)
                                }} />
                            </div>
                            <div className="col-lg-4 text-end">
                                <Link to="/learning-request" className="btn btn-outline-info btn-lg">Learn A New Skill</Link>
                            </div>
                        </div>
                    </div>

                    <div className="mentors mt-5">
                        <ul className="nav nav-tabs mb-5" id="ex1" role="tablist">
                            <li className="nav-item" role="presentation">
                                <a data-mdb-tab-init className="nav-link active" id="learning-tab-1" href="#learning-tabs-1" role="tab" aria-controls="learning-tabs-1" aria-selected="true" >Active Requests</a>
                            </li>
                            <li className="nav-item" role="presentation">
                                <a data-mdb-tab-init className="nav-link" id="learning-tab-2" href="#learning-tabs-2" role="tab" aria-controls="learning-tabs-2" aria-selected="false" >Archived</a>
                            </li>
                        </ul>
                        <div className="tab-content" id="ex1-content">
                            <div className="tab-pane fade show active" id="learning-tabs-1" role="tabpanel" aria-labelledby="learning-tab-1">
                                <ActivePaginatedLearning itemsPerPage={15} />
                            </div>
                            <div className="tab-pane fade" id="learning-tabs-2" role="tabpanel" aria-labelledby="learning-tab-2">
                                <ExpiredPaginatedLearning itemsPerPage={15} />
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </>
    )
} else {
        return (
          <TailSpin
          visible={true}
          height="80"
          width="80"
          color="#0f9ed5"
          ariaLabel="tail-spin-loading"
          radius="1"
          wrapperStyle={{position: "absolute", top: 0, left: 0, right: 0, left: 0}}
          wrapperClass="spinner"
          />
        )
      }
    } else {
        window.location.replace('/')
    }
}

