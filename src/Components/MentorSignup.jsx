import React, { useState, useEffect } from "react";
import Navigation from "./Navigation";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse } from '@fortawesome/free-solid-svg-icons';
import { reducePoints } from '../helper';
import api from '../services/api';

export default function MentorSignup() {
    const userDetails = JSON.parse(localStorage.getItem('userDetails'));
    const [mentorStatus, setMentorStatus] = useState("No");
    const [createMentor, setCreateMentor]  = useState({
        jobs_institution: '',
        user_mentor_current_position: '',
        user_mentor_current_company: '',
        user_mentor_key_responsibilities: '',
        user_mentor_education: '',
        user_mentor_preferred_language: '',
        user_mentor_preferred_meetup: '',
        user_mentor_rate_of_pay: '',
        user_mentor_currency: '',
        user_mentor_name_on_card: '',
        user_mentor_card_number: '',
        user_transit_number: '',
        user_institution_number: '',
        user_mentor_bio: '',
        user_mentor_services_offered: ''
    })
    const [ getCountries, setGetCountries ] = useState([]);

    useEffect(() => {
        Promise.all([
        // Countries
        api.get("https://restcountries.com/v3.1/all"),
        // Single user
        api.get(`/wp-json/wp/v2/users/${userDetails?.id}`)
        ])
        .then(([contries, singleUser]) => {
            // Countries
            setGetCountries(contries.data);   
            // Single user
            if (singleUser?.data?.acf?.user_is_mentor === 'Yes') {
                setMentorStatus(200);
                alert("You are already registered as a mentor.");
            }
        })
        .catch(error => {
            console.error(error);
        })
    }, []);

        //   Handle Change
    function handleChange(e) {
        const {name, value} = e.target
        setCreateMentor(prev => {
            return (
                { ...prev, [name]: value}
            )
        })
        }

    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = await reducePoints(userDetails, 5, 5);
    
        if (success === true) {
        try {
            // Upload image if file exists
                const response = await api.post(
                `/wp-json/wp/v2/users/${userDetails?.id}`,
                    {
                        'acf' : {
                            'user_is_mentor': 'Yes',
                            'user_mentor_current_position': createMentor.user_mentor_current_position,
                            'user_mentor_current_company': createMentor.user_mentor_current_company,
                            'user_mentor_key_responsibilities': createMentor.user_mentor_key_responsibilities,
                            'user_mentor_education': createMentor.user_mentor_education,
                            'user_mentor_preferred_language': createMentor.user_mentor_preferred_language,
                            'user_mentor_preferred_meetup': createMentor.user_mentor_preferred_meetup,
                            'user_mentor_rate_of_pay': createMentor.user_mentor_rate_of_pay,
                            'user_mentor_currency': createMentor.user_mentor_currency,
                            'user_mentor_name_on_card': createMentor.user_mentor_name_on_card,
                            'user_mentor_card_number': createMentor.user_mentor_card_number,
                            'user_transit_number': createMentor.user_transit_number,
                            'user_institution_number': createMentor.user_institution_number,
                            'user_mentor_bio': createMentor.user_mentor_bio,
                            'user_mentor_services_offered': createMentor.user_mentor_services_offered,
                        }
                    }
                )
                .then((response) => {
                    setMentorStatus(response.status);
                })
                .catch((error) => {
                });
        } catch (error) {
            console.error('Error submitting question:', error);
        }
    }    
}

const countries = getCountries
.slice()
.sort((a, b) => a?.name?.common?.localeCompare(b?.name?.common))
.map((country, index) => {
    for ( let key in country?.currencies) {
        return (
            <option key={index}>{key}</option>
        )
    }
})

