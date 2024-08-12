import React, { Component, useState, useEffect } from 'react';
import { render } from "react-dom";
import { Link, useParams, useNavigate } from 'react-router-dom';
import Navigation from './Navigation';
import axios from 'axios';
import SendIcon from '../Images/send_icon.svg';
import WinkIcon from '../Images/grinning-face-with-smiling-eyes-emoji-icon.svg';
import SearchIcon from '../Images/search_icon.svg';
import Attachment from '../Images/attachment_office_paperclip_supplies_icon.svg';
import Schedule from '../Images/calendar.svg';
import EmojiPicker from 'emoji-picker-react';
import SlidingPane from "react-sliding-pane";
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
    const [ emojiPicker, setEmojiPicker ] = useState(true);
    const [overFLow, setOverFlow] = useState(false);
    const [ state, setState ] = useState({
        isPaneOpen: false,
        isPaneOpenLeft: false,
      });
    const Navigate = useNavigate();

    // Set user information
    useEffect(() => {
            axios({
                method: 'GET',
                url: `${process.env.REACT_APP_API_URL}/wp-json/wp/v2/mentor-chats/${param1}`,
                headers: {
                    Authorization: `Bearer ${userDetails.token}`
                  }
            }
        ).then((res) => {
            setMentorChatDetails(res?.data)
        }).catch((err) => {
            Navigate('/mentorship-opportunities')
        })
    }, [param1])

    // Get all mentor chats
    useEffect(() => {
            axios({
                method: 'GET',
                url: `${process.env.REACT_APP_API_URL}/wp-json/wp/v2/mentor-chats`,
                headers: {
                    Authorization: `Bearer ${userDetails.token}`
                  }
            }
        ).then((res) => {
            setAllMentorChats(res.data)
        }).catch((err) => {
        })
    }, [])

    // Set mentor information
    useEffect(() => {
            axios({
                method: 'GET',
                url: `${process.env.REACT_APP_API_URL}/wp-json/wp/v2/users/${mentorChatDetails?.acf?.mentors_id}`,
                headers: {
                    Authorization: `Bearer ${userDetails?.token}`
                  }
            }
        ).then((res) => {
            setMentor(res.data)
        }).catch((err) => {
        })
    }, [mentorChatDetails])

    // Set mentees information
    useEffect(() => {
        axios({
            method: 'GET',
            url: `${process.env.REACT_APP_API_URL}/wp-json/wp/v2/users/${mentorChatDetails?.acf?.mentee_id}`,
            headers: {
                Authorization: `Bearer ${userDetails?.token}`
              }
        }
        ).then((res) => {
            setMentee(res.data)
        }).catch((err) => {
        })
    }, [mentorChatDetails])

    // Set user information
    useEffect(() => {
            axios({
                method: 'GET',
                url: `${process.env.REACT_APP_API_URL}/wp-json/wp/v2/users/${userDetails?.id}`,
                headers: {
                    Authorization: `Bearer ${userDetails.token}`
                  }
            }
        ).then((res) => {
            setUser(res.data)
        }).catch((err) => {
        })
    }, [userDetails])

    // Get comments
    useEffect(() => {
        axios({
            method: 'GET',
            url: `${process.env.REACT_APP_API_URL}/wp-json/wp/v2/comments?post=${param1}&per_page=100`,
            headers: {
                Authorization: `Bearer ${userDetails.token}`
              }
        }
    ).then((response) => {
            setComments(response.data);
        })
        .catch((err) => {
        })
    })

    const updateParentState = (newValue) => {
        setCalenderModal(newValue);
    };
 
        const SideBarChats = allMentorChats.map((mentorChat, index) => {
            
            if (userDetails?.id === mentorChat?.acf?.mentors_id || userDetails?.id === mentorChat?.acf?.mentee_id) {
                axios({
                    method: 'GET',
                    url: `${process.env.REACT_APP_API_URL}/wp-json/wp/v2/comments?post=${mentorChat.id}&per_page=100`,
                    headers: {
                        Authorization: `Bearer ${userDetails.token}`
                      }
                }
            ).then((response) => {
                    localStorage.setItem(`sideBarChat${index}`, JSON.stringify(response.data))
                })
                .catch((err) => {
                })

                let array = JSON.parse(localStorage.getItem(`sideBarChat${index}`));
                let firstMessage = []

                if (array !== null) { 
                    firstMessage = array.find(message => userDetails.id !== message.author);

                    var dateTime = new Date(firstMessage?.date);

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
                                        <img className='chat-item-header-img' src={ userDetails.id === mentorChat?.acf?.mentors_id ? mentorChat?.acf?.mentee_image : mentorChat?.acf?.mentors_image } alt={user?.name} loading="lazy" /> 
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
        var date = new Date(comment?.date);

        var options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' };
        var humanReadableTime = date.toLocaleDateString('en-US', options);
        
        return (
            <div className={`chat ${comment?.author === userDetails?.id ? 'current-user-message' : 'other-user-message'}`} key={index}>
                <div className="card">
                    <div className='card-body'>
                        <div dangerouslySetInnerHTML={{ __html: `${comment?.content?.rendered}` }} />
                    </div>
                </div>
                <div className='image d-flex align-items-center'>
                    <span className='chat-date date'>{humanReadableTime}</span>
                    <img className='chat-img' src={ comment?.author_avatar_urls?.['48']} alt={comment?.author_name} loading="lazy" /> 
                </div>
            </div>
        )
    })

    // Submit chat 
    function handleClick(e) {
        e.preventDefault();
        axios.post(`${process.env.REACT_APP_API_URL}/wp-json/wp/v2/comments`,
        {
          author: userDetails?.id,
          author_email: userDetails?.email,
          author_name: `${userDetails?.firstName} ${userDetails?.lastName}`,
          content: `${comment}`,
          post: `${param1}`,
          status: 'approved',
        },
        {
          headers: {
              Authorization: `Bearer ${userDetails?.token}`
          }
        }
        ).then((res) => {
            setComment('');
        })
    }

    let nameFormentorRequest =  userDetails.id === mentor?.acf?.mentors_id ? mentor?.acf?.firstName : mentee?.acf?.firstName;

if (userDetails !== null) {
    if (userDetails.id  !== mentorChatDetails?.acf?.mentors_id || userDetails.id  !== mentorChatDetails?.acf?.mentee_id) {
        return (
            <>
                <Navigation />
                <main className='mentors-chat'>
                    <div className="container-fluid primary">
                        <div className='row'>
                            <aside className='col-lg-3 mentors-chat-list p-0'>
                                <div className='mentors-chat-item-header'>
                                    <div className='row d-flex align-items-center justify-content-between'>
                                        <div className="col-auto">
                                            <img className='chat-item-header-img' src={user?.avatar_urls?.['48']} alt={user?.name} loading="lazy" /> 
                                        </div>
                                        <div className="col-auto ml-auto">
                                            <img className='chat-icons' src={SearchIcon} alt="Home icon" loading="lazy" onClick={() => {
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
                                            <input className="form-control" type="search" placeholder="Search chats"/>
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
                                            <img className='chat-item-header-img' src={userDetails.id === mentee.id ? mentor?.avatar_urls?.['48'] : mentee?.avatar_urls?.['48']} alt={ userDetails.id === mentee.id ? mentor?.name : mentee?.name} /> 
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
                                                <img className='send-chat-extra-icon send-chat-extra-icon-schedule' src={Schedule} onClick={() => {
                                                    if (calenderModal === 'hide') {
                                                        setCalenderModal('show');
                                                        setOverFlow(true)
                                                    } else {
                                                        setCalenderModal('hide');
                                                        setOverFlow(false)
                                                    }
                                                }} />
                                            </div>
                                        </div>
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
                                    <BookAMentor prop1={calenderModal} prop2={mentor.name} mentor_id={mentor.id} mentee_id={mentee.id} chat_id={param1} updateParentState={updateParentState} />
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
                                                        <img className='send-icon' src={SendIcon} alt="Send icon" loading="lazy" />
                                                    </button>
                                                </div>
                                                <img className='send-chat-extra-icon' src={Attachment} />
                                                {/* <img className='send-chat-extra-icon send-chat-extra-icon-emoji' src={WinkIcon} /> */}
                                                <div className='test'>
                                                    <div className="emoji-picker">
                                                        <EmojiPicker className="emoji-picker-picker" reactionsDefaultOpen={emojiPicker} width={700} onEmojiClick={(emojiData, event) => { 
                                                            setComment(prevInput => prevInput + emojiData?.emoji);
                                                            setEmojiPicker(true);
                                                            }} />
                                                    </div>
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
                                        <p><strong>Chat Guidelines:</strong></p>
                                        <ol>
                                            <li className="mb-4 small">
                                                Indicate scheduled date/time. Account for time zone. Send both meeting links
                                            </li>
                                            <li className="mb-4 small">
                                                Make payment (include 10% fee for us). Money will be held until confirmation that meeting occurred or will be refunded. 
                                            </li>
                                            <li className="mb-4 small">
                                                After meeting time send confirmation message to both users to confirm that meeting occured 
                                            </li>
                                            <li className="mb-4 small">
                                                Yes? Pay mentor. No? refund mentee.
                                            </li>
                                        </ol>
                                    </div>
                                    <br />
                                </SlidingPane>
                                {/* <SlidingPane
                                    closeIcon={<div>Some div containing custom close icon.</div>}
                                    isOpen={state.isPaneOpenLeft}
                                    title="Hey, it is optional pane title.  I can be React component too."
                                    from="left"
                                    width="200px"
                                    onRequestClose={() => setState({ isPaneOpenLeft: false })}
                                >
                                    <div>And I am pane content on left.</div>
                                </SlidingPane> */}
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
    window.location.replace('/')
}
};