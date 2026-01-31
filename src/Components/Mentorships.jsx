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



export default function Mentorships() {
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
    const [ mentorServices, setMentorServices ] = useState([]);
    const [ mentorSubmitStatus, setMentorSubmitStatus ] = useState({ loading: false, error: '', success: '' });

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

    const handleMentorSignupSubmit = async (e) => {
        e.preventDefault();
        if (!userDetails?.token || !userDetails?.id) return;

        setMentorSubmitStatus({ loading: true, error: '', success: '' });

        try {
            const headers = {
                Authorization: `Bearer ${userDetails.token}`,
            };

            const servicesValue = (mentorServices || []).join(', ');

            const res = await axios.post(
                `${process.env.REACT_APP_API_URL}/wp-json/wp/v2/users/${userDetails.id}`,
                {
                    acf: {
                        user_mentor_services_offered: servicesValue,
                    },
                },
                { headers }
            );

            const updatedUser = res?.data;
            if (updatedUser) {
                setUsersAccountDetails(updatedUser);
                setGetUsers((prev) =>
                    (prev || []).map((user) =>
                        user.id === updatedUser.id ? updatedUser : user
                    )
                );
            }

            setMentorSubmitStatus({ loading: false, error: '', success: 'Mentor profile updated.' });
        } catch (err) {
            console.error(err);
            setMentorSubmitStatus({ loading: false, error: 'Unable to save services. Please try again.', success: '' });
        }
    };


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
            const likeTotal = question?.acf?.like_count ?? 0;
            const mentorRole = author?.acf?.user_mentor_current_position || '';
            const mentorCompany = author?.acf?.user_mentor_current_company || '';
            const mentorSubtitle = [mentorRole, mentorCompany].filter(Boolean).join(' @ ') || userJobInsitution;
            const mentorLocation =
                author?.acf?.user_country ||
                author?.acf?.user_location ||
                author?.acf?.user_city ||
                '';
            const deadline =
                question?.acf?.deadline ||
                question?.acf?.learning_deadline ||
                question?.acf?.borrow_deadline ||
                question?.acf?.collaborations_deadline ||
                '';
            const rawTags =
                author?.acf?.user_mentor_services_offered ||
                question?.acf?.question_subject_area ||
                '';
            const mentorTags = Array.isArray(rawTags)
                ? rawTags
                : typeof rawTags === 'string'
                    ? rawTags.split(',').map((tag) => tag.trim()).filter(Boolean)
                    : [];

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
                <div className="mentor-card" key={question.id || index}>
                    <img
                        className="mentor-card-img"
                        src={userProfileImg || defaultImage}
                        alt={userName || 'Mentor'}
                        loading="lazy"
                    />
                    <div className="mentor-card-body">
                        <div className="mentor-card-name">
                            <strong>{userName || 'Mentor'}</strong>
                        </div>
                        {mentorSubtitle ? (
                            <p className="mentor-card-subtitle">{mentorSubtitle}</p>
                        ) : null}
                        {mentorLocation ? (
                            <p className="mentor-card-location">{mentorLocation}</p>
                        ) : null}
                        <div className="mentor-card-tags">
                            {(mentorTags.length ? mentorTags.slice(0, 2) : ['Services']).map((tag) => (
                                <span className="mentor-card-tag" key={`${question.id}-${tag}`}>{tag}</span>
                            ))}
                        </div>
                        {deadline ? (
                            <div className="mentor-card-footer">
                                <div className="mentor-card-deadline">
                                    <FontAwesomeIcon icon={faClock} />
                                    <span>{humanReadableDate(deadline)}</span>
                                </div>
                            </div>
                        ) : null}
                    </div>
                </div>
            );
        });
        
    }, [getHelpQuestions, usersAccountDetails?.acf?.user_feild, usersById, commentTotalsByPostId, expandedPosts]);
          
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
                                <h1 className="mb-3">Mentorships</h1>
                                <p>Propel your career with expert training and guidance from our mentors</p>
                            </div>
                            <div className="col-12 text-end mt-4">
                                <button 
                                    className="btn btn-header" 
                                    type="button"
                                    onClick={() => setIsDrawerOpen(true)}
                                >
                                    Become a Mentor
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
                                            <p>My Mentors</p>
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
                                            <p>My Mentees</p>
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
                                            <p>Upcoming Meetings</p>
                                                <span className="arrow-icon">
                                                    <FontAwesomeIcon icon={faArrowRight} />
                                                </span>
                                        </div>
                                            <div className="link-item">
                                                {events.length}
                                            </div>
                                    </div>
                            </div>
                            </div>               



                        <div className="page-body">
                            <div className="posts">
                                <div className="page-divider page-divider-home">
                                    <p>Meet our LabSci Mentors</p>
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
                                            <option value="">Experience</option>
                                            <option value="Entry Level">Entry Level</option>
                                            <option value="Mid Career">Mid Career</option>
                                            <option value="Expert Level">Expert Level</option>
                                        </select>

                                        <select onChange={(e) => setFilters({ ...filters, purpose: e.target.value })}>
                                            <option value="">Language</option>
                                            <option value="English">English</option>
                                            <option value="French">French</option>
                                        </select>

                                            <select onChange={(e) => setFilters({ ...filters, purpose: e.target.value })}>
                                            <option value="">Meetup</option>
                                            <option value="In-person">In-person</option>
                                            <option value="Virtual">Virtual</option>
                                        </select>
                                    </div>
                                </div>
                            </div>                         
                        </div>

                            <div className="mentors-grid">
                                {questions?.some(Boolean) ? questions : <p>No mentors yet.</p>}
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

    <h1>Be a part of shaping the next generation of scientists!</h1>
    <div className="drawer-divider" />
    <form className="drawer-form" onSubmit={handleMentorSignupSubmit}>
        <p>
            Applying is easy! We already know about you. We just need a bit more information...Mentorship applications are verified
        </p>

        <label className="first-label">
            <input
                type="text"
                placeholder="Current position"
            />
        </label>

        <label>
            <input
                type="text"
                placeholder="Current company/institution"
            />
        </label>

        <label>
            <input
                type="text"
                placeholder="Key responsibilities in current role"
            />
        </label>

        <label>
            <textarea
                placeholder="Education: please list from most recent, including school and date of completion"
            />
        </label>

        <label>
            <select
                multiple
                aria-label="Services provided"
                value={mentorServices}
                onChange={(e) =>
                    setMentorServices(
                        Array.from(e.target.selectedOptions, (option) => option.value)
                    )
                }
            >
                <option value="Resume Building">Resume building</option>
                <option value="Career Advice">Career advice</option>
                <option value="Networking">Networking</option>
                <option value="Mock Interviews">Mock interviews</option>
            </select>
        </label>

        <label>
            <input
                type="text"
                placeholder="Preferred language(s)"
            />
        </label>

        <label>
            <select>
                <option value="">Preferred meet-up: virtual or in-person</option>
                <option value="Virtual">Virtual</option>
                <option value="In-person">In-person</option>
            </select>
        </label>

        <div className="drawer-grid">
            <label>
                <input
                    type="number"
                    placeholder="Rate of Pay"
                />
            </label>
            <label>
                <input
                    type="text"
                    placeholder="Currency"
                />
            </label>
        </div>

        <div className="drawer-actions">
            <button
                type="button"
                className="btn btn-outline"
                onClick={() => setIsDrawerOpen(false)}
            >
                Cancel
            </button>

        <button type="submit" className="btn btn-dark" disabled={mentorSubmitStatus.loading}>
            {mentorSubmitStatus.loading ? 'Saving...' : 'Sign Up'}
        </button>

        </div>

        {mentorSubmitStatus.error ? (
            <p className="drawer-error">{mentorSubmitStatus.error}</p>
        ) : null}
        {mentorSubmitStatus.success ? (
            <p className="drawer-success">{mentorSubmitStatus.success}</p>
        ) : null}

    </form>
</aside>

            </main>
        </>
    );
}
