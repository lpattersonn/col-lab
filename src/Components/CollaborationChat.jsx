import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navigation from './Navigation';
import axios from 'axios';
import SendIcon from '../Images/send_icon.svg';
import SearchIcon from '../Images/search_icon.svg';
import SlidingPane from "react-sliding-pane";
import { TailSpin } from "react-loader-spinner";
import "react-sliding-pane/dist/react-sliding-pane.css";

export default function CollaborationChat() {
    const userDetails = JSON.parse(localStorage.getItem('userDetails'));
    const { param1 } = useParams();
    const [ user, setUser ] =  useState({})
    const [ requestor, setRequestor ] =  useState({})
    const [ participant, setParticipant ] =  useState({})
    const [ allChats, setAllChats ] =  useState([])
    const [ chatDetails, setChatDetails ] =  useState({})
    const [ comments, setComments ] =  useState([])
    const [ comment, setComment ] =  useState('')
    const [ searchBarStatus, setSearchBarStatus ] =  useState('hide')
    const [searchValue, setSearchValue ] = useState("");
    const [overFLow, setOverFlow] = useState(false);
    const [loading, setLoading] = useState(true);
    const [state, setState] = useState({
        isPaneOpen: false,
        isPaneOpenLeft: false,
      });

    const Navigate = useNavigate();

    useEffect(() => {
        axios.get(`${process.env.REACT_APP_API_URL}/wp-json/wp/v2/collaboration-chats`, {
            headers: { Authorization: `Bearer ${userDetails?.token}` }
        })
        .then((response) => {
            let filteredData = response?.data;
    
            if (searchValue?.length > 0) {
                const searchLower = searchValue.toLowerCase();
                filteredData = response.data.filter((chat) => {
                    const requestorName = chat?.acf?.requestor_name?.toLowerCase();
                    const participantName = chat?.acf?.participant_name?.toLowerCase();
    
                    return requestorName.includes(searchLower) || participantName.includes(searchLower);
                });
            }
    
            setAllChats(filteredData);
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
                axios.get(`${process.env.REACT_APP_API_URL}/wp-json/wp/v2/mentor-requests/`, {
                    headers: { Authorization: `Bearer ${userDetails?.token}` }
                }),
                axios.get(`${process.env.REACT_APP_API_URL}/wp-json/wp/v2/collaboration-chats/${param1}`, {
                    headers: { Authorization: `Bearer ${userDetails?.token}` }
                }),
                axios.get(`${process.env.REACT_APP_API_URL}/wp-json/wp/v2/users/${userDetails?.id}`, {
                    headers: { Authorization: `Bearer ${userDetails?.token}` }
                }),
                axios.get(`${process.env.REACT_APP_API_URL}/wp-json/wp/v2/comments?post=${param1}&per_page=100`, {
                    headers: { Authorization: `Bearer ${userDetails?.token}` }
                }),
            ]);

            setChatDetails(singleChat?.data);
            setUser(singleUserDetails?.data);
            setComments(allComments?.data);
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
    if (!chatDetails?.acf || !chatDetails?.acf?.requestor_id || !chatDetails?.acf?.participant_id || !userDetails?.token) return;

    const fetchMentorMentee = async () => {
        try {
            const [requestorDetails, participantDetails] = await Promise.all([
                axios.get(`${process.env.REACT_APP_API_URL}/wp-json/wp/v2/users/${chatDetails.acf.requestor_id}`, {
                    headers: { Authorization: `Bearer ${userDetails?.token}` }
                }),
                axios.get(`${process.env.REACT_APP_API_URL}/wp-json/wp/v2/users/${chatDetails.acf.participant_id}`, {
                    headers: { Authorization: `Bearer ${userDetails?.token}` }
                })
            ]);

            setRequestor(requestorDetails.data);
            setParticipant(participantDetails.data);
        } catch (error) {
            console.error("Error fetching mentor/mentee details:", error);
        }
    };

    fetchMentorMentee();
}, [chatDetails?.acf?.requestor_id, chatDetails?.acf?.participant_id, userDetails?.token]);
 
    const SideBarChats = allChats.map((chat, index) => {
        if (userDetails?.id === chat?.acf?.requestor_id || userDetails?.id === chat?.acf?.participant_id) {
            axios({
                method: 'GET',
                url: `${process.env.REACT_APP_API_URL}/wp-json/wp/v2/comments?post=${chat.id}&per_page=100`,
                headers: {
                    Authorization: `Bearer ${userDetails?.token}`
                    }
            })
            .then((response) => {
                localStorage.setItem(`sideBarCollaborationChat${index}`, JSON.stringify(response.data))
            })
            .catch((err) => {
            })

            let array = JSON.parse(localStorage.getItem(`sideBarCollaborationChat${index}`));
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
                    <a href={`/collaboration-chat/${chat.id}`} key={index} target="_self" titl={`Link to chat with ${chat?.acf?.requestor_name}`}>
                        <div className={"mentors-chat-item-header"+" "+"chat-item"+" "+`${Number(param1) === chat.id ? "current-chat" : 'no'}`}>
                            <div className='row d-flex align-items-center flex-row justify-content-center'>
                                <div className="col-auto">
                                    <img className='chat-item-header-img' src={ userDetails.id === chat?.acf?.requestor_id ? chat?.acf?.participant_image : chat?.acf?.requestor_image } alt={user?.name} loading="eager" /> 
                                </div>
                                <div className="col-9 d-flex align-items-center">
                                    <div className="chat-item-detials">                                
                                        <div className="chat-item-detials-text">
                                            <p className='small m-0'><strong>{ userDetails.id === chat?.acf?.requestor_id ? chat?.acf?.participant_name : chat?.acf?.requestor_name} </strong></p>       
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
    
        axios.post(`${process.env.REACT_APP_API_URL}/wp-json/wp/v2/comments`,
            {
                post: param1, // Ensure it's a valid post ID (Number, not String)
                content: comment,
                author: userDetails.id, // Only pass this if the user is logged in
            },
            {
                headers: {
                    Authorization: `Bearer ${userDetails?.token}`,
                    "Content-Type": "application/json"
                }
            }
        )
        .then((res) => {
            setComment(""); // Clear input field after success
        })
        .catch((error) => {
            console.error("Error submitting comment:", error.response?.data || error.message);
        });
    }

// let nameFormentorRequest =  userDetails.id === requestor?.acf?.requestor_id ? requestor?.acf?.firstName : participant?.acf?.firstName;

if (userDetails !== null) {
    if (loading === false) {
    if (userDetails.id  !== chatDetails?.acf?.requestor_id || userDetails.id  !== chatDetails?.acf?.participant_id) {
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
                                            <img className='chat-item-header-img' src={participant?.acf?.user_profile_picture} alt={participant?.name} loading="eager" /> 
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
                                            <img className='chat-item-header-img' src={userDetails.id === participant.id ? requestor?.acf?.user_profile_picture : participant?.acf?.user_profile_picture} alt={ userDetails.id === participant.id ? requestor?.name : participant?.name} loading="eager" /> 
                                        </div>
                                        <div className="col-auto d-flex align-items-center">
                                            <div>
                                                <p className='m-0'><strong>{userDetails.id === participant.id ? requestor?.name : participant?.name} </strong></p>
                                                <p className='small m-0'>{userDetails.id === participant.id ? requestor?.acf?.['user_mentor_current_position'] : participant?.acf?.['user-job-title']} at {userDetails?.id === participant.id ? requestor?.acf?.['user_mentor_current_company'] : participant?.acf?.['user-job-Insitution']}</p>         
                                            </div>                       
                                        </div>                                 
                                    </div>
                                    <div className='row d-flex align-items-center'>
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
                                    <div class="collaboration-title">Collaboration: {chatDetails?.acf?.request_title}</div>
                                    {conversation}
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
                                                Yes? Pay mentor. No? refund participant.
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
        window.location.replace('/collaborations')
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
    window.location.replace('/')
}
};