const dotenv = require('dotenv');
dotenv.config();   

const express = require('express');

const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes= require('./routes/authRoutes');
const resumeRoutes = require('./routes/resumeRoutes');
const codeforcesRoutes = require('./routes/codeforcesRoutes');
const leetcodeRoutes = require('./routes/leetcodeRoutes');
const scoreRoutes = require('./routes/scoreRoutes');
const roadmapRoutes = require('./routes/roadmapRoutes');
const interviewRoutes = require('./routes/interviewRoutes');

console.log('Gemini key loaded:', process.env.GEMINI_API_KEY ? 'Yes' : 'No');
connectDB(); // i use here mongodb atlas

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/resume', resumeRoutes)
app.use('/api/codeforces', codeforcesRoutes);
app.use('/api/leetcode', leetcodeRoutes);
app.use('/api/score', scoreRoutes);
app.use('/api/roadmap', roadmapRoutes);
app.use('/api/interview', interviewRoutes);



app.get('/', (req, res) => {
  res.send('Placement Prep Assistant API is running');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
