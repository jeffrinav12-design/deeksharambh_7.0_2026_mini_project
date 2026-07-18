import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Readable } from 'stream';

import { User, Batch, Student, Syllabus, ScheduleSlot, Abbreviation, Attendance, Question, Response, Result, Photo, Report, DocumentTemplate, GeneratedDocument, ActivityLog } from './models/Schemas.js';
import { 
  generateCircular, 
  generateCoverPage, 
  generateSchedule, 
  generateSyllabus, 
  generateStudentList, 
  generateAttendanceSheet, 
  generateResultAnalysis, 
  generateSipReport, 
  generatePhotoPage 
} from './utils/docxGenerator.js';
import { 
  generateResultPdf, 
  generateSipPdf 
} from './utils/pdfGenerator.js';
import { compilePdf, compileDocx } from './utils/docCompiler.js';
import { seedDatabase } from './scripts/seed.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'sankara_secret_key';

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// MongoDB Connection
const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/deeksharambh';

async function connectDB() {
  try {
    console.log("Connecting to MongoDB at " + mongoUri + "...");
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 3000 });
    console.log("Connected to MongoDB successfully!");
  } catch (err) {
    console.warn("\n[MongoDB Local Connection Failed]");
    console.warn("Could not connect to local MongoDB. Initializing in-memory MongoDB fallback...");
    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      const inMemoryUri = mongod.getUri();
      console.log("Connecting to In-Memory MongoDB at:", inMemoryUri);
      await mongoose.connect(inMemoryUri);
      console.log("Connected to In-Memory MongoDB successfully!");
      
      console.log("Automatically seeding in-memory database with default batch records...");
      await seedDatabase();
      console.log("Database seeded successfully in-memory!\n");
    } catch (memErr) {
      console.error("Failed to start or connect to in-memory MongoDB:", memErr);
    }
  }
}

connectDB();

// Auth Middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: "Access token missing" });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid or expired token" });
    req.user = user;
    next();
  });
}

function requireRole(roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied: insufficient permissions" });
    }
    next();
  };
}

// Helper to push download stream
function sendBuffer(res, buffer, filename, contentType) {
  res.setHeader('Content-Type', contentType);
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  const stream = new Readable();
  stream.push(buffer);
  stream.push(null);
  stream.pipe(res);
}

// ----------------- ROUTES -----------------

// User Authentication
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) return res.status(401).json({ message: "Incorrect password" });

    const token = jwt.sign({ id: user._id, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '8h' });
    res.json({ token, role: user.role, name: user.name });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Batches Management
