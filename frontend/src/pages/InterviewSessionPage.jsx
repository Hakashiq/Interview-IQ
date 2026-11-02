import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import {
  HiOutlineArrowRight, HiOutlineClock,
  HiOutlineCheckCircle, HiOutlineLightningBolt, HiOutlineSparkles,
  HiOutlineStop, HiOutlineMicrophone, HiOutlineChartBar,
  HiOutlineVideoCamera, HiOutlineExclamation, HiOutlineVolumeUp
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
        const distLeft = Math.sqrt(Math.pow(nose.x - leftEye.x, 2) + Math.pow(nose.y - leftEye.y, 2));
        const distRight = Math.sqrt(Math.pow(nose.x - rightEye.x, 2) + Math.pow(nose.y - rightEye.y, 2));
        const horizontalRatio = distLeft / distRight;

        const forehead = landmarks[10];
        const chin = landmarks[152];
        let verticalRatio = 1.0;
        if (forehead && chin) {
          const distTop = Math.sqrt(Math.pow(nose.x - forehead.x, 2) + Math.pow(nose.y - forehead.y, 2));
          const distBottom = Math.sqrt(Math.pow(nose.x - chin.x, 2) + Math.pow(nose.y - chin.y, 2));
          verticalRatio = distTop / distBottom;
        }

        if (horizontalRatio < 0.45 || horizontalRatio > 2.2) {
          currentViolation = "LOOKING_AWAY";
        } else if (verticalRatio < 0.45 || verticalRatio > 2.2) {
          currentViolation = "LOOKING_AWAY";
        }
      }
    }

    if (currentViolation) {
      let msg = "";
      if (currentViolation === "NO_FACE") msg = "Camera alert: No face detected. Remain in view.";
      else if (currentViolation === "MULTIPLE_FACES") msg = "Proctor warning: Multiple people detected in frame.";
      else if (currentViolation === "LOOKING_AWAY") msg = "Attention alert: Maintain eye contact with the screen.";

      setProctorWarning(msg);

      if (lastViolationTypeRef.current === currentViolation) {
        violationCounterRef.current += 1;
        if (violationCounterRef.current >= 12) {
          violationCounterRef.current = 0;
          setWarnings(prev => {
            const nextWarnings = prev - 1;
            if (nextWarnings <= 0) {
              setCheated(true);
              toast.error('Session terminated: Persistent proctoring violations recorded.', { duration: 6000 });
              api.post('/users/penalty').catch(() => {});
              setTimeout(() => {
                localStorage.clear();
                window.location.href = '/login';
              }, 5000);
            } else {
              toast.error(`Proctoring violation recorded. Remaining warnings: ${nextWarnings}/3`, {
                duration: 4000,
                position: 'top-center'
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
        toast.success('Dictation active. Speak clearly into your microphone.');
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
          toast.error('Penalty triggered: Account locked for 24 hours.', { duration: 6000 });
          api.post('/users/penalty').catch(() => {});
          
          setTimeout(() => {
            localStorage.clear();
            window.location.href = '/login';
          }, 5000);
        } else {
          toast((t) => (
            <div className="flex flex-col gap-1">
              <span className="font-semibold text-amber-900">Attention: Tab switch or window blur detected</span>
              <span className="text-xs text-amber-700">Please keep full focus on the interview stage. Warnings remaining: {nextWarnings}/3</span>
            </div>
          ), {
            style: {
              border: '1px solid #fde68a',
              padding: '14px 16px',
              color: '#92400e',
              background: '#fffbeb',
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
      toast.error('Please provide an answer before submitting');
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
      toast.success('Answer evaluated successfully ✨');
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
      toast.success('Interview ended');
      navigate(`/interviews/${id}/results`);
    } catch (err) {
      setCompleted(false);
      toast.error('Failed to end interview');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-porcelain-50">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <div>
            <p className="text-slate-800 font-semibold text-base">Preparing Interview Studio</p>
            <p className="text-slate-400 text-xs mt-1">Calibrating question set & AI proctoring services...</p>
          </div>
        </div>
      </div>
    );
  }

  if (cheated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-porcelain-50 p-4">
        <div className="bg-white border border-rose-200 rounded-2xl p-10 max-w-lg w-full text-center shadow-subtle animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-rose-50 border border-rose-200 mx-auto flex items-center justify-center mb-5 text-rose-600">
            <HiOutlineStop className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-display font-bold text-slate-900 mb-2">Session Terminated</h1>
          <p className="text-slate-600 text-sm mb-6 leading-relaxed">
            Persistent proctoring or tab-switching violations exceeded the threshold limit.
            Your session has been stopped and access temporarily locked for 24 hours.
          </p>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div className="h-full bg-rose-500 animate-pulse w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-porcelain-50">
        <div className="flex flex-col items-center gap-4 text-center animate-fade-in">
          <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <div>
            <p className="text-slate-800 font-semibold text-base">Generating Performance Report</p>
            <p className="text-slate-400 text-xs mt-1">Synthesizing multidimensional feedback and metrics...</p>
          </div>
        </div>
      </div>
    );
  }

  const avatarLabels = {
    Neha: { title: 'Neha', subtitle: 'Technical Recruiter • Indian English' },
    Aditya: { title: 'Aditya', subtitle: 'Staff Engineer • Tech Lead Persona' },
    RoboRecruit: { title: 'RoboRecruit', subtitle: 'Algorithmic Evaluator • Precise Persona' },
  };

  const personaMeta = avatarLabels[interviewerAvatar] || avatarLabels.Neha;

  return (
    <div className="min-h-screen bg-porcelain-50 flex flex-col font-sans text-slate-800 selection:bg-blue-100 selection:text-blue-900">
      {/* Top Focus Studio Bar */}
      <header className="h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/90 flex items-center justify-between px-4 sm:px-6 lg:px-8 sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              IQ
            </div>
            <div>
              <span className="text-sm font-semibold text-slate-900 hidden sm:inline-block">Interview Studio</span>
              <span className="text-[11px] text-slate-400 block sm:hidden font-medium">Studio</span>
            </div>
          </div>
          <div className="h-4 w-px bg-slate-200 hidden sm:block" />
          <div className="flex items-center gap-2">
            <span className="badge-info text-xs">{interview?.jobRole}</span>
            <span className="badge-neutral text-xs uppercase">{interview?.difficulty}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Warnings Counter */}
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border ${
            warnings === 3
              ? 'bg-slate-50 border-slate-200 text-slate-600'
              : warnings === 2
              ? 'bg-amber-50 border-amber-200 text-amber-700'
              : 'bg-rose-50 border-rose-200 text-rose-700 animate-pulse'
          }`}>
            <span>Proctor:</span>
            <span className="font-mono font-bold">{warnings}/3 strikes</span>
          </div>

          {/* Time Elapsed */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-slate-100/90 border border-slate-200/80 text-slate-700">
            <HiOutlineClock className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-xs font-mono font-semibold">{formatTime(timeElapsed)}</span>
          </div>

          {/* Progress */}
          <div className="hidden md:flex items-center gap-2.5 pl-1">
            <span className="text-xs font-mono text-slate-500">
              <strong className="text-slate-900 font-bold">{currentIndex}</strong>/{totalQuestions}
            </span>
            <div className="w-20 h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-300"
                style={{ width: `${(currentIndex / totalQuestions) * 100}%` }}
              />
            </div>
          </div>

          {/* End Button */}
          <button
            id="end-interview-btn"
            onClick={handleEndInterview}
            className="btn-ghost text-xs py-1.5 px-2.5 text-rose-600 hover:bg-rose-50 hover:text-rose-700 flex items-center gap-1 font-semibold rounded-lg transition-colors"
            title="Conclude current interview session"
          >
            <HiOutlineStop className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">End Session</span>
          </button>
        </div>
      </header>

      {/* Main Studio Arena */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Question Prompt & Response Form */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Question Prompt Card */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-xs relative overflow-hidden animate-fade-in">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Question {currentIndex} of {totalQuestions}
                  </span>
                  {currentQuestion?.category && (
                    <span className="badge-neutral text-[11px]">{currentQuestion.category}</span>
                  )}
                </div>
                <button
                  onClick={() => speakQuestion(currentQuestion?.questionText)}
                  className={`text-xs px-2.5 py-1 rounded-md border flex items-center gap-1.5 font-medium transition-all ${
                    isAvatarSpeaking
                      ? 'bg-blue-50 border-blue-200 text-blue-700 shadow-xs'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-600'
                  }`}
                  title="Play audio pronunciation"
                >
                  <HiOutlineVolumeUp className={`w-3.5 h-3.5 ${isAvatarSpeaking ? 'animate-bounce' : ''}`} />
                  <span>{isAvatarSpeaking ? 'Speaking...' : 'Listen'}</span>
                </button>
              </div>

              <h2 className="text-xl sm:text-2xl font-display font-semibold text-slate-900 leading-snug">
                {currentQuestion?.questionText || 'Loading question content...'}
              </h2>
            </div>

            {/* Answer Input or Feedback View */}
            {!feedback ? (
              <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4 animate-fade-in">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <label htmlFor="answer-textarea" className="text-sm font-semibold text-slate-900">
                      Your Response
                    </label>
                    <span className="text-xs text-slate-400 font-mono">
                      ({answer.length} chars)
                    </span>
                  </div>

                  {/* Speech Dictation Button */}
                  <button
                    type="button"
                    onClick={toggleListening}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                      isListening
                        ? 'bg-rose-50 border-rose-300 text-rose-700 animate-pulse'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                    }`}
                  >
                    <HiOutlineMicrophone className={`w-3.5 h-3.5 ${isListening ? 'text-rose-600' : 'text-slate-500'}`} />
                    <span>{isListening ? 'Listening...' : 'Voice Dictation'}</span>
                  </button>
                </div>

                <div className="relative">
                  <textarea
                    ref={textareaRef}
                    id="answer-textarea"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Structure your answer clearly. Mention architectural decisions, edge cases, trade-offs, and reasoning..."
                    rows={8}
                    className="w-full bg-slate-50/70 border border-slate-200 rounded-xl p-4 font-mono text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all leading-relaxed resize-y"
                  />
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                  <p className="text-xs text-slate-400">
                    💡 Tip: Be concise, cite concrete metrics, and explain technical rationales.
                  </p>
                  <button
                    id="submit-answer-btn"
                    onClick={handleSubmitAnswer}
                    disabled={submitting || !answer.trim()}
                    className="btn-primary w-full sm:w-auto px-6 py-2.5 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
                  >
                    {submitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Evaluating...</span>
                      </>
                    ) : (
                      <>
                        <HiOutlineSparkles className="w-4 h-4" />
                        <span>Submit Answer</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              /* Post-Answer Evaluation Card */
              <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-7 shadow-xs space-y-6 animate-fade-in">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                      <HiOutlineSparkles className="w-4 h-4" />
                    </span>
                    <div>
                      <h3 className="text-base font-semibold text-slate-900">AI Evaluation Feedback</h3>
                      <p className="text-xs text-slate-500">Multidimensional grading by our assessment engine</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-500 block">Overall Score</span>
                    <span className="text-2xl font-display font-bold text-blue-600">
                      {feedback.overallScore}/10
                    </span>
                  </div>
                </div>

                {/* Score Matrix */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: 'Accuracy', score: feedback.technicalAccuracy },
                    { label: 'Completeness', score: feedback.completeness },
                    { label: 'Communication', score: feedback.communication },
                    { label: 'Relevance', score: feedback.relevance },
                  ].map(({ label, score }) => (
                    <div key={label} className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-center">
                      <p className={`text-xl font-bold font-display ${
                        (score || 0) >= 8 ? 'text-emerald-600' :
                        (score || 0) >= 6 ? 'text-amber-600' : 'text-rose-600'
                      }`}>
                        {score || 0}<span className="text-xs font-normal text-slate-400">/10</span>
                      </p>
                      <p className="text-xs text-slate-600 font-medium mt-0.5">{label}</p>
                    </div>
                  ))}
                </div>

                {/* Strengths & Weaknesses */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {feedback.strengths && (
                    <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 text-slate-800">
                      <h4 className="text-xs font-semibold text-emerald-800 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                        <HiOutlineCheckCircle className="w-4 h-4 text-emerald-600" />
                        Identified Strengths
                      </h4>
                      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">{feedback.strengths}</p>
                    </div>
                  )}
                  {feedback.weaknesses && (
                    <div className="p-4 rounded-xl bg-rose-50/70 border border-rose-200 text-slate-800">
                      <h4 className="text-xs font-semibold text-rose-800 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                        <HiOutlineExclamation className="w-4 h-4 text-rose-600" />
                        Areas for Growth
                      </h4>
                      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">{feedback.weaknesses}</p>
                    </div>
                  )}
                </div>

                {feedback.improvements && (
                  <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-slate-800">
                    <h4 className="text-xs font-semibold text-blue-800 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                      <HiOutlineLightningBolt className="w-4 h-4 text-blue-600" />
                      Actionable Recommendations
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">{feedback.improvements}</p>
                  </div>
                )}

                {/* Next Step Action */}
                <button
                  id="next-question-btn"
                  onClick={handleNextQuestion}
                  className="btn-primary w-full py-3 flex items-center justify-center gap-2 font-medium text-sm shadow-xs"
                >
                  {currentIndex >= totalQuestions ? (
                    <>
                      <HiOutlineCheckCircle className="w-4 h-4" />
                      <span>Complete & View Comprehensive Report</span>
                    </>
                  ) : (
                    <>
                      <span>Proceed to Next Question</span>
                      <HiOutlineArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Right Column: Minimalist AI Waveform HUD + Candidate Webcam */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            
            {/* Minimalist AI Waveform HUD */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between text-xs pb-1">
                <span className="font-semibold text-slate-900">AI Voice Synthesizer</span>
                <span className={`font-mono text-[11px] font-semibold flex items-center gap-1.5 ${
                  isAvatarSpeaking ? 'text-blue-600' : 'text-slate-400'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    isAvatarSpeaking ? 'bg-blue-600 animate-pulse' : 'bg-slate-300'
                  }`} />
                  {isAvatarSpeaking ? 'Active Voice' : 'Standby'}
                </span>
              </div>

              {/* Waveform Cassette Screen */}
              <div className="bg-slate-900 rounded-xl h-28 flex items-center justify-center gap-1.5 px-6 relative overflow-hidden shadow-inner">
                {isAvatarSpeaking ? (
                  <>
                    <div className="wave-bar w-1.5 rounded-full bg-blue-400" style={{ animationDelay: '0.0s' }} />
                    <div className="wave-bar w-1.5 rounded-full bg-sky-300" style={{ animationDelay: '0.15s' }} />
                    <div className="wave-bar w-1.5 rounded-full bg-blue-500" style={{ animationDelay: '0.3s' }} />
                    <div className="wave-bar w-1.5 rounded-full bg-indigo-400" style={{ animationDelay: '0.45s' }} />
                    <div className="wave-bar w-1.5 rounded-full bg-cyan-300" style={{ animationDelay: '0.2s' }} />
                    <div className="wave-bar w-1.5 rounded-full bg-blue-400" style={{ animationDelay: '0.35s' }} />
                    <div className="wave-bar w-1.5 rounded-full bg-sky-400" style={{ animationDelay: '0.1s' }} />
                    <div className="wave-bar w-1.5 rounded-full bg-indigo-300" style={{ animationDelay: '0.25s' }} />
                    <div className="wave-bar w-1.5 rounded-full bg-blue-300" style={{ animationDelay: '0.4s' }} />
                  </>
                ) : (
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                      <div key={i} className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                    ))}
                  </div>
                )}
                
                <span className="absolute bottom-2 right-3 font-mono text-[9px] uppercase tracking-wider text-slate-500">
                  {isAvatarSpeaking ? 'Streaming PCM' : 'Idle'}
                </span>
              </div>

              {/* Persona Metadata */}
              <div className="text-center pt-1">
                <p className="text-sm font-semibold text-slate-900">{personaMeta.title}</p>
                <p className="text-xs text-slate-500 mt-0.5">{personaMeta.subtitle}</p>
              </div>

              <button
                type="button"
                onClick={() => speakQuestion(currentQuestion?.questionText)}
                className="btn-secondary w-full text-xs py-2 flex items-center justify-center gap-1.5"
              >
                <HiOutlineVolumeUp className="w-3.5 h-3.5 text-slate-500" />
                <span>Replay Question Audio</span>
              </button>
            </div>

            {/* Candidate Webcam Feed */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-900 flex items-center gap-1.5">
                  <HiOutlineVideoCamera className="w-3.5 h-3.5 text-slate-500" />
                  Candidate Feed
                </span>
                {webcamStream && (
                  <span className="badge-success text-[10px] font-mono flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    PROCTOR ON
                  </span>
                )}
              </div>

              <div className="relative aspect-video rounded-xl bg-slate-950 overflow-hidden border border-slate-200">
                {webcamStream ? (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover -scale-x-100"
                    />

                    {/* Proctor Alert Overlay */}
                    {proctorWarning && (
                      <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-3 text-center z-20 animate-fade-in border-2 border-rose-500">
                        <div className="flex flex-col items-center gap-1.5">
                          <HiOutlineExclamation className="w-6 h-6 text-rose-400 animate-bounce" />
                          <p className="text-xs font-semibold text-rose-300">
                            {proctorWarning}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            Keep head centered & looking at the display.
                          </p>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-center p-4 bg-slate-50 border border-dashed border-slate-200 rounded-xl">
                    <HiOutlineExclamation className="w-5 h-5 text-amber-500 mb-1" />
                    <p className="text-xs font-semibold text-slate-800">Camera Feed Inactive</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Enable webcam permissions to satisfy proctor verification.
                    </p>
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}
