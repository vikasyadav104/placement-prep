import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Play, Send, CheckCircle, AlertCircle, ArrowLeft, Video, VideoOff, Volume2, Mic, MicOff, ArrowRight } from 'lucide-react';

export default function Interview() {
  const navigate = useNavigate();
  
  const [stage, setStage] = useState('setup'); 
  const [error, setError] = useState('');
  
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  
  const [currentText, setCurrentText] = useState('');
  const [questionStartTime, setQuestionStartTime] = useState(null);
  const [results, setResults] = useState(null);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);

  // Speech-to-Text Refs and State
  const recognitionRef = useRef(null);
  const [isListening, setIsListening] = useState(false);
  const isUserIntendingToListen = useRef(false);

  // --- SETUP: Initialize Speech Recognition ---
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true; 
      recognitionRef.current.interimResults = true; 

      recognitionRef.current.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + ' ';
          }
        }
        if (finalTranscript) {
          setCurrentText(prev => prev + finalTranscript);
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        // Stop infinite loop if actual network/permission error
        if (event.error === 'not-allowed' || event.error === 'network') {
          isUserIntendingToListen.current = false;
          setIsListening(false);
        }
      };

      recognitionRef.current.onend = () => {
        if (isUserIntendingToListen.current) {
          try {
            recognitionRef.current.start();
          } catch (e) {
            // Catch error if already starting
          }
        } else {
          setIsListening(false);
        }
      };
    } else {
      console.warn("Speech Recognition API is not supported in this browser. Use Chrome or Edge.");
    }
  }, []);

  // --- CLEANUP ---
  useEffect(() => {
    return () => {
      stopCamera();
      window.speechSynthesis.cancel();
      isUserIntendingToListen.current = false;
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, []);

  // --- VOICE: Speak the question ---
  useEffect(() => {
    if (stage === 'interviewing' && questions.length > 0) {
      window.speechSynthesis.cancel(); 
      const text = questions[currentIndex].question;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95; 
      window.speechSynthesis.speak(utterance);
    }
  }, [currentIndex, stage, questions]);

  // --- CAMERA LOGIC ---
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true }); 
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraActive(true);
    } catch (err) {
      console.error("Camera/Mic access denied:", err);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      setCameraActive(false);
    }
  };

  // --- MICROPHONE TOGGLE ---
  const toggleListening = () => {
    if (isListening) {
      isUserIntendingToListen.current = false;
      setIsListening(false);
      recognitionRef.current?.stop();
    } else {
      isUserIntendingToListen.current = true;
      setIsListening(true);
      window.speechSynthesis.cancel();
      try {
        recognitionRef.current?.start();
      } catch (e) {
        console.log("Mic already starting");
      }
    }
  };

  const startInterview = async () => {
    setStage('setup');
    setError('');
    try {
      const response = await api.post('/interview/generate-questions');
      setQuestions(response.data.questions);
      await startCamera();
      setStage('interviewing');
      setQuestionStartTime(Date.now());
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate questions. Did you upload a resume?');
    }
  };

  const handleNext = async () => {
    if (!currentText.trim()) return;

    if (isListening) {
      isUserIntendingToListen.current = false;
      recognitionRef.current?.stop();
      setIsListening(false);
    }

    const timeTaken = Math.floor((Date.now() - questionStartTime) / 1000);
    const currentQ = questions[currentIndex];

    const newAnswer = {
      question: currentQ.question,
      type: currentQ.type,
      userAnswerTranscript: currentText,
      timeTakenSeconds: timeTaken,
    };

    const updatedAnswers = [...answers, newAnswer];
    setAnswers(updatedAnswers);
    setCurrentText('');

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setQuestionStartTime(Date.now());
    } else {
      submitSession(updatedAnswers);
    }
  };

  const submitSession = async (finalAnswers) => {
    setStage('evaluating');
    stopCamera(); 
    window.speechSynthesis.cancel(); 
    isUserIntendingToListen.current = false;
    if (recognitionRef.current) recognitionRef.current.stop();

    try {
      const response = await api.post('/interview/submit-session', { questions: finalAnswers });
      setResults(response.data.session);
      setStage('results');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit interview for evaluation.');
      setStage('interviewing'); 
      startCamera(); 
    }
  };

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
      alignItems: 'center'
    }}>
      <div style={{ width: '100%', maxWidth: '900px' }}>
        
        <button onClick={() => navigate('/dashboard')} style={{ background: 'transparent', border: 'none', color: '#888', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '30px', fontSize: '15px' }}>
          <ArrowLeft size={18} /> Exit Interview
        </button>

        {error && (
          <div style={{ backgroundColor: 'rgba(220, 38, 38, 0.1)', border: '1px solid #dc2626', color: '#fca5a5', padding: '12px', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={18} /> {error}
          </div>
        )}

        {/* SETUP */}
        {stage === 'setup' && questions.length === 0 && (
          <div className="glass-card" style={glassStyle}>
            <h1 style={{ fontSize: '28px', marginBottom: '10px' }}>Immersive Mock Interview</h1>
            <p style={{ color: '#888', marginBottom: '30px', lineHeight: '1.5' }}>
              Your browser will ask for camera and microphone permissions. The AI will speak the questions out loud. You can use your voice to answer, and we will transcribe it in real-time.
            </p>
            <button onClick={startInterview} style={primaryBtn}>
              <Video size={18} /> Start Video Interview
            </button>
          </div>
        )}

        {/* LOADING */}
        {stage === 'setup' && questions.length > 0 && <div style={{ textAlign: 'center', padding: '50px' }}>Generating personalized questions...</div>}
        {stage === 'evaluating' && <div style={{ textAlign: 'center', padding: '50px', color: '#86efac' }}>Gemini is analyzing your responses...</div>}

        {/* INTERVIEWING */}
        {stage === 'interviewing' && questions.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '20px', animation: 'fadeIn 0.5s ease-out' }}>
            
            {/* Left Column: Video */}
            <div className="glass-card" style={{...glassStyle, padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
              <div style={{ width: '100%', aspectRatio: '4/3', backgroundColor: '#111', borderRadius: '12px', overflow: 'hidden', position: 'relative', border: '1px solid #333' }}>
                <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)', display: cameraActive ? 'block' : 'none' }} />
                {!cameraActive && (
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#555' }}>
                    <VideoOff size={32} style={{ marginBottom: '10px' }} />
                    <span style={{ fontSize: '13px' }}>Camera Disabled</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Question & Answer */}
            <div className="glass-card" style={glassStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#888', fontSize: '14px', marginBottom: '20px' }}>
                <span style={{ textTransform: 'uppercase', color: '#86efac', display: 'flex', alignItems: 'center', gap: '6px' }}><Volume2 size={14} /> {questions[currentIndex].type} Question</span>
                <span>Question {currentIndex + 1} of {questions.length}</span>
              </div>
              
              <h2 style={{ fontSize: '22px', fontWeight: '500', marginBottom: '20px', lineHeight: '1.4' }}>{questions[currentIndex].question}</h2>

              {/* Voice Record Button */}
              <button 
                onClick={toggleListening}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '8px', border: 'none',
                  backgroundColor: isListening ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255,255,255,0.1)',
                  color: isListening ? '#fca5a5' : '#ffffff',
                  cursor: 'pointer', transition: 'all 0.2s', fontWeight: '600'
                }}
              >
                {isListening ? (
                  <><Mic size={18} color="#ef4444" style={{ animation: 'pulse 2s infinite' }} /> Stop Recording...</>
                ) : (
                  <><MicOff size={18} /> Click to Answer with Voice</>
                )}
              </button>

              <textarea 
                value={currentText}
                onChange={(e) => setCurrentText(e.target.value)}
                placeholder={isListening ? "Listening..." : "Your transcribed answer will appear here. You can also type to edit it..."}
                style={{ width: '100%', height: '140px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid #333', borderRadius: '8px', color: '#fff', padding: '15px', fontSize: '16px', lineHeight: '1.5', resize: 'none', outline: 'none', marginBottom: '20px' }}
              />

              <button onClick={handleNext} disabled={!currentText.trim()} style={{...primaryBtn, opacity: currentText.trim() ? 1 : 0.5}}>
                {currentIndex < questions.length - 1 ? 'Submit & Next' : 'Finish Interview'} <Send size={18} />
              </button>
            </div>
          </div>
        )}

        {/* RESULTS - UPGRADED SIDE-BY-SIDE COMPARISON */}
        {stage === 'results' && results && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', animation: 'fadeIn 0.5s ease-out' }}>
            
            {/* Top Summary Card */}
            <div className="glass-card" style={{...glassStyle, borderColor: '#86efac', textAlign: 'center'}}>
              <h2 style={{ fontSize: '32px', marginBottom: '10px', color: '#fff' }}>Interview Complete</h2>
              <div style={{ fontSize: '48px', fontWeight: '800', color: '#86efac', marginBottom: '15px' }}>
                {results.overallScore}/100
              </div>
              <p style={{ lineHeight: '1.6', fontSize: '16px', color: '#ccc', maxWidth: '600px', margin: '0 auto' }}>
                {results.overallFeedback}
              </p>
            </div>

            {/* Detailed Question-by-Question Breakdown */}
            <h3 style={{ fontSize: '24px', fontWeight: '600', marginTop: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CheckCircle color="#86efac" /> Post-Match Analysis
            </h3>

            {results.detailedAnalysis && results.detailedAnalysis.map((item, index) => (
              <div key={index} style={{ backgroundColor: 'rgba(20, 20, 25, 0.9)', border: '1px solid #333', borderRadius: '16px', overflow: 'hidden' }}>
                
                {/* Question Header */}
                <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', padding: '20px', borderBottom: '1px solid #333' }}>
                  <div style={{ color: '#888', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Question {index + 1}</div>
                  <div style={{ fontSize: '18px', fontWeight: '600', lineHeight: '1.4' }}>{item.question}</div>
                  <div style={{ display: 'inline-block', marginTop: '10px', padding: '4px 10px', backgroundColor: item.score >= 7 ? 'rgba(134, 239, 172, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: item.score >= 7 ? '#86efac' : '#fca5a5', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>
                    Score: {item.score}/10
                  </div>
                </div>

                {/* Answer Comparison Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', backgroundColor: '#333' }}>
                  
                  {/* Left Column: What the user said */}
                  <div style={{ backgroundColor: 'rgba(20, 20, 25, 1)', padding: '20px' }}>
                    <div style={{ color: '#fca5a5', fontSize: '14px', fontWeight: '600', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <AlertCircle size={16} /> What you said
                    </div>
                    <p style={{ color: '#ccc', fontSize: '15px', lineHeight: '1.6', fontStyle: 'italic', backgroundColor: 'rgba(255,255,255,0.02)', padding: '15px', borderRadius: '8px' }}>
                      "{item.userAnswer || "No verbal response detected."}"
                    </p>
                    <div style={{ marginTop: '15px', color: '#888', fontSize: '14px', lineHeight: '1.5' }}>
                      <strong style={{ color: '#fff' }}>Critique:</strong> {item.critique}
                    </div>
                  </div>

                  {/* Right Column: What they SHOULD have said */}
                  <div style={{ backgroundColor: 'rgba(20, 20, 25, 1)', padding: '20px' }}>
                    <div style={{ color: '#86efac', fontSize: '14px', fontWeight: '600', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <CheckCircle size={16} /> What you should say instead
                    </div>
                    <p style={{ color: '#fff', fontSize: '15px', lineHeight: '1.6', backgroundColor: 'rgba(134, 239, 172, 0.05)', padding: '15px', borderRadius: '8px', border: '1px solid rgba(134, 239, 172, 0.2)' }}>
                      {item.idealResponse}
                    </p>
                  </div>

                </div>
              </div>
            ))}

            {/* Strategic Call to Action to Roadmap */}
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
              <button 
                onClick={() => navigate('/roadmap')}
                style={{
                  padding: '16px 32px', backgroundColor: '#ffffff', color: '#000000', border: 'none', borderRadius: '12px',
                  fontSize: '18px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px',
                  boxShadow: '0 4px 14px 0 rgba(255, 255, 255, 0.1)'
                }}
              >
                Generate Custom Roadmap based on these weaknesses <ArrowRight size={20} />
              </button>
            </div>

          </div>
        )}
      </div>
      <style>{`
        @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}

const glassStyle = { backgroundColor: 'rgba(10, 10, 10, 0.8)', border: '1px solid #222', borderRadius: '16px', padding: '40px', backdropFilter: 'blur(10px)' };
const primaryBtn = { width: '100%', padding: '14px', backgroundColor: '#ffffff', color: '#000000', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', transition: 'background-color 0.2s' };