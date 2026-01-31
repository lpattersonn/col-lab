import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { Editor } from '@tinymce/tinymce-react';
import imageCompression from 'browser-image-compression';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faArrowRight, faMagnifyingGlass, faClock } from '@fortawesome/free-solid-svg-icons';
import { TailSpin } from 'react-loader-spinner';

import Navigation from './Navigation';
import SideNavigation from './Navigation/SideNavigation';
import defaultImage from '../Images/user-profile.svg';
import likeIcon from '../Images/like-svgrepo-com.svg';
import commentIcon from '../Images/comment-svgrepo-com.svg';
import { dateFormat, humanReadableDate } from '../helper';



export default function Collaborations() {
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
    const [ showScheduleForm, setShowScheduleForm ] = useState(false);
    const [ scheduledEventsLocal, setScheduledEventsLocal ] = useState([]);
    const [ newEventTitle, setNewEventTitle ] = useState('');
    const [ newEventDate, setNewEventDate ] = useState('');

    const [ loading, setLoading ] = useState(true);
    const [ openComments, setOpenComments ] = useState({});
    const [ commentInputs, setCommentInputs ] = useState({});
    const [ commentThreads, setCommentThreads ] = useState({});
    const [ expandedPosts, setExpandedPosts ] = useState({});

    const [ createComment, setCreateComment ] = useState('');
    const [ file, setFile ] = useState(null);
    const [ commentStatus, setCommentStatus ] = useState('not approved');
    const [ serverComment, setServerComment ] = useState('');
    const [ successServerComment, setSuccessServerComment ] = useState('');

    const [ commentTotalsByPostId, setCommentTotalsByPostId ] = useState({});

    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        country: '',
        field: '',
        purpose: '',
    });

    const handleScheduleSubmit = (e) => {
        e.preventDefault();
        if (!newEventTitle.trim() || !newEventDate) return;
        setScheduledEventsLocal((prev) => [
            { title: newEventTitle.trim(), date: newEventDate },
            ...prev,
        ]);
        setNewEventTitle('');
        setNewEventDate('');
        setShowScheduleForm(false);
    };

    const upcomingThisWeek = useMemo(() => {
        const now = new Date();
        const weekFromNow = new Date();
        weekFromNow.setDate(now.getDate() + 7);

        return (scheduledEventsLocal || []).filter((event) => {
            const eventDate = new Date(event.date);
            return eventDate >= now && eventDate <= weekFromNow;
        });
    }, [scheduledEventsLocal]);


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

    const handleCommentChange = (postId, value) => {
        setCommentInputs((prev) => ({ ...prev, [postId]: value }));
    };

    const handleCommentSubmit = async (postId) => {
        const content = (commentInputs?.[postId] || '').trim();
        if (!content) return;
        if (!userDetails?.token || !userDetails?.id) {
            Navigate('/');
            return;
        }

        try {
            const headers = { Authorization: `Bearer ${userDetails.token}` };
            const res = await axios.post(
                `${process.env.REACT_APP_API_URL}/wp-json/wp/v2/comments`,
                {
                    post: postId,
                    content,
                    author: userDetails.id,
                },
                { headers }
            );

            const displayName =
                userDetails?.displayName ||
                userDetails?.user_display_name ||
                [userDetails?.firstName, userDetails?.lastName].filter(Boolean).join(' ') ||
                'User';

            const newComment = {
                id: res?.data?.id || Date.now(),
                author: displayName,
                date: res?.data?.date || new Date().toISOString(),
                content: res?.data?.content?.rendered || content,
            };

            setCommentThreads((prev) => ({
                ...prev,
                [postId]: [newComment, ...(prev[postId] || [])],
            }));
            setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
            setCommentTotalsByPostId((prev) => ({
                ...prev,
                [postId]: (prev[postId] ?? 0) + 1,
            }));
        } catch (error) {
            console.error('Error submitting comment:', error?.response?.data || error.message);
        }
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
            const intention =
                question?.acf?.pay ||
                question?.acf?.learning_pay ||
                question?.acf?.borrow_pay ||
                question?.acf?.collaborations_pay ||
                '';
            const deadline =
                question?.acf?.deadline ||
                question?.acf?.learning_deadline ||
                question?.acf?.borrow_deadline ||
                question?.acf?.collaborations_deadline ||
                '';

            const commentTotal = commentTotalsByPostId[question.id] ?? 0;

            if (question.status !== 'publish') return null;
            if (userField && question?.acf?.question_subject_area && userField !== question?.acf?.question_subject_area) return null;

            const rendered = question?.content?.rendered || '';
            const plainText = rendered.replace(/<[^>]*>/g, '');
            const isExpanded = Boolean(expandedPosts[question.id]);
            const shouldTruncate = plainText.length > 250;
            const snippetText = rendered.substring(0, 250);
            const ellipsis = shouldTruncate ? '...' : '';

            const isCommentsOpen = Boolean(openComments[question.id]);

            return (
                <div className="card collaboration-card mb-4 share-card" key={question.id || index}>
                    <div className="card-body share-card-body">
                        <span className="share-card-intention">
                            {intention || 'Intention'}
                        </span>
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
                            <div>
                                <div
                                    dangerouslySetInnerHTML={{
                                        __html: isExpanded ? rendered : `${snippetText}${ellipsis}`,
                                    }}
                                />
                                {shouldTruncate ? (
                                    <button
                                        type="button"
                                        className="read-more-btn"
                                        onClick={() =>
                                            setExpandedPosts((prev) => ({
                                                ...prev,
                                                [question.id]: !prev[question.id],
                                            }))
                                        }
                                    >
                                        {isExpanded ? 'Show less' : 'Read more'}
                                    </button>
                                ) : null}
                            </div>
                        ) : null}

                        <div className="question-actions">
                            <div className="question-actions-meta">
                                <button
                                    type="button"
                                    className="question-actions-btn"
                                    onClick={() =>
                                        setOpenComments((prev) => ({
                                            ...prev,
                                            [question.id]: !prev[question.id],
                                        }))
                                    }
                                >
                                    <img src={commentIcon} alt="" className="like-icon" aria-hidden="true" />
                                    <span>{commentTotal} Comments</span>
                                </button>
                            </div>
                            <div className="share-card-deadline">
                                <FontAwesomeIcon icon={faClock} />
                                <span>{deadline ? humanReadableDate(deadline) : 'Deadline'}</span>
                            </div>
                        </div>

                        {isCommentsOpen ? (
                            <div className="question-comments">
                                <div className="question-comments-input">
                                    <textarea
                                        placeholder="Write a comment..."
                                        rows={3}
                                        value={commentInputs?.[question.id] || ''}
                                        onChange={(e) => handleCommentChange(question.id, e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        className="btn btn-outline"
                                        onClick={() => handleCommentSubmit(question.id)}
                                    >
                                        Post
                                    </button>
                                </div>
                                <div className="question-comments-list">
                                    {(commentThreads?.[question.id] || []).map((comment) => (
                                        <div className="comment-item" key={comment.id}>
                                            <img
                                                className="comment-avatar"
                                                src={defaultImage}
                                                alt={comment.author}
                                                loading="lazy"
                                            />
                                            <div className="comment-body">
                                                <div className="comment-meta">
                                                    <strong>{comment.author}</strong>
                                                    <span>Just now</span>
                                                </div>
                                                <p>{comment.content?.replace?.(/<[^>]*>/g, '') || comment.content}</p>
                                                <div className="comment-actions">
                                                    <button type="button" className="comment-like">
                                                        <img src={likeIcon} alt="" className="like-icon" aria-hidden="true" />
                                                        <span>Like</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : null}
                    </div>
                </div>
            );
        });
        
    }, [getHelpQuestions, usersAccountDetails?.acf?.user_feild, usersById, commentTotalsByPostId, openComments, commentInputs, commentThreads, expandedPosts]);
          
    const filteredQuestions = useMemo(() => {
    if (!questions?.length) return [];

    return questions.filter(Boolean).filter((card) => {
        const textContent =
            card.props?.children?.toString?.().toLowerCase() || '';

        const matchesSearch =
            !searchTerm ||
            textContent.includes(searchTerm.toLowerCase());

        return matchesSearch;
    });
}, [questions, searchTerm]);


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
           <Navigation user={userDetails} />
            <main>
                <div className="page-body-container">
                    <div className="side-navigation-container" style={{ background: '#ffffff' }}>
                        <SideNavigation />
                    </div>

                    <div className="mt-4">
                        <div className="page-header">
                            <div>
                                <h1 className="mb-3">Share Resources</h1>
                                <p>Lend a hand — or an item. It goes a long way!</p>
                            </div>
                            <div className="col-12 text-end mt-4">
                                <button 
                                    className="btn btn-header" 
                                    type="button"
                                    onClick={() => setIsDrawerOpen(true)}
                                >
                                    Make a Request
                                </button>
                            </div>
                        </div>


                        <div className="user-details">

                            <div className="user-detail">
                                    {/* <div className="user-info-image user-notifcations">
                                        <FontAwesomeIcon icon={faStar} />
                                    </div> */}
                                    <div className="user-info-content notifcations">

                                        <div className="title-row">
                                            <p>My Requests</p>
                                                <span className="arrow-icon">
                                                    <FontAwesomeIcon icon={faArrowRight} />
                                                </span>
                                        </div>
                                            <div className="link-item">
                                                {notifications}
                                            </div>
                                    </div>
                            </div>

                            <div className="user-detail">
                                    {/* <div className="user-info-image user-notifcations">
                                        <FontAwesomeIcon icon={faStar} />
                                    </div> */}
                                    <div className="user-info-content notifcations">

                                        <div className="title-row">
                                            <p>Successful Shares</p>
                                                <span className="arrow-icon">
                                                    <FontAwesomeIcon icon={faArrowRight} />
                                                </span>
                                        </div>
                                            <div className="link-item">
                                                {notifications}
                                            </div>
                                    </div>
                            </div>

                            </div>               



                        <div className="page-body">
                            <div className="posts">
                                <div className="page-divider page-divider-home">
                                    <p>See all requests</p>
                                </div>

                                {/* Search + Filters */}
                                <div className="search-filter-wrap">
                                    {/* Search Bar */}
                                    <div className="search-bar">
                                        <input
                                            type="text"
                                            placeholder="Search for anything"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                        <button type="button" className="search-btn">
                                            <FontAwesomeIcon icon={faMagnifyingGlass} />
                                        </button>
                                    </div>

                                    {/* Filters */}
                                    <div className="filters">
                                        <select onChange={(e) => setFilters({ ...filters, country: e.target.value })}>
                                            <option value="">Country</option>
                                            <option value="Canada">Canada</option>
                                            <option value="USA">USA</option>
                                        </select>

                                        <select onChange={(e) => setFilters({ ...filters, field: e.target.value })}>
                                            <option value="">Intention</option>
                                            <option value="Free">Free</option>
                                            <option value="Replace">Replace</option>
                                            <option value="Paid">Paid</option>
                                            <option value="Collaboration">Collaboration</option>
                                        </select>


                                        <select onChange={(e) => setFilters({ ...filters, purpose: e.target.value })}>
                                            <option value="">Type</option>
                                            <option value="Item">Item</option>
                                            <option value="Protocol">Protocol</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    {questions?.some(Boolean) ? questions : <p>No posts yet.</p>}
                                </div>
                            </div>

                            <div className="calendar upcoming-events-card">
                                <div className="events-header">
                                    <h2>Upcoming Events</h2>
                                </div>

                                <Calendar
                                    tileClassName={({ date }) => {
                                        const scheduledEvents = (events || []).some(
                                            (item) => dateFormat(date) === item?.acf?.mentor_request_date
                                        );
                                        return scheduledEvents ? 'scheduled-event' : null;
                                    }}
                                    firstDayOfWeek={0}
                                />

                                <div className="events-schedule">
                                    <button
                                        type="button"
                                        className="btn btn-outline"
                                        onClick={() => setShowScheduleForm((prev) => !prev)}
                                    >
                                        Schedule Event
                                    </button>
                                    {showScheduleForm ? (
                                        <form className="schedule-form" onSubmit={handleScheduleSubmit}>
                                            <input
                                                type="text"
                                                placeholder="Event title"
                                                value={newEventTitle}
                                                onChange={(e) => setNewEventTitle(e.target.value)}
                                            />
                                            <input
                                                type="date"
                                                value={newEventDate}
                                                onChange={(e) => setNewEventDate(e.target.value)}
                                            />
                                            <button type="submit" className="btn btn-dark">Add</button>
                                        </form>
                                    ) : null}
                                </div>

                                <div className="events-list">
                                    <h4>This Week</h4>
                                    {upcomingThisWeek.length ? (
                                        upcomingThisWeek.map((item, idx) => (
                                            <div className="event-item" key={`${item.title}-${idx}`}>
                                                <strong>{item.title}</strong>
                                                <span>{item.date}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="event-item">
                                            <p>Science Storytelling Challenge</p>
                                            <span>Sun 1 Feb</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
{/* Overlay */}
<div
    className={`drawer-overlay ${isDrawerOpen ? 'open' : ''}`}
    onClick={() => setIsDrawerOpen(false)}
/>

{/* Slide-in Drawer */}
<aside className={`drawer ${isDrawerOpen ? 'open' : ''}`}>
    <div className="drawer-header">
        <button
            className="back-btn"
            type="button"
            onClick={() => setIsDrawerOpen(false)}
        >
            ← Back
        </button>

        <span className="points-badge">*5 points required</span>
    </div>

    <h1>Create a Borrow Request</h1>
    <div className="drawer-divider" />
    <form className="drawer-form">
        <label className="first-label">
            Brief description of item (150 characters max)
            <input
                type="text"
                maxLength={150}
                // placeholder="ex. Need help creating a knockout cell line."
            />
        </label>

        <label>
            Description
            <textarea
                // placeholder="Explain your request in further detail. Please keep project explanations sufficiently vague to avoid scooping."
            />
        </label>

        <label>
            Intention
            <select>
                <option>Choose an option</option>
                <option>Free</option>
                <option>Replace</option>
                <option>Paid</option>
                <option>Collaboration</option>
            </select>
        </label>

        <label>
            Type
            <select>
                <option>Choose an option</option>
                <option>Item</option>
                <option>Protocol</option>
            </select>
        </label>


        <label>
            I need this by...
            <input type="date" />
        </label>


        <div className="drawer-actions">
            <button
                type="button"
                className="btn btn-outline"
                onClick={() => setIsDrawerOpen(false)}
            >
                Cancel
            </button>

            <button type="submit" className="btn btn-dark">
                Submit
            </button>
        </div>
    </form>
</aside>

            </main>
        </>
    );
}
