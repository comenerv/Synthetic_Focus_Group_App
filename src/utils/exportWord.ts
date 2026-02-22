import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from "docx";
import { FocusGroupReport } from "../types";

export async function exportToWord(report: FocusGroupReport) {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            text: "Focus Group Insights Report",
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
          }),
          
          // Executive Summary
          new Paragraph({ text: "Executive Summary", heading: HeadingLevel.HEADING_1, spacing: { before: 400, after: 200 } }),
          new Paragraph({ text: report.executiveSummary }),

          // Evolution of Sentiment
          new Paragraph({ text: "Evolution of Sentiment", heading: HeadingLevel.HEADING_1, spacing: { before: 400, after: 200 } }),
          new Paragraph({ text: report.sentimentEvolution }),

          // Final Verdicts
          new Paragraph({ text: "Final Verdicts", heading: HeadingLevel.HEADING_1, spacing: { before: 400, after: 200 } }),
          new Paragraph({
            children: [
              new TextRun({ text: `Apply: ${report.verdicts.apply}`, break: 1 }),
              new TextRun({ text: `On the Fence: ${report.verdicts.fence}`, break: 1 }),
              new TextRun({ text: `Hard No: ${report.verdicts.reject}`, break: 1 }),
            ],
          }),

          // Feature Sentiments
          new Paragraph({ text: "Feature Sentiments", heading: HeadingLevel.HEADING_1, spacing: { before: 400, after: 200 } }),
          ...report.featureSentiments.map(
            (fs) =>
              new Paragraph({
                children: [
                  new TextRun({ text: `• ${fs.feature}: `, bold: true }),
                  new TextRun(`Positive (${fs.positive}), Neutral (${fs.neutral}), Negative (${fs.negative})`),
                ],
              })
          ),

          // Persona Breakdown
          new Paragraph({ text: "Persona Breakdown", heading: HeadingLevel.HEADING_1, spacing: { before: 400, after: 200 } }),
          ...report.personas.flatMap((p) => [
            new Paragraph({ text: `${p.name} - ${p.verdict}`, heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 100 } }),
            new Paragraph({
              children: [
                new TextRun({ text: "Occupation: ", bold: true }),
                new TextRun(p.occupation),
                new TextRun({ text: " | Location: ", bold: true }),
                new TextRun(p.location),
                new TextRun({ text: " | Income: ", bold: true }),
                new TextRun(p.income),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "Reason: ", bold: true }),
                new TextRun(p.reason),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "Quote: ", bold: true }),
                new TextRun({ text: `"${p.quote}"`, italics: true }),
              ],
              spacing: { after: 200 },
            }),
          ]),

          // Missed Opportunities
          new Paragraph({ text: "Missed Opportunities & Recommendations", heading: HeadingLevel.HEADING_1, spacing: { before: 400, after: 200 } }),
          ...report.missedOpportunities.map(
            (opp) =>
              new Paragraph({
                text: `• ${opp}`,
              })
          ),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "Focus_Group_Report.docx";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
