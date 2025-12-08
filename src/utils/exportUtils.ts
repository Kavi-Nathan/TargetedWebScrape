import jsPDF from 'jspdf';
import { saveAs } from 'file-saver';
import { Scrape, AnalysisPoint } from '../types/scrape';

export const formatAnalysisText = (points: AnalysisPoint[]): string => {
  if (points.length === 0) return 'No analysis available';

  return points.map((point, index) => {
    let text = `${index + 1}. ${point.point}\n`;
    if (point.references && point.references.length > 0) {
      text += '\n   Reference Sources:\n';
      point.references.forEach((ref, refIndex) => {
        text += `   ${refIndex + 1}. ${ref.title}\n      ${ref.url}\n`;
      });
    }
    return text;
  }).join('\n\n');
};

export const exportToTXT = (scrape: Scrape, originPoints: AnalysisPoint[], trendsPoints: AnalysisPoint[]) => {
  let content = `${scrape.title || 'Untitled'}\n`;
  content += `${scrape.url}\n`;
  content += `Keyword: ${scrape.keyword}\n`;
  content += `\n${'='.repeat(80)}\n\n`;

  if (scrape.url_summary) {
    content += `SOURCE SUMMARY\n`;
    content += `${'-'.repeat(80)}\n`;
    content += `${scrape.url_summary}\n\n`;
    content += `${'='.repeat(80)}\n\n`;
  }

  content += `VERIFIED ORIGIN / MOMENT OF TRUTH\n`;
  content += `${'-'.repeat(80)}\n`;
  content += `${formatAnalysisText(originPoints)}\n\n`;
  content += `${'='.repeat(80)}\n\n`;

  content += `LATEST UPDATES & FUTURE FORECAST\n`;
  content += `${'-'.repeat(80)}\n`;
  content += `${formatAnalysisText(trendsPoints)}\n`;

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  saveAs(blob, `${scrape.keyword || 'scrape'}_analysis.txt`);
};

