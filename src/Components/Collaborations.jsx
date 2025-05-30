import React, { useState, useEffect } from 'react';
import Navigation from './Navigation';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse } from '@fortawesome/free-solid-svg-icons';
import { TailSpin } from "react-loader-spinner";
import ReactPaginate from 'react-paginate';
import UserComment from "../Images/user-comment.svg";
import { submitReport, renderedQuestion, humanReadableDate } from '../helper';
import axios from 'axios';

export default function Collaborations() {
    // Can add in context
    const userDetails = JSON.parse(localStorage.getItem('userDetails'));

    // Could make a component
    const [ search, setSearch ] = useState('');

    // Turn in to a global item
    const [ collaborations, setCollaborations ] = useState([]);
    const [ collaborationChats, setCollaborationChats ] = useState([]);

    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState([]);
    
    const [ activeTab, setActiveTab ] = useState("active");

    const Naviagte = useNavigate()

    useEffect(() => {
        Promise.all([
            // All collaborations
            axios({
                url: `${process.env.REACT_APP_API_URL}/wp-json/wp/v2/collaborations`,
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
            }),
            // All colaboration chats
            axios({
                url: `${process.env.REACT_APP_API_URL}/wp-json/wp/v2/collaboration-chats`,
                method: 'GET',
                headers: {
                  Authorization: `Bearer ${userDetails.token}`
                }
              }),
        ])
        .then(([allCollaboations, allUsers, allChats]) => {
            // All collaborations
            setCollaborations(allCollaboations?.data);            
            // All users
            setUsers(allUsers?.data);
            // All chats
            setCollaborationChats(allChats?.data);
            setLoading(false);
        })
        .catch(error => {
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
            let showCollaboration =  localStorage.getItem(`show_collaboration${index}`);
        
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

            let requestorProfile = "";
            for (let name of users) {
                if ( name.id == collaboration.author) {
                    requestorProfile = name;
                }
            }

            let userProfile = "";
            for (let name of users) {
                if ( name?.id == userDetails?.id) {
                    userProfile = name;
                }
            }

            function commentCount() {
            return axios.get(`${collaboration?._links?.replies?.['0']?.href}`)
            .then((response) => {
                localStorage.setItem(`collaboration_count${index}`, response.data.length);
            }).catch((err) => {});
            }

            commentCount();

            // Get the ID
            let chatID = undefined;
            
            // Get chat message counts
            let count = 0;
            collaborationChats?.map((chat) => {
                if (chat?.acf?.requestor_id == requestorProfile?.id) {
                    count++;
                }
                // if(userDetails?.id === chat?.acf?.participant_id && Number(collaboration?.author) === chat?.acf?.requestor_id) {
                if (chat?.acf?.request_id == collaboration?.id && userDetails?.id === chat?.acf?.participant_id && Number(collaboration?.author) === chat?.acf?.requestor_id) {
                    chatID = chat?.id
                    return;
                }
            });
            
            // Create Collaboration chat 
            const createMentorChat = async (e) => {
                try {
                    const createChat = await axios.post(`${process.env.REACT_APP_API_URL}/wp-json/wp/v2/collaboration-chats`,
                        {
                            author: userDetails.id,
                            title: `New Collaboration Request For ${collaboration?.title?.rendered} Requestee: ${userDetails?.displayName}`,
                            content: `New Collaboration Request For ${collaboration?.title?.rendered} Requestee: ${userDetails?.displayName}`,
                            excerpt: `New Collaboration Request For ${collaboration?.title?.rendered} Requestee: ${userDetails?.displayName}`,
                            status: 'publish',
                            acf: {
                                'requestor_id': collaboration?.author,
                                'requestor_name': requestorProfile?.name,
                                'requestor_image': requestorProfile?.avatar_urls?.['48'],
                                'participant_id': userProfile?.id,
                                'participant_name': userProfile?.name,
                                'participant_image': userProfile?.avatar_urls?.['48'],
                                'request_id': collaboration?.id,
                                'request_title': collaboration?.acf?.description,
                            }
                        },
                        {
                            headers: {
                                Authorization: `Bearer ${userDetails.token}`
                            }
                        }
                    ).then((response) => {
                            Naviagte(`/collaboration-chat/${response?.data?.id}`);
                        }
                    ).catch((err) => {})
            
                } catch (err) {
            
                }
            };
         
            // Show the currect action
            let collaborationButton = () => {
                if (userDetails.id != collaboration.author) { 
                    if (chatID != undefined) {
                        return (<div className="col-auto">
                            <a href={`/collaboration-chat/${chatID}`} className="btn btn-primary collab-btn">Return To Chat</a>
                        </div>);
                    } else {
                        return (<div className="col-auto">
                            <button className="btn btn-primary collab-btn" onClick={createMentorChat} aria-label="Collaboration button">Collaborate</button>
                        </div>);
                    }
                };
            }

            // Toggle option display
            let dateNow = new Date();
            let deadLine = new Date(collaboration?.acf?.deadline);

            if (dateNow <= deadLine) {
                return ( 
                    <div className={`col-12 mb-5 ${showCollaboration}`} key={index}>
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
                                                <div className="d-flex flex-row my-0"><strong><div dangerouslySetInnerHTML={{ __html: search.length > 0 ? renderedQuestion(requestorProfile?.name, search) : requestorProfile?.name}} /></strong><span>&nbsp;| {requestorProfile?.acf?.["user-job-Insitution"]} | {requestorProfile?.acf?.["user-country-of-residence"]}</span></div>
                                                <div className="d-flex flex-row align-items-center" >
                                                    <span className="option-button" style={{marginRight: ".5rem"}}></span><p style={{marginBottom: 0}}>{years > 0 ? `${years} years ago` : months > 0 ? `${months} months ago` : days == 0 ? "Posted today" : `${days} days ago`}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="d-flex flex-direction-row">
                                            <div className="designation-button">
                                                <span className="small">{collaboration?.acf?.["pay"]}</span>
                                            </div>
                                            <div className="due-button">
                                            <span className="small">Deadline {humanReadableDate(collaboration?.acf?.["deadline"])}</span>
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
                                                localStorage.setItem(`show_collaboration${index}`, 'hide')
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
                                    <strong><div style={{fontSize: "1.4rem", marginBottom: "1rem"}} dangerouslySetInnerHTML={{ __html: search.length > 0 ? renderedQuestion(collaboration?.acf?.description, search) : collaboration?.acf?.description}} /></strong>
                                    <div dangerouslySetInnerHTML={{ __html: search.length > 0 ? renderedQuestion(collaboration?.acf?.features, search) : collaboration?.acf?.features}} />
                                </div>
                                {/* Bottom Section */}
                                <div className="row d-flex flex-row">
                                    <img src={UserComment} className="collaboration-icon" alt="Collaboration icon" style={{width: "4rem", paddingRight: ".3rem"}} /> 
                                    <div className="mt-2 col-auto d-flex flex-row p-0" style={{marginRight: "6rem"}}>{count} {count == 1 ? "person responded to this." : "people responded to this."}</div>
                                    { collaborationButton() }
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        }
    )}
      </>
    );
  }
  
function ActivePaginatedmentors({ itemsPerPage }) {
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
        <ActiveItem currentItems={currentItems} />
        <ReactPaginate
          breakLabel="..."
          nextLabel="»"
          onPageChange={handlePageClick}
          pageRangeDisplayed={3}
          pageCount={pageCount}
          previousLabel="«"
          renderOnZeroPageCount={null}
        />
      </>
    );
    
}
// End paginated active jobs

// Expired jobs
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
            let showCollaboration =  localStorage.getItem(`show_collaboration${index}`);
        
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

            let requestorProfile = "";
            for (let name of users) {
                if ( name.id == collaboration.author) {
                    requestorProfile = name;
                }
            }

            let userProfile = "";
            for (let name of users) {
                if ( name?.id == userDetails?.id) {
                    userProfile = name;
                }
            }

            function commentCount() {
            return axios.get(`${collaboration._links.replies['0'].href}`)
            .then((response) => {
                localStorage.setItem(`collaboration_count${index}`, response.data.length);
            }).catch((err) => {});
            }

            commentCount();

            // Get the ID
            let chatID = undefined;

            // Get chat message counts
            let count = 0;

            collaborationChats?.map((chat) => {
                if (chat?.acf?.requestor_id == requestorProfile?.id) {
                    count++;
                }
                // if(userDetails?.id === chat?.acf?.participant_id && Number(collaboration?.author) === chat?.acf?.requestor_id) {
                if (chat?.acf?.request_id == collaboration?.id && userDetails?.id === chat?.acf?.participant_id && Number(collaboration?.author) === chat?.acf?.requestor_id) {
                    chatID = chat?.id
                    return;
                }
            });

            // Get date
            let dateNow = new Date();
            let deadLine = new Date(collaboration?.acf?.deadline);

            if (dateNow > deadLine) {
                return ( 
                    <div className={`col-12 mb-5 ${showCollaboration}`} key={index}>
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
                                                <div className="d-flex flex-row my-0"><strong><div dangerouslySetInnerHTML={{ __html: search.length > 0 ? renderedQuestion(requestorProfile?.name, search) : requestorProfile?.name}} /></strong><span>&nbsp;| {requestorProfile?.acf?.["user-job-Insitution"]} | {requestorProfile?.acf?.["user-country-of-residence"]}</span></div>                                                
                                                <div className="d-flex flex-row align-items-center" >
                                                    <span className="option-button" style={{marginRight: ".5rem"}}></span><p style={{marginBottom: 0}}>{years > 0 ? `${years} years ago` : months > 0 ? `${months} months ago` : days == 0 ? "Posted today" : `${days} days ago`}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="d-flex flex-direction-row">
                                            <div className="designation-button">
                                                <span className="small">{collaboration?.acf?.["pay"]}</span>
                                            </div>
                                            <div className="due-button">
                                            <span className="small">Deadline {humanReadableDate(collaboration?.acf?.["deadline"])}</span>
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
                                                localStorage.setItem(`show_collaboration${index}`, 'hide')
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
                                    <strong><div style={{fontSize: "1.4rem", marginBottom: "1rem"}} dangerouslySetInnerHTML={{ __html: search.length > 0 ? renderedQuestion(collaboration?.acf?.description, search) : collaboration?.acf?.description}} /></strong>
                                    <div dangerouslySetInnerHTML={{ __html: search.length > 0 ? renderedQuestion(collaboration?.acf?.features, search) : collaboration?.acf?.features}} />
                                </div>
                                {/* Bottom Section */}
                                <div className="row d-flex flex-row">
                                    <img src={UserComment} className="collaboration-icon" alt="Collaboration icon" style={{width: "4rem", paddingRight: ".3rem"}} /> 
                                    <div className="mt-2 col-auto d-flex flex-row p-0" style={{marginRight: "6rem"}}>{count} {count == 1 ? "person responded to this." : "people responded to this."}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        }
    )}
      </>
    );
  }
  
  function ExpiredPaginatedmentors({ itemsPerPage }) {
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
        <ExpiredItem currentItems={currentItems} />
        <ReactPaginate
          breakLabel="..."
          nextLabel="»"
          onPageChange={handlePageClick}
          pageRangeDisplayed={3}
          pageCount={pageCount}
          previousLabel="«"
          renderOnZeroPageCount={null}
        />
      </>
    );
    
} 
// End paginated expired jobs

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
                                <Link to="/" className="link-dark small d-flex align-items-center"><FontAwesomeIcon icon={faHouse} /></Link><span className="breadcrumb-slash d-flex align-items-center">>></span><span className="small d-flex align-items-center">Collaborations</span>
                            </div>
                        </div>
                        <div className="row mb-5">
                            <div className="col-lg-12">
                                <p className="lead"><strong>Move your research along using our collaboration platform!</strong></p>
                            </div>
                        </div>
                        <div className="row mt-3">
                            <div className="col-lg-4">
                                <p><strong>Browse all collaboration opportunities</strong></p>
                            </div>
                            <div className="col-lg-4">
                                <input type="search" name="search" className="form-control" placeholder='Start typing to search' value={search} onChange={(e) => {
                                    setSearch(e.target.value)
                                }} />
                            </div>
                            <div className="col-lg-4 text-end">
                                <Link to="/collaboration-request" className="btn btn-outline-info btn-lg">Request collaboration</Link>
                            </div>
                        </div>
                    </div>
                    <div className="mentors mt-5">
                        <ul className="nav nav-tabs mb-5" role="tablist">
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
                                <div className="tab-items">
                                <ActivePaginatedmentors itemsPerPage={15} />
                                </div>
                            </div>
                            )}
                            {activeTab === "archived" && (
                            <div className="tab-pane fade show active">
                                <div className="tab-items">
                                <ExpiredPaginatedmentors itemsPerPage={15} />
                                </div>
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

