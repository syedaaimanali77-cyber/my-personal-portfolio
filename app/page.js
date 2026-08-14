"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

/* ─── static data ─────────────────────────────────────────── */

const EMAIL = "syedaaimanali77@gmail.com";
const GITHUB = "https://github.com/syedaaimanali77-cyber";
const LINKEDIN = "https://www.linkedin.com/in/syeda-aiman-56a4a6387";

const NAME_LINES = [
  { text: "Syeda", accent: false },
  { text: "Aiman Raza", accent: true },
];

const TICKER_ITEMS = [
  { label: "Full-Stack Development", strong: false },
  { label: "AI Automation", strong: true },
  { label: "Logo Design", strong: false },
  { label: "Video Editing", strong: true },
  { label: "Computational Mathematics", strong: false },
  { label: "Model UN", strong: true },
];

const LANGUAGES = [
  { name: "Urdu", script: "اردو", level: "Native", pct: 100, scale: false },
  { name: "English", script: "English", level: "Fluent", pct: 88, scale: false },
  { name: "Finnish", script: "Suomi", level: "Beginner", pct: 28, scale: true },
];

const CEFR = ["A1", "A2", "B1", "B2", "C1", "Native"];

const CURVE_ROWS = 15;
const CURVE_COLS = 60;
const CURVE_W = 1200;
const CURVE_H = 800;
const METER_SEGMENTS = 20;

/* Build the <span> per character so React owns the DOM instead of a
   mount-time loop — otherwise StrictMode's double effect duplicates them. */
function heroChars() {
  return NAME_LINES.map((line, li) => {
    const words = line.text.split(" ");
    let i = 0;
    const nodes = [];
    words.forEach((word, wi) => {
      const chars = word.split("").map((ch) => {
        const delay = `${(0.32 + li * 0.14 + i * 0.045).toFixed(3)}s`;
        i += 1;
        return { ch, delay };
      });
      nodes.push({ type: "word", chars, key: `w${li}-${wi}` });
      if (wi < words.length - 1) {
        const delay = `${(0.32 + li * 0.14 + i * 0.045).toFixed(3)}s`;
        i += 1;
        nodes.push({ type: "space", delay, key: `s${li}-${wi}` });
      }
    });
    return { ...line, nodes, key: `l${li}` };
  });
}

