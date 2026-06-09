import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import {
  HiOutlineArrowRight, HiOutlineClock,
  HiOutlineCheckCircle, HiOutlineLightningBolt, HiOutlineSparkles,
  HiOutlineStop, HiOutlineMicrophone, HiOutlineChartBar,
  HiOutlineVideoCamera, HiOutlineExclamation
} from 'react-icons/hi';

export default function InterviewSessionPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const textareaRef = useRef(null);
  const recognitionRef = useRef(null);
  const videoRef = useRef(null);

  const [interview, setInterview] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [answer, setAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);

  // Cheat Warning State
  const [warnings, setWarnings] = useState(3);
  const [cheated, setCheated] = useState(false);

  // Avatar and Camera States
  const [isAvatarSpeaking, setIsAvatarSpeaking] = useState(false);
  const [interviewerAvatar, setInterviewerAvatar] = useState('Neha');
  const [webcamStream, setWebcamStream] = useState(null);
  const [proctorWarning, setProctorWarning] = useState(null);

  // Refs for MediaPipe and Proctoring
  const landmarkerRef = useRef(null);
  const violationCounterRef = useRef(0);
  const lastViolationTypeRef = useRef(null);

  // Load avatar preferences
  useEffect(() => {
    const prefs = JSON.parse(localStorage.getItem('interview-preferences') || '{}');
    setInterviewerAvatar(prefs.interviewerAvatar || 'Neha');
  }, []);

  // Speech synthesis question speaker (with robust async voice loading)
  const speakQuestion = (text) => {
    if (!text) return;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      
      const setVoiceAndSpeak = () => {
        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
          if (interviewerAvatar === 'Neha') {
            const femaleVoice = voices.find(v => v.lang.includes('IN') && v.name.toLowerCase().includes('female'))
              || voices.find(v => v.name.toLowerCase().includes('female'))
              || voices.find(v => v.name.toLowerCase().includes('google') && v.name.toLowerCase().includes('zira'))
              || voices.find(v => v.lang.startsWith('en') && v.name.toLowerCase().includes('female'));
            if (femaleVoice) utterance.voice = femaleVoice;
          } else if (interviewerAvatar === 'Aditya') {
            const maleVoice = voices.find(v => v.lang.includes('IN') && v.name.toLowerCase().includes('male'))
              || voices.find(v => v.name.toLowerCase().includes('male'))
              || voices.find(v => v.name.toLowerCase().includes('google') && v.name.toLowerCase().includes('david'))
              || voices.find(v => v.lang.startsWith('en') && v.name.toLowerCase().includes('male'));
            if (maleVoice) utterance.voice = maleVoice;
          } else if (interviewerAvatar === 'RoboRecruit') {
            const robotVoice = voices.find(v => v.name.toLowerCase().includes('robot') || v.name.toLowerCase().includes('bot'))
              || voices.find(v => v.name.toLowerCase().includes('google') && v.name.toLowerCase().includes('david'))
              || voices.find(v => v.lang.startsWith('en') && v.name.toLowerCase().includes('male'));
            if (robotVoice) utterance.voice = robotVoice;
            utterance.pitch = 0.5;
            utterance.rate = 0.85;
          }
        }
        utterance.onstart = () => setIsAvatarSpeaking(true);
        utterance.onend = () => setIsAvatarSpeaking(false);
        utterance.onerror = () => setIsAvatarSpeaking(false);
        window.speechSynthesis.speak(utterance);
      };

      if (window.speechSynthesis.getVoices().length === 0) {
        window.speechSynthesis.onvoiceschanged = () => {
          setVoiceAndSpeak();
          window.speechSynthesis.onvoiceschanged = null;
        };
      } else {
        setVoiceAndSpeak();
      }
    }
  };

  // Speak when question loads
  useEffect(() => {
    if (currentQuestion && currentQuestion.questionText) {
      const timer = setTimeout(() => {
        speakQuestion(currentQuestion.questionText);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [currentQuestion]);

  // Cancel speech on unmount
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Request camera and setup stream
  useEffect(() => {
    let activeStream = null;
    const startWebcam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 320, height: 240, facingMode: 'user' },
          audio: false
        });
        activeStream = stream;
        setWebcamStream(stream);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error('Webcam access error:', err);
        toast.error('Could not activate webcam. Stay visible during the interview!');
      }
    };

    if (!loading && !completed && !cheated) {
      startWebcam();
    }

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [loading, completed, cheated]);

  // Bind webcam stream when video ref is ready
  useEffect(() => {
    if (webcamStream && videoRef.current) {
      videoRef.current.srcObject = webcamStream;
    }
  }, [webcamStream, videoRef]);

  // Initialize MediaPipe FaceLandmarker
  useEffect(() => {
    let active = true;
    const initLandmarker = async () => {
      try {
        const { FilesetResolver, FaceLandmarker } = await import('@mediapipe/tasks-vision');
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.8/wasm"
        );
        const landmarker = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker_with_blendshapes/float16/1/face_landmarker_with_blendshapes.task",
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numFaces: 2
        });
        if (active) {
          landmarkerRef.current = landmarker;
          console.log("MediaPipe FaceLandmarker initialized successfully.");
        }
      } catch (err) {
        console.error("Error initializing MediaPipe FaceLandmarker:", err);
      }
    };
    initLandmarker();
    return () => {
      active = false;
    };
  }, []);

  // Proctoring handler for MediaPipe results
  const handleProctoringResults = (results) => {
    let currentViolation = null;

    if (!results || !results.faceLandmarks || results.faceLandmarks.length === 0) {
      currentViolation = "NO_FACE";
    } else if (results.faceLandmarks.length > 1) {
      currentViolation = "MULTIPLE_FACES";
    } else {
      const landmarks = results.faceLandmarks[0];
      const nose = landmarks[4];
      const leftEye = landmarks[33];
      const rightEye = landmarks[263];

      if (nose && leftEye && rightEye) {
        // Yaw estimation
        const distLeft = Math.sqrt(Math.pow(nose.x - leftEye.x, 2) + Math.pow(nose.y - leftEye.y, 2));
        const distRight = Math.sqrt(Math.pow(nose.x - rightEye.x, 2) + Math.pow(nose.y - rightEye.y, 2));
        const horizontalRatio = distLeft / distRight;

        // Pitch estimation
        const forehead = landmarks[10];
        const chin = landmarks[152];
        let verticalRatio = 1.0;
        if (forehead && chin) {
          const distTop = Math.sqrt(Math.pow(nose.x - forehead.x, 2) + Math.pow(nose.y - forehead.y, 2));
          const distBottom = Math.sqrt(Math.pow(nose.x - chin.x, 2) + Math.pow(nose.y - chin.y, 2));
          verticalRatio = distTop / distBottom;
        }

        // Detect if looking away (turned left/right or tilted up/down)
        if (horizontalRatio < 0.45 || horizontalRatio > 2.2) {
          currentViolation = "LOOKING_AWAY";
        } else if (verticalRatio < 0.45 || verticalRatio > 2.2) {
          currentViolation = "LOOKING_AWAY";
        }
      }
    }

    if (currentViolation) {
      let msg = "";
      if (currentViolation === "NO_FACE") msg = "⚠️ Camera alert: No face detected! Remain in view.";
      else if (currentViolation === "MULTIPLE_FACES") msg = "⚠️ Proctor warning: Multiple people detected!";
      else if (currentViolation === "LOOKING_AWAY") msg = "⚠️ Attention warning: Keep your eyes on the screen!";

      setProctorWarning(msg);

      if (lastViolationTypeRef.current === currentViolation) {
        violationCounterRef.current += 1;
        // Trigger alert decrement if violation persists for ~3 seconds (12 detection frames)
        if (violationCounterRef.current >= 12) {
          violationCounterRef.current = 0;
          setWarnings(prev => {
            const nextWarnings = prev - 1;
            if (nextWarnings <= 0) {
              setCheated(true);
              toast.error('Penalty triggered: Account locked due to persistent proctoring violations!', { duration: 6000 });
              api.post('/users/penalty').catch(() => {});
              setTimeout(() => {
                localStorage.clear();
                window.location.href = '/login';
              }, 5000);
            } else {
              toast.error(`Proctoring violation recorded! Warnings remaining: ${nextWarnings}/3`, {
                duration: 4000,
                position: 'top-center',
                style: { background: '#ef4444', color: '#fff', border: '1px solid #dc2626' }
              });
            }
            return nextWarnings;
          });
        }
      } else {
        lastViolationTypeRef.current = currentViolation;
        violationCounterRef.current = 1;
      }
    } else {
      setProctorWarning(null);
      lastViolationTypeRef.current = null;
      if (violationCounterRef.current > 0) {
        violationCounterRef.current -= 1;
      }
    }
  };

  // MediaPipe detection animation loop
  useEffect(() => {
    let animationFrameId = null;
    let lastDetectionTime = 0;

    const detect = async (time) => {
      if (!webcamStream || !landmarkerRef.current || !videoRef.current || completed || cheated) {
        animationFrameId = requestAnimationFrame(detect);
        return;
      }

      // Throttle detection to approx 4 times per second (every 250ms)
      if (time - lastDetectionTime < 250) {
        animationFrameId = requestAnimationFrame(detect);
        return;
      }
      lastDetectionTime = time;

      const video = videoRef.current;
      if (video.readyState >= 2) {
        try {
          const results = landmarkerRef.current.detectForVideo(video, time);
          handleProctoringResults(results);
        } catch (err) {
          console.error("Proctoring detection loop error:", err);
        }
      }

      animationFrameId = requestAnimationFrame(detect);
    };

    if (webcamStream) {
      animationFrameId = requestAnimationFrame(detect);
    }

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [webcamStream, completed, cheated]);



  // Speech Recognition State
  const [isListening, setIsListening] = useState(false);

  // Speech Recognition Setup
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onresult = (event) => {
        const transcript = event.results[event.results.length - 1][0].transcript;
        setAnswer(prev => prev + (prev ? ' ' : '') + transcript);
      };

      rec.onerror = (e) => {
        console.error('Speech recognition error', e);
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast.error('Speech recognition is not supported in this browser. Please use Chrome, Safari or Edge.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        toast.success('Listening... Speak clearly into your microphone.');
      } catch (err) {
        toast.error('Failed to start speech recognition');
      }
    }
  };

  // Visibility and Blur Event Listener (Cheat Detection)
  useEffect(() => {
    if (completed || loading || cheated) return;

    let ignoreFirstBlur = true;

    const triggerCheatWarning = async () => {
      if (isListening && recognitionRef.current) {
        recognitionRef.current.stop();
        setIsListening(false);
      }

      setWarnings(prev => {
        const nextWarnings = prev - 1;
        if (nextWarnings <= 0) {
          setCheated(true);
          toast.error('Penalty triggered: Account locked for 24 hours!', { duration: 6000 });
          api.post('/users/penalty').catch(() => {});
          
          setTimeout(() => {
            localStorage.clear();
            window.location.href = '/login';
          }, 5000);
        } else {
          toast((t) => (
            <span className="flex flex-col gap-1">
              <span className="font-bold text-amber-500">Suspicious Tab Switch/Blur Detected!</span>
              <span className="text-sm">Please stay focused on the interview. Remaining warnings: {nextWarnings}/3.</span>
            </span>
          ), {
            style: {
              border: '1px solid #d97706',
              padding: '16px',
              color: '#fff',
              background: '#1e293b',
            },
            icon: '⚠️',
            duration: 5000,
          });
        }
        return nextWarnings;
      });
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        triggerCheatWarning();
      }
    };

    const handleWindowBlur = () => {
      if (ignoreFirstBlur) {
        ignoreFirstBlur = false;
        return;
      }
      triggerCheatWarning();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [completed, loading, cheated, isListening]);

  // Timer
  useEffect(() => {
    if (completed || loading || cheated) return;
    const timer = setInterval(() => setTimeElapsed(t => t + 1), 1000);
    return () => clearInterval(timer);
  }, [completed, loading, cheated]);

  // Load interview
  useEffect(() => {
    const loadInterview = async () => {
      try {
        const res = await api.get(`/interviews/${id}`);
        setInterview(res.data);
        setTotalQuestions(res.data.totalQuestions || 5);

        // Get first question
        const qRes = await api.get(`/interviews/${id}/next-question`);
        setCurrentQuestion(qRes.data);
        setCurrentIndex(1);
      } catch (err) {
        toast.error('Failed to load interview');
        navigate('/interviews');
      } finally {
        setLoading(false);
      }
    };
    loadInterview();
  }, [id, navigate]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSubmitAnswer = async () => {
    if (!answer.trim()) {
      toast.error('Please provide an answer');
      return;
    }

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    setSubmitting(true);
    setFeedback(null);

    try {
      const res = await api.post(`/interviews/${id}/submit-answer`, {
        interviewQuestionId: currentQuestion.interviewQuestionId,
        answerText: answer,
        timeTakenSeconds: timeElapsed,
      });

      setFeedback(res.data.feedback);
      toast.success('Answer evaluated! ✨');
    } catch (err) {
      toast.error('Failed to submit answer');
    } finally {
      setSubmitting(false);
    }
  };

  const handleNextQuestion = async () => {
    setFeedback(null);
    setAnswer('');
    setTimeElapsed(0);

    if (currentIndex >= totalQuestions) {
      try {
        setCompleted(true);
        await api.post(`/interviews/${id}/complete`);
        toast.success('Interview completed! 🎉');
        navigate(`/interviews/${id}/results`);
      } catch (err) {
        setCompleted(false);
        toast.error('Failed to complete interview');
      }
      return;
    }

    try {
      const res = await api.get(`/interviews/${id}/next-question`);
      setCurrentQuestion(res.data);
      setCurrentIndex(prev => prev + 1);
      textareaRef.current?.focus();
    } catch (err) {
      toast.error('Failed to load next question');
    }
  };

  const handleEndInterview = async () => {
    try {
      setCompleted(true);
      await api.post(`/interviews/${id}/complete`);
      toast.success('Interview ended!');
      navigate(`/interviews/${id}/results`);
    } catch (err) {
      setCompleted(false);
      toast.error('Failed to end interview');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-lg">Loading interview...</p>
        </div>
      </div>
    );
  }

  if (cheated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-900 p-4">
        <div className="glass-card p-12 max-w-lg w-full text-center border-red-500/30 animate-fade-in">
          <div className="w-24 h-24 rounded-full bg-red-500/10 border border-red-500/20 mx-auto flex items-center justify-center mb-6 shadow-2xl shadow-red-500/10">
            <HiOutlineStop className="w-12 h-12 text-red-500 animate-pulse" />
          </div>
          <h1 className="text-3xl font-display font-bold text-red-500 mb-3">Penalty Triggered!</h1>
          <p className="text-gray-400 mb-8 leading-relaxed">
            Suspicious activities or proctoring warnings exceeded limitations.
            Your test has been terminated and your account has been temporarily locked for 24 hours.
            You will be redirected automatically.
          </p>
          <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
            <div className="h-full bg-red-500 animate-pulse" style={{ width: '100%' }} />
          </div>
        </div>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-900">
        <div className="flex flex-col items-center gap-4 animate-fade-in">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-lg font-medium">Analyzing results and loading feedback...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-900 flex flex-col">
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        @keyframes ripple {
          0% { transform: scale(0.95); opacity: 0.5; }
          50% { transform: scale(1.08); opacity: 0.8; }
          100% { transform: scale(1.2); opacity: 0; }
        }
        .avatar-float {
          animation: float 3s ease-in-out infinite;
        }
        .ripple-ring-1 {
          animation: ripple 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        .ripple-ring-2 {
          animation: ripple 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          animation-delay: 0.6s;
        }
      `}</style>

      {/* Top Bar */}
      <header className="h-16 bg-surface-800/60 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-4 lg:px-8">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
              <span className="text-xs font-bold text-white">IQ</span>
            </div>
            <span className="text-sm font-display font-semibold text-white hidden sm:block">Mock Interview</span>
          </div>
          <div className="h-6 w-px bg-white/10" />
          <div className="flex items-center gap-2">
            <span className="badge-info text-xs">{interview?.jobRole}</span>
            <span className="badge-warning text-xs">{interview?.difficulty}</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Warning Indicator */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold">
            Warnings: {warnings}/3
          </div>
          {/* Timer */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
            <HiOutlineClock className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-mono text-white">{formatTime(timeElapsed)}</span>
          </div>
          {/* Progress */}
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-sm text-gray-400">
              <span className="text-white font-semibold">{currentIndex}</span> / {totalQuestions}
            </span>
            <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full gradient-bg rounded-full transition-all duration-500"
                style={{ width: `${(currentIndex / totalQuestions) * 100}%` }}
              />
            </div>
          </div>
          {/* End Interview */}
          <button
            id="end-interview-btn"
            onClick={handleEndInterview}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all text-sm"
          >
            <HiOutlineStop className="w-4 h-4" />
            <span className="hidden sm:inline">End</span>
          </button>
        </div>
      </header>

      {/* Main Content: Split Grid Layout */}
      <div className="flex-1 max-w-7xl mx-auto w-full p-4 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Questions, Answers & Feedback */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Question Card */}
            <div className="glass-card p-8 animate-fade-in">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-primary-500/10 flex-shrink-0">
                  <HiOutlineLightningBolt className="w-6 h-6 text-primary-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider font-semibold">Question {currentIndex}</p>
                  <h2 className="text-xl font-display font-semibold text-white leading-relaxed">
                    {currentQuestion?.questionText || 'Loading question...'}
                  </h2>
                  {currentQuestion?.category && (
                    <span className="badge-info mt-3 inline-block text-xs">{currentQuestion.category}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Answer / Input Card or Feedback Card */}
            {!feedback ? (
              <div className="space-y-4 animate-slide-up">
                <div className="glass-card p-6">
                  <label htmlFor="answer-textarea" className="block text-sm font-medium text-gray-300 mb-3">
                    Your Answer
                  </label>
                  <textarea
                    ref={textareaRef}
                    id="answer-textarea"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Provide your answer here... You can type or use the voice dictation option below."
                    rows={8}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-gray-600 resize-none focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all text-sm leading-relaxed"
                  />
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-600">{answer.length} characters</span>
                      <button
                        type="button"
                        onClick={toggleListening}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                          isListening
                            ? 'bg-red-500/20 border-red-500/30 text-red-400 animate-pulse'
                            : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                        }`}
                      >
                        <HiOutlineMicrophone className="w-4 h-4" />
                        {isListening ? 'Stop Listening' : 'Speak Answer'}
                      </button>
                    </div>
                    <button
                      id="submit-answer-btn"
                      onClick={handleSubmitAnswer}
                      disabled={submitting || !answer.trim()}
                      className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Evaluating...
                        </>
                      ) : (
                        <>
                          <HiOutlineSparkles className="w-4 h-4" />
                          Submit Answer
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Feedback Section */
              <div className="space-y-4 animate-fade-in">
                <div className="glass-card p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <HiOutlineSparkles className="w-5 h-5 text-primary-400" />
                    <h3 className="text-lg font-semibold text-white">AI Feedback</h3>
                  </div>

                  {/* Score Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
                    {[
                      { label: 'Accuracy', score: feedback.technicalAccuracy },
                      { label: 'Completeness', score: feedback.completeness },
                      { label: 'Communication', score: feedback.communication },
                      { label: 'Relevance', score: feedback.relevance },
                      { label: 'Overall', score: feedback.overallScore },
                    ].map(({ label, score }) => (
                      <div key={label} className="p-3 rounded-xl bg-white/5 text-center">
                        <p className={`text-2xl font-bold ${
                          score >= 8 ? 'text-emerald-400' :
                          score >= 6 ? 'text-amber-400' : 'text-red-400'
                        }`}>
                          {score}/10
                        </p>
                        <p className="text-xs text-gray-500 mt-1">{label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Strengths & Weaknesses */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    {feedback.strengths && (
                      <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                        <h4 className="text-sm font-semibold text-emerald-400 mb-2">💪 Strengths</h4>
                        <p className="text-sm text-gray-300 leading-relaxed">{feedback.strengths}</p>
                      </div>
                    )}
                    {feedback.weaknesses && (
                      <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/10">
                        <h4 className="text-sm font-semibold text-red-400 mb-2">📌 Areas to Improve</h4>
                        <p className="text-sm text-gray-300 leading-relaxed">{feedback.weaknesses}</p>
                      </div>
                    )}
                  </div>

                  {feedback.improvements && (
                    <div className="p-4 rounded-xl bg-primary-500/5 border border-primary-500/10 mb-6">
                      <h4 className="text-sm font-semibold text-primary-400 mb-2">💡 Suggestions</h4>
                      <p className="text-sm text-gray-300 leading-relaxed">{feedback.improvements}</p>
                    </div>
                  )}

                  {/* Next Button */}
                  <button
                    id="next-question-btn"
                    onClick={handleNextQuestion}
                    className="btn-primary w-full flex items-center justify-center gap-2"
                  >
                    {currentIndex >= totalQuestions ? (
                      <>
                        <HiOutlineCheckCircle className="w-5 h-5" />
                        Finish Interview
                      </>
                    ) : (
                      <>
                        Next Question
                        <HiOutlineArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Speaking Avatar and Webcam Feed */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-8">
            
            {/* AI Interviewer Avatar Card */}
            <div className="glass-card p-6 text-center border-white/10 flex flex-col items-center justify-center gap-4 relative overflow-hidden">
              <div className="absolute top-3 left-3 bg-white/5 border border-white/10 text-xs px-2.5 py-1 rounded-full text-gray-400">
                Interviewer
              </div>
              
              <div className="mt-4">
                <InterviewerAvatar name={interviewerAvatar} isSpeaking={isAvatarSpeaking} />
              </div>

              <div className="mt-2 text-center">
                <h3 className="text-lg font-display font-semibold text-white">{interviewerAvatar}</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {interviewerAvatar === 'Neha' && 'Indian Recruiter (Female)'}
                  {interviewerAvatar === 'Aditya' && 'Tech Lead (Male)'}
                  {interviewerAvatar === 'RoboRecruit' && 'AI Robot Coach'}
                </p>
              </div>

              {/* Sound visualizer frequencies */}
              <div className="w-full flex justify-center py-2">
                {isAvatarSpeaking ? (
                  <div className="flex items-end justify-center gap-1.5 h-6">
                    <div className="w-1 bg-primary-400 rounded-full animate-bounce h-5" style={{ animationDelay: '0.1s', animationDuration: '0.6s' }} />
                    <div className="w-1 bg-sky-400 rounded-full animate-bounce h-3" style={{ animationDelay: '0.2s', animationDuration: '0.8s' }} />
                    <div className="w-1 bg-teal-400 rounded-full animate-bounce h-6" style={{ animationDelay: '0.3s', animationDuration: '0.5s' }} />
                    <div className="w-1 bg-blue-500 rounded-full animate-bounce h-4" style={{ animationDelay: '0.4s', animationDuration: '0.7s' }} />
                    <div className="w-1 bg-primary-500 rounded-full animate-bounce h-2" style={{ animationDelay: '0.5s', animationDuration: '0.6s' }} />
                  </div>
                ) : (
                  <div className="flex items-end justify-center gap-1.5 h-6 opacity-30">
                    <div className="w-1 h-1.5 bg-gray-500 rounded-full" />
                    <div className="w-1 h-1.5 bg-gray-500 rounded-full" />
                    <div className="w-1 h-1.5 bg-gray-500 rounded-full" />
                    <div className="w-1 h-1.5 bg-gray-500 rounded-full" />
                    <div className="w-1 h-1.5 bg-gray-500 rounded-full" />
                  </div>
                )}
              </div>
            </div>

            {/* Candidate Webcam Feed Card */}
            <div className="glass-card p-4 border-white/10 relative overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-gray-400 flex items-center gap-1.5">
                  <HiOutlineVideoCamera className="w-4 h-4" />
                  Candidate Feed
                </span>
                {webcamStream && (
                  <div className="bg-red-500/20 border border-red-500/40 text-red-400 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 z-10 animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                    LIVE
                  </div>
                )}
              </div>

              {/* Video elements & warnings */}
              <div className="relative w-full aspect-video rounded-xl bg-black/40 overflow-hidden border border-white/5">
                {webcamStream ? (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover -scale-x-100"
                    />
                    
                    {/* Proctoring Warning Overlay */}
                    {proctorWarning && (
                      <div className="absolute inset-0 bg-red-950/75 backdrop-blur-sm flex items-center justify-center p-4 text-center z-20 animate-fade-in border border-red-500/30">
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-10 h-10 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center animate-bounce">
                            <HiOutlineExclamation className="w-6 h-6 text-red-400" />
                          </div>
                          <p className="text-sm font-bold text-red-400 leading-tight">
                            {proctorWarning}
                          </p>
                          <p className="text-[10px] text-gray-400">
                            Avoid penalty lockouts by maintaining visual focus.
                          </p>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  /* Camera permission / inactive placeholder */
                  <div className="w-full h-full flex flex-col items-center justify-center text-center p-6 bg-white/5 border border-dashed border-white/10 rounded-xl">
                    <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-3">
                      <HiOutlineExclamation className="w-5 h-5 text-amber-500" />
                    </div>
                    <p className="text-xs font-semibold text-white">Camera Access Required</p>
                    <p className="text-[10px] text-gray-500 mt-1 max-w-[200px]">
                      Enable webcam access to proceed. Stay visible to avoid automated proctoring strikes.
                    </p>
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}

// Inline Interviewer Avatar Graphic Components
function InterviewerAvatar({ name, isSpeaking }) {
  if (name === 'Neha') {
    return (
      <div className={`relative ${isSpeaking ? 'avatar-float' : ''}`}>
        {isSpeaking && (
          <>
            <div className="absolute inset-0 rounded-full bg-teal-500/10 border-2 border-teal-500/20 ripple-ring-1 z-0" />
            <div className="absolute inset-0 rounded-full bg-teal-500/10 border-2 border-teal-500/20 ripple-ring-2 z-0" />
          </>
        )}
        <svg viewBox="0 0 200 200" className="w-36 h-36 mx-auto drop-shadow-2xl relative z-10">
          <defs>
            <linearGradient id="nehaBg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#1e3a8a" />
              <stop offset="100%" stopColor="#0d9488" />
            </linearGradient>
            <linearGradient id="nehaSkin" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f3b08c" />
              <stop offset="100%" stopColor="#e28c68" />
            </linearGradient>
            <linearGradient id="nehaBlazer" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#0f766e" />
              <stop offset="100%" stopColor="#115e59" />
            </linearGradient>
          </defs>
          <rect width="200" height="200" rx="40" fill="url(#nehaBg)" />
          <path d="M 50 150 C 50 80, 150 80, 150 150" fill="#0f172a" />
          <rect x="90" y="125" width="20" height="25" fill="#e28c68" rx="5" />
          <ellipse cx="100" cy="95" rx="40" ry="45" fill="url(#nehaSkin)" />
          <path d="M 60 90 C 55 60, 145 60, 140 90 C 130 55, 70 55, 60 90 Z" fill="#0f172a" />
          <path d="M 60 90 C 70 80, 95 80, 100 95 C 105 80, 130 80, 140 90 C 145 100, 140 120, 140 120 C 140 120, 150 100, 145 90" fill="#0f172a" />
          <circle cx="85" cy="95" r="4" fill="#1e293b" />
          <circle cx="115" cy="95" r="4" fill="#1e293b" />
          <path d="M 77 88 Q 85 84 93 89" stroke="#0f172a" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M 107 89 Q 115 84 123 88" stroke="#0f172a" strokeWidth="2" fill="none" strokeLinecap="round" />
          <circle cx="85" cy="95" r="12" stroke="#f59e0b" strokeWidth="2" fill="none" opacity="0.9" />
          <circle cx="115" cy="95" r="12" stroke="#f59e0b" strokeWidth="2" fill="none" opacity="0.9" />
          <line x1="97" y1="95" x2="103" y2="95" stroke="#f59e0b" strokeWidth="2" />
          <path d="M 100 95 L 98 105 L 102 105 Z" fill="#d97706" opacity="0.4" />
          <path d={isSpeaking ? "M 90 115 Q 100 125 110 115 Z" : "M 92 114 Q 100 120 108 114"} 
                stroke="#e11d48" strokeWidth="3" fill={isSpeaking ? "#be123c" : "none"} strokeLinecap="round" />
          <circle cx="100" cy="82" r="2.5" fill="#dc2626" />
          <path d="M 80 150 L 100 170 L 120 150 Z" fill="#f8fafc" />
          <path d="M 40 200 C 40 160, 70 145, 100 145 C 130 145, 160 160, 160 200 Z" fill="url(#nehaBlazer)" opacity="0.95" />
        </svg>
      </div>
    );
  }

  if (name === 'Aditya') {
    return (
      <div className={`relative ${isSpeaking ? 'avatar-float' : ''}`}>
        {isSpeaking && (
          <>
            <div className="absolute inset-0 rounded-full bg-indigo-500/10 border-2 border-indigo-500/20 ripple-ring-1 z-0" />
            <div className="absolute inset-0 rounded-full bg-indigo-500/10 border-2 border-indigo-500/20 ripple-ring-2 z-0" />
          </>
        )}
        <svg viewBox="0 0 200 200" className="w-36 h-36 mx-auto drop-shadow-2xl relative z-10">
          <defs>
            <linearGradient id="adityaBg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#1e3a8a" />
              <stop offset="100%" stopColor="#4f46e5" />
            </linearGradient>
            <linearGradient id="adityaSkin" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f3b08c" />
              <stop offset="100%" stopColor="#d5825d" />
            </linearGradient>
            <linearGradient id="adityaBlazer" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#334155" />
            </linearGradient>
          </defs>
          <rect width="200" height="200" rx="40" fill="url(#adityaBg)" />
          <path d="M 55 90 C 55 50, 145 50, 145 90" fill="#020617" />
          <rect x="90" y="130" width="20" height="20" fill="#d5825d" />
          <ellipse cx="100" cy="98" rx="38" ry="42" fill="url(#adityaSkin)" />
          <path d="M 60 85 Q 100 50 140 80 Q 145 60 130 55 Q 100 50 65 65 Q 58 75 60 85 Z" fill="#020617" />
          <path d="M 64 96 C 64 125, 136 125, 136 96 C 136 112, 126 138, 100 138 C 74 138, 64 112, 64 96 Z" fill="#020617" opacity="0.95" />
          <path d="M 80 112 Q 100 108 120 112 Q 100 115 80 112" fill="#020617" />
          <circle cx="85" cy="94" r="3.5" fill="#0f172a" />
          <circle cx="115" cy="94" r="3.5" fill="#0f172a" />
          <path d="M 75 86 Q 85 81 95 86" stroke="#020617" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M 105 86 Q 115 81 125 86" stroke="#020617" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <rect x="73" y="87" width="24" height="15" rx="4" stroke="#0284c7" strokeWidth="2" fill="none" />
          <rect x="103" y="87" width="24" height="15" rx="4" stroke="#0284c7" strokeWidth="2" fill="none" />
          <line x1="97" y1="94" x2="103" y2="94" stroke="#0284c7" strokeWidth="2" />
          <path d="M 100 94 L 98 104 L 102 104 Z" fill="#9a3412" opacity="0.3" />
          <path d={isSpeaking ? "M 92 118 Q 100 126 108 118 Z" : "M 93 118 Q 100 122 107 118"} 
                stroke="#dc2626" strokeWidth="2.5" fill={isSpeaking ? "#991b1b" : "none"} strokeLinecap="round" />
          <path d="M 80 145 L 100 165 L 120 145 Z" fill="#bae6fd" />
          <path d="M 40 200 C 40 155, 68 140, 100 140 C 132 140, 160 155, 160 200 Z" fill="url(#adityaBlazer)" opacity="0.95" />
        </svg>
      </div>
    );
  }

  // RoboRecruit
  return (
    <div className={`relative ${isSpeaking ? 'avatar-float' : ''}`}>
      {isSpeaking && (
        <>
          <div className="absolute inset-0 rounded-full bg-cyan-500/10 border-2 border-cyan-500/20 ripple-ring-1 z-0" />
          <div className="absolute inset-0 rounded-full bg-cyan-500/10 border-2 border-cyan-500/20 ripple-ring-2 z-0" />
        </>
      )}
      <svg viewBox="0 0 200 200" className="w-36 h-36 mx-auto drop-shadow-2xl relative z-10">
        <defs>
          <linearGradient id="roboBg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>
          <linearGradient id="roboMetal" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#cbd5e1" />
            <stop offset="100%" stopColor="#64748b" />
          </linearGradient>
        </defs>
        <rect width="200" height="200" rx="40" fill="url(#roboBg)" />
        <rect x="97" y="20" width="6" height="30" fill="#94a3b8" />
        <circle cx="100" cy="18" r="7" fill={isSpeaking ? "#22d3ee" : "#0891b2"} className={isSpeaking ? "animate-pulse" : ""} />
        <rect x="42" y="70" width="10" height="40" rx="4" fill="#475569" />
        <rect x="148" y="70" width="10" height="40" rx="4" fill="#475569" />
        <rect x="85" y="130" width="30" height="25" fill="#475569" rx="2" />
        <line x1="85" y1="140" x2="115" y2="140" stroke="#1e293b" strokeWidth="2" />
        <line x1="85" y1="146" x2="115" y2="146" stroke="#1e293b" strokeWidth="2" />
        <path d="M 50 200 C 50 160, 70 150, 100 150 C 130 150, 150 160, 150 200 Z" fill="url(#roboMetal)" />
        <circle cx="100" cy="175" r="10" fill="#0891b2" opacity="0.8" />
        <rect x="52" y="50" width="96" height="85" rx="24" fill="url(#roboMetal)" stroke="#94a3b8" strokeWidth="2" />
        <rect x="62" y="65" width="76" height="36" rx="10" fill="#0f172a" stroke="#334155" strokeWidth="2" />
        {isSpeaking ? (
          <>
            <path d="M 70 83 Q 100 75 130 83" stroke="#22d3ee" strokeWidth="4" fill="none" strokeLinecap="round" className="animate-pulse" />
            <circle cx="80" cy="83" r="3" fill="#22d3ee" className="animate-ping" />
            <circle cx="120" cy="83" r="3" fill="#22d3ee" className="animate-ping" />
          </>
        ) : (
          <>
            <line x1="72" y1="83" x2="90" y2="83" stroke="#06b6d4" strokeWidth="3" strokeLinecap="round" />
            <line x1="110" y1="83" x2="128" y2="83" stroke="#06b6d4" strokeWidth="3" strokeLinecap="round" />
          </>
        )}
        <g transform="translate(75, 110)">
          {isSpeaking ? (
            <rect x="0" y="-5" width="50" height="10" rx="3" fill="#22d3ee" className="animate-pulse" />
          ) : (
            <line x1="5" y1="0" x2="45" y2="0" stroke="#0891b2" strokeWidth="3" strokeLinecap="round" />
          )}
        </g>
      </svg>
    </div>
  );
}
