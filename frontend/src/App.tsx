import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import CounterLogin from './components/CounterLogin';
import UserLogin from './components/UserLogin';
import Home from './pages/Home';
import CounterDashboard from './pages/CounterDashboard';
import UserDashboard from './pages/UserDashboard';
import IssueDetailsPage from './pages/IssueDetailsPage';
import Notification from './pages/Notification';
import OngoingQueuePage from './pages/OngoingQueuePage';
//import Header from './components/Header';
//import Footer from './components/Footer';
//import logo from './logo.svg';
import './App.css';

/*function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}*/

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/counter-login" element={<CounterLogin />} />
        <Route path="/user-login" element={<UserLogin />} />
        <Route path="/counter-dashboard" element={<CounterDashboard />} />
        <Route path="/user-dashboard" element={<UserDashboard />} />
        <Route path="/issue/:issueId" element={<IssueDetailsPage />} />
        <Route path="/notifications" element={<Notification />} />
        <Route path="/ongoing-queue" element={<OngoingQueuePage />} />
      </Routes>
    </Router>
  );
};

export default App;
