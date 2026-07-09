import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { UploadCloud, FileText, Loader2, CheckCircle, Video, Map, ArrowRight, ShieldCheck } from 'lucide-react';

const ANALYSIS_STEPS = [
  "Scanning resume text for core competencies...",
  "Extracting tech stack and project architecture...",
  "Cross-referencing with top-tier SDE requirements...",
  "Crafting personalized DSA & Behavioral simulations...",
  "Profile Calibrated."
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [isDragActive, setIsDragActive] = useState(false);
  
  const [isUploading, setIsUploading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [showOptions, setShowOptions] = useState(false);

  // --- DRAG AND DROP HANDLERS ---
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = () => {
    setIsDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragActive(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === 'application/pdf') {
      setFile(droppedFile);
      setError('');
    } else {
      setError('Please drop a valid PDF file.');
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setError('');
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('resume', file);

    try {
      // Hit your backend
      await api.post('/resume/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      setIsUploading(false);
      setShowModal(true);
    } catch (err) {
      console.error(err);
      setError('Failed to upload resume. Please try again.');
      setIsUploading(false);
    }
  };

  // --- THE "LABOR ILLUSION" TIMER ---
  useEffect(() => {
    if (!showModal) return;
    const timer = setInterval(() => {
      setStepIndex((prev) => {
        if (prev < ANALYSIS_STEPS.length - 1) {
          return prev + 1;
        } else {
          clearInterval(timer);
          setTimeout(() => setShowOptions(true), 800);
          return prev;
        }
      });
    }, 1200);
    return () => clearInterval(timer);
  }, [showModal]);

  return (
    <div style={{
      minHeight: '100vh', backgroundColor: '#000000',
      backgroundImage: 'radial-gradient(circle at 50% 0%, #1a1a24 0%, #000000 70%)',
      color: '#ffffff', fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '60px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center'
    }}>

      {/* --- THE MAGIC MODAL & STRATEGIC FORK --- */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.9)', zIndex: 50,
          display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(12px)'
        }}>
          <div style={{
            backgroundColor: 'rgba(20, 20, 25, 0.95)', border: '1px solid #333',
            borderRadius: '24px', padding: '50px', width: '90%', maxWidth: showOptions ? '700px' : '500px',
            textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)', transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
          }}>
            
            {!showOptions ? (
              // PHASE 1: SCANNING
              <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
                {stepIndex < ANALYSIS_STEPS.length - 1 ? (
                  <Loader2 size={56} color="#86efac" style={{ animation: 'spin 2s linear infinite', margin: '0 auto 24px auto' }} />
                ) : (
                  <ShieldCheck size={56} color="#86efac" style={{ margin: '0 auto 24px auto' }} />
                )}
                <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '12px' }}>Analyzing Profile Profile</h2>
                <p style={{ color: stepIndex === ANALYSIS_STEPS.length - 1 ? '#86efac' : '#888', fontSize: '16px', transition: 'color 0.3s' }}>
                  {ANALYSIS_STEPS[stepIndex]}
                </p>
                <div style={{ width: '100%', height: '4px', backgroundColor: '#222', borderRadius: '2px', marginTop: '40px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', backgroundColor: '#86efac', transition: 'width 1.2s ease-in-out',
                    width: `${((stepIndex + 1) / ANALYSIS_STEPS.length) * 100}%`,
                    boxShadow: '0 0 10px rgba(134, 239, 172, 0.5)'
                  }} />
                </div>
              </div>
            ) : (
              // PHASE 2: THE FORK
              <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
                <ShieldCheck size={56} color="#86efac" style={{ margin: '0 auto 20px auto' }} />
                <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '10px' }}>Profile Calibrated</h2>
                <p style={{ color: '#888', marginBottom: '40px', fontSize: '16px' }}>Your technical stack has been mapped. Choose your next move.</p>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                  
                  {/* Option A: Enter the Crucible */}
                  <button onClick={() => navigate('/interview')} style={primaryCardStyle}>
                    <div style={{ backgroundColor: 'rgba(134, 239, 172, 0.1)', padding: '16px', borderRadius: '50%', marginBottom: '20px' }}>
                      <Video size={32} color="#86efac" />
                    </div>
                    <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#fff', marginBottom: '10px' }}>Enter the Crucible</h3>
                    <p style={{ color: '#aaa', fontSize: '14px', lineHeight: '1.5', marginBottom: '20px' }}>
                      Face a rigorous, AI-driven video interview simulating top-tier tech companies.
                    </p>
                    <div style={{ color: '#86efac', fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      Start Interview <ArrowRight size={16} />
                    </div>
                  </button>

                  {/* Option B: Tactical Planning */}
                  <button onClick={() => navigate('/roadmap')} style={secondaryCardStyle}>
                    <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', padding: '16px', borderRadius: '50%', marginBottom: '20px' }}>
                      <Map size={32} color="#fff" />
                    </div>
                    <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#fff', marginBottom: '10px' }}>Tactical Planning</h3>
                    <p style={{ color: '#888', fontSize: '14px', lineHeight: '1.5', marginBottom: '20px' }}>
                      Skip the interview for now and generate a customized multi-week preparation schedule.
                    </p>
                    <div style={{ color: '#fff', fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      Configure Roadmap <ArrowRight size={16} />
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- THE COMMAND CENTER UI --- */}
      <div style={{ width: '100%', maxWidth: '700px', textAlign: 'center', filter: showModal ? 'blur(8px)' : 'none', transition: 'filter 0.4s' }}>
        
        <h1 style={{ fontSize: '48px', fontWeight: '800', marginBottom: '20px', letterSpacing: '-1px' }}>
          Calibrate Your <span style={{ color: '#86efac' }}>Engineering Profile</span>
        </h1>
        <p style={{ color: '#888', fontSize: '18px', lineHeight: '1.6', marginBottom: '50px', padding: '0 20px' }}>
          Upload your resume to instantly map your technical stack, identify algorithmic blind spots, and simulate high-pressure SDE interviews.
        </p>

        {error && (
          <div style={{ color: '#fca5a5', backgroundColor: 'rgba(220, 38, 38, 0.1)', border: '1px solid #dc2626', padding: '12px', borderRadius: '8px', marginBottom: '20px' }}>
            {error}
          </div>
        )}

        {/* DRAG AND DROP ZONE */}
        <div 
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          style={{
            border: `2px dashed ${isDragActive ? '#86efac' : file ? '#333' : '#333'}`,
            backgroundColor: isDragActive ? 'rgba(134, 239, 172, 0.05)' : file ? 'rgba(255, 255, 255, 0.02)' : 'rgba(10, 10, 10, 0.5)',
            borderRadius: '24px', padding: '60px 20px', cursor: 'pointer', transition: 'all 0.3s ease',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
          }}
          onClick={() => document.getElementById('file-upload').click()}
        >
          <input id="file-upload" type="file" accept="application/pdf" onChange={handleFileChange} style={{ display: 'none' }} />
          
          {file ? (
            <>
              <FileText size={64} color="#86efac" style={{ marginBottom: '20px' }} />
              <h3 style={{ fontSize: '20px', color: '#fff', marginBottom: '8px' }}>{file.name}</h3>
              <p style={{ color: '#86efac', fontSize: '14px', fontWeight: '500' }}>Ready for Calibration</p>
            </>
          ) : (
            <>
              <UploadCloud size={64} color={isDragActive ? '#86efac' : '#555'} style={{ marginBottom: '20px', transition: 'color 0.3s' }} />
              <h3 style={{ fontSize: '22px', color: '#fff', marginBottom: '8px', fontWeight: '600' }}>Drag & Drop your Resume</h3>
              <p style={{ color: '#666', fontSize: '15px' }}>or click to browse (PDF only)</p>
            </>
          )}
        </div>

        {/* INITIATE BUTTON */}
        <button 
          onClick={handleUpload}
          disabled={isUploading || !file}
          style={{
            width: '100%', padding: '18px', marginTop: '30px',
            backgroundColor: (isUploading || !file) ? '#222' : '#ffffff',
            color: (isUploading || !file) ? '#666' : '#000000',
            border: 'none', borderRadius: '12px', fontSize: '18px', fontWeight: '700',
            cursor: (isUploading || !file) ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s',
            boxShadow: file && !isUploading ? '0 10px 25px -5px rgba(255, 255, 255, 0.1)' : 'none'
          }}
        >
          {isUploading ? 'Initializing System...' : 'Initiate Calibration sequence'}
        </button>

      </div>

      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}

const primaryCardStyle = {
  backgroundColor: 'rgba(15, 15, 20, 0.9)', border: '1px solid rgba(134, 239, 172, 0.3)',
  borderRadius: '16px', padding: '30px 20px', cursor: 'pointer', display: 'flex',
  flexDirection: 'column', alignItems: 'center', textAlign: 'center', transition: 'all 0.2s',
  boxShadow: '0 10px 30px -10px rgba(134, 239, 172, 0.1)'
};

const secondaryCardStyle = {
  backgroundColor: 'rgba(255, 255, 255, 0.03)', border: '1px solid #333',
  borderRadius: '16px', padding: '30px 20px', cursor: 'pointer', display: 'flex',
  flexDirection: 'column', alignItems: 'center', textAlign: 'center', transition: 'all 0.2s'
};