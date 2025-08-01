import React, { useState, useEffect, useRef, useContext } from 'react';
import { toast } from 'react-toastify';
import { io } from 'socket.io-client';
import { AppContext } from '../context/AppContext';

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
  const [peerConnectionInitialized, setPeerConnectionInitialized] = useState(false);
  const [pendingOfferCreation, setPendingOfferCreation] = useState(false);
  const [remoteDescriptionSet, setRemoteDescriptionSet] = useState(false);
  const [lastProcessedOffer, setLastProcessedOffer] = useState(null);
  const [lastProcessedAnswer, setLastProcessedAnswer] = useState(null);
  const [lastRemoteStreamId, setLastRemoteStreamId] = useState(null);
  
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const chatContainerRef = useRef(null);
  const peerConnection = useRef(null);
  const mediaRecorder = useRef(null);
  const durationInterval = useRef(null);
  const iceCandidateQueue = useRef([]);
  const { backendUrl, token, userData } = useContext(AppContext);

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
      const video = localVideoRef.current;
      video.srcObject = localStream;
      
      // Enhanced video element debugging
      video.onloadedmetadata = () => {
        console.log('Video metadata loaded');
        if (video.paused) {
          console.log('Video is paused, attempting to play...');
          video.play().catch(e => console.error('onloadedmetadata play error:', e));
        }
      };
      
      video.oncanplay = () => {
        console.log('Video can play');
        if (video.paused) {
          console.log('Video is paused, attempting to play...');
          video.play().catch(e => console.error('oncanplay play error:', e));
        }
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

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [chatMessages]);

  // Retry peer connection initialization when local stream becomes available
  useEffect(() => {
    console.log('🔄 useEffect triggered - checking prerequisites:');
    console.log('- Local Stream:', localStream ? 'Available' : 'Not Available');
    console.log('- Socket:', socket ? 'Available' : 'Not Available');
    console.log('- Peer Connection Initialized:', peerConnectionInitialized);
    console.log('- Pending Offer Creation:', pendingOfferCreation);
    
    if (localStream && socket && !peerConnectionInitialized && pendingOfferCreation) {
      console.log('🔄 Local stream and socket available, retrying peer connection initialization...');
      setTimeout(() => {
        initializePeerConnection();
      }, 500);
    }
  }, [localStream, socket, peerConnectionInitialized, pendingOfferCreation]);

  // Retry offer creation when all prerequisites are met
  useEffect(() => {
    if (peerConnectionInitialized && pendingOfferCreation && peerConnection.current && socket && socket.connected && localStream) {
      console.log('🔄 All prerequisites met, retrying offer creation...');
      setTimeout(() => {
        createAndSendOffer();
        setPendingOfferCreation(false);
      }, 500);
    }
  }, [peerConnectionInitialized, pendingOfferCreation, peerConnection.current, socket, localStream]);

  const startDurationTimer = () => {
    durationInterval.current = setInterval(() => {
      setMeetingDuration(prev => prev + 1);
    }, 1000);
  };

  const initializeSocket = () => {
    try {
      console.log('Initializing WebSocket connection...');
      const socketUrl = backendUrl.replace('http', 'ws');
      const newSocket = io(socketUrl, {
        auth: {
          token: token       // Use 'token' format for frontend
        },
        transports: ['websocket', 'polling'],
        timeout: 10000,
        forceNew: true
      });

      newSocket.on('connect', () => {
        console.log('WebSocket connected');
        setIsSocketConnected(true);
        setSocket(newSocket); // Set the socket immediately when connected
        
        console.log('✅ Socket state updated - ready for peer connection');
        
        // Join the meeting room
        newSocket.emit('join-meeting', {
          appointmentId: appointment._id,
          userType: isDoctor ? 'doctor' : 'patient'
        });
      });

      newSocket.on('disconnect', () => {
        console.log('WebSocket disconnected');
        setIsSocketConnected(false);
      });

      newSocket.on('meeting-participants', (participants) => {
        console.log('👥 Meeting participants:', participants);
        setParticipantCount(participants.length + 1); // +1 for self
        
        // Enable chat when participants are available
        if (participants.length > 0) {
          console.log('✅ Other participants found, enabling chat...');
          setChatConnected(true);
          // Add a system message
          setChatMessages(prev => [...prev, {
            text: 'Chat is now available! You can send messages.',
            sender: 'system',
            time: new Date()
          }]);
        }
        
        // If there are other participants, initialize peer connection
        if (participants.length > 0 && !peerConnectionInitialized) {
          console.log('🔄 Other participants found, initializing peer connection...');
          setPendingOfferCreation(true); // Mark that we want to create an offer
          initializePeerConnection();
        } else if (participants.length > 0 && peerConnectionInitialized) {
          console.log('✅ Peer connection already initialized, participants available');
        } else {
          console.log('⏳ No other participants yet, waiting...');
        }
      });

      newSocket.on('user-joined', (user) => {
        console.log('👤 User joined:', user);
        setParticipantCount(prev => prev + 1);
        
        // Initialize peer connection when someone joins
        if (!peerConnectionInitialized) {
          console.log('🔄 Initializing peer connection for new user...');
          setPendingOfferCreation(true); // Mark that we want to create an offer
          initializePeerConnection();
        } else {
          console.log('✅ Peer connection already exists, checking if offer needed...');
          // Only create offer if we don't already have a remote description
          if (!remoteDescriptionSet) {
            console.log('🔄 No remote description set, creating offer...');
            setTimeout(() => {
              if (peerConnection.current && socket && socket.connected && localStream) {
                console.log('🔄 Creating offer after user joined...');
                createAndSendOffer();
              } else {
                console.warn('⚠️ Peer connection or socket not ready for offer creation');
                console.log('Debug info:');
                console.log('- Peer Connection:', peerConnection.current ? 'Available' : 'Not Available');
                console.log('- Socket:', socket ? 'Available' : 'Not Available');
                console.log('- Socket Connected:', socket?.connected ? 'Yes' : 'No');
                console.log('- Local Stream:', localStream ? 'Available' : 'Not Available');
                console.log('- Remote Description Set:', remoteDescriptionSet);
              }
            }, 1000);
          } else {
            console.log('✅ Remote description already set, no need for new offer');
          }
        }
      });

      newSocket.on('user-left', (user) => {
        console.log('👤 User left:', user);
        
        // Prevent duplicate user leave events
        if (participantCount <= 1) {
          console.log('⚠️ User leave event ignored - already at minimum participant count');
          return;
        }
        
        setParticipantCount(prev => Math.max(1, prev - 1));
        setRemoteStream(null);
        
        // Clean up peer connection when user leaves
        if (peerConnection.current) {
          console.log('🔄 Cleaning up peer connection due to user leaving...');
          peerConnection.current.close();
          peerConnection.current = null;
          setPeerConnectionInitialized(false);
          setRemoteDescriptionSet(false);
          setLastProcessedOffer(null);
          setLastProcessedAnswer(null);
          iceCandidateQueue.current = [];
        }
      });

      newSocket.on('offer', async (data) => {
        console.log('📤 Received offer from:', data.from);
        
        // Check for duplicate offers
        const offerId = `${data.from}-${data.offer.sdp.substring(0, 50)}`;
        if (lastProcessedOffer === offerId) {
          console.log('⚠️ Duplicate offer detected, ignoring...');
          return;
        }
        
        if (peerConnection.current) {
          try {
            // Check if we're in the right state to set remote description
            const signalingState = peerConnection.current.signalingState;
            console.log('🔄 Current signaling state:', signalingState);
            
            if (signalingState === 'stable') {
              console.log('⚠️ Peer connection is in stable state, cannot set remote offer');
              console.log('🔄 This might be a duplicate offer or race condition');
              return;
            }
            
            if (signalingState !== 'stable' && signalingState !== 'have-remote-offer') {
              console.log('⚠️ Unexpected signaling state for offer:', signalingState);
              console.log('🔄 Expected: stable or have-remote-offer, Got:', signalingState);
              return;
            }
            
            console.log('🔄 Setting remote description...');
            await peerConnection.current.setRemoteDescription(new RTCSessionDescription(data.offer));
            console.log('✅ Remote description set successfully');
            setRemoteDescriptionSet(true);
            
            // Process any queued ICE candidates
            if (iceCandidateQueue.current.length > 0) {
              console.log(`🔄 Processing ${iceCandidateQueue.current.length} queued ICE candidates...`);
              for (const candidate of iceCandidateQueue.current) {
                try {
                  console.log('🔄 Processing queued candidate:', candidate);
                  await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
                  console.log('✅ Queued ICE candidate added successfully');
                } catch (error) {
                  console.error('❌ Error adding queued ICE candidate:', error);
                  console.error('❌ Candidate that failed:', candidate);
                  // Continue processing other candidates even if one fails
                }
              }
              iceCandidateQueue.current = [];
              console.log('✅ All queued ICE candidates processed');
            }
            
            console.log('🔄 Creating answer...');
            const answer = await peerConnection.current.createAnswer();
            await peerConnection.current.setLocalDescription(answer);
            console.log('✅ Answer created and set locally');
            
            console.log('📤 Sending answer to:', data.from);
            newSocket.emit('answer', {
              appointmentId: appointment._id,
              answer: answer
            });
            
            // Track this offer as processed
            setLastProcessedOffer(offerId);
          } catch (error) {
            console.error('❌ Error handling offer:', error);
            console.error('❌ Error details:', {
              name: error.name,
              message: error.message,
              signalingState: peerConnection.current?.signalingState,
              connectionState: peerConnection.current?.connectionState
            });
            
            if (error.name === 'InvalidStateError') {
              console.warn('⚠️ Invalid state error - this might be a duplicate offer');
              // Don't show error toast for state errors, as they're usually harmless
              return;
            }
            
            toast.error('Failed to establish connection');
          }
        } else {
          console.warn('⚠️ No peer connection available for offer');
        }
      });

      newSocket.on('answer', async (data) => {
        console.log('📥 Received answer from:', data.from);
        
        // Check for duplicate answers
        const answerId = `${data.from}-${data.answer.sdp.substring(0, 50)}`;
        if (lastProcessedAnswer === answerId) {
          console.log('⚠️ Duplicate answer detected, ignoring...');
          return;
        }
        
        if (peerConnection.current) {
          try {
            // Check if we're in the right state to set remote description
            const signalingState = peerConnection.current.signalingState;
            console.log('🔄 Current signaling state:', signalingState);
            
            if (signalingState === 'stable') {
              console.log('⚠️ Peer connection is in stable state, cannot set remote answer');
              console.log('🔄 This might be a duplicate answer or race condition');
              return;
            }
            
            if (signalingState !== 'have-local-offer') {
              console.log('⚠️ Unexpected signaling state for answer:', signalingState);
              console.log('🔄 Expected: have-local-offer, Got:', signalingState);
              return;
            }
            
            console.log('🔄 Setting remote description from answer...');
            await peerConnection.current.setRemoteDescription(new RTCSessionDescription(data.answer));
            console.log('✅ Remote description set from answer successfully');
            setRemoteDescriptionSet(true);
            
            // Process any queued ICE candidates
            if (iceCandidateQueue.current.length > 0) {
              console.log(`🔄 Processing ${iceCandidateQueue.current.length} queued ICE candidates...`);
              for (const candidate of iceCandidateQueue.current) {
                try {
                  console.log('🔄 Processing queued candidate:', candidate);
                  await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
                  console.log('✅ Queued ICE candidate added successfully');
                } catch (error) {
                  console.error('❌ Error adding queued ICE candidate:', error);
                  console.error('❌ Candidate that failed:', candidate);
                  // Continue processing other candidates even if one fails
                }
              }
              iceCandidateQueue.current = [];
              console.log('✅ All queued ICE candidates processed');
            }
            
            // Track this answer as processed
            setLastProcessedAnswer(answerId);
          } catch (error) {
            console.error('❌ Error handling answer:', error);
            console.error('❌ Error details:', {
              name: error.name,
              message: error.message,
              signalingState: peerConnection.current?.signalingState,
              connectionState: peerConnection.current?.connectionState
            });
            
            if (error.name === 'InvalidStateError') {
              console.warn('⚠️ Invalid state error - this might be a duplicate answer');
              // Don't show error toast for state errors, as they're usually harmless
              return;
            }
            
            toast.error('Failed to complete connection');
          }
        } else {
          console.warn('⚠️ No peer connection available for answer');
        }
      });

      newSocket.on('ice-candidate', async (data) => {
        console.log('🧊 Received ICE candidate from:', data.from);
        console.log('🧊 ICE candidate data:', data.candidate);
        
        if (peerConnection.current) {
          try {
            if (remoteDescriptionSet) {
              console.log('🔄 Adding ICE candidate immediately...');
              console.log('🔄 Peer connection state:', peerConnection.current.connectionState);
              console.log('🔄 ICE connection state:', peerConnection.current.iceConnectionState);
              
              await peerConnection.current.addIceCandidate(new RTCIceCandidate(data.candidate));
              console.log('✅ ICE candidate added successfully');
            } else {
              console.log('⏳ Queuing ICE candidate (remote description not set yet)...');
              iceCandidateQueue.current.push(data.candidate);
            }
          } catch (error) {
            console.error('❌ Error adding ICE candidate:', error);
            console.error('❌ Error details:', {
              name: error.name,
              message: error.message,
              connectionState: peerConnection.current?.connectionState,
              iceConnectionState: peerConnection.current?.iceConnectionState,
              remoteDescriptionSet: remoteDescriptionSet
            });
            
            // If it's an operation error, try to continue anyway
            if (error.name === 'OperationError') {
              console.warn('⚠️ ICE candidate processing failed, but continuing...');
              // Don't throw the error, just log it and continue
              return;
            }
            
            // For other errors, log but don't break the connection
            console.warn('⚠️ ICE candidate error, but connection may still work...');
          }
        } else {
          console.warn('⚠️ No peer connection available for ICE candidate');
        }
      });

      newSocket.on('connect_error', (error) => {
        console.error('WebSocket connection error:', error);
        toast.error('Failed to connect to meeting server');
      });

      newSocket.on('error', (error) => {
        console.error('WebSocket error:', error);
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

      setSocket(newSocket);
    } catch (error) {
      console.error('Error initializing socket:', error);
      toast.error('Failed to establish connection');
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
        // First attempt: Full quality
        constraints = {
          video: {
            width: { ideal: 1280, min: 640 },
            height: { ideal: 720, min: 480 },
            facingMode: 'user',
            frameRate: { ideal: 30 }
          },
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            sampleRate: 44100
          }
        };
      } else if (retryCount === 1) {
        // Second attempt: Lower quality
        constraints = {
          video: {
            width: { ideal: 640, min: 320 },
            height: { ideal: 480, min: 240 },
            facingMode: 'user',
            frameRate: { ideal: 15 }
          },
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        };
      } else {
        // Third attempt: Minimal quality
        constraints = {
          video: {
            width: { ideal: 320, min: 160 },
            height: { ideal: 240, min: 120 },
            facingMode: 'user',
            frameRate: { ideal: 10 }
          },
          audio: {
            echoCancellation: true
          }
        };
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log(`Camera access successful on attempt ${retryCount + 1}`);
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
      
      console.log('✅ Local stream set successfully');

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
    // Prevent multiple initializations
    if (peerConnectionInitialized) {
      console.log('⚠️ Peer connection already initialized, skipping...');
      return;
    }
    
    // Check prerequisites
    if (!localStream) {
      console.log('⚠️ Cannot initialize peer connection: local stream not available');
      console.log('🔄 Will retry when local stream becomes available');
      return;
    }
    
    if (!socket) {
      console.log('⚠️ Cannot initialize peer connection: socket not available');
      console.log('🔄 Will retry when socket becomes available');
      return;
    }
    
    try {
      console.log('🔄 Initializing new peer connection...');
      console.log('- Local Stream Available:', localStream ? 'Yes' : 'No');
      console.log('- Socket Available:', socket ? 'Yes' : 'No');
      
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
      
      console.log('✅ RTCPeerConnection created successfully');
      peerConnection.current = pc;
      setPeerConnectionInitialized(true);
      console.log('✅ Peer connection initialized and state updated');
      
      // Add local stream tracks to peer connection
      if (localStream) {
        localStream.getTracks().forEach(track => {
          pc.addTrack(track, localStream);
        });
      }
      
      // If there was a pending offer creation, handle it now
      if (pendingOfferCreation && socket) {
        console.log('🔄 Handling pending offer creation after peer connection initialization...');
        setTimeout(() => {
          if (peerConnection.current && socket && socket.connected && localStream) {
            console.log('✅ All prerequisites met, creating offer...');
            createAndSendOffer();
            setPendingOfferCreation(false);
          } else {
            console.log('⚠️ Prerequisites not met for offer creation, will retry...');
            // Don't clear pendingOfferCreation, let it retry later
          }
        }, 1000);
      }
      
      // Handle incoming remote streams
      pc.ontrack = (event) => {
        const remoteStream = event.streams[0];
        console.log('🎥 Received remote stream:', remoteStream);
        console.log('🎥 Stream ID:', remoteStream.id);
        console.log('🎥 Stream tracks:', remoteStream?.getTracks().map(track => ({
          kind: track.kind,
          enabled: track.enabled,
          readyState: track.readyState
        })));
        
        // Prevent duplicate stream processing
        if (lastRemoteStreamId === remoteStream.id) {
          console.log('⚠️ Duplicate remote stream detected, ignoring...');
          return;
        }
        
        setLastRemoteStreamId(remoteStream.id);
        setRemoteStream(remoteStream);
        
        // Ensure we have a video track
        const videoTrack = remoteStream.getVideoTracks()[0];
        if (videoTrack) {
          console.log('🎥 Video track found:', {
            enabled: videoTrack.enabled,
            readyState: videoTrack.readyState,
            id: videoTrack.id
          });
        }
        
        if (remoteVideoRef.current) {
          console.log('🎥 Setting remote video srcObject');
          remoteVideoRef.current.srcObject = remoteStream;
          
          // Add event listeners to debug video element
          remoteVideoRef.current.onloadedmetadata = () => {
            console.log('🎥 Remote video metadata loaded');
            console.log('🎥 Video dimensions:', remoteVideoRef.current.videoWidth + 'x' + remoteVideoRef.current.videoHeight);
          };
          
          remoteVideoRef.current.oncanplay = () => {
            console.log('🎥 Remote video can play');
          };
          
          remoteVideoRef.current.onplay = () => {
            console.log('🎥 Remote video started playing');
          };
          
          remoteVideoRef.current.onerror = (e) => {
            console.error('🎥 Remote video error:', e);
          };
          
          // Force play the video
          const playPromise = remoteVideoRef.current.play();
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                console.log('✅ Remote video started playing successfully');
                toast.success('Video connection established!');
              })
              .catch(e => {
                console.error('❌ Remote video play error:', e);
                // Try to play again after a short delay
                setTimeout(() => {
                  if (remoteVideoRef.current) {
                    remoteVideoRef.current.play().catch(e2 => {
                      console.error('❌ Second attempt to play remote video failed:', e2);
                      toast.error('Failed to play remote video');
                    });
                  }
                }, 1000);
              });
          }
        } else {
          console.warn('⚠️ Remote video ref not available');
        }
        
        setParticipantCount(2);
        toast.success('Video connection established!');
        
        // Log successful connection
        console.log('🎉 Video connection fully established!');
        console.log('📊 Connection Summary:');
        console.log('- Local Stream:', localStream ? 'Active' : 'Not Active');
        console.log('- Remote Stream:', remoteStream ? 'Active' : 'Not Active');
        console.log('- Participant Count:', participantCount);
        console.log('- Connection State:', peerConnection.current?.connectionState);
        console.log('- ICE Connection State:', peerConnection.current?.iceConnectionState);
      };
      
      // Handle connection state changes
      pc.onconnectionstatechange = () => {
        console.log('🔗 Connection state changed:', pc.connectionState);
        if (pc.connectionState === 'connected') {
          console.log('✅ WebRTC connection established');
          setIsConnected(true);
          toast.success('Connected to other participant!');
        } else if (pc.connectionState === 'disconnected') {
          console.log('❌ WebRTC connection lost');
          setIsConnected(false);
          toast.warning('Connection lost. Trying to reconnect...');
        } else if (pc.connectionState === 'connecting') {
          console.log('🔄 WebRTC connecting...');
        } else if (pc.connectionState === 'failed') {
          console.log('❌ WebRTC connection failed');
          toast.error('Connection failed. Please try again.');
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
      console.log('🔍 Checking prerequisites for offer creation...');
      console.log('- Peer Connection:', peerConnection.current ? 'Available' : 'Not Available');
      console.log('- Socket:', socket ? 'Available' : 'Not Available');
      console.log('- Socket Connected:', socket?.connected ? 'Yes' : 'No');
      console.log('- Peer Connection Initialized:', peerConnectionInitialized);
      console.log('- Appointment ID:', appointment._id);
      console.log('- Local Stream:', localStream ? 'Available' : 'Not Available');
      
      if (!peerConnection.current) {
        console.warn('⚠️ Cannot create offer: peerConnection not available');
        console.log('🔄 Attempting to initialize peer connection...');
        initializePeerConnection();
        // Wait a bit and try again
        setTimeout(() => {
          if (peerConnection.current && socket) {
            console.log('🔄 Retrying offer creation after initialization...');
            createAndSendOffer();
          }
        }, 1000);
        return;
      }
      
      if (!socket) {
        console.warn('⚠️ Cannot create offer: socket not available');
        return;
      }
      
      if (!socket.connected) {
        console.warn('⚠️ Cannot create offer: socket not connected');
        return;
      }
      
      if (!localStream) {
        console.warn('⚠️ Cannot create offer: local stream not available');
        return;
      }
      
      console.log('📤 Creating offer...');
      const offer = await peerConnection.current.createOffer();
      console.log('✅ Offer created successfully');
      
      console.log('🔄 Setting local description...');
      await peerConnection.current.setLocalDescription(offer);
      console.log('✅ Local description set successfully');
      
      console.log('📤 Sending offer to other participants...');
      socket.emit('offer', {
        appointmentId: appointment._id,
        offer: offer
      });
      console.log('✅ Offer sent successfully');
    } catch (error) {
      console.error('❌ Error creating offer:', error);
      toast.error('Failed to create connection offer');
    }
  };

  const endCallForAll = () => {
    console.log('🔴 End call button clicked');
    console.log('🔴 Socket available:', !!socket);
    console.log('🔴 Appointment ID:', appointment._id);
    console.log('🔴 Is Doctor:', isDoctor);
    
    if (socket && appointment._id) {
      console.log('✅ Ending call for all participants...');
      socket.emit('end-call', {
        appointmentId: appointment._id
      });
      toast.success('Call ended for all participants');
      cleanupMeeting();
      onClose();
    } else {
      console.error('❌ Cannot end call: socket or appointment ID not available');
      toast.error('Cannot end call - connection not available');
    }
  };

  const cleanupMeeting = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => {
        track.stop();
      });
    }
    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
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
    setPeerConnectionInitialized(false);
    setPendingOfferCreation(false);
    setLastProcessedOffer(null);
    setLastProcessedAnswer(null);
    setLastRemoteStreamId(null);
    setRemoteDescriptionSet(false);
    iceCandidateQueue.current = [];
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
    console.log('🔄 Force refreshing video...');
    
    // Refresh local video
    if (localVideoRef.current && localStream) {
      console.log('🔄 Refreshing local video...');
      localVideoRef.current.srcObject = null;
      setTimeout(() => {
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = localStream;
          localVideoRef.current.play().catch(e => {
            console.error('Force refresh local video play error:', e);
          });
        }
      }, 100);
    }
    
    // Refresh remote video
    if (remoteVideoRef.current && remoteStream) {
      console.log('🔄 Refreshing remote video...');
      remoteVideoRef.current.srcObject = null;
      setTimeout(() => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
          remoteVideoRef.current.play().catch(e => {
            console.error('Force refresh remote video play error:', e);
          });
        }
      }, 100);
    }
  };

  const forceReconnect = async () => {
    console.log('🔄 Force reconnecting...');
    
    // Clean up existing connection
    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }
    
    setRemoteStream(null);
    setPeerConnectionInitialized(false);
    setRemoteDescriptionSet(false);
    setLastProcessedOffer(null);
    setLastProcessedAnswer(null);
    setLastRemoteStreamId(null);
    iceCandidateQueue.current = [];
    
    // Wait a moment and reinitialize
    setTimeout(() => {
      if (socket && localStream) {
        console.log('🔄 Reinitializing peer connection...');
        initializePeerConnection();
        
        // Create offer after a short delay
        setTimeout(() => {
          if (peerConnection.current && socket) {
            console.log('🔄 Creating offer after reconnection...');
            createAndSendOffer();
          }
        }, 1000);
      }
    }, 500);
  };

  const checkConnectionState = () => {
    console.log('🔍 Connection State Check:');
    console.log('- Local Stream:', localStream ? 'Available' : 'Not Available');
    console.log('- Socket:', socket ? 'Available' : 'Not Available');
    console.log('- Socket Connected:', socket?.connected || false);
    console.log('- Peer Connection:', peerConnection.current ? 'Available' : 'Not Available');
    console.log('- Peer Connection Initialized:', peerConnectionInitialized);
    console.log('- Pending Offer Creation:', pendingOfferCreation);
    console.log('- Remote Description Set:', remoteDescriptionSet);
    console.log('- Chat Connected:', chatConnected);
    
    if (peerConnection.current) {
      console.log('- Peer Connection State:', peerConnection.current.connectionState);
      console.log('- ICE Connection State:', peerConnection.current.iceConnectionState);
      console.log('- Signaling State:', peerConnection.current.signalingState);
    }
    
    return {
      localStream: !!localStream,
      socket: !!socket,
      socketConnected: socket?.connected || false,
      peerConnection: !!peerConnection.current,
      peerConnectionInitialized,
      pendingOfferCreation,
      remoteDescriptionSet,
      chatConnected
    };
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
    if (newMessage.trim() && socket) {
      const messageData = {
        appointmentId: appointment._id,
        message: newMessage.trim(),
        sender: 'me'
      };
      
      socket.emit('chat-message', messageData);
      setChatMessages(prev => [...prev, messageData]);
      setNewMessage('');
    } else if (!newMessage.trim()) {
      toast.warning('Please enter a message to send.');
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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
          {remoteStream ? (
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-900 flex items-center justify-center">
              <div className="text-center text-white">
                <div className="text-6xl mb-4">👤</div>
                <p className="text-lg">Waiting for other participant...</p>
                <p className="text-sm text-gray-400 mt-2">Video will appear here when connected</p>
              </div>
            </div>
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

        {/* End Call Button - Only for Doctors */}
        {isDoctor ? (
          <button
            onClick={endCallForAll}
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
    </div>
  );
};

export default MeetingInterface; 