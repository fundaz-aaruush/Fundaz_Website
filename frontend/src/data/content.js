// ------- All content below is realistic PLACEHOLDER / MOCK data — replace freely -------

const u = (id, w = 900) =>
  `https://images.unsplash.com/${id}?q=80&w=${w}&auto=format&fit=crop`;

export const IMAGES = {
  quizStage: u("photo-1761618291331-535983ae4296", 1400),
  stageLights: u("photo-1583787035686-91b82ad5d811", 1400),
  mysteryRoom: u("photo-1695893155282-4f71c946da5a", 1200),
  escapeNeon: u("photo-1569002925653-ed18f55d7292", 1200),
  treasureMaps: u("photo-1473163928189-364b2c4e1135", 1200),
  skeletonKey: u("photo-1553991562-9f24b119ff51", 1200),
  crowd: u("photo-1585346230722-6b9df46d0d54", 1400),
  speakerStage: u("photo-1626125345510-4603468eedfb", 1400),
};

const greyPfp = "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%231a1b1e'/%3E%3Ccircle cx='50' cy='38' r='18' fill='%232a2d33'/%3E%3Cpath d='M20 100 A 30 30 0 0 1 80 100' fill='%232a2d33'/%3E%3C/svg%3E";

const P = {
  p1: greyPfp,
  p2: greyPfp,
  p3: greyPfp,
  p4: greyPfp,
  p5: greyPfp,
  p6: greyPfp,
  p7: greyPfp,
  p8: greyPfp,
  p9: greyPfp,
  p10: greyPfp,
};

// ---------------- F — FLAGSHIP ----------------
export const FLAGSHIP = {
  edition: "Main Quiz '25",
  theme: "The Paradox Protocol",
  date: "TBD – 13, 2025",
  venue: "Dr. T.P. Ganesan Auditorium, SRMIST",
  teamSize: "Teams of 2",
  prizePool: "₹75,000+",
  description:
    "The Main Quiz is where FUNDAZ began and where it peaks every year — a two-day battle of wit spanning science, mathematics, pop culture, and pure lateral madness. Hundreds of teams enter the prelims; six survive to the stage finale under the lights.",
  rounds: [
    {
      name: "Prelims — The Filter",
      detail: "40 questions of written mayhem. Speed matters, instinct matters more. Top 24 teams advance.",
    },
    {
      name: "Semis — The Gauntlet",
      detail: "Buzzer rounds, connect walls and audio-visual traps across four parallel stages.",
    },
    {
      name: "Finale — The Protocol",
      detail: "Six teams. One stage. Infinite pounce-and-bounce. The auditorium decides who owns the year.",
    },
  ],
  pastEditions: [
    { year: "2024", theme: "Uncharted Multiverse", note: "1,100+ participants — largest prelims in FUNDAZ history.", winner: "Team Heisenbug" },
    { year: "2023", theme: "Chronicles of Chance", note: "The finale famously ended on a tie-breaker pounce.", winner: "Occam's Lazers" },
    { year: "2022", theme: "The Infinity Gambit", note: "First hybrid edition — campus stage plus live stream.", winner: "Null Pointers" },
    { year: "2021", theme: "Genesis", note: "The all-online edition that kept the flame alive.", winner: "Quarks & Recreation" },
  ],
  registerUrl: "https://aaruush.org",
};

// ---------------- U — UNEARTHED ----------------
export const UNEARTHED = {
  intro:
    "FUNDAZ is the fun-and-logic domain of Aaruush, the national-level techno-management fest of SRM Institute of Science and Technology. Born as a single quiz table in a corridor, it grew into the domain that gamifies mathematics, science, logical reasoning and critical thinking for thousands of students every year.",
  body:
    "The philosophy has never changed: learning sticks when it feels like play. From campus-wide treasure hunts to scripted mystery rooms and the legendary Main Quiz, every FUNDAZ event is engineered to make you think sideways. What began with a handful of volunteers is now one of the most-awaited domains at Aaruush.",
  stats: [
    { value: "13+", label: "Editions" },
    { value: "5,000+", label: "Annual Footfall" },
    { value: "15+", label: "Events Every Year" },
    { value: "60+", label: "Volunteers & Crew" },
  ],
  organisers: [
    { name: "Avinav Panigrahi", role: "ORGANISER", years: "2026", photo: P.p6, note: "Scripted the first Mystery Room case and never told anyone the ending." },
    { name: "Abhijit Harsh", role: "ORGANISER", years: "2025", photo: P.p8, note: "Scaled the Main Quiz prelims past 500 teams for the first time." },
    { name: "Harsh Abhishek", role: "ORGANISER", years: "2024", photo: P.p2, note: "Took the whole domain online overnight during the Genesis edition." },
    { name: "Ananya Krishnan", role: "Domain Lead", years: "2021 – 2022", photo: P.p9, note: "Designed the campus-wide clue grid still used by Treasure Hunt today." },
    { name: "Arjun Mehta", role: "Quizmaster", years: "2022 – 2023", photo: P.p3, note: "Wrote 400+ original questions — not one leaked, ever." },
    { name: "Kavya Nair", role: "Domain Lead", years: "2023 – 2024", photo: P.p10, note: "Brought national-circuit quizzers and speakers to the FUNDAZ stage." },
  ],
};

