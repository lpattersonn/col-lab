import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Brand from '../Images/colLAB-logo.svg'

export default function Navigation() {
 
  const logout = () => {
    localStorage.removeItem('userDetails');
    window.localStorage.clear();
    window.location.replace('/');
  }

    return (
        <header>
            <div className="container-fluid primary">
                <div className="row">
                    <div className="col">
                        <nav className="navbar navbar-expand-lg">
                            <a className="nav-brand" href="/"><img className="brand" src={Brand} loading='lazy'/></a>
                            <ul className="nav nav-pills">
                              <li className="nav-item">
                                <Link className={window.location.href.includes("/dashboard") ? "nav-link active" : "nav-link" } to="/">Home</Link>
                              </li>
                              <li className="nav-item">
                                <Link className={window.location.href.includes("/chats") ? "nav-link active" : "nav-link" } to="/profile">Chats</Link>
                              </li>
                              <li className="nav-item">
                                <Link className={window.location.href.includes("/ponits-center") ? "nav-link active" : "nav-link" } to="/profile">Points Center</Link>
                              </li>
                              <li className="nav-item">
                                <Link className={window.location.href.includes("/profile") ? "nav-link active" : "nav-link" } to="/profile">Profile</Link>
                              </li>
                              <li className="nav-item">
                                <a className="nav-link" href="/" onClick={logout}>Logout</a>
                              </li>
                            </ul>
                        </nav>
                    </div>
                </div>
            </div>
        </header>
    );
}