import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, AlignmentType, BorderStyle, WidthType, HeightRule } from 'docx';

// Helper for letterhead
function createLetterhead() {
  return [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: "SANKARA COLLEGE OF SCIENCE AND COMMERCE (AUTONOMOUS)",
          bold: true,
          font: "Times New Roman",
          size: 28, // 14pt
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: "Affiliated to Bharathiar University, Coimbatore | Approved by AICTE, New Delhi",
          font: "Times New Roman",
          size: 18, // 9pt
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: "Re-Accredited by NAAC with A+ Grade (Cycle II) | An ISO 9001:2015 Certified Institution",
          font: "Times New Roman",
          size: 18,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: "Saravanampatty, Coimbatore, Tamilnadu | Pincode: 641035",
          font: "Times New Roman",
          size: 18,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: "E-Mail: info@sankara.ac.in | Web: www.sankara.ac.in",
          font: "Times New Roman",
          size: 18,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: "_________________________________________________________________________________",
          bold: true,
          size: 20,
        }),
      ],
    }),
    new Paragraph({ text: "" }), // spacing
  ];
}

// Helper for signatures
function createSignatureBlock(leftTitle, rightTitle) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.NONE },
      bottom: { style: BorderStyle.NONE },
      left: { style: BorderStyle.NONE },
      right: { style: BorderStyle.NONE },
      insideHorizontal: { style: BorderStyle.NONE },
      insideVertical: { style: BorderStyle.NONE },
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({ text: "" }),
              new Paragraph({ text: "" }),
              new Paragraph({
                children: [new TextRun({ text: leftTitle, bold: true, font: "Times New Roman", size: 24 })],
              }),
            ],
          }),
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({ text: "" }),
              new Paragraph({ text: "" }),
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [new TextRun({ text: rightTitle, bold: true, font: "Times New Roman", size: 24 })],
              }),
            ],
          }),
        ],
      }),
    ],
  });
}

// 1. Generate Circular
export async function generateCircular(batch) {
  const doc = new Document({
    sections: [
      {
        children: [
          ...createLetterhead(),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: `STUDENT INDUCTION PROGRAMME ${batch.academicYear}`,
                bold: true,
                font: "Times New Roman",
                size: 28,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: `Deeksharambh ${batch.deeksharambhVersion}`,
                bold: true,
                font: "Times New Roman",
                size: 24,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "DEPARTMENT OF CSDA",
                bold: true,
                font: "Times New Roman",
                size: 24,
              }),
            ],
          }),
          new Paragraph({ text: "" }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "CIRCULAR",
                bold: true,
                underline: {},
                font: "Times New Roman",
                size: 26,
              }),
            ],
          }),
          new Paragraph({ text: "" }),
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [
              new TextRun({
                text: `Date: ${batch.startDate}`,
                font: "Times New Roman",
                size: 24,
              }),
            ],
          }),
          new Paragraph({ text: "" }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFY,
            children: [
              new TextRun({
                text: `There will be a SIX DAY STUDENTS INDUCTION PROGRAMME of the department of Computer Science with Data Analytics for FIRST YEAR students. Students are requested to attend the programme for Six days (${batch.startDate} to ${batch.endDate}) without fail.`,
                font: "Times New Roman",
                size: 24,
              }),
            ],
          }),
          new Paragraph({ text: "" }),
          new Paragraph({ text: "" }),
          createSignatureBlock("Head of the Department", "Principal"),
        ],
      },
    ],
  });

  return Packer.toBuffer(doc);
}

// 2. Generate Cover brochure page
export async function generateCoverPage(batch) {
  const insights = batch.programmeInsights.map(insight => 
    new Paragraph({
      children: [new TextRun({ text: `• ${insight}`, font: "Times New Roman", size: 22 })]
    })
  );

  const doc = new Document({
    sections: [
      {
        children: [
          ...createLetterhead(),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: `DEEKSHARAMBH ${batch.deeksharambhVersion}`,
                bold: true,
                font: "Times New Roman",
                size: 36,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "FRESHMEN INDUCTION & SCHOOL TO COLLEGE TRANSITION PROGRAMME",
                bold: true,
                font: "Times New Roman",
                size: 20,
              }),
            ],
          }),
          new Paragraph({ text: "" }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "INDUCTION PROGRAMME INSIGHTS",
                bold: true,
                underline: {},
                font: "Times New Roman",
                size: 24,
              }),
            ],
          }),
          new Paragraph({ text: "" }),
          ...insights,
          new Paragraph({ text: "" }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: `Conducted Date Range: ${batch.startDate} to ${batch.endDate}`,
                bold: true,
                font: "Times New Roman",
                size: 24,
              }),
            ],
          }),
          new Paragraph({ text: "" }),
          createSignatureBlock(`Best Wishes From:\nManaging Trustee`, `\nPrincipal`),
        ],
      },
    ],
  });

  return Packer.toBuffer(doc);
}

