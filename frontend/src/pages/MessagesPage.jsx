import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from '../config/axios';
import { toast } from 'react-hot-toast';
import {
  Card,
  TextField,
  Button,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Paper,
  Box,
  Divider,
} from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';

export default function MessagesPage() {
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const { user } = useAuth();
  const messagesEndRef = useRef(null);
  const ws = useRef(null);

  // Connect to WebSocket
  useEffect(() => {
    ws.current = new WebSocket(`ws://localhost:9000/ws?userId=${user?._id}`);

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'message') {
        setMessages(prev => [...prev, data.message]);
        scrollToBottom();
      }
    };

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [user?._id]);

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('/api/users');
        setUsers(response.data.filter(u => u._id !== user?._id));
      } catch (error) {
        toast.error('Failed to fetch users');
      }
    };
    fetchUsers();
  }, [user]);

  // Fetch conversations
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await axios.get('/api/messages/conversations');
        setConversations(response.data);
      } catch (error) {
        toast.error('Failed to fetch conversations');
      }
    };
    fetchConversations();
  }, []);

  // Fetch messages when selecting a user
  useEffect(() => {
    const fetchMessages = async () => {
      if (selectedUser) {
        try {
          const response = await axios.get(`/api/messages/${selectedUser._id}`);
          setMessages(response.data);
          scrollToBottom();
        } catch (error) {
          toast.error('Failed to fetch messages');
        }
      }
    };
    fetchMessages();
  }, [selectedUser]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedUser) return;

    try {
      const response = await axios.post('/api/messages', {
        recipientId: selectedUser._id,
        content: message
      });

      setMessages(prev => [...prev, response.data]);
      setMessage('');
      scrollToBottom();

      // Send through WebSocket
      if (ws.current) {
        ws.current.send(JSON.stringify({
          type: 'message',
          message: response.data
        }));
      }
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="h-[calc(100vh-6rem)]">
      <div className="flex h-full gap-4">
        {/* Users/Conversations List */}
        <Card className="w-1/4 overflow-hidden">
          <Typography variant="h6" className="p-4 bg-gray-100">
            Conversations
          </Typography>
          <Divider />
          <List className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 10rem)' }}>
            {users.map((u) => (
              <ListItem
                key={u._id}
                button
                selected={selectedUser?._id === u._id}
                onClick={() => setSelectedUser(u)}
              >
                <ListItemAvatar>
                  <Avatar>{u.name[0]}</Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={u.name}
                  secondary={u.email}
                />
              </ListItem>
            ))}
          </List>
        </Card>

        {/* Messages */}
        <Card className="flex-1 flex flex-col">
          {selectedUser ? (
            <>
              {/* Header */}
              <Box className="p-4 bg-gray-100">
                <Typography variant="h6">{selectedUser.name}</Typography>
                <Typography variant="body2" color="textSecondary">
                  {selectedUser.email}
                </Typography>
              </Box>
              <Divider />

              {/* Messages */}
              <Box
                className="flex-1 overflow-y-auto p-4"
                style={{ maxHeight: 'calc(100vh - 16rem)' }}
              >
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${msg.sender === user?._id ? 'justify-end' : 'justify-start'} mb-4`}
                  >
                    <Paper
                      className={`p-2 px-4 max-w-[70%] ${
                        msg.sender === user?._id ? 'bg-blue-100' : 'bg-gray-100'
                      }`}
                    >
                      <Typography variant="body1">{msg.content}</Typography>
                      <Typography variant="caption" color="textSecondary">
                        {formatTime(msg.createdAt)}
                      </Typography>
                    </Paper>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </Box>

              {/* Message Input */}
              <Box className="p-4 bg-gray-50">
                <div className="flex gap-2">
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Type a message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <Button
                    variant="contained"
                    color="primary"
                    endIcon={<SendIcon />}
                    onClick={handleSendMessage}
                    disabled={!message.trim()}
                  >
                    Send
                  </Button>
                </div>
              </Box>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <Typography variant="body1" color="textSecondary">
                Select a conversation to start messaging
              </Typography>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
