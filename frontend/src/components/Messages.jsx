import React, { useState, useEffect } from 'react';
import axios from '../config/axios';
import { toast } from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';

const Messages = () => {
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const response = await axios.get('/api/messages/conversations');
      setConversations(response.data);
    } catch (error) {
      toast.error('Failed to fetch conversations');
    }
  };

  const fetchMessages = async (userId) => {
    try {
      const response = await axios.get(`/api/messages/${userId}`);
      setMessages(response.data);
    } catch (error) {
      toast.error('Failed to fetch messages');
    }
  };

  const handleUserSelect = (userId) => {
    setSelectedUser(userId);
    fetchMessages(userId);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUser || !newMessage.trim()) return;

    try {
      const response = await axios.post('/api/messages', {
        recipientId: selectedUser,
        content: newMessage
      });
      setMessages([...messages, response.data]);
      setNewMessage('');
      // Refresh conversations to update last message
      fetchConversations();
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  return (
    <div className="flex h-[calc(100vh-6rem)]">
      {/* Conversations List */}
      <div className="w-1/3 border-r bg-white">
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold">Conversations</h2>
        </div>
        <div className="overflow-y-auto h-full">
          {conversations.map((conv) => (
            <div
              key={conv._id}
              onClick={() => handleUserSelect(conv._id)}
              className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                selectedUser === conv._id ? 'bg-gray-100' : ''
              }`}
            >
              <div className="flex items-center">
                <img
                  src={`https://ui-avatars.com/api/?name=${conv.user.name}&background=random`}
                  alt=""
                  className="w-10 h-10 rounded-full mr-3"
                />
                <div>
                  <h3 className="font-medium">{conv.user.name}</h3>
                  <p className="text-sm text-gray-500 truncate">
                    {conv.lastMessage.content}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {selectedUser ? (
          <>
            <div className="p-4 border-b bg-white">
              <h2 className="text-xl font-bold">
                {conversations.find(c => c._id === selectedUser)?.user.name}
              </h2>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message._id}
                  className={`flex ${
                    message.sender._id === user._id ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      message.sender._id === user._id
                        ? 'bg-blue-500 text-white'
                        : 'bg-white'
                    }`}
                  >
                    <p>{message.content}</p>
                    <span className="text-xs opacity-75">
                      {new Date(message.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <form onSubmit={handleSubmit} className="p-4 bg-white border-t">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Send
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select a conversation to start messaging
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
