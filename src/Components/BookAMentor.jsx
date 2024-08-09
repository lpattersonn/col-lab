import React, {useState} from "react";
import axios from "axios";

export default function BookAMentor(prop) {
const userDetails = JSON.parse(localStorage.getItem('userDetails'));
const [mentorRequest, setMentorRequest] = useState({
    mentor_request_date: '',
    mentor_request_time: '',
    mentor_request_hours: '',
    mentor_request_notes: ''
})
const [requestSubmitted, setRequestSubmitted] = useState('not submitted');

const handleSubmit = (e) => {
    e.preventDefault();
    axios.post(`${process.env.REACT_APP_API_URL}/wp-json/wp/v2/mentor-requests/`,
        { 
        title: `Mentor chat between ${userDetails.firstName} and ${prop.prop2}`,
        content: `Mentor chat between ${userDetails.firstName} and ${prop.prop2}`,
        status: 'publish',
            'acf' : {
                'mentor_request_date': mentorRequest.mentor_request_date,
                'mentor_request_time:': mentorRequest.mentor_request_time,
                'mentor_request_hours': mentorRequest.mentor_request_hours,
                'mentor_request_notes': mentorRequest.mentor_request_notes,
                'mentor_id': prop.mentor_id,
                'mentee_id': prop.mentee_id,
                'mentor_chat_id': prop.mentee_id,
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

return (
    <div className={`modal-container ${prop.prop1}`}>
        <div className="modal-container-background"></div>
        <div className={"calender-schedule-modal"+' '+"p-3"+' '+`${prop.prop1}`}>
            <div className='card'>
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
                        <div class="alert alert-success" role="alert">
                            <p className="small">Success! A mentor request has been submitted.</p>
                        </div>
                        }
                        <div className='row'>
                            <div className='col-12'>
                                <input className='btn btn-primary' name="" type="submit" aria-label="submit" />                             
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
)
}