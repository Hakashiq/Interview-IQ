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
      toast.error('Please upload a PDF or DOCX document');
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
      toast.success('Resume parsed and analyzed successfully ✨');
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to upload and analyze resume';
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
    if (score >= 80) return 'text-emerald-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-amber-600';
    return 'text-rose-600';
  };

  const getScoreBorder = (score) => {
    if (score >= 80) return 'border-emerald-500';
    if (score >= 60) return 'border-blue-500';
    if (score >= 40) return 'border-amber-500';
    return 'border-rose-500';
  };

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Page Header */}
        <div className="pb-2 border-b border-slate-200/80">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-100">
              Document Intelligence
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-slate-900 tracking-tight">
            AI Resume Analyzer & ATS Audit
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Evaluate keyword coverage, ATS parseability, technical depth, and generate an interview-calibrated summary.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Main Area: Upload & Results */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Upload Drop Zone Card */}
            <div
              className={`bg-white border rounded-2xl p-6 sm:p-8 transition-all shadow-xs ${
                dragActive
                  ? 'border-blue-500 bg-blue-50/30'
                  : file
                  ? 'border-slate-300'
                  : 'border-slate-200/90 hover:border-slate-300'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {!file ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all ${
                    dragActive ? 'bg-blue-100 text-blue-700 scale-105' : 'bg-slate-100 text-slate-500'
                  }`}>
                    <HiOutlineUpload className="w-8 h-8" />
                  </div>
                  <h3 className="text-base font-semibold text-slate-900 mb-1">
                    {dragActive ? 'Drop your resume file now' : 'Upload your resume for evaluation'}
                  </h3>
                  <p className="text-xs text-slate-500 mb-5 max-w-sm">
                    Drag and drop your PDF or DOCX document, or browse your local system. Max file size: 10MB.
                  </p>
                  <button
                    id="resume-browse-btn"
                    onClick={() => fileInputRef.current?.click()}
                    className="btn-secondary text-xs py-2 px-4 inline-flex items-center gap-1.5 shadow-xs"
                  >
                    <HiOutlineDocumentText className="w-4 h-4 text-slate-500" />
                    <span>Select Document</span>
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
                  {/* File Preview Pill */}
                  <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                        <HiOutlineDocumentText className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">{file.name}</p>
                        <p className="text-xs text-slate-500 font-mono">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                    
                    {!uploading && !analysis && (
                      <button
                        onClick={removeFile}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Remove file"
                      >
                        <HiOutlineX className="w-5 h-5" />
                      </button>
                    )}
                    {analysis && (
                      <span className="badge-success text-xs flex items-center gap-1">
                        <HiOutlineCheckCircle className="w-4 h-4" />
                        Analyzed
                      </span>
                    )}
                  </div>

                  {/* Upload Progress Bar */}
                  {uploading && (
                    <div className="space-y-2 pt-1">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-slate-600">Extracting content & parsing sections...</span>
                        <span className="text-blue-600 font-bold">{uploadProgress}%</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  {!uploading && !analysis && (
                    <button
                      id="resume-upload-btn"
                      onClick={handleUpload}
                      className="btn-primary w-full py-2.5 flex items-center justify-center gap-2 text-sm shadow-xs"
                    >
                      <HiOutlineSparkles className="w-4 h-4" />
                      <span>Start AI Resume Analysis</span>
                    </button>
                  )}

                  {analysis && (
                    <button
                      onClick={removeFile}
                      className="btn-secondary w-full py-2 flex items-center justify-center gap-2 text-xs"
                    >
                      <HiOutlineUpload className="w-3.5 h-3.5" />
                      <span>Upload a Different Resume</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Analysis Results View */}
            {analysis && (
              <div className="space-y-6 animate-fade-in">
                
                {/* 5 Dimensional Score Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                  {[
                    {
                      type: 'overall',
                      title: 'Overall Score',
                      score: analysis.resumeScore,
                      desc: 'Composite score evaluating holistic applicant readiness and depth.'
                    },
                    {
                      type: 'ats',
                      title: 'ATS Parse',
                      score: analysis.atsScore,
                      desc: 'Compatibility with enterprise Applicant Tracking Systems and keyword filters.'
                    },
                    {
                      type: 'recruiter',
                      title: 'Recruiter Impact',
                      score: analysis.recruiterScore,
                      desc: 'Scanability, concise bullets, strong action verbs, and hierarchy.'
                    },
                    {
                      type: 'technical',
                      title: 'Tech Depth',
                      score: analysis.technicalDepthScore,
                      desc: 'Demonstration of modern engineering frameworks, systems, and tooling.'
                    },
                    {
                      type: 'readiness',
                      title: 'Interview Fit',
                      score: analysis.interviewReadinessScore,
                      desc: 'Quantified metrics and measurable impact that anchor deep interview questions.'
                    },
                  ].map((item) => (
                    <button
                      key={item.type}
                      type="button"
                      onClick={() => handleScoreClick(item.type, item.title, item.score, item.desc)}
                      className="bg-white border border-slate-200/90 rounded-xl p-4 text-center hover:border-blue-400 hover:shadow-xs transition-all flex flex-col items-center justify-between"
                    >
                      <span className="text-[11px] font-semibold text-slate-600 block mb-2">{item.title}</span>
                      <div className={`w-14 h-14 rounded-full border-3 ${getScoreBorder(item.score)} flex items-center justify-center my-1`}>
                        <span className={`text-lg font-bold font-display ${getScoreColor(item.score)}`}>
                          {item.score || 0}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono mt-1 block">Inspect ↗</span>
                    </button>
                  ))}
                </div>

                {/* Detected Skills */}
                {analysis.skills && analysis.skills.length > 0 && (
                  <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <HiOutlineLightningBolt className="w-4 h-4 text-amber-500" />
                        <h3 className="text-sm font-semibold text-slate-900">Extracted Technical Skills</h3>
                      </div>
                      <span className="badge-neutral text-xs">{analysis.skills.length} detected</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {analysis.skills.map((skill, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200/80 text-xs font-mono text-slate-700"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Suggestions List */}
                {analysis.suggestions && analysis.suggestions.length > 0 && (
                  <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-3">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                      <HiOutlineClipboardCheck className="w-4 h-4 text-blue-600" />
                      <h3 className="text-sm font-semibold text-slate-900">Recommended Enhancements</h3>
                    </div>
                    <div className="space-y-2.5">
                      {analysis.suggestions.map((s, i) => (
                        <div
                          key={i}
                          className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3"
                        >
                          <div className="mt-0.5 flex-shrink-0">
                            {s.priority === 'high' ? (
                              <span className="w-5 h-5 rounded-md bg-rose-100 text-rose-700 flex items-center justify-center text-xs font-bold">
                                !
                              </span>
                            ) : s.priority === 'medium' ? (
                              <span className="w-5 h-5 rounded-md bg-amber-100 text-amber-800 flex items-center justify-center text-xs font-bold">
                                ▲
                              </span>
                            ) : (
                              <span className="w-5 h-5 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">
                                •
                              </span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-xs font-semibold text-slate-900">{s.title}</p>
                              <span className="text-[10px] font-mono text-slate-400 uppercase">{s.priority} priority</span>
                            </div>
                            <p className="text-xs text-slate-600 mt-1 leading-relaxed">{s.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Final Resume-Ready Content Block */}
                {analysis.finalResumeContent && (
                  <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <HiOutlineSparkles className="w-4 h-4 text-blue-600" />
                        <h3 className="text-sm font-semibold text-slate-900">Polished Resume Content</h3>
                      </div>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(analysis.finalResumeContent);
                          toast.success('Clean text copied to clipboard 📋');
                        }}
                        className="btn-secondary text-xs py-1.5 px-3"
                      >
                        Copy Clean Text
                      </button>
                    </div>
                    <pre className="p-4 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs text-slate-800 whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto">
                      {analysis.finalResumeContent}
                    </pre>
                  </div>
                )}

              </div>
            )}

          </div>

          {/* Right Column: Tips & Standards */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-semibold text-slate-900 border-b border-slate-100 pb-2">
                Resume Benchmarks
              </h3>
              <div className="space-y-3">
                {[
                  { icon: HiOutlineBadgeCheck, title: 'Strong Action Verbs', desc: 'Begin impact statements with words like Architected, Specced, Delivered.' },
                  { icon: HiOutlineChartBar, title: 'Quantifiable Metrics', desc: 'Include latency drops, cost reductions, throughput increases or user scale.' },
                  { icon: HiOutlineLightningBolt, title: 'Match Standard Ontologies', desc: 'Use standard industry tech keywords rather than esoteric abbreviations.' },
                  { icon: HiOutlineDocumentText, title: 'Clean Single/Two-Page Layout', desc: 'Clear headings without nested columns that confuse legacy ATS parsers.' },
                ].map(({ icon: Icon, title, desc }, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-slate-100 text-slate-600 flex-shrink-0 mt-0.5">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-800">{title}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-5 text-xs text-slate-600 space-y-2">
              <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                <HiOutlineCheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Next Step Recommendation</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Once satisfied with your resume metrics, initialize a <strong>Resume-Based Interview</strong> in the simulation tab to practice questions tailored directly to your recorded accomplishments.
              </p>
            </div>
          </div>

        </div>

        {/* Detailed Modal Breakdown */}
        {selectedScore && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
            <div className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full p-6 sm:p-7 shadow-subtle space-y-5 animate-scale-up relative">
              <button
                onClick={() => setSelectedScore(null)}
                className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <HiOutlineX className="w-5 h-5" />
              </button>

              <div className="flex items-start gap-4 pr-8">
                <div className={`w-14 h-14 rounded-full border-3 ${getScoreBorder(selectedScore.value)} flex items-center justify-center flex-shrink-0`}>
                  <span className={`text-xl font-bold font-display ${getScoreColor(selectedScore.value)}`}>
                    {selectedScore.value || 0}
                  </span>
                </div>
                <div>
                  <h2 className="text-base font-semibold text-slate-900">{selectedScore.title} Breakdown</h2>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{selectedScore.description}</p>
                </div>
              </div>

              {/* Suggestions for Selected Dimension */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Targeted Feedback & Opportunities
                </h3>
                {getSuggestionsForScore(selectedScore.type, analysis?.suggestions).length > 0 ? (
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {getSuggestionsForScore(selectedScore.type, analysis?.suggestions).map((s, idx) => (
                      <div key={idx} className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                        <p className="font-semibold text-slate-900">{s.title}</p>
                        <p className="text-slate-600 mt-0.5 leading-relaxed">{s.description}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-1">
                    <HiOutlineCheckCircle className="w-6 h-6 text-emerald-600 mx-auto" />
                    <p className="text-xs font-semibold text-emerald-900">Optimal Performance</p>
                    <p className="text-[11px] text-emerald-700">No major defects found in this specific dimension.</p>
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setSelectedScore(null)}
                  className="btn-secondary text-xs py-2 px-4"
                >
                  Close Inspection
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </AppLayout>
  );
}