if (userDetails != null) {
    return(
        <>
            <Navigation user={userDetails} />
            <main className="create-job">
                <div className="container primary" >
                    <div className="page-filter">
                        <div className="row mb-5">
                            <div className="col-12 d-flex">
                                <Link to="/" className="link-dark small d-flex align-items-center"><FontAwesomeIcon icon={faHouse} /></Link><span className="breadcrumb-slash d-flex align-items-center">></span><Link to="/mentorship-opportunities" className="link-dark small d-flex align-items-center">Mentorship Opportunities</Link><span className="breadcrumb-slash d-flex align-items-center">>></span><span className="small d-flex align-items-center">Mentor Signup</span>
                            </div>
                        </div>
                    </div>
                    <div className="row mb-5">
                        <div className="col-12">
                            <h1><strong>Become a COLLABB mentor</strong></h1>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-12">
                            <form className="form-create-job points mx-auto shadow-lg" onSubmit={handleSubmit}>
                                <div className="row  mb-2">
                                    <div className="col-12">
                                        <h2><strong>Mentorship Application Form</strong></h2>
                                    </div>
                                </div>
                                <p className="mb-4">Applying is easy! We already know about you...we just need a bit more information (please note that mentorship applications are verified).</p>
                                
                                <div className="row">
                                    <div className="col-lg-6  mb-4">
                                        <input name="user_mentor_current_position" value={createMentor.user_mentor_current_position} onChange={handleChange} className='form-control form-control-lg' placeholder="Current position" aria-label='Current position' disabled={ mentorStatus === 200 ? true : false} required />
                                    </div>
                                    <div className="col-lg-6  mb-4">
                                        <input name="user_mentor_current_company" value={createMentor.user_mentor_current_company} onChange={handleChange} className='form-control form-control-lg' placeholder="Current company/institution" aria-label='Current company/institution' disabled={ mentorStatus === 200 ? true : false} required />
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-lg-6  mb-4">
                                        <input className="form-control form-control-lg" type="text" name="user_mentor_preferred_language"  value={createMentor.user_mentor_preferred_language} onChange={handleChange} aria-label='Preferred language' placeholder="Preferred language" autoComplete='on' disabled={ mentorStatus === 200 ? true : false} required />
                                    </div>
                                    <div className="col-lg-6  mb-4">
                                        <select className="form-control form-control-lg form-select" type="text" name="user_mentor_preferred_meetup"  value={createMentor.user_mentor_preferred_meetup} onChange={handleChange} aria-label='Preferred meet-up: virtual or in-person' autoComplete='on' disabled={ mentorStatus === 200 ? true : false} required>
                                            <option disabled value="">Preferred meet-up</option>
                                            <option value="Virtual">Virtual</option>
                                            <option value="In-person">In person</option>
                                        </select>
                                    </div>
                                </div>


                                <div className="row">
                                    <div className="col-lg-6  mb-4">
                                        <textarea rows="4" className="form-control form-control-lg" type="text" name="user_mentor_services_offered"  value={createMentor.user_mentor_services_offered} onChange={handleChange} aria-label='Services Offered' placeholder="Services Offered" autoComplete='on' disabled={ mentorStatus === 200 ? true : false} required></textarea>
                                    </div>
                                    <div className="col-lg-6  mb-4">
                                        <select defaultValue="" className="form-control form-control-lg form-select" type="text" name="user_mentor_expertise_level"  value={createMentor.user_mentor_expertise_level} onChange={handleChange} aria-label='mentor expertise level' autoComplete='on' disabled={ mentorStatus === 200 ? true : false} required>
                                            <option disabled value="">Level of expertise</option>
                                            <option value="Virtual">Beginner</option>
                                            <option value="In-person">Intermediate</option>
                                            <option value="In-person">Expert</option>
                                        </select>
                                    </div>
                                </div>
                                
                                <div className="row">
                                    <div className="col-12 mb-4">
                                        <p className="mb-2"><strong>Short Bio</strong></p>
                                        <textarea rows="5" className="form-control form-control-lg" type="text" name="user_mentor_bio"  value={createMentor.user_mentor_bio} onChange={handleChange} aria-label='Briefly describe yourself, past and present postions,  and reasons for signing up:' placeholder="Briefly tell us about yourself e.g. past and present postions, expertise, hobbies, reasons for signing up, etc." autoComplete='on' disabled={ mentorStatus === 200 ? true : false} required></textarea>
                                    </div>
                                </div>
                                <p className="mb-2"><strong>Qualifications</strong></p>
                                <div className="row">
                                    <div className="col-12 mb-4">
                                        <textarea rows="7" className="form-control form-control-lg" type="text" name="user_mentor_key_responsibilities"  value={createMentor.user_mentor_key_responsibilities} onChange={handleChange} aria-label='Key responsibilities in current role' placeholder="Please detail your key responsibilities in your current role." autoComplete='on' disabled={ mentorStatus === 200 ? true : false} required></textarea>
                                    </div>
                                </div>

                                <p className="mb-2"><strong>Education</strong></p>
                                <div className="row">
                                    <div className="col-12 mb-4">
                                        <textarea rows="7" className="form-control form-control-lg" type="text" name="user_mentor_education"  value={createMentor.user_mentor_education} onChange={handleChange} aria-label='Education' placeholder="Starting with the most recent, please indicate your completed education, including the school, date of completion, and degrees, diplomas, and/or certificates earned." autoComplete='on' disabled={ mentorStatus === 200 ? true : false} required></textarea>
                                    </div>
                                </div>
                                <p className="mb-2"><strong>Set your pay</strong></p>
                                <div className="row">
                                    <div className="col-lg-6  mb-4">
                                        <input className="form-control form-control-lg" type="number" name="user_mentor_rate_of_pay"  value={createMentor.user_mentor_rate_of_pay} onChange={handleChange} aria-label='Rate of pay' placeholder="Hourly rate" autoComplete='on' disabled={ mentorStatus === 200 ? true : false} required />
                                    </div>
                                    <div className="col-lg-6  mb-4">
                                        <select name="user_mentor_currency" value={createMentor.user_mentor_currency}  onChange={handleChange} className='form-control form-select form-control-lg' aria-label="Currency" autoComplete="Currency"  disabled={ mentorStatus === 200 ? true : false} required>
                                            <option disabled value="">Currency</option>
                                            {countries}
                                        </select>
                                    </div>
                                </div>
                                { mentorStatus === 200 ? 
                                <div className="alert alert-success mb-5" role="alert">
                                    <p>Success! You are registered as a mentor!</p>
                                </div>
                                : ''    
                                }
                                <button className="btn btn-info btn-lg" type="submit" disabled={ mentorStatus === 200 ? true : false} >Submit</button>
                            </form>             
                        </div>
                    </div>
                </div>
            </main>
    </>
        );
    } else {
        window.location.replace("/login");
      }
};