// ---------------- N — NOW (current year events) ----------------
export const NOW_EVENTS = [
  {
    id: "main-quiz",
    name: "Main Quiz '25 — The Paradox Protocol",
    type: "Flagship",
    date: "To be Revealed",
    blurb: "The flagship. Three days, three rounds, one champion team. Registrations on the official Aaruush portal.",
    description: "FUNDAZ's crown jewel pits hundreds of teams through a gauntlet of written prelims, buzzer semis, and a finale on the main stage. Questions span science, mathematics, pop culture, history, and lateral thinking. The top six teams battle for ₹75K+ in prizes and the title of Quiz Champions. This year's theme — The Paradox Protocol — promises twists that break the rules.",
    action: "link",
    url: "https://aaruush.org",
  },
  {
    id: "treasure-hunt",
    name: "Treasure Hunt",
    type: "Activity",
    date: "To be Revealed",
    blurb: "A campus-wide chase across SRMIST — decode clues, sprint between landmarks, beat every other squad to the vault.",
    description: "Squads of four receive a sealed origin clue and race across the entire SRMIST campus — libraries, labs, canteens, and hidden corners — solving interlocking puzzles at 10+ checkpoints. Decoy clues punish lazy solving, and only the fastest squad reaches the final vault. It's equal parts brain and cardio, and the campus has never felt bigger.",
    action: "link",
    url: "https://aaruush.org",
  },
  {
    id: "mystery-room",
    name: "Mystery Room",
    type: "Activity",
    date: "To be Revealed",
    blurb: "Step into this year's original case. A room, a story, a countdown — solve it from the inside.",
    description: "A brand-new case is scripted from scratch every year — no plot is ever reused. Teams of 3–5 step into a fully staged room filled with evidence, props, and red herrings. You get 30 minutes, exactly one hint, and a story that only makes sense if you piece together every clue. The fastest correct solve of the day tops the leaderboard.",
    action: "link",
    url: "https://aaruush.org",
  },
  {
    id: "cryptic-conundrum",
    name: "Cryptic Conundrum",
    type: "Domain Event",
    date: "To be Revealed",
    blurb: "Cipher-breaking campaign — Caesar to steganography. A new round every day, one champion team.",
    description: "A three-day cipher-breaking campaign that walks teams through the history of secret writing. Day one is classical ciphers under the clock, day two hides messages inside images and audio (steganography), and the finale presents one unbroken custom cipher with no hints. Teams of two compete, and only clean logic and fast fingers survive.",
    action: "register",
  },
  {
    id: "fermi-files",
    name: "The Fermi Files",
    type: "Domain Event",
    date: "To be Revealed",
    blurb: "Estimation warfare across three days. How many piano tuners in Chennai? Defend your logic before the panel.",
    description: "Inspired by Enrico Fermi's legendary estimation puzzles. No internet, no calculators — just structured guessing and order-of-magnitude reasoning. Day one is a solo written round with 12 impossible questions. Day two puts qualified teams in front of a live panel to defend their reasoning. The finale is a monster multi-stage estimation built on stage.",
    action: "register",
  },
  {
    id: "paradox-arena",
    name: "Paradox Arena",
    type: "Domain Event",
    date: "To be Revealed",
    blurb: "Rapid-fire critical thinking showdown — daily eliminations until one mind is left standing on stage.",
    description: "Riddles, self-referencing puzzles, and lateral-thinking traps — answer in seconds or walk. Day one is open qualifiers with 90-second sudden-elimination rounds. Day two brings head-to-head brackets on stage where you can steal your opponent's question. The finale is a four-person paradox gauntlet where one wrong step ends everything.",
    action: "register",
  },
];

