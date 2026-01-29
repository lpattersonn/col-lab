import React from 'react';
import Navigation from './Navigation';

export default function About() {
    const userDetails = JSON.parse(localStorage.getItem('userDetails'));

    return (
    <>
        <Navigation user={userDetails} />
    </>
    )
};
