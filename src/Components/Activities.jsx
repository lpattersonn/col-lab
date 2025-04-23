import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ReactPaginate from 'react-paginate';
import UserComment from "../Images/user-comment.svg";
import { renderedQuestion, humanReadableDate, deletePost } from '../helper';
import UserProfile from '../Images/user-profile.svg'
import axios from 'axios';

export default function Activities({selected, activities, keyword, users, setUpdateState}) {
   // Can add in context
   const userDetails = JSON.parse(localStorage.getItem('userDetails'));

   // Turn in to a global item
   const [ collaborations, setCollaborations ] = useState([]);
   const [ collaborationChats, setCollaborationChats ] = useState([]);
   
   const [ activeTab, setActiveTab ] = useState("active");

   const Naviagte = useNavigate()

    // Function for returning activities
    function returnActivities() {
        // Set url for querying activities
    }

    // Start paginated requests
    function ActiveItem({ currentItems }) {
        // Can add in context
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
            {currentItems?.map((collaboration, index) => {
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
                
                function CommentCount({ collaboration, userDetails }) {
                    const [count, setCount] = useState(null);
                
                    useEffect(() => {
                        if (!collaboration?._links?.replies?.['0']?.href) return;
                
                        axios.get(collaboration._links.replies['0'].href, {
                            headers: { Authorization: `Bearer ${userDetails.token}` }
                        })
                        .then((response) => {
                            setCount(response?.data?.length || 0);
                        })
                        .catch((err) => {
                            console.error("Error fetching comment count", err);
                            setCount(0);
                        });
                    }, []);
                
                    return (
                        count
                    );
                }
                
    
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

                // Parsing comments
                let questionCount = localStorage.getItem(`comment_count(${collaboration.title.rendered})`);
                // Ensure that numberOfComments is initialized as an object
                let numberOfComments = [{ questionCount: parseInt(count) }]; // Parse string to integer
                // Then you can update the count property
                numberOfComments[0].questionCount = parseInt(questionCount); // Parse string to integer
                
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
                                    'request_title': collaboration?.acf?.collaborations_description,
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
    
                    return ( 
                        <div className={`col-12 mb-5 ${showCollaboration}`} key={index}>
                            <div className="card collaboration">
                                <div className="card-body">
                                {/* Top Section */}
                                    <div className="collaboration-header">
                                        <div className="d-flex flex-wrap flex-direction-row">
                                            <div className="d-flex" style={{marginRight: "6rem", marginBottom: '1rem'}}>
                                                <div>
                                                    <img className="collaboration-details-name-img" src={ requestorProfile?.acf?.user_profile_picture.length !== 0 ? requestorProfile?.acf?.user_profile_picture : UserProfile } alt={requestorProfile.name} loading="lazy" />
                                                </div>
                                                <div>
                                                    <div className="d-flex flex-row my-0"><strong><div dangerouslySetInnerHTML={{ __html: keyword.length > 0 ? renderedQuestion(requestorProfile?.name, keyword) : requestorProfile?.name}} /></strong><span>&nbsp;| {requestorProfile?.acf?.["user-job-Insitution"]} | {requestorProfile?.acf?.["user-country-of-residence"]}</span></div>
                                                    <div className="d-flex flex-row align-items-center" >
                                                        <span className="option-button" style={{marginRight: ".5rem"}}></span><p style={{marginBottom: 0}}>{years > 0 ? `${years} years ago` : months > 0 ? `${months} months ago` : days == 0 ? "Posted today" : `${days} days ago`}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            { selected !== 'questions' && selected !== 'jobs' && 
                                                (<div className="d-flex flex-direction-row">
                                                    <div className="designation-button">
                                                        <span className="small">{collaboration?.acf?.["pay"]}</span>
                                                    </div>
                                                    <div className="due-button">
                                                    <span className="small">Deadline {humanReadableDate(collaboration?.acf?.["deadline"])}</span>
                                                    </div>
                                                </div>)
                                            }
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
                                                <div className="option-item"  onClick={async () => {
                                                    await deletePost(
                                                    userDetails,
                                                    collaboration?._links?.collection?.[0]?.href, // correct URL
                                                    collaboration?.id,
                                                    setUpdateState
                                                    );
                                                }}>Delete</div>
                                            </div>
                                        </div>
                                    </div>
                                    {/* Middle Section */}
                                    <div style={{marginBottom: "1.8rem"}}>
                                        <strong><div style={{fontSize: "1.4rem", marginBottom: "1rem"}} dangerouslySetInnerHTML={{ __html: keyword.length > 0 ? renderedQuestion(collaboration?.title?.rendered, keyword) : collaboration?.title?.rendered}} /></strong>
                                        <div dangerouslySetInnerHTML={{ __html: keyword.length > 0 ? renderedQuestion(collaboration?.excerpt?.rendered, keyword) : collaboration?.excerpt?.rendered}} />
                                    </div>
                                    {/* Bottom Section */}
                                    <div className="row d-flex flex-row">
                                        <img src={UserComment} className="collaboration-icon" alt="Collaboration icon" style={{width: "4rem", paddingRight: ".3rem"}} /> 
                                        <div className="mt-2 col-auto d-flex flex-row p-0" style={{marginRight: "6rem"}}>{ selected == 'questions' ? numberOfComments[0].questionCount : count } {count == 1 ? "person responded to this." : "people responded to this."}</div>
                                        { collaborationButton() }
                                    </div>
                                </div>
                            </div>
                        </div>
                    )

            }
        )}
          </>
        );
      }
      
    function ActivePaginatedItems({ itemsPerPage }) {
        // Here we use item offsets; we could also use page offsets
        // following the API or data you're working with.
        const [itemOffset, setItemOffset] = useState(0);
      
        // Simulate fetching items from another resources.
        // (This could be items from props; or items loaded in a local state
        // from an API endpoint with useEffect and useState)
        const endOffset = itemOffset + itemsPerPage;
    
        const currentItems = activities.slice(itemOffset, endOffset);

        const pageCount = Math.ceil(activities.length / itemsPerPage);
      
        // Invoke when user click to request another page.
        const handlePageClick = (event) => {
          const newOffset = (event.selected * itemsPerPage) % activities.length;
    
          setItemOffset(newOffset);
        };
      
        return (
            <>
          { currentItems?.length > 0 ?
            (<>
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
            </>) : (<>
                <p>No requests found.</p>
            </>)
          }
         </>
        );
        
    }
    // End paginated requests

    // Start activity tab
    // Set URL for the desired outcome
    let url = `${process.env.REACT_APP_API_URL}/wp-json/wp/v2/questions`
    let [myActivity, setMyActivity] = useState();
    // Change value of url based on the value of selected
    switch(selected) {
        case 'questions':
        url = `${process.env.REACT_APP_API_URL}/wp-json/wp/v2/questions`;
        break;
        case 'collaborations':
        url = `${process.env.REACT_APP_API_URL}/wp-json/wp/v2/collaborations`;
        break;
        case 'borrow-items':
        url = `${process.env.REACT_APP_API_URL}/wp-json/wp/v2/borrow-items`;
        break;  
        case 'jobs':
        url = `${process.env.REACT_APP_API_URL}/wp-json/wp/v2/jobs`;
        break;   
        case 'learning-center':
        url = `${process.env.REACT_APP_API_URL}/wp-json/wp/v2/learning-center`;
        break; 
    }

    useEffect(() => {
        axios.get(url, {
            headers: `Bearer ${userDetails.token}`
        })
        .then(async (response) => {
            let filteredData = response.data;
        
            if (selected === 'questions') {
                const questionsWithUserComments = await Promise.all(
                    response.data.map(async (question) => {
                        try {
                            const replyUrl = question?._links?.replies?.[0]?.href;
                            if (!replyUrl) return false;
        
                            const res = await axios.get(replyUrl);
                            const authors = res.data.map(comment => comment.author);
        
                            return authors.includes(userDetails.id);
                        } catch (error) {
                            console.error(error);
                            return false;
                        }
                    })
                );
        
                filteredData = response.data.filter((_, index) => questionsWithUserComments[index]);
            }
            setMyActivity(filteredData);
        
        })
    }, [selected, myActivity]);

    function ActivityItem({ currentItems }) {
        // Can add in context
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
            {currentItems?.map((collaboration, index) => {
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
                
                function CommentCount({ collaboration, userDetails }) {
                    const [count, setCount] = useState(null);
                
                    useEffect(() => {
                        if (!collaboration?._links?.replies?.['0']?.href) return;
                
                        axios.get(collaboration._links.replies['0'].href, {
                            headers: { Authorization: `Bearer ${userDetails.token}` }
                        })
                        .then((response) => {
                            setCount(response?.data?.length || 0);
                        })
                        .catch((err) => {
                            console.error("Error fetching comment count", err);
                            setCount(0);
                        });
                    }, []);
                
                    return (
                        count
                    );
                }
                
    
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

                // Parsing comments
                let questionCount = localStorage.getItem(`comment_count(${collaboration.title.rendered})`);
                // Ensure that numberOfComments is initialized as an object
                let numberOfComments = [{ questionCount: parseInt(count) }]; // Parse string to integer
                // Then you can update the count property
                numberOfComments[0].questionCount = parseInt(questionCount); // Parse string to integer
                
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
                                    'request_title': collaboration?.acf?.collaborations_description,
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
    
                    return ( 
                        <div className={`col-12 mb-5 ${showCollaboration}`} key={index}>
                            <div className="card collaboration">
                                <div className="card-body">
                                {/* Top Section */}
                                    <div className="collaboration-header">
                                        <div className="d-flex flex-wrap flex-direction-row">
                                            <div className="d-flex" style={{marginRight: "6rem", marginBottom: '1rem'}}>
                                                <div>
                                                    <img className="collaboration-details-name-img" src={ requestorProfile?.acf?.user_profile_picture.length !== 0 ? requestorProfile?.acf?.user_profile_picture : UserProfile } alt={requestorProfile.name} loading="lazy" />
                                                </div>
                                                <div>
                                                    <div className="d-flex flex-row my-0"><strong><div dangerouslySetInnerHTML={{ __html: keyword.length > 0 ? renderedQuestion(requestorProfile?.name, keyword) : requestorProfile?.name}} /></strong><span>&nbsp;| {requestorProfile?.acf?.["user-job-Insitution"]} | {requestorProfile?.acf?.["user-country-of-residence"]}</span></div>
                                                    <div className="d-flex flex-row align-items-center" >
                                                        <span className="option-button" style={{marginRight: ".5rem"}}></span><p style={{marginBottom: 0}}>{years > 0 ? `${years} years ago` : months > 0 ? `${months} months ago` : days == 0 ? "Posted today" : `${days} days ago`}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            { selected !== 'questions' && selected !== 'jobs' && 
                                                (<div className="d-flex flex-direction-row">
                                                    <div className="designation-button">
                                                        <span className="small">{collaboration?.acf?.["pay"]}</span>
                                                    </div>
                                                    <div className="due-button">
                                                    <span className="small">Deadline {humanReadableDate(collaboration?.acf?.["deadline"])}</span>
                                                    </div>
                                                </div>)
                                            }
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
                                            </div>
                                        </div>
                                    </div>
                                    {/* Middle Section */}
                                    <div style={{marginBottom: "1.8rem"}}>
                                        <strong><div style={{fontSize: "1.4rem", marginBottom: "1rem"}} dangerouslySetInnerHTML={{ __html: keyword.length > 0 ? renderedQuestion(collaboration?.title?.rendered, keyword) : collaboration?.title?.rendered}} /></strong>
                                        <div dangerouslySetInnerHTML={{ __html: keyword.length > 0 ? renderedQuestion(collaboration?.excerpt?.rendered, keyword) : collaboration?.excerpt?.rendered}} />
                                    </div>
                                    {/* Bottom Section */}
                                    <div className="row d-flex flex-row">
                                        <img src={UserComment} className="collaboration-icon" alt="Collaboration icon" style={{width: "4rem", paddingRight: ".3rem"}} /> 
                                        <div className="mt-2 col-auto d-flex flex-row p-0" style={{marginRight: "6rem"}}>{ selected == 'questions' ? numberOfComments[0].questionCount : count } {count == 1 ? "person responded to this." : "people responded to this."}</div>
                                        { collaborationButton() }
                                    </div>
                                </div>
                            </div>
                        </div>
                    )

            }
        )}
          </>
        );
      }
      
    function ActivePaginatedActivities({ itemsPerPage }) {
        // Here we use item offsets; we could also use page offsets
        // following the API or data you're working with.
        const [itemOffset, setItemOffset] = useState(0);
      
        // Simulate fetching items from another resources.
        // (This could be items from props; or items loaded in a local state
        // from an API endpoint with useEffect and useState)
        const endOffset = itemOffset + itemsPerPage;
    
        const currentItems = myActivity?.slice(itemOffset, endOffset);

        const pageCount = Math.ceil(myActivity?.length / itemsPerPage);
      
        // Invoke when user click to request another page.
        const handlePageClick = (event) => {
          const newOffset = (event.selected * itemsPerPage) % myActivity?.length;
    
          setItemOffset(newOffset);
        };
      
        return (
            <>
          { currentItems?.length > 0 ?
            (<>
                <ActivityItem currentItems={currentItems} />
                <ReactPaginate
                breakLabel="..."
                nextLabel="»"
                onPageChange={handlePageClick}
                pageRangeDisplayed={3}
                pageCount={pageCount}
                previousLabel="«"
                renderOnZeroPageCount={null}
                />
            </>) : (<>
                <p>No requests found.</p>
            </>)
          }
         </>
        );
        
    }
    // End paginated activity 

    return(
        <>
        <div className="mentors">
            <ul className="nav nav-tabs mb-5" role="tablist">
                <li className="nav-item" role="presentation">
                <button
                    className={`nav-link ${activeTab === "active" ? "active" : ""}`}
                    onClick={() => setActiveTab("active")}
                >
                    My Requests
                </button>
                </li>
                <li className="nav-item" role="presentation">
                <button
                    className={`nav-link ${activeTab === "archived" ? "active" : ""}`}
                    onClick={() => setActiveTab("archived")}
                >
                    My Activity
                </button>
                </li>
            </ul>

            <div className="tab-content">
                {activeTab === "active" && (
                <div className="tab-pane fade show active">
                    <ActivePaginatedItems itemsPerPage={5} />
                </div>
                )}
                {activeTab === "archived" && (
                <div className="tab-pane fade show active">
                    <ActivePaginatedActivities itemsPerPage={5} />
                </div>
                )}
            </div>
        </div>
        </>
    );
};