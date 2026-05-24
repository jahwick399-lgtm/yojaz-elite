// Centralized map database — update map names and descriptions here.
// Codes removed: search maps by name in Fortnite Creative.
export const MAPS = [
  // ── AIM ──────────────────────────────────────────────────────────────────
  {
    category: 'aim',
    name: 'Skaavok Aim Trainer',
    difficulty: 'All',
    rating: 4.9,
    desc: 'The definitive Fortnite aim trainer. Covers tracking, flicks, and micro-adjustments.',
  },
  {
    category: 'aim',
    name: 'Raider464 Aim Training',
    difficulty: 'Intermediate',
    rating: 4.8,
    desc: 'Reactive targets with adjustable speed. Used by pro players for daily warm-up.',
  },
  {
    category: 'aim',
    name: 'Aimlabs Transfer — Fortnite',
    difficulty: 'Beginner',
    rating: 4.6,
    desc: 'Beginner-friendly aim drills that build crosshair placement fundamentals.',
  },

  // ── EDITING ──────────────────────────────────────────────────────────────
  {
    category: 'editing',
    name: 'The Edit Course by Cizzorz',
    difficulty: 'All',
    rating: 4.9,
    desc: 'The most used edit course in Fortnite. Covers every edit shape from basic to complex.',
  },
  {
    category: 'editing',
    name: 'Raider Edit Practice Course',
    difficulty: 'Intermediate',
    rating: 4.7,
    desc: 'Speed-focused edit drills with reset timing. Great for building edit muscle memory.',
  },
  {
    category: 'editing',
    name: 'Edit Aim Warmup+',
    difficulty: 'Advanced',
    rating: 4.8,
    desc: 'Combines fast edits with aim-then-shoot combos. Replicates real fight scenarios.',
  },
  {
    category: 'editing',
    name: 'Beginner Edit Master',
    difficulty: 'Beginner',
    rating: 4.5,
    desc: 'Learn all edit shapes from scratch with clear visual guides.',
  },

  // ── MECHANICS ────────────────────────────────────────────────────────────
  {
    category: 'mechanics',
    name: 'JHIB Mechanics Map',
    difficulty: 'All',
    rating: 4.9,
    desc: 'Covers ramp rushes, 90s, tunnelling, retakes, and box fighting in one map.',
  },
  {
    category: 'mechanics',
    name: 'Mongraal Classic',
    difficulty: 'Advanced',
    rating: 4.8,
    desc: "Mongraal's personal mechanics map. Elite-level speed and precision training.",
  },
  {
    category: 'mechanics',
    name: 'Build Fight Simulator',
    difficulty: 'Intermediate',
    rating: 4.6,
    desc: 'Realistic build fight scenarios for ingraining mechanical responses.',
  },

  // ── PIECE CONTROL ────────────────────────────────────────────────────────
  {
    category: 'piece_control',
    name: "Clix's Box Fight",
    difficulty: 'Intermediate',
    rating: 4.9,
    desc: "Clix's 1v1 piece control map. Ranked-style loot and real fight pressure.",
  },
  {
    category: 'piece_control',
    name: 'ZTL Warmup Island',
    difficulty: 'All',
    rating: 4.8,
    desc: 'Full piece control warm-up with aim, box fights, and open-build scenarios.',
  },
  {
    category: 'piece_control',
    name: 'Pro Box Fight Practice',
    difficulty: 'Advanced',
    rating: 4.7,
    desc: 'Advanced piece control drills. Trains reads, resets, and aggressive plays.',
  },

  // ── FIGHTING ─────────────────────────────────────────────────────────────
  {
    category: 'fighting',
    name: 'PK Unranked Duos',
    difficulty: 'All',
    rating: 4.8,
    desc: '1v1 ranked-style box fights with realistic loot pools and full mats.',
  },
  {
    category: 'fighting',
    name: 'Realistic 3v3v3v3',
    difficulty: 'Intermediate',
    rating: 4.7,
    desc: 'Team fights, endgames, and rotations — closest to real lobby feel.',
  },
  {
    category: 'fighting',
    name: 'Elim Deathmatch',
    difficulty: 'All',
    rating: 4.6,
    desc: 'High kill-count deathmatch to build fight IQ and mechanical speed.',
  },

  // ── RANKED ───────────────────────────────────────────────────────────────
  {
    category: 'ranked',
    name: 'Storm Zone Wars',
    difficulty: 'All',
    rating: 4.9,
    desc: 'Zone wars with real storm pressure. Master end-game rotations and decision-making.',
  },
  {
    category: 'ranked',
    name: 'Ranked Zone Wars',
    difficulty: 'Intermediate',
    rating: 4.8,
    desc: 'Simulates ranked lobby compositions. Best prep for competitive play.',
  },
  {
    category: 'ranked',
    name: 'Pro Scrims',
    difficulty: 'Advanced',
    rating: 4.9,
    desc: 'Competitive scrim environment with pro-style loot pools and game flow.',
  },

  // ── BUILDING ─────────────────────────────────────────────────────────────
  {
    category: 'building',
    name: 'Clix 1v1 Build Fights',
    difficulty: 'All',
    rating: 4.8,
    desc: '1v1 build fight practice covering 90s, box control, and wall replacements.',
  },
  {
    category: 'building',
    name: 'ULTIMATE Build Course',
    difficulty: 'Beginner',
    rating: 4.6,
    desc: 'Learn every build technique from scratch. Perfect for newer players.',
  },
  {
    category: 'building',
    name: 'High Ground Simulator',
    difficulty: 'Intermediate',
    rating: 4.7,
    desc: 'Dedicated height control drills — retakes, high-ground defense, and denial.',
  },
]

// Helper: get maps by category, optionally filtered by difficulty
export function getMapsByCategory(category, skill = null) {
  let maps = MAPS.filter(m => m.category === category)
  if (skill === 'beginner') maps = maps.filter(m => m.difficulty === 'All' || m.difficulty === 'Beginner')
  if (skill === 'advanced') maps = maps.filter(m => m.difficulty === 'All' || m.difficulty === 'Advanced' || m.difficulty === 'Intermediate')
  return maps.length ? maps : MAPS.filter(m => m.category === category)
}

// Helper: pick one map from a category (rotates by index for variety)
export function pickMap(category, skill, index = 0) {
  const pool = getMapsByCategory(category, skill)
  return pool[index % pool.length] || pool[0]
}