// 3. Generate Schedule
export async function generateSchedule(batch, scheduleSlots, abbreviations) {
  // Format schedule table
  const tableHeaders = ["Day Order", "Date", "Period I", "Period II", "Period III", "Period IV", "Period V", "Period VI"];
  const headerRow = new TableRow({
    children: tableHeaders.map(text => new TableCell({
      children: [new Paragraph({ children: [new TextRun({ text, bold: true, font: "Times New Roman" })] })]
    }))
  });

  const slotsRows = scheduleSlots.map(slot => new TableRow({
    children: [
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: slot.dayOrder, font: "Times New Roman" })] })] }),
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: slot.date, font: "Times New Roman" })] })] }),
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: slot.periods.I || "", font: "Times New Roman" })] })] }),
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: slot.periods.II || "", font: "Times New Roman" })] })] }),
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: slot.periods.III || "", font: "Times New Roman" })] })] }),
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: slot.periods.IV || "", font: "Times New Roman" })] })] }),
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: slot.periods.V || "", font: "Times New Roman" })] })] }),
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: slot.periods.VI || "", font: "Times New Roman" })] })] }),
    ]
  }));

  const scheduleTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [headerRow, ...slotsRows]
  });

  // Legend table
  const legendHeader = new TableRow({
    children: [
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "S.No", bold: true, font: "Times New Roman" })] })] }),
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Abbreviation", bold: true, font: "Times New Roman" })] })] }),
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Particulars", bold: true, font: "Times New Roman" })] })] }),
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Faculty Name", bold: true, font: "Times New Roman" })] })] }),
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Hours", bold: true, font: "Times New Roman" })] })] }),
    ]
  });

  let totalHours = 0;
  const legendRows = abbreviations.map((ab, index) => {
    totalHours += ab.noOfHours;
    return new TableRow({
      children: [
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: String(ab.sNo || (index+1)), font: "Times New Roman" })] })] }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: ab.abbreviation, font: "Times New Roman" })] })] }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: ab.particulars, font: "Times New Roman" })] })] }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: ab.facultyName, font: "Times New Roman" })] })] }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: String(ab.noOfHours), font: "Times New Roman" })] })] }),
      ]
    });
  });

  const totalRow = new TableRow({
    children: [
      new TableCell({ columnSpan: 4, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "Total Hours", bold: true, font: "Times New Roman" })] })] }),
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: String(totalHours), bold: true, font: "Times New Roman" })] })] }),
    ]
  });

  const legendTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [legendHeader, ...legendRows, totalRow]
  });

  const doc = new Document({
    sections: [
      {
        children: [
          ...createLetterhead(),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: `STUDENT INDUCTION PROGRAMME ${batch.academicYear}`, bold: true, font: "Times New Roman", size: 24 })]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: `Deeksharambh ${batch.deeksharambhVersion}`, bold: true, font: "Times New Roman", size: 20 })]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: `Department of Computer Science with Data Analytics`, bold: true, font: "Times New Roman", size: 20 })]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: `Bridge Course Schedule - ${batch.batchYearRange}`, bold: true, font: "Times New Roman", size: 20 })]
          }),
          new Paragraph({ text: "" }),
          new Paragraph({ children: [new TextRun({ text: `Class: ${batch.className}`, bold: true, font: "Times New Roman" })] }),
          new Paragraph({ text: "" }),
          scheduleTable,
          new Paragraph({ text: "" }),
          new Paragraph({ children: [new TextRun({ text: "Abbreviation Legend & Faculty Assignment Table", bold: true, font: "Times New Roman", size: 22 })] }),
          new Paragraph({ text: "" }),
          legendTable,
          new Paragraph({ text: "" }),
          createSignatureBlock("Head of the Department", "Principal")
        ]
      }
    ]
  });

  return Packer.toBuffer(doc);
}

