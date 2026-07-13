import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, MicOff, Send, Loader2, ChevronRight, Volume2, ShieldAlert, Play, Activity } from 'lucide-react';
import api from '../services/api';

export default function ActiveInterview() {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const recognitionRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const streamRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);

  // --- Core States ---
  const [status, setStatus] = useState('initializing'); // initializing, ready, active, submitting
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [transcript, setTranscript] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState('');
  const [audioLevel, setAudioLevel] = useState(0); // 0 to 100, live mic volume

  // --- Hardware & API Initialization ---
  useEffect(() => {
    // 1. Boot Camera + Mic, set up audio-level detection + MediaRecorder
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => {
        if (videoRef.current) videoRef.current.srcObject = stream;
        streamRef.current = stream;

        // --- Live audio level detection (Web Audio API) ---
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const source = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);

        audioContextRef.current = audioContext;
        analyserRef.current = analyser;

        const checkAudioLevel = () => {
          const dataArray = new Uint8Array(analyser.frequencyBinCount);
          analyser.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
          setAudioLevel(Math.min(100, Math.round((average / 255) * 100 * 3)));
          animationFrameRef.current = requestAnimationFrame(checkAudioLevel);
        };
        checkAudioLevel();

        // --- MediaRecorder setup (records the session for playback later) ---
        const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
        recordedChunksRef.current = [];
        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) recordedChunksRef.current.push(e.data);
        };
        mediaRecorderRef.current = mediaRecorder;
      })
      .catch(err => {
        console.error("Camera error:", err);
        setError("Camera/Mic access denied. Please allow permissions in your browser.");
      });

    // 2. Boot Speech Recognition Engine
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event) => {
        let currentTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
      };
    } else {
      setError("Your browser does not support AI Speech Recognition (Please use Chrome).");
    }

    // 3. Fetch Questions
    const fetchQuestions = async () => {
      try {
        const res = await api.post('/interview/generate-questions');
        if (res.data.questions && res.data.questions.length > 0) {
          setQuestions(res.data.questions);
          setStatus('ready');
        } else {
          throw new Error("No questions returned from AI.");
        }
      } catch (err) {
        console.error(err);
        setError("Failed to fetch interview questions. Please try again.");
      }
    };

    fetchQuestions();

    // Cleanup on unmount
    return () => {
      window.speechSynthesis.cancel();
      if (recognitionRef.current) recognitionRef.current.stop();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // --- Text to Speech Engine ---
  const speakQuestion = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  // --- Start Interview (Unlocks Audio + Starts Recording) ---
  const handleStartSession = () => {
    setStatus('active');
    speakQuestion(questions[0].question);

    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'inactive') {
      mediaRecorderRef.current.start();
    }
  };

  // --- Mic Toggle ---
  const toggleRecording = () => {
    if (!recognitionRef.current) return;

    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
    setIsRecording(!isRecording);
  };

  // --- Logic Loop: Next Question / Submit ---
  const handleNext = async () => {
    if (!transcript.trim()) return;

    if (isRecording) toggleRecording();
    window.speechSynthesis.cancel();

    const currentQuestion = questions[currentIndex].question;
    const finalTranscript = transcript.trim();
    const newAnswers = [...answers, { question: currentQuestion, userAnswer: finalTranscript }];

    setAnswers(newAnswers);
    setTranscript('');

    if (currentIndex < questions.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      setTimeout(() => speakQuestion(questions[nextIndex].question), 300);
    } else {
      setStatus('submitting');

      // Wait for the recording to fully stop and produce a playable video URL
      const finalVideoURL = await new Promise((resolve) => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.onstop = () => {
            const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
            resolve(URL.createObjectURL(blob));
          };
          mediaRecorderRef.current.stop();
        } else {
          resolve(null);
        }
      });

      try {
        const res = await api.post('/interview/submit-session', { questions: newAnswers });
        navigate('/interview/summary', {
          state: {
            session: res.data.session,
            recordedVideoURL: finalVideoURL,
          }
        });
      } catch (err) {
        console.error("Submission failed", err);
        setError("Failed to evaluate session. AI core overloaded.");
        setStatus('active');
      }
    }
  };

  // --- ERROR STATE UI ---
  if (error) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#050505', color: '#fff', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid #ef4444', padding: '40px', borderRadius: '16px', textAlign: 'center', maxWidth: '400px' }}>
          <ShieldAlert size={48} color="#ef4444" style={{ marginBottom: '16px' }} />
          <h2 style={{ fontSize: '20px', marginBottom: '12px' }}>System Error</h2>
          <p style={{ color: '#aaa', fontSize: '14px', marginBottom: '24px' }}>{error}</p>
          <button onClick={() => navigate('/dashboard')} style={{ padding: '12px 24px', background: '#fff', color: '#000', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', width: '100%' }}>Return to Dashboard</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', width: '100vw', backgroundColor: '#0a0a0a', color: '#fff', display: 'flex', flexDirection: 'column', fontFamily: 'system-ui, -apple-system, sans-serif' }}>

      {/* TOP NAVIGATION BAR */}
      <div style={{ padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #222', backgroundColor: '#050505' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Activity color="#3b82f6" size={24} />
          <span style={{ fontSize: '18px', fontWeight: '700', letterSpacing: '-0.5px' }}>Technical Assessment</span>
        </div>

        {status === 'active' && (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '4px' }}>
              {questions.map((_, idx) => (
                <div key={idx} style={{ width: '32px', height: '4px', borderRadius: '2px', backgroundColor: idx <= currentIndex ? '#3b82f6' : '#333', transition: 'background-color 0.3s' }} />
              ))}
            </div>
            <span style={{ fontSize: '14px', color: '#888', marginLeft: '12px', fontWeight: '500' }}>Q {currentIndex + 1} / {questions.length}</span>
          </div>
        )}
      </div>

      {/* MAIN CONTENT AREA */}
      <div style={{ flex: 1, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'flex-start', padding: '40px 20px', gap: '40px' }}>

        {/* LEFT COLUMN: Camera Feed */}
        <div style={{ width: '100%', maxWidth: '500px', aspectRatio: '4/3', position: 'relative', borderRadius: '16px', overflow: 'hidden', border: '1px solid #333', backgroundColor: '#000', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
          <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />

          {status === 'active' && (
            <div style={{ position: 'absolute', top: '20px', right: '20px', display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(0,0,0,0.6)', padding: '6px 12px', borderRadius: '20px', backdropFilter: 'blur(4px)' }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#ef4444', animation: 'blink 1s infinite' }} />
              <span style={{ fontSize: '12px', fontWeight: '600', color: '#fff' }}>SESSION REC</span>
            </div>
          )}

          {isRecording && (
            <div style={{ position: 'absolute', top: '20px', left: '20px', display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(59,130,246,0.7)', padding: '6px 12px', borderRadius: '20px', backdropFilter: 'blur(4px)' }}>
              <Mic size={12} color="#fff" />
              <span style={{ fontSize: '12px', fontWeight: '600', color: '#fff' }}>LISTENING</span>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Professional Interview Panel */}
        <div style={{ width: '100%', maxWidth: '550px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {status === 'initializing' && (
            <div style={{ flex: 1, backgroundColor: '#111', borderRadius: '16px', border: '1px solid #222', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '60px 40px', textAlign: 'center' }}>
              <Loader2 size={40} color="#3b82f6" style={{ animation: 'spin 2s linear infinite', marginBottom: '20px' }} />
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>Initializing Session</h3>
              <p style={{ fontSize: '14px', color: '#888', lineHeight: '1.5' }}>Generating technical questions based on your profile...</p>
            </div>
          )}

          {status === 'ready' && (
            <div style={{ flex: 1, backgroundColor: '#111', borderRadius: '16px', border: '1px solid #222', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '60px 40px', textAlign: 'center' }}>
              <div style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', padding: '20px', borderRadius: '50%', marginBottom: '24px' }}>
                <Play size={40} color="#3b82f6" style={{ marginLeft: '6px' }} />
              </div>
              <h3 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '12px' }}>Connection Established</h3>
              <p style={{ fontSize: '14px', color: '#888', lineHeight: '1.5', marginBottom: '32px' }}>Ensure your microphone and speakers are on. The AI will speak the questions aloud, and this session will be recorded so you can review it afterward.</p>
              <button onClick={handleStartSession} style={{ padding: '16px 32px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', width: '100%', transition: 'background 0.2s' }}>
                Begin Assessment
              </button>
            </div>
          )}

          {status === 'submitting' && (
            <div style={{ flex: 1, backgroundColor: '#111', borderRadius: '16px', border: '1px solid #222', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '60px 40px', textAlign: 'center' }}>
              <Loader2 size={40} color="#10b981" style={{ animation: 'spin 2s linear infinite', marginBottom: '20px' }} />
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>Evaluating Responses</h3>
              <p style={{ fontSize: '14px', color: '#888', lineHeight: '1.5' }}>AI is analyzing your logic and generating feedback...</p>
            </div>
          )}

          {status === 'active' && (
            <>
              <div style={{ backgroundColor: '#111', borderRadius: '16px', border: '1px solid #222', padding: '30px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ fontSize: '12px', fontWeight: '700', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>Current Question</div>
                  <button onClick={() => speakQuestion(questions[currentIndex].question)} style={{ background: 'transparent', border: 'none', color: '#3b82f6', cursor: 'pointer', padding: '4px' }}>
                    <Volume2 size={20} />
                  </button>
                </div>
                <h2 style={{ fontSize: '22px', fontWeight: '600', lineHeight: '1.5', margin: 0 }}>
                  "{questions[currentIndex]?.question}"
                </h2>
              </div>

              <div style={{ flex: 1, backgroundColor: '#111', borderRadius: '16px', border: '1px solid #222', padding: '30px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontSize: '12px', fontWeight: '700', color: '#888', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>Your Response</div>

                {/* Live Audio Level Indicator - only shown while mic is active */}
                {isRecording && (
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '11px', color: '#888', marginBottom: '6px', fontWeight: '600' }}>
                      MICROPHONE INPUT
                    </div>
                    <div style={{ width: '100%', height: '8px', backgroundColor: '#0a0a0a', borderRadius: '4px', overflow: 'hidden', border: '1px solid #333' }}>
                      <div style={{
                        width: `${audioLevel}%`,
                        height: '100%',
                        backgroundColor: audioLevel > 5 ? '#10b981' : '#ef4444',
                        transition: 'width 0.1s ease-out',
                        borderRadius: '4px',
                      }} />
                    </div>
                    {audioLevel <= 5 && (
                      <div style={{ fontSize: '12px', color: '#ef4444', marginTop: '6px' }}>
                        No sound detected — check your microphone
                      </div>
                    )}
                  </div>
                )}

                {/* Live Transcript Area - updates in real time as SpeechRecognition hears you */}
{/* Editable Response Area - works via voice OR typing */}
<textarea
  value={transcript}
  onChange={(e) => setTranscript(e.target.value)}
  placeholder="Press the microphone to speak, or type your answer here..."
  style={{
    flex: 1,
    minHeight: '150px',
    backgroundColor: '#0a0a0a',
    border: '1px solid #333',
    borderRadius: '12px',
    padding: '20px',
    color: '#fff',
    fontSize: '15px',
    lineHeight: '1.6',
    marginBottom: '24px',
    resize: 'vertical',
    fontFamily: 'inherit',
    outline: 'none',
  }}
/>

                <div style={{ display: 'flex', gap: '16px' }}>
                  <button onClick={toggleRecording} style={{ flex: 1, padding: '16px', borderRadius: '12px', border: 'none', backgroundColor: isRecording ? '#ef4444' : '#222', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: '600', transition: 'all 0.2s' }}>
                    {isRecording ? <><MicOff size={20} /> Stop Recording</> : <><Mic size={20} /> Start Speaking</>}
                  </button>

                  <button
                    onClick={handleNext}
                    disabled={!transcript.trim()}
                    style={{
                      flex: 1, padding: '16px', borderRadius: '12px', border: 'none',
                      backgroundColor: transcript.trim() ? '#fff' : '#333',
                      color: transcript.trim() ? '#000' : '#666',
                      cursor: transcript.trim() ? 'pointer' : 'not-allowed',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: '700', transition: 'all 0.2s'
                    }}
                  >
                    {currentIndex < questions.length - 1 ? (
                      <>Next <ChevronRight size={20} /></>
                    ) : (
                      <>Submit <Send size={20} /></>
                    )}
                  </button>
                </div>
              </div>
            </>
          )}

        </div>
      </div>

      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
      `}</style>
    </div>
  );
}