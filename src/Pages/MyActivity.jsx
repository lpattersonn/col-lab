import React, {useState, useEffect} from 'react';
import { TailSpin } from "react-loader-spinner";
import Navigation from '../Components/Navigation';
import Activities from '../Components/Activities';
import api from '../services/api';

export default function MyActivity() {
    const userDetails = JSON.parse(localStorage.getItem('userDetails'));
    const [questions, setQuestions] = useState([]);
    const [borrowItems, setBorrowItems] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [lerningCenterItems, setLerningCenterItems] = useState([]);
    const [collaborationItems, setCollaborationItems] = useState([]);
    const [updateState, setUpdateState] = useState(false);
    const [users, setUsers] = useState([]);

    const [selected, setSelected] = useState("questions");
    const [activities, setActivities] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
        // My questions
        api({
            url: `/wp-json/wp/v2/questions`,
            method: 'GET',
            headers: {
            Authorization: `Bearer ${userDetails.token}`
            }
        }),
        // All Borrow request
        api({
            url: `/wp-json/wp/v2/borrow-items`,
            method: 'GET',
            headers: {
            Authorization: `Bearer ${userDetails.token}`
            }
        }),
        // All Jobs
        api({
            url: `/wp-json/wp/v2/jobs`,
            method: 'GET',
            headers: {
            Authorization: `Bearer ${userDetails.token}`
            }
        }),
        // All learning center
        api({
            url: `/wp-json/wp/v2/learning-center`,
            method: 'GET',
            headers: {
            Authorization: `Bearer ${userDetails.token}`
            }
        }),
        // All collaborations
        api({
            url: `/wp-json/wp/v2/collaborations`,
            method: 'GET',
            headers: {
            Authorization: `Bearer ${userDetails.token}`
            }
        }),
        // Users
        api.get(`/wp-json/wp/v2/users`, 
        {
            headers: {
                Authorization: `Bearer ${userDetails.token}`
                }
        }),
        ])
        .then(([allQuestions, allBorrowItems, allJobs, allLearningCenter, allCollaborations, allUsers]) => {
            // All questions
            setQuestions(allQuestions?.data?.filter((item) => {
                if (search.length > 0) {
                    return item?.author == userDetails?.id && item?.title?.rendered?.includes(search);
                }
                return item?.author == userDetails?.id;
            }));
            setActivities(allQuestions?.data?.filter((item) => {
                if (search.length > 0) {
                    return item?.author == userDetails?.id && item?.title?.rendered?.includes(search);
                }
                return item?.author == userDetails?.id;
            }))
            // All Borrow request
            setBorrowItems(allBorrowItems?.data.filter((item) => {
                if (search.length > 0) {
                    return item?.author == userDetails?.id && item?.title?.rendered?.includes(search);
                }
                return item?.author == userDetails?.id;
            }));
            // All jobs
            setJobs(allJobs?.data.filter((item) => {
                if (search.length > 0) {
                    return item?.author == userDetails?.id && item?.title?.rendered?.includes(search);
                }
                return item?.author == userDetails?.id;
            }));
            // All Learning Center
            setLerningCenterItems(allLearningCenter?.data.filter((item) => {
                if (search.length > 0) {
                    return item?.author == userDetails?.id && item?.title?.rendered?.includes(search);
                }
                return item?.author == userDetails?.id;
            }));
            // All collaborations
            setCollaborationItems(allCollaborations?.data.filter((item) => {
                if (search.length > 0) {
                    return item?.author == userDetails?.id && item?.title?.rendered?.includes(search);
                }
                return item?.author == userDetails?.id;
            }));
            // Users
            setUsers(allUsers?.data);
            setLoading(false)
        })
        .catch((error) => {
            console.error(error);
        })
    }, [updateState, search]);

    if ( userDetails != null) {
        if (loading === false) {
            return(
            <>
                <Navigation user={userDetails} />
                <main className="activity">
                    <div className="container-fluid">
                        <div className="page-filter mb-5">
                            <div className="row d-flex flex-direction-row align-items-center justify-content-between mb-5">
                                <div className="col-md-6">
                                    <p className="lead"><strong>View your activity and make adjustments as needed.</strong></p>
                                </div>
                                <div className="col-md-6" style={{maxWidth: "330px"}}>
                                    <input type="search" name="search" className="form-control" placeholder='Start typing to search' value={search} onChange={(e) => {
                                        setSearch(e.target.value)
                                    }} />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-md-3">
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
                                    </ul>
                                </nav>
                            </div>
                            <div className="col-md-9">
                                <Activities selected={selected} activities={activities} keyword={search} users={users} setUpdateState={setUpdateState} />
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