// 4. Generate Syllabus
export async function generateSyllabus(syllabus) {
  const objectivesText = syllabus.objectives.map(obj => 
    new Paragraph({ children: [new TextRun({ text: `• ${obj}`, font: "Times New Roman", size: 22 })] })
  );

  const unitsText = syllabus.units.flatMap(unit => [
    new Paragraph({
      children: [new TextRun({ text: `${unit.unitNo || ""}: ${unit.title || ""}`, bold: true, font: "Times New Roman", size: 22 })]
    }),
    new Paragraph({
      alignment: AlignmentType.JUSTIFY,
      children: [new TextRun({ text: unit.content || "", font: "Times New Roman", size: 22 })]
    }),
    new Paragraph({ text: "" })
  ]);

  const referencesText = syllabus.referenceBooks.map((ref, idx) => 
    new Paragraph({ children: [new TextRun({ text: `${idx+1}. ${ref}`, font: "Times New Roman", size: 22 })] })
  );

  const doc = new Document({
    sections: [
      {
        children: [
          ...createLetterhead(),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: "DEPARTMENT OF CSDA", bold: true, font: "Times New Roman", size: 24 })]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: "BRIDGE COURSE SYLLABUS", bold: true, font: "Times New Roman", size: 22 })]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: `Subject: ${syllabus.subjectName}`, bold: true, font: "Times New Roman", size: 20 })]
          }),
          new Paragraph({ text: "" }),
          new Paragraph({
            children: [
              new TextRun({ text: `Hours: ${syllabus.hours} | Stream: ${syllabus.mathsStream === 'ALL' ? 'General' : syllabus.mathsStream === 'M' ? 'Maths Stream' : 'Non-Maths Stream'}`, bold: true, font: "Times New Roman" })
            ]
          }),
          new Paragraph({ text: "" }),
          new Paragraph({ children: [new TextRun({ text: "OBJECTIVES:", bold: true, font: "Times New Roman", size: 22 })] }),
          ...objectivesText,
          new Paragraph({ text: "" }),
          new Paragraph({ children: [new TextRun({ text: "UNITS CONTENT:", bold: true, font: "Times New Roman", size: 22 })] }),
          new Paragraph({ text: "" }),
          ...unitsText,
          new Paragraph({ children: [new TextRun({ text: "REFERENCE BOOKS:", bold: true, font: "Times New Roman", size: 22 })] }),
          ...referencesText,
          new Paragraph({ text: "" }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.NONE },
              bottom: { style: BorderStyle.NONE },
              left: { style: BorderStyle.NONE },
              right: { style: BorderStyle.NONE },
              insideHorizontal: { style: BorderStyle.NONE },
              insideVertical: { style: BorderStyle.NONE },
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({ children: [new TextRun({ text: "Staff Incharge", bold: true, font: "Times New Roman", size: 20 })] }),
                      new Paragraph({ text: "" }),
                      new Paragraph({ children: [new TextRun({ text: syllabus.staffIncharge || "", font: "Times New Roman", size: 20 })] })
                    ]
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({ children: [new TextRun({ text: "Subject Expert", bold: true, font: "Times New Roman", size: 20 })] }),
                      new Paragraph({ text: "" }),
                      new Paragraph({ children: [new TextRun({ text: `${syllabus.subjectExpert.name || ""}\n${syllabus.subjectExpert.designation || ""}\n${syllabus.subjectExpert.institution || ""}`, font: "Times New Roman", size: 18 })] })
                    ]
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({ children: [new TextRun({ text: "HOD", bold: true, font: "Times New Roman", size: 20 })] }),
                      new Paragraph({ text: "" }),
                      new Paragraph({ children: [new TextRun({ text: syllabus.hodName || "", font: "Times New Roman", size: 20 })] })
                    ]
                  }),
                ]
              })
            ]
          })
        ]
      }
    ]
  });

  return Packer.toBuffer(doc);
}

