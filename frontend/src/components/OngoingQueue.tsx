import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import { socket } from './SocketProvider';
import 'bootstrap/dist/css/bootstrap.min.css'; 
import './OngoingQueue.css';


const OngoingQueue: React.FC = () => {
    const [currentIssueIndex, setCurrentIssueIndex] = useState<number | null>(
        Number(sessionStorage.getItem('currentIssueIndex')) || null
    );
    const [nextIssueIndex, setNextIssueIndex] = useState<number | null>(
        Number(sessionStorage.getItem('nextIssueIndex')) || null
    );
    const [myIssueIndex, setMyIssueIndex] = useState<number | null>(null);
    const [issueId, setIssueId] = useState<number | null>(null);
    const [counterId, setCounterId] = useState<string | null>(null);
    const [issueStatus, setIssueStatus] = useState<boolean | null>(null);
    const navigate = useNavigate();

    const userId = sessionStorage.getItem('userId');
    const token = sessionStorage.getItem('token');

    const fetchMyIssueIndex = async () => {
        if (userId) {
            console.log(`Fetching issue index for userId: ${userId}`);
            try {
                const response = await axios.get(`http://localhost:3000/issue/issueIndex/${userId}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                console.log('API Response:', response.data);
                const { issueIndex, issueId, counterId } = response.data;

                // Validate the issueIndex
                if (typeof issueIndex === 'number') {
                    setMyIssueIndex(issueIndex);
                    setIssueId(issueId);
                    setCounterId(counterId);
                    sessionStorage.setItem('issueId', issueId.toString());
                    sessionStorage.setItem('counterId', counterId.toString());

                } else {
                    console.error('Invalid issueIndex:', issueIndex);
                    setMyIssueIndex(null);
                    setIssueId(null);
                    setCounterId(null);
                }
            } catch (error) {
                console.error("Error fetching my issue index:", error);
            }
        }
    };

    const debounce = (func: Function, delay: number) => {
        let timeoutId: NodeJS.Timeout;
        return function (this: any, ...args: any[]) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    };

    const debouncedFetchMyIssueIndex = debounce(fetchMyIssueIndex, 2000);

    useEffect(() => {
        console.log('Connecting to socket server...');
        fetchMyIssueIndex();

        socket.on('connect', () => {
            console.log('Connected to socket server:', socket.id);

            // Join room with userId
            if (userId) {
                socket.emit('join', userId);
                console.log(`Joining room for userId: ${userId}`);
            }
        });

        socket.on('newIssue', (data) => {
            console.log('Received new Issue event:', data);
            fetchMyIssueIndex();
        });

        socket.on('updateIndices', ({ currentIndex, nextIndex }) => {
            setCurrentIssueIndex(currentIndex);
            setNextIssueIndex(nextIndex);
            sessionStorage.setItem('currentIssueIndex', currentIndex.toString());
            sessionStorage.setItem('nextIssueIndex', nextIndex.toString());
        });

        socket.on('issueFixed', (data) => {
            console.log("Received issueFixed event:", data);
            const storedIssueId = sessionStorage.getItem('issueId');
            if (storedIssueId === data.id.toString()) {
                setIssueStatus(true);
            }
        }); 

        socket.on('counterClosed', (data) => {
            console.log('Received counterClosed event:', data);
            fetchMyIssueIndex();
        });

        socket.on('newIssueSubmitted', (data) => {
            console.log('Received newIssueSubmitted event:', data);
            fetchMyIssueIndex();
        });

        const updateMyIssueIndexListener = (data: { issueIndex: number }) => {
            console.log('Received updateMyIssueIndex event:', data);
            debouncedFetchMyIssueIndex(); 
        };

        socket.on('updateMyIssueIndex', updateMyIssueIndexListener);

        return () => {
            console.log('Disconnecting from socket server...');
            socket.off('newIssue');
            socket.off('updateIndices');
            socket.off('issueFixed');
            socket.off('counterClosed');
            socket.off('newIssueSubmitted');
            socket.off('updateMyIssueIndex'); 
            socket.off('updateNextIssueIndex');
            socket.off('connect');
        };
    }, [userId, issueId, myIssueIndex, counterId, issueStatus]);

    const handleCloseIssue = async () => {
        if (issueId && counterId) {
            try {
                await axios.put(`http://localhost:3000/issue/${issueId}/status`, { status: true, counterId },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                console.log('Issue status updated successfully');
                clearSessionStorage();
                navigate('/user-dashboard');
            } catch (error) {
                console.error("Error updating issue status:", error);
            }
        }
    };

    const handleBack = () => {
        clearSessionStorage();
        navigate('/user-dashboard');
    };


    const clearSessionStorage = () => {
        sessionStorage.removeItem('currentIssueIndex');
        sessionStorage.removeItem('nextIssueIndex');
    };

    return (
        <div className="container-main d-flex flex-column align-items-center min-vh-80">
            <div className="text-center1 mb-4">
                {issueStatus === true ? (
                    <div className='solved'>
                        <h1>Solved</h1>
                        <button className="btn btn-primary mt-3" onClick={handleBack}>Back</button>
                    </div>
                ) : currentIssueIndex === myIssueIndex ? (
                    <div className='progressing'>
                        <h1>Your Now</h1>
                    </div>
                ) : nextIssueIndex === myIssueIndex ? (
                    <div className='next'>
                        <h1>Your Next</h1>
                    </div>
                ) : (
                    <div>
                        <p className="currentNo fs-4">
                            Current No: 
                            <span className="issueNumber">
                                {currentIssueIndex !== null ? currentIssueIndex : 'Loading...'}
                            </span>
                        </p>
                        <p className="fs-4">Next: {nextIssueIndex !== null ? nextIssueIndex : 'Loading...'}</p>
                        <p className="fs-4">My No: {myIssueIndex !== null ? myIssueIndex : 'N/A'}</p>
                        <p className="fs-4">Counter No: {counterId}</p>
                    </div>
                )}
            </div>
            {issueId && issueStatus !== true && (
                (nextIssueIndex === myIssueIndex || (currentIssueIndex !== myIssueIndex && nextIssueIndex !== myIssueIndex)) && (
                    <div className="buttonRight">
                        <button className="btn btn-danger" onClick={handleCloseIssue}>Cancel</button>
                    </div>
                )
            )}
        </div>
    );
};

export default OngoingQueue;
