import { useState, useRef, useCallback } from 'react';
import AppLayout from '../components/layout/AppLayout';
import api from '../api/axios';
import toast from 'react-hot-toast';
import {
  HiOutlineDocumentText, HiOutlineUpload, HiOutlineX,
  HiOutlineCheckCircle, HiOutlineLightningBolt, HiOutlineSparkles,
  HiOutlineChartBar, HiOutlineExclamationCircle, HiOutlineArrowUp,
  HiOutlineArrowDown, HiOutlineBadgeCheck, HiOutlineClipboardCheck
} from 'react-icons/hi';

export default function ResumeUploadPage() {
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [analysis, setAnalysis] = useState(null);
  const [selectedScore, setSelectedScore] = useState(null);
  const fileInputRef = useRef(null);

  const handleScoreClick = (type, title, value, description) => {
    setSelectedScore({ type, title, value, description });
  };

  const getSuggestionsForScore = (type, suggestions = []) => {
    if (!suggestions) return [];
    if (type === 'overall') return suggestions;
    
    const categorized = suggestions.map(s => {
      const t = (s.title || '').toLowerCase();
      const d = (s.description || '').toLowerCase();
      
      const isTech = t.includes('skill') || d.includes('skill') ||
               t.includes('tech') || d.includes('tech') ||
               t.includes('devops') || d.includes('devops') ||
               t.includes('docker') || d.includes('docker') ||
               t.includes('kubernetes') || d.includes('kubernetes') ||
               t.includes('git') || d.includes('git') ||
               t.includes('architecture') || d.includes('architecture') ||
               t.includes('design') || d.includes('design') ||
               t.includes('database') || d.includes('database') ||
               t.includes('cloud') || d.includes('cloud') ||
               t.includes('api') || d.includes('api') ||
               t.includes('scale') || d.includes('scale') ||
               t.includes('backend') || d.includes('backend') ||
               t.includes('frontend') || d.includes('frontend') ||
               t.includes('programming') || d.includes('programming') ||
               t.includes('system') || d.includes('system');
               
      const isAts = t.includes('contact') || d.includes('contact') || 
               t.includes('format') || d.includes('format') ||
               t.includes('layout') || d.includes('layout') ||
               t.includes('email') || d.includes('email') ||
               t.includes('phone') || d.includes('phone') ||
               t.includes('linkedin') || d.includes('linkedin') ||
               t.includes('github') || d.includes('github') ||
               t.includes('font') || d.includes('font') ||
               t.includes('ats') || d.includes('ats') ||
               t.includes('length') || d.includes('length') ||
               t.includes('information') || d.includes('information') ||
               t.includes('structure') || d.includes('structure');

      const isReadiness = t.includes('quantify') || d.includes('quantify') ||
               t.includes('achievement') || d.includes('achievement') ||
               t.includes('metrics') || d.includes('metrics') ||
               t.includes('number') || d.includes('number') ||
               t.includes('interview') || d.includes('interview') ||
               t.includes('preparedness') || d.includes('preparedness') ||
               t.includes('prep') || d.includes('prep') ||
               t.includes('readiness') || d.includes('readiness') ||
               t.includes('weakness') || d.includes('weakness') ||
               t.includes('improvement') || d.includes('improvement');

      const isRecruiter = t.includes('summary') || d.includes('summary') ||
               t.includes('experience') || d.includes('experience') ||
               t.includes('project') || d.includes('project') ||
               t.includes('bullet') || d.includes('bullet') ||
               t.includes('verb') || d.includes('verb') ||
               t.includes('professional') || d.includes('professional') ||
               t.includes('job') || d.includes('job') ||
               t.includes('recruiter') || d.includes('recruiter') ||
               t.includes('readability') || d.includes('readability') ||
               t.includes('action') || d.includes('action') ||
               t.includes('career') || d.includes('career');
               
      if (isTech) return { s, category: 'technical' };
      if (isAts) return { s, category: 'ats' };
      if (isReadiness) return { s, category: 'readiness' };
      if (isRecruiter) return { s, category: 'recruiter' };
      
      return { s, category: 'recruiter' };
    });
    
    return categorized.filter(item => item.category === type).map(item => item.s);
  };

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile && validateFile(droppedFile)) {
      setFile(droppedFile);
    }
  }, []);

  const validateFile = (file) => {
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a PDF or DOCX file');
      return false;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return false;
    }
    return true;
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && validateFile(selectedFile)) {
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post('/resumes/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        },
      });

      setAnalysis(response.data);
      toast.success('Resume analyzed successfully! 🎉');
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to upload resume';
      toast.error(message);
    } finally {
      setUploading(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setAnalysis(null);
    setUploadProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-amber-400';
    return 'text-red-400';
  };

  const getScoreBg = (score) => {
    if (score >= 80) return 'from-emerald-500/20 to-teal-500/10';
    if (score >= 60) return 'from-amber-500/20 to-orange-500/10';
    return 'from-red-500/20 to-pink-500/10';
  };

  const getScoreRing = (score) => {
    if (score >= 80) return 'border-emerald-500';
    if (score >= 60) return 'border-amber-500';
    return 'border-red-500';
  };

  return (
    <AppLayout>
      {/* Page Header */}
      <div className="mb-8 animate-fade-in">
        <div className="flex items-center gap-2 mb-1">
          <HiOutlineDocumentText className="w-5 h-5 text-emerald-400" />
          <span className="text-sm text-emerald-400 font-medium">Resume Analyzer</span>
        </div>
        <h1 className="text-3xl font-display font-bold text-white">
          AI Resume <span className="gradient-text">Analysis</span>
        </h1>
        <p className="text-gray-400 mt-2">Upload your resume for intelligent analysis, ATS scoring, and personalized improvement suggestions.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Drop Zone */}
          <div
            className={`glass-card p-8 transition-all duration-300 animate-slide-up ${
              dragActive
                ? 'border-primary-500 bg-primary-500/5 shadow-lg shadow-primary-500/10'
                : file
                ? 'border-emerald-500/30 bg-emerald-500/5'
                : 'hover:border-white/20'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {!file ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300 ${
                  dragActive
                    ? 'bg-primary-500/20 scale-110'
                    : 'bg-white/5'
                }`}>
                  <HiOutlineUpload className={`w-10 h-10 transition-colors ${
                    dragActive ? 'text-primary-400' : 'text-gray-500'
                  }`} />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {dragActive ? 'Drop your resume here' : 'Drag & Drop your resume'}
                </h3>
                <p className="text-gray-500 text-sm mb-6">
                  or click to browse files • PDF, DOCX up to 10MB
                </p>
                <button
                  id="resume-browse-btn"
                  onClick={() => fileInputRef.current?.click()}
                  className="btn-secondary inline-flex items-center gap-2"
                >
                  <HiOutlineDocumentText className="w-4 h-4" />
                  Browse Files
                </button>
                <input
                  ref={fileInputRef}
                  id="resume-file-input"
                  type="file"
                  accept=".pdf,.docx"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="space-y-4">
                {/* File Preview */}
                <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500/20 to-purple-500/10 flex items-center justify-center flex-shrink-0">
                    <HiOutlineDocumentText className="w-6 h-6 text-primary-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{file.name}</p>
                    <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  {!uploading && !analysis && (
                    <button
                      onClick={removeFile}
                      className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-red-400 transition-colors"
                    >
                      <HiOutlineX className="w-5 h-5" />
                    </button>
                  )}
                  {analysis && (
                    <HiOutlineCheckCircle className="w-6 h-6 text-emerald-400 flex-shrink-0" />
                  )}
                </div>

                {/* Progress Bar */}
                {uploading && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Analyzing resume...</span>
                      <span className="text-primary-400 font-medium">{uploadProgress}%</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full gradient-bg rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <HiOutlineSparkles className="w-4 h-4 text-primary-400 animate-pulse" />
                      AI is parsing and evaluating your resume...
                    </div>
                  </div>
                )}

                {/* Upload Button */}
                {!uploading && !analysis && (
                  <button
                    id="resume-upload-btn"
                    onClick={handleUpload}
                    className="btn-primary w-full flex items-center justify-center gap-2"
                  >
                    <HiOutlineSparkles className="w-5 h-5" />
                    Analyze with AI
                  </button>
                )}

                {/* Upload New */}
                {analysis && (
                  <button
                    onClick={removeFile}
                    className="btn-secondary w-full flex items-center justify-center gap-2"
                  >
                    <HiOutlineUpload className="w-4 h-4" />
                    Upload New Resume
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Analysis Results */}
          {analysis && (
            <div className="space-y-6 animate-slide-up" style={{ animationDelay: '200ms' }}>
              {/* Scores Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {/* Overall Score */}
                <div
                  onClick={() => handleScoreClick(
                    'overall',
                    'Overall Score',
                    analysis.resumeScore,
                    'An overall assessment of your resume quality, combining ATS compatibility, recruiter readability, technical depth, and interview readiness.'
                  )}
                  className="glass-card p-5 text-center flex flex-col justify-between items-center cursor-pointer hover:border-primary-500/50 hover:bg-white/5 active:scale-95 transition-all duration-200"
                >
                  <h3 className="text-sm text-gray-400 mb-2 font-medium">Overall Score</h3>
                  <div className={`w-20 h-20 rounded-full border-4 ${getScoreRing(analysis.resumeScore)} flex items-center justify-center mb-2`}>
                    <span className={`text-2xl font-bold ${getScoreColor(analysis.resumeScore)}`}>
                      {analysis.resumeScore || 0}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">out of 100 • Click details</p>
                </div>

                {/* ATS Score */}
                <div
                  onClick={() => handleScoreClick(
                    'ats',
                    'ATS Compatibility',
                    analysis.atsScore,
                    'Measures how effectively your resume is structured for Applicant Tracking Systems (ATS), looking at layout structure, contact information, and standard sections.'
                  )}
                  className="glass-card p-5 text-center flex flex-col justify-between items-center cursor-pointer hover:border-primary-500/50 hover:bg-white/5 active:scale-95 transition-all duration-200"
                >
                  <h3 className="text-sm text-gray-400 mb-2 font-medium">ATS Compatibility</h3>
                  <div className={`w-20 h-20 rounded-full border-4 ${getScoreRing(analysis.atsScore)} flex items-center justify-center mb-2`}>
                    <span className={`text-2xl font-bold ${getScoreColor(analysis.atsScore)}`}>
                      {analysis.atsScore || 0}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">ATS friendly • Click details</p>
                </div>

                {/* Recruiter Score */}
                <div
                  onClick={() => handleScoreClick(
                    'recruiter',
                    'Recruiter Review',
                    analysis.recruiterScore,
                    'Evaluates your resume appeal to hiring managers and recruiters, assessing presentation, action-oriented bullet points, professional summary, and section layout.'
                  )}
                  className="glass-card p-5 text-center flex flex-col justify-between items-center cursor-pointer hover:border-primary-500/50 hover:bg-white/5 active:scale-95 transition-all duration-200"
                >
                  <h3 className="text-sm text-gray-400 mb-2 font-medium">Recruiter Review</h3>
                  <div className={`w-20 h-20 rounded-full border-4 ${getScoreRing(analysis.recruiterScore)} flex items-center justify-center mb-2`}>
                    <span className={`text-2xl font-bold ${getScoreColor(analysis.recruiterScore)}`}>
                      {analysis.recruiterScore || 0}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">recruiter score • Click details</p>
                </div>

                {/* Technical Depth Score */}
                <div
                  onClick={() => handleScoreClick(
                    'technical',
                    'Technical Depth',
                    analysis.technicalDepthScore,
                    'Evaluates the depth and expression of your technical stack, cloud tools, development methodologies, system architecture, database design, and key skills.'
                  )}
                  className="glass-card p-5 text-center flex flex-col justify-between items-center cursor-pointer hover:border-primary-500/50 hover:bg-white/5 active:scale-95 transition-all duration-200"
                >
                  <h3 className="text-sm text-gray-400 mb-2 font-medium">Technical Depth</h3>
                  <div className={`w-20 h-20 rounded-full border-4 ${getScoreRing(analysis.technicalDepthScore)} flex items-center justify-center mb-2`}>
                    <span className={`text-2xl font-bold ${getScoreColor(analysis.technicalDepthScore)}`}>
                      {analysis.technicalDepthScore || 0}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">technical score • Click details</p>
                </div>

                {/* Interview Readiness Score */}
                <div
                  onClick={() => handleScoreClick(
                    'readiness',
                    'Interview Prep',
                    analysis.interviewReadinessScore,
                    'Measures how well-prepared your resume represents you for a mock interview, focusing on quantifiable impact, metrics, technical problem-solving details, and achievements.'
                  )}
                  className="glass-card p-5 text-center flex flex-col justify-between items-center cursor-pointer hover:border-primary-500/50 hover:bg-white/5 active:scale-95 transition-all duration-200"
                >
                  <h3 className="text-sm text-gray-400 mb-2 font-medium">Interview Prep</h3>
                  <div className={`w-20 h-20 rounded-full border-4 ${getScoreRing(analysis.interviewReadinessScore)} flex items-center justify-center mb-2`}>
                    <span className={`text-2xl font-bold ${getScoreColor(analysis.interviewReadinessScore)}`}>
                      {analysis.interviewReadinessScore || 0}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">readiness score • Click details</p>
                </div>
              </div>

              {/* Skills Extracted */}
              {analysis.skills && analysis.skills.length > 0 && (
                <div className="glass-card p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <HiOutlineLightningBolt className="w-5 h-5 text-amber-400" />
                    <h3 className="text-lg font-semibold text-white">Skills Detected</h3>
                    <span className="badge-info ml-auto">{analysis.skills.length} skills</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {analysis.skills.map((skill, i) => (
                      <span key={i} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm text-gray-300 hover:bg-white/10 hover:border-primary-500/30 transition-all cursor-default">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Improvement Suggestions */}
              {analysis.suggestions && analysis.suggestions.length > 0 && (
                <div className="glass-card p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <HiOutlineClipboardCheck className="w-5 h-5 text-primary-400" />
                    <h3 className="text-lg font-semibold text-white">Improvement Suggestions</h3>
                  </div>
                  <div className="space-y-3">
                    {analysis.suggestions.map((suggestion, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/8 transition-colors">
                        <div className={`mt-0.5 p-1 rounded-full ${
                          suggestion.priority === 'high' ? 'bg-red-500/20' :
                          suggestion.priority === 'medium' ? 'bg-amber-500/20' : 'bg-blue-500/20'
                        }`}>
                          {suggestion.priority === 'high' ? (
                            <HiOutlineArrowUp className="w-3 h-3 text-red-400" />
                          ) : suggestion.priority === 'medium' ? (
                            <HiOutlineExclamationCircle className="w-3 h-3 text-amber-400" />
                          ) : (
                            <HiOutlineArrowDown className="w-3 h-3 text-blue-400" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm text-white font-medium">{suggestion.title}</p>
                          <p className="text-xs text-gray-400 mt-1">{suggestion.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Final Resume-Ready Version */}
              {analysis.finalResumeContent && (
                <div className="glass-card p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <HiOutlineSparkles className="w-5 h-5 text-primary-400" />
                    <h3 className="text-lg font-semibold text-white">Final Resume-Ready Version</h3>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(analysis.finalResumeContent);
                        toast.success('Resume content copied to clipboard! 📋');
                      }}
                      className="btn-secondary py-1.5 px-3 text-xs ml-auto flex items-center gap-1.5 hover:bg-primary-500 hover:text-white transition-all"
                    >
                      Copy Content
                    </button>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10 max-h-[500px] overflow-y-auto font-mono text-xs text-gray-300 whitespace-pre-wrap leading-relaxed">
                    {analysis.finalResumeContent}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Panel - Tips */}
        <div className="space-y-6 animate-slide-up" style={{ animationDelay: '300ms' }}>
          {/* Tips Card */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-display font-semibold text-white mb-4">Resume Tips</h3>
            <div className="space-y-4">
              {[
                { icon: HiOutlineBadgeCheck, label: 'Use action verbs', desc: 'Start bullets with strong verbs like "Led", "Built", "Optimized"' },
                { icon: HiOutlineChartBar, label: 'Quantify impact', desc: 'Add numbers: "Improved performance by 40%"' },
                { icon: HiOutlineLightningBolt, label: 'Match keywords', desc: 'Align skills with the job description' },
                { icon: HiOutlineDocumentText, label: 'Keep it concise', desc: '1-2 pages max, relevant info only' },
              ].map(({ icon: Icon, label, desc }, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary-500/10 flex-shrink-0">
                    <Icon className="w-4 h-4 text-primary-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Analysis Features */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-display font-semibold text-white mb-4">What we analyze</h3>
            <div className="space-y-3">
              {[
                'Technical skills extraction',
                'ATS compatibility score',
                'Content quality analysis',
                'Format & structure review',
                'Keyword optimization',
                'Improvement suggestions',
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <HiOutlineCheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span className="text-gray-300">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal / Pop Up Tab */}
      {selectedScore && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="glass-card w-full max-w-2xl border border-white/10 shadow-2xl relative animate-scale-up max-h-[90vh] flex flex-col">
            {/* Close Button */}
            <button
              onClick={() => setSelectedScore(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors z-10"
            >
              <HiOutlineX className="w-5 h-5" />
            </button>

            {/* Modal Body */}
            <div className="p-6 md:p-8 overflow-y-auto space-y-6 flex-1">
              <div className="flex flex-col md:flex-row items-center gap-6 pb-6 border-b border-white/10">
                <div className={`w-24 h-24 rounded-full border-4 ${getScoreRing(selectedScore.value)} flex items-center justify-center flex-shrink-0 bg-white/5`}>
                  <span className={`text-3xl font-bold ${getScoreColor(selectedScore.value)}`}>
                    {selectedScore.value || 0}
                  </span>
                </div>
                <div className="text-center md:text-left">
                  <h2 className="text-2xl font-display font-bold text-white flex items-center gap-2 justify-center md:justify-start">
                    <HiOutlineSparkles className="w-6 h-6 text-primary-400" />
                    {selectedScore.title} Details
                  </h2>
                  <p className="text-gray-400 mt-2 text-sm max-w-lg leading-relaxed">
                    {selectedScore.description}
                  </p>
                </div>
              </div>

              {/* Detected Skills list only inside Technical Depth */}
              {selectedScore.type === 'technical' && analysis.skills && analysis.skills.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Detected Skills</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {analysis.skills.map((skill, index) => (
                      <span key={index} className="px-2.5 py-1 text-xs rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Highlighted Errors & Remarks */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
                  <HiOutlineClipboardCheck className="w-4 h-4 text-primary-400" />
                  Highlighted Issues & Remarks
                </h3>
                
                {getSuggestionsForScore(selectedScore.type, analysis.suggestions).length > 0 ? (
                  <div className="space-y-3">
                    {getSuggestionsForScore(selectedScore.type, analysis.suggestions).map((suggestion, i) => {
                      const isHigh = suggestion.priority === 'high';
                      const isMedium = suggestion.priority === 'medium';
                      
                      return (
                        <div
                          key={i}
                          className={`p-4 rounded-xl border transition-all ${
                            isHigh ? 'bg-red-500/5 border-red-500/20 hover:bg-red-500/8' :
                            isMedium ? 'bg-amber-500/5 border-amber-500/20 hover:bg-amber-500/8' :
                            'bg-blue-500/5 border-blue-500/20 hover:bg-blue-500/8'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`mt-0.5 p-1 rounded-full ${
                              isHigh ? 'bg-red-500/20' :
                              isMedium ? 'bg-amber-500/20' : 'bg-blue-500/20'
                            }`}>
                              {isHigh ? (
                                <HiOutlineArrowUp className="w-3.5 h-3.5 text-red-400" />
                              ) : isMedium ? (
                                <HiOutlineExclamationCircle className="w-3.5 h-3.5 text-amber-400" />
                              ) : (
                                <HiOutlineArrowDown className="w-3.5 h-3.5 text-blue-400" />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 justify-between">
                                <p className="text-sm font-bold text-white leading-tight">
                                  {suggestion.title}
                                </p>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                  isHigh ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                                  isMedium ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                                  'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                }`}>
                                  {suggestion.priority} Priority
                                </span>
                              </div>
                              <p className="text-xs text-gray-400 mt-2 leading-relaxed font-normal">
                                {suggestion.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-center space-y-2">
                    <HiOutlineCheckCircle className="w-8 h-8 text-emerald-400 mx-auto" />
                    <p className="text-sm font-semibold text-white">All Clear!</p>
                    <p className="text-xs text-gray-400 font-normal">
                      No errors or warnings identified for this category. Your resume is performing well in this area!
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-white/5 border-t border-white/10 flex justify-end">
              <button
                onClick={() => setSelectedScore(null)}
                className="btn-secondary py-2 px-5 text-sm"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