// 5. Generate Student List
export async function generateStudentList(batch, students, type = "Full") {
  const header = new TableRow({
    children: [
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "S.No", bold: true, font: "Times New Roman" })] })] }),
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Student Name", bold: true, font: "Times New Roman" })] })] }),
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Maths Stream", bold: true, font: "Times New Roman" })] })] }),
    ]
  });

  const rows = students.map(st => new TableRow({
    children: [
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: String(st.sNo), font: "Times New Roman" })] })] }),
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: st.name, font: "Times New Roman" })] })] }),
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: st.mathsStream, font: "Times New Roman" })] })] }),
    ]
  }));

  const studentTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [header, ...rows]
  });

  const doc = new Document({
    sections: [
      {
        children: [
          ...createLetterhead(),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: `Bridge Course - Department of CSDA - ${type} Students`, bold: true, font: "Times New Roman", size: 24 })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: `Batch: ${batch.batchYearRange} | Class: ${batch.className}`, font: "Times New Roman", size: 20 })
            ]
          }),
          new Paragraph({ text: "" }),
          studentTable,
          new Paragraph({ text: "" }),
          createSignatureBlock("Tutor", "HOD")
        ]
      }
    ]
  });

  return Packer.toBuffer(doc);
}

// 6. Generate Attendance Sheet
export async function generateAttendanceSheet(batch, students, dates, attendanceMap) {
  // Map columns: S.No, Name, ...dates
  const headerCells = [
    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "S.No", bold: true, font: "Times New Roman" })] })] }),
    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Student Name", bold: true, font: "Times New Roman" })] })] }),
    ...dates.map(d => new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: d, bold: true, font: "Times New Roman" })] })] }))
  ];

  const headerRow = new TableRow({ children: headerCells });

  const rows = students.map(st => {
    const studentCells = [
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: String(st.sNo), font: "Times New Roman" })] })] }),
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: st.name, font: "Times New Roman" })] })] }),
      ...dates.map(date => {
        const key = `${st._id}_${date}`;
        const status = attendanceMap[key] || "P";
        return new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: status, font: "Times New Roman" })] })] });
      })
    ];
    return new TableRow({ children: studentCells });
  });

  const attendanceTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [headerRow, ...rows]
  });

  const doc = new Document({
    sections: [
      {
        children: [
          ...createLetterhead(),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: "BRIDGE COURSE ATTENDANCE", bold: true, font: "Times New Roman", size: 24 })
            ]
          }),
          new Paragraph({
            children: [
              new TextRun({ text: `Class: ${batch.className}`, bold: true, font: "Times New Roman" }),
              new TextRun({ text: `                                                            Batch: ${batch.batchYearRange}`, bold: true, font: "Times New Roman" }),
            ]
          }),
          new Paragraph({ text: "" }),
          attendanceTable,
          new Paragraph({ text: "" }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.NONE },
              bottom: { style: BorderStyle.NONE },
              left: { style: BorderStyle.NONE },
              right: { style: BorderStyle.NONE },
              insideHorizontal: { style: BorderStyle.NONE },
              insideVertical: { style: BorderStyle.NONE },
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Tutor", bold: true, font: "Times New Roman" })] })] }),
                  new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "HOD", bold: true, font: "Times New Roman" })] })] }),
                  new TableCell({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "Principal", bold: true, font: "Times New Roman" })] })] }),
                ]
              })
            ]
          })
        ]
      }
    ]
  });

  return Packer.toBuffer(doc);
}

