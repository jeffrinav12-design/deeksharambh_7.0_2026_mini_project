import mongoose from 'mongoose';

// 1. User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['admin', 'faculty', 'viewer'], default: 'viewer' },
  createdAt: { type: Date, default: Date.now }
});

// 2. Batch Schema
const batchSchema = new mongoose.Schema({
  batchYearRange: { type: String, required: true }, // e.g. 2024-2027
  academicYear: { type: String, required: true }, // e.g. 2024-2025
  deeksharambhVersion: { type: String, required: true }, // e.g. 5.0
  startDate: { type: String, required: true }, // e.g. 2024-07-02
  endDate: { type: String, required: true }, // e.g. 2024-07-09
  hodName: { type: String, required: true },
  principalName: { type: String, required: true },
  className: { type: String, default: 'I B.Sc. CSDA' },
  programmeInsights: [{ type: String }],
  totalStudents: { type: Number, default: 0 },
  marksConfig: {
    tamil: { type: Number, default: 10 },
    english: { type: Number, default: 10 },
    maths: { type: Number, default: 10 },
    core: { type: Number, default: 45 },
    total: { type: Number, default: 75 }
  },
  resultRanges: [{ type: String }], // e.g. ["60 & Above", "50-59", "Below 50"]
  circularFile: { type: String }, // Base64 uploaded circular
  circularFileName: { type: String },
  brochureFile: { type: String }, // Base64 uploaded brochure
  brochureFileName: { type: String },
  createdAt: { type: Date, default: Date.now }
});

// 3. Student Schema
const studentSchema = new mongoose.Schema({
  batchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch', required: true },
  sNo: { type: Number, required: true },
  name: { type: String, required: true },
  mathsStream: { type: String, enum: ['M', 'NM'], required: true }, // M = Maths, NM = Non-Maths
  createdAt: { type: Date, default: Date.now }
});

// 4. Syllabus Schema
const syllabusSchema = new mongoose.Schema({
  batchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch', required: true },
  subjectName: { type: String, required: true },
  departmentName: { type: String, required: true },
  hours: { type: Number, default: 3 },
  mathsStream: { type: String, enum: ['M', 'NM', 'ALL'], default: 'ALL' },
  objectives: [{ type: String }],
  units: [{
    unitNo: { type: String }, // e.g. "UNIT I"
    title: { type: String },
    content: { type: String }
  }],
  referenceBooks: [{ type: String }],
  staffIncharge: { type: String },
  subjectExpert: {
    name: { type: String },
    designation: { type: String },
    institution: { type: String },
    details: { type: String }
  },
  hodName: { type: String },
  createdAt: { type: Date, default: Date.now }
});

// 5. Schedule Slot Schema
const scheduleSlotSchema = new mongoose.Schema({
  batchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch', required: true },
  dayOrder: { type: String, required: true }, // e.g. I, II, III
  date: { type: String, required: true }, // e.g. 2024-07-02
  periods: {
    I: { type: String }, // Code from abbreviations
    II: { type: String },
    III: { type: String },
    IV: { type: String },
    V: { type: String },
    VI: { type: String }
  }
});

// 6. Abbreviation Schema
const abbreviationSchema = new mongoose.Schema({
  batchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch', required: true },
  sNo: { type: Number, required: true },
  abbreviation: { type: String, required: true }, // e.g. CT, FD, TAMIL
  particulars: { type: String, required: true },
  facultyName: { type: String, required: true },
  noOfHours: { type: Number, required: true }
});

// 7. Attendance Schema
const attendanceSchema = new mongoose.Schema({
  batchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch', required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  date: { type: String, required: true }, // e.g. 2024-07-02
  status: { type: String, enum: ['P', 'A'], required: true } // P = Present, A = Absent
});

