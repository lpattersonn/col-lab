import React from 'react';
import {BrowserRouter as Router, Route, Routes, Switch} from "react-router-dom";
// import './Styles/_compiled/style.css';
import Dashboard from './Components/Dashboard';
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
import CollaborationRequest from './Components/CollaborationRequest';
import CollaborationChat from './Components/CollaborationChat';
import Request from './Components/Request';
import LearningCenter from './Components/LearningCenter';
import LearningRequest from './Components/LearningRequest';
import GetHelp from './Components/GetHelp';
import ShareResources from './Components/ShareResources';
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

function App() {
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
        <Route path="/create-job" element={<CreateJob/>} />
        <Route path="/job/:param1" element={<Job/>} />
        <Route path="/mentorships" element={<Mentorships/>} />
        <Route path="/mentor-signup" element={<MentorSignup/>} />
        <Route path="/mentor/:param1" element={<Mentor/>} />
        <Route path="/mentor-chat/:param1" element={<MentorChat/>} />
        <Route path="/collaborations" element={<Collaborations/>} />
        <Route path="/collaboration-request" element={<CollaborationRequest />} />
        <Route path="/collaborations/:param1" element={<Request />} />
        <Route path="/collaboration-chat/:param1" element={<CollaborationChat />} />
        <Route path="/learning-center" element={<LearningCenter />} />
        <Route path="/learning-request" element={<LearningRequest />} />
        <Route path="/get-help" element={<GetHelp />} />
        <Route path="/share-resources" element={<ShareResources />} />
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
