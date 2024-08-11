import React, { useState, useEffect } from 'react';
import Navigation from './Navigation';
import HandShake from '../Images/handshake-svgrepo-com.svg';
import Gethelp from '../Images/brainstorm-idea-svgrepo-com.svg';
import Teach from '../Images/teach-learn-tell-student-svgrepo-com.svg';
import Borrow from '../Images/receive-svgrepo-com.svg';
import Job from '../Images/jobs-open-svgrepo-com.svg';
import Interview from '../Images/interview-7-svgrepo-com.svg';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import defaultImage from '../Images/5402435_account_profile_user_avatar_man_icon.svg';

export default function Dashboard() {
  const [getHelpQuestions, setGetHelpQuestions] = useState([]);
  const [getUsers, setGetUsers] = useState([]); // Do I Need?
  const [usersAccountDetails, setUsersAccountDetails] = useState({});
  let userDetails = JSON.parse(localStorage.getItem("userDetails"));

  // Api for questions
  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/wp-json/wp/v2/questions`, 
      {
        headers: {
          Authorization: `Bearer ${userDetails.token}`
        }
      }
    )
    .then((response) => {
      setGetHelpQuestions(response.data);
    })
    .catch()
  }, [])

  // Api for users
  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/wp-json/wp/v2/users`,
      {
        headers: {
          Authorization: `Bearer ${userDetails.token}`
        }
      }
    )
    .then((response) => {
     setGetUsers(response.data);
    })
    .catch()
  }, [])

  // Api for current user
  useEffect(() => {
    let userDetails = JSON.parse(localStorage.getItem("userDetails"));
    axios({
      url: `${process.env.REACT_APP_API_URL}/wp-json/wp/v2/users/${userDetails?.id}`,
      method: 'POST',
      headers: {
        Authorization: `Bearer ${userDetails.token}`
      }
    })
    .then((response) => {
      localStorage.setItem('userPoints', JSON.stringify(response.data['acf']['user-points']));
      setUsersAccountDetails(response.data);
    })
    .catch((err) => {
      // Handle error
    });
  }, []);

      const questions = getHelpQuestions.map((question, index) => {
        let userName = "";
        let userProfileImg = "";
        let userJobInsitution = "";

        let questionPosted = Date.now() - new Date(question.date);
        let days = Math.floor(questionPosted/(86400 * 1000));

        for (let name of getUsers) {
          if ( name.id == question.author) {
            userName = name.name;
            userProfileImg = name['avatar_urls']['48'];
            userJobInsitution = name['acf']['user-job-Insitution'];
          }
        }

        function commentCount() {
          return axios.get(`${question._links.replies['0'].href}`)
          .then((response) => {
            numberOfComments[0].count = response.data.length;
            localStorage.setItem(`comment_count${index}`, numberOfComments[0].count)
          })
        }

        // Parsing comments
        let count = localStorage.getItem(`comment_count${index}`);
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
                  <img className="questions-details-name-img" src={userProfileImg ? userProfileImg : defaultImage} loading="eager" />
                  <div className="questions-details-name-info">
                    <p><strong>{userName}</strong></p>
                    <div className="questions-details-posted">
                      {userJobInsitution ?
                      (<div>
                        <p>{userJobInsitution}</p>
                      </div>) : ("")
                      }
                    <p>{days == 0 ? "Posted today" : `${days}d ago`}</p>
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
  return (
    <>
    <Navigation />
    <div className="dashboard">
      <div className="container-fluid primary">
        <div className="row">
          
          <div className="col-lg-12">
            <div className="my-5">
              <h1>Welcome to <i>colLabb</i>, a collaborative network for scientists!</h1>
            </div>
            <div className="col">
              <div className="row">
                <div className='col-lg-3'>
                  <div className='dashboard-user'>
                    <div className="row">
                      <div className="col">
                        <div className="dashboard-user-details">
                          <div className="dashboard-user-details-image">
                          {usersAccountDetails['avatar_urls'] && usersAccountDetails['avatar_urls']['48'] !== 'https://secure.gravatar.com/avatar/bda5ea71631e2cce73beb5e17644bd74?s=48&d=mm&r=g' ? (
                            <img src={usersAccountDetails['avatar_urls']['48']} alt="User Avatar" loading="lazy" />
                          ) : (
                            <img src={defaultImage} alt="Default User Avatar" loading="lazy" />
                          )}
                          </div>
                          <p>Hi, <strong>{ userDetails.firstName  }</strong></p>
                        </div>
                      </div>
                    </div>
                    <br></br>
                    <hr></hr>
                    <div className="dashboard-user-details-links">
                      <div className="link-item">
                        <p><strong>You’ve earned {JSON.parse(localStorage.getItem('userPoints'))} pts</strong></p>
                      </div>
                      <div className="link-item">
                        <p>Notifications</p>
                        <a href="#">0</a>
                      </div>
                      <div className="link-item">
                        <p>New messages</p>
                        <a href="#">0</a>
                      </div>
                      <div className="link-item">
                        <p>Current collaborations</p>
                        <a href="#">0</a>
                      </div>
                      <div className="link-item">
                        <p>Current mentorships</p>
                        <a href="#">0</a>
                      </div>
                      <div className="dashboard-calender mt-3">
                        <p><strong>Scheduled meetings</strong></p>
                        <p className="small">*No interviews/meetings scheduled this week</p>
                      </div>
                      <div className="link-item">
                        <Calendar firstDayOfWeek={0}/>
                      </div>
                    </div>
                  </div>
                </div>
                <div className='col-lg-5'>
                  <div className="dashboard-options">
                    <div className='dashboard-options-buttons'>
                      <button className='btn-main'><img className="btn-main-icon" src={HandShake} loading="lazy"/>Find Collaborations</button >
                      <Link to="/ask-questions" className="dashboard-options-buttons-link"><button className='btn-main'><img className="btn-main-icon" src={Gethelp}/>Ask Questions</button></Link>
                      <Link to="/mentorship-opportunities" className="dashboard-options-buttons-link"><button className='btn-main'><img className="btn-main-icon" src={Teach}/>Mentorships</button></Link>
                      <button className='btn-main'><img className="btn-main-icon" src={Borrow} loading="lazy"/>Borrow Items</button>
                      <Link to="/jobs" className="dashboard-options-buttons-link"><button className='btn-main'><img className="btn-main-icon" src={Job}/>Jobs</button></Link>
                      <button className='btn-main'><img className="btn-main-icon" src={Interview} loading="lazy"/>Mock Interviews</button>
                    </div>
                  </div>
                </div>
                <div className="col-lg-4">
                  <div className="dashboard-questions">
                    <div className='dashboard-border'>
                      <p><strong>See recent questions from your peers related to your field of research.</strong></p>
                    </div>
                    <div className="dashboard-questions-items">
                      {questions}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
  } else {
    window.location.replace("/");
  }
}
