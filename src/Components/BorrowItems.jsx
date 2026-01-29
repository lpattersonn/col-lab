import React, { useState, useEffect } from 'react';
import Navigation from './Navigation';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse } from '@fortawesome/free-solid-svg-icons';
import { TailSpin } from "react-loader-spinner";
import ReactPaginate from 'react-paginate';
import { renderedQuestion } from '../helper';
import { submitReport, humanReadableDate } from '../helper';
import axios from 'axios';

export default function BorrowItems() {
    const userDetails = JSON.parse(localStorage.getItem('userDetails'));
    const [ search, setSearch ] = useState('');
    const [ borrowItemsChats, setBorrowItemsChats ] = useState([]);
    const [ allBorrowChats, setAllBorrowChats ] = useState([]);
    const [ loading, setLoading ] = useState(true);
    const [ users, setUsers ] = useState([]);
    const [ activeTab, setActiveTab ] = useState("active");

    const Naviagte = useNavigate()

    useEffect(() => {
        Promise.all([
            // Borrow items
            axios({
                url: `${process.env.REACT_APP_API_URL}/wp-json/wp/v2/borrow-items`,
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${userDetails.token}`
                }
            }),
            // Users
            axios.get(`${process.env.REACT_APP_API_URL}/wp-json/wp/v2/users`, 
            {
                headers: {
                    Authorization: `Bearer ${userDetails.token}`
                    }
            }),
            // All chats
            axios.get(`${process.env.REACT_APP_API_URL}/wp-json/wp/v2/borrow-items-chats`, 
            {
                headers: {
                    Authorization: `Bearer ${userDetails.token}`
                }
            })
        ])
        .then(([allBorrowItems, allUsers, allChats]) => {
            setLoading(false);
             // All users
            setUsers(allUsers?.data);
            // All chats
            setAllBorrowChats(allChats?.data);
            // Borrow items
            let filteredData = allBorrowItems?.data;
            if (search?.length > 0) {
                const searchLower = search.toLowerCase();
                filteredData = allBorrowItems?.data.filter((chat) => {
                    const description = chat?.acf?.description?.toLowerCase() || '';
                    const features = chat?.acf?.features?.toLowerCase() || '';
                
                    return description.includes(searchLower) || features.includes(searchLower);
                });
            }
            setBorrowItemsChats(filteredData);
        })
        .catch(error => {
            console.error(error);
        })
    }, [search])
    
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

            console.log(collaboration);

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
                    localStorage.setItem(`borrow_count${index}`, response.data.length);
                }).catch((err) => {});
                }

                commentCount();

                // Get the ID
                let chatID = undefined;
                allBorrowChats?.map((chat) => {
                    // if(userDetails?.id === chat?.acf?.participant_id && Number(collaboration?.author) === chat?.acf?.requestor_id) {
                    if (chat?.acf?.request_id == collaboration?.id && userDetails?.id === chat?.acf?.participant_id && Number(collaboration?.author) === chat?.acf?.requestor_id) {
                        chatID = chat?.id
                        return;
                    }
                });
                
                // Create Collaboration chat 
                const createBorrowItemChat = async (e) => {
                    try {
                        const createChat = await axios.post(`${process.env.REACT_APP_API_URL}/wp-json/wp/v2/borrow-items-chats`,
                            {
                                author: userDetails.id,
                                title: `New Borrow Item Request For ${collaboration?.title?.rendered} Requestee: ${userDetails?.displayName}`,
                                content: `New Borrow Item Request For ${collaboration?.title?.rendered} Requestee: ${userDetails?.displayName}`,
                                excerpt: `New Borrow Item Request For ${collaboration?.title?.rendered} Requestee: ${userDetails?.displayName}`,
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
                                Naviagte(`/borrow-items-chat/${response?.data?.id}`);
                            }
                        ).catch((err) => {})
                
                    } catch (err) {
                
                    }
                };
            
                // Show the currect action
                let borrowItemButton = () => {
                    if (userDetails.id != collaboration.author) { 
                        if (chatID != undefined) {
                            return (<div className="col-auto">
                                <a href={`/borrow-items-chat/${chatID}`} className="btn btn-primary collab-btn">Return To Chat</a>
                            </div>);
                        } else {
                            return (<div className="col-auto">
                                <button className="btn btn-primary collab-btn" onClick={createBorrowItemChat} aria-label="Collaboration button">Borrow Item</button>
                            </div>);
                        }
                    };
                }

                // Toggle option display
                let dateNow = new Date();
                let deadLine = new Date(collaboration?.acf?.deadline);

                if (dateNow <= deadLine) {
                    return ( 
                        <div className={`job ${showOpportunity}`} key={index}>
                            <div className="card collaboration">
                                <div className="card-body">
                                {/* Top Section */}
                                    <div className="collaboration-header" style={{marginBottom: "1rem",}}>
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
                                    <div style={{marginBottom: "1.8rem"}}>
                                        <div style={{fontSize: "1.4rem", marginBottom: "1.5rem", fontWeight: "bold"}} dangerouslySetInnerHTML={{ __html: search.length > 0 ? renderedQuestion(collaboration?.acf?.description, search) : collaboration?.acf?.description?.split(0, 340) } } />
                                        <div className="d-flex flex-direction-row my-4">
                                            <div className="designation-button">
                                                <span className="small">{collaboration?.acf?.["pay"]}</span>
                                            </div>
                                            <div className="due-button">
                                                <span className="small">Deadline {humanReadableDate(collaboration?.acf?.["deadline"])}</span>
                                            </div>
                                        </div>
                                        <div dangerouslySetInnerHTML={{ __html: search.length > 0 ? renderedQuestion(collaboration?.acf?.features, search) : collaboration?.acf?.features?.split(0, 340) } } />
                                    </div>
                                    {/* Bottom Section */}
                                    <div className="row d-flex justify-content-between flex-row">                                        
                                        {borrowItemButton()}
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
  
  function ActivePaginatedItem({ itemsPerPage }) {
    // Here we use item offsets; we could also use page offsets
    // following the API or data you're working with.
    const [itemOffset, setItemOffset] = useState(0);
  
    // Simulate fetching items from another resources.
    // (This could be items from props; or items loaded in a local state
    // from an API endpoint with useEffect and useState)
    const endOffset = itemOffset + itemsPerPage;

    
    const currentItems = borrowItemsChats.slice(itemOffset, endOffset);
    const pageCount = Math.ceil(borrowItemsChats.length / itemsPerPage);
  
    // Invoke when user click to request another page.
    const handlePageClick = (event) => {
      const newOffset = (event.selected * itemsPerPage) % borrowItemsChats.length;

      setItemOffset(newOffset);
    };
  
    return (
      <>
        <div className='jobs-grid'>
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

            console.log(collaboration);

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
                    localStorage.setItem(`borrow_count${index}`, response.data.length);
                }).catch((err) => {});
                }

                commentCount();

                // Get the ID
                let chatID = undefined;
                allBorrowChats?.map((chat) => {
                    // if(userDetails?.id === chat?.acf?.participant_id && Number(collaboration?.author) === chat?.acf?.requestor_id) {
                    if (chat?.acf?.request_id == collaboration?.id && userDetails?.id === chat?.acf?.participant_id && Number(collaboration?.author) === chat?.acf?.requestor_id) {
                        chatID = chat?.id
                        return;
                    }
                });
                
                // Create Collaboration chat 
                const createBorrowItemChat = async (e) => {
                    try {
                        const createChat = await axios.post(`${process.env.REACT_APP_API_URL}/wp-json/wp/v2/borrow-items-chats`,
                            {
                                author: userDetails.id,
                                title: `New Borrow Item Request For ${collaboration?.title?.rendered} Requestee: ${userDetails?.displayName}`,
                                content: `New Borrow Item Request For ${collaboration?.title?.rendered} Requestee: ${userDetails?.displayName}`,
                                excerpt: `New Borrow Item Request For ${collaboration?.title?.rendered} Requestee: ${userDetails?.displayName}`,
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
                                Naviagte(`/borrow-items-chat/${response?.data?.id}`);
                            }
                        ).catch((err) => {})
                
                    } catch (err) {
                
                    }
                };

                // Toggle option display
                let dateNow = new Date();
                let deadLine = new Date(collaboration?.acf?.deadline);

                if (dateNow > deadLine) {
                    return ( 
                        <div className={`job ${showOpportunity}`} key={index}>
                            <div className="card collaboration">
                                <div className="card-body">
                                {/* Top Section */}
                                    <div className="collaboration-header" style={{marginBottom: "1rem",}}>
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
                                    <div style={{marginBottom: "1.8rem"}}>
                                        <div style={{fontSize: "1.4rem", marginBottom: "1.5rem", fontWeight: "bold"}} dangerouslySetInnerHTML={{ __html: search.length > 0 ? renderedQuestion(collaboration?.acf?.description, search) : collaboration?.acf?.description?.split(0, 340) } } />
                                        <div className="d-flex flex-direction-row my-4">
                                            <div className="designation-button">
                                                <span className="small">{collaboration?.acf?.["pay"]}</span>
                                            </div>
                                            <div className="due-button">
                                                <span className="small">Deadline {humanReadableDate(collaboration?.acf?.["deadline"])}</span>
                                            </div>
                                        </div>
                                        <div dangerouslySetInnerHTML={{ __html: search.length > 0 ? renderedQuestion(collaboration?.acf?.features, search) : collaboration?.acf?.features?.split(0, 340) } } />
                                    </div>
                                    {/* Bottom Section */}
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
  
  function ExpiredPaginatedItems({ itemsPerPage }) {
    // Here we use item offsets; we could also use page offsets
    // following the API or data you're working with.
    const [itemOffset, setItemOffset] = useState(0);
  
    // Simulate fetching items from another resources.
    // (This could be items from props; or items loaded in a local state
    // from an API endpoint with useEffect and useState)
    const endOffset = itemOffset + itemsPerPage;

    
    const currentItems = borrowItemsChats.slice(itemOffset, endOffset);
    const pageCount = Math.ceil(borrowItemsChats.length / itemsPerPage);
  
    // Invoke when user click to request another page.
    const handlePageClick = (event) => {
      const newOffset = (event.selected * itemsPerPage) % borrowItemsChats.length;

      setItemOffset(newOffset);
    };
  
    return (
      <>
        <div className='jobs-grid'>
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
            <Navigation user={userDetails} />
            <main className='collaborations'>
                <div className='container primary'>
                    <div className='get-help-details'>
                        <div className="row mb-5">
                            <div className="col-6 d-flex align-item-center">
                                <Link to="/" className="link-dark small d-flex align-items-center"><FontAwesomeIcon icon={faHouse} /></Link><span className="breadcrumb-slash d-flex align-items-center">>></span><span className="small d-flex align-items-center">Borrow Items</span>
                            </div>
                        </div>
                        <div className="row mb-5">
                            <div className="col-lg-12">
                                <p className="lead"><strong>Lend a hand — or an item. It goes a long way!</strong></p>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-lg-4">
                                <p><strong>See all requests for items</strong></p>
                            </div>
                            <div className="col-lg-4">
                                <input type="search" name="search" className="form-control" placeholder='Start typing to search' value={search} onChange={(e) => {
                                    setSearch(e.target.value)
                                }} />
                            </div>
                            <div className="col-lg-4 text-end">
                                <Link to="/borrow-request" className="btn btn-outline-info btn-lg">Request An Item</Link>
                            </div>
                        </div>
                    </div>
                    <div className="borrow-item list mt-5">
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
                                <ActivePaginatedItem itemsPerPage={15} />
                                </div>
                            </div>
                            )}
                            {activeTab === "archived" && (
                            <div className="tab-pane fade show active">
                                <div className="tab-items">
                                <ExpiredPaginatedItems itemsPerPage={15} />
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

