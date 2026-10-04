const fs = require('fs');
const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, ShadingType, BorderStyle, HeadingLevel, AlignmentType } = require('docx');

const NAVY = '011835', GREEN = '1C8C80', GREY = '5A6B85';
const scenes = [
  ['Scene 1: Global data', '0:00–0:09', 'A dotted world map lights up region by region.', [
    ['Label', '01 · SEARCH THE WORLD'],
    ['Headline', 'The largest database of contextualized real-world data'],
    ['Subline', 'Patient, protocol, trial, country and investigator site feasibility insights from every region, in one platform.'],
    ['Map labels', 'NORTH AMERICA · LATIN AMERICA · EUROPE · MIDDLE EAST & AFRICA · ASIA-PACIFIC'],
  ]],
  ['Scene 2: Real-time data', '0:09–0:17', 'A scan line sweeps the map and matching patients light up in green.', [
    ['Label', 'PRECISE PATIENT DATA IN REAL-TIME'],
    ['Headline', 'Every data point analyzed'],
    ['Subline', 'Phesi’s platform matches global data against your exact patient profile, instantly'],
    ['Panel title', 'PHESI AI · LIVE'],
    ['Panel item', 'Global patient data'],
  ]],
  ['Scene 3: Key opinion leaders', '0:17–0:25', 'Ten expert hubs appear on the map, linked to nearby matching patients.', [
    ['Label', 'TARGET THE RIGHT EXPERTS'],
    ['Headline', 'Key opinion leaders, relevant to your protocol'],
    ['Subline', 'Find the investigators and sites with access to the right patient populations.'],
    ['Map labels', 'KOL · Boston, Houston, São Paulo, London, Istanbul, Johannesburg, Mumbai, Shanghai, Tokyo, Sydney'],
  ]],
  ['Scene 4: Outcome and benefits', '0:25–0:31', 'Three statement lines, then three benefit cards.', [
    ['Line 1', 'The right patients.'],
    ['Line 2', 'The right experts.'],
    ['Line 3', 'Anywhere in the world.'],
    ['Card 1', 'PRECISION — Exact patient profiles — From protocol to the patients who truly fit it.'],
    ['Card 2', 'SCALE — Largest global data source — Every region, one platform.'],
    ['Card 3', 'SPEED — Precise patient data in real-time — Dynamic data insights'],
  ]],
  ['Scene 5: End card', '0:31–0:35', 'Phesi logo in white, with the call-to-action button in Bright Mint.', [
    ['Logo', 'PHESI — Smarter trials. Faster cures.'],
    ['Product name', 'Trial Accelerator™'],
    ['Tagline', 'Find the right patients, faster.'],
    ['Call to action', 'www.phesi.com'],
  ]],
];

const font = 'Arial';
const border = { style: BorderStyle.SINGLE, size: 4, color: 'D5DCE6' };
const borders = { top: border, bottom: border, left: border, right: border };
const W1 = 2200, W2 = 6826; // A4 text width 9026 DXA

const cell = (text, width, opts = {}) => new TableCell({
  borders, width: { size: width, type: WidthType.DXA },
  shading: opts.fill ? { type: ShadingType.CLEAR, color: 'auto', fill: opts.fill } : undefined,
  margins: { top: 90, bottom: 90, left: 140, right: 140 },
  children: [new Paragraph({ children: [new TextRun({ text, font, size: 20, bold: !!opts.bold, color: opts.color || '1F2937' })] })],
});

const children = [
  new Paragraph({ heading: HeadingLevel.TITLE, spacing: { after: 80 }, children: [new TextRun({ text: 'Phesi Trial Accelerator™', font, size: 44, bold: true, color: NAVY })] }),
  new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: 'Video script: final on-screen text', font, size: 28, color: GREEN })] }),
  new Paragraph({ spacing: { after: 360 }, border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: GREEN, space: 8 } },
    children: [new TextRun({ text: '35.5 seconds · 1920×1080 · no voiceover or audio · US spelling', font, size: 20, color: GREY })] }),
];

for (const [title, time, note, rows] of scenes) {
  children.push(new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { before: 240, after: 60 },
    children: [new TextRun({ text: title, font, size: 28, bold: true, color: NAVY }), new TextRun({ text: '   ' + time, font, size: 22, color: GREEN })] }));
  children.push(new Paragraph({ spacing: { after: 120 }, children: [new TextRun({ text: note, font, size: 20, italics: true, color: GREY })] }));
  children.push(new Table({
    width: { size: W1 + W2, type: WidthType.DXA }, columnWidths: [W1, W2],
    rows: [
      new TableRow({ tableHeader: true, children: [cell('Element', W1, { bold: true, fill: NAVY, color: 'FFFFFF' }), cell('On-screen text', W2, { bold: true, fill: NAVY, color: 'FFFFFF' })] }),
      ...rows.map(([k, v]) => new TableRow({ children: [cell(k, W1, { bold: true, color: NAVY, fill: 'F1F5F9' }), cell(v, W2)] })),
    ],
  }));
}

children.push(new Paragraph({ spacing: { before: 360 }, children: [new TextRun({ text: 'Brand: Phesi Navy #011835 (background) · Phesi Green #1C8C80 (highlights) · Bright Mint #34FFE0 (call to action) · Font: Inter', font, size: 18, color: GREY })] }));

const doc = new Document({
  styles: { default: { document: { run: { font, size: 20 } } } },
  sections: [{ properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 } } }, children }],
});
Packer.toBuffer(doc).then(b => { fs.writeFileSync('Phesi-Trial-Accelerator-video-script.docx', b); console.log('ok'); });
