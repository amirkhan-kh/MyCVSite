export const site = {
  title: "Amirxon Xodisaliyev — Noldan Junior Frontend dasturchigacha 7 oyda | Geeks Andijan",
  description:
    "Andijonda offline Frontend kursi: HTML, CSS, JavaScript va React. 80 ta amaliy dars, 3 ta yakuniy loyiha va ishga ko‘rsatsa bo‘ladigan portfolio. Ustoz — Amirxon Xodisaliyev.",
  brand: "Geeks",
  city: "Andijan",
};

export const contacts = {
  phone: "+998 90 211 31 23",
  phoneHref: "tel:+998902113123",
  instagram: "https://www.instagram.com/geeks.andijan",
  telegram: "https://t.me/geeks_support",
};

export const mentor = {
  name: "Amirxon Xodisaliyev",
  firstName: "Amirxon",
  role: "Frontend dasturchi · Ustoz",
  bio: "Toshkent va Farg‘onadagi IT kompaniyalarda landing sahifalardan tortib CRM, ERP va LMS platformalarigacha ishlab chiqqan, yirik biznes tizimlariga sun’iy intellektni integratsiya qilgan. Endi shu real tajribani Geeks Andijonda yangi avlod dasturchilariga o‘rgatadi.",
  highlights: [
    { value: "3", label: "IT kompaniyada tajriba" },
    { value: "CRM · ERP · LMS", label: "real platformalar" },
    { value: "AI", label: "biznesga integratsiya" },
  ],
};

export const hero = {
  badge: "Yangi guruhga qabul ochiq",
  titleLines: ["Noldan Junior", "Frontend", "dasturchigacha"],
  accent: "7 oyda",
  text: "HTML, CSS, JavaScript va React. 80 ta amaliy dars, 3 ta yakuniy loyiha va kurs oxirida ishga ko‘rsatsa bo‘ladigan portfolio.",
  primary: "Bepul konsultatsiyaga yozilish",
  secondary: "Dasturni ko‘rish",
  chips: ["HTML", "CSS · Flexbox · Grid", "JavaScript", "React · Redux Toolkit"],
};

export const stats = [
  { value: "7", suffix: " oy", label: "o‘qish davomiyligi", count: 7 },
  { value: "80", suffix: "", label: "amaliy dars", count: 80 },
  { value: "3", suffix: "×", label: "haftada, 90 daqiqadan", count: 3 },
  { value: "10–12", suffix: "", label: "o‘quvchi guruhda" },
];

export const roadmap = {
  eyebrow: "Yo‘l xaritasi",
  title: "4 bosqich. Har biri oldingisining ustiga quriladi.",
  text: "Avval sahifa tuzilishi, keyin dizayn, keyin mantiq va nihoyat zamonaviy ilova. Har bosqich real loyiha bilan yopiladi.",
  modules: [
    {
      n: "01",
      meta: "0.5 oy · 6 dars",
      title: "HTML",
      text: "Web qanday ishlashi, sahifa tuzilishi, jadvallar, formalar va semantik teglar.",
      points: ["Elementlar va atributlar", "Jadvallar va formalar", "Semantik teglar"],
    },
    {
      n: "02",
      meta: "2.5 oy · 26 dars",
      title: "CSS",
      text: "Box model, typografiya, animatsiya, Flexbox, Grid va har qanday ekranga moslashuvchi dizayn.",
      points: ["Flexbox: 5 ta amaliy dars", "Grid va Media Queries", "Responsive veb-sayt loyihasi"],
    },
    {
      n: "03",
      meta: "2 oy · 24 dars",
      title: "JavaScript",
      text: "Dasturlash mantiqi, DOM, hodisalar, asinxron kod va serverdan ma’lumot olish.",
      points: ["DOM va Events", "Async/await va Fetch API", "Student Management System"],
    },
    {
      n: "04",
      meta: "2 oy · 24 dars",
      title: "React",
      text: "Zamonaviy ilovalar: komponentlar, hooklar, routing, Context va Redux Toolkit.",
      points: ["Vite + React, Hooks", "React Router va Context", "E-commerce Store loyihasi"],
      featured: true,
    },
  ],
};

