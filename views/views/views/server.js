const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// قاعدة بيانات بسيطة
let database = {
  voters: [],
  candidates: [{id: 1, name: 'أحمد محمد', votes: 0}, {id: 2, name: 'سارة خالد', votes: 0}],
  votes: []
};

app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

// الصفحة الرئيسية
app.get('/', (req, res) => {
  res.render('vote', { candidates: database.candidates });
});

// صفحة تسجيل الدخول
app.get('/admin', (req, res) => {
  res.render('login');
});

// تحقق من الدخول
app.post('/admin/login', (req, res) => {
  if (req.body.username === 'admin' && req.body.password === '112233') {
    res.render('admin', {
      candidates: database.candidates,
      voters: database.voters,
      votes: database.votes
    });
  } else {
    res.redirect('/admin');
  }
});

// التصويت
app.post('/vote', (req, res) => {
  const { id_number, candidate_id } = req.body;
  
  // تحقق إذا كان الناخب قد صوت مسبقاً
  const hasVoted = database.votes.find(v => v.voter_id === id_number);
  if (hasVoted) {
    return res.send('لقد صوتت مسبقاً! <a href="/">العودة</a>');
  }
  
  // تسجيل التصويت
  database.votes.push({
    voter_id: id_number,
    candidate_id: candidate_id,
    time: new Date().toISOString()
  });
  
  // زيادة أصوات المرشح
  const candidate = database.candidates.find(c => c.id == candidate_id);
  if (candidate) candidate.votes++;
  
  res.send(`
    <div style="text-align: center; padding: 50px;">
      <h2 style="color: green;">✅ تم التصويت بنجاح!</h2>
      <p>شكراً لمشاركتك في العملية الديمقراطية</p>
      <a href="/" style="display: inline-block; margin-top: 20px; padding: 10px 20px; background: #3498db; color: white; text-decoration: none; border-radius: 5px;">العودة للصفحة الرئيسية</a>
    </div>
  `);
});

// إضافة مرشح
app.post('/admin/add_candidate', (req, res) => {
  const newId = database.candidates.length > 0 
    ? Math.max(...database.candidates.map(c => c.id)) + 1 
    : 1;
  
  database.candidates.push({
    id: newId,
    name: req.body.name,
    votes: 0
  });
  
  res.redirect('/admin/login');
});

// إضافة ناخب
app.post('/admin/add_voter', (req, res) => {
  if (!database.voters.includes(req.body.id_number)) {
    database.voters.push(req.body.id_number);
  }
  res.redirect('/admin/login');
});

app.listen(PORT, () => {
  console.log(`✅ الموقع يعمل على البورت ${PORT}`);
  console.log(`🌐 افتح في المتصفح: http://localhost:${PORT}`);
});
