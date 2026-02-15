const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

// Set view engine
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const progressFilePath = path.join(__dirname, 'progress.json');

// Load progress from file if exists
let progress = {};
if (fs.existsSync(progressFilePath)) {
  const data = fs.readFileSync(progressFilePath);
  const rawProgress = JSON.parse(data);
  // Convert arrays back to Set
  for (const [ip, questions] of Object.entries(rawProgress)) {
    progress[ip] = new Set(questions);
  }
}

// Correct Answers
const correctAnswers = {
  q1: "Tue, 14 May 2024 23:31:08 +0000",
  q2: "You're Invited!",
  q3: "emily.nguyen@glbllogistics.co",
  q4: "Adam Barry",
  q5: "abarry@live.com",
  q6: "Microsoft",
  q7: "<SA1PR14MB737384979FDD1178FD956584C1E32@SA1PR14MB7373.namprd14.prod.outlook.com>",
  q8: "5",
  q9: "AR_Wedding_RSVP.docm",
  q10: "41c3dd4e9f794d53c212398891931760de469321e4c5d04be719d5485ed8f53e",
  q11: "downloader.autdwnlrner/w97m",
  q12: "no",
  q13: "hxxps[://]github[.]com/TCWUS/Pastebin-Uploader[.]exe",
  q14: "shost.exe"
};

// Render main challenge
app.get('/', (req, res) => {
  res.render('phishing');
});

// Check answer route
app.post('/check', (req, res) => {
  const { question, answer } = req.body;
  const correct = correctAnswers[question];
  const userIP = req.ip;

  console.log({ question, answer, userIP });

  if (!correct) {
    return res.json({ correct: false, message: '❌ Oops wrong answer' });
  }

  const isCorrect = correct.toLowerCase() === answer.trim().toLowerCase();

  if (!progress[userIP]) progress[userIP] = new Set();

  if (isCorrect && !progress[userIP].has(question)) {
    progress[userIP].add(question);
    // Convert Sets to arrays for JSON storage
    const progressToSave = {};
    for (const [ip, set] of Object.entries(progress)) {
      progressToSave[ip] = Array.from(set);
    }
    fs.writeFileSync(progressFilePath, JSON.stringify(progressToSave, null, 2));
  }

  const totalQuestions = Object.keys(correctAnswers).length;
  if (progress[userIP].size === totalQuestions) {
    return res.json({
      correct: true,
      message: '🎉 All correct! Here is your flag: HVCTF{congrats_email_analysis_master}'
    });
  }

  const message = isCorrect ? '✅ Great right answer' : '❌ Oops wrong answer';
  return res.json({ correct: isCorrect, message });
});

// Start the server
app.listen(1439, () => console.log('🚀 Server running on http://localhost:1439'));

