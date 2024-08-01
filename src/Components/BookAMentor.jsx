import React, {useState} from "react";

export default function BookAMentor(prop) {
const [ calenderModal, setCalenderModal ] = useState('hide');
const [overFLow, setOverFlow] = useState(false);

return (
    <div className={`modal-container ${prop.prop1}`}>
        <div className="modal-container-background"></div>
        <div className={"calender-schedule-modal"+' '+"p-3"+' '+`${prop.prop1}`}>
            <div className='card'>
                <div className='card-body'>
                    <form>
                        <h4>Mentor Request Form</h4>
                        <div className='row mb-3'>
                            <div className='col-12'>
                                <label className='small m-0'>Please indicate your proposed meeting date/time</label>
                                <input className="form-control" type="date" aria-label="event-date" />
                            </div>
                        </div>
                        <div className='row mb-3'>
                            <div className='col-12'>
                                <label className='small m-0'>Number of hours</label>
                                <input className="form-control" type="number" aria-label="event-duration" />
                            </div>
                        </div>
                        <div className='row mb-3'>
                            <div className='col-12'>
                                <label className='small m-0'>Notes</label>
                                <textarea row="3" className="form-control" aria-label="event-message" />
                            </div>
                        </div>
                        <div className='row'>
                            <div className='col-12'>
                                <input className='btn btn-primary' type="submit" aria-label="submit" />
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
)
}