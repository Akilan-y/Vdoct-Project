import React, { useState, useEffect, useRef, useContext } from 'react';
import { toast } from 'react-toastify';
import { io } from 'socket.io-client';
import { AdminContext } from '../context/AdminContext';
import { DoctorContext } from '../context/DoctorContext';

const MeetingInterface = ({ appointment, onClose, isDoctor = false }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [meetingDuration, setMeetingDuration] = useState(0);
  const [participantCount, setParticipantCount] = useState(1);
  const [isRecording, setIsRecording] = useState(false);
  const [socket, setSocket] = useState(null);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [cameraAccessError, setCameraAccessError] = useState(false);
  const [cameraRetryCount, setCameraRetryCount] = useState(0);
  const [isRetryingCamera, setIsRetryingCamera] = useState(false);
  const [chatConnected, setChatConnected] = useState(false);
  const [permissionError, setPermissionError] = useState(false);
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  const [showEndCallConfirm, setShowEndCallConfirm] = useState(false);
  
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const chatContainerRef = useRef(null);
  const peerConnection = useRef(null);
  const mediaRecorder = useRef(null);
  const durationInterval = useRef(null);
  const { backendUrl, adminToken } = useContext(AdminContext);
  const { doctorToken } = useContext(DoctorContext);
  
  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [chatMessages]);

  // Choose the correct token based on user type
  const token = isDoctor ? doctorToken : adminToken;

  useEffect(() => {
    initializeMeeting();
    startDurationTimer();
    
    return () => {
      cleanupMeeting();
    };
  }, []);

  // Effect to ensure video plays when stream is set
  useEffect(() => {
    if (localStream && localVideoRef.current) {
      console.log('Stream available, ensuring video plays...');
      localVideoRef.current.srcObject = localStream;
      
      // Add event listeners for debugging
      const video = localVideoRef.current;
      video.onloadedmetadata = () => {
        console.log('Video metadata loaded:', {
          videoWidth: video.videoWidth,
          videoHeight: video.videoHeight,
          readyState: video.readyState
        });
      };
      
      video.oncanplay = () => {
        console.log('Video can play');
      };
      
      video.onplay = () => {
        console.log('Video started playing');
      };
      
      video.onpause = () => {
        console.log('Video paused');
      };
      
      video.onerror = (e) => {
        console.error('Video error:', e);
      };
      
      // Force play after a short delay
      setTimeout(() => {
        if (video && video.paused) {
          console.log('Forcing video to play from useEffect...');
          video.play().catch(e => {
            console.error('useEffect video play error:', e);
          });
        }
      }, 500);
    }
  }, [localStream]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const startDurationTimer = () => {
    durationInterval.current = setInterval(() => {
      setMeetingDuration(prev => prev + 1);
    }, 1000);
  };

  const initializeSocket = () => {
    try {
      console.log('=== INITIALIZING WEBSOCKET CONNECTION ===');
      console.log('Backend URL:', backendUrl);
      console.log('Is Doctor:', isDoctor);
      console.log('Doctor Token exists:', !!doctorToken);
      console.log('Admin Token exists:', !!adminToken);
      console.log('Selected Token exists:', !!token);
      console.log('Token length:', token ? token.length : 0);
      console.log('Token preview:', token ? token.substring(0, 20) + '...' : 'null');
      
      if (!token) {
        throw new Error('No authentication token available');
      }
      
      const socketUrl = backendUrl.replace('http', 'ws');
      console.log('Socket URL:', socketUrl);
      
      const newSocket = io(socketUrl, {
        auth: {
          dtoken: token  // Use dtoken for admin/doctor panel
        },
        transports: ['websocket', 'polling'],
        timeout: 10000,
        forceNew: true
      });

      console.log('Socket instance created, setting up event listeners...');

      newSocket.on('connect', () => {
        console.log('✅ WebSocket connected successfully!');
        console.log('Socket ID:', newSocket.id);
        setIsSocketConnected(true);
        
        // Join the meeting room
        console.log('Joining meeting room:', appointment._id);
        newSocket.emit('join-meeting', {
          appointmentId: appointment._id,
          userType: isDoctor ? 'doctor' : 'patient'
        });
      });

      newSocket.on('disconnect', (reason) => {
        console.log('❌ WebSocket disconnected:', reason);
        setIsSocketConnected(false);
      });

      newSocket.on('connect_error', (error) => {
        console.error('❌ WebSocket connection error:', error);
        console.error('Error details:', {
          message: error.message,
          description: error.description,
          context: error.context,
          type: error.type
        });
        toast.error(`Failed to connect to meeting server: ${error.message}`);
      });

      newSocket.on('error', (error) => {
        console.error('❌ WebSocket error:', error);
        toast.error('WebSocket error occurred');
      });

      // Chat message handlers
      newSocket.on('chat-message', (data) => {
        console.log('✅ Received chat message:', data);
        setChatMessages(prev => [...prev, {
          text: data.message,
          sender: 'other',
          time: new Date(data.timestamp)
        }]);
      });

      newSocket.on('chat-message-sent', (data) => {
        console.log('✅ Chat message sent successfully:', data);
        // Message was already added to local state in sendMessage function
      });

      // Handle call end notification
      newSocket.on('call-ended', (data) => {
        console.log('✅ Call ended by:', data.endedBy, 'Type:', data.endedByType);
        toast.info(`Call ended by ${data.endedByType === 'doctor' ? 'Doctor' : 'Patient'}`);
        
        // Clean up and close the meeting interface
        cleanupMeeting();
        onClose();
      });

      newSocket.on('meeting-participants', (participants) => {
        console.log('✅ Meeting participants received:', participants);
        setParticipantCount(participants.length + 1); // +1 for self
        
        // Enable chat when participants are available
        if (participants.length > 0) {
          console.log('Other participants found, enabling chat...');
          setChatConnected(true);
          // Add a system message
          setChatMessages(prev => [...prev, {
            text: 'Chat is now available! You can send messages.',
            sender: 'system',
            time: new Date()
          }]);
        }
        
        // If there are other participants, initialize peer connection
        if (participants.length > 0) {
          console.log('Other participants found, initializing peer connection...');
          initializePeerConnection();
        } else {
          console.log('No other participants yet, waiting...');
        }
      });

      newSocket.on('user-joined', (user) => {
        console.log('✅ User joined:', user);
        setParticipantCount(prev => prev + 1);
        
        // Initialize peer connection when someone joins
        if (!peerConnection.current) {
          console.log('Initializing peer connection for new user...');
          initializePeerConnection();
        } else {
          console.log('Peer connection already exists, creating offer...');
          // If we already have a peer connection and someone joins, create an offer
          setTimeout(() => {
            createAndSendOffer();
          }, 1000);
        }
      });

      newSocket.on('user-left', (user) => {
        console.log('User left:', user);
        setParticipantCount(prev => Math.max(1, prev - 1));
        setRemoteStream(null);
      });

      newSocket.on('offer', async (data) => {
        console.log('✅ Received offer from:', data.from);
        if (peerConnection.current) {
          try {
            await peerConnection.current.setRemoteDescription(new RTCSessionDescription(data.offer));
            const answer = await peerConnection.current.createAnswer();
            await peerConnection.current.setLocalDescription(answer);
            
            newSocket.emit('answer', {
              appointmentId: appointment._id,
              answer: answer
            });
          } catch (error) {
            console.error('Error handling offer:', error);
          }
        }
      });

      newSocket.on('answer', async (data) => {
        console.log('✅ Received answer from:', data.from);
        if (peerConnection.current) {
          try {
            await peerConnection.current.setRemoteDescription(new RTCSessionDescription(data.answer));
          } catch (error) {
            console.error('Error handling answer:', error);
          }
        }
      });

      newSocket.on('ice-candidate', async (data) => {
        console.log('✅ Received ICE candidate from:', data.from);
        if (peerConnection.current) {
          try {
            await peerConnection.current.addIceCandidate(new RTCIceCandidate(data.candidate));
          } catch (error) {
            console.error('Error adding ICE candidate:', error);
          }
        }
      });

      setSocket(newSocket);
      console.log('=== WEBSOCKET SETUP COMPLETE ===');
      
    } catch (error) {
      console.error('❌ Error initializing socket:', error);
      toast.error('Failed to establish connection: ' + error.message);
    }
  };

  // Camera access manager to handle conflicts
  const requestCameraAccess = async (retryCount = 0) => {
    const maxRetries = 3;
    const retryDelay = 2000; // 2 seconds

    try {
      console.log(`Attempting to access camera (attempt ${retryCount + 1}/${maxRetries + 1})`);
      
      // First, try to enumerate devices to check availability
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      
      console.log('Available video devices:', videoDevices.length);
      
      if (videoDevices.length === 0) {
        throw new Error('No camera devices found');
      }

      // Try to get user media with different constraints based on retry count
      let constraints;
      
      if (retryCount === 0) {
        // First attempt: Basic quality
        constraints = {
          video: {
            width: { ideal: 640, min: 320 },
            height: { ideal: 480, min: 240 },
            facingMode: 'user'
          },
          audio: {
            echoCancellation: true,
            noiseSuppression: true
          }
        };
      } else if (retryCount === 1) {
        // Second attempt: Lower quality
        constraints = {
          video: {
            width: { ideal: 320, min: 160 },
            height: { ideal: 240, min: 120 },
            facingMode: 'user'
          },
          audio: {
            echoCancellation: true
          }
        };
      } else {
        // Third attempt: Minimal quality
        constraints = {
          video: {
            width: { ideal: 160, min: 80 },
            height: { ideal: 120, min: 60 },
            facingMode: 'user'
          },
          audio: true
        };
      }

      console.log('Using constraints:', constraints);
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log(`Camera access successful on attempt ${retryCount + 1}`);
      console.log('Stream tracks:', stream.getTracks().map(t => ({ kind: t.kind, enabled: t.enabled })));
      return stream;
      
    } catch (error) {
      console.error(`Camera access failed on attempt ${retryCount + 1}:`, error);
      
      if (error.name === 'NotAllowedError') {
        throw new Error('Camera and microphone access denied. Please allow permissions and refresh.');
      } else if (error.name === 'NotFoundError') {
        throw new Error('No camera or microphone found. Please check your device.');
      } else if (error.name === 'NotReadableError' || error.name === 'AbortError') {
        // Camera is in use by another application
        if (retryCount < maxRetries) {
          console.log(`Camera in use, retrying in ${retryDelay}ms...`);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          return requestCameraAccess(retryCount + 1);
        } else {
          throw new Error('Camera is currently in use by another application. Please close other applications using the camera and try again.');
        }
      } else {
        throw error;
      }
    }
  };

  const initializeMeeting = async () => {
    try {
      console.log('Initializing meeting...');
      setIsLoading(true);
      setPermissionError(false);
      setCameraAccessError(false);
      setCameraRetryCount(0);
      setIsRetryingCamera(false);
      
      // Check if we're in a secure context (required for getUserMedia)
      if (!window.isSecureContext) {
        console.warn('Not in secure context - camera access may be limited');
      }
      
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera and microphone access not supported in this browser');
      }
      
      // Use the camera access manager
      const stream = await requestCameraAccess();
      
      console.log('Camera stream obtained:', stream);
      console.log('Video tracks:', stream.getVideoTracks());
      console.log('Audio tracks:', stream.getAudioTracks());
      
      // Verify tracks are actually working
      const videoTrack = stream.getVideoTracks()[0];
      const audioTrack = stream.getAudioTracks()[0];
      
      if (videoTrack) {
        console.log('Video track settings:', videoTrack.getSettings());
        console.log('Video track enabled:', videoTrack.enabled);
      }
      
      if (audioTrack) {
        console.log('Audio track settings:', audioTrack.getSettings());
        console.log('Audio track enabled:', audioTrack.enabled);
      }

      setLocalStream(stream);
      setIsConnected(true);

      // Set the video source and ensure it plays
      if (localVideoRef.current) {
        console.log('Setting video source...');
        localVideoRef.current.srcObject = stream;
        
        // Multiple play attempts on various events
        const playVideo = () => {
          if (localVideoRef.current && localVideoRef.current.paused) {
            console.log('Attempting to play video...');
            localVideoRef.current.play().catch(e => {
              console.error('Video play error:', e);
            });
          }
        };

        localVideoRef.current.onloadedmetadata = playVideo;
        localVideoRef.current.oncanplay = playVideo;
        localVideoRef.current.onLoadedData = playVideo;
        localVideoRef.current.onStalled = playVideo;

        // Backup play attempts with timeouts
        setTimeout(playVideo, 1000);
        setTimeout(playVideo, 2000);

        // Log video state for debugging
        setTimeout(() => {
          if (localVideoRef.current) {
            console.log('Video state:', {
              videoWidth: localVideoRef.current.videoWidth,
              videoHeight: localVideoRef.current.videoHeight,
              readyState: localVideoRef.current.readyState,
              paused: localVideoRef.current.paused
            });
          }
        }, 3000);
      } else {
        console.warn('Video ref not available during initialization');
      }

      // Initialize WebSocket connection
      initializeSocket();
      
      setIsLoading(false);
      toast.success('Meeting started successfully!');
      
    } catch (error) {
      console.error('Error initializing meeting:', error);
      
      if (error.message.includes('Camera is currently in use')) {
        setCameraAccessError(true);
        toast.error('Camera is in use by another application. Please close other camera applications and try again.');
      } else if (error.message.includes('Camera and microphone access denied')) {
        setPermissionError(true);
        toast.error('Camera and microphone access denied. Please allow permissions and refresh.');
      } else if (error.message.includes('No camera or microphone found')) {
        toast.error('No camera or microphone found. Please check your device.');
      } else {
        toast.error('Failed to start meeting. Please check your camera and microphone.');
      }
      setIsLoading(false);
    }
  };

  // Retry camera access function
  const retryCameraAccess = async () => {
    setIsRetryingCamera(true);
    setCameraAccessError(false);
    
    try {
      // Clean up existing stream if any
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        setLocalStream(null);
      }
      
      // Wait a bit before retrying
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Retry camera access
      const stream = await requestCameraAccess();
      
      setLocalStream(stream);
      setIsConnected(true);
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        localVideoRef.current.play().catch(e => console.error('Video play error:', e));
      }
      
      toast.success('Camera access restored!');
      
    } catch (error) {
      console.error('Camera retry failed:', error);
      setCameraAccessError(true);
      toast.error('Failed to access camera. Please check if other applications are using the camera.');
    } finally {
      setIsRetryingCamera(false);
    }
  };

  const initializePeerConnection = () => {
    try {
      const pc = new RTCPeerConnection({
        iceServers: [
          // Google's public STUN servers
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
          { urls: 'stun:stun2.l.google.com:19302' },
          { urls: 'stun:stun3.l.google.com:19302' },
          { urls: 'stun:stun4.l.google.com:19302' },
          // Additional STUN servers for better connectivity
          { urls: 'stun:stun.stunprotocol.org:3478' },
          { urls: 'stun:stun.voiparound.com:3478' },
          { urls: 'stun:stun.voipbuster.com:3478' },
          { urls: 'stun:stun.voipstunt.com:3478' },
          { urls: 'stun:stun.voxgratia.org:3478' },
          // TURN servers (if available)
          // Note: For production, you should use your own TURN servers
          // { urls: 'turn:your-turn-server.com:3478', username: 'username', credential: 'password' }
        ],
        iceCandidatePoolSize: 10,
        iceTransportPolicy: 'all',
        bundlePolicy: 'max-bundle',
        rtcpMuxPolicy: 'require'
      });
      
      peerConnection.current = pc;
      
      // Add local stream tracks to peer connection
      if (localStream) {
        localStream.getTracks().forEach(track => {
          pc.addTrack(track, localStream);
        });
      }
      
      // Chat is now handled via WebSocket, no need for data channels
      console.log('Peer connection initialized for video/audio only');
      
      // Handle incoming remote streams
      pc.ontrack = (event) => {
        console.log('Received remote stream:', event.streams[0]);
        setRemoteStream(event.streams[0]);
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
          remoteVideoRef.current.play().catch(e => console.log('Remote video play error:', e));
        }
        setParticipantCount(2);
      };
      
      // Handle connection state changes
      pc.onconnectionstatechange = () => {
        console.log('🔗 Connection state:', pc.connectionState);
        if (pc.connectionState === 'connected') {
          setIsConnected(true);
          toast.success('Connected to other participant!');
        } else if (pc.connectionState === 'disconnected') {
          setIsConnected(false);
          toast.warning('Connection lost. Trying to reconnect...');
        } else if (pc.connectionState === 'failed') {
          setIsConnected(false);
          toast.error('Connection failed. Please check your network and try again.');
        }
      };
      
      // Handle ICE connection state
      pc.oniceconnectionstatechange = () => {
        console.log('🧊 ICE connection state:', pc.iceConnectionState);
        if (pc.iceConnectionState === 'connected') {
          console.log('✅ ICE connection established');
        } else if (pc.iceConnectionState === 'failed') {
          console.log('❌ ICE connection failed');
          toast.error('Network connection failed. Please check your internet connection.');
        }
      };

      // Handle ICE gathering state
      pc.onicegatheringstatechange = () => {
        console.log('🧊 ICE gathering state:', pc.iceGatheringState);
      };

      // Handle ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate && socket) {
          console.log('Sending ICE candidate');
          socket.emit('ice-candidate', {
            appointmentId: appointment._id,
            candidate: event.candidate
          });
        }
      };

      // Create and send offer if we're the doctor and there are other participants
      // The offer will be created when a patient joins (handled in user-joined event)
      console.log('Peer connection initialized, waiting for participants...');
      
    } catch (error) {
      console.error('Error initializing peer connection:', error);
      toast.error('Failed to initialize connection');
    }
  };

  const createAndSendOffer = async () => {
    try {
      if (peerConnection.current && socket) {
        console.log('Creating offer...');
        const offer = await peerConnection.current.createOffer();
        await peerConnection.current.setLocalDescription(offer);
        
        socket.emit('offer', {
          appointmentId: appointment._id,
          offer: offer
        });
      }
    } catch (error) {
      console.error('Error creating offer:', error);
    }
  };

  const endCallForAll = () => {
    console.log('🔴 End call button clicked (Admin)');
    console.log('🔴 Socket available:', !!socket);
    console.log('🔴 Appointment ID:', appointment._id);
    console.log('🔴 Is Doctor:', isDoctor);
    
    if (socket && appointment._id) {
      console.log('✅ Ending call for all participants...');
      socket.emit('end-call', {
        appointmentId: appointment._id
      });
      
      // Show confirmation message
      toast.success('Call ended for all participants');
      
      // Clean up local resources
      cleanupMeeting();
      onClose();
    } else {
      console.error('❌ Cannot end call: socket or appointment ID not available');
      toast.error('Cannot end call - connection not available');
    }
  };

  const handleEndCallClick = () => {
    setShowEndCallConfirm(true);
  };

  const cleanupMeeting = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => {
        track.stop();
      });
    }
    if (peerConnection.current) {
      peerConnection.current.close();
    }
    if (durationInterval.current) {
      clearInterval(durationInterval.current);
    }
    if (mediaRecorder.current && mediaRecorder.current.state === 'recording') {
      mediaRecorder.current.stop();
    }
    if (socket) {
      socket.disconnect();
    }
    setIsConnected(false);
    setChatConnected(false);
  };

  const toggleMute = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
        toast.info(audioTrack.enabled ? 'Microphone unmuted' : 'Microphone muted');
      }
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
        toast.info(videoTrack.enabled ? 'Camera turned on' : 'Camera turned off');
      }
    }
  };

  const toggleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: false
        });
        
        const videoTrack = screenStream.getVideoTracks()[0];
        const sender = peerConnection.current?.getSenders().find(s => s.track?.kind === 'video');
        
        if (sender) {
          sender.replaceTrack(videoTrack);
          setIsScreenSharing(true);
          toast.success('Screen sharing started');
          
          videoTrack.onended = () => {
            stopScreenShare();
          };
        }
      } else {
        stopScreenShare();
      }
    } catch (error) {
      console.error('Error toggling screen share:', error);
      toast.error('Failed to toggle screen sharing');
    }
  };

  const stopScreenShare = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      const sender = peerConnection.current?.getSenders().find(s => s.track?.kind === 'video');
      
      if (sender && videoTrack) {
        sender.replaceTrack(videoTrack);
      }
    }
    setIsScreenSharing(false);
    toast.info('Screen sharing stopped');
  };

  const forceVideoRefresh = () => {
    if (localVideoRef.current && localStream) {
      console.log('Forcing video refresh...');
      localVideoRef.current.srcObject = null;
      setTimeout(() => {
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = localStream;
          localVideoRef.current.play().catch(e => {
            console.error('Force refresh video play error:', e);
          });
        }
      }, 100);
    }
  };

  const startRecording = () => {
    if (localStream && !isRecording) {
      const stream = new MediaStream();
      localStream.getTracks().forEach(track => stream.addTrack(track));
      if (remoteStream) {
        remoteStream.getTracks().forEach(track => stream.addTrack(track));
      }
      
      mediaRecorder.current = new MediaRecorder(stream);
      const chunks = [];
      
      mediaRecorder.current.ondataavailable = (event) => {
        chunks.push(event.data);
      };
      
      mediaRecorder.current.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `meeting-recording-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.webm`;
        a.click();
        URL.revokeObjectURL(url);
      };
      
      mediaRecorder.current.start();
      setIsRecording(true);
      toast.success('Recording started');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && mediaRecorder.current.state === 'recording') {
      mediaRecorder.current.stop();
      setIsRecording(false);
      toast.success('Recording saved');
    }
  };

  const sendMessage = () => {
    if (newMessage.trim() && socket && chatConnected) {
      try {
        // Send message via WebSocket
        socket.emit('chat-message', {
          appointmentId: appointment._id,
          message: newMessage,
          sender: isDoctor ? 'doctor' : 'patient'
        });
        
        console.log('Message sent via WebSocket:', newMessage);
        
        // Add to local messages immediately
        setChatMessages(prev => [...prev, {
          text: newMessage,
          sender: 'me',
          time: new Date()
        }]);
        
        setNewMessage('');
      } catch (error) {
        console.error('Error sending message:', error);
        toast.error('Failed to send message. Please try again.');
      }
    } else if (!socket || !chatConnected) {
      toast.warning('Chat connection not established yet. Please wait...');
    } else if (!newMessage.trim()) {
      toast.warning('Please enter a message to send.');
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const testMediaAccess = async () => {
    try {
      console.log('Testing media access...');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      console.log('Media access test successful');
      console.log('Video tracks:', stream.getVideoTracks());
      console.log('Audio tracks:', stream.getAudioTracks());
      
      // Stop the test stream
      stream.getTracks().forEach(track => track.stop());
      
      toast.success('Camera and microphone access test successful!');
    } catch (error) {
      console.error('Media access test failed:', error);
      toast.error(`Media access test failed: ${error.message}`);
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-semibold">Initializing meeting...</p>
          <p className="text-sm text-gray-600 mt-2">Please allow camera and microphone access</p>
        </div>
      </div>
    );
  }

  if (cameraAccessError) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Camera Access Issue</h3>
          <p className="text-sm text-gray-600 mb-6">
            Your camera is currently being used by another application. This commonly happens when running multiple instances of the application on the same device.
          </p>
          
          <div className="space-y-3">
            <button
              onClick={retryCameraAccess}
              disabled={isRetryingCamera}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRetryingCamera ? (
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Retrying...
                </div>
              ) : (
                'Retry Camera Access'
              )}
            </button>
            
            <button
              onClick={onClose}
              className="w-full bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Close Meeting
            </button>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="text-sm font-semibold text-blue-900 mb-2">Troubleshooting Tips:</h4>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• Close other browser tabs using the camera</li>
              <li>• Close other applications using the camera</li>
              <li>• Try using different browsers for each instance</li>
              <li>• Use incognito/private browsing mode</li>
              <li>• Test with two separate devices if possible</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-900 flex flex-col z-50">
      {/* Header */}
      <div className="bg-gray-800 text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold">
            Meeting with {isDoctor ? 'Patient' : 'Doctor'}
          </h2>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isSocketConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm">{isSocketConnected ? 'Connected' : 'Disconnected'}</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm">{formatDuration(meetingDuration)}</span>
          <span className="text-sm">{participantCount} participants</span>
          <button
            onClick={() => setShowDebugInfo(!showDebugInfo)}
            className="text-gray-400 hover:text-white transition-colors"
            title="Toggle Debug Info"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </button>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex min-h-0">
        {/* Video Area */}
        <div className="flex-1 relative min-h-0">
          {/* Remote Video */}
          {remoteStream && (
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
          )}
          
          {/* Local Video */}
          <div className="absolute bottom-4 right-4 w-64 h-48 bg-gray-800 rounded-lg overflow-hidden shadow-lg">
            {localStream ? (
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
                onLoadedMetadata={() => {
                  console.log('Local video metadata loaded');
                  if (localVideoRef.current && localVideoRef.current.paused) {
                    localVideoRef.current.play().catch(e => console.error('Local video play error:', e));
                  }
                }}
                onCanPlay={() => {
                  console.log('Local video can play');
                  if (localVideoRef.current && localVideoRef.current.paused) {
                    localVideoRef.current.play().catch(e => console.error('Local video play error:', e));
                  }
                }}
                onError={(e) => console.error('Local video error:', e)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white">
                <div className="text-center">
                  <div className="text-4xl mb-2">📹</div>
                  <div className="text-sm">Camera Loading...</div>
                </div>
              </div>
            )}
            
            {/* Camera/Microphone Status Overlay */}
            <div className="absolute top-2 left-2 flex gap-2">
              <div className={`px-2 py-1 rounded text-xs font-medium ${
                localStream && localStream.getVideoTracks().length > 0 && localStream.getVideoTracks()[0].enabled
                  ? 'bg-green-500 text-white'
                  : 'bg-red-500 text-white'
              }`}>
                {localStream && localStream.getVideoTracks().length > 0 && localStream.getVideoTracks()[0].enabled ? '📹' : '❌'} Camera
              </div>
              <div className={`px-2 py-1 rounded text-xs font-medium ${
                localStream && localStream.getAudioTracks().length > 0 && localStream.getAudioTracks()[0].enabled
                  ? 'bg-green-500 text-white'
                  : 'bg-red-500 text-white'
              }`}>
                {localStream && localStream.getAudioTracks().length > 0 && localStream.getAudioTracks()[0].enabled ? '🎤' : '❌'} Mic
              </div>
            </div>
          </div>

          {/* Connection Status */}
          {!isConnected && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black bg-opacity-75 text-white p-4 rounded-lg">
              <p>Waiting for other participant to join...</p>
            </div>
          )}
          
          {/* Debug Info Panel */}
          {showDebugInfo && (
            <div className="absolute top-4 left-4 bg-black bg-opacity-75 text-white p-4 rounded-lg max-w-md text-xs">
              <h4 className="font-semibold mb-2">Debug Information</h4>
              <div className="space-y-1">
                <div>Socket Connected: {isSocketConnected ? '✅' : '❌'}</div>
                <div>Local Stream: {localStream ? '✅' : '❌'}</div>
                <div>Remote Stream: {remoteStream ? '✅' : '❌'}</div>
                <div>Peer Connection: {peerConnection.current ? '✅' : '❌'}</div>
                <div>Chat Connected: {chatConnected ? '✅' : '❌'}</div>
                {localStream && (
                  <>
                    <div>Video Tracks: {localStream.getVideoTracks().length}</div>
                    <div>Audio Tracks: {localStream.getAudioTracks().length}</div>
                    <div>Video Enabled: {localStream.getVideoTracks()[0]?.enabled ? '✅' : '❌'}</div>
                    <div>Audio Enabled: {localStream.getAudioTracks()[0]?.enabled ? '✅' : '❌'}</div>
                  </>
                )}
                {localVideoRef.current && (
                  <>
                    <div>Video Ready State: {localVideoRef.current.readyState}</div>
                    <div>Video Paused: {localVideoRef.current.paused ? 'Yes' : 'No'}</div>
                    <div>Video Dimensions: {localVideoRef.current.videoWidth}x{localVideoRef.current.videoHeight}</div>
                  </>
                )}
                <div>Secure Context: {window.isSecureContext ? '✅' : '❌'}</div>
                <div>User Agent: {navigator.userAgent.substring(0, 50)}...</div>
                <button
                  onClick={testMediaAccess}
                  className="mt-2 w-full bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700"
                >
                  Test Media Access
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Chat Sidebar */}
        {showChat && (
          <div className="w-80 bg-gray-800 flex flex-col h-full">
            <div className="p-4 border-b border-gray-700 flex-shrink-0">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-semibold">Chat</h3>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${chatConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-xs text-gray-400">
                    {chatConnected ? 'Connected' : 'Connecting...'}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 min-h-0" ref={chatContainerRef}>
              {chatMessages.map((msg, index) => (
                <div key={index} className={`mb-3 ${msg.sender === 'me' ? 'text-right' : msg.sender === 'system' ? 'text-center' : 'text-left'}`}>
                  <div className={`inline-block p-2 rounded-lg max-w-xs break-words ${
                    msg.sender === 'me' ? 'bg-blue-600 text-white' : 
                    msg.sender === 'system' ? 'bg-yellow-600 text-white text-xs' : 
                    'bg-gray-600 text-white'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-gray-700 flex-shrink-0">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 bg-gray-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={sendMessage}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-gray-800 p-4 flex items-center justify-center gap-3 flex-wrap">
        <button
          onClick={toggleMute}
          className={`p-3 rounded-full transition-colors flex-shrink-0 ${
            isMuted ? 'bg-red-600 text-white' : 'bg-gray-600 text-white hover:bg-gray-500'
          }`}
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isMuted ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            )}
          </svg>
        </button>

        <button
          onClick={toggleVideo}
          className={`p-3 rounded-full transition-colors flex-shrink-0 ${
            isVideoOff ? 'bg-red-600 text-white' : 'bg-gray-600 text-white hover:bg-gray-500'
          }`}
          title={isVideoOff ? 'Turn on camera' : 'Turn off camera'}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isVideoOff ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            )}
          </svg>
        </button>

        <button
          onClick={toggleScreenShare}
          className={`p-3 rounded-full transition-colors flex-shrink-0 ${
            isScreenSharing ? 'bg-blue-600 text-white' : 'bg-gray-600 text-white hover:bg-gray-500'
          }`}
          title={isScreenSharing ? 'Stop screen sharing' : 'Share screen'}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </button>

        <button
          onClick={() => setShowChat(!showChat)}
          className={`p-3 rounded-full transition-colors flex-shrink-0 ${
            showChat ? 'bg-blue-600 text-white' : 'bg-gray-600 text-white hover:bg-gray-500'
          }`}
          title={showChat ? 'Hide chat' : 'Show chat'}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </button>

        <button
          onClick={isRecording ? stopRecording : startRecording}
          className={`p-3 rounded-full transition-colors flex-shrink-0 ${
            isRecording ? 'bg-red-600 text-white' : 'bg-gray-600 text-white hover:bg-gray-500'
          }`}
          title={isRecording ? 'Stop recording' : 'Start recording'}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>

        <button
          onClick={forceVideoRefresh}
          className="p-3 rounded-full bg-gray-600 text-white hover:bg-gray-500 transition-colors flex-shrink-0"
          title="Refresh video"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>

        <button
          onClick={testMediaAccess}
          className="p-3 rounded-full bg-yellow-600 text-white hover:bg-yellow-700 transition-colors flex-shrink-0"
          title="Test camera access"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>

        {/* End Call Button - Only for Doctors */}
        {isDoctor ? (
          <button
            onClick={handleEndCallClick}
            className="p-3 rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors flex-shrink-0"
            title="End call for all participants (Doctor Only)"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z" />
            </svg>
          </button>
        ) : (
          <div className="text-xs text-gray-400 px-3 py-3 flex-shrink-0">End Call (Doctor Only)</div>
        )}
      </div>

      {/* End Call Confirmation Modal */}
      {showEndCallConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">End Call</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to end the call for all participants?</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowEndCallConfirm(false)}
                className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowEndCallConfirm(false);
                  endCallForAll();
                }}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                End Call
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MeetingInterface; 