// 7. Generate Result Analysis
export async function generateResultAnalysis(batch, results, rangeSummary) {
  const resultHeaders = ["S.No", "Name", "Tamil", "English", "Maths", "Core", "Total", "Percentage"];
  const headerRow = new TableRow({
    children: resultHeaders.map(text => new TableCell({
      children: [new Paragraph({ children: [new TextRun({ text, bold: true, font: "Times New Roman" })] })]
    }))
  });

  const dataRows = results.map(res => new TableRow({
    children: [
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: String(res.sNo), font: "Times New Roman" })] })] }),
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: res.name, font: "Times New Roman" })] })] }),
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: String(res.tamil), font: "Times New Roman" })] })] }),
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: String(res.english), font: "Times New Roman" })] })] }),
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: String(res.maths), font: "Times New Roman" })] })] }),
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: String(res.core), font: "Times New Roman" })] })] }),
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: String(res.total), font: "Times New Roman" })] })] }),
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: res.percentage === 'AB' ? 'AB' : `${res.percentage}%`, font: "Times New Roman" })] })] }),
    ]
  }));

  const resultTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [headerRow, ...dataRows]
  });

  // Range Table
  const rangeHeader = new TableRow({
    children: [
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Range", bold: true, font: "Times New Roman" })] })] }),
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "No. of Students", bold: true, font: "Times New Roman" })] })] }),
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Percentage", bold: true, font: "Times New Roman" })] })] }),
    ]
  });

  const rangeRows = rangeSummary.map(r => new TableRow({
    children: [
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: r.range, font: "Times New Roman" })] })] }),
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: String(r.count), font: "Times New Roman" })] })] }),
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `${r.percent}%`, font: "Times New Roman" })] })] }),
    ]
  }));

  const rangeTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [rangeHeader, ...rangeRows]
  });

  const doc = new Document({
    sections: [
      {
        children: [
          ...createLetterhead(),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: `BRIDGE COURSE RESULT ANALYSIS - BATCH ${batch.batchYearRange}`, bold: true, font: "Times New Roman", size: 24 })
            ]
          }),
          new Paragraph({ text: "" }),
          resultTable,
          new Paragraph({ text: "" }),
          new Paragraph({ children: [new TextRun({ text: "RESULT RANGE SUMMARY", bold: true, font: "Times New Roman", size: 22 })] }),
          new Paragraph({ text: "" }),
          rangeTable,
          new Paragraph({ text: "" }),
          new Paragraph({
            children: [
              new TextRun({ text: "THOSE WHO GOT 70 AND ABOVE ARE THE ADVANCED LEARNERS AND OTHERS ARE SLOW LEARNERS.", bold: true, font: "Times New Roman", size: 20 })
            ]
          }),
          new Paragraph({ text: "" }),
          createSignatureBlock("Tutor", "HOD / Principal")
        ]
      }
    ]
  });

  return Packer.toBuffer(doc);
}

// 8. Generate SIP Report
export async function generateSipReport(batch, reportText, objectives) {
  const defaultText = reportText || `The Student Induction Program for the newly admitted first-year students for the academic year ${batch.academicYear} was conducted from ${batch.startDate} to ${batch.endDate}. Eminent personalities from various fields were invited to address the students throughout the program.`;
  
  const objList = objectives.map(obj => 
    new Paragraph({ children: [new TextRun({ text: `• ${obj}`, font: "Times New Roman", size: 22 })] })
  );

  const doc = new Document({
    sections: [
      {
        children: [
          ...createLetterhead(),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: `STUDENT INDUCTION PROGRAMME ${batch.academicYear}`, bold: true, font: "Times New Roman", size: 24 })]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: `Deeksharambh ${batch.deeksharambhVersion}`, bold: true, font: "Times New Roman", size: 20 })]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: "Department of Computer Science with Data Analytics", bold: true, font: "Times New Roman", size: 20 })]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: `Student Induction Program (SIP) - Academic Year ${batch.academicYear}`, bold: true, font: "Times New Roman", size: 20 })]
          }),
          new Paragraph({ text: "" }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: "REPORT", bold: true, underline: {}, font: "Times New Roman", size: 22 })]
          }),
          new Paragraph({ text: "" }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFY,
            children: [new TextRun({ text: defaultText, font: "Times New Roman", size: 24 })]
          }),
          new Paragraph({ text: "" }),
          new Paragraph({ children: [new TextRun({ text: "Objectives of the SIP:", bold: true, font: "Times New Roman", size: 22 })] }),
          ...objList,
          new Paragraph({ text: "" }),
          createSignatureBlock("HOD", "Principal")
        ]
      }
    ]
  });

  return Packer.toBuffer(doc);
}

