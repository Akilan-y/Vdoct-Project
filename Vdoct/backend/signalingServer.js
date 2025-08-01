import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

// Store active meetings and participants
const activeMeetings = new Map(); // appointmentId -> { doctor: socket, patient: socket }
const socketToUser = new Map(); // socket -> { userId, userType, appointmentId }

export const createSignalingServer = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        const allowedOrigins = [
          process.env.FRONTEND_URL,
          process.env.ADMIN_URL,
          'http://localhost:5173',
          'http://localhost:5174',
          'http://localhost:3000',
          'http://localhost:4000'
        ].filter(Boolean); // Remove undefined values
        
        if (allowedOrigins.indexOf(origin) !== -1 || origin.includes('vercel.app') || origin.includes('onrender.com')) {
          callback(null, true);
        } else {
          console.log('Socket.IO CORS blocked origin:', origin);
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
      methods: ['GET', 'POST']
    },
    transports: ['websocket', 'polling'],
    allowEIO3: true
  });

  // Authentication middleware
  io.use((socket, next) => {
    console.log('🔐 Socket auth attempt - headers:', socket.handshake.headers);
    console.log('🔐 Socket auth attempt - auth:', socket.handshake.auth);
    
    // Try multiple token sources
    const token = socket.handshake.auth.token || 
                  socket.handshake.auth.dtoken || 
                  socket.handshake.auth.userToken ||
                  socket.handshake.headers.authorization?.replace('Bearer ', '') ||
                  socket.handshake.headers.token ||
                  socket.handshake.auth.token; // Try auth.token again for different format
    
    console.log('🔐 Token found:', token ? 'yes' : 'no');
    console.log('🔐 Token length:', token ? token.length : 0);
    console.log('🔐 Token preview:', token ? token.substring(0, 20) + '...' : 'null');
    console.log('🔐 Auth object keys:', Object.keys(socket.handshake.auth));
    console.log('🔐 Headers keys:', Object.keys(socket.handshake.headers));
    
    if (!token) {
      console.log('❌ No token provided');
      return next(new Error('Authentication token required'));
    }

    try {
      // First try to decode as JWT
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Handle different token types
      if (decoded.id) {
        // Doctor token - has id field
        socket.userId = decoded.id;
        socket.userType = 'doctor';
        console.log('✅ Doctor authentication successful for user:', socket.userId);
      } else if (decoded.userId || decoded.id) {
        // User token - has userId or id field
        socket.userId = decoded.userId || decoded.id;
        socket.userType = 'patient';
        console.log('✅ Patient authentication successful for user:', socket.userId);
      } else {
        // Admin token - is a simple string
        const expectedToken = process.env.ADMIN_EMAIL + process.env.ADMIN_PASSWORD;
        if (decoded === expectedToken) {
          socket.userId = 'admin';
          socket.userType = 'admin';
          console.log('✅ Admin authentication successful');
        } else {
          throw new Error('Invalid admin token');
        }
      }
      
      next();
    } catch (error) {
      console.log('❌ JWT authentication failed:', error.message);
      
      // Fallback: try direct token comparison for admin
      try {
        const expectedToken = process.env.ADMIN_EMAIL + process.env.ADMIN_PASSWORD;
        if (token === expectedToken) {
          socket.userId = 'admin';
          socket.userType = 'admin';
          console.log('✅ Admin authentication successful (fallback)');
          next();
        } else {
          throw new Error('Invalid token format');
        }
      } catch (fallbackError) {
        console.log('❌ Fallback authentication failed:', fallbackError.message);
        return next(new Error('Invalid token'));
      }
    }
  });

  io.on('connection', (socket) => {
    console.log('🔗 User connected:', socket.userId, 'Type:', socket.userType);

    // Join meeting room
    socket.on('join-meeting', async (data) => {
      try {
        const { appointmentId, userType } = data;
        console.log(`👥 User ${socket.userId} (${userType}) joining meeting ${appointmentId}`);

        // Store user info
        socketToUser.set(socket, {
          userId: socket.userId,
          userType,
          appointmentId
        });

        // Join the meeting room
        socket.join(appointmentId);

        // Get or create meeting data
        if (!activeMeetings.has(appointmentId)) {
          activeMeetings.set(appointmentId, {});
        }
        const meeting = activeMeetings.get(appointmentId);

        // Add user to meeting
        if (userType === 'doctor') {
          meeting.doctor = socket;
        } else if (userType === 'patient') {
          meeting.patient = socket;
        }

        // Notify other participants
        socket.to(appointmentId).emit('user-joined', {
          userId: socket.userId,
          userType
        });

        // Send current participants to the new user
        const participants = [];
        if (meeting.doctor) participants.push({ userId: meeting.doctor.userId, userType: 'doctor' });
        if (meeting.patient) participants.push({ userId: meeting.patient.userId, userType: 'patient' });
        
        socket.emit('meeting-participants', participants);

        console.log(`📊 Meeting ${appointmentId} participants:`, participants);

        // Send connection status
        socket.emit('connection-status', {
          status: 'connected',
          participants: participants.length
        });

      } catch (error) {
        console.error('❌ Error joining meeting:', error);
        socket.emit('error', { message: 'Failed to join meeting' });
      }
    });

    // Handle WebRTC offer
    socket.on('offer', (data) => {
      const { appointmentId, offer } = data;
      console.log(`📤 Offer from ${socket.userId} in meeting ${appointmentId}`);
      console.log('📤 Sending offer to other participants in room:', appointmentId);
      
      socket.to(appointmentId).emit('offer', {
        offer,
        from: socket.userId
      });
    });

    // Handle WebRTC answer
    socket.on('answer', (data) => {
      const { appointmentId, answer } = data;
      console.log(`📤 Answer from ${socket.userId} in meeting ${appointmentId}`);
      console.log('📤 Sending answer to other participants in room:', appointmentId);
      
      socket.to(appointmentId).emit('answer', {
        answer,
        from: socket.userId
      });
    });

    // Handle ICE candidates
    socket.on('ice-candidate', (data) => {
      const { appointmentId, candidate } = data;
      console.log(`🧊 ICE candidate from ${socket.userId} in meeting ${appointmentId}`);
      console.log('🧊 Sending ICE candidate to other participants in room:', appointmentId);
      
      socket.to(appointmentId).emit('ice-candidate', {
        candidate,
        from: socket.userId
      });
    });

    // Handle chat messages
    socket.on('chat-message', (data) => {
      const { appointmentId, message, sender } = data;
      console.log(`💬 Chat message from ${socket.userId} in meeting ${appointmentId}:`, message);
      
      // Broadcast to all participants in the meeting room
      socket.to(appointmentId).emit('chat-message', {
        message,
        sender: socket.userId,
        senderType: socket.userType,
        timestamp: new Date().toISOString()
      });
      
      // Also send back to sender for confirmation
      socket.emit('chat-message-sent', {
        message,
        timestamp: new Date().toISOString()
      });
    });

    // Handle test messages
    socket.on('test-message', (data) => {
      console.log(`🧪 Test message from ${socket.userId}:`, data.message);
      socket.emit('test-message-received', { 
        message: data.message,
        from: socket.userId,
        timestamp: new Date().toISOString()
      });
    });

    // Handle call end request
    socket.on('end-call', (data) => {
      const { appointmentId } = data;
      console.log(`📞 Call end requested by ${socket.userId} in meeting ${appointmentId}`);
      
      // Notify all participants in the meeting room to end the call
      io.to(appointmentId).emit('call-ended', {
        endedBy: socket.userId,
        endedByType: socket.userType,
        timestamp: new Date().toISOString()
      });
      
      // Clean up meeting data
      const meeting = activeMeetings.get(appointmentId);
      if (meeting) {
        // Remove all participants from the meeting
        if (meeting.doctor) {
          meeting.doctor.disconnect();
        }
        if (meeting.patient) {
          meeting.patient.disconnect();
        }
        activeMeetings.delete(appointmentId);
      }
      
      console.log(`📞 Call ended for meeting ${appointmentId}`);
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log('🔌 User disconnected:', socket.userId, 'Type:', socket.userType);
      
      const userInfo = socketToUser.get(socket);
      if (userInfo) {
        const { appointmentId, userType } = userInfo;
        
        // Remove from meeting
        const meeting = activeMeetings.get(appointmentId);
        if (meeting) {
          if (userType === 'doctor') {
            delete meeting.doctor;
          } else if (userType === 'patient') {
            delete meeting.patient;
          }
          
          // If no participants left, remove meeting
          if (!meeting.doctor && !meeting.patient) {
            activeMeetings.delete(appointmentId);
          } else {
            // Notify remaining participants
            socket.to(appointmentId).emit('user-left', {
              userId: socket.userId,
              userType
            });
          }
        }
        
        socketToUser.delete(socket);
      }
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error('❌ Socket error:', error);
    });
  });

  return io;
}; 