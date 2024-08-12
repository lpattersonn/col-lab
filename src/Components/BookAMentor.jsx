import React, {useEffect, useState} from "react";
import axios from "axios";
import {readableDate} from "../helper.js";

export default function BookAMentor(prop) {
const userDetails = JSON.parse(localStorage.getItem('userDetails'));
const [mentorRequest, setMentorRequest] = useState({
    mentor_request_date: '',
    mentor_request_time: '',
    mentor_request_hours: '',
    mentor_request_notes: ''
})
const [requestSubmitted, setRequestSubmitted] = useState('not submitted');
const [currentRequest, setCurrentRequest] = useState({});
const [mentorAgree, setMentorAgree] = useState("Not chosen");
const [triggerRerender, setTriggerRerender] = useState(false); 

// Get mentor requests
useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/wp-json/wp/v2/mentor-requests/`,
        {
            headers: {
                Authorization: `Bearer ${userDetails.token}`
            }
        }
    ).then(function(response) {
        let oldestRequest = response?.data?.filter((request) => {
            return Number(request?.acf?.mentor_chat_id) === Number(prop?.chat_id);
        }).filter((requestTwo) => {
            return requestTwo?.acf?.mentor_agree === "Not chosen";
        })
        setCurrentRequest(oldestRequest[oldestRequest.length - 1]);
    })
}, [mentorAgree, triggerRerender]);

// Handle submit
const handleSubmit = (e) => {
    e.preventDefault();
    axios.post(`${process.env.REACT_APP_API_URL}/wp-json/wp/v2/mentor-requests/`,
        { 
        title: `Mentor chat between ${userDetails.firstName} and ${prop.prop2}`,
        content: `Mentor chat between ${userDetails.firstName} and ${prop.prop2}`,
        status: 'publish',
            'acf' : {
                'mentor_request_date': mentorRequest?.mentor_request_date,
                'mentor_request_time:': `${mentorRequest?.mentor_request_time}:00`,
                'mentor_request_hours': mentorRequest?.mentor_request_hours,
                'mentor_request_notes': mentorRequest?.mentor_request_notes,
                'mentor_id': prop?.mentor_id,
                'mentee_id': prop?.mentee_id,
                'mentor_chat_id': prop?.chat_id,
            }
        },
        {
            headers: {
                Authorization: `Bearer ${userDetails.token}`
            }
        }
    ).then(function(response) {
        console.log(response);
        setRequestSubmitted('submitted');
    })
}


//   Handle Change
function handleChange(e) {
    const {name, value} = e.target
    setMentorRequest(prev => {
        return (
            { ...prev, [name]: value}
        )
    })
}

// Handle mentor request submit
const mentorRequestSubmit = () => {
    axios.post(`${process.env.REACT_APP_API_URL}/wp-json/wp/v2/mentor-requests/${currentRequest.id}`,
        {
            "acf": {
                "mentor_agree": mentorAgree,
            }
        },
        {
            headers: {
                Authorization: `Bearer ${userDetails.token}`,
            }   
        }
    ).then((response) => {
        console.log(response);
       
    }).catch((error) => {

    });
}

const toggleTriggerRerender = () => {
    setTriggerRerender(!triggerRerender);
};

return (
    <div className={`modal-container ${prop?.prop1}`}>
        <div className="modal-container-background"></div>
        { userDetails.id === prop.mentee_id ?
        <div className="calender-schedule-modal p-3">
            <div className='card'>
            <div className="modal-popup-icon">
                                        <svg
                                        className="mentor-request-icon"
                                        onClick={() => {
                                            let state = "";
                                            if (prop.prop1 === 'hide') {
                                                state = 'show';
                                            } else {
                                                state = 'hide';
                                            }
                                            prop.updateParentState(state);
                                            setMentorAgree("Not chosen");
                                            toggleTriggerRerender();
                                        }}
                                        width="12.103323mm"
                                        height="12.105565mm"
                                        viewBox="0 0 12.103323 12.105565"
                                        version="1.1"
                                        id="svg1"
                                        xmlnsinkscape="http://www.inkscape.org/namespaces/inkscape"
                                        xmlnssodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd"
                                        xmlns="http://www.w3.org/2000/svg"
                                        xmlnssvg="http://www.w3.org/2000/svg">
                                        <sodipodinamedview
                                            id="namedview1"
                                            pagecolor="#ffffff"
                                            bordercolor="#666666"
                                            borderopacity="1.0"
                                            inkscapeshowpageshadow="2"
                                            inkscapepageopacity="0.0"
                                            inkscapepagecheckerboard="0"
                                            inkscapedeskcolor="#d1d1d1"
                                            inkscapedocument-units="mm" />
                                        <defs
                                            id="defs1" />
                                        <g
                                            inkscapelabel="Layer 1"
                                            inkscapegroupmode="layer"
                                            id="layer1"
                                            transform="translate(-6.9914114,-5.8580254)">
                                            <g
                                            id="g3"
                                            transform="translate(0.35406431,-0.60696738)">
                                            <rect
                                                
                                                id="rect2"
                                                width="3.4117243"
                                                height="10.152302"
                                                x="-1.5839893"
                                                y="12.740046"
                                                ry="0.35877365"
                                                rx="0"
                                                transform="rotate(-45)" />
                                            <rect
                                                
                                                id="rect2-7"
                                                width="3.4117243"
                                                height="10.152302"
                                                x="16.125717"
                                                y="-5.1964393"
                                                ry="0.35877365"
                                                rx="0"
                                                transform="rotate(45)" />
                                            </g>
                                            </g>
                                        </svg>
                                    </div>
                <div className='card-body'>
                    <form onSubmit={handleSubmit}>
                        <h4>Mentor Request Form</h4>
                        <div className='row mb-3'>
                            <div className='col-12'>
                                <label htmlFor="mentor_request_date" className='small m-0'>Please indicate your proposed meeting date</label>
                                <input className="form-control" value={mentorRequest.mentor_request_date} name="mentor_request_date" type="date" aria-label="event-date" disabled={requestSubmitted === 'submitted' ? true : false } onChange={handleChange} />
                            </div>
                        </div>
                        <div className='row mb-3'>
                            <div className='col-12'>
                                <label htmlFor="mentor_request_time" className='small m-0'>Please indicate your proposed meeting time</label>
                                <input className="form-control" value={mentorRequest.mentor_request_time} name="mentor_request_time" type="time" aria-label="event-time" disabled={requestSubmitted === 'submitted' ? true : false } onChange={handleChange} />
                            </div>
                        </div>
                        <div className='row mb-3'>
                            <div className='col-12'>
                                <label htmlFor="mentor_request_hours" className='small m-0'>Number of hours</label>
                                <input className="form-control" value={mentorRequest.mentor_request_hours} name="mentor_request_hours" type="number" aria-label="event-duration" disabled={requestSubmitted === 'submitted' ? true : false } onChange={handleChange} />
                            </div>
                        </div>
                        <div className='row mb-3'>
                            <div className='col-12'>
                                <label htmlFor="mentor_request_notes" className='small m-0'>Notes</label>
                                <textarea row="3" value={mentorRequest.mentor_request_notes} className="form-control" name="mentor_request_notes" aria-label="event-message" disabled={requestSubmitted === 'submitted' ? true : false } onChange={handleChange} />
                            </div>
                        </div>
                        {requestSubmitted === 'submitted' && 
                        <div className="alert alert-success" role="alert">
                            <p className="small">Success! A mentor request has been submitted.</p>
                        </div>
                        }
                        <div className='row mt-3'>
                            <div className='col-12'>
                                <input className='btn btn-primary' name="" type="submit" aria-label="submit" />                             
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div> : 
        <div className="calender-schedule-modal p-3">
            <div className='card'>
            <div className="modal-popup-icon">
                                        <svg
                                        className="mentor-request-icon"
                                        onClick={() => {
                                            let state = "";
                                            if (prop.prop1 === 'hide') {
                                                state = 'show';
                                            } else {
                                                state = 'hide';
                                            }
                                            prop.updateParentState(state);
                                            setMentorAgree("Not chosen");
                                            toggleTriggerRerender();
                                        }}
                                        width="12.103323mm"
                                        height="12.105565mm"
                                        viewBox="0 0 12.103323 12.105565"
                                        version="1.1"
                                        id="svg1"
                                        xmlnsinkscape="http://www.inkscape.org/namespaces/inkscape"
                                        xmlnssodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd"
                                        xmlns="http://www.w3.org/2000/svg"
                                        xmlnssvg="http://www.w3.org/2000/svg">
                                        <sodipodinamedview
                                            id="namedview1"
                                            pagecolor="#ffffff"
                                            bordercolor="#666666"
                                            borderopacity="1.0"
                                            inkscapeshowpageshadow="2"
                                            inkscapepageopacity="0.0"
                                            inkscapepagecheckerboard="0"
                                            inkscapedeskcolor="#d1d1d1"
                                            inkscapedocument-units="mm" />
                                        <defs
                                            id="defs1" />
                                        <g
                                            inkscapelabel="Layer 1"
                                            inkscapegroupmode="layer"
                                            id="layer1"
                                            transform="translate(-6.9914114,-5.8580254)">
                                            <g
                                            id="g3"
                                            transform="translate(0.35406431,-0.60696738)">
                                            <rect
                                                
                                                id="rect2"
                                                width="3.4117243"
                                                height="10.152302"
                                                x="-1.5839893"
                                                y="12.740046"
                                                ry="0.35877365"
                                                rx="0"
                                                transform="rotate(-45)" />
                                            <rect
                                                
                                                id="rect2-7"
                                                width="3.4117243"
                                                height="10.152302"
                                                x="16.125717"
                                                y="-5.1964393"
                                                ry="0.35877365"
                                                rx="0"
                                                transform="rotate(45)" />
                                            </g>
                                            </g>
                                        </svg>
                                    </div>
                <div className='card-body'>
                    { currentRequest?.id !== undefined ?
                    <><p className="lead">New Request</p>
                    <p><strong>Date:</strong> {readableDate(currentRequest?.acf?.mentor_request_date)}</p>
                    <p><strong>Time:</strong> {currentRequest?.acf?.mentor_request_time}</p>
                    <p><strong>Hours:</strong> {currentRequest?.acf?.mentor_request_hours}</p>
                    <p><strong>Note:</strong><br/> {currentRequest?.acf?.mentor_request_notes}</p>
                    {mentorAgree != "Not chosen" &&                      
                        <div className="alert alert-success" role="alert">
                            <p className="small">{`This is request as been ${mentorAgree === "Agree" ? "accepted" : "rejected"}`}.</p>
                        </div>
                    }
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        mentorRequestSubmit();
                        }}>
                        <div className='row mt-3'>
                            <div className='col-auto'>
                                <button className={`btn btn-primary ${mentorAgree != "Not chosen" ? "disabled" : ""}`} type="submit" onClick={() => {
                                    setMentorAgree('Agree');
                                    console.log('Agree');
                                    }} aria-label="Accept">Accept</button>                             
                            </div>
                            <div className='col-auto'>
                                <button className={`btn btn-danger ${mentorAgree != "Not chosen" ? "disabled" : ""}`} type="submit" onClick={() => {
                                    setMentorAgree('Not Agree');
                                    console.log('Not Agree');
                                    }} aria-label="Reject">Reject</button>                             
                            </div>
                        </div>
                    </form>
                    </>
                     :
                    <p className="lead text-center">No new requests</p>
                    }
                </div>
            </div>
        </div>
        }
    </div>
)
}