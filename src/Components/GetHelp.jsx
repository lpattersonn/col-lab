import React, { useState, useEffect } from 'react';
import Navigation from './Navigation';
import axios from 'axios';

export default function GetHelp() {
    const [ question, setQuestion ] = useState([]);
    const [ users, setUsers ] = useState([]);

    useEffect(() => {
        axios.get('https://pattersonselectric.com/wp-json/wp/v2/questions')
        .then((response) =>{
            setQuestion(response.data)
        }).catch((err) =>{
            console.log(err);
        })
    }, [])

    useEffect(() => {
        axios.get('https://pattersonselectric.com/wp-json/wp/v2/users')
        .then((response) => {
          setUsers(response.data);
        })
        .catch()
      }, [])

    console.log(question);

    const returnQuestions = question.map((question) => {
        let userName = "";
        let userProfileImg = "";
        let questionPosted = Date.now() - new Date(question.date);
        let days = Math.floor(questionPosted/(86400 * 1000));

        for (let name of users) {
            if ( name.id == question.author) {
              userName = name.name;
              userProfileImg = name['avatar_urls']['24'];
            }
          }

        return (
        <a href="#">
        <div className="card get-help-item mb-4">
            <div className="card-body">
                <div className="row">
                    <div className='col-lg-3 d-flex align-items-center'>
                        <div className='get-help'>
                            <img className="get-help-img mr-3" src={userProfileImg} />
                            <p><strong>{userName}</strong></p>
                        </div>
                    </div>
                    <div className='col-lg-5 d-flex align-items-center'>
                        <p>{question.title.rendered}</p>
                    </div>
                    <div className='col-lg-2 d-flex align-items-center justify-content-end'>
                        <p>{days == 0 ? "Posted today" : `${days}d ago`}</p>
                    </div>
                    <div className='col-lg-2 d-flex align-items-center justify-content-end'>
                        <p className="text-right">0 responses</p>
                    </div>
                </div>
            </div>
        </div>
        </a>
        )
    })

    return (
        <>
            <Navigation />
            <div className="get-help">
                <div className='container-fluid primary'>
                    <div className='get-help-details'>
                        <p><strong>See questions from your peers</strong></p>
                        <a className="btn btn-info btn-lg">Ask a Question</a>
                    </div>
                    <hr className="mb-5"></hr>
                    {returnQuestions}
                </div>
            </div>
        </>
    )
}