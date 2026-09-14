/**
 * Generates placeholder media at the correct aspect ratios, and the OG cards.
 *
 * Media placeholders exist so nothing 404s and so layout is correct before real
 * files land. Overwrite any of them with a real file of the same name and nothing
 * in the codebase changes — paths are declared once in src/config/assets.ts.
 *
 *   npm run assets           regenerate everything
 *   npm run assets -- --og   OG cards only
 *
 * Fonts: requires Archivo and JetBrains Mono installed for fontconfig. See
 * scripts/install-fonts.sh.
 */
import sharp from 'sharp';
import { mkdir, writeFile, access } from 'node:fs/promises';
import { dirname } from 'node:path';

const PAPER = '#edeeea';
const PAPER_DEEP = '#e2e3de';
const INK = '#16181a';
const INK_SOFT = '#5b6067';
const RULE = '#cbcdc6';
const MARK = '#22389e';

const SANS = 'Archivo SemiBold, DejaVu Sans, sans-serif';
const MONO = 'JetBrains Mono, DejaVu Sans Mono, monospace';

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function wrap(text, max) {
  const out = [];
  let line = '';
  for (const word of String(text).split(/\s+/)) {
    if ((line + ' ' + word).trim().length > max && line) {
      out.push(line);
      line = word;
    } else line = (line + ' ' + word).trim();
  }
  if (line) out.push(line);
  return out;
}

async function png(path, svg) {
  await mkdir(dirname(path), { recursive: true });
  await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(path);
  console.log('  ', path);
}

async function jpg(path, svg) {
  await mkdir(dirname(path), { recursive: true });
  await sharp(Buffer.from(svg)).jpeg({ quality: 82 }).toFile(path);
  console.log('  ', path);
}

/* ── media placeholders ─────────────────────────────────────────────── */

const placeholder = (w, h, label) => {
  // Strokes and type scale with the canvas, so the label stays readable when the
  // 1920px source is displayed at 400px.
  const sw = Math.max(2, Math.round(w / 600));
  const fs = Math.round(w / 45);
  const boxW = Math.min(w * 0.92, fs * label.length * 0.62 + fs * 2);
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <rect width="${w}" height="${h}" fill="${PAPER_DEEP}"/>
  <line x1="0" y1="0" x2="${w}" y2="${h}" stroke="${RULE}" stroke-width="${sw}"/>
  <line x1="${w}" y1="0" x2="0" y2="${h}" stroke="${RULE}" stroke-width="${sw}"/>
  <rect x="${sw / 2}" y="${sw / 2}" width="${w - sw}" height="${h - sw}" fill="none"
        stroke="${RULE}" stroke-width="${sw}"/>
  <rect x="${(w - boxW) / 2}" y="${h / 2 - fs}" width="${boxW}" height="${fs * 2}" fill="${PAPER_DEEP}"/>
  <text x="${w / 2}" y="${h / 2 + fs * 0.36}" font-family="${MONO}" font-size="${fs}"
        fill="${INK_SOFT}" text-anchor="middle">${esc(label)}</text>
</svg>`;
};

const media = [
  ['public/assets/portrait.jpg', 1000, 1250, 'portrait.jpg · 4:5', 'jpg'],
  ['public/assets/arc/shot-01.png', 1920, 1080, 'arc/shot-01.png · 16:9', 'png'],
  ['public/assets/arc/shot-02.png', 1920, 1080, 'arc/shot-02.png · 16:9', 'png'],
  ['public/assets/sentinelsai/shot-01.png', 1920, 1080, 'sentinelsai/shot-01.png · 16:9', 'png'],
  ['public/assets/sentinelsai/shot-02.png', 1920, 1080, 'sentinelsai/shot-02.png · 16:9', 'png'],
];

/* ── OG cards ───────────────────────────────────────────────────────── */

const W = 1200;
const H = 630;

function ogCard({ eyebrow, title, sub, foot }) {
  const titleLines = wrap(title, title.length > 26 ? 22 : 26);
  if (titleLines.length > 3) {
    throw new Error(
      `OG title too long for the card (${titleLines.length} lines): ${JSON.stringify(title)}`,
    );
  }
  const size = titleLines.length > 2 ? 78 : titleLines.length > 1 ? 92 : 104;
  const blockH = titleLines.length * size * 1.02;
  const top = 250 - blockH / 2 + size * 0.78;
  const subLines = sub ? wrap(sub, 62) : [];
  if (subLines.length > 2) {
    throw new Error(`OG subtitle too long: ${JSON.stringify(sub)}`);
  }

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="${PAPER}"/>
  <line x1="88" y1="0" x2="88" y2="${H}" stroke="${RULE}" stroke-width="1"/>
  <text x="128" y="96" font-family="${MONO}" font-size="24" fill="${INK_SOFT}">${esc(eyebrow)}</text>
  ${titleLines
    .map(
      (l, i) =>
        `<text x="124" y="${top + i * size * 1.02}" font-family="${SANS}" font-size="${size}" font-weight="600" letter-spacing="-3" fill="${INK}">${esc(l)}</text>`,
    )
    .join('\n  ')}
  <line x1="124" y1="452" x2="${W - 88}" y2="452" stroke="${RULE}" stroke-width="1"/>
  ${subLines
    .map(
      (l, i) =>
        `<text x="124" y="${496 + i * 32}" font-family="${SANS}" font-size="25" fill="${INK_SOFT}">${esc(l)}</text>`,
    )
    .join('\n  ')}
  <text x="124" y="${H - 54}" font-family="${MONO}" font-size="22" fill="${MARK}">${esc(foot)}</text>
</svg>`;
}

