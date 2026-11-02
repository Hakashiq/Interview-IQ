import { useState, useRef, useCallback } from 'react';
import AppLayout from '../components/layout/AppLayout';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { playHoverTick, playMechanicalToggle } from '../utils/soundEffects';
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
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-iq-blue';
    if (score >= 40) return 'text-amber-400';
    return 'text-red-400';
  };

  const getScoreBorder = (score) => {
    if (score >= 80) return 'border-emerald-500/40 bg-emerald-950/30';
    if (score >= 60) return 'border-iq-blue/40 bg-iq-blue/20';
    if (score >= 40) return 'border-amber-500/40 bg-amber-950/30';
    return 'border-red-500/40 bg-red-950/30';
  };

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Page Header */}
        <div className="pb-3 border-b border-iq-ice/15">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="telemetry-chip-active text-[10px]">
              MOD.03 // RESUME SPECIFICATION PARSER
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tightest">
            Resume Intelligence &amp; ATS Audit
          </h1>
          <p className="text-xs sm:text-sm text-iq-ice/60 font-ui mt-1">
            Extract skill graph vertices, audit ATS parsing tolerances, and synthesize personalized interview inquiries.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Main Area: Upload & Results */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Upload Drop Zone Card */}
            <div
              className={`iq-panel p-6 sm:p-8 transition-all relative overflow-hidden ${
                dragActive
                  ? 'border-iq-blue bg-iq-blue/15 shadow-iq-glow'
                  : file
                  ? 'border-iq-ice/30'
                  : 'hover:border-iq-ice/30'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {!file ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className={`w-16 h-16 rounded-2xl border flex items-center justify-center mb-4 transition-all ${
                    dragActive ? 'border-iq-blue bg-iq-blue/20 text-iq-ice scale-105 shadow-lg shadow-iq-blue/30' : 'border-iq-ice/20 bg-iq-ice/5 text-iq-ice/60'
                  }`}>
                    <HiOutlineUpload className="w-8 h-8 text-iq-blue" />
                  </div>
                  <h3 className="text-base font-display font-bold text-white mb-1">
                    {dragActive ? 'Release document into parser chamber' : 'Mount Resume Specification File'}
                  </h3>
                  <p className="text-xs text-iq-ice/50 font-ui mb-5 max-w-sm">
                    Drag and drop PDF or DOCX engineering CV document, or browse local disk. Max file size: 10MB.
                  </p>
                  <button
                    id="resume-browse-btn"
                    onClick={() => {
                      playMechanicalToggle(true);
                      fileInputRef.current?.click();
                    }}
                    onMouseEnter={playHoverTick}
                    data-sfx="toggle"
                    className="iq-button-void text-xs py-2 px-5 inline-flex items-center gap-2"
                  >
                    <HiOutlineDocumentText className="w-4 h-4 text-iq-blue" />
                    <span>Select Specification File</span>
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
                  <div className="flex items-center justify-between p-4 rounded-xl bg-[#000307]/80 border border-iq-ice/20">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-iq-blue/15 border border-iq-blue/30 text-iq-blue flex items-center justify-center flex-shrink-0">
                        <HiOutlineDocumentText className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-mono font-bold text-white truncate">{file.name}</p>
                        <p className="text-[10px] text-iq-ice/50 font-mono">{(file.size / 1024 / 1024).toFixed(2)} MB // LOADED</p>
                      </div>
                    </div>
                    
                    {!uploading && !analysis && (
                      <button
                        onClick={() => {
                          playMechanicalToggle(false);
                          removeFile();
                        }}
                        onMouseEnter={playHoverTick}
                        className="p-1.5 rounded-lg text-iq-ice/40 hover:text-red-400 hover:bg-iq-alert/15 transition-colors"
                        title="Remove file"
                      >
                        <HiOutlineX className="w-5 h-5" />
                      </button>
                    )}
                    {analysis && (
                      <span className="telemetry-chip-active text-[10px] flex items-center gap-1">
                        <HiOutlineCheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                        PARSED
                      </span>
                    )}
                  </div>

                  {/* Upload Progress Bar */}
                  {uploading && (
                    <div className="space-y-2 pt-1">
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="text-iq-ice/70">Extracting AST skill tokens &amp; structural layout...</span>
                        <span className="text-iq-blue font-bold">{uploadProgress}%</span>
                      </div>
                      <div className="h-1.5 bg-iq-ice/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-iq-blue rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  {!uploading && !analysis && (
                    <button
                      id="resume-upload-btn"
                      onClick={() => {
                        playMechanicalToggle(true);
                        handleUpload();
                      }}
                      onMouseEnter={playHoverTick}
                      data-sfx="toggle"
                      className="iq-button-blue w-full py-2.5 flex items-center justify-center gap-2 text-xs"
                    >
                      <HiOutlineSparkles className="w-4 h-4" />
                      <span>INITIALIZE AST RESUME AUDIT</span>
                    </button>
                  )}

                  {analysis && (
                    <button
                      onClick={() => {
                        playMechanicalToggle(true);
                        removeFile();
                      }}
                      onMouseEnter={playHoverTick}
                      data-sfx="toggle"
                      className="iq-button-void w-full py-2 flex items-center justify-center gap-2 text-xs"
                    >
                      <HiOutlineUpload className="w-3.5 h-3.5" />
                      <span>MOUNT REVISED SPECIFICATION FILE</span>
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
                      desc: 'Composite index evaluating technical pedigree, ATS compliance, and clarity.'
                    },
                    {
                      type: 'ats',
                      title: 'ATS Compliance',
                      score: analysis.atsScore,
                      desc: 'Compatibility with enterprise Applicant Tracking Systems and keyword indexing.'
                    },
                    {
                      type: 'recruiter',
                      title: 'Recruiter Impact',
                      score: analysis.recruiterScore,
                      desc: 'Scannability, dense impact statements, action verbs, and hierarchy.'
                    },
                    {
                      type: 'technical',
                      title: 'Tech Depth',
                      score: analysis.technicalDepthScore,
                      desc: 'Presence of modern distributed systems, production tooling, and frameworks.'
                    },
                    {
                      type: 'readiness',
                      title: 'Interview Anchor',
                      score: analysis.interviewReadinessScore,
                      desc: 'Quantified metrics and engineering rationales suitable for technical grill questions.'
                    },
                  ].map((item) => (
                    <button
                      key={item.type}
                      type="button"
                      onClick={() => {
                        playMechanicalToggle(true);
                        handleScoreClick(item.type, item.title, item.score, item.desc);
                      }}
                      onMouseEnter={playHoverTick}
                      data-sfx="toggle"
                      className="iq-panel p-4 text-center hover:border-iq-blue/50 hover:shadow-lg transition-all flex flex-col items-center justify-between group"
                    >
                      <span className="text-[10px] font-mono uppercase tracking-wider text-iq-ice/70 block mb-2">{item.title}</span>
                      <div className={`w-14 h-14 rounded-full border-2 ${getScoreBorder(item.score)} flex items-center justify-center my-1`}>
                        <span className={`text-lg font-mono font-bold ${getScoreColor(item.score)}`}>
                          {item.score || 0}
                        </span>
                      </div>
                      <span className="text-[9px] font-mono text-iq-ice/40 group-hover:text-iq-blue mt-1 block">INSPECT ↗</span>
                    </button>
                  ))}
                </div>

                {/* Detected Skills */}
                {analysis.skills && analysis.skills.length > 0 && (
                  <div className="iq-panel p-6 space-y-3">
                    <div className="flex items-center justify-between pb-3 border-b border-iq-ice/15">
                      <div className="flex items-center gap-2">
                        <HiOutlineLightningBolt className="w-4 h-4 text-iq-blue" />
                        <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                          Extracted Skill Vertices
                        </h3>
                      </div>
                      <span className="telemetry-chip text-[9px]">{analysis.skills.length} DETECTED</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {analysis.skills.map((skill, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-md bg-[#000307] border border-iq-ice/20 text-[11px] font-mono text-iq-ice hover:border-iq-blue/50 transition-colors"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Suggestions List */}
                {analysis.suggestions && analysis.suggestions.length > 0 && (
                  <div className="iq-panel p-6 space-y-3">
                    <div className="flex items-center gap-2 pb-3 border-b border-iq-ice/15">
                      <HiOutlineClipboardCheck className="w-4 h-4 text-iq-blue" />
                      <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                        Remediation Action Items
                      </h3>
                    </div>
                    <div className="space-y-2.5">
                      {analysis.suggestions.map((s, i) => (
                        <div
                          key={i}
                          className="p-3.5 rounded-xl bg-[#000307]/70 border border-iq-ice/15 flex items-start gap-3"
                        >
                          <div className="mt-0.5 flex-shrink-0">
                            {s.priority === 'high' ? (
                              <span className="w-5 h-5 rounded-md bg-iq-alert/20 border border-iq-alert/40 text-red-400 flex items-center justify-center text-xs font-mono font-bold">
                                !
                              </span>
                            ) : s.priority === 'medium' ? (
                              <span className="w-5 h-5 rounded-md bg-amber-950/40 border border-amber-500/40 text-amber-300 flex items-center justify-center text-xs font-mono font-bold">
                                ▲
                              </span>
                            ) : (
                              <span className="w-5 h-5 rounded-md bg-iq-blue/20 border border-iq-blue/40 text-iq-ice flex items-center justify-center text-xs font-mono font-bold">
                                •
                              </span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-xs font-display font-bold text-white">{s.title}</p>
                              <span className="text-[9px] font-mono text-iq-ice/40 uppercase">{s.priority} PRIORITY</span>
                            </div>
                            <p className="text-xs font-ui text-iq-ice/70 mt-1 leading-relaxed">{s.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Final Resume-Ready Content Block: PAPER MODE CANVAS */}
                {analysis.finalResumeContent && (
                  <div className="iq-panel-paper p-6 sm:p-8 space-y-4 shadow-xl">
                    <div className="flex items-center justify-between pb-3 border-b border-[#00050a]/20">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-slate-600 uppercase tracking-widest">
                          [SPEC-SHEET: OPTIMIZED DRAFTING COPY // PAPER MODE]
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          playMechanicalToggle(true);
                          navigator.clipboard.writeText(analysis.finalResumeContent);
                          toast.success('Clean specification copied to clipboard');
                        }}
                        onMouseEnter={playHoverTick}
                        data-sfx="toggle"
                        className="iq-button-paper text-xs py-1.5 px-3"
                      >
                        Copy Clean Spec
                      </button>
                    </div>
                    <pre className="p-4 rounded-xl bg-white border border-[#00050a]/15 font-mono text-xs text-[#00050a] whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto">
                      {analysis.finalResumeContent}
                    </pre>
                  </div>
                )}

              </div>
            )}

          </div>

          {/* Right Column: Tips & Standards */}
          <div className="lg:col-span-4 space-y-4">
            <div className="iq-panel p-6 space-y-4">
              <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider border-b border-iq-ice/15 pb-2">
                Engineering Spec Standards
              </h3>
              <div className="space-y-3">
                {[
                  { icon: HiOutlineBadgeCheck, title: 'Dense Action Verbs', desc: 'Commence impact statements with Architected, Specced, Benchmarked, Hardened.' },
                  { icon: HiOutlineChartBar, title: 'Quantifiable Telemetry', desc: 'Cite latency drops, throughput increases, TPS benchmarks, memory bounds.' },
                  { icon: HiOutlineLightningBolt, title: 'Calibrated Ontologies', desc: 'Deploy standard production keywords rather than proprietary jargon.' },
                  { icon: HiOutlineDocumentText, title: 'Linear Single-Column Layout', desc: 'Single-stream layout prevents OCR distortion in legacy parser pipelines.' },
                ].map(({ icon: Icon, title, desc }, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-iq-ice/5 border border-iq-ice/15 text-iq-blue flex-shrink-0 mt-0.5">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-display font-bold text-white">{title}</p>
                      <p className="text-[11px] font-ui text-iq-ice/60 mt-0.5 leading-relaxed">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="iq-panel p-5 text-xs text-iq-ice/70 space-y-2 border-iq-blue/30 bg-iq-blue/5">
              <div className="flex items-center gap-1.5 font-bold text-white font-mono text-xs uppercase">
                <HiOutlineCheckCircle className="w-4 h-4 text-iq-blue" />
                <span>Next Operational Step</span>
              </div>
              <p className="text-[11px] font-ui text-iq-ice/70 leading-relaxed">
                Once satisfied with your parsed skill graph, select a <strong>Resume-Based Interview</strong> in the simulation tab to face customized questions addressing your documented projects.
              </p>
            </div>
          </div>

        </div>

        {/* Detailed Modal Breakdown */}
        {selectedScore && (
          <div className="fixed inset-0 bg-[#00050a]/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
            <div className="iq-panel max-w-xl w-full p-6 sm:p-7 shadow-2xl space-y-5 animate-scale-up relative">
              <button
                onClick={() => {
                  playMechanicalToggle(false);
                  setSelectedScore(null);
                }}
                onMouseEnter={playHoverTick}
                className="absolute top-4 right-4 p-1.5 rounded-lg text-iq-ice/40 hover:text-white hover:bg-iq-ice/10 transition-colors"
              >
                <HiOutlineX className="w-5 h-5" />
              </button>

              <div className="flex items-start gap-4 pr-8">
                <div className={`w-14 h-14 rounded-full border-2 ${getScoreBorder(selectedScore.value)} flex items-center justify-center flex-shrink-0`}>
                  <span className={`text-xl font-bold font-mono ${getScoreColor(selectedScore.value)}`}>
                    {selectedScore.value || 0}
                  </span>
                </div>
                <div>
                  <span className="font-mono text-[9px] text-iq-blue uppercase tracking-widest">
                    [DIMENSIONAL AUDIT]
                  </span>
                  <h2 className="text-base font-display font-bold text-white">{selectedScore.title} Breakdown</h2>
                  <p className="text-xs font-ui text-iq-ice/70 mt-1 leading-relaxed">{selectedScore.description}</p>
                </div>
              </div>

              {/* Suggestions for Selected Dimension */}
              <div className="space-y-3 pt-2 border-t border-iq-ice/15">
                <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  Targeted Feedback &amp; Remediation
                </h3>
                {getSuggestionsForScore(selectedScore.type, analysis?.suggestions).length > 0 ? (
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {getSuggestionsForScore(selectedScore.type, analysis?.suggestions).map((s, idx) => (
                      <div key={idx} className="p-3 rounded-lg bg-[#000307]/80 border border-iq-ice/15 text-xs">
                        <p className="font-display font-bold text-white">{s.title}</p>
                        <p className="text-iq-ice/70 font-ui mt-0.5 leading-relaxed">{s.description}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-center space-y-1">
                    <HiOutlineCheckCircle className="w-6 h-6 text-emerald-400 mx-auto" />
                    <p className="text-xs font-mono font-bold text-emerald-300">CALIBRATION OPTIMAL</p>
                    <p className="text-[11px] font-ui text-iq-ice/60">No structural anomalies detected in this specific dimension.</p>
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => {
                    playMechanicalToggle(false);
                    setSelectedScore(null);
                  }}
                  onMouseEnter={playHoverTick}
                  className="iq-button-void text-xs py-2 px-4"
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