export const exportToJSON = (scrape: Scrape, originPoints: AnalysisPoint[], trendsPoints: AnalysisPoint[]) => {
  const data = {
    title: scrape.title,
    url: scrape.url,
    keyword: scrape.keyword,
    created_at: scrape.created_at,
    completed_at: scrape.completed_at,
    url_summary: scrape.url_summary,
    origin_analysis: originPoints,
    trends_analysis: trendsPoints,
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8' });
  saveAs(blob, `${scrape.keyword || 'scrape'}_analysis.json`);
};

export const exportToDOC = (scrape: Scrape, originPoints: AnalysisPoint[], trendsPoints: AnalysisPoint[]) => {
  let htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${scrape.title || 'Analysis Report'}</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; margin: 40px; }
    h1 { color: #1a202c; border-bottom: 3px solid #3182ce; padding-bottom: 10px; }
    h2 { color: #2d3748; margin-top: 30px; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; }
    .meta { color: #718096; margin-bottom: 20px; }
    .point { margin: 20px 0; padding: 15px; background: #f7fafc; border-left: 4px solid #3182ce; }
    .references { margin-top: 10px; padding-left: 20px; }
    .reference { color: #2b6cb0; margin: 5px 0; }
    .url { color: #718096; font-size: 0.9em; word-break: break-all; }
  </style>
</head>
<body>
  <h1>${scrape.title || 'Untitled'}</h1>
  <div class="meta">
    <p><strong>URL:</strong> <span class="url">${scrape.url}</span></p>
    <p><strong>Keyword:</strong> ${scrape.keyword}</p>
    <p><strong>Date:</strong> ${new Date(scrape.created_at).toLocaleString()}</p>
  </div>
`;

  if (scrape.url_summary) {
    htmlContent += `
  <h2>Source Summary</h2>
  <p>${scrape.url_summary}</p>
`;
  }

  htmlContent += `
  <h2>Verified Origin / Moment of Truth</h2>
`;
  originPoints.forEach((point, index) => {
    htmlContent += `
  <div class="point">
    <p><strong>${index + 1}.</strong> ${point.point}</p>`;
    if (point.references && point.references.length > 0) {
      htmlContent += `
    <div class="references">
      <p><strong>Reference Sources:</strong></p>`;
      point.references.forEach(ref => {
        htmlContent += `
      <div class="reference">
        <p>${ref.title}</p>
        <p class="url">${ref.url}</p>
      </div>`;
      });
      htmlContent += `
    </div>`;
    }
    htmlContent += `
  </div>`;
  });

  htmlContent += `
  <h2>Latest Updates & Future Forecast</h2>
`;
  trendsPoints.forEach((point, index) => {
    htmlContent += `
  <div class="point">
    <p><strong>${index + 1}.</strong> ${point.point}</p>`;
    if (point.references && point.references.length > 0) {
      htmlContent += `
    <div class="references">
      <p><strong>Reference Sources:</strong></p>`;
      point.references.forEach(ref => {
        htmlContent += `
      <div class="reference">
        <p>${ref.title}</p>
        <p class="url">${ref.url}</p>
      </div>`;
      });
      htmlContent += `
    </div>`;
    }
    htmlContent += `
  </div>`;
  });

  htmlContent += `
</body>
</html>`;

  const blob = new Blob([htmlContent], { type: 'application/msword;charset=utf-8' });
  saveAs(blob, `${scrape.keyword || 'scrape'}_analysis.doc`);
};

export const exportToPDF = (scrape: Scrape, originPoints: AnalysisPoint[], trendsPoints: AnalysisPoint[]) => {
  const doc = new jsPDF();
  const margin = 15;
  const pageWidth = doc.internal.pageSize.getWidth();
  const maxWidth = pageWidth - (margin * 2);
  let yPosition = margin;

  const addText = (text: string, fontSize: number = 10, isBold: boolean = false, color: [number, number, number] = [0, 0, 0]) => {
    doc.setFontSize(fontSize);
    doc.setTextColor(color[0], color[1], color[2]);
    const style = isBold ? 'bold' : 'normal';
    doc.setFont('helvetica', style);

    const lines = doc.splitTextToSize(text, maxWidth);
    lines.forEach((line: string) => {
      if (yPosition > 280) {
        doc.addPage();
        yPosition = margin;
      }
      doc.text(line, margin, yPosition);
      yPosition += fontSize * 0.5;
    });
    yPosition += 3;
  };

  addText(scrape.title || 'Untitled', 18, true, [26, 32, 44]);
  yPosition += 5;
  addText(`URL: ${scrape.url}`, 9, false, [113, 128, 150]);
  addText(`Keyword: ${scrape.keyword}`, 9, false, [113, 128, 150]);
  addText(`Date: ${new Date(scrape.created_at).toLocaleString()}`, 9, false, [113, 128, 150]);
  yPosition += 5;

  if (scrape.url_summary) {
    addText('Source Summary', 14, true, [22, 101, 52]);
    yPosition += 2;
    addText(scrape.url_summary, 10);
    yPosition += 5;
  }

  addText('Verified Origin / Moment of Truth', 14, true, [180, 83, 9]);
  yPosition += 2;
  originPoints.forEach((point, index) => {
    addText(`${index + 1}. ${point.point}`, 10, false, [26, 32, 44]);
    if (point.references && point.references.length > 0) {
      addText('Reference Sources:', 9, true, [113, 128, 150]);
      point.references.forEach((ref, refIndex) => {
        addText(`   ${refIndex + 1}. ${ref.title}`, 8, false, [43, 108, 176]);
        addText(`      ${ref.url}`, 7, false, [113, 128, 150]);
      });
    }
    yPosition += 3;
  });

  yPosition += 5;
  addText('Latest Updates & Future Forecast', 14, true, [37, 99, 235]);
  yPosition += 2;
  trendsPoints.forEach((point, index) => {
    addText(`${index + 1}. ${point.point}`, 10, false, [26, 32, 44]);
    if (point.references && point.references.length > 0) {
      addText('Reference Sources:', 9, true, [113, 128, 150]);
      point.references.forEach((ref, refIndex) => {
        addText(`   ${refIndex + 1}. ${ref.title}`, 8, false, [43, 108, 176]);
        addText(`      ${ref.url}`, 7, false, [113, 128, 150]);
      });
    }
    yPosition += 3;
  });

  doc.save(`${scrape.keyword || 'scrape'}_analysis.pdf`);
};
