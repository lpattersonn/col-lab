import React, { useState, useEffect } from 'react';
import Navigation from '../Navigation';
import SideNavigation from '../Navigation/SideNavigation';

export default function Home() {
    return (
        <>
            <Navigation />
            <main>
                <div className="row" style={{background: "#FAFAFA"}}>
                    <div className="col-md-2 mt-4">
                        <SideNavigation />
                    </div>
                    <div className="col-md-10 mt-4">
                        <div className='page-header'>
                            <h1 className="mb-3">Welcome to LabSci!</h1>
                            <p>Start a convo, engage with posts, share your ideas!</p>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}