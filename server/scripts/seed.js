import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { User, Batch, Student, Syllabus, ScheduleSlot, Abbreviation, Attendance, Question, Response, Result, Photo } from '../models/Schemas.js';

dotenv.config();

const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/deeksharambh';

export async function seedDatabase() {
  console.log("Clearing old data...");

  await User.deleteMany({});
  await Batch.deleteMany({});
  await Student.deleteMany({});
  await Syllabus.deleteMany({});
  await ScheduleSlot.deleteMany({});
  await Abbreviation.deleteMany({});
  await Attendance.deleteMany({});
  await Question.deleteMany({});
  await Response.deleteMany({});
  await Result.deleteMany({});
  await Photo.deleteMany({});

  console.log("Creating default users...");
  const salt = await bcrypt.genSalt(10);
  const adminPassword = await bcrypt.hash('admin123', salt);
  const facultyPassword = await bcrypt.hash('faculty123', salt);
  const viewerPassword = await bcrypt.hash('viewer123', salt);
  const studentPassword = await bcrypt.hash('student123', salt);

  await User.create([
    { name: "Dr. Admin", email: "admin@sankara.ac.in", passwordHash: adminPassword, role: "admin" },
    { name: "Admin Officer", email: "admin.csda@gmail.com", passwordHash: adminPassword, role: "admin" },
    { name: "Prof. Faculty", email: "faculty@sankara.ac.in", passwordHash: facultyPassword, role: "faculty" },
    { name: "Faculty Staff", email: "faculty.csda@gmail.com", passwordHash: facultyPassword, role: "faculty" },
    { name: "Guest Viewer", email: "viewer@sankara.ac.in", passwordHash: viewerPassword, role: "viewer" },
    { name: "Guest Viewer", email: "viewer.csda@gmail.com", passwordHash: viewerPassword, role: "viewer" },
    { name: "Student Learner", email: "student@sankara.ac.in", passwordHash: studentPassword, role: "student" },
    { name: "Student Learner", email: "student.csda@gmail.com", passwordHash: studentPassword, role: "student" }
  ]);

  console.log("Creating Batch 1: Deeksharambh 5.0 (2024-2027)...");
  const batch1 = await Batch.create({
    batchYearRange: "2024-2027",
    academicYear: "2024-2025",
    deeksharambhVersion: "5.0",
    startDate: "2024-07-02",
    endDate: "2024-07-09",
    hodName: "Dr. M. Lingaraj",
    principalName: "Dr. V. Radhika",
    className: "I B.Sc. CSDA",
    programmeInsights: [
      "Motivational Talks",
      "Gender Sensitivity Programmes",
      "Placement & Life Skill Orientation",
      "Clubs & Committees Orientation",
      "Physical Education",
      "Fun Events",
      "SWAYAM-NPTEL-MOOCS Orientation",
      "Annual Plan",
      "Short & Long-Term Goal Setting",
      "Dissemination of POs & COs"
    ],
    totalStudents: 47,
    marksConfig: {
      tamil: 10,
      english: 10,
      maths: 10,
      core: 45,
      total: 75
    },
    resultRanges: ["60 & Above", "50-59", "Below 50"]
  });

  console.log("Creating Batch 2: Deeksharambh 6.0 (2025-2028)...");
  const batch2 = await Batch.create({
    batchYearRange: "2025-2028",
    academicYear: "2025-2026",
    deeksharambhVersion: "6.0",
    startDate: "2025-06-26",
    endDate: "2025-07-03",
    hodName: "Dr. R. Sasikala",
    principalName: "Dr. V. Radhika",
    className: "I B.Sc. CSDA",
    programmeInsights: [
      "Motivational Talks",
      "Gender Sensitivity Programmes",
      "Placement & Life Skill Orientation",
      "Clubs & Committees Orientation",
      "Physical Education",
      "Fun Events",
      "SWAYAM-NPTEL-MOOCS Orientation",
      "Annual Plan",
      "Short & Long-Term Goal Setting",
      "Dissemination of POs & COs"
    ],
    totalStudents: 43,
    marksConfig: {
      tamil: 15,
      english: 15,
      maths: 15,
      core: 55,
      total: 100
    },
    resultRanges: ["60 & Above", "70-79", "60-69", "50-59", "Below 50"]
  });

  console.log("Creating Batch 3: Deeksharambh 7.0 (2026-2029)...");
  const batch3 = await Batch.create({
    batchYearRange: "2026-2029",
    academicYear: "2026-2027",
    deeksharambhVersion: "7.0",
    startDate: "2026-06-30",
    endDate: "2026-07-07",
    hodName: "Dr. R. Sasikala",
    principalName: "Dr. V. Radhika",
    className: "I B.Sc. CSDA",
    managingTrusteeName: "Sri T.P. Ramachandran",
    programmeInsights: [
      "Motivational Talks",
      "Gender Sensitivity Programmes",
      "Placement & Life Skill Orientation",
      "Clubs & Committees Orientation",
      "Physical Education",
      "Fun Events",
      "SWAYAM-NPTEL-MOOCS Orientation",
      "Annual Plan",
      "Short & Long Term Goal Settings",
      "Dissemination of POS & COS"
    ],
    totalStudents: 45,
    marksConfig: {
      tamil: 15,
      english: 15,
      maths: 15,
      core: 55,
      total: 100
    },
    resultRanges: ["80 & ABOVE", "70 - 79", "60 - 69", "50 - 59", "BELOW 50"]
  });

  // Load Batch 1 Students
  console.log("Seeding Batch 1 students...");
  const b1StudentsData = [
    { sNo: 1, name: "ABINESH.M", mathsStream: "NM" },
    { sNo: 2, name: "ABISHEK.S", mathsStream: "NM" },
    { sNo: 3, name: "ANGELIN GIFTY.I", mathsStream: "M" },
    { sNo: 4, name: "ARTHI.M", mathsStream: "M" },
    { sNo: 5, name: "ASWINI.S", mathsStream: "NM" },
    { sNo: 6, name: "DEVI PRIYA.M", mathsStream: "M" },
    { sNo: 7, name: "DHANABAL.L", mathsStream: "NM" },
    { sNo: 8, name: "DHANUSH.S", mathsStream: "M" },
    { sNo: 9, name: "DHANYA.D", mathsStream: "NM" },
    { sNo: 10, name: "DHARANI.S", mathsStream: "M" },
    { sNo: 11, name: "DHARUNESH.S", mathsStream: "NM" },
    { sNo: 12, name: "DINESH KARTHIK.S", mathsStream: "NM" },
    { sNo: 13, name: "GOKUL.K", mathsStream: "M" },
    { sNo: 14, name: "GOKULAKRISHNAN.K", mathsStream: "M" },
    { sNo: 15, name: "GOWRIKRISHNA.N.S", mathsStream: "M" },
    { sNo: 16, name: "HARIHARAN.S", mathsStream: "M" },
    { sNo: 17, name: "HEMALATHA.M", mathsStream: "M" },
    { sNo: 18, name: "HEMAMALINI.R", mathsStream: "M" },
    { sNo: 19, name: "JAYASURYA.R", mathsStream: "M" },
    { sNo: 20, name: "JEFFRINA.V", mathsStream: "M" },
    { sNo: 21, name: "JINOJ.M", mathsStream: "M" },
    { sNo: 22, name: "KAMALESH.P", mathsStream: "M" },
    { sNo: 23, name: "KANGAR BHARATHESWARAN.M", mathsStream: "NM" },
    { sNo: 24, name: "KASTHURI KAVIYA.S", mathsStream: "NM" },
    { sNo: 25, name: "KOWSALYA.M", mathsStream: "M" },
    { sNo: 26, name: "LAVANYA KUMAR.S", mathsStream: "M" },
    { sNo: 27, name: "MAKIZH.N", mathsStream: "M" },
    { sNo: 28, name: "MIRUDHULASINI.R", mathsStream: "M" },
    { sNo: 29, name: "MURUGAPRIYA.I", mathsStream: "M" },
    { sNo: 30, name: "NIRANJAN.A", mathsStream: "M" },
    { sNo: 31, name: "NISHAANTH.D", mathsStream: "NM" },
    { sNo: 32, name: "PAVITHRA.M", mathsStream: "M" },
    { sNo: 33, name: "PRABU.S", mathsStream: "M" },
    { sNo: 34, name: "PRAVEEN. N H", mathsStream: "NM" },
    { sNo: 35, name: "PRAVEEN RAJA.G", mathsStream: "NM" },
    { sNo: 36, name: "PRIYANKA.S", mathsStream: "M" },
    { sNo: 37, name: "RITHIKA.R", mathsStream: "M" },
    { sNo: 38, name: "ROHITH.P", mathsStream: "M" },
    { sNo: 39, name: "SACHIN .S", mathsStream: "NM" },
    { sNo: 40, name: "SATHIYA.V", mathsStream: "M" },
    { sNo: 41, name: "SIVA.S", mathsStream: "M" },
    { sNo: 42, name: "SRIVARTHINI.V", mathsStream: "M" },
    { sNo: 43, name: "STEPHEN THAYANITHI.J", mathsStream: "M" },
    { sNo: 44, name: "SUKESH.A R", mathsStream: "NM" },
    { sNo: 45, name: "TAMILARASAN.S", mathsStream: "M" },
    { sNo: 46, name: "THENMOZHI.M", mathsStream: "M" },
    { sNo: 47, name: "VENGATESHWARAN.N", mathsStream: "M" }
  ];

  const b1Students = [];
  for (const st of b1StudentsData) {
    const s = await Student.create({ ...st, batchId: batch1._id });
    b1Students.push(s);
  }

  // Load Batch 1 Results
  console.log("Seeding Batch 1 results...");
  const b1ResultsData = [
    { name: "ABINESH.M", tamil: "7", english: "3", maths: "9", core: "23", total: 42, percentage: 56.0, isAbsent: false },
    { name: "ABISHEK.S", tamil: "AB", english: "AB", maths: "AB", core: "AB", total: 0, percentage: 0, isAbsent: true },
    { name: "ANGELIN GIFTY.I", tamil: "8", english: "6", maths: "9", core: "31", total: 54, percentage: 72.0, isAbsent: false },
    { name: "ARTHI.M", tamil: "9", english: "3", maths: "4", core: "12", total: 28, percentage: 37.3, isAbsent: false },
    { name: "ASWINI.S", tamil: "AB", english: "4", maths: "6", core: "18", total: 28, percentage: 43.1, isAbsent: false },
    { name: "DEVI PRIYA.M", tamil: "6", english: "5", maths: "7", core: "13", total: 31, percentage: 41.3, isAbsent: false },
    { name: "DHANABAL.L", tamil: "6", english: "4", maths: "5", core: "9", total: 24, percentage: 32.0, isAbsent: false },
    { name: "DHANUSH.S", tamil: "AB", english: "4", maths: "7", core: "18", total: 29, percentage: 44.6, isAbsent: false },
    { name: "DHANYA.D", tamil: "9", english: "5", maths: "6", core: "29", total: 49, percentage: 65.3, isAbsent: false },
    { name: "DHARANI.S", tamil: "7", english: "5", maths: "10", core: "27", total: 49, percentage: 65.3, isAbsent: false },
    { name: "DHARUNESH.S", tamil: "9", english: "4", maths: "7", core: "22", total: 42, percentage: 56.0, isAbsent: false },
    { name: "DINESH KARTHIK.S", tamil: "AB", english: "AB", maths: "AB", core: "AB", total: 0, percentage: 0, isAbsent: true },
    { name: "GOKUL.K", tamil: "10", english: "5", maths: "9", core: "27", total: 51, percentage: 68.0, isAbsent: false },
    { name: "GOKULAKRISHNAN.K", tamil: "7", english: "5", maths: "6", core: "12", total: 30, percentage: 40.0, isAbsent: false },
    { name: "GOWRIKRISHNA.N.S", tamil: "9", english: "6", maths: "8", core: "24", total: 47, percentage: 62.7, isAbsent: false },
    { name: "HARIHARAN.S", tamil: "6", english: "6", maths: "8", core: "25", total: 45, percentage: 60.0, isAbsent: false },
    { name: "HEMALATHA.M", tamil: "AB", english: "AB", maths: "3", core: "13", total: 16, percentage: 29.1, isAbsent: false },
    { name: "HEMAMALINI.R", tamil: "6", english: "3", maths: "6", core: "28", total: 43, percentage: 57.3, isAbsent: false },
    { name: "JAYASURYA.R", tamil: "5", english: "4", maths: "7", core: "27", total: 43, percentage: 57.3, isAbsent: false },
    { name: "JEFFRINA.V", tamil: "9", english: "5", maths: "9", core: "35", total: 58, percentage: 77.3, isAbsent: false },
    { name: "JINOJ.M", tamil: "7", english: "5", maths: "5", core: "27", total: 44, percentage: 58.7, isAbsent: false },
    { name: "KAMALESH.P", tamil: "7", english: "3", maths: "4", core: "22", total: 36, percentage: 48.0, isAbsent: false },
    { name: "KANGAR BHARATHESWARAN.M", tamil: "6", english: "5", maths: "10", core: "19", total: 40, percentage: 53.3, isAbsent: false },
    { name: "KASTHURI KAVIYA.S", tamil: "8", english: "6", maths: "8", core: "27", total: 49, percentage: 65.3, isAbsent: false },
    { name: "KOWSALYA.M", tamil: "7", english: "2", maths: "5", core: "14", total: 28, percentage: 37.3, isAbsent: false },
    { name: "LAVANYA KUMAR.S", tamil: "8", english: "3", maths: "9", core: "26", total: 46, percentage: 61.3, isAbsent: false },
    { name: "MAKIZH.N", tamil: "9", english: "6", maths: "10", core: "33", total: 58, percentage: 77.3, isAbsent: false },
    { name: "MIRUDHULASINI.R", tamil: "8", english: "6", maths: "10", core: "36", total: 60, percentage: 80.0, isAbsent: false },
    { name: "MURUGAPRIYA.I", tamil: "8", english: "6", maths: "8", core: "30", total: 52, percentage: 69.3, isAbsent: false },
    { name: "NIRANJAN.A", tamil: "9", english: "4", maths: "8", core: "28", total: 49, percentage: 65.3, isAbsent: false },
    { name: "NISHAANTH.D", tamil: "5", english: "6", maths: "5", core: "23", total: 39, percentage: 52.0, isAbsent: false },
    { name: "PAVITHRA.M", tamil: "8", english: "5", maths: "6", core: "24", total: 43, percentage: 57.3, isAbsent: false },
    { name: "PRABU.S", tamil: "AB", english: "AB", maths: "AB", core: "AB", total: 0, percentage: 0, isAbsent: true },
    { name: "PRAVEEN. N H", tamil: "2", english: "3", maths: "5", core: "15", total: 25, percentage: 33.3, isAbsent: false },
    { name: "PRAVEEN RAJA.G", tamil: "7", english: "3", maths: "6", core: "27", total: 43, percentage: 57.3, isAbsent: false },
    { name: "PRIYANKA.S", tamil: "7", english: "6", maths: "10", core: "31", total: 54, percentage: 72.0, isAbsent: false },
    { name: "RITHIKA.R", tamil: "10", english: "4", maths: "7", core: "27", total: 48, percentage: 64.0, isAbsent: false },
    { name: "ROHITH.P", tamil: "8", english: "3", maths: "7", core: "18", total: 36, percentage: 48.0, isAbsent: false },
    { name: "SACHIN .S", tamil: "9", english: "6", maths: "8", core: "21", total: 44, percentage: 58.7, isAbsent: false },
    { name: "SATHIYA.V", tamil: "9", english: "5", maths: "4", core: "18", total: 36, percentage: 48.0, isAbsent: false },
    { name: "SIVA.S", tamil: "AB", english: "5", maths: "8", core: "29", total: 42, percentage: 64.6, isAbsent: false },
    { name: "SRIVARTHINI.V", tamil: "10", english: "4", maths: "8", core: "25", total: 47, percentage: 62.7, isAbsent: false },
    { name: "STEPHEN THAYANITHI.J", tamil: "10", english: "4", maths: "10", core: "14", total: 38, percentage: 50.7, isAbsent: false },
    { name: "SUKESH.A R", tamil: "AB", english: "AB", maths: "9", core: "27", total: 36, percentage: 65.5, isAbsent: false },
    { name: "TAMILARASAN.S", tamil: "6", english: "0", maths: "5", core: "14", total: 25, percentage: 33.3, isAbsent: false },
    { name: "THENMOZHI.M", tamil: "8", english: "3", maths: "6", core: "18", total: 35, percentage: 46.7, isAbsent: false },
    { name: "VENGATESHWARAN.N", tamil: "9", english: "4", maths: "6", core: "18", total: 37, percentage: 49.3, isAbsent: false }
  ];

  for (const res of b1ResultsData) {
    const student = b1Students.find(s => s.name === res.name);
    if (student) {
      await Result.create({
        batchId: batch1._id,
        studentId: student._id,
        tamil: res.tamil,
        english: res.english,
        maths: res.maths,
        core: res.core,
        total: res.total,
        percentage: res.percentage,
        isAbsent: res.isAbsent
      });
    }
  }

  // Load Batch 2 Students
  console.log("Seeding Batch 2 students...");
  const b2StudentsData = [
    { sNo: 1, name: "Saarah Azizah K.M", mathsStream: "M" },
    { sNo: 2, name: "Mahadharshini V", mathsStream: "NM" },
    { sNo: 3, name: "Kaavya P", mathsStream: "M" },
    { sNo: 4, name: "Karthikaa P", mathsStream: "M" },
    { sNo: 5, name: "Abarna C", mathsStream: "NM" },
    { sNo: 6, name: "Subiskha . P", mathsStream: "M" },
    { sNo: 7, name: "Neha Sai .S", mathsStream: "NM" },
    { sNo: 8, name: "Varshini M", mathsStream: "M" },
    { sNo: 9, name: "Abhinaya M", mathsStream: "NM" },
    { sNo: 10, name: "Shandhanalakshmi C", mathsStream: "M" },
    { sNo: 11, name: "Gowri P", mathsStream: "NM" },
    { sNo: 12, name: "Janaka Nandhini M", mathsStream: "M" },
    { sNo: 13, name: "Indhumathi N", mathsStream: "NM" },
    { sNo: 14, name: "Dharaneesh P.B", mathsStream: "M" },
    { sNo: 15, name: "Madhan Prasanth A", mathsStream: "NM" },
    { sNo: 16, name: "Sanjay Aravind .R", mathsStream: "NM" },
    { sNo: 17, name: "Keshav balaji K", mathsStream: "M" },
    { sNo: 18, name: "Sharmila M", mathsStream: "M" },
    { sNo: 19, name: "Surya G", mathsStream: "NM" },
    { sNo: 20, name: "Vijay C", mathsStream: "M" },
    { sNo: 21, name: "Kalaiyarasan A", mathsStream: "NM" },
    { sNo: 22, name: "Arthi B", mathsStream: "M" },
    { sNo: 23, name: "Kaviya Lakshmi M", mathsStream: "NM" },
    { sNo: 24, name: "Ramanujam P", mathsStream: "M" },
    { sNo: 25, name: "Shameer S", mathsStream: "NM" },
    { sNo: 26, name: "Prakash S", mathsStream: "NM" },
    { sNo: 27, name: "Kiruthik C", mathsStream: "M" },
    { sNo: 28, name: "Ajay M", mathsStream: "M" },
    { sNo: 29, name: "Illakiya R", mathsStream: "NM" },
    { sNo: 30, name: "Sandhiya S", mathsStream: "M" },
    { sNo: 31, name: "Keerthana V", mathsStream: "NM" },
    { sNo: 32, name: "Gokulraj P", mathsStream: "M" },
    { sNo: 33, name: "Sunil Kumar M", mathsStream: "M" },
    { sNo: 34, name: "Naveen V", mathsStream: "NM" },
    { sNo: 35, name: "Dhanaseelan R M", mathsStream: "M" },
    { sNo: 36, name: "Bharathraj R", mathsStream: "NM" },
    { sNo: 37, name: "Pooja", mathsStream: "M" },
    { sNo: 38, name: "Niroshini R", mathsStream: "M" },
    { sNo: 39, name: "Sri ruthra", mathsStream: "NM" },
    { sNo: 40, name: "Sasiram S", mathsStream: "M" },
    { sNo: 41, name: "Harani", mathsStream: "NM" },
    { sNo: 42, name: "Thirumurugam.M", mathsStream: "M" },
    { sNo: 43, name: "Sathendrareddy", mathsStream: "NM" }
  ];

  const b2Students = [];
  for (const st of b2StudentsData) {
    const s = await Student.create({ ...st, batchId: batch2._id });
    b2Students.push(s);
  }

  // Load Batch 2 Results
  console.log("Seeding Batch 2 results...");
  const b2ResultsData = [
    { name: "Saarah Azizah K.M", tamil: "11", english: "12", maths: "12", core: "36", total: 71, percentage: 71.0, isAbsent: false },
    { name: "Mahadharshini V", tamil: "AB", english: "AB", maths: "AB", core: "AB", total: 0, percentage: 0, isAbsent: true },
    { name: "Kaavya P", tamil: "11", english: "13", maths: "15", core: "39", total: 78, percentage: 78.0, isAbsent: false },
    { name: "Karthikaa P", tamil: "12", english: "14", maths: "14", core: "45", total: 85, percentage: 85.0, isAbsent: false },
    { name: "Abarna C", tamil: "13", english: "13", maths: "14", core: "30", total: 70, percentage: 70.0, isAbsent: false },
    { name: "Subiskha . P", tamil: "13", english: "15", maths: "13", core: "38", total: 79, percentage: 79.0, isAbsent: false },
    { name: "Neha Sai .S", tamil: "12", english: "8", maths: "9", core: "20", total: 49, percentage: 49.0, isAbsent: false },
    { name: "Varshini M", tamil: "12", english: "14", maths: "15", core: "48", total: 89, percentage: 89.0, isAbsent: false },
    { name: "Abhinaya M", tamil: "13", english: "12", maths: "14", core: "31", total: 70, percentage: 70.0, isAbsent: false },
    { name: "Shandhanalakshmi C", tamil: "13", english: "15", maths: "14", core: "52", total: 94, percentage: 94.0, isAbsent: false },
    { name: "Gowri P", tamil: "13", english: "13", maths: "15", core: "43", total: 84, percentage: 84.0, isAbsent: false },
    { name: "Janaka Nandhini M", tamil: "10", english: "15", maths: "15", core: "49", total: 89, percentage: 89.0, isAbsent: false },
    { name: "Indhumathi N", tamil: "12", english: "15", maths: "14", core: "48", total: 89, percentage: 89.0, isAbsent: false },
    { name: "Dharaneesh P.B", tamil: "12", english: "12", maths: "13", core: "30", total: 67, percentage: 67.0, isAbsent: false },
    { name: "Madhan Prasanth A", tamil: "AB", english: "AB", maths: "AB", core: "AB", total: 0, percentage: 0, isAbsent: true },
    { name: "Sanjay Aravind .R", tamil: "AB", english: "AB", maths: "AB", core: "AB", total: 0, percentage: 0, isAbsent: true },
    { name: "Keshav balaji K", tamil: "13", english: "15", maths: "15", core: "46", total: 89, percentage: 89.0, isAbsent: false },
    { name: "Sharmila M", tamil: "13", english: "15", maths: "14", core: "51", total: 93, percentage: 93.0, isAbsent: false },
    { name: "Surya G", tamil: "12", english: "10", maths: "7", core: "17", total: 46, percentage: 46.0, isAbsent: false },
    { name: "Vijay C", tamil: "AB", english: "AB", maths: "AB", core: "AB", total: 0, percentage: 0, isAbsent: true },
    { name: "Kalaiyarasan A", tamil: "11", english: "11", maths: "12", core: "39", total: 73, percentage: 73.0, isAbsent: false },
    { name: "Arthi B", tamil: "6", english: "15", maths: "15", core: "48", total: 84, percentage: 84.0, isAbsent: false },
    { name: "Kaviya Lakshmi M", tamil: "11", english: "14", maths: "15", core: "47", total: 87, percentage: 87.0, isAbsent: false },
    { name: "Ramanujam P", tamil: "12", english: "7", maths: "12", core: "20", total: 51, percentage: 51.0, isAbsent: false },
    { name: "Shameer S", tamil: "AB", english: "AB", maths: "AB", core: "AB", total: 0, percentage: 0, isAbsent: true },
    { name: "Prakash S", tamil: "5", english: "7", maths: "5", core: "23", total: 40, percentage: 40.0, isAbsent: false },
    { name: "Kiruthik C", tamil: "13", english: "12", maths: "12", core: "25", total: 62, percentage: 62.0, isAbsent: false },
    { name: "Ajay M", tamil: "10", english: "10", maths: "13", core: "41", total: 74, percentage: 74.0, isAbsent: false },
    { name: "Illakiya R", tamil: "13", english: "13", maths: "13", core: "50", total: 89, percentage: 89.0, isAbsent: false },
    { name: "Sandhiya S", tamil: "13", english: "12", maths: "10", core: "33", total: 68, percentage: 68.0, isAbsent: false },
    { name: "Keerthana V", tamil: "12", english: "14", maths: "14", core: "38", total: 78, percentage: 78.0, isAbsent: false },
    { name: "Gokulraj P", tamil: "10", english: "13", maths: "12", core: "30", total: 65, percentage: 65.0, isAbsent: false },
    { name: "Sunil Kumar M", tamil: "13", english: "10", maths: "11", core: "27", total: 61, percentage: 61.0, isAbsent: false },
    { name: "Naveen V", tamil: "10", english: "15", maths: "15", core: "36", total: 76, percentage: 76.0, isAbsent: false },
    { name: "Dhanaseelan R M", tamil: "13", english: "12", maths: "11", core: "44", total: 80, percentage: 80.0, isAbsent: false },
    { name: "Bharathraj R", tamil: "11", english: "15", maths: "14", core: "44", total: 84, percentage: 84.0, isAbsent: false },
    { name: "Pooja", tamil: "12", english: "13", maths: "14", core: "33", total: 72, percentage: 72.0, isAbsent: false },
    { name: "Niroshini R", tamil: "12", english: "15", maths: "15", core: "36", total: 78, percentage: 78.0, isAbsent: false },
    { name: "Sri ruthra", tamil: "13", english: "13", maths: "12", core: "45", total: 83, percentage: 83.0, isAbsent: false },
    { name: "Sasiram S", tamil: "10", english: "12", maths: "15", core: "44", total: 81, percentage: 81.0, isAbsent: false },
    { name: "Harani", tamil: "13", english: "14", maths: "13", core: "27", total: 67, percentage: 67.0, isAbsent: false },
    { name: "Thirumurugam.M", tamil: "10", english: "12", maths: "11", core: "23", total: 56, percentage: 56.0, isAbsent: false },
    { name: "Sathendrareddy", tamil: "11", english: "15", maths: "14", core: "47", total: 87, percentage: 87.0, isAbsent: false }
  ];

  for (const res of b2ResultsData) {
    const student = b2Students.find(s => s.name === res.name);
    if (student) {
      await Result.create({
        batchId: batch2._id,
        studentId: student._id,
        tamil: res.tamil,
        english: res.english,
        maths: res.maths,
        core: res.core,
        total: res.total,
        percentage: res.percentage,
        isAbsent: res.isAbsent
      });
    }
  }

  // Seeding Batch 3 students & results from PDF
  console.log("Seeding Batch 3 students from PDF...");
  const b3StudentsData = [
    { sNo: 1, name: "AAYISHA SIDHIKA D", mathsStream: "M" },
    { sNo: 2, name: "AGASTIAN G E", mathsStream: "M" },
    { sNo: 3, name: "BALAJI I", mathsStream: "NM" },
    { sNo: 4, name: "DHANASRI A", mathsStream: "M" },
    { sNo: 5, name: "DHARUNKUMAR V", mathsStream: "NM" },
    { sNo: 6, name: "DINEESH KUMAR J", mathsStream: "M" },
    { sNo: 7, name: "DIVYADHARSHINI A", mathsStream: "M" },
    { sNo: 8, name: "DURGA SRI S", mathsStream: "NM" },
    { sNo: 9, name: "GOBIKA C R", mathsStream: "NM" },
    { sNo: 10, name: "HARIHARASUDHAN M", mathsStream: "M" },
    { sNo: 11, name: "HARITHA B", mathsStream: "M" },
    { sNo: 12, name: "HARIVARATHAN A", mathsStream: "M" },
    { sNo: 13, name: "ILLAKIYA R", mathsStream: "M" },
    { sNo: 14, name: "JAYSHREE S", mathsStream: "NM" },
    { sNo: 15, name: "KARUPPUSAMY S", mathsStream: "M" },
    { sNo: 16, name: "KAVIYA R", mathsStream: "NM" },
    { sNo: 17, name: "KEERTHANA C", mathsStream: "M" },
    { sNo: 18, name: "LAKSHITHA MAYUGA KUMARI M", mathsStream: "NM" },
    { sNo: 19, name: "LAVANYA K", mathsStream: "M" },
    { sNo: 20, name: "MADHUMATHI R", mathsStream: "NM" },
    { sNo: 21, name: "MEGA SRI B", mathsStream: "NM" },
    { sNo: 22, name: "NAVANEETHAKRISHNAN S", mathsStream: "M" },
    { sNo: 23, name: "NAVEEN M", mathsStream: "M" },
    { sNo: 24, name: "NIGHILA S V", mathsStream: "M" },
    { sNo: 25, name: "NITHINRAJ S", mathsStream: "M" },
    { sNo: 26, name: "NITHISH M", mathsStream: "M" },
    { sNo: 27, name: "NITHYA SREE G", mathsStream: "M" },
    { sNo: 28, name: "OMESHWAR S", mathsStream: "M" },
    { sNo: 29, name: "PANDISELVI P", mathsStream: "M" },
    { sNo: 30, name: "PRADHEEPA DEVI B", mathsStream: "M" },
    { sNo: 31, name: "PRAMADEESH S", mathsStream: "M" },
    { sNo: 32, name: "RATHNA S", mathsStream: "M" },
    { sNo: 33, name: "RITHICK A", mathsStream: "M" },
    { sNo: 34, name: "ROBERT JONES P", mathsStream: "NM" },
    { sNo: 35, name: "SANJEEVKUMAR R", mathsStream: "M" },
    { sNo: 36, name: "SANTHOSH K", mathsStream: "M" },
    { sNo: 37, name: "SATHEESH P", mathsStream: "NM" },
    { sNo: 38, name: "SIVARAMAKRISHNAN M", mathsStream: "NM" },
    { sNo: 39, name: "THARUN V", mathsStream: "M" },
    { sNo: 40, name: "VAISHNAVI S", mathsStream: "M" },
    { sNo: 41, name: "VARSHINI R", mathsStream: "M" },
    { sNo: 42, name: "VIPIN KRISHNA P", mathsStream: "M" },
    { sNo: 43, name: "VISHNU R", mathsStream: "NM" },
    { sNo: 44, name: "YOGESHWARAN R", mathsStream: "M" },
    { sNo: 45, name: "EBINESH V", mathsStream: "NM" }
  ];

  const b3Students = [];
  for (const st of b3StudentsData) {
    const s = await Student.create({ ...st, batchId: batch3._id });
    b3Students.push(s);
  }

  console.log("Seeding Batch 3 results from PDF...");
  const b3ResultsData = [
    { name: "AAYISHA SIDHIKA D", tamil: "15", english: "12", maths: "13", core: "46", total: 86, percentage: 86.0, isAbsent: false },
    { name: "AGASTIAN G E", tamil: "13", english: "12", maths: "12", core: "41", total: 78, percentage: 78.0, isAbsent: false },
    { name: "BALAJI I", tamil: "13", english: "8", maths: "9", core: "23", total: 53, percentage: 53.0, isAbsent: false },
    { name: "DHANASRI A", tamil: "11", english: "13", maths: "9", core: "40", total: 73, percentage: 73.0, isAbsent: false },
    { name: "DHARUNKUMAR V", tamil: "AB", english: "AB", maths: "AB", core: "AB", total: 0, percentage: 0, isAbsent: true },
    { name: "DINEESH KUMAR J", tamil: "12", english: "9", maths: "10", core: "53", total: 84, percentage: 84.0, isAbsent: false },
    { name: "DIVYADHARSHINI A", tamil: "13", english: "13", maths: "9", core: "44", total: 79, percentage: 79.0, isAbsent: false },
    { name: "DURGA SRI S", tamil: "12", english: "14", maths: "10", core: "33", total: 69, percentage: 69.0, isAbsent: false },
    { name: "GOBIKA C R", tamil: "AB", english: "AB", maths: "AB", core: "AB", total: 0, percentage: 0, isAbsent: true },
    { name: "HARIHARASUDHAN M", tamil: "12", english: "14", maths: "15", core: "48", total: 89, percentage: 89.0, isAbsent: false },
    { name: "HARITHA B", tamil: "13", english: "13", maths: "12", core: "43", total: 81, percentage: 81.0, isAbsent: false },
    { name: "HARIVARATHAN A", tamil: "14", english: "8", maths: "13", core: "51", total: 86, percentage: 86.0, isAbsent: false },
    { name: "ILLAKIYA R", tamil: "15", english: "13", maths: "12", core: "47", total: 87, percentage: 87.0, isAbsent: false },
    { name: "JAYSHREE S", tamil: "14", english: "8", maths: "9", core: "32", total: 63, percentage: 63.0, isAbsent: false },
    { name: "KARUPPUSAMY S", tamil: "12", english: "15", maths: "15", core: "50", total: 92, percentage: 92.0, isAbsent: false },
    { name: "KAVIYA R", tamil: "12", english: "8", maths: "8", core: "27", total: 55, percentage: 55.0, isAbsent: false },
    { name: "KEERTHANA C", tamil: "14", english: "13", maths: "12", core: "40", total: 79, percentage: 79.0, isAbsent: false },
    { name: "LAKSHITHA MAYUGA KUMARI M", tamil: "10", english: "9", maths: "8", core: "23", total: 50, percentage: 50.0, isAbsent: false },
    { name: "LAVANYA K", tamil: "12", english: "12", maths: "9", core: "44", total: 77, percentage: 77.0, isAbsent: false },
    { name: "MADHUMATHI R", tamil: "AB", english: "AB", maths: "AB", core: "AB", total: 0, percentage: 0, isAbsent: true },
    { name: "MEGA SRI B", tamil: "9", english: "10", maths: "5", core: "31", total: 55, percentage: 55.0, isAbsent: false },
    { name: "NAVANEETHAKRISHNAN S", tamil: "14", english: "14", maths: "15", core: "51", total: 94, percentage: 94.0, isAbsent: false },
    { name: "NAVEEN M", tamil: "13", english: "15", maths: "14", core: "54", total: 96, percentage: 96.0, isAbsent: false },
    { name: "NIGHILA S V", tamil: "13", english: "15", maths: "11", core: "41", total: 80, percentage: 80.0, isAbsent: false },
    { name: "NITHINRAJ S", tamil: "14", english: "10", maths: "8", core: "41", total: 73, percentage: 73.0, isAbsent: false },
    { name: "NITHISH M", tamil: "14", english: "15", maths: "9", core: "37", total: 75, percentage: 75.0, isAbsent: false },
    { name: "NITHYA SREE G", tamil: "14", english: "11", maths: "12", core: "41", total: 78, percentage: 78.0, isAbsent: false },
    { name: "OMESHWAR S", tamil: "11", english: "12", maths: "13", core: "38", total: 74, percentage: 74.0, isAbsent: false },
    { name: "PANDISELVI P", tamil: "15", english: "6", maths: "13", core: "43", total: 77, percentage: 77.0, isAbsent: false },
    { name: "PRADHEEPA DEVI B", tamil: "15", english: "14", maths: "11", core: "48", total: 88, percentage: 88.0, isAbsent: false },
    { name: "PRAMADEESH S", tamil: "13", english: "11", maths: "12", core: "40", total: 76, percentage: 76.0, isAbsent: false },
    { name: "RATHNA S", tamil: "11", english: "12", maths: "12", core: "38", total: 73, percentage: 73.0, isAbsent: false },
    { name: "RITHICK A", tamil: "12", english: "14", maths: "14", core: "50", total: 90, percentage: 90.0, isAbsent: false },
    { name: "ROBERT JONES P", tamil: "AB", english: "AB", maths: "AB", core: "AB", total: 0, percentage: 0, isAbsent: true },
    { name: "SANJEEVKUMAR R", tamil: "11", english: "12", maths: "9", core: "46", total: 78, percentage: 78.0, isAbsent: false },
    { name: "SANTHOSH K", tamil: "11", english: "15", maths: "13", core: "51", total: 90, percentage: 90.0, isAbsent: false },
    { name: "SATHEESH P", tamil: "AB", english: "AB", maths: "AB", core: "AB", total: 0, percentage: 0, isAbsent: true },
    { name: "SIVARAMAKRISHNAN M", tamil: "14", english: "8", maths: "8", core: "24", total: 54, percentage: 54.0, isAbsent: false },
    { name: "THARUN V", tamil: "14", english: "15", maths: "15", core: "42", total: 86, percentage: 86.0, isAbsent: false },
    { name: "VAISHNAVI S", tamil: "14", english: "14", maths: "8", core: "38", total: 74, percentage: 74.0, isAbsent: false },
    { name: "VARSHINI R", tamil: "9", english: "11", maths: "6", core: "36", total: 62, percentage: 62.0, isAbsent: false },
    { name: "VIPIN KRISHNA P", tamil: "14", english: "13", maths: "14", core: "53", total: 94, percentage: 94.0, isAbsent: false },
    { name: "VISHNU R", tamil: "11", english: "4", maths: "7", core: "19", total: 41, percentage: 41.0, isAbsent: false },
    { name: "YOGESHWARAN R", tamil: "13", english: "14", maths: "12", core: "52", total: 91, percentage: 91.0, isAbsent: false },
    { name: "EBINESH V", tamil: "12", english: "13", maths: "10", core: "35", total: 70, percentage: 70.0, isAbsent: false }
  ];

  for (const res of b3ResultsData) {
    const student = b3Students.find(s => s.name === res.name);
    if (student) {
      await Result.create({
        batchId: batch3._id,
        studentId: student._id,
        tamil: res.tamil,
        english: res.english,
        maths: res.maths,
        core: res.core,
        total: res.total,
        percentage: res.percentage,
        isAbsent: res.isAbsent
      });
    }
  }

  // Load Abbreviation Legends
  console.log("Seeding timetable abbreviations...");
  const b1Abbrevs = [
    { sNo: 1, abbreviation: "CT", particulars: "Campus Tour, Institutional Rules and Regulations", facultyName: "Head of the Department", noOfHours: 1 },
    { sNo: 2, abbreviation: "FD", particulars: "Familiarization with Department, Career Prospects, workshops, ICT and other facilities", facultyName: "Concerned Class Tutors", noOfHours: 1 },
    { sNo: 3, abbreviation: "SSA", particulars: "Student Support Activities/Familiarization of Various Clubs", facultyName: "Bernard Edward - VP", noOfHours: 1 },
    { sNo: 4, abbreviation: "PMF", particulars: "Physical & Mental Fitness", facultyName: "Physical Director", noOfHours: 1 },
    { sNo: 5, abbreviation: "AI", particulars: "Alumni Interaction with fresher's", facultyName: "Department Alumni", noOfHours: 1 },
    { sNo: 6, abbreviation: "TMD", particulars: "Training Module Description", facultyName: "Ms. Chitralekha.S", noOfHours: 1 },
    { sNo: 7, abbreviation: "CE", particulars: "Corporate Expectations and How to Prepare Yourself in Three years at College", facultyName: "Trainer - Placement", noOfHours: 3 },
    { sNo: 8, abbreviation: "TAMIL", particulars: "Tamil Department - Syllabus", facultyName: "From Tamil Department", noOfHours: 3 },
    { sNo: 9, abbreviation: "ENG(X)", particulars: "English Department - Syllabus", facultyName: "From English Department", noOfHours: 3 },
    { sNo: 10, abbreviation: "MATHEMATICS", particulars: "Maths Department - Syllabus", facultyName: "From Maths Department", noOfHours: 3 },
    { sNo: 11, abbreviation: "GSP", particulars: "Gender Sensitivity Programme / Awareness on Cyber Crime", facultyName: "Expert", noOfHours: 1 },
    { sNo: 12, abbreviation: "Core Course", particulars: "Concerned Department Subjects", facultyName: "Concerned Department", noOfHours: 15 },
    { sNo: 13, abbreviation: "BCA", particulars: "Bridge Course Assessment", facultyName: "Concerned Department", noOfHours: 2 }
  ];

  const b2Abbrevs = [
    { sNo: 1, abbreviation: "CT", particulars: "CampusTour, InstitutionalRulesandRegulations", facultyName: "Headofthe Department", noOfHours: 1 },
    { sNo: 2, abbreviation: "FD", particulars: "Familiarization with Department, Career Prospects, workshops, ICT and other facilities", facultyName: "Concerned ClassTutors", noOfHours: 1 },
    { sNo: 3, abbreviation: "SSA", particulars: "StudentSupportActivities/FamiliarizationofVarious Clubs", facultyName: "BernardEdward - VP", noOfHours: 1 },
    { sNo: 4, abbreviation: "PMF", particulars: "Physical&MentalFitness", facultyName: "Physical Director", noOfHours: 1 },
    { sNo: 5, abbreviation: "AI(SW)", particulars: "AlumniInteractionwithfresher's", facultyName: "Alumni for the Department", noOfHours: 2 },
    { sNo: 6, abbreviation: "SDP", particulars: "HowtoPrepareYourselfinThreeyearsatCollege- Skill Development Programme", facultyName: "Trainer - Placement", noOfHours: 3 },
    { sNo: 7, abbreviation: "LL", particulars: "LibraryLearningTools", facultyName: "Librarian", noOfHours: 1 },
    { sNo: 8, abbreviation: "Tamil", particulars: "GeneralTamil", facultyName: "TamilDepartment", noOfHours: 3 },
    { sNo: 9, abbreviation: "English", particulars: "CommunicativeEnglish", facultyName: "English Department", noOfHours: 3 },
    { sNo: 10, abbreviation: "Mathematics", particulars: "MathsDepartment -Syllabus", facultyName: "Maths Department", noOfHours: 3 },
    { sNo: 11, abbreviation: "GSP", particulars: "GenderSensitivityProgramme", facultyName: "Expert", noOfHours: 2 },
    { sNo: 12, abbreviation: "PRG(SW)", particulars: "ConcernedDepartmentCourses", facultyName: "ConcernedDepartment", noOfHours: 12 },
    { sNo: 13, abbreviation: "BCA", particulars: "BridgeCourse Assessment", facultyName: "ConcernedDepartment", noOfHours: 3 }
  ];

  const b3Abbrevs = [
    { sNo: 1, abbreviation: "CT", particulars: "Campus Tour, Institutional Rules and Regulations", facultyName: "Head of the Department", noOfHours: 1 },
    { sNo: 2, abbreviation: "FD", particulars: "Familiarization with Department, Career Prospects, workshops, ICT and other facilities", facultyName: "Concerned Class Tutors", noOfHours: 1 },
    { sNo: 3, abbreviation: "SSA", particulars: "Student Support Activities/Familiarization of Various Clubs", facultyName: "Bernard Edward - VP", noOfHours: 1 },
    { sNo: 4, abbreviation: "PMF", particulars: "Physical & Mental Fitness", facultyName: "Physical Director", noOfHours: 1 },
    { sNo: 5, abbreviation: "AI", particulars: "Alumni Interaction with fresher's", facultyName: "Alumni for the Department", noOfHours: 2 },
    { sNo: 6, abbreviation: "PT", particulars: "Personality Training and How to Prepare Yourself in Three years at College", facultyName: "Trainer - Placement", noOfHours: 3 },
    { sNo: 7, abbreviation: "LL", particulars: "Library Learning Tools", facultyName: "Librarian", noOfHours: 1 },
    { sNo: 8, abbreviation: "Tamil", particulars: "General Tamil", facultyName: "Tamil Department", noOfHours: 3 },
    { sNo: 9, abbreviation: "English", particulars: "Communicative English", facultyName: "English Department", noOfHours: 3 },
    { sNo: 10, abbreviation: "Mathematics", particulars: "Maths Department - Syllabus", facultyName: "Maths Department", noOfHours: 3 },
    { sNo: 11, abbreviation: "GSP", particulars: "Gender Sensitivity Programme", facultyName: "Expert", noOfHours: 2 },
    { sNo: 12, abbreviation: "Discipline", particulars: "Concerned Department Courses", facultyName: "Concerned Department", noOfHours: 12 },
    { sNo: 13, abbreviation: "BCA", particulars: "Bridge Course Assessment", facultyName: "Concerned Department", noOfHours: 3 }
  ];

  for (const ab of b1Abbrevs) {
    await Abbreviation.create({ ...ab, batchId: batch1._id });
  }
  for (const ab of b2Abbrevs) {
    await Abbreviation.create({ ...ab, batchId: batch2._id });
  }
  for (const ab of b3Abbrevs) {
    await Abbreviation.create({ ...ab, batchId: batch3._id });
  }

  // Load Schedule Slots
  console.log("Seeding timetable slots...");
  const b1Slots = [
    { dayOrder: "IV", date: "2024-07-02", periods: { I: "FD", II: "CT", III: "ENG(X)", IV: "TAMIL", V: "Core Course", VI: "Core Course" } },
    { dayOrder: "V", date: "2024-07-03", periods: { I: "Core Course", II: "Core Course", III: "TAMIL", IV: "Core Course", V: "MATHEMATICS", VI: "Core Course" } },
    { dayOrder: "VI", date: "2024-07-04", periods: { I: "ENG(X)", II: "Core Course", III: "TAMIL", IV: "Core Course", V: "GSP", VI: "Core Course" } },
    { dayOrder: "I", date: "2024-07-05", periods: { I: "Core Course", II: "AI", III: "TMD", IV: "TAMIL", V: "CE", VI: "MATHEMATICS" } },
    { dayOrder: "II", date: "2024-07-08", periods: { I: "Core Course", II: "MATHEMATICS", III: "Core Course", IV: "Core Course", V: "PMF", VI: "CE" } },
    { dayOrder: "III", date: "2024-07-09", periods: { I: "Core Course", II: "Core Course", III: "Core Course", IV: "ENG(X)", V: "BCA", VI: "BCA" } }
  ];

  const b2Slots = [
    { dayOrder: "II", date: "2025-06-26", periods: { I: "CT", II: "FD", III: "ENG", IV: "PRG(SW)", V: "PRG(SW)", VI: "TAMIL" } },
    { dayOrder: "III", date: "2025-06-27", periods: { I: "PRG(SW)", II: "SSA", III: "PRG(SW)", IV: "PRG(SW)", V: "ENG", VI: "PMF" } },
    { dayOrder: "IV", date: "2025-06-30", periods: { I: "SDP", II: "SDP", III: "SDP", IV: "MATHEMATICS", V: "PRG(SW)", VI: "LL" } },
    { dayOrder: "V", date: "2025-07-01", periods: { I: "GSP", II: "GSP", III: "TAMIL", IV: "PRG(SW)", V: "MATHEMATICS", VI: "PRG(SW)" } },
    { dayOrder: "VI", date: "2025-07-02", periods: { I: "AI(SW)", II: "GSP", III: "ALUMINI TALK", IV: "ENG", V: "PRG(SW)", VI: "PRG(SW)" } },
    { dayOrder: "I", date: "2025-07-03", periods: { I: "TAMIL", II: "MATHEMATICS", III: "PRG(SW)", IV: "PRG(SW)", V: "PRG(SW)", VI: "BCA" } }
  ];

  const b3Slots = [
    { dayOrder: "IV", date: "2026-06-30", periods: { I: "CT", II: "FD", III: "MAT", IV: "TAM", V: "SVK", VI: "ENG" } },
    { dayOrder: "V", date: "2026-07-01", periods: { I: "S.B(C)", II: "PMF", III: "SSA", IV: "ENG", V: "MAT", VI: "LIB" } },
    { dayOrder: "VI", date: "2026-07-02", periods: { I: "SB", II: "SVK", III: "VG", IV: "AS", V: "RSA", VI: "-" } },
    { dayOrder: "I", date: "2026-07-03", periods: { I: "SB(LAB)", II: "VG", III: "TRIP TO ISHA YOGA", IV: "TAM", V: "ALUMNI TALK", VI: "-" } },
    { dayOrder: "II", date: "2026-07-06", periods: { I: "ENG", II: "SB", III: "TAM", IV: "PLACEMENT", V: "-", VI: "-" } },
    { dayOrder: "III", date: "2026-07-07", periods: { I: "MAT", II: "AS", III: "SVK", IV: "BCA", V: "-", VI: "-" } }
  ];

  for (const slot of b1Slots) {
    await ScheduleSlot.create({ ...slot, batchId: batch1._id });
  }
  for (const slot of b2Slots) {
    await ScheduleSlot.create({ ...slot, batchId: batch2._id });
  }
  for (const slot of b3Slots) {
    await ScheduleSlot.create({ ...slot, batchId: batch3._id });
  }

  // Load Syllabus Items
  console.log("Seeding Syllabus...");
  await Syllabus.create([
    {
      batchId: batch1._id,
      subjectName: "Tamil-I",
      departmentName: "Department of Tamil",
      hours: 3,
      mathsStream: "ALL",
      objectives: ["தமிழ் மொழியின் சிறப்புகளை அறிந்து அதன் மீது ஆர்வத்தைத் தூண்டுதல்."],
      units: [
        { unitNo: "அலகு I", title: "தமிழ் மொழியின் பெருமைகள், சிறப்புகள்", content: "தமிழ் மொழியின் தொன்மை, சிறப்புகள் மற்றும் அதன் முக்கியத்துவம்." },
        { unitNo: "அலகு II", title: "இலக்கியங்கள் அறிமுகம்", content: "சங்க இலக்கியங்கள், காப்பியங்கள், பக்தி இலக்கியங்களின் பொது அறிமுகம்." }
      ],
      referenceBooks: ["தமிழ் இலக்கிய வரலாறு - மு.வரதராசனார்", "ஊடகவியல் - முனைவர் துரை.மணிகண்டன்"],
      staffIncharge: "Tamil Department Staff",
      subjectExpert: { name: "Dr. S. Poongodi", designation: "Associate Professor & HOD", institution: "PG & Research Dept. of Tamil, Coimbatore", details: "Coimbatore - 641 018" },
      hodName: "Dr. M. Lingaraj"
    },
    {
      batchId: batch1._id,
      subjectName: "English Non-Major",
      departmentName: "Department of English",
      hours: 3,
      mathsStream: "ALL",
      objectives: [
        "The role of communication in business related professions",
        "To improve analytical skills",
        "To enhance listening, writing and speaking skills"
      ],
      units: [
        { unitNo: "UNIT I", title: "Active listening and speaking skills", content: "Active listening and speaking skills - Pod Cast, Self-introduction and Impromptu speech." },
        { unitNo: "UNIT II", title: "Writing Skills", content: "Writing Skills - Movie Review, Book Review." }
      ],
      referenceBooks: [
        "Parts of Speech: Basics of English Grammar by Kuldeep Yadav",
        "WordPress for Beginners 2022 by Dr. Andy Williams"
      ],
      staffIncharge: "English Department Staff",
      subjectExpert: { name: "Captain E. Justin Ruben", designation: "Associate NCC Officer & AP", institution: "Coimbatore Institute of Technology", details: "CIT, Coimbatore" },
      hodName: "Dr. M. Lingaraj"
    },
    // Mathematics split for Batch 1
    {
      batchId: batch1._id,
      subjectName: "Basic Mathematics (Maths)",
      departmentName: "Department of Mathematics",
      hours: 3,
      mathsStream: "M",
      objectives: ["To understand the fundamental concepts of mathematical and statistical techniques.", "To aware basic ideas to apply for mathematical modelling."],
      units: [
        { unitNo: "Unit I", title: "Matrices", content: "Matrices: Definition - Types of Matrices - Operations: Addition, Subtraction and Multiplication of Matrices." },
        { unitNo: "Unit II", title: "Variables & Functions", content: "Introduction to Variables, Constants and Functions - Kind of Equations - Solving Quadratic and Cubic Equations." }
      ],
      referenceBooks: ["Business Mathematics & Statistics - P. A. Navanitham"],
      staffIncharge: "Ms. G. Poongothai",
      subjectExpert: { name: "Dr. E. Prakash", designation: "Assistant Professor", institution: "Kongunadu Arts and Science College", details: "Coimbatore - 641 029" },
      hodName: "Dr. M. Lingaraj"
    },
    {
      batchId: batch1._id,
      subjectName: "Basic Mathematics (Non-Maths)",
      departmentName: "Department of Mathematics",
      hours: 3,
      mathsStream: "NM",
      objectives: ["To understand the fundamental concepts of mathematical and statistical techniques.", "To aware basic ideas to apply for mathematical modelling."],
      units: [
        { unitNo: "Unit I", title: "Number System", content: "Introduction to Number System and its Operations - BODMAS Rule - LCM, GCD & HCF." },
        { unitNo: "Unit II", title: "Matrices", content: "Matrices: Definition - Types of Matrices - Operations: Addition and Subtraction of Matrices." }
      ],
      referenceBooks: ["Business Mathematics & Statistics - P. A. Navanitham"],
      staffIncharge: "Mr. S. Bharath",
      subjectExpert: { name: "Dr. E. Prakash", designation: "Assistant Professor", institution: "Kongunadu Arts and Science College", details: "Coimbatore - 641 029" },
      hodName: "Dr. M. Lingaraj"
    },
    // Syllabus for Batch 2 (v6.0)
    {
      batchId: batch2._id,
      subjectName: "Orientation Programme",
      departmentName: "Department of CSDA",
      hours: 3,
      mathsStream: "ALL",
      objectives: [
        "Help students feel at ease in the new academic environment.",
        "Encourage exploration of academic interests and institutional activities."
      ],
      units: [
        { unitNo: "UNIT I", title: "Campus Tour & Department Overview", content: "Campus Tour, Institutional Rules and Regulations, Familiarization with Department, workshops, and ICT facilities." },
        { unitNo: "UNIT II", title: "Student Support & Fitness", content: "Student Support Activities, Familiarization of Various Clubs, and Physical & Mental Fitness." },
        { unitNo: "UNIT III", title: "Professional Readiness", content: "Corporate Expectations, Placement Training, Training Module Description, and SWAYAM-NPTEL-MOOCS orientation." }
      ],
      referenceBooks: ["UGC Guidelines for Student Induction Programme (SIP)", "Sankara College Student Handbook"],
      staffIncharge: "Prof. Faculty",
      subjectExpert: { name: "Dr. Sandhya Ramachandran", designation: "Managing Trustee", institution: "Sankara College of Science and Commerce", details: "Coimbatore" },
      hodName: "Dr. R. Sasikala"
    },
    {
      batchId: batch2._id,
      subjectName: "Mathematics",
      departmentName: "Department of Mathematics",
      hours: 3,
      mathsStream: "M",
      objectives: [
        "To understand the fundamental concepts of mathematical and statistical techniques.",
        "To build foundational algebraic skills for data analytics applications."
      ],
      units: [
        { unitNo: "Unit I", title: "Matrices & Operations", content: "Matrices: Definition, Types of Matrices, Operations including Addition, Subtraction, and Multiplication of Matrices." },
        { unitNo: "Unit II", title: "Equations & Functions", content: "Introduction to Variables, Constants, and Functions. Solving Quadratic and Cubic Equations." }
      ],
      referenceBooks: ["Business Mathematics & Statistics - P. A. Navanitham"],
      staffIncharge: "Ms. G. Poongothai",
      subjectExpert: { name: "Dr. E. Prakash", designation: "Assistant Professor", institution: "Kongunadu Arts and Science College", details: "Coimbatore - 641 029" },
      hodName: "Dr. R. Sasikala"
    },
    {
      batchId: batch2._id,
      subjectName: "Non-Mathematics",
      departmentName: "Department of Mathematics",
      hours: 3,
      mathsStream: "NM",
      objectives: [
        "To introduce basic numerical skills and logical thinking tools.",
        "To build computational math foundations for non-mathematics students."
      ],
      units: [
        { unitNo: "Unit I", title: "Basic Arithmetic & Numbers", content: "Introduction to Number System and its Operations, BODMAS Rule, LCM, GCD, and HCF." },
        { unitNo: "Unit II", title: "Elementary Matrices", content: "Matrices: Definition, Types of Matrices, Operations including Addition and Subtraction of Matrices." }
      ],
      referenceBooks: ["Business Mathematics & Statistics - P. A. Navanitham"],
      staffIncharge: "Mr. S. Bharath",
      subjectExpert: { name: "Dr. E. Prakash", designation: "Assistant Professor", institution: "Kongunadu Arts and Science College", details: "Coimbatore - 641 029" },
      hodName: "Dr. R. Sasikala"
    }
  ]);

  // Seed Syllabus for Batch 3 (7.0) with exact data from PDF
  console.log("Seeding Batch 3 Syllabus from PDF...");
  await Syllabus.create([
    {
      batchId: batch3._id,
      subjectName: "English Non-Major",
      departmentName: "Department of English",
      hours: 3,
      mathsStream: "ALL",
      objectives: [
        "To develop creativity and idea generation skills.",
        "To improve communication and collaborative learning.",
        "To strengthen analytical and problem-solving skills."
      ],
      units: [
        { unitNo: "UNIT 1", title: "Interactive Communication", content: "Introducing Oneself and Extempore Speech." },
        { unitNo: "UNIT 2", title: "Writing Skills", content: "Future Trends in AI." },
        { unitNo: "UNIT 3", title: "Brainstorming", content: "Problem Solving." },
        { unitNo: "UNIT 4", title: "Grammar", content: "Introduction to Parts of Speech." },
        { unitNo: "UNIT 5", title: "Composition", content: "Covering letter and Bonafide." }
      ],
      referenceBooks: [
        "Parts of Speech: Basics of English Grammar by Kuldeep Yadav",
        "An AI-Powered writing assistant: Grammarly",
        "A Handbook for Letter Writing by S C Gupta"
      ],
      staffIncharge: "Dr. K. Valarmathi",
      subjectExpert: { name: "Dr. P. Sujatha", designation: "Assistant Professor", institution: "Kongunadu Arts & Science College", details: "Coimbatore-641 029" },
      hodName: "Dr. R. Sasikala"
    },
    {
      batchId: batch3._id,
      subjectName: "Fundamentals of Computing & C Programming Essentials",
      departmentName: "Department of CSDA",
      hours: 5,
      mathsStream: "ALL",
      objectives: [
        "To understand the basic concepts of computer systems including hardware components, memory, and operating systems.",
        "To gain knowledge of programming basics and the structure of the C programming language.",
        "To develop simple problem-solving skills using basic C programs with input and output functions."
      ],
      units: [
        { unitNo: "Unit 1", title: "Computer Basics", content: "Introduction - Anatomy of computers - I/O devices - Control Unit - Memory - Types of Operating System (2 Hours)." },
        { unitNo: "Unit 2", title: "Programming Basics & C Programming", content: "Introduction - C Libraries - Structure of C Program - Input and output functions - Primary Data Types - Sample programs (3 Hours)." }
      ],
      referenceBooks: [
        "E. Balagurusamy 'Programming in ANSI C' Widely used in Indian universities",
        "Brian W. Kernighan and Dennis M. Ritchie 'The C Programming Language'"
      ],
      staffIncharge: "S. Shanthi",
      subjectExpert: { name: "Kala Kannan", designation: "Subject Expert", institution: "Department of CSDA", details: "Coimbatore" },
      hodName: "Dr. R. Sasikala"
    },
    {
      batchId: batch3._id,
      subjectName: "Fundamentals of Operating Systems",
      departmentName: "Department of CSDA",
      hours: 2,
      mathsStream: "ALL",
      objectives: [
        "Understand the basic concepts, functions, and types of Operating Systems.",
        "Learn the services provided by Operating Systems and system call mechanisms.",
        "Understand process concepts, process life cycle, and process management.",
        "Study CPU scheduling algorithms, threads, and multithreading techniques.",
        "Gain knowledge of inter-process communication and efficient resource management."
      ],
      units: [
        { unitNo: "Unit 1", title: "Introduction to Operating Systems", content: "Definition and Functions of Operating System - Types of Operating Systems - Operating System Services - System Calls - Structure of Operating Systems (1 Hour)." },
        { unitNo: "Unit 2", title: "Process Management", content: "Process Concept - Process Scheduling - Threads and Multithreading - CPU Scheduling Algorithms - Inter-Process Communication (IPC) (1 Hour)." }
      ],
      referenceBooks: [
        "Silberschatz, A., Galvin, P. B., & Gagne, G. (2024). Operating System Concepts (11th Edition). Wiley. ISBN: 9781394262571.",
        "Tanenbaum, A. S., & Bos, H. (2023). Modern Operating Systems (5th Edition). Pearson Education. ISBN: 9780137618880."
      ],
      staffIncharge: "N. Gayathri",
      subjectExpert: { name: "Kala Kannan", designation: "Subject Expert", institution: "Department of CSDA", details: "Coimbatore" },
      hodName: "Dr. R. Sasikala"
    },
    {
      batchId: batch3._id,
      subjectName: "Artificial Intelligence Tools for Smart Learning",
      departmentName: "Department of CSDA",
      hours: 3,
      mathsStream: "ALL",
      objectives: [
        "Understand the benefits and applications of Artificial Intelligence (AI) in education and everyday life.",
        "Organize information efficiently by collecting and managing notes, documents, PDFs, websites, and other learning resources in a single platform.",
        "Understand the concept of prompts and use simple, clear, and direct language to communicate effectively with AI systems."
      ],
      units: [
        { unitNo: "Unit 1", title: "Introduction to AI", content: "Introduction to Artificial Intelligence (AI); using AI for learning, reading, writing, and problem-solving (1 Hour)." },
        { unitNo: "Unit 2", title: "Notebook LM", content: "Getting Started with NotebookLM for Students; Key Features and Educational Applications of NotebookLM (1 Hour)." },
        { unitNo: "Unit 3", title: "Prompt Engineering", content: "Introduction to Prompt Engineering; Principles of Writing Effective AI Prompts; Examples of Effective Prompt Design (1 Hour)." }
      ],
      referenceBooks: [
        "Russell, S., & Norvig, P. (2020). Artificial Intelligence: A Modern Approach (4th Edition). Pearson Education. ISBN: 9780134610993.",
        "Forte, T. (2022). Building a Second Brain. Simon & Schuster. ISBN: 9781982167387.",
        "Liu, P., Yuan, W., Fu, J., Jiang, Z., Hayashi, H., & Neubig, G. (2023). Pre-train, Prompt, and Predict: A Systematic Survey of Prompting Methods. ACM Computing Surveys, 57(9), Article 185."
      ],
      staffIncharge: "K. Keerthika",
      subjectExpert: { name: "Kala Kannan", designation: "Subject Expert", institution: "Department of CSDA", details: "Coimbatore" },
      hodName: "Dr. R. Sasikala"
    },
    {
      batchId: batch3._id,
      subjectName: "Data Analytics & Modern Data Visualization Platforms",
      departmentName: "Department of CSDA",
      hours: 2,
      mathsStream: "ALL",
      objectives: [
        "To understand the fundamentals of Data Analytics.",
        "To gain basic knowledge of Tableau, Power BI, and Google Charts.",
        "To understand the importance of data visualization in decision-making.",
        "To develop awareness of dashboard creation and web-based visualization tools."
      ],
      units: [
        { unitNo: "Unit 1", title: "Introduction to Data Analytics & Tableau", content: "Data Analytics workflow, Importance of visualization and Dashboard Basics (1 Hour)." },
        { unitNo: "Unit 2", title: "Power BI Basics & Google Charts", content: "Components of Power BI, Web-Based Visualization and Comparison of Tableau, Power BI, and Google Charts (1 Hour)." }
      ],
      referenceBooks: [
        "Wilke, C. O., Fundamentals of Data Visualization, O'Reilly Media, 2019.",
        "Knaflic, C. N., Storytelling with Data: A Data Visualization Guide for Business Professionals, Wiley, 2015."
      ],
      staffIncharge: "A. Swarnamugi",
      subjectExpert: { name: "Kala Kannan", designation: "Subject Expert", institution: "Department of CSDA", details: "Coimbatore" },
      hodName: "Dr. R. Sasikala"
    }
  ]);

  // Seeding Tamil unicode questions
  console.log("Seeding assessment questions...");
  await Question.create([
    {
      batchId: batch2._id,
      subject: "Tamil",
      mathsStream: "ALL",
      questionText: "தமிழ்மொழி செம்மொழி என்று அறிவிக்கப்பட்ட ஆண்டு எது?",
      optionA: "2004",
      optionB: "2005",
      optionC: "2006",
      optionD: "2008",
      correctAnswer: "A"
    },
    {
      batchId: batch2._id,
      subject: "Tamil",
      mathsStream: "ALL",
      questionText: "சங்கம் வைத்து தமிழ் வளர்த்தவர்கள் யார்?",
      optionA: "சேரர்",
      optionB: "சோழர்",
      optionC: "பாண்டியர்",
      optionD: "பல்லவர்",
      correctAnswer: "C"
    },
    {
      batchId: batch2._id,
      subject: "English",
      mathsStream: "ALL",
      questionText: "Which of the following is NOT typically included in a self-introduction?",
      optionA: "Name",
      optionB: "Hobbies",
      optionC: "Favorite food",
      optionD: "Educational background",
      correctAnswer: "C"
    },
    {
      batchId: batch2._id,
      subject: "Maths",
      mathsStream: "NM",
      questionText: "What does 'O' mean in the BODMAS rule?",
      optionA: "Of",
      optionB: "Order",
      optionC: "Odd",
      optionD: "Operation",
      correctAnswer: "B"
    },
    {
      batchId: batch2._id,
      subject: "Maths",
      mathsStream: "M",
      questionText: "A matrix with only one row is called ______.",
      optionA: "unit matrix",
      optionB: "column matrix",
      optionC: "row matrix",
      optionD: "identity matrix",
      correctAnswer: "C"
    }
  ]);

  // Seed Questions for Batch 3 (7.0) by duplicating Batch 2 questions
  console.log("Seeding Batch 3 Questions...");
  const b3Questions = await Question.find({ batchId: batch2._id });
  for (const q of b3Questions) {
    const qObj = q.toObject();
    delete qObj._id;
    qObj.batchId = batch3._id;
    await Question.create(qObj);
  }

  console.log("Seeding completed successfully!");
}

const isDirectRun = process.argv[1] && (process.argv[1].endsWith('seed.js') || process.argv[1].includes('seed'));

if (isDirectRun) {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/deeksharambh';
  console.log("Connecting to MongoDB at:", mongoUri);
  mongoose.connect(mongoUri)
    .then(() => seedDatabase())
    .then(() => {
      console.log("Database seeded successfully via CLI!");
      mongoose.connection.close();
    })
    .catch(err => {
      console.error("\n[MongoDB Connection Notice]");
      console.error("Could not connect to local MongoDB. Standalone CLI seeding skipped.");
      console.error("No worries! The main server application will automatically spin up an");
      console.error("in-memory database and seed it when you start the server via 'npm run dev'.\n");
      process.exit(0);
    });
}
