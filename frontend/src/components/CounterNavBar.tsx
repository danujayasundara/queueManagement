import React, { useState, useEffect } from "react";
import { FaBell, FaUser } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./NavBar.css";

const CounterNavBar: React.FC = () => {
    const [counterName, setCounterName] = useState('');
    const [username, setUsername] = useState('');
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCounterName = async () => {
            const counterId  = sessionStorage.getItem('counterId');
            const storedUsername = sessionStorage.getItem('username');
            const token = sessionStorage.getItem('token');

            if (storedUsername) {
                setUsername(storedUsername); 
            }

            if(!counterId) {
                console.error('CounterId not found in session');
                return;
            }

            try {
                const response = await axios.post(
                    `http://localhost:3000/counter/counterName`, 
                    { counterId },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setCounterName(response.data.counterName);
            } catch (error) {
                console.error('Failed to fetch counter name', error);
            }
        };
        fetchCounterName();
    }, []);

    const handleLogout = async () => {
        const userId = sessionStorage.getItem('userId');
        const userType = sessionStorage.getItem('userType');
        try {
            await axios.post('http://localhost:3000/auth/logout', { userId, userType });
            sessionStorage.clear();
            navigate('/counter-login');
        } catch (error) {
            console.error('Error during logout process', error);
        }
    };

    const toggleDropdown = () => {
        setDropdownOpen(!dropdownOpen);
    };

    return (
        <div className="navbar-container">
            <div className="counter-name">
                <h5>Counter</h5>
                <div className="overlay-shape-counter">
                    <span className="counter-name-text">{counterName}</span>   
                </div>
            </div>
            <div className="user-profile" onClick={toggleDropdown}>
                <span className="user-name" >{username}</span>
                <FaUser className="user-icon" />
                <div className="overlay-shape"></div>
                {dropdownOpen && (
                    <div className="dropdown-menu">
                        <button onClick={handleLogout}>Logout</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CounterNavBar;