import React, { useState, useEffect, useContext } from 'react';
import { io } from 'socket.io-client';
import { AdminContext } from '../context/AdminContext';

const WebSocketTest = () => {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [testMessage, setTestMessage] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const { backendUrl, token } = useContext(AdminContext);

  useEffect(() => {
    const connectSocket = () => {
      console.log('=== WEBSOCKET TEST: CONNECTING ===');
      console.log('Backend URL:', backendUrl);
      console.log('Token exists:', !!token);
      console.log('Token length:', token ? token.length : 0);
      console.log('Token preview:', token ? token.substring(0, 20) + '...' : 'null');
      
      const socketUrl = backendUrl.replace('http', 'ws');
      console.log('Socket URL:', socketUrl);
      
      const newSocket = io(socketUrl, {
        auth: { 
          dtoken: token,  // Using dtoken for admin panel
          token: token    // Also try with regular token
        },
        transports: ['websocket', 'polling'],
        timeout: 10000,
        forceNew: true
      });

      newSocket.on('connect', () => {
        console.log('✅ WebSocket Test: Connected successfully!');
        console.log('Socket ID:', newSocket.id);
        setConnectionStatus('connected');
        setMessages(prev => [...prev, `✅ Connected! Socket ID: ${newSocket.id}`]);
      });

      newSocket.on('disconnect', (reason) => {
        console.log('❌ WebSocket Test: Disconnected:', reason);
        setConnectionStatus('disconnected');
        setMessages(prev => [...prev, `❌ Disconnected: ${reason}`]);
      });

      newSocket.on('connect_error', (error) => {
        console.error('❌ WebSocket Test: Connection error:', error);
        setConnectionStatus('error');
        setMessages(prev => [...prev, `❌ Connection Error: ${error.message}`]);
        console.error('Error details:', {
          message: error.message,
          description: error.description,
          context: error.context,
          type: error.type
        });
      });

      newSocket.on('error', (error) => {
        console.error('❌ WebSocket Test: Socket error:', error);
        setMessages(prev => [...prev, `❌ Socket Error: ${error.message}`]);
      });

      newSocket.on('test-message-received', (data) => {
        console.log('✅ WebSocket Test: Message received:', data);
        setMessages(prev => [...prev, `✅ Received: ${data.message} (from ${data.from})`]);
      });

      setSocket(newSocket);
    };

    if (token && backendUrl) {
      connectSocket();
    } else {
      console.log('❌ WebSocket Test: Missing token or backend URL');
      setMessages(prev => [...prev, '❌ Missing token or backend URL']);
    }

    return () => {
      if (socket) {
        console.log('WebSocket Test: Cleaning up connection');
        socket.disconnect();
      }
    };
  }, [token, backendUrl]);

  const sendTestMessage = () => {
    if (socket && testMessage.trim()) {
      console.log('WebSocket Test: Sending message:', testMessage);
      socket.emit('test-message', {
        message: testMessage,
        timestamp: new Date().toISOString()
      });
      setMessages(prev => [...prev, `📤 Sent: ${testMessage}`]);
      setTestMessage('');
    }
  };

  const clearMessages = () => {
    setMessages([]);
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">WebSocket Connection Test</h3>
      
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm font-medium">Status:</span>
          <div className={`w-3 h-3 rounded-full ${
            connectionStatus === 'connected' ? 'bg-green-500' :
            connectionStatus === 'error' ? 'bg-red-500' :
            'bg-yellow-500'
          }`}></div>
          <span className="text-sm capitalize">{connectionStatus}</span>
        </div>
        
        <div className="text-xs text-gray-600 mb-2">
          <div>Backend URL: {backendUrl}</div>
          <div>Token: {token ? `${token.substring(0, 20)}...` : 'None'}</div>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={testMessage}
            onChange={(e) => setTestMessage(e.target.value)}
            placeholder="Enter test message..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyPress={(e) => e.key === 'Enter' && sendTestMessage()}
          />
          <button
            onClick={sendTestMessage}
            disabled={!socket || connectionStatus !== 'connected'}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Send
          </button>
          <button
            onClick={clearMessages}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="bg-gray-100 p-3 rounded-md max-h-60 overflow-y-auto">
        <div className="text-sm font-medium mb-2">Messages:</div>
        {messages.length === 0 ? (
          <div className="text-gray-500 text-sm">No messages yet...</div>
        ) : (
          messages.map((msg, index) => (
            <div key={index} className="text-sm mb-1 font-mono">
              {msg}
            </div>
          ))
        )}
      </div>

      <div className="mt-4 text-xs text-gray-600">
        <div>💡 This test helps verify WebSocket connectivity before joining meetings.</div>
        <div>🔧 If connection fails, check: Backend server, Token validity, CORS settings</div>
      </div>
    </div>
  );
};

export default WebSocketTest; 