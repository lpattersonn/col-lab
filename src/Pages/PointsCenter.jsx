import React, {useState, useEffect} from 'react';
import { TailSpin } from "react-loader-spinner";
import Navigation from '../Components/Navigation';
import axios from 'axios';

export default function PointsCenter() {
    const userDetails = JSON.parse(localStorage.getItem('userDetails'));
    const [checkout, setCheckout] = useState(0);
    const [loading, setLoading] = useState(true);
    let [userProfile, setUserProfile] = useState({});
    
    useEffect(() => {
        // Api for current user
        axios({
            url: `${process.env.REACT_APP_API_URL}/wp-json/wp/v2/users/${userDetails?.id}`,
            method: 'POST',
            headers: {
            Authorization: `Bearer ${userDetails.token}`
            }
        })
        .then((response) => {
            setUserProfile(response?.data);
            setLoading(false)
        })
        .catch((error) => {
            console.error(error);
        })
    }, []);

    if ( userDetails != null) {
        if (loading === false) {
            return(
            <>
                <Navigation />
                <main className="points-center">
                    <div className="container">
                        <div className="points-center__header">
                            <div className="image">
                                <img src={userProfile?.acf?.["user_profile_picture"]} alt="userProfile?.name" loading="lazy" />
                            </div>
                            <div className="details">
                                <p>Hi{" "}<span>{userProfile?.first_name}</span></p>
                                <p>You currently have {userProfile?.acf?.["user-points"]} points.</p>
                            </div>
                        </div>
                        <hr />
                        <div className="points-center__participation">
                            <h2>How To Get Participation Points</h2>
                            <p className="grey">250 points = 5% discount on subscription plans (a maximum 20% discount can be applied)</p>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Action</th>
                                        <th>Points Earned (Free Plan)</th>
                                        <th>Points Earned (Subscription Plan)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <th scope="row" className='highlight1'>Answer question</th>
                                        <td className='highlight1'>2 points</td>
                                        <td className='highlight1'>4 points</td>
                                    </tr>
                                    <tr>
                                        <th scope="row" className='highlight2'>Lend items</th>
                                        <td className='highlight2'>4 points</td>
                                        <td className='highlight2'>8 points</td>
                                    </tr>
                                    <tr>
                                        <th scope="row" className='highlight1'>Collaborate</th>
                                        <td className='highlight1'>6 points</td>
                                        <td className='highlight1'>12 points</td>
                                    </tr>
                                    <tr>
                                        <th scope="row" className='highlight2'>Teach a skill</th>
                                        <td className='highlight2'>6 points</td>
                                        <td className='highlight2'>12 points</td>
                                    </tr>
                                </tbody>
                            </table>
                            <div className="add-points">
                                <p>We encourage participation in order to gain points. However, below are alternative ways to score points:</p>
                                <p>Watch <a href="#">ad</a> for 1 point.</p>
                                <p><span>Buy</span> points ($5 for 50 points).</p>
                                <div className="points-checkout">
                                    <div className='input'>
                                        <p>How many points would you like to buy? (Minimum of 50)</p>
                                        <input type="number" min="50" step="5" onChange={(e) => {
                                            setCheckout(e.target.value / 10);
                                        }} on />
                                    </div>
                                    <div className="checkout">
                                        <span className="total">${checkout}</span>
                                        <button className="btn btn-primary collab-btn">Checkout</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="points-center__pay">
                            <h2>Pay with Points</h2>
                            <p className="grey">Our points system is designed to foster genuine engagement, and ensure our platform is respected and used responsibly.</p>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Action</th>
                                        <th>Points Required (Free Plan)</th>
                                        <th>Points Required (Subscription Plan)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <th scope="row" className='highlight1'>Ask a question</th>
                                        <td className='highlight1'>5 points</td>
                                        <td className='highlight1'>0 points</td>
                                    </tr>
                                    <tr>
                                        <th scope="row" className='highlight2'>Post an item request</th>
                                        <td className='highlight2'>5 points</td>
                                        <td className='highlight2'>0 points</td>
                                    </tr>
                                    <tr>
                                        <th scope="row" className='highlight1'>Respond to an item request</th>
                                        <td className='highlight1'>2 points</td>
                                        <td className='highlight1'>0 points</td>
                                    </tr>
                                    <tr>
                                        <th scope="row" className='highlight2'>Propose a collaboration</th>
                                        <td className='highlight2'>5 points</td>
                                        <td className='highlight2'>0 points</td>
                                    </tr>
                                    <tr>
                                        <th scope="row" className='highlight1'>Respond to a collab request</th>
                                        <td className='highlight1'>2 points</td>
                                        <td className='highlight1'>0 points</td>
                                    </tr>
                                    <tr>
                                        <th scope="row" className='highlight2'>Request a training</th>
                                        <td className='highlight2'>5 points</td>
                                        <td className='highlight2'>0 points</td>
                                    </tr>
                                    <tr>
                                        <th scope="row" className='highlight1'>Respond to a training request</th>
                                        <td className='highlight1'>2 points</td>
                                        <td className='highlight1'>0 points</td>
                                    </tr>
                                    <tr>
                                        <th scope="row" className='highlight2'>Create a job posting</th>
                                        <td className='highlight2'>5 points</td>
                                        <td className='highlight2'>0 points</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>
            </>
            );
        } else {
        return (
          <TailSpin
          visible={true}
          height="80"
          width="80"
          color="#0f9ed5"
          ariaLabel="tail-spin-loading"
          radius="1"
          wrapperStyle={{position: "absolute", top: 0, left: 0, right: 0, left: 0}}
          wrapperClass="spinner"
          />
        )
      }
    } else {
        window.location.replace("/");
    }
};