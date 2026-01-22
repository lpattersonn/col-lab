import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { Editor } from '@tinymce/tinymce-react';
import imageCompression from 'browser-image-compression';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';
import { TailSpin } from 'react-loader-spinner';

import Navigation from '../Navigation';
import SideNavigation from '../Navigation/SideNavigation';
import defaultImage from '../../Images/user-profile.svg';
import { dateFormat } from '../../helper';

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

    const handleFileChange = (e) => {
        setFile(e.target.files?.[0] || null);
    };

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
                                        {userJobInsitution ? (
                                            <div>
                                                <p>{userJobInsitution}</p>
                                            </div>
                                        ) : null}
                                        <p>{getTimeAgo(question.date)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <hr />

                        <p><strong>{question?.title?.rendered}</strong></p>

                        {rendered ? (
                            <div
                                dangerouslySetInnerHTML={{
                                    __html: `${snippetText}${ellipsis}`,
                                }}
                            />
                        ) : null}

                        <div className="question-actions">
                            <div className="question-actions-button">
                                <Link to={`/question/${question.id}`}>
                                    <button className="btn btn-outline-info btn-sm">View</button>
                                </Link>
                            </div>
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
                color="#0f9ed5"
                ariaLabel="tail-spin-loading"
                radius="1"
                wrapperStyle={{ position: 'absolute', top: 0, left: 0, right: 0 }}
                wrapperClass="spinner"
            />
        );
    }

    return (
        <>
            <Navigation />
            <main>
                <div className="row" style={{ background: '#FAFAFA' }}>
                    <div className="col-md-2 mt-4" style={{ background: '#ffffff' }}>
                        <SideNavigation />
                    </div>

                    <div className="col-md-10 mt-4">
                        <div className="page-header">
                            <h1 className="mb-3">Welcome to LabSci!</h1>
                            <p>Start a convo, engage with posts, share your ideas!</p>
                        </div>

                        <div className="user-details">
                            <div className="user-detail user">
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
                                    <div className="link-item">
                                        <p><strong>You’ve earned {JSON.parse(localStorage.getItem('userPoints') || '0')} pts</strong></p>
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

                        <div className="page-body">
                            <div className="posts">
                                <div className="create-posts">
                                    <form onSubmit={handleSubmit}>
                                        <Editor
                                            apiKey={process.env.REACT_APP_TINY_MCE_API_KEY}
                                            onInit={(evt, editor) => (editorRef.current = editor)}
                                            className="form-control form-control-lg"
                                            init={{
                                                placeholder: 'Write your post here. Attach pictures if necessary.',
                                                toolbar: 'undo redo | bold italic underline | superscript subscript | alignleft aligncenter alignright | bullist numlist',
                                                menubar: false,
                                            }}
                                            onEditorChange={(content) => setCreateComment(content)}
                                        />

                                        <div className="row">
                                            <div className="col-4 mt-4">
                                                <input
                                                    className="form-control form-control-lg"
                                                    type="file"
                                                    onChange={handleFileChange}
                                                    disabled={commentStatus === 'approved'}
                                                />
                                            </div>
                                            <div className="col-8 text-end mt-4">
                                                <button className="btn btn-info btn-lg collab-btn" type="submit">
                                                    Submit
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-secondary btn-lg ms-2"
                                                    onClick={clearEditor}
                                                >
                                                    Clear
                                                </button>
                                            </div>

                                            {serverComment ? (
                                                <div className="col-12 mt-4">
                                                    <div className="alert alert-danger" role="alert">
                                                        <p>{serverComment}</p>
                                                    </div>
                                                </div>
                                            ) : null}

                                            {successServerComment ? (
                                                <div className="col-12 mt-4">
                                                    <div className="alert alert-success" role="alert">
                                                        <p>{successServerComment}</p>
                                                    </div>
                                                </div>
                                            ) : null}
                                        </div>
                                    </form>
                                </div>

                                <div className="page-divider">
                                    <p>Recent Posts</p>
                                </div>

                                <div>
                                    {questions?.some(Boolean) ? questions : <p>No posts yet.</p>}
                                </div>
                            </div>

                            <div className="calendar">
                                <Calendar
                                    tileClassName={({ date }) => {
                                        const scheduledEvents = (events || []).some(
                                            (item) => dateFormat(date) === item?.acf?.mentor_request_date
                                        );
                                        return scheduledEvents ? 'scheduled-event' : null;
                                    }}
                                    firstDayOfWeek={0}
                                    onClickDay={(value) => {
                                        const clicked = dateFormat(value);
                                        const dayEvents = (events || []).filter(
                                            (item) => item?.acf?.mentor_request_date === clicked
                                        );

                                        if (!dayEvents.length) return;

                                        alert(`Events on ${clicked}: ${dayEvents.length}`);
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}