export default function Page() {
  /* ─── refs ─── */
  const navRef = useRef(null);
  const progressRef = useRef(null);
  const navLinkRefs = useRef([]);
  const curvesRef = useRef(null);
  const plotRef = useRef(null);
  const plotInRef = useRef(null);
  const awardRef = useRef(null);
  const awardInRef = useRef(null);
  const barsRef = useRef(null);
  const bentoRef = useRef(null);

  /* ─── state ─── */
  const [theme, setTheme] = useState("light");
  const [menuOpen, setMenuOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("");
  const [year, setYear] = useState(2026);

  const lines = useMemo(heroChars, []);

  /* ─── theme: read stored preference, then reflect to <html> ─── */
  useEffect(() => {
    let stored = null;
    try {
      stored = localStorage.getItem("aiman-theme");
    } catch (e) {
      /* storage blocked — fall through to system preference */
    }
    if (stored === "dark" || stored === "light") {
      setTheme(stored);
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setTheme("dark");
    }
    setYear(new Date().getFullYear());
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem("aiman-theme", theme);
    } catch (e) {
      /* nothing to persist to — the in-memory theme still works */
    }
  }, [theme]);

  const toggleTheme = useCallback(
    () => setTheme((t) => (t === "dark" ? "light" : "dark")),
    []
  );

  /* ─── nav: sticky border, progress bar, active link ─── */
  useEffect(() => {
    const sections = navLinkRefs.current.map((a) =>
      a ? document.querySelector(a.getAttribute("href")) : null
    );
    let ticking = false;

    const onScroll = () => {
      const y = window.scrollY;
      const h = document.documentElement.scrollHeight - window.innerHeight;
      if (navRef.current) navRef.current.classList.toggle("is-stuck", y > 12);
      if (progressRef.current)
        progressRef.current.style.width = `${h > 0 ? (y / h) * 100 : 0}%`;

      let current = -1;
      sections.forEach((sec, i) => {
        if (sec && sec.getBoundingClientRect().top <= window.innerHeight * 0.35)
          current = i;
      });
      navLinkRefs.current.forEach((a, i) => {
        if (a) a.classList.toggle("is-active", i === current);
      });
      ticking = false;
    };

    const handler = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(onScroll);
      }
    };

    window.addEventListener("scroll", handler, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", handler);
  }, []);

  /* ─── hero curve field ─── */
  useEffect(() => {
    const group = curvesRef.current;
    if (!group) return undefined;
    const paths = Array.from(group.querySelectorAll("path"));
    if (!paths.length) return undefined;

    const draw = (t) => {
      for (let r = 0; r < CURVE_ROWS; r += 1) {
        const baseY = (CURVE_H / (CURVE_ROWS - 1)) * r;
        let d = "";
        for (let c = 0; c < CURVE_COLS; c += 1) {
          const x = (CURVE_W / (CURVE_COLS - 1)) * c;
          const u = x / CURVE_W;
          const v = r / (CURVE_ROWS - 1);
          const y =
            baseY +
            Math.sin(u * 5.2 + t + v * 2.4) * (46 * (0.35 + v)) +
            Math.sin(u * 11.5 - t * 0.6 + v * 5.1) * 14 +
            Math.cos(v * 6.1 - t * 0.4) * 10;
          d += `${c ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`;
        }
        paths[r].setAttribute("d", d);
      }
    };

    draw(0);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      return undefined;

    let start = null;
    let raf = null;
    const tick = (ts) => {
      if (start === null) start = ts;
      draw((ts - start) / 5200);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
      } else {
        start = null;
        raf = requestAnimationFrame(tick);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  /* ─── 3D parallax on the portrait and the award frame ─── */
  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduce) return undefined;

    const cleanups = [];
    const bind = (outer, inner, ax, ay) => {
      if (!outer || !inner) return;
      const move = (e) => {
        const b = outer.getBoundingClientRect();
        const px = (e.clientX - b.left) / b.width;
        const py = (e.clientY - b.top) / b.height;
        inner.style.transition = "transform .12s linear";
        inner.style.setProperty("--ry", `${((px - 0.5) * ax).toFixed(2)}deg`);
        inner.style.setProperty("--rx", `${((0.5 - py) * ay).toFixed(2)}deg`);
      };
      const leave = () => {
        inner.style.transition = "transform .6s cubic-bezier(.22,.68,.32,1)";
        inner.style.setProperty("--ry", "0deg");
        inner.style.setProperty("--rx", "0deg");
      };
      outer.addEventListener("pointermove", move);
      outer.addEventListener("pointerleave", leave);
      cleanups.push(() => {
        outer.removeEventListener("pointermove", move);
        outer.removeEventListener("pointerleave", leave);
      });
    };

    bind(plotRef.current, plotInRef.current, 18, 14);
    bind(awardRef.current, awardInRef.current, 13, 10);
    return () => cleanups.forEach((fn) => fn());
  }, []);

  /* ─── scroll reveals ─── */
  useEffect(() => {
    const els = Array.from(document.querySelectorAll(".rv"));
    if (!("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("in"));
      return undefined;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -8% 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  /* ─── language meters fill once in view ─── */
  useEffect(() => {
    const el = barsRef.current;
    if (!el) return undefined;
    if (!("IntersectionObserver" in window)) {
      el.classList.add("in");
      return undefined;
    }
    const io = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  /* ─── bento tilt + cursor spotlight ─── */
  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const root = bentoRef.current;
    if (!fine || reduce || !root) return undefined;

    const cards = Array.from(root.querySelectorAll(".bcard"));
    const cleanups = [];
    cards.forEach((card) => {
      const move = (e) => {
        const b = card.getBoundingClientRect();
        const px = (e.clientX - b.left) / b.width;
        const py = (e.clientY - b.top) / b.height;
        card.style.setProperty("--mx", `${px * 100}%`);
        card.style.setProperty("--my", `${py * 100}%`);
        card.style.transform = `perspective(1300px) rotateY(${(
          (px - 0.5) *
          11
        ).toFixed(2)}deg) rotateX(${((0.5 - py) * 9).toFixed(
          2
        )}deg) translateZ(12px)`;
      };
      const leave = () => {
        card.style.transform = "";
      };
      card.addEventListener("pointermove", move);
      card.addEventListener("pointerleave", leave);
      cleanups.push(() => {
        card.removeEventListener("pointermove", move);
        card.removeEventListener("pointerleave", leave);
      });
    });
    return () => cleanups.forEach((fn) => fn());
  }, []);

  /* ─── contact form → mailto ─── */
  const onField = (key) => (e) => {
    const { value } = e.target;
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((prev) => (prev[key] ? { ...prev, [key]: false } : prev));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const name = form.name.trim();
    const email = form.email.trim();
    const message = form.message.trim();
    const next = {
      name: name.length < 2,
      email: !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email),
      message: message.length < 10,
    };
    setErrors(next);
    if (next.name || next.email || next.message) {
      setStatus("");
      return;
    }
    const body = `${message}\n\n—\n${name}\n${email}`;
    window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(
      `Portfolio enquiry from ${name}`
    )}&body=${encodeURIComponent(body)}`;
    setStatus("Opening your mail app — press send there to finish.");
  };

  const tickerSet = (copy) => (
    <div className="ticker__set" key={copy}>
      {TICKER_ITEMS.map((item) => (
        <span key={`${copy}-${item.label}`}>
          {item.strong ? <b>{item.label}</b> : item.label}
          <i />
        </span>
      ))}
    </div>
  );

  return (
    <>
      <div className="plane" aria-hidden="true" />
      <div className="grain" aria-hidden="true" />
      <div className="progress" ref={progressRef} />

      {/* ========= NAV ========= */}
      <header className={`nav${menuOpen ? " is-open" : ""}`} ref={navRef}>
        <a className="brand" href="#top" aria-label="Syeda Aiman Raza — home">
          <svg className="brand__mark" viewBox="0 0 40 40" aria-hidden="true">
            <circle className="brand__ring" cx="20" cy="20" r="17" fill="none" stroke="var(--violet-glow)" strokeWidth="1" strokeDasharray="3 7" opacity=".85"/>
            <path className="brand__arc" d="M20 5.5 A14.5 14.5 0 0 1 34.5 20" fill="none" stroke="var(--teal)" strokeWidth="2" strokeLinecap="round"/>
            <path className="brand__letter" d="M12.5 28 L20 11.5 L27.5 28" fill="none" stroke="var(--ink)" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"/>
            <path className="brand__bar" d="M15.6 21.4 H24.4" fill="none" stroke="var(--teal)" strokeWidth="2.3" strokeLinecap="round"/>
            <circle className="brand__dot" cx="20" cy="11.5" r="2.1" fill="var(--violet)"/>
          </svg>
          <span className="brand__name">Aiman <span>Raza</span></span>
        </a>
        <ul className="nav__links">
          <li>
        <a
          href="#about"
          ref={(el) => {
            navLinkRefs.current[0] = el;
          }}
          onClick={() => setMenuOpen(false)}
        >
          About
        </a>
      </li>
          <li>
        <a
          href="#skills"
          ref={(el) => {
            navLinkRefs.current[1] = el;
          }}
          onClick={() => setMenuOpen(false)}
        >
          Skills
        </a>
      </li>
          <li>
        <a
          href="#languages"
          ref={(el) => {
            navLinkRefs.current[2] = el;
          }}
          onClick={() => setMenuOpen(false)}
        >
          Languages
        </a>
      </li>
          <li>
        <a
          href="#education"
          ref={(el) => {
            navLinkRefs.current[3] = el;
          }}
          onClick={() => setMenuOpen(false)}
        >
          Education
        </a>
      </li>
          <li>
        <a
          href="#recognition"
          ref={(el) => {
            navLinkRefs.current[4] = el;
          }}
          onClick={() => setMenuOpen(false)}
        >
          Recognition
        </a>
      </li>
          <li>
        <a
          href="#connect"
          ref={(el) => {
            navLinkRefs.current[5] = el;
          }}
          onClick={() => setMenuOpen(false)}
        >
          Connect
        </a>
      </li>
          <li>
        <a
          href="#contact"
          ref={(el) => {
            navLinkRefs.current[6] = el;
          }}
          onClick={() => setMenuOpen(false)}
        >
          Contact
        </a>
      </li>
        </ul>
        <div className="nav__right">
          <button
      className="toggle"
      onClick={toggleTheme}
      role="switch"
      aria-checked={theme === "dark"}
      aria-label={
        theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
      }
    >
            <span className="toggle__ico toggle__ico--sun" aria-hidden="true">☀</span>
            <span className="toggle__ico toggle__ico--moon" aria-hidden="true">☾</span>
            <span className="toggle__knob" />
          </button>
          <button
      className="burger"
      onClick={() => setMenuOpen((o) => !o)}
      aria-label="Menu"
      aria-expanded={menuOpen}
    ><span></span><span></span><span></span></button>
        </div>
      </header>

      <main id="top">
      {/* ========= HERO ========= */}
      <section className="hero">
        <svg className="curves" id="curves" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <defs>
            <radialGradient id="wA" cx="14%" cy="8%" r="60%"><stop offset="0%" stopColor="var(--teal-glow)" stopOpacity=".5"/><stop offset="100%" stopColor="var(--teal-glow)" stopOpacity="0"/></radialGradient>
            <radialGradient id="wB" cx="90%" cy="84%" r="58%"><stop offset="0%" stopColor="var(--violet-glow)" stopOpacity=".45"/><stop offset="100%" stopColor="var(--violet-glow)" stopOpacity="0"/></radialGradient>
            <linearGradient id="lg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="var(--teal-glow)"/><stop offset="100%" stopColor="var(--violet-glow)"/></linearGradient>
          </defs>
          <g className="curves__wash"><rect width="1200" height="800" fill="url(#wA)"/><rect width="1200" height="800" fill="url(#wB)"/></g>
          <g className="curves__lines" ref={curvesRef} stroke="url(#lg)">
          {Array.from({ length: CURVE_ROWS }).map((_, r) => (
            <path
              key={r}
              strokeOpacity={(
                0.28 +
                0.55 * (1 - Math.abs(r - CURVE_ROWS / 2) / (CURVE_ROWS / 2))
              ).toFixed(2)}
            />
          ))}
        </g>
        </svg>

        <div className="wrap hero__grid">
          <div>
            <span className="hero__tag"><i />Lahore, Pakistan — open to work</span>
            <h1 className="hero__name" aria-label="Syeda Aiman Raza">
        {lines.map((line) => (
          <span className="ln" key={line.key}>
            {line.nodes.map((node) =>
              node.type === "space" ? (
                <span
                  className="ch ch--sp"
                  key={node.key}
                  style={{ animationDelay: node.delay }}
                >
                  &nbsp;
                </span>
              ) : (
                <span className="wd" key={node.key}>
                  {node.chars.map((c, ci) => (
                    <span
                      className="ch"
                      key={ci}
                      style={{ animationDelay: c.delay }}
                    >
                      {line.accent ? <em>{c.ch}</em> : c.ch}
                    </span>
                  ))}
                </span>
              )
            )}
          </span>
        ))}
      </h1>
            <div className="hero__rule" />
            <p className="hero__hook">I turn mathematics into software people can actually <em>use</em>.</p>
            <div className="hero__cta">
              <a className="btn btn--primary" href="#contact">Start a conversation
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
              </a>
              <a className="btn btn--ghost" href="#skills">See what I do</a>
            </div>
          </div>

          <div className="plot" ref={plotRef}>
            <div className="plot__in" ref={plotInRef}>
              <div className="plot__halo" aria-hidden="true" />
              <div className="plot__aurora" aria-hidden="true" />
              <div className="plot__rim" aria-hidden="true" />
              <div className="plot__shadow" aria-hidden="true" />
              <div className="plot__disc" role="img" aria-label="Portrait of Syeda Aiman Raza" />
            </div>
          </div>
        </div>

        <div className="hero__scroll"><span>Scroll</span><i /></div>
      </section>

      {/* ========= TICKER ========= */}
      <div className="ticker" aria-hidden="true">
        <div className="ticker__track">
          {tickerSet("a")}
          {tickerSet("b")}
        </div>
      </div>

      {/* ========= ABOUT ========= */}
      <section className="sec" id="about">
        <div className="wrap about">
          <div className="rv">
            <p className="clause">§ About</p>
            <h2 className="h2">Mathematics at the back,<br /><em>craft</em> at the front.</h2>
            <p className="hook">Two disciplines, one workflow.</p>
            <div className="pcard">
              <div className="pcard__top">
                <span className="avatar" role="img" aria-label="Syeda Aiman Raza" />
                <span className="pcard__id"><b>Syeda Aiman Raza</b><span>Lahore, Pakistan</span></span>
              </div>
              <p className="pcard__sig">Build the thing properly, then explain it so plainly that nobody has to take your word for it.</p>
            </div>
          </div>

          <div className="rv" data-d="1">
            <div className="about__body">
              <p>I study <strong>computational mathematics for AI</strong> at Lahore Garrison University and build for the web alongside it. My work sits where those two meet: models that reason, interfaces that explain themselves.</p>
              <p>I write across the stack — the screen at the front, the APIs and data behind it — and hand the repetitive parts to AI automation. When a product needs an identity I design the mark; when it needs a story I cut the video. Model UN taught me to hold a position under pressure, which turns out to be most of engineering.</p>
            </div>
            <ul className="stats">
              <li><b>4</b><span>Disciplines<br />practised</span></li>
              <li><b>3</b><span>Languages<br />spoken</span></li>
              <li><b>BS</b><span>Comp. maths<br />in progress</span></li>
              <li><b>MUN</b><span>Delegate,<br />award-winning bloc</span></li>
            </ul>
          </div>
        </div>
      </section>

      {/* ========= SKILLS ========= */}
      <section className="sec sec--tint" id="skills">
        <div className="wrap">
          <div className="rv">
            <p className="clause">§ Practice</p>
            <h2 className="h2">Four disciplines,<br />one <em>build process</em>.</h2>
            <p className="hook">Depth over a long list.</p>
          </div>
          <div className="bento" ref={bentoRef}>
            <article className="bcard rv" data-d="1" tabindex="0">
              <span className="bcard__ix">01</span>
              <div className="bcard__ico"><svg viewBox="0 0 24 24"><path d="M8 17l-5-5 5-5M16 7l5 5-5 5M13.5 4l-3 16"/></svg></div>
              <div className="bcard__body">
                <h3 className="bcard__title">Full-Stack Web Development</h3>
                <p className="bcard__text">Interfaces at the front, APIs and data behind them — one person, one whole feature, wireframe to deployment.</p>
              </div>
              <ul className="bcard__tags"><li>frontend</li><li>backend</li><li>apis</li><li>deploy</li></ul>
            </article>
            <article className="bcard rv" data-d="2" tabindex="0">
              <span className="bcard__ix">02</span>
              <div className="bcard__ico"><svg viewBox="0 0 24 24"><path d="M12 3v3M12 18v3M4.2 7.5l2.6 1.5M17.2 15l2.6 1.5M4.2 16.5l2.6-1.5M17.2 9l2.6-1.5"/><circle cx="12" cy="12" r="3.4"/></svg></div>
              <div className="bcard__body">
                <h3 className="bcard__title">AI Automation</h3>
                <p className="bcard__text">Workflows that run themselves — prompts, pipelines and the glue code between.</p>
              </div>
              <ul className="bcard__tags"><li>llms</li><li>workflows</li><li>scripting</li></ul>
            </article>
            <article className="bcard rv" data-d="1" tabindex="0">
              <span className="bcard__ix">03</span>
              <div className="bcard__ico"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5"/><path d="M12 3.5v17M3.5 12h17" opacity=".45"/><circle cx="12" cy="12" r="3.2"/></svg></div>
              <div className="bcard__body">
                <h3 className="bcard__title">Logo Design</h3>
                <p className="bcard__text">Marks built on grids and geometry, not trends. Still legible at 16 pixels.</p>
              </div>
              <ul className="bcard__tags"><li>identity</li><li>vector</li><li>grids</li></ul>
            </article>
            <article className="bcard rv" data-d="2" tabindex="0">
              <span className="bcard__ix">04</span>
              <div className="bcard__ico"><svg viewBox="0 0 24 24"><rect x="2.5" y="5.5" width="14" height="13" rx="2.5"/><path d="M16.5 10.5l5-3v9l-5-3z"/></svg></div>
              <div className="bcard__body">
                <h3 className="bcard__title">Video Editing</h3>
                <p className="bcard__text">Cuts with rhythm. Pacing, sound and motion arranged to hold attention to the last frame.</p>
              </div>
              <ul className="bcard__tags"><li>editing</li><li>motion</li><li>sound</li></ul>
            </article>
          </div>
        </div>
      </section>

      {/* ========= LANGUAGES ========= */}
      <section className="sec" id="languages">
        <div className="wrap lang">
          <div className="rv">
            <p className="clause">§ Languages</p>
            <h2 className="h2">Three languages,<br />one register: <em>clear</em>.</h2>
            <p className="hook">Technical work is only as good as its explanation.</p>
          </div>
          <ul className="bars rv" ref={barsRef} data-d="1">
      {LANGUAGES.map((lang) => {
        const lit = Math.round((METER_SEGMENTS * lang.pct) / 100);
        return (
          <li className="lrow" key={lang.name}>
            <span className="lrow__script" aria-hidden="true">
              {lang.script}
            </span>
            <div className="lrow__head">
              <span className="lrow__name">{lang.name}</span>
              <span className="lrow__lvl">{lang.level}</span>
              <span className="lrow__pct">{lang.pct}%</span>
            </div>
            <div className="meter" aria-hidden="true">
              {Array.from({ length: METER_SEGMENTS }).map((_, i) => (
                <span
                  key={i}
                  className={i < lit ? "on" : undefined}
                  style={{ "--i": i }}
                />
              ))}
            </div>
            {lang.scale ? (
              <div className="lrow__scale">
                {CEFR.map((step) => (
                  <span key={step}>{step}</span>
                ))}
              </div>
            ) : null}
          </li>
        );
      })}
    </ul>
        </div>
      </section>

      {/* ========= EDUCATION ========= */}
      <section className="sec sec--tint" id="education">
        <div className="wrap">
          <div className="rv">
            <p className="clause">§ Education</p>
            <h2 className="h2">The <em>route</em> so far.</h2>
            <p className="hook">Theory first, then the tools, then the room.</p>
          </div>
          <div className="tline">
            <article className="tl tl--live rv" data-d="1">
              <span className="tl__dot" />
              <div className="tl__meta"><span className="tl__when">Now</span><span className="tl__chip">In progress</span></div>
              <h3 className="tl__title">BS Computational Mathematics in AI</h3>
              <p className="tl__org">Lahore Garrison University</p>
              <p className="tl__text">The mathematics underneath machine learning — linear algebra, optimisation and modelling, with the proofs left in rather than abstracted away.</p>
            </article>
            <article className="tl tl--done rv" data-d="2">
              <span className="tl__dot" />
              <div className="tl__meta"><span className="tl__when">Certification</span><span className="tl__chip">Completed</span></div>
              <h3 className="tl__title">Full-Stack Web Development</h3>
              <p className="tl__org">Arfa Kareem Tower</p>
              <p className="tl__text">Applied training across the stack: building interfaces, wiring up services and shipping the result to a live URL.</p>
            </article>
            <article className="tl tl--done rv" data-d="3">
              <span className="tl__dot" />
              <div className="tl__meta"><span className="tl__when">Alongside</span><span className="tl__chip">Delegate</span></div>
              <h3 className="tl__title">Model United Nations</h3>
              <p className="tl__org">Multiple conferences</p>
              <p className="tl__text">Research, position papers and live debate — the habit of defending a decision with evidence, quickly and in public.</p>
            </article>
          </div>
        </div>
      </section>

      {/* ========= RECOGNITION ========= */}
      <section className="sec" id="recognition">
        <div className="wrap award">
          <div className="awardframe rv" ref={awardRef}>
            <div className="awardframe__in" ref={awardInRef}>
              <div className="awardglow" aria-hidden="true" />
              <div className="awardphoto" role="img" aria-label="Syeda Aiman Raza holding the INTRAMUN '25 Outstanding Diplomat award" />
              <span className="awardplate">INTRAMUN&nbsp;'25 · Outstanding Diplomacy</span>
            </div>
          </div>
          <div className="rv" data-d="1">
            <p className="clause">§ Recognition</p>
            <h2 className="h2">The bloc that <em>held the room</em>.</h2>
            <p className="hook">Diplomacy is engineering with people instead of code.</p>
            <p style={{ marginTop: "1.4rem", color: "var(--ink-soft)", maxWidth: "52ch" }}>Her bloc took the award for outstanding diplomacy at INTRAMUN&nbsp;'25 — the product of a conference spent writing position papers, building coalitions in caucus, and defending a line under cross-examination without losing the room.</p>
            <div className="sphere__wrap">
              <div className="sphere" aria-hidden="true"><b /><b /><b /><b /><b /><b /><b /><b /><b /></div>
              <span className="sphere__cap"><b>Multiple conferences</b>Research · Caucus · Debate</span>
            </div>
          </div>
        </div>
      </section>

      {/* ========= CONNECT ========= */}
      <section className="sec sec--tint" id="connect">
        <div className="wrap">
          <div className="rv">
            <p className="clause">§ Connect</p>
            <h2 className="h2">The work, and the <em>record</em> of it.</h2>
            <p className="hook">Both open in a new tab.</p>
          </div>
          <div className="links">
            <a className="link rv" data-d="1" href="https://github.com/syedaaimanali77-cyber" target="_blank" rel="noopener noreferrer">
              <span className="link__ico"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 .5A11.5 11.5 0 0 0 .5 12a11.5 11.5 0 0 0 7.86 10.92c.58.1.79-.25.79-.56v-2.2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.2 1.77 1.2 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.56-.29-5.25-1.28-5.25-5.7 0-1.26.45-2.29 1.2-3.1-.12-.29-.52-1.46.11-3.05 0 0 .98-.31 3.2 1.18a11.1 11.1 0 0 1 5.82 0c2.22-1.49 3.2-1.18 3.2-1.18.63 1.59.23 2.76.11 3.05.75.81 1.2 1.84 1.2 3.1 0 4.43-2.7 5.4-5.27 5.69.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12 11.5 11.5 0 0 0 12 .5z"/></svg></span>
              <span><span className="link__label">GitHub</span><span className="link__val">syedaaimanali77-cyber</span></span>
              <svg className="link__arrow" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M7 17L17 7M8 7h9v9"/></svg>
            </a>
            <a className="link rv" data-d="2" href="https://www.linkedin.com/in/syeda-aiman-56a4a6387" target="_blank" rel="noopener noreferrer">
              <span className="link__ico"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.55V9h3.57v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.55C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.72C24 .77 23.2 0 22.22 0z"/></svg></span>
              <span><span className="link__label">LinkedIn</span><span className="link__val">Syeda Aiman Raza</span></span>
              <svg className="link__arrow" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M7 17L17 7M8 7h9v9"/></svg>
            </a>
            <a className="link rv" data-d="3" href="mailto:syedaaimanali77@gmail.com">
              <span className="link__ico"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 4.24-8 4.99-8-4.99V6l8 5 8-5v2.24z"/></svg></span>
              <span><span className="link__label">Email</span><span className="link__val">syedaaimanali77@gmail.com</span></span>
              <svg className="link__arrow" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M7 17L17 7M8 7h9v9"/></svg>
            </a>
          </div>
        </div>
      </section>

      {/* ========= CONTACT ========= */}
      <section className="sec" id="contact">
        <div className="wrap contact">
          <div className="rv">
            <p className="clause">§ Contact</p>
            <h2 className="h2">Tell me what you're <em>building</em>.</h2>
            <p className="hook">Internships, freelance work, or a problem worth solving.</p>
            <div className="direct">
              <a href="mailto:syedaaimanali77@gmail.com">
                <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="2.5" y="4.5" width="19" height="15" rx="2"/><path d="M3 6l9 6 9-6"/></svg>
                syedaaimanali77@gmail.com
              </a>
            </div>
          </div>
          <form className="form rv" data-d="1" onSubmit={onSubmit} noValidate>
      <div className={`fld${errors.name ? " has-error" : ""}`}>
        <label htmlFor="name">Your name</label>
        <input
          type="text"
          id="name"
          name="name"
          placeholder="Who's writing?"
          autoComplete="name"
          value={form.name}
          onChange={onField("name")}
        />
        <span className="fld__err">
          Add your name so I know who I&apos;m replying to.
        </span>
      </div>
      <div className={`fld${errors.email ? " has-error" : ""}`}>
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          name="email"
          placeholder="you@example.com"
          autoComplete="email"
          value={form.email}
          onChange={onField("email")}
        />
        <span className="fld__err">
          Check the email address — it doesn&apos;t look complete.
        </span>
      </div>
      <div className={`fld${errors.message ? " has-error" : ""}`}>
        <label htmlFor="message">Message</label>
        <textarea
          id="message"
          name="message"
          placeholder="A sentence about the project, timeline and what you need."
          value={form.message}
          onChange={onField("message")}
        />
        <span className="fld__err">Add a short message before sending.</span>
      </div>
      <div className="form__foot">
        <button type="submit" className="btn btn--primary">
          Open in mail app
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </button>
        <p className="form__note">
          Your mail app opens with the message ready — nothing is stored on this
          page.
        </p>
      </div>
      <p className="form__status" role="status" aria-live="polite">
        {status}
      </p>
    </form>
        </div>
      </section>
      </main>

      {/* ========= FOOTER ========= */}
      <footer className="footer">
        <div className="wrap footer__in">
          <p className="footer__note">© <span>{year}</span> Syeda Aiman Raza — designed and built in Lahore.</p>
          <ul className="footer__social">
            <li><a href="https://github.com/syedaaimanali77-cyber" target="_blank" rel="noopener noreferrer" aria-label="GitHub"><svg viewBox="0 0 24 24"><path d="M12 .5A11.5 11.5 0 0 0 .5 12a11.5 11.5 0 0 0 7.86 10.92c.58.1.79-.25.79-.56v-2.2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.2 1.77 1.2 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.56-.29-5.25-1.28-5.25-5.7 0-1.26.45-2.29 1.2-3.1-.12-.29-.52-1.46.11-3.05 0 0 .98-.31 3.2 1.18a11.1 11.1 0 0 1 5.82 0c2.22-1.49 3.2-1.18 3.2-1.18.63 1.59.23 2.76.11 3.05.75.81 1.2 1.84 1.2 3.1 0 4.43-2.7 5.4-5.27 5.69.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12 11.5 11.5 0 0 0 12 .5z"/></svg></a></li>
            <li><a href="https://www.linkedin.com/in/syeda-aiman-56a4a6387" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><svg viewBox="0 0 24 24"><path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.55V9h3.57v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.55C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.72C24 .77 23.2 0 22.22 0z"/></svg></a></li>
            <li><a href="mailto:syedaaimanali77@gmail.com" aria-label="Email"><svg viewBox="0 0 24 24"><path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 4.24-8 4.99-8-4.99V6l8 5 8-5v2.24z"/></svg></a></li>
          </ul>
          <a className="top" href="#top">Back to top ↑</a>
        </div>
      </footer>
    </>
  );
}
