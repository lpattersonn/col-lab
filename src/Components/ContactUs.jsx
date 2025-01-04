import React, { useState, useEffect } from "react";
import Navigation from "./Navigation";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSuitcase, faCoins, faMoneyBill, faHouse, faPen } from '@fortawesome/free-solid-svg-icons';
import SectionImage from "../Images/rb_2582.png";
import axios from "axios";


export default function ContactUs() {
    const userDetails = JSON.parse(localStorage.getItem('userDetails'));
    // const [requestSent, setRequestSent] = useState("No");
    // const [createLearningRequest, setCreateLearningRequest]  = useState({
    //     'learning_description': '',
    //     'learning_features': '',
    //     'learning_pay': '',
    //     'learning_perk': '',
    //     'learning_deadline': ''
    // });

//     //   Handle Change
//   function handleChange(e) {
//     const {name, value} = e.target
//     setCreateLearningRequest(prev => {
//         return (
//             { ...prev, [name]: value}
//         )
//     })
// }

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//         // Upload image if file exists
//             const response = await axios.post(
//               `${process.env.REACT_APP_API_URL}/wp-json/wp/v2/learning-center/`,
//                 {   
//                     'title':  createLearningRequest.learning_description,
//                     'content': "",
//                     'excerpt': "",
//                     'author': userDetails.id,
//                     'status': 'publish',
//                     'acf' : {
//                         'learning_description': createLearningRequest.learning_description,
//                         'learning_features': createLearningRequest.learning_features,
//                         'learning_pay': createLearningRequest.learning_pay,
//                         'learning_perk': createLearningRequest.learning_perk,
//                         'learning_deadline': createLearningRequest.learning_deadline
//                     }
//                 },
//                 {
//                     headers: {
//                         Authorization: `Bearer ${userDetails.token}`
//                     }
//                 }
//             )
//             .then((response) => {
//                 console.log('Question submitted successfully:', response);
//                 setRequestSent(response.status);
//             })
//             .catch((error) => {
//             });
//     } catch (error) {
//         console.error('Error submitting question:', error);
//     }
// }

if (userDetails != null) {
    return(
        <>
            <Navigation />
            <main className="create-collaboration" style={{marginTop: "6rem"}}>
                <div className="container primary" >
                    <div className="row">
                        <div className="col-12 mb-4">
                            <h1><strong>Contact Us</strong></h1>
                        </div>
                    </div>
                    <div className="row mt-5">
                        <div className="col-lg-6">
                            <img className="collaboration-page_image" src={SectionImage} alt="Image of scientist" role="presentation" />
                        </div>
                        <div className="col-lg-6">
                            <form className="form-create-job mx-auto" action='https://formsubmit.co/makum086@uottawa.ca' method='POST'>
                                <input
                                    type='hiden'
                                    name='_subject'
                                    value='New Contact Form Submission From www.col-labb.com'
                                    style={{ display: `none` }}
                                />
                                <input type="hidden" name="_cc" value="tech@mapltech.com" />
                                <input type="hidden" name="_autoresponse" value="Thank you for contacting Col-Labb! We’ve received your request, and one of our team members will get back to you as soon as possible. Please note that we are currently experiencing a high volume of inquiries, so our response time may be a little longer than usual."></input>
                                <div className="row">
                                    <div className="col-lg-12 mb-4">
                                        <label htmlFor="name"><strong>Name</strong></label>
                                        <input name="name" id="name" className='form-control form-control-lg' aria-label='Name' type="text" required />
                                    </div>    
                                </div>
                                <div className="row">
                                    <div className="col-lg-12  mb-4">
                                    <label htmlFor="email"><strong>Email</strong></label>
                                    <input name="email" id="email" className='form-control form-control-lg' aria-label='Email' type="email" required />
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-lg-12 mb-4">
                                        <label htmlFor="Message"><strong>Message</strong></label>
                                        <textarea name="Message" id="Message" rows="7" className='form-control form-control-lg' aria-label='Message' type="text" required />
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