app.get('/api/batches', authenticateToken, async (req, res) => {
  try {
    const batches = await Batch.find().sort({ createdAt: -1 });
    res.json(batches);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/batches', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const nextVersion = req.body.deeksharambhVersion || "5.0";
    const batch = new Batch({
      ...req.body,
      deeksharambhVersion: nextVersion
    });
    await batch.save();
    res.status(201).json(batch);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.get('/api/batches/:id', authenticateToken, async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id);
    if (!batch) return res.status(404).json({ message: "Batch not found" });
    res.json(batch);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.put('/api/batches/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const batch = await Batch.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(batch);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Document Generation (Circular and Cover Page)
app.get('/api/batches/:id/export/circular', authenticateToken, async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id);
    if (!batch) return res.status(404).json({ message: "Batch not found" });
    
    if (batch.circularFile) {
      const buffer = Buffer.from(batch.circularFile, 'base64');
      const filename = batch.circularFileName || `Circular_Deeksharambh_${batch.deeksharambhVersion}.docx`;
      const contentType = filename.endsWith('.pdf') ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      return sendBuffer(res, buffer, filename, contentType);
    }
    
    const buffer = await generateCircular(batch);
    sendBuffer(res, buffer, `Circular_Deeksharambh_${batch.deeksharambhVersion}.docx`, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/batches/:id/export/cover', authenticateToken, async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id);
    if (!batch) return res.status(404).json({ message: "Batch not found" });
    
    if (batch.brochureFile) {
      const buffer = Buffer.from(batch.brochureFile, 'base64');
      const filename = batch.brochureFileName || `BrochureCover_Deeksharambh_${batch.deeksharambhVersion}.docx`;
      const contentType = filename.endsWith('.pdf') ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      return sendBuffer(res, buffer, filename, contentType);
    }
    
    const buffer = await generateCoverPage(batch);
    sendBuffer(res, buffer, `BrochureCover_Deeksharambh_${batch.deeksharambhVersion}.docx`, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Students Master
app.get('/api/batches/:batchId/students', authenticateToken, async (req, res) => {
  try {
    const students = await Student.find({ batchId: req.params.batchId }).sort({ sNo: 1 });
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/students', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { batchId, name, mathsStream } = req.body;
    const count = await Student.countDocuments({ batchId });
    const student = new Student({
      batchId,
      sNo: count + 1,
      name,
      mathsStream
    });
    await student.save();
    
    // Update batch student count
    await Batch.findByIdAndUpdate(batchId, { totalStudents: count + 1 });

    // Initialize result row
    await Result.create({
      batchId,
      studentId: student._id,
      tamil: "AB",
      english: "AB",
      maths: "AB",
      core: "AB",
      total: 0,
      percentage: 0,
      isAbsent: true
    });

    res.status(201).json(student);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.put('/api/students/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!student) return res.status(404).json({ message: "Student not found" });
    res.json(student);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.delete('/api/students/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) return res.status(404).json({ message: "Student not found" });

    // Update batch student count
    const count = await Student.countDocuments({ batchId: student.batchId });
    await Batch.findByIdAndUpdate(student.batchId, { totalStudents: count });

    // Remove result row
    await Result.deleteMany({ studentId: req.params.id });

    res.json({ message: "Student deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/batches/:batchId/export/students', authenticateToken, async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.batchId);
    const students = await Student.find({ batchId: req.params.batchId }).sort({ sNo: 1 });
    const type = req.query.type || "Full"; // Full, Maths, NonMaths
    let list = students;
    if (type === "Maths") {
      list = students.filter(s => s.mathsStream === 'M');
    } else if (type === "NonMaths") {
      list = students.filter(s => s.mathsStream === 'NM');
    }

    const buffer = await generateStudentList(batch, list, type);
    sendBuffer(res, buffer, `StudentList_${type}_${batch.batchYearRange}.docx`, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Syllabus Management
app.get('/api/batches/:batchId/syllabi', authenticateToken, async (req, res) => {
  try {
    const syllabi = await Syllabus.find({ batchId: req.params.batchId });
    res.json(syllabi);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/syllabi', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const syllabus = new Syllabus(req.body);
    await syllabus.save();
    res.status(201).json(syllabus);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.put('/api/syllabi/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const syllabus = await Syllabus.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(syllabus);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.get('/api/syllabi/:id/export', authenticateToken, async (req, res) => {
  try {
    const syllabus = await Syllabus.findById(req.params.id);
    if (!syllabus) return res.status(404).json({ message: "Syllabus not found" });
    const buffer = await generateSyllabus(syllabus);
    sendBuffer(res, buffer, `Syllabus_${syllabus.subjectName.replace(/\s+/g, '_')}.docx`, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Schedule slots and Abbreviation Legend
app.get('/api/batches/:batchId/schedule', authenticateToken, async (req, res) => {
  try {
    const slots = await ScheduleSlot.find({ batchId: req.params.batchId }).sort({ dayOrder: 1 });
    const abbreviations = await Abbreviation.find({ batchId: req.params.batchId }).sort({ sNo: 1 });
    res.json({ slots, abbreviations });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/batches/:batchId/schedule', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { slots, abbreviations } = req.body;
    const batchId = req.params.batchId;

    // Validate 36 hours total
    const totalHours = abbreviations.reduce((sum, item) => sum + Number(item.noOfHours), 0);
    if (totalHours !== 36) {
      return res.status(400).json({ message: `Total scheduled hours must be exactly 36. Current total is ${totalHours} hours.` });
    }

    await ScheduleSlot.deleteMany({ batchId });
    await Abbreviation.deleteMany({ batchId });

    for (const slot of slots) {
      await ScheduleSlot.create({ ...slot, batchId });
    }
    for (const ab of abbreviations) {
      await Abbreviation.create({ ...ab, batchId });
    }

    res.json({ message: "Schedule and Abbreviation Legend saved successfully!" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.get('/api/batches/:batchId/export/schedule', authenticateToken, async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.batchId);
    const slots = await ScheduleSlot.find({ batchId: req.params.batchId }).sort({ dayOrder: 1 });
    const abbreviations = await Abbreviation.find({ batchId: req.params.batchId }).sort({ sNo: 1 });

    const buffer = await generateSchedule(batch, slots, abbreviations);
    sendBuffer(res, buffer, `Schedule_${batch.batchYearRange}.docx`, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Attendance Management
app.get('/api/batches/:batchId/attendance', authenticateToken, async (req, res) => {
  try {
    const attendance = await Attendance.find({ batchId: req.params.batchId });
    res.json(attendance);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/attendance', authenticateToken, requireRole(['admin', 'faculty']), async (req, res) => {
  try {
    const { batchId, studentId, date, status } = req.body;
    await Attendance.findOneAndUpdate(
      { batchId, studentId, date },
      { status },
      { upsert: true, new: true }
    );
    res.json({ message: "Attendance saved" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.get('/api/batches/:batchId/export/attendance', authenticateToken, async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.batchId);
    const students = await Student.find({ batchId: req.params.batchId }).sort({ sNo: 1 });
    
    // Get unique dates from schedule slots
    const slots = await ScheduleSlot.find({ batchId: req.params.batchId }).sort({ dayOrder: 1 });
    const dates = slots.map(s => s.date);

    const attendanceRecords = await Attendance.find({ batchId: req.params.batchId });
    const attendanceMap = {};
    attendanceRecords.forEach(rec => {
      attendanceMap[`${rec.studentId}_${rec.date}`] = rec.status;
    });

    const buffer = await generateAttendanceSheet(batch, students, dates, attendanceMap);
    sendBuffer(res, buffer, `AttendanceSheet_${batch.batchYearRange}.docx`, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Question Bank management
app.get('/api/batches/:batchId/questions', authenticateToken, async (req, res) => {
  try {
    const questions = await Question.find({ batchId: req.params.batchId });
    res.json(questions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/questions', authenticateToken, requireRole(['admin', 'faculty']), async (req, res) => {
  try {
    const question = new Question(req.body);
    await question.save();
    res.status(201).json(question);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.delete('/api/questions/:id', authenticateToken, requireRole(['admin', 'faculty']), async (req, res) => {
  try {
    await Question.findByIdAndDelete(req.params.id);
    res.json({ message: "Question deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Assessment Submissions & Scoring
app.post('/api/assessments/submit', authenticateToken, async (req, res) => {
  try {
    const { batchId, studentId, subject, answers } = req.body;

    const questions = await Question.find({ batchId, subject });
    let score = 0;
    
    answers.forEach(ans => {
      const q = questions.find(item => item._id.toString() === ans.questionId);
      if (q && q.correctAnswer === ans.selectedOption) {
        score++;
      }
    });

    // Save response
    const response = new Response({
      batchId,
      studentId,
      subject,
      answers,
      score
    });
    await response.save();

    // Fetch batch configuration
    const batch = await Batch.findById(batchId);
    
    // Update individual score in Results table
    let result = await Result.findOne({ batchId, studentId });
    if (!result) {
      result = new Result({ batchId, studentId });
    }

    const subKey = subject.toLowerCase(); // tamil, english, maths, core
    result[subKey] = String(score);
    result.isAbsent = false;

    // Recalculate totals
    const tScore = (result.tamil === 'AB' ? 0 : Number(result.tamil)) +
                   (result.english === 'AB' ? 0 : Number(result.english)) +
                   (result.maths === 'AB' ? 0 : Number(result.maths)) +
                   (result.core === 'AB' ? 0 : Number(result.core));

    result.total = tScore;
    result.percentage = Number(((tScore / batch.marksConfig.total) * 100).toFixed(1));
    await result.save();

    res.json({ score, message: "Assessment submitted and scored successfully!" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Result Analysis Table & Range Summaries
app.get('/api/batches/:batchId/results', authenticateToken, async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.batchId);
    if (!batch) return res.status(404).json({ message: "Batch not found" });

    const students = await Student.find({ batchId: req.params.batchId }).sort({ sNo: 1 });
    const results = await Result.find({ batchId: req.params.batchId });

    // Join Student info
    const fullResults = students.map(st => {
      const resRow = results.find(r => r.studentId.toString() === st._id.toString()) || {
        tamil: "AB", english: "AB", maths: "AB", core: "AB", total: 0, percentage: 0, isAbsent: true
      };
      return {
        sNo: st.sNo,
        name: st.name,
        mathsStream: st.mathsStream,
        tamil: resRow.tamil,
        english: resRow.english,
        maths: resRow.maths,
        core: resRow.core,
        total: resRow.isAbsent ? 0 : resRow.total,
        percentage: resRow.isAbsent ? 'AB' : resRow.percentage,
        isAbsent: resRow.isAbsent
      };
    });

    // Exclude AB students from range calculations
    const activeResults = fullResults.filter(r => !r.isAbsent);
    const totalActive = activeResults.length;

    // Compile range categories (default config check)
    const ranges = batch.resultRanges.length > 0 ? batch.resultRanges : ["60 & Above", "50-59", "Below 50"];
    const rangeSummary = ranges.map(range => {
      let count = 0;
      if (range === "60 & Above") {
        count = activeResults.filter(r => Number(r.percentage) >= 60).length;
      } else if (range === "70 - 79" || range === "70-79") {
        count = activeResults.filter(r => Number(r.percentage) >= 70 && Number(r.percentage) < 80).length;
      } else if (range === "60 - 69" || range === "60-69") {
        count = activeResults.filter(r => Number(r.percentage) >= 60 && Number(r.percentage) < 70).length;
      } else if (range === "50 - 59" || range === "50-59") {
        count = activeResults.filter(r => Number(r.percentage) >= 50 && Number(r.percentage) < 60).length;
      } else if (range === "Below 50") {
        count = activeResults.filter(r => Number(r.percentage) < 50).length;
      }
      return {
        range,
        count,
        percent: totalActive > 0 ? Number(((count / totalActive) * 100).toFixed(1)) : 0
      };
    });

    res.json({ results: fullResults, rangeSummary });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Result Analysis exports
app.get('/api/batches/:batchId/export/results/docx', authenticateToken, async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.batchId);
    const students = await Student.find({ batchId: req.params.batchId }).sort({ sNo: 1 });
    const results = await Result.find({ batchId: req.params.batchId });

    const fullResults = students.map(st => {
      const resRow = results.find(r => r.studentId.toString() === st._id.toString()) || {
        tamil: "AB", english: "AB", maths: "AB", core: "AB", total: 0, percentage: 0, isAbsent: true
      };
      return {
        sNo: st.sNo,
        name: st.name,
        tamil: resRow.tamil,
        english: resRow.english,
        maths: resRow.maths,
        core: resRow.core,
        total: resRow.isAbsent ? 0 : resRow.total,
        percentage: resRow.isAbsent ? 'AB' : resRow.percentage,
        isAbsent: resRow.isAbsent
      };
    });

    const activeResults = fullResults.filter(r => !r.isAbsent);
    const totalActive = activeResults.length;
    const ranges = batch.resultRanges.length > 0 ? batch.resultRanges : ["60 & Above", "50-59", "Below 50"];
    const rangeSummary = ranges.map(range => {
      let count = 0;
      if (range === "60 & Above") {
        count = activeResults.filter(r => Number(r.percentage) >= 60).length;
      } else if (range === "70 - 79" || range === "70-79") {
        count = activeResults.filter(r => Number(r.percentage) >= 70 && Number(r.percentage) < 80).length;
      } else if (range === "60 - 69" || range === "60-69") {
        count = activeResults.filter(r => Number(r.percentage) >= 60 && Number(r.percentage) < 70).length;
      } else if (range === "50 - 59" || range === "50-59") {
        count = activeResults.filter(r => Number(r.percentage) >= 50 && Number(r.percentage) < 60).length;
      } else if (range === "Below 50") {
        count = activeResults.filter(r => Number(r.percentage) < 50).length;
      }
      return {
        range,
        count,
        percent: totalActive > 0 ? Number(((count / totalActive) * 100).toFixed(1)) : 0
      };
    });

    const buffer = await generateResultAnalysis(batch, fullResults, rangeSummary);
    sendBuffer(res, buffer, `ResultAnalysis_${batch.batchYearRange}.docx`, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/batches/:batchId/export/results/pdf', authenticateToken, async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.batchId);
    const students = await Student.find({ batchId: req.params.batchId }).sort({ sNo: 1 });
    const results = await Result.find({ batchId: req.params.batchId });

    const fullResults = students.map(st => {
      const resRow = results.find(r => r.studentId.toString() === st._id.toString()) || {
        tamil: "AB", english: "AB", maths: "AB", core: "AB", total: 0, percentage: 0, isAbsent: true
      };
      return {
        sNo: st.sNo,
        name: st.name,
        tamil: resRow.tamil,
        english: resRow.english,
        maths: resRow.maths,
        core: resRow.core,
        total: resRow.isAbsent ? 0 : resRow.total,
        percentage: resRow.isAbsent ? 'AB' : resRow.percentage,
        isAbsent: resRow.isAbsent
      };
    });

    const activeResults = fullResults.filter(r => !r.isAbsent);
    const totalActive = activeResults.length;
    const ranges = batch.resultRanges.length > 0 ? batch.resultRanges : ["60 & Above", "50-59", "Below 50"];
    const rangeSummary = ranges.map(range => {
      let count = 0;
      if (range === "60 & Above") {
        count = activeResults.filter(r => Number(r.percentage) >= 60).length;
      } else if (range === "70 - 79" || range === "70-79") {
        count = activeResults.filter(r => Number(r.percentage) >= 70 && Number(r.percentage) < 80).length;
      } else if (range === "60 - 69" || range === "60-69") {
        count = activeResults.filter(r => Number(r.percentage) >= 60 && Number(r.percentage) < 70).length;
      } else if (range === "50 - 59" || range === "50-59") {
        count = activeResults.filter(r => Number(r.percentage) >= 50 && Number(r.percentage) < 60).length;
      } else if (range === "Below 50") {
        count = activeResults.filter(r => Number(r.percentage) < 50).length;
      }
      return {
        range,
        count,
        percent: totalActive > 0 ? Number(((count / totalActive) * 100).toFixed(1)) : 0
      };
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="ResultAnalysis_${batch.batchYearRange}.pdf"`);
    generateResultPdf(batch, fullResults, rangeSummary, res);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// SIP Report narrative endpoints
app.get('/api/batches/:batchId/sip-report', authenticateToken, async (req, res) => {
  try {
    const report = await Report.findOne({ batchId: req.params.batchId, reportType: "SIP" });
    res.json(report || { reportText: "", objectives: [] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/batches/:batchId/sip-report', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { reportText, objectives } = req.body;
    const report = await Report.findOneAndUpdate(
      { batchId: req.params.batchId, reportType: "SIP" },
      { reportText, objectives },
      { upsert: true, new: true }
    );
    res.json(report);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.get('/api/batches/:batchId/export/sip/docx', authenticateToken, async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.batchId);
    const report = await Report.findOne({ batchId: req.params.batchId, reportType: "SIP" }) || {
      reportText: "", objectives: []
    };
    
    const buffer = await generateSipReport(batch, report.reportText, report.objectives || []);
    sendBuffer(res, buffer, `SIP_Report_${batch.batchYearRange}.docx`, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/batches/:batchId/export/sip/pdf', authenticateToken, async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.batchId);
    const report = await Report.findOne({ batchId: req.params.batchId, reportType: "SIP" }) || {
      reportText: "", objectives: []
    };

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="SIP_Report_${batch.batchYearRange}.pdf"`);
    generateSipPdf(batch, report.reportText, report.objectives || [], res);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Photo Gallery endpoints
app.get('/api/batches/:batchId/photos', authenticateToken, async (req, res) => {
  try {
    const photos = await Photo.find({ batchId: req.params.batchId });
    res.json(photos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/photos', authenticateToken, requireRole(['admin', 'faculty']), async (req, res) => {
  try {
    const photo = new Photo(req.body);
    await photo.save();
    res.status(201).json(photo);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.delete('/api/photos/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    await Photo.findByIdAndDelete(req.params.id);
    res.json({ message: "Photo deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/batches/:batchId/export/photos', authenticateToken, async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.batchId);
    const photos = await Photo.find({ batchId: req.params.batchId });
    const buffer = await generatePhotoPage(batch, photos);
    sendBuffer(res, buffer, `PhotoGallery_${batch.batchYearRange}.docx`, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Active batch metrics/dashboard statistics
app.get('/api/batches/:batchId/stats', authenticateToken, async (req, res) => {
  try {
    const students = await Student.find({ batchId: req.params.batchId });
    const total = students.length;

    const results = await Result.find({ batchId: req.params.batchId });
    const active = results.filter(r => !r.isAbsent);

    const advCount = active.filter(r => r.percentage >= 70).length;
    const slowCount = active.filter(r => r.percentage < 70).length;

    // Compute average attendance
    const attendanceRecords = await Attendance.find({ batchId: req.params.batchId });
    const presents = attendanceRecords.filter(r => r.status === 'P').length;
    const totalRecords = attendanceRecords.length;
    const attPercentage = totalRecords > 0 ? Number(((presents / totalRecords) * 100).toFixed(1)) : 100;

    res.json({
      totalStudents: total,
      attendancePercentage: attPercentage,
      assessmentsSubmitted: active.length,
      advancedLearners: advCount,
      slowLearners: slowCount
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Document Templates Management
app.get('/api/templates', authenticateToken, async (req, res) => {
  try {
    const { batchId } = req.query;
    const filter = batchId ? { batchId } : {};
    const templates = await DocumentTemplate.find(filter).sort({ createdAt: -1 });
    res.json(templates);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/templates', authenticateToken, requireRole(['admin']), async (req, res) => {
  const { batchId, name, fileName, fileData, fields } = req.body;
  try {
    const template = new DocumentTemplate({ batchId, name, fileName, fileData, fields });
    await template.save();

    await ActivityLog.create({
      userId: req.user.id,
      userName: req.user.name,
      action: 'Upload Template',
      details: `Uploaded PDF template "${name}" (${fileName})`
    });

    res.status(201).json(template);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.delete('/api/templates/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const template = await DocumentTemplate.findByIdAndDelete(req.params.id);
    if (!template) return res.status(404).json({ message: "Template not found" });

    await ActivityLog.create({
      userId: req.user.id,
      userName: req.user.name,
      action: 'Delete Template',
      details: `Deleted template "${template.name}"`
    });

    res.json({ message: "Template deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/templates/:id/clone', authenticateToken, requireRole(['admin']), async (req, res) => {
  const { targetBatchId } = req.body;
  try {
    const source = await DocumentTemplate.findById(req.params.id);
    if (!source) return res.status(404).json({ message: "Source template not found" });

    const clone = new DocumentTemplate({
      batchId: targetBatchId,
      name: source.name,
      fileName: source.fileName,
      fileData: source.fileData,
      fields: source.fields
    });
    await clone.save();

    await ActivityLog.create({
      userId: req.user.id,
      userName: req.user.name,
      action: 'Clone Template',
      details: `Cloned template "${source.name}" to target batch`
    });

    res.status(201).json(clone);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.get('/api/templates/:id/download', authenticateToken, async (req, res) => {
  try {
    const template = await DocumentTemplate.findById(req.params.id);
    if (!template) return res.status(404).json({ message: "Template not found" });

    const buffer = Buffer.from(template.fileData, 'base64');
    sendBuffer(res, buffer, template.fileName, 'application/pdf');

    await ActivityLog.create({
      userId: req.user.id,
      userName: req.user.name,
      action: 'Download Template',
      details: `Downloaded original PDF template "${template.name}"`
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Generated Documents Management
app.get('/api/documents', authenticateToken, async (req, res) => {
  try {
    const { batchId, search } = req.query;
    const filter = {};
    if (batchId) filter.batchId = batchId;
    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }
    const docs = await GeneratedDocument.find(filter)
      .populate('templateId', 'name fileName')
      .sort({ updatedAt: -1 });
    res.json(docs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/documents', authenticateToken, requireRole(['admin', 'faculty']), async (req, res) => {
  const { templateId, batchId, name, fieldValues } = req.body;
  try {
    const pdfBuffer = await compilePdf(name, fieldValues);
    const base64Pdf = pdfBuffer.toString('base64');

    const docxBuffer = await compileDocx(name, fieldValues);
    const base64Docx = docxBuffer.toString('base64');

    const doc = new GeneratedDocument({
      templateId,
      batchId,
      name,
      fieldValues,
      fileDataPdf: base64Pdf,
      fileDataDocx: base64Docx,
      version: 1
    });
    await doc.save();

    await ActivityLog.create({
      userId: req.user.id,
      userName: req.user.name,
      action: 'Generate Document',
      details: `Generated document "${name}" from template`
    });

    res.status(201).json(doc);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.put('/api/documents/:id', authenticateToken, requireRole(['admin', 'faculty']), async (req, res) => {
  const { fieldValues } = req.body;
  try {
    const doc = await GeneratedDocument.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: "Document not found" });

    const pdfBuffer = await compilePdf(doc.name, fieldValues);
    const base64Pdf = pdfBuffer.toString('base64');

    const docxBuffer = await compileDocx(doc.name, fieldValues);
    const base64Docx = docxBuffer.toString('base64');

    doc.fieldValues = fieldValues;
    doc.fileDataPdf = base64Pdf;
    doc.fileDataDocx = base64Docx;
    doc.version += 1;
    doc.updatedAt = new Date();
    await doc.save();

    await ActivityLog.create({
      userId: req.user.id,
      userName: req.user.name,
      action: 'Edit Document',
      details: `Updated document "${doc.name}" to version ${doc.version}`
    });

    res.json(doc);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.delete('/api/documents/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const doc = await GeneratedDocument.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ message: "Document not found" });

    await ActivityLog.create({
      userId: req.user.id,
      userName: req.user.name,
      action: 'Delete Document',
      details: `Deleted generated document "${doc.name}"`
    });

    res.json({ message: "Document deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/documents/:id/download/:format', authenticateToken, async (req, res) => {
  const { id, format } = req.params;
  try {
    const doc = await GeneratedDocument.findById(id);
    if (!doc) return res.status(404).json({ message: "Document not found" });

    if (format === 'pdf') {
      const buffer = Buffer.from(doc.fileDataPdf, 'base64');
      sendBuffer(res, buffer, `${doc.name.replace(/\s+/g, '_')}_v${doc.version}.pdf`, 'application/pdf');
    } else if (format === 'docx') {
      const buffer = Buffer.from(doc.fileDataDocx, 'base64');
      sendBuffer(res, buffer, `${doc.name.replace(/\s+/g, '_')}_v${doc.version}.docx`, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    } else {
      res.status(400).json({ message: "Unsupported download format" });
    }

    await ActivityLog.create({
      userId: req.user.id,
      userName: req.user.name,
      action: 'Download Document',
      details: `Downloaded document "${doc.name}" (v${doc.version}) as ${format.toUpperCase()}`
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/activity-logs', authenticateToken, async (req, res) => {
  try {
    const logs = await ActivityLog.find().sort({ timestamp: -1 }).limit(100);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

export default app;
