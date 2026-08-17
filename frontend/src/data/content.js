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
  audiCar: u("photo-1618843479313-40f8afb4b4d8", 1400),
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
  edition: "Main Quiz '26",
  theme: "The Paradox Protocol",
  date: "TBD – 13, 2026",
  venue: "SRMIST",
  teamSize: "To Be Revealed",
  prizePool: "To Be Disclosed",
  description:
    "The Main Quiz is where FUNDAZ peaks every year — a Three-day battle of wit spanning science, mathematics, pop culture, and pure lateral madness. Hundreds of teams enter the prelims; five to six teams survive to the stage finale under the lights.",
  rounds: [
    {
      name: "Round 1 — Zero Hours",
      detail: "Teams find hidden topics in a fast-paced crossword hunt and race against dual timers in a survival sprint where correct answers add time.",
    },
    {
      name: "Round 2 — Decrypted",
      detail: "Teams decode questions through sequential multi-sensory clues (visual, audio, cryptic text) and tackle high-speed simultaneous clue bonus rounds.",
    },
    {
      name: "Round 3 — Wavelength",
      detail: "Finalists battle through strategic twists involving mystery scoring envelopes, tactical hit-and-shield sabotages, and a high-stakes showdown with confidence wagering and opponent-set constraints.",
    },
  ],
  pastEditions: [
    { year: "2024" },
    { year: "2023", organiser: "Abhinay P" },
    { year: "2022", organiser: "Aditi Shah" },
    { year: "2021" },
  ],
  registerUrl: "https://aaruush.org",
};

// ---------------- U — UNEARTHED ----------------
export const UNEARTHED = {
  intro:
    "FUNDAZ is the fun-and-logic domain of Aaruush, the national-level techno-management fest of SRM Institute of Science and Technology. Born as a single quiz table in a corridor, it grew into the domain that gamifies mathematics, science, logical reasoning and critical thinking for thousands of students every year.",
  body:
    "The philosophy has never changed: learning sticks when it feels like play. From campus-wide treasure hunts to scripted mystery rooms and the legendary Main Quiz, every FUNDAZ event is engineered to make you think sideways. What began with a handful of members is now one of the most-awaited domains at Aaruush.",
  stats: [
    { value: "13+", label: "Editions" },
    { value: "5,000+", label: "Annual Footfall" },
    { value: "15+", label: "Events Every Year" },
    { value: "60+", label: "Team & Crew" },
  ],
  organisers: [
    { name: "Avinav Panigrahi", role: "ORGANISER", years: "2026", photo: P.p6, note: "Scripted the first Mystery Room case and never told anyone the ending." },
    { name: "Abhijit Harsh", role: "ORGANISER", years: "2025", photo: P.p8, note: "Scaled the Main Quiz prelims past 500 teams for the first time." },
    { name: "Harsh Abhishek", role: "ORGANISER", years: "2024", photo: P.p2, note: "Took the whole domain online overnight during the Genesis edition." },
    { name: "Ananya Krishnan", role: "Domain Lead", years: "2021 – 2022", photo: P.p9, note: "Designed the campus-wide clue grid still used by Treasure Hunt today." },
    { name: "Abhinay P", role: "ORGANISER", years: "2023", photo: P.p3, note: "Wrote 400+ original questions — not one leaked, ever." },
    { name: "Aditi Shah", role: "ORGANISER", years: "2022", photo: P.p10, note: "Brought national-circuit quizzers and speakers to the FUNDAZ stage." },
  ],
};

