import React, { useState, useEffect } from "react";
import { FaBell, FaUser } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./NavBar.css";

interface NavBarProps {
    unseenCount: number;
}

const NavBar: React.FC<NavBarProps> = ({ unseenCount }) => {
    const [username, setUsername] = useState('');
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const navigate = useNavigate();

    React.useEffect(() => {
        const userId = sessionStorage.getItem('userId');
        if (!userId) {
            console.error('User ID not found in sessionStorage');
            return;
        }
        
        const storedUsername = sessionStorage.getItem('username');
        if (storedUsername) {
            setUsername(storedUsername); 
        }

    }, []);

    const handleLogout = async () => {
        const userId = sessionStorage.getItem('userId');
        const userType = sessionStorage.getItem('userType');
        try {
            await axios.post('http://localhost:3000/auth/logout', { userId, userType });
            sessionStorage.clear();
            navigate('/user-login');
        } catch (error) {
            console.error('Error during logout process', error);
        }
    };

    const toggleDropdown = () => {
        setDropdownOpen(!dropdownOpen);
    };

    const handleBellClick = () => {
        navigate('/notifications');
    };

    return (
        <div className="notification-container">
            <div className="notification-icon" onClick={handleBellClick}>
                <FaBell />
                {unseenCount > 0 && (
                    <span className="notification-badge">{unseenCount}</span>
                )}
            </div>
            <div className="user-profile" onClick={toggleDropdown}>
                <span className="user-name">{username}</span>
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

export default NavBar;