const fs = require('fs');
const path = require('path');

const assetsDir = path.join(__dirname, '..', 'assets');
const outFile = path.join(__dirname, '..', 'data', 'projects.js');

const categories = {
  'food designs': {
    id: 'food',
    label: 'Food Design',
    expertise: 'Branding',
    description: 'Appétizing visuals for restaurants, cafés and culinary brands.',
  },
  'social media poster designs': {
    id: 'social',
    label: 'Social Media',
    expertise: 'UI Design',
    description: 'Scroll-stopping social media posters and ad creatives.',
  },
  'sports designs': {
    id: 'sports',
    label: 'Sports Design',
    expertise: 'Web Design',
    description: 'Dynamic sports graphics and athlete-focused campaigns.',
  },
  'thumbnail designs': {
    id: 'thumbnail',
    label: 'Thumbnails',
    expertise: 'Motion Design',
    description: 'High-CTR thumbnail and reel cover designs.',
  },
};

function cleanTitle(filename) {
  const name = filename.replace(/\.(jfif|jpg|jpeg|png|webp|gif)$/i, '');
  if (/^t[eéÉ]l[eéÉ]charger/i.test(name)) {
    const num = name.match(/\((\d+)\)/);
    return num ? `Creative Study ${num[1]}` : 'Creative Study';
  }
  if (/^untitled/i.test(name)) {
    const suffix = name.replace(/^untitled[-\s]*/i, '').trim();
    return suffix ? `Sports Campaign ${suffix}` : 'Sports Campaign';
  }
  if (/^simo$/i.test(name)) return 'SIMO — Sports Visual';
  if (/^jjkjjjj$/i.test(name)) return 'Sports Editorial';
  return name
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\s*-\s*Recovered$/i, '')
    .replace(/\s+copy$/i, '')
    .trim();
}

const raw = [];
for (const [folder, cat] of Object.entries(categories)) {
  const dir = path.join(assetsDir, folder);
  for (const file of fs.readdirSync(dir)) {
    if (/\.(jfif|jpg|jpeg|png|webp|gif)$/i.test(file)) {
      raw.push({ folder, file, ...cat });
    }
  }
}

const designer = {
  name: 'SEEMO',
  role: 'Visual Designer & Creative Director',
  tagline: 'Crafting visual stories that captivate, convert & inspire.',
  email: 'simovite7@gmail.com',
  phone: '+212 993 601 72',
  whatsapp: 'https://wa.me/21299360172',
  location: 'Morocco',
  bio: "I'm a passionate visual designer specializing in social media content, brand identity, and digital storytelling. With a keen eye for typography, color, and composition, I transform ideas into striking visuals that resonate across platforms — from food branding to sports campaigns and viral thumbnails.",
  social: {
    instagram: 'https://www.instagram.com/seemo_designer?igsh=cno4bDVkemUzbWZ6&utm_source=qr',
  },
};

const catList = [
  { id: 'all', label: 'All Work', slug: 'all' },
  ...Object.entries(categories).map(([slug, c]) => ({
    id: c.id,
    label: c.label,
    slug,
    expertise: c.expertise,
    description: c.description,
  })),
];

const projects = raw.map((asset, i) => {
  const title = cleanTitle(asset.file);
  return {
    id: `project-${i + 1}`,
    title,
    category: asset.id,
    categoryLabel: asset.label,
    expertise: asset.expertise,
    image: `assets/${asset.folder}/${asset.file}`,
    alt: `${title} — ${asset.label} by ${designer.name}`,
    description: `A ${asset.label.toLowerCase()} piece showcasing bold typography, strategic color use and platform-ready composition.`,
    year: '2024',
    tags: [asset.label, asset.expertise],
    size: i % 3 === 0 ? 'large' : i % 3 === 1 ? 'medium' : 'small',
  };
});

const heroTitles = ['Hamburgeria', 'boAt', 'Lewis Hamilton', 'High CTR'];
const heroImages = projects.filter((p) => heroTitles.some((t) => p.title.includes(t)));

const content = `/**
 * Portfolio data — auto-generated from /assets scan
 * Run: node scripts/generate-projects.js to regenerate
 */

const DESIGNER = ${JSON.stringify(designer, null, 2)};

const CATEGORIES = ${JSON.stringify(catList, null, 2)};

const RAW_ASSETS = ${JSON.stringify(
  raw.map((r) => ({ folder: r.folder, file: r.file, category: r.id })),
  null,
  2
)};

const PROJECTS = ${JSON.stringify(projects, null, 2)};

function getRelatedProjects(projectId, limit = 4) {
  const current = PROJECTS.find((p) => p.id === projectId);
  if (!current) return [];
  return PROJECTS.filter((p) => p.category === current.category && p.id !== projectId).slice(0, limit);
}

const HERO_IMAGES = ${JSON.stringify(heroImages, null, 2)};

const ABOUT_IMAGE = PROJECTS.find((p) => p.title.includes('Montassar')) || PROJECTS[0];

const EXPERTISE = [
  { id: 'branding', title: 'Branding', icon: '◈', description: 'Visual identities, logo systems and brand guidelines that define memorable presence across every touchpoint.', stat: '40+', statLabel: 'Brand Assets' },
  { id: 'ui', title: 'UI Design', icon: '◫', description: 'Interface layouts, component systems and pixel-perfect social templates built for clarity and conversion.', stat: '120+', statLabel: 'UI Screens' },
  { id: 'ux', title: 'UX Design', icon: '◎', description: 'User-centered flows, content hierarchy and visual storytelling that guides attention and drives action.', stat: '98%', statLabel: 'Client Satisfaction' },
  { id: 'web', title: 'Web Design', icon: '⬡', description: 'Responsive landing pages, campaign microsites and digital experiences with premium aesthetics.', stat: '30+', statLabel: 'Web Projects' },
  { id: 'motion', title: 'Motion Design', icon: '▶', description: 'Animated reels, thumbnail sequences and micro-interactions that bring static designs to life.', stat: '200+', statLabel: 'Motion Pieces' },
];

const PROCESS_STEPS = [
  { step: '01', title: 'Discovery', description: 'Understanding your brand, audience and goals through research, moodboards and creative brief alignment.' },
  { step: '02', title: 'Concept', description: 'Exploring visual directions, typography pairings and color systems to find the perfect creative angle.' },
  { step: '03', title: 'Design', description: 'Crafting polished visuals with meticulous attention to hierarchy, spacing and brand consistency.' },
  { step: '04', title: 'Refine', description: 'Iterating based on feedback, optimizing for platforms and ensuring every pixel serves the story.' },
  { step: '05', title: 'Deliver', description: 'Exporting production-ready assets with specs, guidelines and ongoing support for rollout.' },
];
`;

fs.writeFileSync(outFile, content, 'utf8');
console.log(`Generated ${projects.length} projects → data/projects.js`);