// ---------------- D — DOMAIN EVENTS ----------------
export const DOMAIN_EVENTS = {
  intro:
    "Every year FUNDAZ crafts three brand-new domain events — they exist for one edition only, then retire into legend. Each event runs across all three days of the fest, with every day being a different round.",
  current: [
    {
      id: "cryptic-conundrum",
      name: "Cryptic Conundrum",
      dates: "To be Revealed",
      image: "skeletonKey",
      description:
        "A cipher-breaking campaign through the history of secret writing. Teams of two survive three escalating rounds — Caesar shifts and Vigenère grids on day one, hidden-in-plain-sight steganography on day two, and an unbroken final cipher on day three.",
      rounds: [
        { day: "Day 1", date: "TBD", name: "Round 1 — Cipher Sprint", detail: "Eight sealed envelopes of classical ciphers against the clock. Top 16 teams advance.", image: u("photo-1553991562-9f24b119ff51", 800) },
        { day: "Day 2", date: "TBD", name: "Round 2 — The Stego Vault", detail: "Messages hidden inside images, audio and campus posters. Find them before your rivals do.", image: u("photo-1569002925653-ed18f55d7292", 800) },
        { day: "Day 3", date: "TBD", name: "Finale — The Unbreakable", detail: "One custom cipher, one hour, no hints. First correct plaintext takes the title.", image: u("photo-1695893155282-4f71c946da5a", 800) },
      ],
    },
    {
      id: "fermi-files",
      name: "The Fermi Files",
      dates: "To be Revealed",
      image: "treasureMaps",
      description:
        "Estimation warfare inspired by Enrico Fermi. No internet, no calculators — just structured guessing. Three days of building order-of-magnitude answers to absurd questions and defending the logic behind them.",
      rounds: [
        { day: "Day 1", date: "TBD", name: "Round 1 — Cold Estimates", detail: "Solo written round: 12 impossible questions, scored on the power of ten you land in.", image: u("photo-1473163928189-364b2c4e1135", 800) },
        { day: "Day 2", date: "TBD", name: "Round 2 — Panel Defence", detail: "Qualified teams defend their reasoning live before a panel that loves poking holes.", image: u("photo-1626125345510-4603468eedfb", 800) },
        { day: "Day 3", date: "TBD", name: "Finale — The Final File", detail: "One monster estimation built in stages on stage. Cleanest chain of logic wins.", image: u("photo-1761618291331-535983ae4296", 800) },
      ],
    },
    {
      id: "paradox-arena",
      name: "Paradox Arena",
      dates: "To be Revealed",
      image: "stageLights",
      description:
        "The rapid-fire critical thinking showdown. Riddles, self-referencing puzzles and lateral-thinking traps — answer in seconds or take the walk. Three days of eliminations until one mind is left standing.",
      rounds: [
        { day: "Day 1", date: "TBD", name: "Round 1 — Lightning Riddles", detail: "Open qualifiers: 90 seconds per riddle, sudden elimination on two misses.", image: u("photo-1583787035686-91b82ad5d811", 800) },
        { day: "Day 2", date: "TBD", name: "Round 2 — The Knockouts", detail: "Head-to-head brackets on stage. Steal your opponent's question, steal their spot.", image: u("photo-1585346230722-6b9df46d0d54", 800) },
        { day: "Day 3", date: "TBD", name: "Finale — Sudden Death", detail: "The last four face the paradox gauntlet. One wrong step ends the run.", image: u("photo-1542190891-2093d38760f2", 800) },
      ],
    },
  ],
  past: [
    { year: "2024", events: ["Sherlocked — deduction relay", "MindSweeper — logic-grid marathon", "Decode X — binary scavenger sprint"] },
    { year: "2023", events: ["Logic Loop — recursive puzzle chain", "Enigma Nights — after-dark cipher hunt", "QuizWit — 60-second face-offs"] },
    { year: "2022", events: ["Puzzle Vault — combination-lock rooms", "Brain Blitz — mental-math knockout", "Cipher Storm — team cryptanalysis"] },
  ],
};

