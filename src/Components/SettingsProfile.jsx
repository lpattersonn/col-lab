import React, { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import imageCompression from 'browser-image-compression';
import SettingsLayout from './SettingsLayout';
import defaultAvatar from '../Images/user-icon-placeholder-1.png';

export default function SettingsProfile() {
    const fileInputRef = useRef(null);
    const userDetails = useMemo(() => {
        try {
            return JSON.parse(localStorage.getItem('userDetails'));
        } catch {
            return null;
        }
    }, []);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');
    const [avatarFile, setAvatarFile] = useState(null);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        jobTitle: '',
        workplace: '',
        bio: '',
        pronouns: '',
        lgbtqiaBadge: false,
    });

    useEffect(() => {
        if (!userDetails?.token || !userDetails?.id) {
            window.location.replace('/login');
            return;
        }

        const headers = {
            Authorization: `Bearer ${userDetails.token}`,
        };

        axios.get(`${process.env.REACT_APP_API_URL}/wp-json/wp/v2/users/${userDetails.id}`, { headers })
            .then((res) => {
                const user = res?.data || {};
                const acf = user?.acf || {};

                setFormData({
                    firstName: user?.first_name || '',
                    lastName: user?.last_name || '',
                    email: user?.email || '',
                    jobTitle: acf?.['user-job-title'] || '',
                    workplace: acf?.['user-job-Insitution'] || '',
                    bio: user?.description || '',
                    pronouns: acf?.['user-pronouns'] || '',
                    lgbtqiaBadge: acf?.['user-lgbtqia-badge'] === 'Yes',
                });

                setAvatarUrl(
                    acf?.user_profile_picture ||
                    user?.avatar_urls?.['96'] ||
                    user?.avatar_urls?.['48'] ||
                    ''
                );
                setLoading(false);
            })
            .catch(() => {
                setError('Unable to load your profile. Please try again.');
                setLoading(false);
            });
    }, [userDetails?.id, userDetails?.token]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setAvatarFile(file);
        setAvatarUrl(URL.createObjectURL(file));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!userDetails?.token || !userDetails?.id) return;

        setSaving(true);
        setError('');
        setSuccess('');

        try {
            const headers = {
                Authorization: `Bearer ${userDetails.token}`,
            };

            let imageUrl = '';
            if (avatarFile) {
                const options = {
                    maxSizeMB: 1,
                    maxWidthOrHeight: 1024,
                    useWebWorker: true,
                };

                const compressed = await imageCompression(avatarFile, options);
                const finalFile = new File([compressed], avatarFile.name, { type: avatarFile.type });

                const formData = new FormData();
                formData.append('file', finalFile);

                const mediaRes = await axios.post(
                    `${process.env.REACT_APP_API_URL}/wp-json/wp/v2/media`,
                    formData,
                    { headers }
                );

                imageUrl = mediaRes?.data?.source_url || '';
            }

            const payload = {
                first_name: formData.firstName,
                last_name: formData.lastName,
                email: formData.email,
                description: formData.bio,
                acf: {
                    'user-job-title': formData.jobTitle,
                    'user-job-Insitution': formData.workplace,
                    'user-pronouns': formData.pronouns,
                    'user-lgbtqia-badge': formData.lgbtqiaBadge ? 'Yes' : 'No',
                    ...(imageUrl ? { user_profile_picture: imageUrl } : {}),
                },
            };

            const res = await axios.post(
                `${process.env.REACT_APP_API_URL}/wp-json/wp/v2/users/${userDetails.id}`,
                payload,
                { headers }
            );

            const updated = res?.data || {};
            setSuccess('Profile updated successfully.');
            setAvatarUrl(
                updated?.acf?.user_profile_picture ||
                avatarUrl
            );

            if (userDetails) {
                localStorage.setItem('userDetails', JSON.stringify({
                    ...userDetails,
                    firstName: updated?.first_name || formData.firstName,
                    lastName: updated?.last_name || formData.lastName,
                    email: updated?.email || formData.email,
                }));
            }
        } catch (err) {
            setError('Could not update profile. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <SettingsLayout>
                <div className="settings-content">
                    <div className="settings-info">
                        <h2>Profile Information</h2>
                        <p>Loading your profile...</p>
                    </div>
                </div>
            </SettingsLayout>
        );
    }

    return (
        <SettingsLayout>
            <div className="settings-content">
                <div className="settings-info">
                    <h2>Profile Information</h2>
                    <p>
                        Update your profile information to help others recognize you and learn more
                        about your expertise.
                    </p>

                    <div className="settings-avatar">
                        <img
                            src={avatarUrl || defaultAvatar}
                            alt="User avatar"
                            loading="lazy"
                        />
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarChange}
                            style={{ display: 'none' }}
                        />
                        <button
                            type="button"
                            className="avatar-action"
                            aria-label="Upload photo"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            ⟳
                        </button>
                    </div>
                    <div className="settings-avatar-note">
                        Upload a square image for best results. Maximum size: 1MB
                    </div>
                </div>

                <form className="settings-form" onSubmit={handleSubmit}>
                    <div className="settings-grid">
                        <label>
                            First Name
                            <input
                                type="text"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                placeholder="Marie"
                            />
                        </label>
                        <label>
                            Last Name
                            <input
                                type="text"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                placeholder="Claudette"
                            />
                        </label>
                        <label>
                            Email
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="marie@claudette.com"
                            />
                        </label>
                        <label>
                            Job Title
                            <input
                                type="text"
                                name="jobTitle"
                                value={formData.jobTitle}
                                onChange={handleChange}
                                placeholder="Researcher"
                            />
                        </label>
                        <label className="settings-span">
                            Work Place
                            <input
                                type="text"
                                name="workplace"
                                value={formData.workplace}
                                onChange={handleChange}
                                placeholder="Your workplace"
                            />
                        </label>
                        <label className="settings-span">
                            Biography
                            <textarea
                                name="bio"
                                value={formData.bio}
                                onChange={handleChange}
                                placeholder="Tell us about yourself"
                            />
                        </label>
                        <label>
                            Pronouns
                            <input
                                type="text"
                                name="pronouns"
                                value={formData.pronouns}
                                onChange={handleChange}
                                placeholder="Your pronouns (e.g. she/her)"
                            />
                        </label>
                    </div>

                    {error ? <p className="red">{error}</p> : null}
                    {success ? <p className="green">{success}</p> : null}

                    <button type="submit" className="btn btn-dark" disabled={saving}>
                        {saving ? 'Updating...' : 'Update Profile'}
                    </button>
                </form>
            </div>
        </SettingsLayout>
    );
}
