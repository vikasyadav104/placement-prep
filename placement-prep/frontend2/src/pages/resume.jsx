import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Upload, FileText, AlertCircle, ArrowLeft, Loader2, CheckCircle, Video, Map } from 'lucide-react';

const ANALYSIS_STEPS = [
  "Scanning resume text...",
  "Extracting tech stack and projects...",
  "Analyzing LeetCode & Codeforces stats...",
  "Crafting personalized DSA & Behavioral questions...",
  "Profile Ready!"
];

export default function Resume() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  
  const [isUploading, setIsUploading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  
  // NEW: State to show the choices after analysis is done
  const [showOptions, setShowOptions] = useState(false); 

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setError('');
    } else {
      setFile(null);
      setError('Please select a valid PDF file.');
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file first.');
      return;
    }

    setIsUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('resume', file);

    try {
      await api.post('/resume/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      setIsUploading(false);
      setShowModal(true);

    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to upload resume. Please try again.');
      setIsUploading(false);
    }
  };

  // The "Labor Illusion" Timer
  useEffect(() => {
    if (!showModal) return;

    const timer = setInterval(() => {
      setStepIndex((prev) => {
        if (prev < ANALYSIS_STEPS.length - 1) {
          return prev + 1;
        } else {
          clearInterval(timer);
          // NEW: Instead of navigating immediately, show the selection options!
          setTimeout(() => {
            setShowOptions(true);
          }, 800);
          return prev;
        }
      });
    }, 1200);

    return () => clearInterval(timer);
  }, [showModal]);

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#000000',
      backgroundImage: 'radial-gradient(circle at 50% 0%, #1a1a24 0%, #000000 70%)',
      color: '#ffffff',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '40px 20px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      position: 'relative'
    }}>
      
      {/* --- THE MAGIC MODAL OVERLAY --- */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 50,
          display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)'
        }}>
          <div style={{
            backgroundColor: 'rgba(20, 20, 25, 0.9)', border: '1px solid #333',
            borderRadius: '16px', padding: '50px', width: '90%', maxWidth: showOptions ? '600px' : '450px',
            textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', transition: 'all 0.3s ease'
          }}>
            
            {!showOptions ? (
              // STEP 1: SHOW THE LOADING ANIMATION
              <>
                {stepIndex < ANALYSIS_STEPS.length - 1 ? (
                  <Loader2 size={48} color="#86efac" style={{ animation: 'spin 2s linear infinite', margin: '0 auto 20px auto' }} />
                ) : (
                  <CheckCircle size={48} color="#86efac" style={{ margin: '0 auto 20px auto' }} />
                )}
                <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '10px' }}>AI Analysis in Progress</h2>
                <p style={{ color: stepIndex === ANALYSIS_STEPS.length - 1 ? '#86efac' : '#888', fontSize: '15px', transition: 'color 0.3s' }}>
                  {ANALYSIS_STEPS[stepIndex]}
                </p>
                <div style={{ width: '100%', height: '4px', backgroundColor: '#333', borderRadius: '2px', marginTop: '30px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', backgroundColor: '#86efac', transition: 'width 1.2s ease-in-out',
                    width: `${((stepIndex + 1) / ANALYSIS_STEPS.length) * 100}%`
                  }} />
                </div>
              </>
            ) : (
              // STEP 2: SHOW THE CHOICES ONCE DONE
              <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
                <CheckCircle size={56} color="#86efac" style={{ margin: '0 auto 20px auto' }} />
                <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '10px' }}>Analysis Complete</h2>
                <p style={{ color: '#888', marginBottom: '30px' }}>Your profile has been mapped. What would you like to do next?</p>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  
                  {/* Option 1: Interview */}
                  <button onClick={() => navigate('/interview')} style={optionCardStyle}>
                    <Video size={32} color="#ffffff" style={{ marginBottom: '15px' }} />
                    <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#fff', marginBottom: '8px' }}>Mock Interview</h3>
                    <p style={{ color: '#888', fontSize: '13px', lineHeight: '1.4' }}>Test your skills with an AI voice interviewer.</p>
                  </button>

                  {/* Option 2: Roadmap */}
                  <button onClick={() => navigate('/roadmap')} style={optionCardStyle}>
                    <Map size={32} color="#ffffff" style={{ marginBottom: '15px' }} />
                    <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#fff', marginBottom: '8px' }}>Study Roadmap</h3>
                    <p style={{ color: '#888', fontSize: '13px', lineHeight: '1.4' }}>Generate a 4-week custom prep schedule.</p>
                  </button>

                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* --- STANDARD UPLOAD PAGE --- */}
      <div style={{ width: '100%', maxWidth: '600px', filter: showModal ? 'blur(4px)' : 'none', transition: 'filter 0.3s' }}>
        <button onClick={() => navigate('/dashboard')} style={{ background: 'transparent', border: 'none', color: '#888', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '30px', fontSize: '15px' }}>
          <ArrowLeft size={18} /> Back to Dashboard
        </button>

        <div style={{ backgroundColor: 'rgba(10, 10, 10, 0.8)', border: '1px solid #222', borderRadius: '16px', padding: '40px', backdropFilter: 'blur(10px)', textAlign: 'center' }}>
          <FileText size={48} color="#86efac" style={{ marginBottom: '20px' }} />
          <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '10px' }}>Upload Your Resume</h1>
          <p style={{ color: '#888', marginBottom: '30px', lineHeight: '1.5' }}>
            Upload your latest PDF resume. Our AI will extract your tech stack and project history to tailor your mock interviews perfectly.
          </p>

          {error && (
            <div style={{ backgroundColor: 'rgba(220, 38, 38, 0.1)', border: '1px solid #dc2626', color: '#fca5a5', padding: '12px', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <AlertCircle size={18} /> {error}
            </div>
          )}

          <form onSubmit={handleUpload}>
            <label style={{ display: 'block', border: '2px dashed #333', borderRadius: '12px', padding: '40px 20px', cursor: 'pointer', backgroundColor: file ? 'rgba(255,255,255,0.02)' : 'transparent', transition: 'all 0.2s ease', marginBottom: '24px' }}>
              <input type="file" accept="application/pdf" onChange={handleFileChange} style={{ display: 'none' }} />
              <Upload size={32} color="#888" style={{ marginBottom: '12px' }} />
              <div style={{ fontSize: '16px', fontWeight: '500', color: file ? '#86efac' : '#fff' }}>
                {file ? file.name : 'Click to select a PDF file'}
              </div>
            </label>

            <button type="submit" disabled={isUploading || !file} style={{ width: '100%', padding: '14px', backgroundColor: (isUploading || !file) ? '#333' : '#ffffff', color: (isUploading || !file) ? '#888' : '#000000', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: (isUploading || !file) ? 'not-allowed' : 'pointer', transition: 'background-color 0.2s' }}>
              {isUploading ? 'Analyzing Document...' : 'Upload & Analyze'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// Styling for the new selection cards
const optionCardStyle = {
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  border: '1px solid #333',
  borderRadius: '12px',
  padding: '25px 20px',
  cursor: 'pointer',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  transition: 'all 0.2s ease',
  outline: 'none'
};