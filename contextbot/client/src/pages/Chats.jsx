import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAppContext } from '../context/AppContext';

const Chats = () => {
    const [chats, setChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const { } = useAppContext(); // Removed token from destructuring

    useEffect(() => {
        fetchChats();
    }, []);

    const fetchChats = async () => {
        try {
            const res = await axios.get('/api/chats');
            setChats(res.data);
        } catch (e) {
            console.error("Failed to fetch chats", e);
        }
    };

    const handleDelete = async (id, e) => {
        e.stopPropagation();
        if (!window.confirm("Are you sure you want to delete this chat permanently?")) return;

        try {
            await axios.delete(`/api/chats/${id}`);
            setChats(chats.filter(c => c._id !== id));
            if (selectedChat?._id === id) {
                setSelectedChat(null);
                setMessages([]);
            }
        } catch (e) {
            alert("Failed to delete chat");
        }
    };

    const handleViewChat = async (chat) => {
        setSelectedChat(chat);
        setLoading(true);
        try {
            const res = await axios.get(`/api/chats/${chat._id}/messages`);
            setMessages(res.data);
        } catch (e) {
            console.error("Failed to fetch messages", e);
        } finally {
            setLoading(false);
        }
    };

    const closeChat = () => {
        setSelectedChat(null);
        setMessages([]);
    };

    return (
        <div className="p-8 h-screen flex flex-col">
            <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                Chat History
            </h2>

            <div className="flex gap-6 h-full overflow-hidden">
                {/* Chat List */}
                <div className={`${selectedChat ? 'w-1/3' : 'w-full'} bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col transition-all duration-300`}>
                    <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                        <input
                            type="text"
                            placeholder="Search chats..."
                            className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm transition-all"
                        />
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        <table className="w-full text-left border-collapse">
                            {!selectedChat && (
                                <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold sticky top-0">
                                    <tr>
                                        <th className="p-4 border-b">Visitor / Description</th>
                                        <th className="p-4 border-b">Project</th>
                                        <th className="p-4 border-b">Last Active</th>
                                        <th className="p-4 border-b text-right">Actions</th>
                                    </tr>
                                </thead>
                            )}
                            <tbody className="text-sm divide-y divide-slate-100">
                                {chats.map(chat => (
                                    <tr
                                        key={chat._id}
                                        onClick={() => handleViewChat(chat)}
                                        className={`cursor-pointer transition-colors ${selectedChat?._id === chat._id ? 'bg-blue-50 border-l-4 border-l-blue-500 rounded-none' : 'hover:bg-slate-50 border-l-4 border-l-transparent'}`}
                                    >
                                        <td className="p-4">
                                            <div className="font-medium text-slate-900 line-clamp-1">
                                                {chat.metadata?.userAgent || `Visitor ${chat._id.slice(-4)}`}
                                            </div>
                                            <div className="text-xs text-slate-500 mt-1">
                                                {chat.status}
                                            </div>
                                        </td>
                                        {!selectedChat && (
                                            <>
                                                <td className="p-4 text-slate-600">
                                                    <span className="px-2 py-1 rounded bg-slate-100 text-xs font-semibold">{chat.projectName}</span>
                                                </td>
                                                <td className="p-4 text-slate-500 text-xs">
                                                    {new Date(chat.lastMessageAt).toLocaleString()}
                                                </td>
                                            </>
                                        )}
                                        <td className="p-4 text-right">
                                            <button
                                                onClick={(e) => handleDelete(chat._id, e)}
                                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                                title="Delete Chat"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {chats.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="p-8 text-center text-slate-400">No active chats found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Chat Detail View */}
                {selectedChat && (
                    <div className="w-2/3 bg-white rounded-xl shadow-lg border border-slate-200 flex flex-col overflow-hidden animate-slideIn">
                        {/* Header */}
                        <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                            <div>
                                <h3 className="font-bold text-slate-800">
                                    {selectedChat.projectName}
                                </h3>
                                <p className="text-xs text-slate-500">
                                    ID: {selectedChat._id} • {new Date(selectedChat.createdAt).toLocaleString()}
                                </p>
                            </div>
                            <button onClick={closeChat} className="text-slate-400 hover:text-slate-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/30">
                            {loading ? (
                                <div className="flex justify-center items-center h-full">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                </div>
                            ) : (
                                <>
                                    {messages.length === 0 && (
                                        <p className="text-center text-slate-400 my-10">No messages in this conversation.</p>
                                    )}
                                    {messages.map((msg, idx) => (
                                        <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[80%] rounded-2xl px-5 py-3 text-sm shadow-sm ${msg.sender === 'user'
                                                ? 'bg-gray-900 text-white rounded-br-none'
                                                : 'bg-white border border-slate-200 text-slate-700 rounded-bl-none'
                                                }`}>
                                                <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                                                <div className={`text-[10px] mt-2 opacity-70 ${msg.sender === 'user' ? 'text-blue-100' : 'text-slate-400'}`}>
                                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </>
                            )}
                        </div>

                        {/* Footer - No Input needed as this is history view, but maybe useful later */}
                        <div className="p-4 bg-slate-50 border-t border-slate-200 text-center text-xs text-slate-400">
                            Read-only archive view
                        </div>
                    </div>
                )}
            </div>
            <style>{`
                @keyframes slideIn {
                    from { opacity: 0; transform: translateX(20px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                .animate-slideIn { animation: slideIn 0.3s ease-out; }
            `}</style>
        </div>
    );
};

export default Chats;