// ---------------- A — ARENA (core activities) ----------------
export const ARENA = {
  intro:
    "Two activities are the beating heart of FUNDAZ. They return every single year — same soul, brand-new story. Everything else orbits around them.",
  activities: [
    {
      id: "treasure-hunt",
      name: "Treasure Hunt",
      image: "treasureMaps",
      accentImage: "skeletonKey",
      tag: "Campus-wide · Teams of 4",
      site: "#", // placeholder — swap with the Treasure Hunt microsite link
      description:
        "The whole of SRMIST becomes the board. Squads decode a chain of interlocking clues that send them sprinting between libraries, labs, canteens and landmarks — every solved clue reveals the next location, and only one squad reaches the final vault first.",
      how: [
        "Each squad receives a sealed origin clue at the starting grid",
        "Clues chain across 10+ campus checkpoints with physical tokens",
        "Decoys and false trails punish sloppy solving",
        "First squad to open the vault claims the hunt",
      ],
      years: [
        { year: "2024", theme: "The Cartographer's Debt — clues hidden inside campus maps" },
        { year: "2023", theme: "Signal Lost — radio-frequency checkpoint hunt" },
        { year: "2022", theme: "Inheritance — a fictional founder's scattered will" },
      ],
    },
    {
      id: "mystery-room",
      name: "Mystery Room",
      image: "mysteryRoom",
      accentImage: "escapeNeon",
      tag: "Immersive · Teams of 3–5",
      site: "#", // placeholder — swap with the Mystery Room microsite link
      description:
        "You are handed a case, then the door closes behind you. Inside is a fully staged scene — evidence, props, red herrings and a story written from scratch for this year only. Piece the narrative together and crack the case before the timer runs out. No two editions have ever shared a plot.",
      how: [
        "A brand-new original case is scripted every year",
        "The room is a staged scene — everything can be evidence",
        "Teams get 30 minutes and exactly one hint",
        "Fastest correct solve of the day tops the board",
      ],
      years: [
        { year: "2024", theme: "The Last Lecture — a professor vanishes mid-semester" },
        { year: "2023", theme: "Checkmate at Midnight — a chess club with a secret" },
        { year: "2022", theme: "The Curator's Alibi — a heist inside a mock museum" },
      ],
    },
  ],
};

// ---------------- Page extras (editorial bands & timelines) ----------------
export const FLAGSHIP_STATS = [
  { value: "1,100+", label: "Participants '24" },
  { value: "550", label: "Teams at Prelims" },
  { value: "400+", label: "Original Questions" },
  { value: "6", label: "Finale Stage Slots" },
  { value: "₹75K+", label: "Prize Pool" },
];

export const UNEARTHED_ERAS = [
  { year: "2013", title: "The Corridor Quiz", text: "A single quiz table outside the physics block. Forty students showed up. The domain was born by accident." },
  { year: "2016", title: "The First Mystery Room", text: "One classroom, one scripted case, one very confused security guard. The format never left." },
  { year: "2019", title: "The Campus Goes Live", text: "Treasure Hunt scaled to the full SRMIST campus with a clue grid still in use today." },
  { year: "2021", title: "Genesis — Fully Online", text: "Lockdown edition. Ciphers over Discord, quizzes over stream — the flame stayed lit." },
  { year: "2024", title: "The Record Year", text: "Largest prelims in FUNDAZ history and a footfall past five thousand." },
];

export const NOW_GLANCE = [
  { day: "Day 1", date: "TBD", headline: "Ignition", note: "Prelims, Treasure Hunt flag-off and Round 1 of every domain event." },
  { day: "Day 2", date: "TBD", headline: "Escalation", note: "Main Quiz semis, Mystery Room slots all day, Round 2s everywhere." },
  { day: "Day 3", date: "TBD", headline: "Zenith", note: "Finales across the board — the auditorium decides who owns the year." },
];

export const ARENA_STATS = [
  { value: "120+", label: "Clues Planted Yearly" },
  { value: "10+", label: "Campus Checkpoints" },
  { value: "12", label: "Original Cases Written" },
  { value: "30 min", label: "On the Mystery Clock" },
  { value: "1", label: "Hint. Ever." },
];
export const ZENITH = {
  intro:
    "Over the years the FUNDAZ stage has hosted quizmasters, scientists, storytellers and champions. The Zenith wall remembers them.",
  guests: [
    { name: "Robin Singh", tag: "Astrophysicist & Science Communicator", year: "2008", photo: P.p1, quote: "A crowd that heckles you with better answers — I've never had more fun on stage." },
    { name: "Chetan Bhagat", tag: "National Quiz Circuit Champion", year: "2010", photo: "/images/chetan-bhagat.png", quote: "The Main Quiz finale here is as sharp as anything on the national circuit." },
    { name: "Rajat Kapoor", tag: "Puzzle Designer, Escape Labs", year: "2014", photo: "/images/rajat-kapoor.png", quote: "Their Mystery Room writing team could work in the industry tomorrow." },
    { name: "General Dr. VK Singh", tag: "Mathematician & Author", year: "2017", photo: P.p7, quote: "FUNDAZ proves the fastest way to teach math is to hide it inside a game." },
    { name: "T K Padmanabham", tag: "QuizMaster", year: "2025", photo: "/images/tk-padmanabham.png", quote: "FUNDAZ proves the fastest way to teach math is to hide it inside a game." },
  ],
};
