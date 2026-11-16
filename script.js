/* ================== CONFIGURAÇÃO ==================
   WHATSAPP: número com indicativo, só dígitos (ex.: "351912345678").
   Enquanto estiver vazio, o formulário de presença fica escondido
   e aparece apenas a mensagem simpática por baixo.
*/
const CONFIG = {
  whatsapp: "",
  // 5 Dez 2026, 10h00 (Portugal continental está em UTC+0 em Dezembro)
  dataCasamento: "2026-12-05T10:00:00+00:00",
  duracaoHoras: 7 // cerimónia + almoço até às 17h
};

/* ---------- COUNTDOWN ---------- */
(function () {
  const alvo = new Date(CONFIG.dataCasamento).getTime();
  const el = {
    d: document.getElementById("cd-dias"),
    h: document.getElementById("cd-horas"),
    m: document.getElementById("cd-min"),
    s: document.getElementById("cd-seg"),
    msg: document.getElementById("cd-msg"),
    box: document.getElementById("countdown")
  };
  const pad = (n) => String(n).padStart(2, "0");

  function tick() {
    const diff = alvo - Date.now();
    if (diff <= 0) {
      el.box.style.display = "none";
      const fim = alvo + CONFIG.duracaoHoras * 3600e3;
      el.msg.textContent = Date.now() < fim
        ? "É hoje! Vemo-nos na Basílica de Santa Luzia."
        : "Obrigado por terem celebrado este dia connosco.";
      return;
    }
    const s = Math.floor(diff / 1000);
    el.d.textContent = pad(Math.floor(s / 86400));
    el.h.textContent = pad(Math.floor((s % 86400) / 3600));
    el.m.textContent = pad(Math.floor((s % 3600) / 60));
    el.s.textContent = pad(s % 60);
  }
  tick();
  setInterval(tick, 1000);
})();

/* ---------- ADICIONAR AO CALENDÁRIO (.ics) ---------- */
document.getElementById("btn-ics").addEventListener("click", () => {
  const fmt = (d) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const ini = new Date(CONFIG.dataCasamento);
  const fim = new Date(ini.getTime() + CONFIG.duracaoHoras * 3600e3);
  const ics = [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Casamento Edna e Andre//PT",
    "BEGIN:VEVENT",
    "UID:casamento-edna-andre-20261205@convite",
    "DTSTAMP:" + fmt(new Date()),
    "DTSTART:" + fmt(ini),
    "DTEND:" + fmt(fim),
    "SUMMARY:Casamento Edna & André",
    "LOCATION:Basílica de Santa Luzia\\, Viana do Castelo",
    "DESCRIPTION:Cerimónia às 10h00 na Basílica de Santa Luzia. Almoço na Pousada de Santa Luzia até às 17h00.",
    "END:VEVENT", "END:VCALENDAR"
  ].join("\r\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
  a.download = "casamento-edna-andre.ics";
  a.click();
  URL.revokeObjectURL(a.href);
});

/* ---------- RSVP via WhatsApp ---------- */
(function () {
  const form = document.getElementById("rsvp");
  const fallback = document.getElementById("rsvp-fallback");
  if (!CONFIG.whatsapp) return;
  form.hidden = false;
  fallback.hidden = true;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const f = new FormData(form);
    let txt = `Olá! Confirmo a minha presença no casamento de Edna & André (5 Dez 2026).\n` +
              `Nome: ${f.get("nome")}\nPessoas: ${f.get("pessoas")}`;
    if (f.get("msg")) txt += `\nNota: ${f.get("msg")}`;
    window.open(`https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(txt)}`, "_blank", "noopener");
  });
})();

/* ---------- NAV + REVEAL ---------- */
(function () {
  const nav = document.getElementById("nav");
  const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 40);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  const els = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) { els.forEach((e) => e.classList.add("in")); return; }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
  }, { threshold: 0.15 });
  els.forEach((e) => io.observe(e));
})();

/* ---------- NEVE ---------- */
(function () {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const c = document.getElementById("neve");
  const ctx = c.getContext("2d");
  let w, h, flakes = [], dpr = Math.min(window.devicePixelRatio || 1, 2), raf;

  function resize() {
    w = window.innerWidth; h = window.innerHeight;
    c.width = w * dpr; c.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.round(Math.min(110, Math.max(35, w / 14)));
    flakes = Array.from({ length: n }, () => novo(true));
  }
  function novo(anywhere) {
    return {
      x: Math.random() * w,
      y: anywhere ? Math.random() * h : -10,
      r: Math.random() * 2.6 + .8,
      vy: Math.random() * .7 + .35,
      vx: Math.random() * .4 - .2,
      ph: Math.random() * Math.PI * 2,
      a: Math.random() * .45 + .35
    };
  }
  function frame(t) {
    ctx.clearRect(0, 0, w, h);
    for (const f of flakes) {
      f.y += f.vy;
      f.x += f.vx + Math.sin(t / 1500 + f.ph) * .35;
      if (f.y > h + 10 || f.x < -10 || f.x > w + 10) Object.assign(f, novo(false), { x: Math.random() * w });
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${f.a})`;
      ctx.shadowColor = "rgba(184,147,74,.55)";
      ctx.shadowBlur = 5;
      ctx.fill();
    }
    raf = requestAnimationFrame(frame);
  }
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) cancelAnimationFrame(raf); else raf = requestAnimationFrame(frame);
  });
  window.addEventListener("resize", resize);
  resize();
  raf = requestAnimationFrame(frame);
})();
