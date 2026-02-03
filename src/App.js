import React, { useEffect } from 'react';
import {BrowserRouter as Router, Route, Routes, Switch} from "react-router-dom";
// import './Styles/_compiled/style.css';
import Dashboard from './Components/Dashboard';
import axios from 'axios';
import Home from './Components/Dashboard/Home';
import Login from './Components/Login';
import Registration from './Components/Registration';
import Profile from './Components/Profile';
import AskQuestions from './Components/AskQuestions';
import Question from './Components/Question';
import Jobs from './Components/Jobs';
import CreateJob from './Components/CreateJob';
import Job from './Components/Job';
import Mentorships from './Components/Mentorships';
import MentorSignup from './Components/MentorSignup';
import Mentor from './Components/Mentor';
import MentorChat from './Components/MentorChat';
import Collaborations from './Components/Collaborations';
import CollaborationsMyRequests from './Components/CollaborationsMyRequests';
import CollaborationsCurrent from './Components/CollaborationsCurrent';
import CollaborationsCompleted from './Components/CollaborationsCompleted';
import CollaborationRequest from './Components/CollaborationRequest';
import CollaborationChat from './Components/CollaborationChat';
import Request from './Components/Request';
import LearningCenter from './Components/LearningCenter';
import LearningRequest from './Components/LearningRequest';
import GetHelp from './Components/GetHelp';
import GetHelpMyQuestions from './Components/GetHelpMyQuestions';
import GetHelpMyComments from './Components/GetHelpMyComments';
import ShareResources from './Components/ShareResources';
import ShareResourcesMyRequests from './Components/ShareResourcesMyRequests';
import ShareResourcesSuccessfulShares from './Components/ShareResourcesSuccessfulShares';
import BorrowRequest from './Components/BorrowRequest';
import CreateQuestion from './Components/CreateQuestion';
import BorrowItemsChat from './Components/BorrowItemsChat';
import LearningCenterChat from './Components/LearnCenterChat';
import PointsCenter from './Pages/PointsCenter';
import MyActivity from './Pages/MyActivity';
import ChatRoom from './Components/ChatRoom';
import ChatRoomCollaborations from './Components/ChatRoomCollaborations';
import ChatRoomMentorships from './Components/ChatRoomMentorships';
import ChatRoomShareResources from './Components/ChatRoomShareResources';
import ChatRoomLearningCenter from './Components/ChatRoomLearningCenter';
import SettingsPassword from './Components/SettingsPassword';
import SettingsBilling from './Components/SettingsBilling';
import SettingsSupport from './Components/SettingsSupport';
import Notifications from './Components/Notifications';
import MentorshipsMyMentors from './Components/MentorshipsMyMentors';
import MentorshipsMyMentees from './Components/MentorshipsMyMentees';
import MentorshipsUpcomingMeetings from './Components/MentorshipsUpcomingMeetings';
import JobsMyPostings from './Components/JobsMyPostings';
import JobsApplied from './Components/JobsApplied';
import LearningCenterMyRequests from './Components/LearningCenterMyRequests';
import LearningCenterCertificates from './Components/LearningCenterCertificates';
import LearningCenterUpcomingMeetings from './Components/LearningCenterUpcomingMeetings';

function App() {

  // Global interceptor for legacy axios calls (fallback safety net)
  // New code should use 'api' from services/api.js which handles refresh tokens
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      response => response,
      error => {
        const errorCode = error?.response?.data?.code;
        console.log('Global axios interceptor caught error:', errorCode, error?.response?.data?.message);

        // Only clear tokens if explicitly invalid (not just expired)
        // The api.js interceptor will handle refresh token logic
        if (errorCode === "jwt_auth_invalid_token") {
          console.warn('Invalid token detected by global interceptor');
          // Don't auto-logout here - let the user see what's happening
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login/>} />
        <Route path="/registration" element={<Registration/>} />
        <Route path="/" element={<Home/>} />
        <Route path="/chat-room" element={<ChatRoom/>} />
        <Route path="/chat-room/collaborations" element={<ChatRoomCollaborations/>} />
        <Route path="/chat-room/mentorships" element={<ChatRoomMentorships/>} />
        <Route path="/chat-room/share-resources" element={<ChatRoomShareResources/>} />
        <Route path="/chat-room/learning-center" element={<ChatRoomLearningCenter/>} />
        <Route path="/settings/profile" element={<Profile/>} />
        <Route path="/settings/password" element={<SettingsPassword/>} />
        <Route path="/settings/billing" element={<SettingsBilling/>} />
        <Route path="/settings/support" element={<SettingsSupport/>} />
        <Route path="/notifications" element={<Notifications/>} />
        <Route path="/ask-questions" element={<AskQuestions/>} />
        <Route path="/question/:param1" element={<Question/>} />
        <Route path="/jobs" element={<Jobs/>} />
        <Route path="/jobs/my-postings" element={<JobsMyPostings/>} />
        <Route path="/jobs/applied" element={<JobsApplied/>} />
        <Route path="/create-job" element={<CreateJob/>} />
        <Route path="/job/:param1" element={<Job/>} />
        <Route path="/mentorships" element={<Mentorships/>} />
        <Route path="/mentorships/my-mentors" element={<MentorshipsMyMentors/>} />
        <Route path="/mentorships/my-mentees" element={<MentorshipsMyMentees/>} />
        <Route path="/mentorships/upcoming-meetings" element={<MentorshipsUpcomingMeetings/>} />
        <Route path="/mentor-signup" element={<MentorSignup/>} />
        <Route path="/mentor/:param1" element={<Mentor/>} />
        <Route path="/mentor-chat/:param1" element={<MentorChat/>} />
        <Route path="/collaborations" element={<Collaborations/>} />
        <Route path="/collaborations/my-requests" element={<CollaborationsMyRequests/>} />
        <Route path="/collaborations/current" element={<CollaborationsCurrent/>} />
        <Route path="/collaborations/completed" element={<CollaborationsCompleted/>} />
        <Route path="/collaboration-request" element={<CollaborationRequest />} />
        <Route path="/collaborations/:param1" element={<Request />} />
        <Route path="/collaboration-chat/:param1" element={<CollaborationChat />} />
        <Route path="/learning-center" element={<LearningCenter />} />
        <Route path="/learning-center/my-requests" element={<LearningCenterMyRequests />} />
        <Route path="/learning-center/certificates" element={<LearningCenterCertificates />} />
        <Route path="/learning-center/upcoming-meetings" element={<LearningCenterUpcomingMeetings />} />
        <Route path="/learning-request" element={<LearningRequest />} />
        <Route path="/get-help" element={<GetHelp />} />
        <Route path="/get-help/my-questions" element={<GetHelpMyQuestions />} />
        <Route path="/get-help/my-comments" element={<GetHelpMyComments />} />
        <Route path="/share-resources" element={<ShareResources />} />
        <Route path="/share-resources/my-requests" element={<ShareResourcesMyRequests />} />
        <Route path="/share-resources/successful-shares" element={<ShareResourcesSuccessfulShares />} />
        <Route path="/borrow-items-chat/:param1" element={<BorrowItemsChat />} />
        <Route path="/borrow-request" element={<BorrowRequest />} />
        <Route path="/create-question" element={<CreateQuestion />} />
        <Route path="/learning-center-chat/:param1" element={<LearningCenterChat />} />
        <Route path="/points-center" element={<PointsCenter />} />
        <Route path="/my-activity" element={<MyActivity />} />
      </Routes>
   </Router>
  );
}

export default App;