// 8. Question Schema
const questionSchema = new mongoose.Schema({
  batchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch', required: true },
  subject: { type: String, required: true }, // e.g. Tamil, English, Maths, Core
  mathsStream: { type: String, enum: ['M', 'NM', 'ALL'], default: 'ALL' },
  questionText: { type: String, required: true },
  optionA: { type: String, required: true },
  optionB: { type: String, required: true },
  optionC: { type: String, required: true },
  optionD: { type: String, required: true },
  correctAnswer: { type: String, enum: ['A', 'B', 'C', 'D'], required: true }
});

// 9. Response Schema
const responseSchema = new mongoose.Schema({
  batchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch', required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  subject: { type: String, required: true }, // e.g. Tamil, English, Maths, Core
  answers: [{
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
    selectedOption: { type: String }
  }],
  score: { type: Number, required: true },
  submittedAt: { type: Date, default: Date.now }
});

// 10. Result Schema
const resultSchema = new mongoose.Schema({
  batchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch', required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  tamil: { type: String, default: 'AB' }, // mark or "AB"
  english: { type: String, default: 'AB' },
  maths: { type: String, default: 'AB' },
  core: { type: String, default: 'AB' },
  total: { type: Number, default: 0 },
  percentage: { type: Number, default: 0 },
  isAbsent: { type: Boolean, default: false } // true if completely absent for all exams
});

// 11. Photo Schema
const photoSchema = new mongoose.Schema({
  batchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch', required: true },
  url: { type: String, required: true }, // base64 or path
  caption: { type: String },
  photoDate: { type: String },
  gpsOverlayText: { type: String } // manual overlay
});

// 12. Report Schema
const reportSchema = new mongoose.Schema({
  batchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch', required: true },
  reportType: { type: String, required: true }, // e.g. SIP, ResultAnalysis
  reportText: { type: String },
  objectives: [{ type: String }],
  generatedDocUrl: { type: String },
  generatedAt: { type: Date, default: Date.now }
});

// 13. Document Template Schema
const documentTemplateSchema = new mongoose.Schema({
  batchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch', required: true },
  name: { type: String, required: true },
  fileName: { type: String, required: true },
  fileData: { type: String, required: true }, // Base64 representation
  fields: [{ type: String }], // placeholder fields e.g., ["department", "course"]
  createdAt: { type: Date, default: Date.now }
});

// 14. Generated Document Schema
const generatedDocumentSchema = new mongoose.Schema({
  templateId: { type: mongoose.Schema.Types.ObjectId, ref: 'DocumentTemplate', required: true },
  batchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch', required: true },
  name: { type: String, required: true },
  fieldValues: { type: Map, of: String },
  fileDataPdf: { type: String }, // Base64 compiled PDF
  fileDataDocx: { type: String }, // Base64 compiled DOCX
  version: { type: Number, default: 1 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// 15. Activity Log Schema
const activityLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userName: { type: String },
  action: { type: String, required: true }, // e.g., "Upload Template", "Generate Document"
  details: { type: String },
  timestamp: { type: Date, default: Date.now }
});

// Models export
export const User = mongoose.model('User', userSchema);
export const Batch = mongoose.model('Batch', batchSchema);
export const Student = mongoose.model('Student', studentSchema);
export const Syllabus = mongoose.model('Syllabus', syllabusSchema);
export const ScheduleSlot = mongoose.model('ScheduleSlot', scheduleSlotSchema);
export const Abbreviation = mongoose.model('Abbreviation', abbreviationSchema);
export const Attendance = mongoose.model('Attendance', attendanceSchema);
export const Question = mongoose.model('Question', questionSchema);
export const Response = mongoose.model('Response', responseSchema);
export const Result = mongoose.model('Result', resultSchema);
export const Photo = mongoose.model('Photo', photoSchema);
export const Report = mongoose.model('Report', reportSchema);
export const DocumentTemplate = mongoose.model('DocumentTemplate', documentTemplateSchema);
export const GeneratedDocument = mongoose.model('GeneratedDocument', generatedDocumentSchema);
export const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);

