import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../context/AppContext';

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://chatbot-op25.onrender.com' : 'http://localhost:3000');

const LiveMonitor = () => {
    const { isAuthenticated } = useAppContext();
    const [projects, setProjects] = useState([]);
    const [selectedProjectId, setSelectedProjectId] = useState('');
    const [sessions, setSessions] = useState([]);
    const [selectedSessionId, setSelectedSessionId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [ws, setWs] = useState(null);
    const selectedSessionIdRef = useRef(null);

    const messagesEndRef = useRef(null);

    // Fetch projects
    useEffect(() => {
        const localToken = localStorage.getItem('authToken');
        if (!isAuthenticated || !localToken) return;
        fetch(`${API_URL}/api/profiles`, {
            headers: { Authorization: `Bearer ${localToken}` }
        })
            .then(async res => {
                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                const data = await res.json();
                return data;
            })
            .then(data => {
                let list = [];
                if (Array.isArray(data)) {
                    list = data;
                } else if (data && typeof data === 'object') {
                    list = Object.keys(data).map(key => ({ id: key, ...data[key] }));
                }
                setProjects(list);
                if (list.length > 0) setSelectedProjectId(list[0].id || list[0]._id);
            })
            .catch(err => {
                console.error('Failed to fetch projects', err);
                setProjects([]);
            });
    }, [isAuthenticated]);

    // Fetch active sessions for selected project
    useEffect(() => {
        const localToken = localStorage.getItem('authToken');
        if (!selectedProjectId || !localToken) return;
        const fetchSessions = async () => {
            try {
                const res = await fetch(`${API_URL}/api/live-chat/${selectedProjectId}/sessions`, {
                    headers: { Authorization: `Bearer ${localToken}` }
                });
                const data = await res.json();
                setSessions(data);
            } catch (err) {
                console.error('Failed to fetch active sessions', err);
            }
        };
        fetchSessions();
        // Option: Poll every 10s or rely purely on WebSocket
    }, [selectedProjectId]);

    // Setup WebSocket connection
    useEffect(() => {
        const localToken = localStorage.getItem('authToken');
        if (!localToken) return;
        const wsUrl = API_URL.replace(/^http/, 'ws');
        const socket = new WebSocket(`${wsUrl}?token=${localToken}&type=dashboard`);

        socket.onopen = () => console.log('LiveMonitor WS Connected');
        socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.type === 'NEW_MESSAGE') {
                    const msg = data.payload;
                    // Update sessions list with last message snippet
                    setSessions(prev => {
                        const existing = prev.find(s => s._id === msg.chatSessionId);
                        if (existing) {
                            return prev.map(s => s._id === msg.chatSessionId ? { ...s, lastMessage: msg.content, lastMessageAt: new Date().toISOString() } : s);
                        } else {
                            // If it's a new session, we might need to fetch it or mock it
                            return [{ _id: msg.chatSessionId, projectId: msg.projectId, status: 'active', lastMessage: msg.content, lastMessageAt: new Date().toISOString() }, ...prev];
                        }
                    });

                    // Update messages if this session is selected
                    if (selectedSessionIdRef.current === msg.chatSessionId) {
                        setMessages(prev => {
                            if (prev.some(m => m._id === msg._id)) return prev;
                            return [...prev, msg];
                        });
                    }
                } else if (data.type === 'SESSION_CREATED') {
                    setSessions(prev => [data.payload, ...prev]);
                } else if (data.type === 'SESSION_UPDATED') {
                    setSessions(prev => prev.map(s => s._id === data.payload._id ? data.payload : s));
                }
            } catch (err) {
                console.error('WS parse error', err);
            }
        };
        socket.onclose = () => console.log('LiveMonitor WS Disconnected');

        setWs(socket);
        return () => socket.close();
    }, []);

    // Fetch messages when a session is selected
    useEffect(() => {
        const localToken = localStorage.getItem('authToken');
        if (!selectedSessionId || !localToken || !selectedProjectId) return;
        const fetchMessages = async () => {
            try {
                const currentSession = sessions.find(s => s._id === selectedSessionId);
                const pId = currentSession?.projectId || selectedProjectId;
                const res = await fetch(`${API_URL}/api/live-chat/${pId}/session/${selectedSessionId}/messages`, {
                    headers: { Authorization: `Bearer ${localToken}` }
                });
                const data = await res.json();
                setMessages(data);
                setTimeout(scrollToBottom, 100);
            } catch (err) {
                console.error('Fetch messages error', err);
            }
        };
        fetchMessages();
    }, [selectedSessionId, selectedProjectId, sessions]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        selectedSessionIdRef.current = selectedSessionId;
    }, [selectedSessionId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleTakeover = async () => {
        if (!selectedSessionId) return;
        const currentSession = sessions.find(s => s._id === selectedSessionId);
        const pId = currentSession?.projectId || selectedProjectId;
        try {
            const localToken = localStorage.getItem('authToken');
            const res = await fetch(`${API_URL}/api/live-chat/${pId}/session/${selectedSessionId}/takeover`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${localToken}` }
            });
            const data = await res.json();
            if (data.success) {
                setSessions(prev => prev.map(s => s._id === selectedSessionId ? { ...s, isAgentActive: true } : s));
            }
        } catch (err) {
            console.error('Takeover error', err);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!inputText.trim() || !selectedSessionId) return;

        const tempText = inputText;
        setInputText('');

        const currentSession = sessions.find(s => s._id === selectedSessionId);
        const pId = currentSession?.projectId || selectedProjectId;

        try {
            const localToken = localStorage.getItem('authToken');
            await fetch(`${API_URL}/api/live-chat/${pId}/session/${selectedSessionId}/message`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localToken}`
                },
                body: JSON.stringify({ content: tempText })
            });
            // The message will come back via WS, but we could optimistically add it here
        } catch (err) {
            console.error('Send error', err);
        }
    };

    const activeSession = sessions.find(s => s._id === selectedSessionId);

    return (
        <div className="flex h-screen bg-gray-50 border-t border-gray-200">
            {/* Sidebar for Projects and Sessions */}
            <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
                <div className="p-4 border-b border-gray-200 z-10">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Live Chats</h2>
                    <select
                        value={selectedProjectId}
                        onChange={(e) => {
                            setSelectedProjectId(e.target.value);
                            setSelectedSessionId(null);
                        }}
                        className="w-full p-2 border border-gray-300 rounded focus:border-blue-500 focus:outline-none"
                    >
                        {projects.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {sessions.length === 0 ? (
                        <p className="p-4 text-gray-500 text-center">No active sessions right now.</p>
                    ) : (
                        sessions.map(session => (
                            <div
                                key={session._id}
                                onClick={() => setSelectedSessionId(session._id)}
                                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${selectedSessionId === session._id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <span className="font-semibold text-gray-800">Visitor {session._id.slice(-4)}</span>
                                    <span className="text-xs text-gray-400">
                                        {new Date(session.lastMessageAt || session.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center gap-2">
                                    <p className="text-sm text-gray-600 truncate">{session.lastMessage}</p>
                                    {session.isAgentActive && (
                                        <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-full font-medium tracking-wide">
                                            ACTIVE
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className="w-2/3 flex flex-col bg-gray-50 relative">
                {selectedSessionId ? (
                    <>
                        <div className="p-4 bg-white border-b border-gray-200 flex justify-between items-center z-10 shadow-sm">
                            <h3 className="text-lg font-semibold text-gray-800">Chat with Visitor {selectedSessionId.slice(-4)}</h3>
                            {!activeSession?.isAgentActive && (
                                <button
                                    onClick={handleTakeover}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow-sm text-sm font-medium transition-colors"
                                >
                                    Take Over Chat
                                </button>
                            )}
                            {activeSession?.isAgentActive && (
                                <span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full font-medium border border-green-200">
                                    You are handling this chat
                                </span>
                            )}
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            {messages.map((msg, idx) => {
                                const isAgent = ['agent', 'bot'].includes(msg.sender);
                                const isUser = msg.sender === 'user';
                                const isBot = msg.sender === 'bot';
                                const isHumanAgent = msg.sender === 'agent';

                                return (
                                    <div key={msg._id || idx} className={`flex ${isAgent ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[70%] rounded-2xl p-4 shadow-sm ${isUser ? 'bg-white text-gray-800 border border-gray-100 rounded-tl-none' :
                                            isBot ? 'bg-gray-800 text-white rounded-tr-none' :
                                                'bg-blue-600 text-white rounded-tr-none'
                                            }`}>
                                            <p className="whitespace-pre-wrap leading-relaxed text-[15px]">{msg.content}</p>
                                            <div className={`text-[10px] mt-2 ${isUser ? 'text-gray-400 text-left' : 'text-gray-300 text-right'}`}>
                                                {isBot ? '🤖 AI Bot' : isHumanAgent ? '👨‍💻 You' : '👤 Visitor'} • {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {activeSession?.isAgentActive ? (
                            <div className="p-4 bg-white border-t border-gray-200">
                                <form onSubmit={handleSendMessage} className="flex gap-3">
                                    <input
                                        type="text"
                                        value={inputText}
                                        onChange={(e) => setInputText(e.target.value)}
                                        placeholder="Type your message..."
                                        className="flex-1 border border-gray-300 rounded-full px-5 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-shadow"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!inputText.trim()}
                                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-6 py-3 rounded-full font-medium transition-colors shadow-sm"
                                    >
                                        Send
                                    </button>
                                </form>
                            </div>
                        ) : (
                            <div className="p-4 bg-gray-100 border-t border-gray-200 text-center text-gray-500 text-sm">
                                View only mode. To send messages, click "Take Over Chat".
                            </div>
                        )}
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-400">
                        <div className="text-center">
                            <span className="text-4xl mb-4 block">💬</span>
                            <p>Select a session to view the chat</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LiveMonitor;
