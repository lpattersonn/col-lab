import React, {useState, useEffect} from 'react';
import { TailSpin } from "react-loader-spinner";
import Navigation from '../Components/Navigation';
import Activities from '../Components/Activities';
import axios from 'axios';

export default function MyActivity() {
    const userDetails = JSON.parse(localStorage.getItem('userDetails'));
    const [questions, setQuestions] = useState([]);
    const [borrowItems, setBorrowItems] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [lerningCenterItems, setLerningCenterItems] = useState([]);
    const [collaborationItems, setCollaborationItems] = useState([]);

    const [selected, setSelected] = useState("questions");
    const [activities, setActivities] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
        // My questions
        axios({
            url: `${process.env.REACT_APP_API_URL}/wp-json/wp/v2/questions`,
            method: 'GET',
            headers: {
            Authorization: `Bearer ${userDetails.token}`
            }
        }),
        // All Borrow request
        axios({
            url: `${process.env.REACT_APP_API_URL}/wp-json/wp/v2/borrow-items`,
            method: 'GET',
            headers: {
            Authorization: `Bearer ${userDetails.token}`
            }
        }),
        // All Jobs
        axios({
            url: `${process.env.REACT_APP_API_URL}/wp-json/wp/v2/jobs`,
            method: 'GET',
            headers: {
            Authorization: `Bearer ${userDetails.token}`
            }
        }),
        // All learning center
        axios({
            url: `${process.env.REACT_APP_API_URL}/wp-json/wp/v2/learning-center`,
            method: 'GET',
            headers: {
            Authorization: `Bearer ${userDetails.token}`
            }
        }),
        // All collaborations
        axios({
            url: `${process.env.REACT_APP_API_URL}/wp-json/wp/v2/collaborations`,
            method: 'GET',
            headers: {
            Authorization: `Bearer ${userDetails.token}`
            }
        }),
        ])
        .then(([allQuestions, allBorrowItems, allJobs, allLearningCenter, allCollaborations]) => {
            // All questions
            setQuestions(allQuestions?.data);
            setActivities(allQuestions?.data)
            // All Borrow request
            setBorrowItems(allBorrowItems?.data);
            // All jobs
            setJobs(allJobs?.data);
            // All Learning Center
            setLerningCenterItems(allLearningCenter?.data);
            // All collaborations
            setCollaborationItems(allCollaborations?.data);
          
            setLoading(false)
        })
        .catch((error) => {
            console.error(error);
        })
    }, []);

    if ( userDetails != null) {
        if (loading === false) {
            return(
            <>
                <Navigation />
                <main className="activity">
                    <div className="container">
                        <div className="page-filter mb-5">
                            <div className="row mb-5">
                                <div className="col-12">
                                    <p className="lead"><strong>View your activity and make adjustments as needed.</strong></p>
                                </div>
                                <div className="col-12" style={{maxWidth: "330px"}}>
                                    <input type="search" name="search" className="form-control" placeholder='Start typing to search' value={search} onChange={(e) => {
                                        setSearch(e.target.value)
                                    }} />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-md-4">
                                <nav className='activity-buttons'>
                                    <ul>
                                        <li className={selected === 'questions' ? 'active' : ''} onClick={() => {
                                            setSelected('questions');
                                            setActivities(questions);
                                            }}>Questions</li>
                                        <li className={selected === 'borrow-items' ? 'active' : ''} onClick={() => {
                                            setSelected('borrow-items');
                                            setActivities(borrowItems);
                                            }}>Borrow Requests</li>
                                        <li className={selected === 'jobs' ? 'active' : ''} onClick={() => {
                                            setSelected('jobs');
                                            setActivities(jobs);
                                            }}>Job Postings</li>
                                        <li className={selected === 'learning-center' ? 'active' : ''} onClick={() => {
                                            setSelected('learning-center');
                                            setActivities(lerningCenterItems);
                                            }}>Learning Requests</li>
                                        <li className={selected === 'collaborations' ? 'active' : ''} onClick={() => {
                                            setSelected('collaborations');
                                            setActivities(collaborationItems);
                                            }}>Collaboration Requests</li>
                                        <li className={selected === 'mentorship' ? 'active' : ''} onClick={() => {setSelected('mentorship')}}>Mentorship Profile</li>
                                    </ul>
                                </nav>
                            </div>
                            <div className="col-md-8">
                                <Activities activities={activities} keyword={search} />
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
};