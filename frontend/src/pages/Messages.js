import React, { useState, useEffect, useRef } from 'react';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';

const Messages = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [allUsers, setAllUsers] = useState([]);
  const [showNewMessage, setShowNewMessage] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [unreadUsers, setUnreadUsers] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchConversations();
    fetchAllUsers();
    fetchUnreadUsers();
    const interval = setInterval(fetchUnreadUsers, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const res = await axios.get('/messages/conversations');
      setConversations(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const res = await axios.get('/mentors/all-users');
      setAllUsers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUnreadUsers = async () => {
    try {
      const res = await axios.get('/messages/unread-users');
      setUnreadUsers(Array.isArray(res.data) ? res.data.map(u => u.sender_id) : []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMessages = async (otherUserId) => {
    try {
      const res = await axios.get(`/messages/${otherUserId}`);
      setMessages(Array.isArray(res.data) ? res.data : []);
      setUnreadUsers(prev => prev.filter(id => id !== otherUserId));
    } catch (err) {
      console.error(err);
    }
  };

const selectUser = (u) => {
    setSelectedUser(u);
    fetchMessages(u.id);
    setShowNewMessage(false);
    setNewMessage('');
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    try {
      await axios.post('/messages', {
        receiverId: selectedUser.id,
        content: newMessage,
      });
      setNewMessage('');
      fetchMessages(selectedUser.id);
      fetchConversations();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredUsers = allUsers.filter(u =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) && u.id !== user.id
  );

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Messages</h2>
        <button style={styles.newMsgBtn} onClick={() => setShowNewMessage(!showNewMessage)}>
          {showNewMessage ? 'Cancel' : '+ New Message'}
        </button>
      </div>

      {showNewMessage && (
        <div style={styles.newMessageBox}>
          <input
            style={styles.searchInput}
            placeholder="Search users by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div style={styles.userList}>
            {filteredUsers.map(u => (
              <div key={u.id} style={styles.userItem} onClick={() => selectUser(u)}>
                <div style={styles.userAvatar}>{u.name.charAt(0)}</div>
                <div>
                  <p style={styles.userName}>{u.name}</p>
                  <p style={styles.userRole}>{u.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={styles.layout}>
        <div style={styles.sidebar}>
          <h4 style={styles.sidebarTitle}>Conversations</h4>
          {conversations.length === 0 ? (
            <p style={styles.empty}>No conversations yet. Start one above!</p>
          ) : (
            conversations.map((u) => (
              <div
                key={u.id}
                style={{
                  ...styles.convItem,
                  backgroundColor: selectedUser?.id === u.id ? '#2c3e50' : 'white',
                  color: selectedUser?.id === u.id ? 'white' : '#2c3e50',
                }}
                onClick={() => selectUser(u)}
              >
                <div style={styles.convAvatarWrapper}>
                  <div style={styles.convAvatar}>{u.name.charAt(0)}</div>
                  {unreadUsers.includes(u.id) && <span style={styles.unreadDot}></span>}
                </div>
                <div>
                  <p style={styles.convName}>{u.name}</p>
                  <p style={styles.convRole}>{u.role}</p>
                </div>
              </div>
            ))
          )}
        </div>

        <div style={styles.chatArea}>
          {selectedUser ? (
            <>
              <div style={styles.chatHeader}>
                <h4>💬 {selectedUser.name} — <span style={styles.chatRole}>{selectedUser.role}</span></h4>
              </div>
              <div style={styles.messages}>
                {messages.length === 0 && (
                  <p style={styles.noMessages}>No messages yet. Say hello! 👋</p>
                )}
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    style={{
                      ...styles.message,
                      alignSelf: msg.sender_id === user.id ? 'flex-end' : 'flex-start',
                      backgroundColor: msg.sender_id === user.id ? '#2c3e50' : '#ecf0f1',
                      color: msg.sender_id === user.id ? 'white' : '#2c3e50',
                    }}
                  >
                    {msg.content}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              <div style={styles.inputArea}>
                <input
                  style={styles.input}
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                />
                <button style={styles.sendButton} onClick={sendMessage}>Send</button>
              </div>
            </>
          ) : (
            <div style={styles.noChat}>
              <p>👈 Select a conversation or start a new one!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: { padding: '40px', maxWidth: '1000px', margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  title: { color: '#2c3e50', fontSize: '26px' },
  newMsgBtn: { backgroundColor: '#2c3e50', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer' },
  newMessageBox: { backgroundColor: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.08)', marginBottom: '20px' },
  searchInput: { width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '15px', boxSizing: 'border-box', marginBottom: '15px' },
  userList: { display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '200px', overflowY: 'auto' },
  userItem: { display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', borderRadius: '8px', cursor: 'pointer', backgroundColor: '#f8f9fa' },
  userAvatar: { width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#2c3e50', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' },
  userName: { margin: 0, fontWeight: 'bold', fontSize: '14px', color: '#2c3e50' },
  userRole: { margin: 0, fontSize: '12px', color: '#7f8c8d' },
  layout: { display: 'grid', gridTemplateColumns: '280px 1fr', gap: '20px' },
  sidebar: { backgroundColor: 'white', borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.08)', padding: '20px', overflowY: 'auto', maxHeight: '550px' },
  sidebarTitle: { color: '#2c3e50', marginBottom: '15px' },
  empty: { color: '#7f8c8d', fontSize: '14px' },
  convItem: { display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', borderRadius: '8px', cursor: 'pointer', marginBottom: '8px' },
  convAvatarWrapper: { position: 'relative' },
  convAvatar: { width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#1abc9c', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' },
  unreadDot: { position: 'absolute', top: '0px', right: '0px', width: '12px', height: '12px', backgroundColor: '#e74c3c', borderRadius: '50%', border: '2px solid white' },
  convName: { margin: 0, fontWeight: 'bold', fontSize: '14px' },
  convRole: { margin: 0, fontSize: '12px', opacity: 0.7 },
  chatArea: { backgroundColor: 'white', borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column' },
  chatHeader: { padding: '20px', borderBottom: '1px solid #ecf0f1' },
  chatRole: { color: '#7f8c8d', fontSize: '14px', fontWeight: 'normal' },
  messages: { height: '350px', overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' },
  noMessages: { color: '#7f8c8d', textAlign: 'center', marginTop: '20px' },
  message: { padding: '10px 15px', borderRadius: '18px', maxWidth: '70%', fontSize: '14px', lineHeight: '1.5' },
  inputArea: { padding: '20px', borderTop: '1px solid #ecf0f1', display: 'flex', gap: '10px' },
  input: { flex: 1, padding: '12px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '15px' },
  sendButton: { backgroundColor: '#2c3e50', color: 'white', border: 'none', padding: '12px 25px', borderRadius: '6px', cursor: 'pointer' },
  noChat: { display: 'flex', alignItems: 'center', justifyContent: 'center', height: '400px', color: '#7f8c8d' },
};

export default Messages;