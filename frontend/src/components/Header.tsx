import React from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import './Header.css';

const Header: React.FC = () => {
    return (
        <header className="header">
            <div className="logo">
                <h1>Queue Management System</h1>
            </div>
        </header>
    );
};

export default Header;