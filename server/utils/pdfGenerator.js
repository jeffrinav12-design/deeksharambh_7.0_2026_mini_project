import PDFDocument from 'pdfkit';

// Helper for letterhead
function drawLetterhead(doc) {
  doc.font('Times-Bold').fontSize(14).text("SANKARA COLLEGE OF SCIENCE AND COMMERCE (AUTONOMOUS)", { align: 'center' });
  doc.font('Times-Roman').fontSize(9)
     .text("Affiliated to Bharathiar University, Coimbatore | Approved by AICTE, New Delhi", { align: 'center' })
     .text("Re-Accredited by NAAC with A+ Grade (Cycle II) | An ISO 9001:2015 Certified Institution", { align: 'center' })
     .text("Saravanampatty, Coimbatore, Tamilnadu | Pincode: 641035", { align: 'center' })
     .text("E-Mail: info@sankara.ac.in | Web: www.sankara.ac.in", { align: 'center' });
  
  doc.moveDown(0.5);
  doc.moveTo(50, doc.y).lineTo(562, doc.y).strokeColor('#000').stroke();
  doc.moveDown(1);
}

function pdfToBuffer(doc) {
  return new Promise((resolve, reject) => {
    const buffers = [];
    doc.on('data', chunk => buffers.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', reject);
    doc.end();
  });
}

// 1. Generate Result Analysis PDF Buffer
export async function generateResultPdf(batch, results, rangeSummary) {
  const doc = new PDFDocument({ margin: 50 });

  drawLetterhead(doc);

  doc.font('Times-Bold').fontSize(12).text(`BRIDGE COURSE RESULT ANALYSIS - BATCH ${batch.batchYearRange}`, { align: 'center' });
  doc.moveDown(1);

  // Result Table Headers
  const tableTop = doc.y;
  doc.font('Times-Bold').fontSize(9);
  doc.text("S.No", 50, tableTop);
  doc.text("Name", 90, tableTop);
  doc.text("Tamil", 240, tableTop);
  doc.text("English", 290, tableTop);
  doc.text("Maths", 340, tableTop);
  doc.text("Core", 390, tableTop);
  doc.text("Total", 440, tableTop);
  doc.text("Percentage", 490, tableTop);

  doc.moveTo(50, tableTop + 12).lineTo(562, tableTop + 12).stroke();

  let currentY = tableTop + 18;
  doc.font('Times-Roman');
  results.forEach(res => {
    // Page break handling
    if (currentY > 700) {
      doc.addPage();
      drawLetterhead(doc);
      doc.font('Times-Bold').fontSize(9);
      doc.text("S.No", 50, doc.y);
      doc.text("Name", 90, doc.y);
      doc.text("Tamil", 240, doc.y);
      doc.text("English", 290, doc.y);
      doc.text("Maths", 340, doc.y);
      doc.text("Core", 390, doc.y);
      doc.text("Total", 440, doc.y);
      doc.text("Percentage", 490, doc.y);
      doc.moveTo(50, doc.y + 12).lineTo(562, doc.y + 12).stroke();
      currentY = doc.y + 18;
      doc.font('Times-Roman');
    }

    doc.text(String(res.sNo), 50, currentY);
    doc.text(res.name, 90, currentY, { width: 140, height: 12, ellipsis: true });
    doc.text(String(res.tamil), 240, currentY);
    doc.text(String(res.english), 290, currentY);
    doc.text(String(res.maths), 340, currentY);
    doc.text(String(res.core), 390, currentY);
    doc.text(String(res.total), 440, currentY);
    doc.text(res.percentage === 'AB' ? 'AB' : `${res.percentage}%`, 490, currentY);
    currentY += 16;
  });

  doc.moveDown(2);
  currentY = doc.y;

  if (currentY > 550) {
    doc.addPage();
    drawLetterhead(doc);
    currentY = doc.y;
  }

  doc.font('Times-Bold').fontSize(11).text("RESULT RANGE SUMMARY", 50, currentY);
  doc.moveDown(0.5);
  currentY = doc.y;

  doc.text("Range", 50, currentY);
  doc.text("No. of Students", 200, currentY);
  doc.text("Percentage", 350, currentY);
  doc.moveTo(50, currentY + 12).lineTo(562, currentY + 12).stroke();
  currentY += 18;

  doc.font('Times-Roman').fontSize(10);
  rangeSummary.forEach(r => {
    doc.text(r.range, 50, currentY);
    doc.text(String(r.count), 200, currentY);
    doc.text(`${r.percent}%`, 350, currentY);
    currentY += 16;
  });

  doc.moveDown(1.5);
  doc.font('Times-Bold').fontSize(10).text("THOSE WHO GOT 70 AND ABOVE ARE THE ADVANCED LEARNERS AND OTHERS ARE SLOW LEARNERS.", 50, doc.y);
  
  doc.moveDown(2);
  const sigY = doc.y;
  doc.text("Tutor Signature", 50, sigY);
  doc.text("HOD / Principal Signature", 400, sigY);

  return pdfToBuffer(doc);
}

// 2. Generate SIP Report PDF Buffer
export async function generateSipPdf(batch, reportText, objectives) {
  const doc = new PDFDocument({ margin: 50 });

  drawLetterhead(doc);

  doc.font('Times-Bold').fontSize(12)
     .text(`STUDENT INDUCTION PROGRAMME ${batch.academicYear}`, { align: 'center' })
     .text(`Deeksharambh ${batch.deeksharambhVersion}`, { align: 'center' })
     .text("Department of Computer Science with Data Analytics", { align: 'center' })
     .text(`Student Induction Program (SIP) - Academic Year ${batch.academicYear}`, { align: 'center' });
  
  doc.moveDown(1);
  doc.text("REPORT", { align: 'center', underline: true });
  doc.moveDown(1);

  const mainText = reportText || `The Student Induction Program for the newly admitted first-year students for the academic year ${batch.academicYear} was conducted from ${batch.startDate} to ${batch.endDate}. Eminent personalities from various fields were invited to address the students throughout the program.`;
  
  doc.font('Times-Roman').fontSize(11).text(mainText, { align: 'justify', lineGap: 4 });
  doc.moveDown(1.5);

  doc.font('Times-Bold').fontSize(11).text("Objectives of the SIP:", { underline: true });
  doc.moveDown(0.5);

  doc.font('Times-Roman').fontSize(10);
  (objectives || []).forEach(obj => {
    doc.text(`* ${obj}`, { indent: 20, lineGap: 3 });
  });

  doc.moveDown(3);
  const sigY = doc.y;
  doc.font('Times-Bold').fontSize(10);
  doc.text("Head of the Department", 50, sigY);
  doc.text("Principal", 450, sigY);

  return pdfToBuffer(doc);
}

// 3. Generate Invitation PDF Buffer
export async function generateInvitationPdf(batch) {
  const doc = new PDFDocument({ margin: 50 });

  // Draw double border around the card
  doc.rect(20, 20, 555, 802).lineWidth(3).strokeColor('#1a237e').stroke();
  doc.rect(24, 24, 547, 794).lineWidth(1).strokeColor('#e65100').stroke();

  drawLetterhead(doc);

  doc.moveDown(1);
  doc.font('Times-Bold').fontSize(16).fillColor('#1a237e').text("INVITATION", { align: 'center' });
  doc.moveDown(1.5);

  doc.font('Times-Italic').fontSize(11).fillColor('#333333').text(
    "The Management, Principal & Faculty of the Department of Computer Science with Data Analytics cordially invite you to the Inaugural Function of the Student Induction Programme",
    { align: 'center', lineGap: 4 }
  );

  doc.moveDown(1.5);
  doc.font('Times-Bold').fontSize(18).fillColor('#e65100').text(
    `Deeksharambh ${batch.deeksharambhVersion}`,
    { align: 'center' }
  );
  doc.font('Times-Bold').fontSize(11).fillColor('#333333').text(
    `(Academic Year: ${batch.academicYear})`,
    { align: 'center' }
  );

  doc.moveDown(2);
  doc.font('Times-Bold').fontSize(12).fillColor('#1a237e').text(
    "DIGNITARIES OF THE FUNCTION",
    { align: 'center', underline: true }
  );
  doc.moveDown(1);

  const trusteeName = batch.managingTrusteeName || "Dr. Sandhya Ramachandran";
  doc.font('Times-Bold').fontSize(11).fillColor('#333333');
  doc.text("Presidential Address: ", 100, doc.y, { continued: true });
  doc.font('Times-Bold').fillColor('#1a237e').text(trusteeName, { continued: true });
  doc.font('Times-Roman').fillColor('#333333').text(" (Managing Trustee, SCSC)");
  doc.moveDown(0.5);

  doc.font('Times-Bold').fontSize(11).fillColor('#333333');
  doc.text("Felicitation Address: ", 100, doc.y, { continued: true });
  doc.font('Times-Bold').fillColor('#1a237e').text(batch.principalName, { continued: true });
  doc.font('Times-Roman').fillColor('#333333').text(" (Principal)");
  doc.moveDown(0.5);

  doc.font('Times-Bold').fontSize(11).fillColor('#333333');
  doc.text("Welcome Address: ", 100, doc.y, { continued: true });
  doc.font('Times-Bold').fillColor('#1a237e').text(batch.hodName, { continued: true });
  doc.font('Times-Roman').fillColor('#333333').text(" (Head of the Department)");

  doc.moveDown(2.5);
  doc.font('Times-Bold').fontSize(11).fillColor('#e65100').text(
    `Date: ${batch.startDate}  |  Time: 10:00 AM  |  Venue: College Auditorium`,
    { align: 'center' }
  );

  doc.moveDown(2.5);
  doc.font('Times-BoldItalic').fontSize(10).fillColor('#333333').text(
    "All first-year B.Sc. CSDA students are cordially requested to attend.",
    { align: 'center' }
  );

  return pdfToBuffer(doc);
}