// ---------------- N — NOW (current year events) ----------------
export const NOW_EVENTS = [
  {
    id: "main-quiz",
    name: "Main Quiz '26 — The Paradox Protocol",
    type: "Flagship",
    date: "To Be Revealed",
    blurb: "The flagship. Three days, three rounds, one champion team. Registrations on the official Aaruush portal.",
    description: "FUNDAZ's crown jewel pits hundreds of teams through a gauntlet of written prelims, buzzer semis, and a finale on the main stage. Questions span science, mathematics, pop culture, history, and lateral thinking. The top six teams battle for ₹75K+ in prizes and the title of Quiz Champions. This year's theme — The Paradox Protocol — promises twists that break the rules.",
    action: "link",
    url: "https://aaruush.org",
  },
  {
    id: "treasure-hunt",
    name: "Treasure Hunt",
    type: "Activity",
    date: "To Be Revealed",
    blurb: "A campus-wide chase across SRMIST — decode clues, sprint between landmarks, beat every other squad to the vault.",
    description: "Squads of four receive a sealed origin clue and race across the entire SRMIST campus — libraries, labs, canteens, and hidden corners — solving interlocking puzzles at 10+ checkpoints. Decoy clues punish lazy solving, and only the fastest squad reaches the final vault. It's equal parts brain and cardio, and the campus has never felt bigger.",
    action: "link",
    url: "https://aaruush.org",
  },
  {
    id: "mystery-room",
    name: "Mystery Room",
    type: "Activity",
    date: "To Be Revealed",
    blurb: "Step into this year's original case. A room, a story, a countdown — solve it from the inside.",
    description: "A brand-new case is scripted from scratch every year — no plot is ever reused. Teams of 3–5 step into a fully staged room filled with evidence, props, and red herrings. You get 30 minutes, exactly one hint, and a story that only makes sense if you piece together every clue. The fastest correct solve of the day tops the leaderboard.",
    action: "link",
    url: "https://aaruush.org",
  },
  {
    id: "cryptic-conundrum",
    name: "To Be Revealed",
    type: "Domain Event",
    date: "To Be Revealed",
    blurb: "To Be Revealed",
    description: "To Be Revealed",
    action: "register",
  },
  {
    id: "fermi-files",
    name: "To Be Revealed",
    type: "Domain Event",
    date: "To Be Revealed",
    blurb: "To Be Revealed",
    description: "To Be Revealed",
    action: "register",
  },
  {
    id: "paradox-arena",
    name: "To Be Revealed",
    type: "Domain Event",
    date: "To Be Revealed",
    blurb: "To Be Revealed",
    description: "To Be Revealed",
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
      name: "To Be Revealed",
      dates: "To Be Revealed",
      image: "skeletonKey",
      description: "To Be Revealed",
      rounds: [
        { day: "Day 1", date: "To Be Revealed", name: "To Be Revealed", detail: "To Be Revealed", image: u("photo-1553991562-9f24b119ff51", 800) },
        { day: "Day 2", date: "To Be Revealed", name: "To Be Revealed", detail: "To Be Revealed", image: u("photo-1569002925653-ed18f55d7292", 800) },
        { day: "Day 3", date: "To Be Revealed", name: "To Be Revealed", detail: "To Be Revealed", image: u("photo-1695893155282-4f71c946da5a", 800) },
      ],
    },
    {
      id: "fermi-files",
      name: "To Be Revealed",
      dates: "To Be Revealed",
      image: "treasureMaps",
      description: "To Be Revealed",
      rounds: [
        { day: "Day 1", date: "To Be Revealed", name: "To Be Revealed", detail: "To Be Revealed", image: u("photo-1473163928189-364b2c4e1135", 800) },
        { day: "Day 2", date: "To Be Revealed", name: "To Be Revealed", detail: "To Be Revealed", image: u("photo-1626125345510-4603468eedfb", 800) },
        { day: "Day 3", date: "To Be Revealed", name: "To Be Revealed", detail: "To Be Revealed", image: u("photo-1761618291331-535983ae4296", 800) },
      ],
    },
    {
      id: "paradox-arena",
      name: "To Be Revealed",
      dates: "To Be Revealed",
      image: "stageLights",
      description: "To Be Revealed",
      rounds: [
        { day: "Day 1", date: "To Be Revealed", name: "To Be Revealed", detail: "To Be Revealed", image: u("photo-1583787035686-91b82ad5d811", 800) },
        { day: "Day 2", date: "To Be Revealed", name: "To Be Revealed", detail: "To Be Revealed", image: u("photo-1585346230722-6b9df46d0d54", 800) },
        { day: "Day 3", date: "To Be Revealed", name: "To Be Revealed", detail: "To Be Revealed", image: u("photo-1542190891-2093d38760f2", 800) },
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
  { year: "2008", title: "The Birth of FUNDAZ", text: "FUNDAZ was inaugurated as the fun-and-logic domain of Aaruush, bringing quizzing and lateral thinking to the SRM stage for the first time." },
  { year: "2015", title: "Mystery Room Debuts", text: "The first Mystery Room case was scripted and staged — a locked-door format unlike anything else at the fest. The crowd was hooked instantly." },
  { year: "2021", title: "Treasure Hunt Joins the Family", text: "Treasure Hunt became an official part of FUNDAZ, turning the entire SRMIST campus into a living puzzle board." },
  { year: "2022", title: "The First Murder Mystery", text: "FUNDAZ conducted its first-ever Murder Mystery — a fully scripted whodunit that set a new benchmark for immersive storytelling at the domain." },
  { year: "2025", title: "Treasure Hunt Goes Online", text: "Treasure Hunt made the leap to a fully online format, extending the campus-wide chase beyond physical boundaries for the first time." },
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
