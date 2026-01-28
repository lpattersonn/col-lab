import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle, faPlay } from '@fortawesome/free-solid-svg-icons';
import { TailSpin } from 'react-loader-spinner';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { Editor } from '@tinymce/tinymce-react';
import imageCompression from 'browser-image-compression';
import { faStar, faArrowRight  } from '@fortawesome/free-solid-svg-icons';


import Navigation from '../Components/Navigation';
import SideNavigation from '../Components/Navigation/SideNavigation';
import defaultImage from '../Images/user-profile.svg';
import { dateFormat } from '../helper';

export default function Home() {
    const Navigate = useNavigate(); // keep your original naming
    const editorRef = useRef(null);

    const userDetails = useMemo(() => {
        try {
            return JSON.parse(localStorage.getItem('userDetails'));
        } catch {
            return null;
        }
    }, []);

    const [ getHelpQuestions, setGetHelpQuestions ] = useState([]);
    const [ getUsers, setGetUsers ] = useState([]);
    const [ usersAccountDetails, setUsersAccountDetails ] = useState(null);

    const [ notifications, setNotifications ] = useState(0);
    const [ events, setEvents ] = useState([]);
    const [ collaborations, setCollaborations ] = useState(0);
    const [ mentorships, setMentorships ] = useState(0);

    const [ loading, setLoading ] = useState(true);

    const [ createComment, setCreateComment ] = useState('');
    const [ file, setFile ] = useState(null);
    const [ commentStatus, setCommentStatus ] = useState('not approved');
    const [ serverComment, setServerComment ] = useState('');
    const [ successServerComment, setSuccessServerComment ] = useState('');

    const [ commentTotalsByPostId, setCommentTotalsByPostId ] = useState({});
    
    

    useEffect(() => {
        if (!userDetails?.token) {
            Navigate('/');
            return;
        }

        let isMounted = true;

        const headers = {
            Authorization: `Bearer ${userDetails.token}`,
        };

        Promise.all([
            axios.get(`${process.env.REACT_APP_API_URL}/wp-json/wp/v2/questions`, { headers }),
            axios.get(`${process.env.REACT_APP_API_URL}/wp-json/wp/v2/users`, { headers }),
            axios.get(`${process.env.REACT_APP_API_URL}/wp-json/wp/v2/users/${userDetails.id}`, { headers }),
            axios.get(`${process.env.REACT_APP_API_URL}/wp-json/wp/v2/mentor-requests`, { headers }),
            axios.get(`${process.env.REACT_APP_API_URL}/wp-json/wp/v2/collaboration-chats`, { headers }),
            axios.get(`${process.env.REACT_APP_API_URL}/wp-json/wp/v2/mentor-chats`, { headers }),
        ])
            .then(([ apiQuestion, apiUsers, currentUserApi, mentorRequest, allCollaborations, allMentorChats ]) => {
                if (!isMounted) return;

                setGetHelpQuestions(apiQuestion?.data || []);
                setGetUsers(apiUsers?.data || []);

                const currentUser = currentUserApi?.data || null;
                setUsersAccountDetails(currentUser);

                const points = currentUser?.acf?.['user-points'] ?? 0;
                localStorage.setItem('userPoints', JSON.stringify(points));

                const relatedResponse = (mentorRequest?.data || [])
                    .filter((item) => item?.acf?.mentor_id === userDetails?.id || item?.acf?.mentee_id === userDetails?.id)
                    .filter((item) => item?.acf?.mentor_agree === 'Agree');

                setEvents(relatedResponse);

                let userCollaborations = 0;
                (allCollaborations?.data || []).forEach((chat) => {
                    if (chat?.acf?.participant_id === userDetails?.id || chat?.acf?.requestor_id === userDetails?.id) {
                        userCollaborations += 1;
                    }
                });
                setCollaborations(userCollaborations);

                let userMentorships = 0;
                (allMentorChats?.data || []).forEach((chat) => {
                    if (chat?.acf?.mentee_id === userDetails?.id || chat?.acf?.mentor_id === userDetails?.id) {
                        userMentorships += 1;
                    }
                });
                setMentorships(userMentorships);

                setLoading(false);
            })
            .catch((error) => {
                console.error(error);
                setLoading(false);
            });

        return () => {
            isMounted = false;
        };
    }, [Navigate, userDetails?.id, userDetails?.token]);

    const usersById = useMemo(() => {
        const map = {};
        (getUsers || []).forEach((u) => {
            map[u.id] = u;
        });
        return map;
    }, [getUsers]);

    const getTimeAgo = (date) => {
        if (!date) return '';
        const diff = Date.now() - new Date(date).getTime();
        const totalDays = Math.floor(diff / (86400 * 1000));
        const years = Math.floor(totalDays / 365);
        const months = Math.floor((totalDays % 365) / 30);
        const days = totalDays % 30;

        if (years > 0) return `${years} years ago`;
        if (months > 0) return `${months} months ago`;
        if (days === 0) return 'Posted today';
        return `${days} days ago`;
    };

    useEffect(() => {
        if (!userDetails?.token) return;
        if (!getHelpQuestions?.length) return;

        let isMounted = true;

        const headers = {
            Authorization: `Bearer ${userDetails.token}`,
        };

        const fetchTotals = async () => {
            try {
                const ids = getHelpQuestions
                    .filter((q) => q?.id)
                    .map((q) => q.id);

                const missing = ids.filter((id) => typeof commentTotalsByPostId[id] !== 'number');
                if (!missing.length) return;

                const requests = missing.map((postId) =>
                    axios.get(
                        `${process.env.REACT_APP_API_URL}/wp-json/wp/v2/comments`,
                        {
                            headers,
                            params: {
                                post: postId,
                                per_page: 1,
                            },
                        }
                    )
                        .then((res) => {
                            const total = parseInt(res.headers?.['x-wp-total'] || '0', 10);
                            return [ postId, Number.isFinite(total) ? total : 0 ];
                        })
                        .catch(() => [ postId, 0 ])
                );

                const results = await Promise.all(requests);

                if (!isMounted) return;

                setCommentTotalsByPostId((prev) => {
                    const next = { ...prev };
                    results.forEach(([ id, total ]) => {
                        next[id] = total;
                    });
                    return next;
                });
            } catch (err) {
                console.error(err);
            }
        };

        fetchTotals();

        return () => {
            isMounted = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [getHelpQuestions, userDetails?.token]);

    const clearEditor = () => {
        setCreateComment('');
        setFile(null);
        setCommentStatus('not approved');
        setServerComment('');
        setSuccessServerComment('');
        editorRef.current?.setContent('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setServerComment('');
        setSuccessServerComment('');

        if (!userDetails?.token) {
            Navigate('/');
            return;
        }

        const stripped = (createComment || '').replace(/<[^>]*>/g, '').trim();
        if (!stripped) {
            setServerComment('Please write something before submitting.');
            return;
        }

        try {
            const headers = {
                Authorization: `Bearer ${userDetails.token}`,
            };

            let imageUrl = '';

            if (file) {
                const options = {
                    maxSizeMB: 1,
                    maxWidthOrHeight: 1280,
                    useWebWorker: true,
                };

                const compressed = await imageCompression(file, options);
                const finalFile = new File([compressed], file.name, { type: file.type });

                const formData = new FormData();
                formData.append('file', finalFile);

                const mediaRes = await axios.post(
                    `${process.env.REACT_APP_API_URL}/wp-json/wp/v2/media`,
                    formData,
                    { headers }
                );

                imageUrl = mediaRes?.data?.source_url || '';
            }

            const created = await axios.post(
                `${process.env.REACT_APP_API_URL}/wp-json/wp/v2/questions`,
                {
                    title: stripped.slice(0, 80) || 'New Question',
                    content: createComment,
                    status: 'publish',
                    acf: imageUrl ? { question_image: imageUrl } : undefined,
                },
                { headers }
            );

            setSuccessServerComment('Success! Your post has been published.');
            setCommentStatus(created?.data?.status || 'approved');

            editorRef.current?.setContent('');
            setCreateComment('');
            setFile(null);

            setGetHelpQuestions((prev) => [ created.data, ...(prev || []) ]);
        } catch (err) {
            console.error(err);
            setServerComment('Something went wrong. Please try again.');
        }
    };

    const questions = useMemo(() => {
        const userField = usersAccountDetails?.acf?.user_feild;
        if (!getHelpQuestions?.length) return [];

        return getHelpQuestions.map((question, index) => {
            if (!question) return null;

            const author = usersById[question.author];
            const userName = author?.name || '';
            const userProfileImg = author?.acf?.user_profile_picture;
            const userJobInsitution = author?.acf?.['user-job-Insitution'];

            const commentTotal = commentTotalsByPostId[question.id] ?? 0;

            if (question.status !== 'publish') return null;
            if (userField && question?.acf?.question_subject_area && userField !== question?.acf?.question_subject_area) return null;

            const rendered = question?.content?.rendered || '';
            const snippetText = rendered.substring(0, 250);
            const ellipsis = rendered.replace(/<[^>]*>/g, '').length > 250 ? '...' : '';

            return (
                <div className="card mb-4" key={question.id || index}>
                    <div className="card-body">
                        <div className="questions-details">
                            <div className="questions-details-name">
                                <img
                                    className="questions-details-name-img"
                                    src={userProfileImg ? userProfileImg : defaultImage}
                                    alt={userName || 'User'}
                                    loading="lazy"
                                />
                                <div className="questions-details-name-info">
                                    <p><strong>{userName}</strong></p>
                                    <div className="questions-details-posted">
                                        <p>{getTimeAgo(question.date)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <p><strong className='lead'>{question?.title?.rendered}</strong></p>

                        {rendered ? (
                            <div
                                dangerouslySetInnerHTML={{
                                    __html: `${snippetText}${ellipsis}`,
                                }}
                            />
                        ) : null}

                        <div className="question-actions">
                            <div className="question-actions-count">
                                <p>
                                    {commentTotal} {commentTotal === 1 ? 'response' : 'responses'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            );
        });
    }, [getHelpQuestions, usersAccountDetails?.acf?.user_feild, usersById, commentTotalsByPostId]);

    if (!localStorage.getItem('userDetails')) {
        window.location.replace('/');
        return null;
    }

    if (loading) {
        return (
            <TailSpin
                visible={true}
                height="80"
                width="80"
                color="#001923"
                ariaLabel="tail-spin-loading"
                radius="1"
                wrapperStyle={{ position: 'absolute', top: 0, left: 0, right: 0 }}
                wrapperClass="spinner"
            />
        );
    }

    return (
        <>
            <Navigation user={usersAccountDetails} />
            <main>
                <div className="page-body-container">
                    <div className="side-navigation-container" style={{ background: '#ffffff' }}>
                        <SideNavigation />
                    </div>

                    <div className="mt-4">
                        <div className="page-header">
                            <div>
                                <h1 className="mb-3">Points Center</h1>
                                <p>Learn how to earn points and start unlocking exclusive platform features</p>
                            </div>
                        </div>

                        <div className="user-details">
                            <div className="user-detail user user-detail-home">
                                <div className="user-info-image">
                                    {usersAccountDetails?.avatar_urls?.['48'] &&
                                    usersAccountDetails?.avatar_urls?.['48'] !== 'https://secure.gravatar.com/avatar/bda5ea71631e2cce73beb5e17644bd74?s=48&d=mm&r=g' ? (
                                        <img
                                            src={usersAccountDetails?.acf?.user_profile_picture || defaultImage}
                                            alt="User Avatar"
                                            loading="lazy"
                                        />
                                    ) : (
                                        <img src={defaultImage} alt="Default User Avatar" loading="lazy" />
                                    )}
                                </div>

                                <div className="user-info-content">
                                    <p>Hi, <strong>{userDetails?.firstName}</strong></p>

                                </div>
                            </div>

                            <Link to="/profile">
                                <div className="user-detail user-detail-home">
                                    <div className="user-info-image user-notifcations">
                                        <FontAwesomeIcon icon={faStar} />
                                    </div>
                                    <div className="user-info-content notifcations">

                                        <div className="title-row">
                                            <p>Points Earned</p>
                                                <span className="arrow-icon">
                                                    <FontAwesomeIcon icon={faArrowRight} />
                                                </span>
                                        </div>
                                            <div className="link-item">
                                                {notifications}
                                            </div>
                                    </div>
                                </div>
                            </Link>

                        </div>


                        <div className="page-body single-container">
                            {/* <div className="posts"> */}
                                {/* <div className="create-posts">
                                </div> */}

                                <div className="page-divider" style={{width: "50%"}}>
                                    <p className="p-divider">Here’s how to earn LabSci points</p>
                                </div>
                            {/* </div> */}
                        </div>


                        <div className="page-body-2 single-container">
                            <div className="posts">
                                <div className="create-posts">
                                </div>
                            <div className="container-3">
                              
                                {/* Participate */}
                                <div className="points-box">
                                    <span className="points-tag">Participate</span>

                                    <ul className="points-list">
                                        <li>Answer a question <span>→ 2 points</span></li>
                                        <li>Share a resource <span>→ 4 points</span></li>
                                        <li>Collaborate <span>→ 6 points</span></li>
                                        <li>Teach a skill <span>→ 6 points</span></li>
                                    </ul>
                                </div>

                                {/* Buy Points */}
                                <div className="points-box">
                                    <span className="points-tag">Buy Points</span>

                                    <p className="points-list">Buy points ($5 for 50 points)</p>

                                    <div className="buy-points-card">
                                        <label>
                                            How many points would you like to buy? (Minimum of 50)
                                        </label>

                                        <div className="buy-row">
                                            <strong>$5</strong>
                                            <button className="btn btn-outline">Checkout</button>
                                        </div>
                                    </div>
                                </div>

                                {/* Watch Ad */}
                                <div className="points-box">
                                    <span className="points-tag">Watch Ad</span>

                                    <p className="points-list">
                                        We encourage participation in order to gain points.
                                        However, below are alternative ways to score points:
                                    </p>

                                    <p><strong>Watch ad for 1 point.</strong></p>

                                    <button className="play-ad-btn">
                                        <FontAwesomeIcon icon={faPlay} />
                                    </button>
                                </div>

                                </div>

                            </div>
                        </div>



                    </div>
         
                </div>
            </main>
        </>
    );
}