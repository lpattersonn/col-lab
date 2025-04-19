import React, { useState, useEffect } from 'react';
import Navigation from './Navigation';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse } from '@fortawesome/free-solid-svg-icons';
import { TailSpin } from "react-loader-spinner";
import ReactPaginate from 'react-paginate';
import UserComment from "../Images/user-comment.svg";
import axios from 'axios';
import { submitReport, renderedQuestion, humanReadableDate } from '../helper';

export default function LearningCenter() {

    // Could add to context 
    const userDetails = JSON.parse(localStorage.getItem('userDetails'));

    // Could turn in to a component
    const [ search, setSearch ] = useState('');

    const [ collaborations, setCollaborations ] = useState([]);
    const [ allLearningChat, setAllLearningChat] = useState([]);

    const [loading, setLoading] = useState(true);

    // Could query in the helper function and import list
    const [users, setUsers] = useState([]);

    const [activeTab, setActiveTab] = useState("active");

    const Navigate = useNavigate();

    useEffect( () => {
        Promise.all([
            // All learning center items
            axios({
                url: `${process.env.REACT_APP_API_URL}/wp-json/wp/v2/learning-center`,
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${userDetails.token}`
                }
            }),
            // All users
            axios.get(`${process.env.REACT_APP_API_URL}/wp-json/wp/v2/users`, 
                {
                    headers: {
                        Authorization: `Bearer ${userDetails.token}`
                      }
                }
            ),
            // All chats
            axios({
                url: `${process.env.REACT_APP_API_URL}/wp-json/wp/v2/learning-center-chat`,
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${userDetails.token}`
                }
            }),
        ])
        .then(([allLearningItems, allUsers, learningCenterChat]) => {
            // Set learning center items
            setCollaborations(allLearningItems?.data);
            // Set all users
            setUsers(allUsers.data);
            // Learning chat
            setAllLearningChat(learningCenterChat?.data);
            // Set loading 
            setLoading(false);
        })
        .catch((error) => {
            console.error(error);
        });
    }, []);
    
    // Start paginated active jobs
    function ActiveItem({ currentItems }) {
        // State variables
        const [optionDisplay, setOptionDisplay] = useState({});
        const [buttonClick, setButtonClick] = useState(0);

        // Toggle item options
        const handleToggleOptions = (index) => {
            setOptionDisplay(prevState => ({
                ...prevState,
                [index]: prevState[index] === 'show' ? 'hide' : 'show'
            }));
        };

        // Update state
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

                // Requestor profile
                let requestorProfile = "";
                for (let name of users) {
                    if ( name.id == collaboration.author) {
                        requestorProfile = name;
                    }
                }

                // User profile
                let userProfile = "";
                for (let name of users) {
                    if ( name?.id == userDetails?.id) {
                        userProfile = name;
                    }
                }

                // Get the ID
                let chatID = undefined;

                // Get chat message counts
                let count = 0;

                allLearningChat?.map((chat) => {
                    if (chat?.acf?.requestor_id == requestorProfile?.id) {
                        count++;
                    }
                    if (chat?.acf?.request_id == collaboration?.id && userDetails?.id === chat?.acf?.participant_id && Number(collaboration?.author) === chat?.acf?.requestor_id) {
                        chatID = chat?.id;
                    }
                });
                
                // Create Collaboration chat 
                const createMentorChat = async (e) => {
                    try {
                        const createChat = await axios.post(`${process.env.REACT_APP_API_URL}/wp-json/wp/v2/learning-center-chat`,
                            {
                                author: userDetails.id,
                                title: `New Collaboration Request For ${collaboration?.title?.rendered} Requestee: ${userDetails?.displayName} Requestor: ${requestorProfile?.displayName}`,
                                content: `New Collaboration Request For ${collaboration?.title?.rendered} Requestee: ${userDetails?.displayName} Requestor: ${requestorProfile?.displayName}`,
                                excerpt: `New Collaboration Request For ${collaboration?.title?.rendered} Requestee: ${userDetails?.displayName} Requestor: ${requestorProfile?.displayName}`,
                                status: 'publish',
                                acf: {
                                    'requestor_id': collaboration?.author,
                                    'requestor_name': requestorProfile?.name,
                                    'requestor_image': requestorProfile?.avatar_urls?.['48'],
                                    'participant_id': userProfile?.id,
                                    'participant_name': userProfile?.name,
                                    'participant_image': userProfile?.avatar_urls?.['48'],
                                    'request_id': collaboration?.id,
                                    'request_title': collaboration?.title?.rendered,
                                }
                            },
                            {
                                headers: {
                                    Authorization: `Bearer ${userDetails.token}`
                                }
                            }
                        ).then((response) => {
                                Navigate(`/learning-center-chat/${response?.data?.id}`);
                            }
                        ).catch((err) => {})
                
                    } catch (err) {
                
                    }
                };

                let dateNow = new Date();
                let deadLine = new Date(collaboration?.acf?.deadline);

                // Show the currect action
                let LearningButton = () => {
                    if (userDetails.id != collaboration.author) { 
                        if (chatID != undefined) {
                            return (<div className="col-auto">
                                <a href={`/learning-center-chat/${chatID}`} className="btn btn-primary collab-btn">Return To Chat</a>
                            </div>);
                        } else {
                            return (<div className="col-auto">
                                <button className="btn btn-primary collab-btn" onClick={createMentorChat} aria-label="Collaboration button">Collaborate</button>
                            </div>);
                        }
                    };
                }

                if (dateNow < deadLine) {
                    if (search.length > 0 && collaboration?.name?.toLowerCase().includes(`${search?.toLowerCase()}`) || collaboration?.title?.rendered?.toLowerCase().includes(search?.toLowerCase()) || collaboration?.acf?.pay?.toLowerCase().includes(search?.toLowerCase())) {     
                        return ( 
                            <div className={`${showOpportunity} mb-4 col-lg-6`} key={index}>
                                <div className="card collaboration">
                                    <div className="card-body">
                                    {/* Top Section */}
                                        <div className="collaboration-header">
                                            <div className="d-flex flex-direction-row">
                                                <div className="d-flex" style={{marginRight: "6rem"}}>
                                                    <div>
                                                        <img className="collaboration-details-name-img" src={requestorProfile?.acf?.user_profile_picture} alt={requestorProfile.name} loading="lazy" />
                                                    </div>
                                                    <div>
                                                        <p className="my-0"><strong>{requestorProfile?.name}</strong> | {requestorProfile?.acf?.["user-job-Insitution"]} | {requestorProfile?.acf?.["user-country-of-residence"]}</p>
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
                                        <div style={{marginBottom: "1.5rem"}}>
                                            <div style={{fontSize: "1.4rem", marginBottom: "1.5rem", fontWeight: "700"}} dangerouslySetInnerHTML={{ __html: search.length > 0 ? renderedQuestion(collaboration?.acf?.description, search) : collaboration?.acf?.description}} />
                                            <div className="d-flex flex-direction-row mt-3 mb-4">
                                                <div className="designation-button">
                                                    <span className="small">{collaboration?.acf?.["pay"]}</span>
                                                </div>
                                                <div className="due-button">
                                                    <span className="small">Deadline {humanReadableDate(collaboration?.acf?.["deadline"])}</span>
                                                </div>
                                            </div>
                                            <div>{collaboration?.acf?.features?.length > 250 ? collaboration?.acf?.features?.slice(0, 250)+"..." : collaboration?.acf?.features}</div>
                                        </div>
                                        {/* Bottom Section */}
                                        <div className="row d-flex justify-content-between flex-row">                                        
                                            <div className="col-auto d-flex flex-row align-items-center p-0" style={{marginRight: "6rem"}}><img src={UserComment} className="collaboration-icon" alt="Collaboration icon" style={{width: "3rem", paddingRight: ".3rem"}} /> {count} {count == 1 ? "person responded to this." : "people responded to this."}</div>
                                            { LearningButton() }
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
    
                // Requestor profile
                let requestorProfile = "";
                for (let name of users) {
                    if ( name.id == collaboration.author) {
                        requestorProfile = name;
                    }
                }

                // User profile
                let userProfile = "";
                for (let name of users) {
                    if ( name?.id == userDetails?.id) {
                        userProfile = name;
                    }
                }

                // Get the ID
                let chatID = undefined;
                let count = 0;

                allLearningChat?.map((chat) => {
                    if (chat?.acf?.requestor_id == requestorProfile?.id) {
                        count++;
                    }
                    if (chat?.acf?.request_id == collaboration?.id && userDetails?.id === chat?.acf?.participant_id && Number(collaboration?.author) === chat?.acf?.requestor_id) {
                        chatID = chat?.id;
                    }
                });
    
                // Toggle option display
    
                let dateNow = new Date();
                let deadLine = new Date(collaboration?.acf?.deadline);
    
                if (dateNow > deadLine) {
                    if (search.length > 0 && collaboration?.name?.toLowerCase().includes(`${search?.toLowerCase()}`) || collaboration?.title?.rendered?.toLowerCase().includes(search?.toLowerCase()) || collaboration?.acf?.pay?.toLowerCase().includes(search?.toLowerCase())) {     
                        return ( 
                            <div className={`${showOpportunity} mb-4 col-lg-6`} key={index}>
                                <div className="card collaboration">
                                    <div className="card-body">
                                    {/* Top Section */}
                                        <div className="collaboration-header">
                                            <div className="d-flex flex-direction-row">
                                                <div className="d-flex" style={{marginRight: "6rem"}}>
                                                    <div>
                                                        <img className="collaboration-details-name-img" src={requestorProfile?.acf?.user_profile_picture} alt={requestorProfile?.name} loading="lazy" />
                                                    </div>
                                                    <div>
                                                        <p className="my-0"><strong>{requestorProfile?.name}</strong> | {requestorProfile?.acf?.["user-job-Insitution"]} | {requestorProfile?.acf?.["user-country-of-residence"]}</p>
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
                                        <div style={{marginBottom: "1.5rem"}}>
                                            <div style={{fontSize: "1.4rem", marginBottom: "1.5rem", fontWeight: "700"}} dangerouslySetInnerHTML={{ __html: search.length > 0 ? renderedQuestion(collaboration?.acf?.description, search) : collaboration?.acf?.description}} />
                                            <div className="d-flex flex-direction-row mt-3 mb-4">
                                                <div className="designation-button">
                                                    <span className="small">{collaboration?.acf?.["pay"]}</span>
                                                </div>
                                                <div className="due-button">
                                                    <span className="small">Deadline {humanReadableDate(collaboration?.acf?.["deadline"])}</span>
                                                </div>
                                            </div>
                                            <div>{collaboration?.acf?.features?.length > 250 ? collaboration?.acf?.features?.slice(0, 250)+"..." : collaboration?.acf?.features}</div>
                                        </div>
                                        {/* Bottom Section */}
                                        <div className="row d-flex justify-content-between flex-row">                                        
                                            <div className="col-auto d-flex flex-row align-items-center p-0" style={{marginRight: "6rem"}}><img src={UserComment} className="collaboration-icon" alt="Collaboration icon" style={{width: "3rem", paddingRight: ".3rem"}} /> {count} {count == 1 ? "person responded to this." : "people responded to this."}</div>
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
                                        <button
                                        className={`nav-link ${activeTab === "active" ? "active" : ""}`}
                                        onClick={() => setActiveTab("active")}
                                        >
                                        Active Requests
                                        </button>
                                    </li>
                                    <li className="nav-item" role="presentation">
                                        <button
                                        className={`nav-link ${activeTab === "archived" ? "active" : ""}`}
                                        onClick={() => setActiveTab("archived")}
                                        >
                                        Archived
                                        </button>
                                    </li>
                                </ul>
                                <div className="tab-content">
                                {activeTab === "active" && (
                                    <div className="tab-pane fade show active">
                                    <ActivePaginatedLearning itemsPerPage={15} />
                                    </div>
                                )}
                                {activeTab === "archived" && (
                                    <div className="tab-pane fade show active">
                                    <ExpiredPaginatedLearning itemsPerPage={15} />
                                    </div>
                                )}
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

