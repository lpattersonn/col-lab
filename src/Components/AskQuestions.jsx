import React, { useState, useEffect } from 'react';
import Navigation from './Navigation';
import defaultImage from '../Images/5402435_account_profile_user_avatar_man_icon.svg';
import axios from 'axios';
import { Link } from 'react-router-dom';
import ReactPaginate from 'react-paginate';
import BootstrapSwitchButton from 'bootstrap-switch-button-react';
import { TailSpin } from "react-loader-spinner";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import UserComment from "../Images/user-comment.svg";
import { faSuitcase, faCoins, faMoneyBill, faHouse, faPen } from '@fortawesome/free-solid-svg-icons';
import { submitReport, renderedQuestion, humanReadableDate } from '../helper';

export default function AskQuestions() {
    const userDetails = JSON.parse(localStorage.getItem('userDetails')); // Get user details and turn it in to a object
    const [question, setQuestion] = useState([]); // Get all questions as a array
    const [users, setUsers] = useState([]); //Get all users as a array
    const [search, setSearch] = useState(''); // Get search term 
    const [usersAccountDetails, setUsersAccountDetails] = useState({}); // Set user account details
    const [questionSubject, setQuestionSubject] = useState('General'); // Get user question subject 
    const [loading, setLoading] = useState(true); // Set loading status if loading
    const [askQuestionApi, setAskQuestionApi] = useState({
        title: '',
        content: '',
        question_subject_area: '', 
        question_image: '',
    }); // Set API Question detials

// API calls
  useEffect(() => {
    Promise.all([
        // Get all questions
        axios.get(`${process.env.REACT_APP_API_URL}/wp-json/wp/v2/questions?per_page=100`, {
            headers: { Authorization: `Bearer ${userDetails.token }`}
        }),
        // Get all users
        axios.get(`${process.env.REACT_APP_API_URL}/wp-json/wp/v2/users`, {
            headers: { Authorization: `Bearer ${userDetails.token}`}
        }),
        // Get single user detials
        axios.get(`${process.env.REACT_APP_API_URL}/wp-json/wp/v2/users/${userDetails?.id}`, {
            headers: { Authorization: `Bearer ${userDetails.token}` }
        })
    ]).then(
        ([userQuestions, allUsers, singleUserDetails]) => {
            // Questions
            setQuestion(userQuestions?.data);
            // All users
            setUsers(allUsers?.data);
            // Single user detials
            setUsersAccountDetails(singleUserDetails?.data);
            localStorage.setItem('userPoints', JSON.stringify(singleUserDetails?.data['acf']['user-points']));
            setLoading(false);
        }
    ).catch(error => {
        console.error("API Request failed:", error);
    });
  }, []);

    // Start pagination
    function Items({ currentItems }) {
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
        {currentItems &&
            currentItems.map((question, index) => {
                let user = {};
                let userName = "";
                let userProfileImg = "";

                let posted = Date.now() - new Date(question.date);
                //    let days = Math.floor(posted/(86400 * 1000));

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
        
                for (let name of users) {
                    if ( name.id == question.author) {
                    user = name;
                    userName = name.name;
                    userProfileImg = name?.acf?.user_profile_picture;
                    }
                    if (name?.acf?.user_profile_picture?.length == null) {
                        setLoading(false);
                        break;
                    } 
                    // console.log(name)
                }
        
                function commentCount() {
                    return axios.get(`${question._links.replies['0'].href}`)
                    .then((response) => {
                    numberOfComments[0].count = response.data.length;
                    localStorage.setItem(`comment_count(${question.title.rendered})`, numberOfComments[0].count)
                    }).catch((error) => {})
                }
        
                // Parsing comments
                let count = localStorage.getItem(`comment_count(${question.title.rendered})`);
                // Ensure that numberOfComments is initialized as an object
                let numberOfComments = [{ count: parseInt(count) }]; // Parse string to integer
                // Then you can update the count property
                numberOfComments[0].count = parseInt(count); // Parse string to integer
        
                commentCount();

                let showOpportunity =  localStorage.getItem(`show_question${index}`);
        
                if (search.length > 0 && question.title.rendered.toLowerCase().includes(`${search.toLowerCase()}`) || userName.toLowerCase().includes(search.toLowerCase())) {      
                    if (questionSubject === 'Specific' && usersAccountDetails?.acf?.user_feild == question?.acf?.question_subject_area) {          
                        return (                    
                            <div className={`col-12 mb-5 ${showOpportunity}`} key={index}>
                            <div className="card collaboration">
                                <div className="card-body">
                                {/* Top Section */}
                                    <div className="collaboration-header">
                                        <div className="d-flex flex-direction-row">
                                            <div className="d-flex" style={{marginRight: "6rem"}}>
                                                <div>
                                                    <img className="collaboration-details-name-img" src={userProfileImg?.length > 0 ? userProfileImg : defaultImage} alt={userName} loading="lazy" />
                                                </div>
                                                <div>
                                                    <p className="my-0"><strong>{userName}</strong>{user?.acf?.["user-job-Insitution"]?.length > 0 ? " | " + user?.acf?.["user-job-Insitution"] : ""}</p>
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
                                            <div className={`option-items ${optionDisplay[index]}`} >
                                                <div className="option-item" onClick={() => {
                                                localStorage.setItem(`show_question${index}`, 'hide')
                                                handleHideCollaboration(index)
                                                }}>Hide</div>
                                                <div className="option-item" onClick={()=>{
                                                    submitReport(question, userDetails);
                                                }}>Report</div>
                                            </div>
                                        </div>
                                    </div>
                                    {/* Middle Section */}
                                    <div style={{marginBottom: "1.8rem"}}>
                                        <h3 style={{fontSize: "1.4rem", marginBottom: "1.5rem"}}><div dangerouslySetInnerHTML={{ __html: search.length > 0 ? renderedQuestion(question.title.rendered, search) : question.title.rendered } } /></h3>
                                        <div dangerouslySetInnerHTML={{ __html: search.length > 0 ? renderedQuestion(question?.excerpt?.rendered, search) : question?.excerpt?.rendered?.split(0, 340) } } />
                                    </div>
                                    {/* Bottom Section */}
                                    <div className="row d-flex flex-row">
                                        <img src={UserComment} className="collaboration-icon" alt="Collaboration icon" style={{width: "4rem", paddingRight: ".3rem"}} /> 
                                        <div className="mt-2 col-auto d-flex flex-row p-0" style={{marginRight: "6rem"}}>{numberOfComments[0].count} people responded to this</div>
                                        <div className="col-auto">
                                        <Link to={{ pathname: `/question/${question.id}/`}} className="btn btn-primary collab-btn">View</Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        )
                    }
                    if (questionSubject === 'General') {          
                        return (
                            <div className={`col-12 mb-5 ${showOpportunity}`} key={index}>
                                <div className="card collaboration">
                                    <div className="card-body">
                                    {/* Top Section */}
                                        <div className="collaboration-header">
                                            <div className="d-flex flex-direction-row">
                                                <div className="d-flex" style={{marginRight: "6rem"}}>
                                                    <div>
                                                        <img className="collaboration-details-name-img" src={userProfileImg?.length > 0 ? userProfileImg :  defaultImage} alt={userName} loading="lazy" />
                                                    </div>
                                                    <div>
                                                        <p className="my-0"><strong>{userName}</strong>{user?.acf?.["user-job-Insitution"]?.length > 0 ? " | " + user?.acf?.["user-job-Insitution"] :  ""}</p>
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
                                                <div className={`option-items ${optionDisplay[index]}`} >                                                     
                                                    <div className="option-item" onClick={() => {
                                                        localStorage.setItem(`show_question${index}`, 'hide')
                                                        handleHideCollaboration(index)
                                                    }}>Hide</div>
                                                    <div className="option-item" onClick={()=>{
                                                        submitReport(question, userDetails);
                                                    }}>Report</div>
                                                </div>
                                            </div>
                                        </div>
                                        {/* Middle Section */}
                                        <div style={{marginBottom: "1.8rem"}}>
                                            <h3 style={{fontSize: "1.4rem", marginBottom: "1.5rem"}}><div dangerouslySetInnerHTML={{ __html: search.length > 0 ? renderedQuestion(question.title.rendered, search) : question.title.rendered } } /></h3>
                                            <div dangerouslySetInnerHTML={{ __html: search.length > 0 ? renderedQuestion(question?.excerpt?.rendered, search) : question?.excerpt?.rendered?.length > 340 ? question?.excerpt?.rendered?.slice(0, 340) + "..." : question?.excerpt?.rendered }} />
                                        </div>
                                        {/* Bottom Section */}
                                        <div className="row d-flex flex-row">
                                            <img src={UserComment?.length > 0 ? UserComment :  defaultImage} className="collaboration-icon" alt="Collaboration icon" style={{width: "4rem", paddingRight: ".3rem"}} loading="lazy" /> 
                                            <div className="mt-2 col-auto d-flex flex-row p-0" style={{marginRight: "6rem"}}>{numberOfComments[0].count} people responded to this</div>
                                            <div className="col-auto">
                                            <Link to={{ pathname: `/question/${question.id}/`}} className="btn btn-primary collab-btn">View</Link>
                                            </div>
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

    function PaginatedItems({ itemsPerPage }) {
    // Here we use item offsets; we could also use page offsets
    // following the API or data you're working with.
    const [itemOffset, setItemOffset] = useState(0);

    // Simulate fetching items from another resources.
    // (This could be items from props; or items loaded in a local state
    // from an API endpoint with useEffect and useState)
    const endOffset = itemOffset + itemsPerPage;
    
    const currentItems = question.slice(itemOffset, endOffset);
    const pageCount = Math.ceil(question.length / itemsPerPage);

    // Invoke when user click to request another page.
    const handlePageClick = (event) => {
        const newOffset = (event.selected * itemsPerPage) % question.length;
        setItemOffset(newOffset);
    };

    return (
        <>
        <Items currentItems={currentItems} />
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
// End pagination
    if ( userDetails != null) {
        if (loading === false) {
        return (
            <>
                <Navigation />
                <div className="get-help mb-5">
                    <div className='container primary'>
                        <div className='get-help-details mb-5'>
                            <div className="row mb-5">
                                <div className="col-6 d-flex align-item-center">
                                    <Link to="/" className="link-dark small d-flex align-items-center"><FontAwesomeIcon icon={faHouse} /></Link><span className="breadcrumb-slash d-flex align-items-center">>></span><span className="small d-flex align-items-center">Ask Questions</span>
                                </div>
                                <div className="col-6 d-flex align-item-center justify-content-end">
                                <p className='small m-0 my-auto'><strong>Choose question type:</strong></p> &nbsp; &nbsp;
                                <strong>
                                <BootstrapSwitchButton
                                    checked={false}
                                    onlabel='Specific'
                                    offlabel='General'
                                    onChange={(isChecked) => {
                                        const questionType = isChecked ? 'Specific' : 'General';
                                        localStorage.setItem('questionType', questionType);
                                        setQuestionSubject(questionType)
                                    }}
                                    width={100}
                                    onstyle="info"
                                    offstyle="info"
                                />
                                </strong>
                    
                                </div>

                            </div>
                            <div className="row">
                                <div className="col-lg-4">
                                    <p><strong>See questions from your peers</strong></p>
                                </div>
                                <div className="col-lg-4">
                                    <input type="search" className="form-control" placeholder='Start typing to search' value={search} onChange={(e) => {
                                        setSearch(e.target.value)
                                    }} />
                                </div>
                                <div className="col-lg-4 text-end">
                                    <Link to="/create-question" className="btn btn-outline-info btn-lg">Ask a Question</Link>
                                </div>
                            </div>
                        </div>
                        <PaginatedItems itemsPerPage={15} />
                    </div>
                </div>
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
        window.location.replace("/");
      }
}