export const projects = {
  eyebrow: "Portfolio",
  title: "Kursdan 3 ta tayyor loyiha bilan chiqasiz",
  items: [
    {
      tag: "CSS · 26-dars",
      title: "Responsive veb-sayt",
      text: "Telefon, planshet va kompyuterda bir xil chiroyli ko‘rinadigan to‘liq sayt — Flexbox, Grid va Media Queries bilan.",
      stack: ["HTML", "CSS", "Responsive"],
      hue: 196,
      preview: "responsive" as const,
      url: "",
    },
    {
      tag: "JavaScript · 22–24-dars",
      title: "Student Management System",
      text: "O‘quvchilarni qo‘shish, tahrirlash, qidirish va saralash — ma’lumotlar LocalStorage’da saqlanadi.",
      stack: ["DOM", "Fetch", "LocalStorage"],
      hue: 176,
      preview: "students" as const,
      url: "students.app/dashboard",
    },
    {
      tag: "React · 22–24-dars",
      title: "E-commerce Store",
      text: "Katalog, savatcha va sahifalar orasida navigatsiyaga ega internet-do‘kon — real loyiha darajasida.",
      stack: ["React Router", "Redux Toolkit"],
      hue: 210,
      preview: "store" as const,
      url: "gadget.uz/katalog",
      featured: true,
    },
  ],
};

export const experience = [
  {
    period: "2026.09 — hozir",
    company: "Geeks Andijan",
    place: "Andijon",
    role: "Frontend ustoz",
    text: "“Noldan Junior Frontend dasturchigacha” kursini olib boradi: HTML’dan React’gacha, real loyihalar bilan.",
    current: true,
  },
  {
    period: "2026.04 — 2026.08",
    company: "Aviora Team",
    place: "Farg‘ona · IT kompaniya",
    role: "Software Engineer (Middle)",
    text: "CRM, ERP va LMS platformalarini ishlab chiqish, ularga sun’iy intellektni integratsiya qilish. Yirik bizneslar boshqaruviga AI yechimlarini joriy etish.",
  },
  {
    period: "2025.10 — 2026.03",
    company: "IT911",
    place: "Toshkent · IT kompaniya",
    role: "Frontend dasturchi (Middle)",
    text: "CRM va ERP tizimlarini ishlab chiqish.",
  },
  {
    period: "2025.01 — 2025.09",
    company: "Serius Solution",
    place: "Toshkent · IT kompaniya",
    role: "Frontend dasturchi",
    text: "Landing sahifalar, veb-saytlar va veb-ilovalar ishlab chiqish.",
  },
];

export const skills = [
  { group: "Tillar", items: ["JavaScript", "TypeScript"] },
  { group: "Frameworklar", items: ["React.js", "Next.js", "Astro", "Vue.js", "Nuxt.js"] },
  { group: "State management", items: ["Redux Toolkit", "Zustand", "MobX"] },
  { group: "Ma’lumot bilan ishlash", items: ["TanStack Query", "RTK Query", "Ky"] },
  { group: "Stillar", items: ["CSS", "SCSS", "Tailwind CSS"] },
];

export const audience = {
  eyebrow: "Kimlar uchun",
  title: "Tajriba shart emas — noldan boshlaymiz",
  items: [
    "12–18 yoshdagi, IT’ga qiziqadigan yoshlar",
    "Qaysi IT yo‘nalishdan boshlashni bilmayotganlar",
    "Farzandiga kelajak kasbini bermoqchi bo‘lgan ota-onalar",
    "YouTube’dan o‘rganib, tizim topa olmaganlar",
  ],
};

export const format = {
  eyebrow: "O‘qish formati",
  title: "Offline, Andijonda, kichik guruhda",
  items: [
    { label: "Jadval", value: "Haftada 3 kun" },
    { label: "Dars davomiyligi", value: "90 daqiqa" },
    { label: "Guruh hajmi", value: "10–12 o‘quvchi" },
    { label: "Umumiy muddat", value: "7 oy" },
  ],
};