const cards = [
  [
    'public/assets/og/default.png',
    {
      eyebrow: 'software engineer · noida',
      title: 'Arihant Jain',
      sub: 'I build multi-agent AI systems, security tooling, and full-stack products.',
      foot: 'arihantjain.pages.dev',
    },
  ],
  [
    'public/assets/og/work.png',
    {
      eyebrow: 'arihant jain / work',
      title: 'Case studies',
      sub: 'Problem, architecture, the one hard decision, and the proof it works.',
      foot: 'arihantjain.pages.dev/work',
    },
  ],
  [
    'public/assets/og/about.png',
    {
      eyebrow: 'arihant jain / about',
      title: 'About',
      sub: 'The interesting question is never what a system enforces — it is where.',
      foot: 'arihantjain.pages.dev/about',
    },
  ],
  [
    'public/assets/og/arc.png',
    {
      eyebrow: 'arihant jain / work',
      title: 'ARC',
      sub: 'Fairness-first competition scoring, with anti-cheat enforced in Postgres.',
      foot: 'arihantjain.pages.dev/work/arc',
    },
  ],
  [
    'public/assets/og/sentinelsai.png',
    {
      eyebrow: 'arihant jain / work',
      title: 'SentinelsAI',
      sub: 'Passive security scanning, then a deterministic auto-fix pull request.',
      foot: 'arihantjain.pages.dev/work/sentinelsai',
    },
  ],
];

/* ── run ────────────────────────────────────────────────────────────── */

const onlyOg = process.argv.includes('--og');

if (!onlyOg) {
  console.log('media placeholders');
  for (const [path, w, h, label, kind] of media) {
    const svg = placeholder(w, h, label);
    await (kind === 'jpg' ? jpg(path, svg) : png(path, svg));
  }

  // Resume placeholder: a real, valid, one-page PDF so the link never dead-ends.
  const pdfPath = 'public/assets/resume.pdf';
  try {
    await access(pdfPath);
    console.log('   kept existing', pdfPath);
  } catch {
    const text = 'Arihant Jain - resume placeholder. Replace public/assets/resume.pdf.';
    const stream = `BT /F1 14 Tf 64 700 Td (${text}) Tj ET`;
    const objs = [
      '<< /Type /Catalog /Pages 2 0 R >>',
      '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
      '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>',
      `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
      '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    ];
    let pdf = '%PDF-1.4\n';
    const offsets = [];
    objs.forEach((o, i) => {
      offsets.push(pdf.length);
      pdf += `${i + 1} 0 obj\n${o}\nendobj\n`;
    });
    const xref = pdf.length;
    pdf += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n`;
    for (const off of offsets) pdf += `${String(off).padStart(10, '0')} 00000 n \n`;
    pdf += `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
    await mkdir(dirname(pdfPath), { recursive: true });
    await writeFile(pdfPath, pdf, 'latin1');
    console.log('  ', pdfPath);
  }
}

console.log('og cards');
for (const [path, spec] of cards) await png(path, ogCard(spec));
