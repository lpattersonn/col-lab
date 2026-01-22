import React, { useState, useEffect } from 'react';
import Navigation from '../Navigation';
import SideNavigation from '../Navigation/SideNavigation';
import { TailSpin } from "react-loader-spinner";
import { Link, useNavigate } from 'react-router-dom';
import defaultImage from '../../Images/user-profile.svg';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';

export default function Home() {
      // Can be a context
  let userDetails = JSON.parse(localStorage.getItem("userDetails"));

  const Navigate = useNavigate();

  const [ getHelpQuestions, setGetHelpQuestions ] = useState([]);
  const [ getUsers, setGetUsers ] = useState([]); // Do I Need?
  const [ usersAccountDetails, setUsersAccountDetails ] = useState({});
  const [ notifications, setNotifications ] = useState(0);
  const [ events, setEvents ] = useState([]);
  const [ collaborations, setCollaborations ] = useState()
  const [ mentorships, setMentorships ] = useState()
  const [ loading, setLoading ] = useState(true);

  // Api calls
  useEffect(() => {
    Promise.all([
      // Api for questions
      axios.get(`${process.env.REACT_APP_API_URL}/wp-json/wp/v2/questions`, 
        {
          headers: {
            Authorization: `Bearer ${userDetails.token}`
          }
        }
      ),
      // Api for users
      axios.get(`${process.env.REACT_APP_API_URL}/wp-json/wp/v2/users`,
        {
          headers: {
            Authorization: `Bearer ${userDetails.token}`
          }
        }
      ),
      // Api for current user
      axios({
        url: `${process.env.REACT_APP_API_URL}/wp-json/wp/v2/users/${userDetails?.id}`,
        method: 'POST',
        headers: {
          Authorization: `Bearer ${userDetails.token}`
        }
      }),
      // Get mentor requests
      axios.get(`${process.env.REACT_APP_API_URL}/wp-json/wp/v2/mentor-requests/`,
        {
            headers: {
                Authorization: `Bearer ${userDetails.token}`
            }
        }
      ),
      // Collaborations
      axios({
        url: `${process.env.REACT_APP_API_URL}/wp-json/wp/v2/collaboration-chats`,
        method: 'GET',
        headers: {
          Authorization: `Bearer ${userDetails.token}`
        }
      }),
      // Mentorship Chat
      axios({
        url: `${process.env.REACT_APP_API_URL}/wp-json/wp/v2/mentor-chats`,
        method: 'GET',
        headers: {
          Authorization: `Bearer ${userDetails.token}`
        }
      }),
    ])
    .then(([apiQuestion, apiUsers, currentUserApi, mentorRequest, allCollaborations, allMentorChats]) => {
      // Api for questions
      setGetHelpQuestions(apiQuestion?.data);
      // Api for users
      setGetUsers(apiUsers?.data);
      // Api for current user
      localStorage.setItem('userPoints', JSON.stringify(currentUserApi.data['acf']['user-points']));
      setUsersAccountDetails(currentUserApi.data);
      // Get mentor requests
      let relatedResponse = mentorRequest?.data?.filter((item) => {
        return item?.acf?.mentor_id === userDetails?.id || item?.acf?.mentee_id === userDetails?.id ;
      }).filter((item) => {
        return item?.acf?.mentor_agree === "Agree";
      });
      setEvents(relatedResponse);
      console.log(events);
      // Set collaborations
      let userCollaborations = 0
      allCollaborations?.data?.map((chat) => {
        if (chat?.acf?.participant_id == userDetails?.id || chat?.acf?.requestor_id == userDetails?.id) {
          userCollaborations++;
        }
      })
      setCollaborations(userCollaborations)
       // Set mentorships
       let userMentorships = 0
       allMentorChats?.data?.map((chat) => {
          if (chat?.acf?.mentee_id == userDetails?.id || chat?.acf?.mentor_id == userDetails?.id) {
            userMentorships++;
         }
       })
       setMentorships(userMentorships)
      // Loading
      setLoading(false);
    })
    .catch((error) => {
      console.error(error)
    })
  }, []);

      const questions = getHelpQuestions.map((question, index) => {
        let userName = "";
        let userProfileImg = "";
        let userJobInsitution = "";

        let questionPosted = Date.now() - new Date(question.date);
        // let days = Math.floor(questionPosted/(86400 * 1000));
        // Calculate total days
        let totalDays = Math.floor(questionPosted / (86400 * 1000));

        // Calculate years
        let years = Math.floor(totalDays / 365);

        // Calculate remaining days after extracting years
        let remainingDaysAfterYears = totalDays % 365;

        // Calculate months
        let months = Math.floor(remainingDaysAfterYears / 30);

        // Calculate remaining days after extracting months
        let days = remainingDaysAfterYears % 30;

        for (let name of getUsers) {
          if ( name.id == question.author) {
            userName = name.name;
            userProfileImg = name?.acf?.user_profile_picture;
            userJobInsitution = name?.['acf']?.['user-job-Insitution'];
          }
        }

        function commentCount() {
          return axios.get(`${question._links.replies['0'].href}`)
          .then((response) => {
            numberOfComments[0].count = response.data.length;
            localStorage.setItem(`comment_count(${question.title.rendered})`, numberOfComments[0].count)
          }).catch((err) => {});
        }

        // Parsing comments
        let count = localStorage.getItem(`comment_count(${question.title.rendered})`);
        // Ensure that numberOfComments is initialized as an object
        let numberOfComments = [{ count: parseInt(count) }]; // Parse string to integer
        // Then you can update the count property
        numberOfComments[0].count = parseInt(count); // Parse string to integer

        commentCount();
        if (question.status === "publish" && usersAccountDetails?.acf?.user_feild == question?.acf?.question_subject_area) {

          return (
          <div className="card mb-4" key={index}>
            <div className='card-body'>
              <div className="questions-details">
                <div className="questions-details-name">
                  <img className="questions-details-name-img" src={userProfileImg ? userProfileImg : defaultImage} loading="lazy" />
                  <div className="questions-details-name-info">
                    <p><strong>{userName}</strong></p>
                    <div className="questions-details-posted">
                      {userJobInsitution ?
                      (<div>
                        <p>{userJobInsitution}</p>
                      </div>) : ("")
                      }
                    <p>{years > 0 ? `${years} years ago` : months > 0 ? `${months} months ago` : days == 0 ? "Posted today" : `${days} days ago`}</p>
                    </div>
                  </div>
                </div>
              </div>
              <hr></hr>
              <p><strong>{question.title.rendered}</strong></p>
              <div dangerouslySetInnerHTML={{ __html: `${question.content.rendered.substring(0, 250)}${question.content.rendered.substring(3).slice(0, -5).length >= 250 ? '...' : ''}` }} />
              <div className='question-actions'>
                <div className="question-actions-button">
                  <Link to={`/question/${question.id}`}><button className="btn btn-outline-info btn-sm">View</button></Link>
                </div>
                <div className="question-actions-count">
                  <p>{ numberOfComments[0].count} {numberOfComments[0].count == 1 ? 'response' : 'responses'} </p>
                </div>
              </div>
            </div>
          </div>
          )
        }
      })


  if (localStorage.getItem('userDetails') != null) {
    if (loading === false) {
    return (
        <>
            <Navigation />
            <main>
                <div className="row" style={{background: "#FAFAFA"}}>
                    <div className="col-md-2 mt-4">
                        <SideNavigation />
                    </div>
                    <div className="col-md-10 mt-4">
                        <div className='page-header'>
                            <h1 className="mb-3">Welcome to LabSci!</h1>
                            <p>Start a convo, engage with posts, share your ideas!</p>
                        </div>
                        <div className="user-details">
                            <div className="user-detail user">
                                <div className="user-info-image">
                                    {usersAccountDetails['avatar_urls'] && usersAccountDetails['avatar_urls']['48'] !== 'https://secure.gravatar.com/avatar/bda5ea71631e2cce73beb5e17644bd74?s=48&d=mm&r=g' ? (
                                        <img src={usersAccountDetails?.acf?.user_profile_picture} alt="User Avatar" loading="lazy" />
                                    ) : (
                                        <img src={defaultImage} alt="Default User Avatar" loading="lazy" />
                                    )}
                                </div>
                                <div className="user-info-content">
                                    <p>Hi, <strong>{ userDetails.firstName  }</strong></p>
                                    <div className="link-item">
                                        <p><strong>You’ve earned {JSON.parse(localStorage.getItem('userPoints'))} pts</strong></p>
                                    </div>
                                </div>
                            </div>
                            <div className="user-detail">                     
                                <div className="user-info-image">
                                    <FontAwesomeIcon icon={faStar} />
                                </div>
                                <div className="user-info-content">
                                    <p>Notifications</p>
                                    <div className="link-item">
                                        <Link to="/profile">{notifications}</Link>
                                    </div>
                                </div>
                            </div>
                            <div className="user-detail">
                                <div className="user-info-image">
                                    <FontAwesomeIcon icon={faStar} />
                                </div>
                                <div className="user-info-content">
                                    <p>Upcoming Events</p>
                                    <div className="link-item">
                                        <Link to="/profile">{events.length}</Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="page-divider">
                            <p>Recent Posts</p>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
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