// 9. Generate Fleeting Views Photo Page
export async function generatePhotoPage(batch, photos) {
  const rows = [];
  // photos 2-column grid
  for (let i = 0; i < photos.length; i += 2) {
    const photo1 = photos[i];
    const photo2 = photos[i + 1];

    const cells = [
      new TableCell({
        width: { size: 50, type: WidthType.PERCENTAGE },
        children: [
          new Paragraph({
            children: [
              new TextRun({ text: `[PHOTO: ${photo1.caption || "Bridge Course Action"}]`, font: "Times New Roman", bold: true, size: 20 }),
            ]
          }),
          new Paragraph({
            children: [
              new TextRun({ text: `GPS Overlay Details:\n${photo1.gpsOverlayText || ""}`, font: "Times New Roman", italic: true, size: 18 }),
            ]
          })
        ]
      })
    ];

    if (photo2) {
      cells.push(
        new TableCell({
          width: { size: 50, type: WidthType.PERCENTAGE },
          children: [
            new Paragraph({
              children: [
                new TextRun({ text: `[PHOTO: ${photo2.caption || "Bridge Course Action"}]`, font: "Times New Roman", bold: true, size: 20 }),
              ]
            }),
            new Paragraph({
              children: [
                new TextRun({ text: `GPS Overlay Details:\n${photo2.gpsOverlayText || ""}`, font: "Times New Roman", italic: true, size: 18 }),
              ]
            })
          ]
        })
      );
    } else {
      cells.push(new TableCell({ width: { size: 50, type: WidthType.PERCENTAGE }, children: [] }));
    }

    rows.push(new TableRow({ children: cells }));
  }

  const photosTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: rows
  });

  const doc = new Document({
    sections: [
      {
        children: [
          ...createLetterhead(),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: "Department of Computer Science with Data Analytics", bold: true, font: "Times New Roman", size: 24 })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: "Fleeting Views of Bridge Courses", bold: true, font: "Times New Roman", size: 22 })
            ]
          }),
          new Paragraph({ text: "" }),
          photosTable,
          new Paragraph({ text: "" }),
          createSignatureBlock("HOD", "Principal")
        ]
      }
    ]
  });

  return Packer.toBuffer(doc);
}

export async function generateInvitationDocx(batch) {
  const trusteeName = batch.managingTrusteeName || "Dr. Sandhya Ramachandran";
  const doc = new Document({
    sections: [
      {
        children: [
          ...createLetterhead(),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "INVITATION",
                bold: true,
                font: "Times New Roman",
                size: 32,
                color: "1a237e"
              })
            ]
          }),
          new Paragraph({ text: "" }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "The Management, Principal & Faculty of the Department of Computer Science with Data Analytics cordially invite you to the Inaugural Function of the Student Induction Programme",
                font: "Times New Roman",
                size: 24,
                italics: true
              })
            ]
          }),
          new Paragraph({ text: "" }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: `Deeksharambh ${batch.deeksharambhVersion}`,
                bold: true,
                font: "Times New Roman",
                size: 36,
                color: "e65100"
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: `(Academic Year: ${batch.academicYear})`,
                bold: true,
                font: "Times New Roman",
                size: 22
              })
            ]
          }),
          new Paragraph({ text: "" }),
          new Paragraph({ text: "" }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "Dignitaries of the Function:",
                bold: true,
                underline: {},
                font: "Times New Roman",
                size: 26,
              })
            ]
          }),
          new Paragraph({ text: "" }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: "Presidential Address: ", bold: true, font: "Times New Roman", size: 24 }),
              new TextRun({ text: trusteeName, bold: true, font: "Times New Roman", size: 24, color: "1a237e" }),
              new TextRun({ text: " (Managing Trustee, SCSC)", font: "Times New Roman", size: 22 })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: "Felicitation Address: ", bold: true, font: "Times New Roman", size: 24 }),
              new TextRun({ text: batch.principalName, bold: true, font: "Times New Roman", size: 24, color: "1a237e" }),
              new TextRun({ text: " (Principal)", font: "Times New Roman", size: 22 })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: "Welcome Address: ", bold: true, font: "Times New Roman", size: 24 }),
              new TextRun({ text: batch.hodName, bold: true, font: "Times New Roman", size: 24, color: "1a237e" }),
              new TextRun({ text: " (Head of the Department)", font: "Times New Roman", size: 22 })
            ]
          }),
          new Paragraph({ text: "" }),
          new Paragraph({ text: "" }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: "Date: ", bold: true, font: "Times New Roman", size: 24 }),
              new TextRun({ text: batch.startDate, font: "Times New Roman", size: 24 }),
              new TextRun({ text: " | Time: ", bold: true, font: "Times New Roman", size: 24 }),
              new TextRun({ text: "10:00 AM", font: "Times New Roman", size: 24 }),
              new TextRun({ text: " | Venue: ", bold: true, font: "Times New Roman", size: 24 }),
              new TextRun({ text: "College Auditorium", font: "Times New Roman", size: 24 })
            ]
          }),
          new Paragraph({ text: "" }),
          new Paragraph({ text: "" }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "All first-year B.Sc. CSDA students are cordially requested to attend.",
                font: "Times New Roman",
                size: 20,
                bold: true,
                italics: true
              })
            ]
          })
        ]
      }
    ]
  });

  return Packer.toBuffer(doc);
}
