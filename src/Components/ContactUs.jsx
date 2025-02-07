import React, { useState, useEffect } from "react";
import Navigation from "./Navigation";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSuitcase, faCoins, faMoneyBill, faHouse, faPen } from '@fortawesome/free-solid-svg-icons';
import SectionImage from "../Images/rb_2148887720.png";
import axios from "axios";


export default function ContactUs() {
    const userDetails = JSON.parse(localStorage.getItem('userDetails'));

if (userDetails != null) {
    return(
        <>
            <Navigation />
            <main className="create-collaboration" style={{marginTop: "6rem"}}>
                <div className="container primary" >
                    <div className="row">
                        <div className="col-12 mb-4">
                            <h1><strong>Get in touch with us. We'd love to hear from you!</strong></h1>
                        </div>
                    </div>
                    <div className="row mt-5">
                        <div className="col-lg-6">
                            <img className="collaboration-page_image" src={SectionImage} alt="Image of scientist" role="presentation" />
                        </div>
                        <div className="col-lg-6">
                            <p><strong>Please fill out the contact form below.</strong></p>
                            <form className="form-create-job mx-auto" action='https://formsubmit.co/mercy@mapltech.com' method='POST'>
                                <input
                                    type='hiden'
                                    name='_subject'
                                    value='New Contact Form Submission From www.col-labb.com'
                                    style={{ display: `none` }}
                                />
                                <input type="hidden" name="_cc" value="tech@mapltech.com" />
                                <input type="hidden" name="_autoresponse" value="Thank you for contacting us! Please be patient - our team will respond to your request shortly."></input>
                                <div className="row">
                                    <div className="col-lg-12 mb-4">
                                        <label htmlFor="name"><strong>Full Name</strong></label>
                                        <input name="name" id="name" className='form-control form-control-lg' aria-label='Name' type="text" required />
                                    </div>    
                                </div>
                                <div className="row">
                                    <div className="col-lg-12  mb-4">
                                    <label htmlFor="email"><strong>Email Address</strong></label>
                                    <input name="email" id="email" className='form-control form-control-lg' aria-label='Email' type="email" required />
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-lg-12  mb-4">
                                        <label htmlFor="purpose"><strong>Purpose</strong></label>
                                        <select name="purpose" id="purpose" aria-label="purpose" className="form-control form-control-lg form-select" required>
                                            <option defaultValue disabled value="">Choose an option</option>
                                            <option>Ask a question</option>
                                            <option>Report a bug or issue</option>
                                            <option>Other reason</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-lg-12  mb-4">
                                        <label htmlFor="subject"><strong>Subject (max. 150 characters)</strong></label>
                                        <input name="subject" id="subject" className='form-control form-control-lg' aria-label='subject' type="subject" required />
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-lg-12 mb-4">
                                        <label htmlFor="Message"><strong>Message</strong></label>
                                        <textarea name="Message" id="Message" rows="4" className='form-control form-control-lg' aria-label='Message' type="text" required />
                                    </div>    
                                </div>
                                <button className="btn btn-info btn-lg" type="submit">Submit</button>
                            </form>      
                        </div>           
                    </div>
                </div>
            </main>
    </>
        );
    } else {
        window.location.replace("/");
      }
};