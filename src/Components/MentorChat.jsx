import React, { Component, useState, useEffect } from 'react';
import { render } from "react-dom";
import { Link, useParams, useNavigate } from 'react-router-dom';
import Navigation from './Navigation';
import api from '../services/api';
import SendIcon from '../Images/send_icon.svg';
import WinkIcon from '../Images/grinning-face-with-smiling-eyes-emoji-icon.svg';
import SearchIcon from '../Images/search_icon.svg';
import Attachment from '../Images/attachment_office_paperclip_supplies_icon.svg';
import Schedule from '../Images/calendar.svg';
import Notification from '../Images/bell.svg';
import EmojiPicker from 'emoji-picker-react';
import SlidingPane from "react-sliding-pane";
import { TailSpin } from "react-loader-spinner";
import BookAMentor from "./BookAMentor.jsx";
import "react-sliding-pane/dist/react-sliding-pane.css";

export default function MentorChat() {
    const userDetails = JSON.parse(localStorage.getItem('userDetails'));
    const { param1 } = useParams();
    const [ user, setUser ] =  useState({})
    const [ mentor, setMentor ] =  useState({})
    const [ mentee, setMentee ] =  useState({})
    const [ allMentorChats, setAllMentorChats ] =  useState([])
    const [ mentorChatDetails, setMentorChatDetails ] =  useState({})
    const [ comments, setComments ] =  useState([])
    const [ comment, setComment ] =  useState('')
    const [ searchBarStatus, setSearchBarStatus ] =  useState('hide')
    const [ calenderModal, setCalenderModal ] = useState('hide');
    const [searchValue, setSearchValue ] = useState("");
    const [overFLow, setOverFlow] = useState(false);
    const [loading, setLoading] = useState(true);
    const [request, setRequest] = useState(0);
    const [state, setState] = useState({
        isPaneOpen: false,
        isPaneOpenLeft: false,
      });
    const Navigate = useNavigate();

    useEffect(() => {
        api.get(`/wp-json/wp/v2/mentor-chats`)
        .then((response) => {
            let filteredData = response?.data;
    
            if (searchValue?.length > 0) {
                const searchLower = searchValue.toLowerCase();
                filteredData = response.data.filter((chat) => {
                    const mentorName = chat?.acf?.mentors_name?.toLowerCase();
                    const menteeName = chat?.acf?.mentee_name?.toLowerCase();
    
                    return mentorName.includes(searchLower) || menteeName.includes(searchLower);
                });
            }
    
            setAllMentorChats(filteredData);
        })
        .catch((error) => {
            console.error(error);
        });
    }, [searchValue, userDetails]); // Ensure `userDetails` is included if `token` is used
    

    useEffect(() => {
    if (!userDetails?.token || !param1) return;

    const fetchData = async () => {
        try {
            const [allMentorRequests, singleChat, singleUserDetails, allComments] = await Promise.all([
                api.get(`/wp-json/wp/v2/mentor-requests/`),
                api.get(`/wp-json/wp/v2/mentor-chats/${param1}`),
                api.get(`/wp-json/wp/v2/users/${userDetails?.id}`),
                api.get(`/wp-json/wp/v2/comments?post=${param1}&per_page=100`),
            ]);

            setRequest(allMentorRequests?.data?.filter(item => 
                item?.acf?.mentor_agree === "Not chosen" && 
                item?.acf?.mentor_chat_id == Number(param1)
            )?.length);

            setMentorChatDetails(singleChat?.data);
            setUser(singleUserDetails.data);
            setComments(allComments.data);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    fetchData(); // Fetch immediately
    const interval = setInterval(fetchData, 2000);

    return () => clearInterval(interval);
}, [userDetails?.token, param1]);

// Fetch Mentor & Mentee Details Separately
useEffect(() => {
    if (!mentorChatDetails?.acf || !mentorChatDetails.acf.mentors_id || !mentorChatDetails.acf.mentee_id || !userDetails?.token) return;

    const fetchMentorMentee = async () => {
        try {
            const [mentorDetails, menteeDetails] = await Promise.all([
                api.get(`/wp-json/wp/v2/users/${mentorChatDetails.acf.mentors_id}`),
                api.get(`/wp-json/wp/v2/users/${mentorChatDetails.acf.mentee_id}`)
            ]);

            setMentor(mentorDetails.data);
            setMentee(menteeDetails.data);
        } catch (error) {
            console.error("Error fetching mentor/mentee details:", error);
        }
    };

    fetchMentorMentee();
}, [mentorChatDetails?.acf?.mentors_id, mentorChatDetails?.acf?.mentee_id, userDetails?.token]);

    const updateParentState = (newValue) => {
        setCalenderModal(newValue);
    };
 
    const updateCount = (arg) => {
            setRequest(arg);
    };
 
    const SideBarChats = allMentorChats.map((mentorChat, index) => {
        if (userDetails?.id === mentorChat?.acf?.mentors_id || userDetails?.id === mentorChat?.acf?.mentee_id) {
            api.get(`/wp-json/wp/v2/comments?post=${mentorChat.id}&per_page=100`)
            .then((response) => {
                localStorage.setItem(`sideBarChat${index}`, JSON.stringify(response.data))
            })
            .catch((err) => {
            })

            let array = JSON.parse(localStorage.getItem(`sideBarChat${index}`));
            let firstMessage = []

            if (array !== null) { 
                firstMessage = array.find(message => userDetails.id !== message.author);

                let dateTime = new Date(firstMessage?.date);

                // Get the day of the week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
                let dayOfWeek = dateTime.getDay();

                // Array of days of the week for reference
                let daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

                // Extract components of the date
                let year = dateTime.getFullYear();
                let month = dateTime.getMonth() + 1; // getMonth() returns 0-based index, so add 1 to get the correct month
                let day = dateTime.getDate();

                // Pad single digit month and day with leading zeros
                let formattedMonth = month < 10 ? '0' + month : month;
                let formattedDay = day < 10 ? '0' + day : day;

                // Format the components into a human-readable date
                // Format the components into a human-readable date
                let formattedDate = `${year}-${formattedMonth}-${formattedDay}`;

                // Get the day name from the array
                let dayName = daysOfWeek[dayOfWeek];

                let formattedDateTime = ((new Date()) - (dateTime.getTime())) / (1000 * 60 * 60); 
                return (
                    <a href={`/mentor-chat/${mentorChat.id}`} key={index} target="_self" titl={`Link to chat with ${mentorChat?.acf?.mentors_name}`}>
                        <div className={"mentors-chat-item-header"+" "+"chat-item"+" "+`${Number(param1) === mentorChat.id ? "current-chat" : 'no'}`}>
                            <div className='row d-flex align-items-center flex-row justify-content-center'>
                                <div className="col-auto">
                                    <img className='chat-item-header-img' src={ userDetails.id === mentorChat?.acf?.mentors_id ? mentorChat?.acf?.mentee_image : mentorChat?.acf?.mentors_image } alt={user?.name} loading="eager" /> 
                                </div>
                                <div className="col-9 d-flex align-items-center">
                                    <div className="chat-item-detials">                                
                                        <div className="chat-item-detials-text">
                                            <p className='small m-0'><strong>{ userDetails.id === mentorChat?.acf?.mentors_id ? mentorChat?.acf?.mentee_name : mentorChat?.acf?.mentors_name} </strong></p>       
                                            <span className="small sidebar-lastchat-date">{formattedDateTime <= 24 ? 'Today' : formattedDateTime <= 48 && formattedDateTime > 24 ? "Yesterday" : formattedDateTime <= 168 && formattedDateTime > 48 ? dayName : formattedDateTime > 168 ? formattedDate : '' }</span>
                                        </div>
                                        <div className={"sidebare-lastchat" + " " + "m-0" + " " + `${firstMessage?.content?.rendered?.length > 30 ? 'side-chat-dots' : ''}`} dangerouslySetInnerHTML={{ __html: firstMessage?.content?.rendered?.slice(0, 30)  }}/>      
                                    </div>                       
                                </div>
                            </div>
                        </div>
                    </a>
                );
            }
        }
    });
    

    const conversation = comments.map((comment, index) => {
        let date = new Date(comment?.date);
        let options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' };
        let humanReadableTime = date.toLocaleDateString('en-US', options);
        
        return (
            <div className={`chat ${comment?.author === userDetails?.id ? 'current-user-message' : 'other-user-message'}`} key={index}>
                <div className="card">
                    <div className='card-body'>
                        <div dangerouslySetInnerHTML={{ __html: `${comment?.content?.rendered}` }} />
                    </div>
                </div>
                <div className='image d-flex align-items-center'>
                    <span className='chat-date date'>{humanReadableTime}</span>
                    <img className='chat-img' src={ comment?.['author_avatar_urls']?.['48'] } alt={comment?.author_name} loading="lazy" /> 
                </div>
            </div>
        )
    })

    // Submit chat 
    function handleClick(e) {
        e.preventDefault();
        
        if (!userDetails?.id || !comment.trim()) return; // Prevent empty comments
    
        api.post(`/wp-json/wp/v2/comments`,
            {
                post: param1, // Ensure it's a valid post ID (Number, not String)
                content: comment,
                author: userDetails.id, // Only pass this if the user is logged in
            }
        )
        .then((res) => {
            setComment(""); // Clear input field after success
        })
        .catch((error) => {
            console.error("Error submitting comment:", error.response?.data || error.message);
        });
    }

let nameFormentorRequest =  userDetails.id === mentor?.acf?.mentors_id ? mentor?.acf?.firstName : mentee?.acf?.firstName;

if (userDetails !== null) {
    if (loading === false) {
    if (userDetails.id  !== mentorChatDetails?.acf?.mentors_id || userDetails.id  !== mentorChatDetails?.acf?.mentee_id) {
        return (
            <>
                <Navigation user={userDetails} />
                <main className='mentors-chat'>
                    <div className="container-fluid primary">
                        <div className='row'>
                            <aside className='col-lg-3 mentors-chat-list p-0'>
                                <div className='mentors-chat-item-header'>
                                    <div className='row d-flex align-items-center justify-content-between'>
                                        <div className="col-auto">
                                            <img className='chat-item-header-img' src={user?.acf?.user_profile_picture} alt={user?.name} loading="eager" /> 
                                        </div>
                                        <div className="col-auto ml-auto">
                                            <img className='chat-icons' src={SearchIcon} alt="Home icon" loading="eager" onClick={() => {
                                                if (searchBarStatus === 'hide') {
                                                    setSearchBarStatus('show');
                                                } else {
                                                    setSearchBarStatus('hide');
                                                }
                                            }}/>
                                        </div>
                                    </div>
                                    <div className={"search-chats-container"+" "+"row"+" "+`${searchBarStatus}`}>
                                        <div className="col">
                                            <input className="form-control" value={searchValue} onChange={(e) => {setSearchValue(e.target.value)}} type="search" placeholder="Type a name"/>
                                        </div>
                                    </div>
                                    <hr className="mb-0"></hr>
                                </div>
                                <div className='mentors-chat-sidebar-body'>
                                        {SideBarChats}
                                </div>
                            </aside>
                            <div className='col-lg-9 mentors-chat-item p-0'>
                                <div className='mentors-chat-item-header mentors-chat-item-header-main'>
                                    <div className='row d-flex align-items-center'>
                                        <div className="col-auto">
                                            <img className='chat-item-header-img' src={userDetails.id === mentee.id ? mentor?.acf?.user_profile_picture : mentee?.acf?.user_profile_picture} alt={ userDetails.id === mentee.id ? mentor?.name : mentee?.name} loading="eager" /> 
                                        </div>
                                        <div className="col-auto d-flex align-items-center">
                                            <div>
                                                <p className='m-0'><strong>{userDetails.id === mentee.id ? mentor?.name : mentee?.name} </strong></p>
                                                <p className='small m-0'>{userDetails.id === mentee.id ? mentor?.acf?.['user_mentor_current_position'] : mentee?.acf?.['user-job-title']} at {userDetails?.id === mentee.id ? mentor?.acf?.['user_mentor_current_company'] : mentee?.acf?.['user-job-Insitution']}</p>         
                                            </div>                       
                                        </div>
                                    </div>
                                    <div className='row d-flex align-items-center'>
                                        <div className="col-auto">
                                            <div className="chat-instructions">
                                            {userDetails?.id === mentor?.id && request > 0 ? <div className="mentor-cotification-count">{request}</div> : ""}
                                                <img className='send-chat-extra-icon send-chat-extra-icon-schedule' src={userDetails?.id != mentor?.id ? Schedule : Notification} onClick={() => {
                                                    if (calenderModal === 'hide') {
                                                        setCalenderModal('show');
                                                        setOverFlow(true)
                                                    } else {
                                                        setCalenderModal('hide');
                                                        setOverFlow(false)
                                                    }
                                                }} loading="eager" />
                                            </div>
                                        </div>
                                        {/* See Chat Guidelines */}
                                        <div className="col-auto">
                                            <div className="chat-instructions">
                                                <button className="btn btn-outline-info btn-lg" onClick={() => setState({ isPaneOpen: true })}>
                                                    See Chat Guidelines
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                    <hr className="mb-0"></hr>
                                <div className={`mentors-chat-item-body ${overFLow === false ? 'overflow-scroll' : 'overflow-hidden'}`}>
                                    {conversation}
                                    <BookAMentor prop1={calenderModal} prop2={mentor.name} mentor_id={mentor.id} mentee_id={mentee.id} chat_id={param1} updateParentState={updateParentState} request={request} updateCount={updateCount} />
                                </div>
                                <div className='mentors-chat-item-keyboard'>
                                    <div className='row d-flex align-items-center'>
                                        <div className='col-2'></div>
                                        <div className='col-8'>                                            
                                            <form className="d-flex flex-direction-row align-items-center" onSubmit={handleClick}>
                                                <div className='send-chat'>                                                
                                                    <div className='send-chat-input'>
                                                        <input className="form-control form-control-lg chat-input" type="text" value={comment} onChange={(e) => {setComment(e.target.value)}} aria-label="Type a message" placeholder='Type a message' />
                                                    </div>
                                                    <button className='send-chat-icon' type="submit">
                                                        <img className='send-icon' src={SendIcon} alt="Send icon" loading="eager" />
                                                    </button>
                                                </div>                                              
                                            </form>
                                        </div>
                                        <div className='col-2'></div>
                                    </div>
                                </div>
                            </div>
                              <div>
                                {/* Guideline Slideout */}
                                <SlidingPane
                                    className="some-custom-class"
                                    style={{padding: "10rem 3rem"}}
                                    overlayClassName="some-custom-overlay-class"
                                    isOpen={state.isPaneOpen}
                                    title="Hey, it is optional pane title.  I can be React component too."
                                    subtitle="Optional subtitle."
                                    width="300px"
                                    onRequestClose={() => {
                                    // triggered on "<" on left top click or on outside click
                                    setState({ isPaneOpen: false });
                                    }}
                                >
                                    <div>  
                                        <p style={{paddingTop: "9.5rem"}}><strong>Chat Guidelines:</strong></p>
                                        <ol>
                                            <li className="mb-4 small">
                                                Indicate scheduled date/time. Account for time zone. Send both meeting links.
                                            </li>
                                            <li className="mb-4 small">
                                                Make payment (include 10% fee for us). Money will be held until confirmation that meeting occurred or will be refunded. 
                                            </li>
                                            <li className="mb-4 small">
                                                After meeting time send confirmation message to both users to confirm that meeting occured.
                                            </li>
                                            <li className="mb-4 small">
                                                Yes? Pay mentor. No? refund mentee.
                                            </li>
                                        </ol>
                                    </div>
                                    <br />
                                </SlidingPane>
                            </div>
                            
                        </div>
                    </div>
                </main>
            </>
        )
    } else {
        window.location.replace('/mentorship-opportunities')
    }
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
    Navigate('/login')
}
};