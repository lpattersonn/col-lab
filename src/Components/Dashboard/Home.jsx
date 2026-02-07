import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { Editor } from '@tinymce/tinymce-react';
import imageCompression from 'browser-image-compression';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faArrowRight, faPlusSquare, faXmark } from '@fortawesome/free-solid-svg-icons';
import likeIcon from '../../Images/like-svgrepo-com.svg';
import commentIcon from '../../Images/comment-svgrepo-com.svg';
import addPhotoIcon from '../../Images/add-photo-svgrepo-com.svg';
import emojiSmileIcon from '../../Images/emoji-smile-svgrepo-com.svg';
import coinsIcon from '../../Images/coins-hand-svgrepo-com.svg';
import calendarEventIcon from '../../Images/calendar-circle-exclamation-svgrepo-com.svg';
import { TailSpin } from 'react-loader-spinner';
import EmojiPicker from 'emoji-picker-react';

import Navigation from '../Navigation';
import SideNavigation from '../Navigation/SideNavigation';
import defaultImage from '../../Images/user-profile.svg';
import { dateFormat } from '../../helper';

export default function Home() {
    const Navigate = useNavigate(); // keep your original naming
    const editorRef = useRef(null);
    const fileInputRef = useRef(null);
    const emojiPickerRef = useRef(null);

    const userDetails = useMemo(() => {
        try {
            return JSON.parse(localStorage.getItem('userDetails'));
        } catch {
            return null;
        }
    }, []);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning,';
        if (hour < 18) return 'Good afternoon,';
        return 'Good evening,';
    };
    const [greeting, setGreeting] = useState(getGreeting);

    useEffect(() => {
        const now = new Date();
        const nextHour = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
            now.getHours() + 1,
            0,
            0,
            0
        );
        const timeoutId = setTimeout(() => {
            setGreeting(getGreeting());
        }, nextHour.getTime() - now.getTime());

        return () => clearTimeout(timeoutId);
    }, [greeting]);

    const [ getHelpQuestions, setGetHelpQuestions ] = useState([]);
    const [ getUsers, setGetUsers ] = useState([]);
    const [ usersAccountDetails, setUsersAccountDetails ] = useState(null);

    const [ notifications, setNotifications ] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('userPoints')) || 0;
        } catch {
            return 0;
        }
    });
    const [ events, setEvents ] = useState([]);
    const [ collaborations, setCollaborations ] = useState(0);
    const [ mentorships, setMentorships ] = useState(0);

    const [ loading, setLoading ] = useState(true);
    const [ openComments, setOpenComments ] = useState({});

    const [ createComment, setCreateComment ] = useState('');
    const [ file, setFile ] = useState(null);
    const [ commentStatus, setCommentStatus ] = useState('not approved');
    const [ serverComment, setServerComment ] = useState('');
    const [ successServerComment, setSuccessServerComment ] = useState('');
    const [ isSubmitting, setIsSubmitting ] = useState(false);
    const [ postTitle, setPostTitle ] = useState('');
    const [ commentInputs, setCommentInputs ] = useState({});
    const [ commentThreads, setCommentThreads ] = useState({});
    const [ expandedPosts, setExpandedPosts ] = useState({});
    const [ showScheduleForm, setShowScheduleForm ] = useState(false);
    const [ scheduledEventsLocal, setScheduledEventsLocal ] = useState([]);
    const [ newEventTitle, setNewEventTitle ] = useState('');
    const [ newEventDate, setNewEventDate ] = useState('');
    const [ isPointsDrawerOpen, setIsPointsDrawerOpen ] = useState(false);
    const [ isEventsDrawerOpen, setIsEventsDrawerOpen ] = useState(false);
    const [ resolvedMedia, setResolvedMedia ] = useState({});
    const [ showEmojiPicker, setShowEmojiPicker ] = useState(false);
    const [ pointsHistory, setPointsHistory ] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('pointsHistory')) || [];
        } catch {
            return [];
        }
    });

    useEffect(() => {
        if (!showEmojiPicker) return;
        const handleClickOutside = (e) => {
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target)) {
                setShowEmojiPicker(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showEmojiPicker]);

    const formatHistoryDate = (isoDate) => {
        if (!isoDate) return '';
        const date = new Date(isoDate);
        const now = new Date();
        const diffMs = now - date;
        const diffDays = Math.floor(diffMs / (86400 * 1000));
        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const eventsHistory = useMemo(() => {
        const items = [];

        (events || []).forEach((item, idx) => {
            const title =
                item?.acf?.mentor_request_title ||
                item?.title?.rendered ||
                'Upcoming event';
            const link = item?.link || '#';
            const date = item?.acf?.mentor_request_date || item?.date || '';

            items.push({
                id: `event-${item?.id || idx}`,
                title,
                link,
                date,
            });
        });

        (scheduledEventsLocal || []).forEach((item, idx) => {
            items.push({
                id: `scheduled-${idx}`,
                title: item?.title || 'Scheduled event',
                link: '#',
                date: item?.date || '',
            });
        });

        return items.length
            ? items
            : [
                  {
                      id: 'event-placeholder',
                      title: 'Science Storytelling Challenge',
                      link: '#',
                      date: 'Sun 1 Feb',
                  },
              ];
    }, [events, scheduledEventsLocal]);

    const [ commentTotalsByPostId, setCommentTotalsByPostId ] = useState({});

    useEffect(() => {
        if (!userDetails?.token) {
            Navigate('/login');
            return;
        }

        let isMounted = true;

        // Use Promise.allSettled to allow some requests to fail without breaking the page
        Promise.allSettled([
            api.get('/wp-json/wp/v2/home-post'),
            api.get('/wp-json/wp/v2/users').catch(() => ({ data: [] })), // Users list may be restricted
            api.get(`/wp-json/wp/v2/users/${userDetails.id}`).catch(() => ({ data: null })), // User details may fail
            api.get('/wp-json/wp/v2/mentor-requests'),
            api.get('/wp-json/wp/v2/collaboration-chats'),
            api.get('/wp-json/wp/v2/mentor-chats'),
        ])
            .then((results) => {
                if (!isMounted) return;

                // Extract data from settled promises (fulfilled or rejected)
                const getValue = (result) => result.status === 'fulfilled' ? result.value?.data : [];
                const getValueOrNull = (result) => result.status === 'fulfilled' ? result.value?.data : null;

                const apiQuestion = getValue(results[0]);
                const apiUsers = getValue(results[1]);
                const currentUserApi = getValueOrNull(results[2]);
                const mentorRequest = getValue(results[3]);
                const allCollaborations = getValue(results[4]);
                const allMentorChats = getValue(results[5]);

                setGetHelpQuestions(apiQuestion || []);
                setGetUsers(apiUsers || []);

                const currentUser = currentUserApi;
                setUsersAccountDetails(currentUser);

                const points = currentUser?.acf?.['user-points'] ?? 0;
                localStorage.setItem('userPoints', JSON.stringify(points));
                setNotifications(points);

                const relatedResponse = (mentorRequest || [])
                    .filter((item) => item?.acf?.mentor_id === userDetails?.id || item?.acf?.mentee_id === userDetails?.id)
                    .filter((item) => item?.acf?.mentor_agree === 'Agree');

                setEvents(relatedResponse);

                let userCollaborations = 0;
                (allCollaborations || []).forEach((chat) => {
                    if (chat?.acf?.participant_id === userDetails?.id || chat?.acf?.requestor_id === userDetails?.id) {
                        userCollaborations += 1;
                    }
                });
                setCollaborations(userCollaborations);

                let userMentorships = 0;
                (allMentorChats || []).forEach((chat) => {
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

        const fetchTotals = async () => {
            try {
                const ids = getHelpQuestions
                    .filter((q) => q?.id)
                    .map((q) => q.id);

                const missing = ids.filter((id) => typeof commentTotalsByPostId[id] !== 'number');
                if (!missing.length) return;

                const requests = missing.map((postId) =>
                    api.get('/wp-json/wp/v2/comments', {
                        params: {
                            post: postId,
                            per_page: 1,
                        },
                    })
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

    // Resolve numeric ACF file attachment IDs to URLs
    useEffect(() => {
        if (!getHelpQuestions?.length) return;

        let isMounted = true;

        const mediaIds = getHelpQuestions
            .map((q) => q?.acf?.file)
            .filter((f) => typeof f === 'number' && !resolvedMedia[f]);

        if (!mediaIds.length) return;

        const unique = [...new Set(mediaIds)];

        Promise.all(
            unique.map((id) =>
                api.get(`/wp-json/wp/v2/media/${id}`)
                    .then((res) => [id, {
                        url: res?.data?.source_url || '',
                        mime_type: res?.data?.mime_type || '',
                    }])
                    .catch(() => [id, null])
            )
        ).then((results) => {
            if (!isMounted) return;
            setResolvedMedia((prev) => {
                const next = { ...prev };
                results.forEach(([id, data]) => {
                    if (data) next[id] = data;
                });
                return next;
            });
        });

        return () => { isMounted = false; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [getHelpQuestions]);

    const clearEditor = () => {
        setCreateComment('');
        setFile(null);
        setCommentStatus('not approved');
        setServerComment('');
        setSuccessServerComment('');
        setPostTitle('');
        editorRef.current?.setContent('');
    };

    const handleCommentChange = (postId, value) => {
        setCommentInputs((prev) => ({ ...prev, [postId]: value }));
    };

    const handleCommentSubmit = async (postId) => {
        const content = (commentInputs?.[postId] || '').trim();
        if (!content) return;
        if (!userDetails?.token || !userDetails?.id) {
            Navigate('/login');
            return;
        }

        try {
            const res = await api.post('/wp-json/wp/v2/comments', {
                post: postId,
                content,
                author: userDetails.id,
            });

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

            // Award 2 points for replying
            const currentPoints = JSON.parse(localStorage.getItem('userPoints')) || 0;
            const updatedPoints = currentPoints + 2;

            // Find post author name for history entry
            const post = (getHelpQuestions || []).find((q) => q?.id === postId);
            const postAuthor = post ? usersById[post.author] : null;
            const postAuthorName = postAuthor?.name || 'a post';

            // Update server
            api.post(`/wp-json/wp/v2/users/${userDetails.id}`, {
                acf: { 'user-points': updatedPoints },
            }).catch((err) => console.error('Error updating points:', err));

            // Update local state and storage
            localStorage.setItem('userPoints', JSON.stringify(updatedPoints));
            setNotifications(updatedPoints);

            // Add to points history
            const historyEntry = {
                id: `points-${Date.now()}`,
                title: `Earned 2 points for replying to ${postAuthorName}'s question.`,
                detail: post?.title?.rendered || '',
                date: new Date().toISOString(),
            };
            setPointsHistory((prev) => {
                const updated = [historyEntry, ...prev];
                localStorage.setItem('pointsHistory', JSON.stringify(updated));
                return updated;
            });
        } catch (error) {
            console.error('Error submitting comment:', error?.response?.data || error.message);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setServerComment('');
        setSuccessServerComment('');

        if (!userDetails?.token) {
            Navigate('/login');
            return;
        }

        const stripped = (createComment || '').replace(/<[^>]*>/g, '').trim();
        if (!stripped) {
            setServerComment('Please write something before submitting.');
            return;
        }

        setIsSubmitting(true);

        try {
            let mediaId = null;
            let mediaSourceUrl = '';
            let mediaMimeType = '';

            if (file) {
                const formData = new FormData();

                if (file.type.startsWith('image/')) {
                    const compressed = await imageCompression(file, {
                        maxSizeMB: 1,
                        maxWidthOrHeight: 1280,
                        useWebWorker: true,
                    });
                    formData.append('file', new File([compressed], file.name, { type: file.type }));
                } else {
                    formData.append('file', file);
                }

                const mediaRes = await api.post('/wp-json/wp/v2/media', formData);
                mediaId = mediaRes?.data?.id || null;
                mediaSourceUrl = mediaRes?.data?.source_url || '';
                mediaMimeType = mediaRes?.data?.mime_type || '';
            }

            const created = await api.post('/wp-json/wp/v2/home-post', {
                title: (postTitle || '').trim() || stripped.slice(0, 80) || 'New Question',
                content: createComment,
                status: 'publish',
            });

            if (mediaId && created?.data?.id) {
                await api.put(`/wp-json/wp/v2/home-post/${created.data.id}`, {
                    acf: { file: mediaId },
                });

                // Cache the resolved media so the card renders immediately
                setResolvedMedia((prev) => ({
                    ...prev,
                    [mediaId]: { url: mediaSourceUrl, mime_type: mediaMimeType },
                }));
            }

            setSuccessServerComment('Success! Your post has been published.');
            setCommentStatus(created?.data?.status || 'approved');

            editorRef.current?.setContent('');
            setCreateComment('');
            setFile(null);

            // Include the ACF file ID so the card can look it up from resolvedMedia
            const postData = { ...created.data, acf: { ...created.data?.acf, file: mediaId } };
            setGetHelpQuestions((prev) => [ postData, ...(prev || []) ]);
        } catch (err) {
            console.error('Post submission error:', err?.response?.data || err.message);
            setServerComment(
                err?.response?.data?.message || 'Something went wrong. Please try again.'
            );
        } finally {
            setIsSubmitting(false);
        }
    };

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

    const questions = useMemo(() => {
        const userField = usersAccountDetails?.acf?.user_feild;
        if (!getHelpQuestions?.length) return [];

        return getHelpQuestions.map((question, index) => {
            console.log(question);
            if (!question) return null;

            const author = usersById[question.author];
            const userName = author?.name || '';
            const userProfileImg = author?.acf?.user_profile_picture;
            const userJobInsitution = author?.acf?.['user-job-Insitution'];

            const commentTotal = commentTotalsByPostId[question.id] ?? 0;
            const likeTotal = question?.acf?.like_count ?? 0;

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

                        {(() => {
                            const acfFile = question?.acf?.file;
                            if (!acfFile) return null;
                            let fileUrl, mimeType;
                            if (typeof acfFile === 'object') {
                                fileUrl = acfFile.url;
                                mimeType = acfFile.mime_type || '';
                            } else if (typeof acfFile === 'string') {
                                fileUrl = acfFile;
                                mimeType = '';
                            } else if (typeof acfFile === 'number' && resolvedMedia[acfFile]) {
                                fileUrl = resolvedMedia[acfFile].url;
                                mimeType = resolvedMedia[acfFile].mime_type || '';
                            }
                            if (!fileUrl) return null;
                            const isVideo = mimeType?.startsWith('video/') || /\.(mp4|webm|mov|avi)$/i.test(fileUrl);
                            return (
                                <div className="post-card-media">
                                    {isVideo ? (
                                        <video src={fileUrl} controls />
                                    ) : (
                                        <img src={fileUrl} alt="" loading="lazy" />
                                    )}
                                </div>
                            );
                        })()}

                        <div className="question-actions">
                            <div className="question-actions-meta">
                                <button type="button" className="question-actions-item">
                                    <img src={likeIcon} alt="" className="like-icon" aria-hidden="true" />
                                    <span>{likeTotal} Like</span>
                                </button>
                                <button
                                    type="button"
                                    className="question-actions-item"
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
                                                    <span className="time-ago">Just now</span>
                                                </div>
                                                <p>{comment.content?.replace?.(/<[^>]*>/g, '') || comment.content}</p>
                                                <div className="comment-actions">
                                                    <button type="button" className="comment-like">
                                                        <img src={likeIcon} alt="" className="like-icon" aria-hidden="true" />
                                                        <span className='comment-like-text'>Like</span>
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
    }, [getHelpQuestions, usersAccountDetails?.acf?.user_feild, usersById, commentTotalsByPostId, openComments, commentInputs, commentThreads, expandedPosts, resolvedMedia]);

    if (!localStorage.getItem('userDetails')) {
        window.location.replace('/login');
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
                                <h1 className="mb-3">Welcome to LabSci!</h1>
                                <p>Start a convo, engage with posts, share your ideas!</p>
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
                                    <p>{greeting}</p>
                                    <p className="user-greeting-name">
                                        <strong>{userDetails?.firstName || 'User'} 🔥</strong>
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                className="user-detail user-detail-home user-detail-button"
                                onClick={() => setIsPointsDrawerOpen(true)}
                            >
                                    <div className="user-info-image user-notifcations">
                                        <img src={coinsIcon} alt="" className="user-info-icon" aria-hidden="true" />
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
                            </button>

                            <button
                                type="button"
                                className="user-detail user-detail-home user-detail-button"
                                onClick={() => setIsEventsDrawerOpen(true)}
                            >
                                    <div className="user-info-image user-notifcations">
                                        <img src={calendarEventIcon} alt="" className="user-info-icon" aria-hidden="true" />
                                    </div>
                                    <div className="user-info-content notifcations">

                                        <div className="title-row">
                                            <p>Upcoming Events</p>
                                                <span className="arrow-icon">
                                                    <FontAwesomeIcon icon={faArrowRight} />
                                                </span>
                                        </div>
                                            <div className="link-item">
                                                {events.length}
                                            </div>
                                    </div>
                            </button>

                        </div>

                        <div className="page-body">
                            <div className="posts">
                                <div className="create-posts">
                                    <form className="post-form" onSubmit={handleSubmit}>
                                        <div className="post-form-header">
                                            <div className="post-form-title">
                                                <h2>Create a Post</h2>
                                            </div>

                                        </div>
                                        <div className="post-form-content">
                                            <div className="post-field">
                                                <input
                                                    className="form-control form-control-lg post-input"
                                                    type="text"
                                                    name="title"
                                                    maxLength={150}
                                                    placeholder="Title your post..."
                                                    value={postTitle}
                                                    onChange={(e) => setPostTitle(e.target.value)}
                                                />
                                                <span className="post-count">{postTitle.length}/150</span>
                                            </div>

                                            <div className="post-editor">
                                                <Editor
                                                    apiKey={process.env.REACT_APP_TINY_MCE_API_KEY}
                                                    onInit={(evt, editor) => (editorRef.current = editor)}
                                                    className="form-control form-control-lg"
                                                    init={{
                                                        placeholder: 'Share your thoughts, ideas, or questions...',
                                                        toolbar: 'undo redo | bold italic underline | superscript subscript | alignleft aligncenter alignright | bullist numlist',
                                                        menubar: false,
                                                    }}
                                                    onEditorChange={(content) => setCreateComment(content)}
                                                />
                                                <span className="post-count">
                                                    {(createComment || '').replace(/<[^>]*>/g, '').length}/2000
                                                </span>
                                            </div>

                                            {file ? (
                                                <div className="post-file-preview">
                                                    {file.type.startsWith('video/') ? (
                                                        <video
                                                            src={URL.createObjectURL(file)}
                                                            controls
                                                            className="post-file-preview-img"
                                                        />
                                                    ) : (
                                                        <img
                                                            src={URL.createObjectURL(file)}
                                                            alt="Preview"
                                                            className="post-file-preview-img"
                                                        />
                                                    )}
                                                    <button
                                                        type="button"
                                                        className="post-file-remove-btn"
                                                        aria-label="Remove file"
                                                        onClick={() => {
                                                            setFile(null);
                                                            if (fileInputRef.current) fileInputRef.current.value = '';
                                                        }}
                                                    >
                                                        <FontAwesomeIcon icon={faXmark} />
                                                    </button>
                                                </div>
                                            ) : null}

                                            <div className="post-form-footer">
                                                <div className="post-form-icons">
                                                    <input
                                                        ref={fileInputRef}
                                                        type="file"
                                                        accept="image/*,video/*"
                                                        hidden
                                                        onChange={(e) => {
                                                            const selected = e.target.files?.[0];
                                                            if (selected) setFile(selected);
                                                        }}
                                                    />
                                                    <button
                                                        type="button"
                                                        className="post-icon-btn"
                                                        aria-label="Add media"
                                                        onClick={() => fileInputRef.current?.click()}
                                                    >
                                                        <img src={addPhotoIcon} alt="" className="post-icon-img" aria-hidden="true" />
                                                    </button>
                                                    <div className="emoji-picker-wrapper" ref={emojiPickerRef}>
                                                        <button
                                                            type="button"
                                                            className="post-icon-btn"
                                                            aria-label="Add emoji"
                                                            onClick={() => setShowEmojiPicker((prev) => !prev)}
                                                        >
                                                            <img src={emojiSmileIcon} alt="" className="post-icon-img" aria-hidden="true" />
                                                        </button>
                                                        {showEmojiPicker ? (
                                                            <div className="emoji-picker-popover">
                                                                <EmojiPicker
                                                                    onEmojiClick={(emojiData) => {
                                                                        editorRef.current?.insertContent(emojiData.emoji);
                                                                        setShowEmojiPicker(false);
                                                                    }}
                                                                    width={300}
                                                                    height={350}
                                                                />
                                                            </div>
                                                        ) : null}
                                                    </div>
                                                </div>
                                                <button type="submit" className="btn btn-dark" disabled={isSubmitting}>
                                                    {isSubmitting ? 'Posting...' : 'Submit'}
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

                                <div className="page-divider page-divider-home">
                                    <p>Recent Posts</p>
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
                    className={`drawer-overlay ${isPointsDrawerOpen ? 'open' : ''}`}
                    onClick={() => setIsPointsDrawerOpen(false)}
                />

                {/* Slide-in Drawer */}
                <aside className={`drawer ${isPointsDrawerOpen ? 'open' : ''}`}>
                    <div className="drawer-header">
                        <button
                            className="back-btn"
                            type="button"
                            onClick={() => setIsPointsDrawerOpen(false)}
                        >
                            ← Back
                        </button>

                    </div>

                    <h1>Points History</h1>
                    <div className="drawer-divider" />

                    <div className="points-history">
                        {pointsHistory.map((item) => (
                            <div className="points-history-card" key={item.id}>
                                <p className="points-history-title">{item.title}</p>
                                <p className="points-history-detail">{item.detail}</p>
                                <span className="points-history-date">{item.date}</span>
                            </div>
                        ))}
                    </div>
                </aside>

                {/* Overlay */}
                <div
                    className={`drawer-overlay ${isEventsDrawerOpen ? 'open' : ''}`}
                    onClick={() => setIsEventsDrawerOpen(false)}
                />

                {/* Slide-in Drawer */}
                <aside className={`drawer ${isEventsDrawerOpen ? 'open' : ''}`}>
                    <div className="drawer-header">
                        <button
                            className="back-btn"
                            type="button"
                            onClick={() => setIsEventsDrawerOpen(false)}
                        >
                            ← Back
                        </button>

                    </div>

                    <h1>Upcoming Events</h1>
                    <div className="drawer-divider" />

                    <div className="events-history">
                        {eventsHistory.map((item) => (
                            <div className="events-history-card" key={item.id}>
                                <p className="events-history-title">{item.title}</p>
                                <a className="events-history-link" href={item.link}>
                                    View event
                                </a>
                                <span className="events-history-date">{item.date}</span>
                            </div>
                        ))}
                    </div>
                </aside>
            </main>
        </>
    );
}
