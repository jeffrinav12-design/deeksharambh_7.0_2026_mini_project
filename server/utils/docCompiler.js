import PDFDocument from 'pdfkit';
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, BorderStyle, AlignmentType } from 'docx';

// Helper for letterhead in PDF
function drawLetterhead(doc) {
  doc.font('Times-Bold').fontSize(14).text("SANKARA COLLEGE OF SCIENCE AND COMMERCE (Autonomous)", { align: 'center' });
  doc.font('Times-Roman').fontSize(9)
     .text("Affiliated to Bharathiar University, Coimbatore | Approved by AICTE, New Delhi", { align: 'center' })
     .text("Re-Accredited by NAAC with A+ Grade (Cycle II) | An ISO 9001:2015 Certified Institution", { align: 'center' })
     .text("Saravanampatty, Coimbatore, Tamilnadu | Pincode: 641035", { align: 'center' })
     .text("E-Mail: info@sankara.ac.in | Web: www.sankara.ac.in", { align: 'center' });
  
  doc.moveDown(0.5);
  doc.moveTo(50, doc.y).lineTo(562, doc.y).strokeColor('#1a237e').strokeWidth(1.5).stroke();
  doc.moveDown(1);
}

// Helper for extracting and parsing parameters
function extractDocParameters(fieldValues) {
  let content = "";
  let fontFamily = "Times New Roman";
  let fontSize = "12";
  let alignment = "justify";
  const metadata = {};

  for (const [key, value] of Object.entries(fieldValues || {})) {
    const lowercaseKey = key.toLowerCase();
    if (lowercaseKey === 'content' || lowercaseKey === 'body' || lowercaseKey === 'text' || lowercaseKey === 'reporttext' || lowercaseKey === 'description') {
      content = value;
    } else if (lowercaseKey === 'fontfamily' || lowercaseKey === 'font') {
      fontFamily = value || "Times New Roman";
    } else if (lowercaseKey === 'fontsize' || lowercaseKey === 'size') {
      fontSize = value || "12";
    } else if (lowercaseKey === 'alignment' || lowercaseKey === 'align') {
      alignment = value || "justify";
    } else {
      metadata[key] = value;
    }
  }

  return { content, fontFamily, fontSize, alignment, metadata };
}

// Compile PDF using pdfkit
export function compilePdf(templateName, fieldValues) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        resolve(Buffer.concat(buffers));
      });

      drawLetterhead(doc);

      const { content, fontFamily, fontSize, alignment, metadata } = extractDocParameters(fieldValues);

      if (content) {
        // Document Title
        doc.font('Times-Bold').fontSize(14).text(templateName.toUpperCase(), { align: 'center' });
        doc.moveDown(1);

        // Render Metadata block
        if (Object.keys(metadata).length > 0) {
          doc.font('Times-Bold').fontSize(10).text("DOCUMENT METADATA", 50, doc.y);
          doc.moveDown(0.3);
          
          let metaY = doc.y;
          for (const [key, value] of Object.entries(metadata)) {
            if (metaY > 700) {
              doc.addPage();
              drawLetterhead(doc);
              metaY = doc.y;
            }
            const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
            doc.font('Times-Bold').fontSize(9).text(`${label}: `, 60, metaY, { continued: true });
            doc.font('Times-Roman').fontSize(9).text(String(value || '-'));
            metaY = doc.y + 2;
          }
          doc.moveDown(1.5);
        }

        // Map fonts
        let pdfFont = 'Times-Roman';
        let pdfFontBold = 'Times-Bold';
        const fontLower = fontFamily.toLowerCase();
        if (fontLower.includes('arial') || fontLower.includes('calibri') || fontLower.includes('sans')) {
          pdfFont = 'Helvetica';
          pdfFontBold = 'Helvetica-Bold';
        } else if (fontLower.includes('courier')) {
          pdfFont = 'Courier';
          pdfFontBold = 'Courier-Bold';
        }

        // Render main content
        doc.font(pdfFont).fontSize(parseInt(fontSize) || 12);
        const paragraphs = content.split('\n');
        for (const p of paragraphs) {
          if (doc.y > 680) {
            doc.addPage();
            drawLetterhead(doc);
            doc.font(pdfFont).fontSize(parseInt(fontSize) || 12);
          }
          if (p.trim().length > 0) {
            doc.text(p, { align: alignment.toLowerCase() || 'justify', paragraphGap: 10 });
          } else {
            doc.moveDown(0.5);
          }
        }

        // Signatures
        doc.moveDown(2);
        if (doc.y > 650) {
          doc.addPage();
          drawLetterhead(doc);
        }
        const sigY = doc.y;
        doc.font('Times-Bold').fontSize(10).text("Staff In-charge", 60, sigY);
        doc.text("HOD / Principal", 420, sigY);
      } else {
        // Fallback: Default Metadata Table rendering
        doc.font('Times-Bold').fontSize(14).text(templateName.toUpperCase(), { align: 'center' });
        doc.moveDown(1.5);

        doc.font('Times-Bold').fontSize(11).text("DOCUMENT METADATA & PARAMETERS", 50, doc.y);
        doc.moveDown(0.5);

        const tableTop = doc.y;
        doc.fontSize(10);
        
        doc.font('Times-Bold');
        doc.text("Field Name", 60, tableTop);
        doc.text("Value", 220, tableTop);
        doc.moveTo(50, tableTop + 14).lineTo(562, tableTop + 14).strokeColor('#cbd5e1').strokeWidth(1).stroke();
        
        let currentY = tableTop + 22;
        doc.font('Times-Roman');

        for (const [key, value] of Object.entries(fieldValues)) {
          if (currentY > 680) {
            doc.addPage();
            drawLetterhead(doc);
            doc.font('Times-Bold').fontSize(10);
            doc.text("Field Name", 60, doc.y);
            doc.text("Value", 220, doc.y);
            doc.moveTo(50, doc.y + 14).lineTo(562, doc.y + 14).stroke();
            currentY = doc.y + 22;
            doc.font('Times-Roman');
          }

          const label = key
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase());

          doc.font('Times-Bold').text(label, 60, currentY);
          doc.font('Times-Roman').text(String(value || '-'), 220, currentY, { width: 320 });
          
          const textHeight = doc.heightOfString(String(value || '-'), { width: 320 });
          const rowHeight = Math.max(textHeight, 14) + 8;
          
          doc.moveTo(50, currentY + rowHeight - 4).lineTo(562, currentY + rowHeight - 4).strokeColor('#f1f5f9').stroke();
          currentY += rowHeight;
        }

        doc.moveDown(3);
        if (doc.y > 650) {
          doc.addPage();
          drawLetterhead(doc);
        }
        const sigY = doc.y;
        doc.font('Times-Bold').fontSize(10).text("Staff In-charge", 60, sigY);
        doc.text("HOD / Principal", 420, sigY);
      }

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

