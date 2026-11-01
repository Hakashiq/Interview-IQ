import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { playHoverTick, playMechanicalToggle } from '../utils/soundEffects';
import {
  HiOutlineArrowRight, HiOutlineClock,
  HiOutlineCheckCircle, HiOutlineLightningBolt, HiOutlineSparkles,
  HiOutlineStop, HiOutlineMicrophone, HiOutlineChartBar,
  HiOutlineVideoCamera, HiOutlineExclamation, HiOutlineVolumeUp,
  HiOutlineShieldCheck
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
      <div className="min-h-screen flex items-center justify-center bg-ghost-void text-ghost-ice devices-matrix-grid">
        <div className="ghost-panel p-8 flex flex-col items-center gap-4 text-center max-w-sm">
          <div className="w-10 h-10 border-2 border-ghost-blue border-t-transparent rounded-full animate-spin" />
          <div>
            <p className="text-white font-display font-bold text-base uppercase tracking-wider">Mounting Chamber</p>
            <p className="text-ghost-ice/50 font-mono text-xs mt-1">Calibrating question set &amp; WASM face telemetry...</p>
          </div>
        </div>
      </div>
    );
  }

  if (cheated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ghost-void text-ghost-ice p-4 devices-matrix-grid">
        <div className="ghost-panel border-ghost-alert/40 bg-ghost-void/95 p-10 max-w-lg w-full text-center shadow-2xl animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-ghost-alert/20 border border-ghost-alert/40 mx-auto flex items-center justify-center mb-5 text-red-400">
            <HiOutlineStop className="w-8 h-8" />
          </div>
          <div className="font-mono text-[10px] text-red-400 uppercase tracking-widest mb-1">
            [PROCTOR VIOLATION DETECTED]
          </div>
          <h1 className="text-2xl font-display font-bold text-white mb-2">Chamber Terminated</h1>
          <p className="text-ghost-ice/70 font-ui text-xs mb-6 leading-relaxed">
            Persistent proctoring or focus-loss events exceeded the threshold limit.
            Simulation has been halted to maintain legitimate placement integrity.
          </p>
          <div className="w-full bg-ghost-ice/10 h-1.5 rounded-full overflow-hidden">
            <div className="h-full bg-ghost-alert animate-pulse w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ghost-void text-ghost-ice devices-matrix-grid">
        <div className="ghost-panel p-8 flex flex-col items-center gap-4 text-center animate-fade-in max-w-sm">
          <div className="w-10 h-10 border-2 border-ghost-blue border-t-transparent rounded-full animate-spin" />
          <div>
            <p className="text-white font-display font-bold text-base uppercase tracking-wider">Generating Telemetry Audit</p>
            <p className="text-ghost-ice/50 font-mono text-xs mt-1">Compiling 5-Pillar evaluation scorecard...</p>
          </div>
        </div>
      </div>
    );
  }

  const avatarLabels = {
    Neha: { title: 'Neha', subtitle: 'Technical Recruiter • Indian English Voice' },
    Aditya: { title: 'Aditya', subtitle: 'Staff Architect • Tech Lead Persona' },
    RoboRecruit: { title: 'RoboRecruit', subtitle: 'Algorithmic Evaluator • Precise Persona' },
  };

  const personaMeta = avatarLabels[interviewerAvatar] || avatarLabels.Neha;

  return (
    <div className="min-h-screen bg-ghost-void text-ghost-ice flex flex-col font-ui selection:bg-ghost-blue selection:text-ghost-ice devices-matrix-grid relative">
      {/* Top Focus Studio Bar */}
      <header className="h-16 bg-[#00050a]/90 backdrop-blur-xl border-b border-ghost-ice/15 flex items-center justify-between px-4 sm:px-6 lg:px-8 sticky top-0 z-30 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-ghost-blue text-white flex items-center justify-center font-mono font-bold text-xs shadow-md shadow-ghost-blue/30">
              IQ
            </div>
            <div>
              <span className="text-sm font-display font-bold text-white hidden sm:inline-block tracking-tightest">
                GHOST // SIMULATION CHAMBER
              </span>
              <span className="text-[10px] font-mono text-ghost-ice/50 block sm:hidden uppercase">
                CHAMBER
              </span>
            </div>
          </div>
          <div className="h-4 w-px bg-ghost-ice/15 hidden sm:block" />
          <div className="flex items-center gap-2">
            <span className="telemetry-chip-active text-[10px]">{interview?.jobRole}</span>
            <span className="telemetry-chip text-[10px]">{interview?.difficulty}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Warnings Counter */}
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono border ${
            warnings === 3
              ? 'bg-ghost-ice/5 border-ghost-ice/15 text-ghost-ice/70'
              : warnings === 2
              ? 'bg-amber-950/40 border-amber-500/40 text-amber-300'
              : 'bg-ghost-alert/20 border-ghost-alert/50 text-red-400 animate-pulse'
          }`}>
            <span>STRIKES:</span>
            <span className="font-bold">{warnings}/3</span>
          </div>

          {/* Time Elapsed */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-ghost-ice/5 border border-ghost-ice/15 text-ghost-ice">
            <HiOutlineClock className="w-3.5 h-3.5 text-ghost-blue" />
            <span className="text-xs font-mono font-semibold">{formatTime(timeElapsed)}</span>
          </div>

          {/* Progress */}
          <div className="hidden md:flex items-center gap-2.5 pl-1">
            <span className="text-xs font-mono text-ghost-ice/60">
              <strong className="text-white font-bold">{currentIndex}</strong>/{totalQuestions}
            </span>
            <div className="w-20 h-1.5 bg-ghost-ice/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-ghost-blue rounded-full transition-all duration-300"
                style={{ width: `${(currentIndex / totalQuestions) * 100}%` }}
              />
            </div>
          </div>

          {/* End Button */}
          <button
            id="end-interview-btn"
            onClick={() => {
              playMechanicalToggle(false);
              handleEndInterview();
            }}
            onMouseEnter={playHoverTick}
            className="px-3 py-1.5 rounded-full border border-ghost-alert/30 bg-ghost-alert/15 hover:bg-ghost-alert/30 text-red-300 font-mono text-[10px] uppercase tracking-wider flex items-center gap-1 transition-all"
            title="Conclude current interview session"
          >
            <HiOutlineStop className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Abort Run</span>
          </button>
        </div>
      </header>

      {/* Main Studio Arena */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Question Prompt & Response Form */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Question Prompt Card */}
            <div className="ghost-panel p-6 sm:p-8 relative overflow-hidden animate-fade-in">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-ghost-blue uppercase tracking-widest">
                    PROMPT [{currentIndex} OF {totalQuestions}]
                  </span>
                  {currentQuestion?.category && (
                    <span className="telemetry-chip text-[9px]">{currentQuestion.category}</span>
                  )}
                </div>
                <button
                  onClick={() => {
                    playHoverTick();
                    speakQuestion(currentQuestion?.questionText);
                  }}
                  onMouseEnter={playHoverTick}
                  className={`text-[10px] font-mono px-3 py-1 rounded-full border flex items-center gap-1.5 transition-all ${
                    isAvatarSpeaking
                      ? 'bg-ghost-blue border-ghost-blue text-white shadow-sm shadow-ghost-blue'
                      : 'bg-ghost-ice/5 border-ghost-ice/15 hover:border-ghost-ice/30 text-ghost-ice/80'
                  }`}
                  title="Play audio pronunciation"
                >
                  <HiOutlineVolumeUp className={`w-3.5 h-3.5 ${isAvatarSpeaking ? 'animate-bounce' : ''}`} />
                  <span>{isAvatarSpeaking ? 'SYNTHESIZING...' : 'LISTEN (SFX)'}</span>
                </button>
              </div>

              <h2 className="text-xl sm:text-2xl font-display font-bold text-white leading-snug tracking-tight">
                {currentQuestion?.questionText || 'Loading question content...'}
              </h2>
            </div>

            {/* Answer Input or Feedback View */}
            {!feedback ? (
              <div className="ghost-panel p-6 space-y-4 animate-fade-in">
                <div className="flex items-center justify-between pb-3 border-b border-ghost-ice/15">
                  <div className="flex items-center gap-2">
                    <label htmlFor="answer-textarea" className="text-xs font-mono uppercase tracking-wider text-white">
                      Response Buffer
                    </label>
                    <span className="text-[10px] text-ghost-ice/40 font-mono">
                      ({answer.length} bytes)
                    </span>
                  </div>

                  {/* Speech Dictation Button */}
                  <button
                    type="button"
                    onClick={() => {
                      playMechanicalToggle(true);
                      toggleListening();
                    }}
                    onMouseEnter={playHoverTick}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[11px] font-mono uppercase tracking-wider transition-all ${
                      isListening
                        ? 'bg-ghost-heat/20 border-ghost-heat text-ghost-heat animate-pulse'
                        : 'bg-ghost-ice/5 border-ghost-ice/15 text-ghost-ice/80 hover:border-ghost-ice/30'
                    }`}
                  >
                    <HiOutlineMicrophone className={`w-3.5 h-3.5 ${isListening ? 'text-ghost-heat' : 'text-ghost-ice/50'}`} />
                    <span>{isListening ? 'STREAMING VOICE...' : 'VOICE DICTATION'}</span>
                  </button>
                </div>

                <div className="relative">
                  <textarea
                    ref={textareaRef}
                    id="answer-textarea"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Structure your answer clearly. Detail architectural tradeoffs, algorithmic complexity, boundary conditions, and internal mechanisms..."
                    rows={8}
                    className="w-full bg-[#000307]/80 border border-ghost-ice/20 rounded-xl p-4 font-mono text-xs text-ghost-ice placeholder-ghost-ice/35 focus:bg-[#00050a] focus:border-ghost-blue focus:ring-1 focus:ring-ghost-blue outline-none transition-all leading-relaxed resize-y"
                  />
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                  <p className="text-[10px] font-mono text-ghost-ice/40">
                    &gt; Precision AST evaluation: address complexity, data structures &amp; thread safety.
                  </p>
                  <button
                    id="submit-answer-btn"
                    onClick={() => {
                      playMechanicalToggle(true);
                      handleSubmitAnswer();
                    }}
                    disabled={submitting || !answer.trim()}
                    onMouseEnter={playHoverTick}
                    data-sfx="toggle"
                    className="ghost-button-blue w-full sm:w-auto px-6 py-2.5 flex items-center justify-center gap-2 disabled:opacity-40"
                  >
                    {submitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        <span>EVALUATING MULTI-VECTOR...</span>
                      </>
                    ) : (
                      <>
                        <HiOutlineSparkles className="w-4 h-4" />
                        <span>SUBMIT TELEMETRY</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              /* Post-Answer Evaluation Card */
              <div className="ghost-panel p-6 sm:p-7 space-y-6 animate-fade-in">
                <div className="flex items-center justify-between border-b border-ghost-ice/15 pb-4">
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-lg bg-ghost-blue/20 border border-ghost-blue/40 text-ghost-ice flex items-center justify-center">
                      <HiOutlineSparkles className="w-4 h-4 text-ghost-blue" />
                    </span>
                    <div>
                      <h3 className="text-base font-display font-bold text-white tracking-tight">
                        5-Pillar Neural Evaluation
                      </h3>
                      <p className="text-[11px] font-mono text-ghost-ice/50">Semantic benchmark alignment metrics</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono text-ghost-ice/50 block uppercase">Overall Grade</span>
                    <span className="text-2xl font-mono font-bold text-ghost-blue">
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
                    <div key={label} className="p-3 rounded-xl bg-[#000307]/80 border border-ghost-ice/15 text-center">
                      <p className={`text-xl font-bold font-mono ${
                        (score || 0) >= 8 ? 'text-emerald-400' :
                        (score || 0) >= 6 ? 'text-amber-400' : 'text-red-400'
                      }`}>
                        {score || 0}<span className="text-xs font-normal text-ghost-ice/40">/10</span>
                      </p>
                      <p className="text-[10px] font-mono uppercase text-ghost-ice/60 mt-1">{label}</p>
                    </div>
                  ))}
                </div>

                {/* Strengths & Weaknesses */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {feedback.strengths && (
                    <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-ghost-ice">
                      <h4 className="text-xs font-mono font-semibold text-emerald-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                        <HiOutlineCheckCircle className="w-4 h-4 text-emerald-400" />
                        Identified Strengths
                      </h4>
                      <p className="text-xs font-ui text-ghost-ice/80 leading-relaxed">{feedback.strengths}</p>
                    </div>
                  )}
                  {feedback.weaknesses && (
                    <div className="p-4 rounded-xl bg-red-950/30 border border-red-500/30 text-ghost-ice">
                      <h4 className="text-xs font-mono font-semibold text-red-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                        <HiOutlineExclamation className="w-4 h-4 text-red-400" />
                        Remediation Focus
                      </h4>
                      <p className="text-xs font-ui text-ghost-ice/80 leading-relaxed">{feedback.weaknesses}</p>
                    </div>
                  )}
                </div>

                {feedback.improvements && (
                  <div className="p-4 rounded-xl bg-ghost-blue/10 border border-ghost-blue/30 text-ghost-ice">
                    <h4 className="text-xs font-mono font-semibold text-ghost-blue uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                      <HiOutlineLightningBolt className="w-4 h-4 text-ghost-blue" />
                      Algorithmic Recommendations
                    </h4>
                    <p className="text-xs font-ui text-ghost-ice/80 leading-relaxed">{feedback.improvements}</p>
                  </div>
                )}

                {/* Next Step Action */}
                <button
                  id="next-question-btn"
                  onClick={() => {
                    playMechanicalToggle(true);
                    handleNextQuestion();
                  }}
                  onMouseEnter={playHoverTick}
                  data-sfx="toggle"
                  className="ghost-button-blue w-full py-3 flex items-center justify-center gap-2 font-mono text-xs uppercase"
                >
                  {currentIndex >= totalQuestions ? (
                    <>
                      <HiOutlineCheckCircle className="w-4 h-4" />
                      <span>Complete &amp; Export Audit Log</span>
                    </>
                  ) : (
                    <>
                      <span>Advance to Next Prompt</span>
                      <HiOutlineArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Right Column: AI Waveform HUD + Candidate Webcam Optical Chassis */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            
            {/* AI Waveform HUD */}
            <div className="ghost-panel p-5 space-y-4">
              <div className="flex items-center justify-between text-xs pb-1">
                <span className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                  Audio Synthesizer
                </span>
                <span className={`font-mono text-[10px] font-semibold flex items-center gap-1.5 ${
                  isAvatarSpeaking ? 'text-ghost-blue' : 'text-ghost-ice/40'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    isAvatarSpeaking ? 'bg-ghost-blue animate-pulse' : 'bg-ghost-ice/20'
                  }`} />
                  {isAvatarSpeaking ? 'ACTIVE PCM' : 'STANDBY'}
                </span>
              </div>

              {/* Waveform Cassette Screen */}
              <div className="bg-[#000307] rounded-xl h-28 flex items-center justify-center gap-1.5 px-6 relative overflow-hidden border border-ghost-ice/15 shadow-inner">
                {isAvatarSpeaking ? (
                  <>
                    <div className="wave-bar w-1.5 rounded-full bg-ghost-blue" style={{ animationDelay: '0.0s' }} />
                    <div className="wave-bar w-1.5 rounded-full bg-ghost-ice" style={{ animationDelay: '0.15s' }} />
                    <div className="wave-bar w-1.5 rounded-full bg-ghost-blue" style={{ animationDelay: '0.3s' }} />
                    <div className="wave-bar w-1.5 rounded-full bg-ghost-ice" style={{ animationDelay: '0.45s' }} />
                    <div className="wave-bar w-1.5 rounded-full bg-ghost-blue" style={{ animationDelay: '0.2s' }} />
                    <div className="wave-bar w-1.5 rounded-full bg-ghost-ice" style={{ animationDelay: '0.35s' }} />
                    <div className="wave-bar w-1.5 rounded-full bg-ghost-blue" style={{ animationDelay: '0.1s' }} />
                    <div className="wave-bar w-1.5 rounded-full bg-ghost-ice" style={{ animationDelay: '0.25s' }} />
                    <div className="wave-bar w-1.5 rounded-full bg-ghost-blue" style={{ animationDelay: '0.4s' }} />
                  </>
                ) : (
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                      <div key={i} className="w-1.5 h-1.5 rounded-full bg-ghost-ice/20" />
                    ))}
                  </div>
                )}
                
                <span className="absolute bottom-2 right-3 font-mono text-[9px] uppercase tracking-wider text-ghost-ice/40">
                  {isAvatarSpeaking ? '7000Hz LP STREAM' : 'SYNTH IDLE'}
                </span>
              </div>

              {/* Persona Metadata */}
              <div className="text-center pt-1">
                <p className="text-sm font-display font-bold text-white">{personaMeta.title}</p>
                <p className="text-[10px] font-mono text-ghost-ice/50 mt-0.5">{personaMeta.subtitle}</p>
              </div>

              <button
                type="button"
                onClick={() => {
                  playHoverTick();
                  speakQuestion(currentQuestion?.questionText);
                }}
                onMouseEnter={playHoverTick}
                className="ghost-button-void w-full text-[10px] font-mono py-2 flex items-center justify-center gap-1.5"
              >
                <HiOutlineVolumeUp className="w-3.5 h-3.5 text-ghost-blue" />
                <span>REPLAY PROMPT AUDIO</span>
              </button>
            </div>

            {/* Candidate Optical Chassis Feed */}
            <div className="ghost-panel p-4 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-xs font-bold text-white uppercase flex items-center gap-1.5">
                  <HiOutlineVideoCamera className="w-3.5 h-3.5 text-ghost-blue" />
                  Optical Perceiver
                </span>
                {webcamStream && (
                  <span className="telemetry-chip-active text-[9px] font-mono flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    WASM ON
                  </span>
                )}
              </div>

              <div className="relative aspect-video rounded-xl bg-[#000307] overflow-hidden border border-ghost-ice/20 shadow-inner">
                {webcamStream ? (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover -scale-x-100"
                    />

                    {/* Corner Precision Reticles */}
                    <div className="absolute top-2 left-2 font-mono text-[8px] text-ghost-ice/40 pointer-events-none">
                      ┌ 478 LANDMARKS
                    </div>
                    <div className="absolute top-2 right-2 font-mono text-[8px] text-ghost-ice/40 pointer-events-none">
                      0-EGRESS ┐
                    </div>
                    <div className="absolute bottom-2 left-2 font-mono text-[8px] text-ghost-ice/40 pointer-events-none">
                      └ GAZE: ACTIVE
                    </div>

                    {/* Proctor Alert Overlay */}
                    {proctorWarning && (
                      <div className="absolute inset-0 bg-[#00050a]/90 backdrop-blur-sm flex items-center justify-center p-3 text-center z-20 animate-fade-in border-2 border-red-500">
                        <div className="flex flex-col items-center gap-1.5">
                          <HiOutlineExclamation className="w-6 h-6 text-red-400 animate-bounce" />
                          <p className="text-xs font-mono font-bold text-red-300">
                            {proctorWarning}
                          </p>
                          <p className="text-[10px] font-mono text-ghost-ice/60">
                            Re-align gaze to active monitor area.
                          </p>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-center p-4 bg-[#000307] border border-dashed border-ghost-ice/20 rounded-xl">
                    <HiOutlineExclamation className="w-5 h-5 text-amber-400 mb-1" />
                    <p className="text-xs font-mono font-bold text-white">Camera Sensor Inactive</p>
                    <p className="text-[10px] font-mono text-ghost-ice/50 mt-0.5">
                      Grant webcam permissions to engage WASM edge proctoring.
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