// Compile DOCX using docx
export function compileDocx(templateName, fieldValues) {
  return new Promise((resolve, reject) => {
    try {
      const { content, fontFamily, fontSize, alignment, metadata } = extractDocParameters(fieldValues);

      if (content) {
        // Build Metadata Table Rows for the mini metadata table
        const metaTableRows = [];
        for (const [key, value] of Object.entries(metadata)) {
          const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
          metaTableRows.push(
            new TableRow({
              children: [
                new TableCell({
                  width: { size: 30, type: WidthType.PERCENTAGE },
                  children: [new Paragraph({ children: [new TextRun({ text: label, bold: true, font: "Times New Roman", size: 18 })] })],
                  backgroundColor: "f8fafc"
                }),
                new TableCell({
                  width: { size: 70, type: WidthType.PERCENTAGE },
                  children: [new Paragraph({ children: [new TextRun({ text: String(value || '-'), font: "Times New Roman", size: 18 })] })]
                })
              ]
            })
          );
        }

        // Map alignment
        let docAlign = AlignmentType.JUSTIFY;
        const alignLower = alignment.toLowerCase();
        if (alignLower === 'left') docAlign = AlignmentType.LEFT;
        else if (alignLower === 'center') docAlign = AlignmentType.CENTER;
        else if (alignLower === 'right') docAlign = AlignmentType.RIGHT;

        const bodyParagraphs = content.split('\n').map(pText => {
          return new Paragraph({
            alignment: docAlign,
            spacing: { after: 120 },
            children: [
              new TextRun({
                text: pText,
                font: fontFamily,
                size: (parseInt(fontSize) || 12) * 2
              })
            ]
          });
        });

        const docChildren = [
          // Letterhead
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: "SANKARA COLLEGE OF SCIENCE AND COMMERCE", bold: true, size: 28, color: "1a237e" }),
              new TextRun({ text: "\n(Autonomous)", bold: true, size: 20, color: "1a237e" })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: "Affiliated to Bharathiar University, Coimbatore | Approved by AICTE, New Delhi\n", size: 16 }),
              new TextRun({ text: "Re-Accredited by NAAC with A+ Grade | An ISO 9001:2015 Certified Institution\n", size: 16 }),
              new TextRun({ text: "Saravanampatty, Coimbatore, Tamilnadu - 641035", size: 16 })
            ]
          }),
          new Paragraph({ children: [new TextRun({ text: "__________________________________________________________________________", color: "1a237e" })] }),
          new Paragraph({ text: "\n" }),
          
          // Document Title
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: templateName.toUpperCase(), bold: true, size: 24, underline: {} })
            ]
          }),
          new Paragraph({ text: "\n" })
        ];

        // Add metadata table if it has items
        if (metaTableRows.length > 0) {
          docChildren.push(
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: metaTableRows
            })
          );
          docChildren.push(new Paragraph({ text: "\n" }));
        }

        // Add body paragraphs
        docChildren.push(...bodyParagraphs);
        docChildren.push(new Paragraph({ text: "\n\n" }));

        // Add signatures
        docChildren.push(
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.NONE },
              bottom: { style: BorderStyle.NONE },
              left: { style: BorderStyle.NONE },
              right: { style: BorderStyle.NONE },
              insideHorizontal: { style: BorderStyle.NONE },
              insideVertical: { style: BorderStyle.NONE }
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: "Staff In-charge", bold: true, size: 20 })] })]
                  }),
                  new TableCell({
                    children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "HOD / Principal", bold: true, size: 20 })] })]
                  })
                ]
              })
            ]
          })
        );

        const doc = new Document({
          sections: [{
            children: docChildren
          }]
        });

        Packer.toBuffer(doc).then(resolve).catch(reject);
      } else {
        // Fallback: Default Metadata Table rendering
        const tableRows = [
          new TableRow({
            children: [
              new TableCell({
                width: { size: 30, type: WidthType.PERCENTAGE },
                children: [new Paragraph({ children: [new TextRun({ text: "Field Name", bold: true, size: 20 })] })],
                backgroundColor: "f1f5f9"
              }),
              new TableCell({
                width: { size: 70, type: WidthType.PERCENTAGE },
                children: [new Paragraph({ children: [new TextRun({ text: "Value", bold: true, size: 20 })] })],
                backgroundColor: "f1f5f9"
              })
            ]
          })
        ];

        for (const [key, value] of Object.entries(fieldValues)) {
          const label = key
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase());

          tableRows.push(
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph({ children: [new TextRun({ text: label, bold: true, size: 18 })] })]
                }),
                new TableCell({
                  children: [new Paragraph({ children: [new TextRun({ text: String(value || '-'), size: 18 })] })]
                })
              ]
            })
          );
        }

        const doc = new Document({
          sections: [
            {
              properties: {},
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({ text: "SANKARA COLLEGE OF SCIENCE AND COMMERCE", bold: true, size: 28, color: "1a237e" }),
                    new TextRun({ text: "\n(Autonomous)", bold: true, size: 20, color: "1a237e" })
                  ]
                }),
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({ text: "Affiliated to Bharathiar University, Coimbatore | Approved by AICTE, New Delhi\n", size: 16 }),
                    new TextRun({ text: "Re-Accredited by NAAC with A+ Grade | An ISO 9001:2015 Certified Institution\n", size: 16 }),
                    new TextRun({ text: "Saravanampatty, Coimbatore, Tamilnadu - 641035", size: 16 })
                  ]
                }),
                new Paragraph({ children: [new TextRun({ text: "__________________________________________________________________________", color: "1a237e" })] }),
                new Paragraph({ text: "\n" }),
                
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({ text: templateName.toUpperCase(), bold: true, size: 24, underline: {} })
                  ]
                }),
                new Paragraph({ text: "\n" }),

                new Table({
                  width: { size: 100, type: WidthType.PERCENTAGE },
                  rows: tableRows
                }),
                new Paragraph({ text: "\n\n\n\n" }),

                new Table({
                  width: { size: 100, type: WidthType.PERCENTAGE },
                  borders: {
                    top: { style: BorderStyle.NONE },
                    bottom: { style: BorderStyle.NONE },
                    left: { style: BorderStyle.NONE },
                    right: { style: BorderStyle.NONE },
                    insideHorizontal: { style: BorderStyle.NONE },
                    insideVertical: { style: BorderStyle.NONE }
                  },
                  rows: [
                    new TableRow({
                      children: [
                        new TableCell({
                          children: [new Paragraph({ children: [new TextRun({ text: "Staff In-charge", bold: true, size: 20 })] })]
                        }),
                        new TableCell({
                          children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "HOD / Principal", bold: true, size: 20 })] })]
                        })
                      ]
                    })
                  ]
                })
              ]
            }
          ]
        });

        Packer.toBuffer(doc).then(resolve).catch(reject);
      }
    } catch (err) {
      reject(err);
    }
  });
}
