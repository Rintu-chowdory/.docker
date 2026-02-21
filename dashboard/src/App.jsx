import { useState, useEffect, useRef, useCallback } from "react";

// ── Particle Canvas ──────────────────────────────────────────────────────────
function ParticleCanvas() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animId;
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const particles = Array.from({ length: 120 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      size: Math.random() * 1.5 + 0.5,
      opacity: Math.random() * 0.5 + 0.1,
      color: Math.random() > 0.6 ? "#00ff88" : Math.random() > 0.5 ? "#00ccff" : "#ff0055",
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color + Math.floor(p.opacity * 255).toString(16).padStart(2, "0");
        ctx.fill();

        particles.slice(i + 1).forEach((p2) => {
          const dx = p.x - p2.x, dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(0,255,136,${0.08 * (1 - dist / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }} />;
}

// ── Terminal Component ───────────────────────────────────────────────────────
function Terminal() {
  const [lines, setLines] = useState([]);
  const [input, setInput] = useState("");
  const [cursor, setCursor] = useState(true);
  const endRef = useRef(null);

  const bootSequence = [
    { text: "KALI DEV ENVIRONMENT v2.0 — INITIALIZING...", delay: 0, color: "#00ff88" },
    { text: "► Loading kernel modules...", delay: 300, color: "#888" },
    { text: "► Mounting filesystems...", delay: 600, color: "#888" },
    { text: "► Starting network interfaces...", delay: 900, color: "#888" },
    { text: "✔ Node.js LTS .............. LOADED", delay: 1200, color: "#00ccff" },
    { text: "✔ Python 3 ................. LOADED", delay: 1500, color: "#00ccff" },
    { text: "✔ Git + GitHub CLI ......... LOADED", delay: 1800, color: "#00ccff" },
    { text: "✔ Docker Engine ............ LOADED", delay: 2100, color: "#00ccff" },
    { text: "✔ curl / wget / jq ......... LOADED", delay: 2400, color: "#00ccff" },
    { text: "✔ CI/CD Pipeline ........... ACTIVE", delay: 2700, color: "#00ff88" },
    { text: "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", delay: 3000, color: "#333" },
    { text: "Welcome, rintu. Type 'help' for available commands.", delay: 3300, color: "#fff" },
  ];

  useEffect(() => {
    bootSequence.forEach(({ text, delay, color }) => {
      setTimeout(() => setLines(prev => [...prev, { text, color }]), delay);
    });
    const blink = setInterval(() => setCursor(c => !c), 500);
    return () => clearInterval(blink);
  }, []);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [lines]);

  const commands = {
    help: () => [
      { text: "Available commands:", color: "#00ff88" },
      { text: "  whoami    — show user info", color: "#aaa" },
      { text: "  tools     — list installed tools", color: "#aaa" },
      { text: "  docker    — show docker status", color: "#aaa" },
      { text: "  clear     — clear terminal", color: "#aaa" },
    ],
    whoami: () => [
      { text: "User    : rintu", color: "#00ccff" },
      { text: "Host    : kali", color: "#00ccff" },
      { text: "Image   : riinnttuu/dev-env:latest", color: "#00ccff" },
      { text: "Shell   : bash 5.2.x", color: "#00ccff" },
    ],
    tools: () => [
      { text: "Node.js · Python3 · Git · gh · curl · wget · jq", color: "#00ff88" },
      { text: "nodemon · typescript · ts-node · prettier", color: "#aaa" },
      { text: "ipython · black · ruff · httpx · requests", color: "#aaa" },
    ],
    docker: () => [
      { text: "IMAGE   : riinnttuu/dev-env:latest", color: "#00ff88" },
      { text: "SIZE    : 1.12 GB", color: "#aaa" },
      { text: "BASE    : kalilinux/kali-rolling", color: "#aaa" },
      { text: "STATUS  : pushed to Docker Hub ✔", color: "#00ff88" },
    ],
    clear: () => { setLines([]); return []; },
  };

  const handleKey = (e) => {
    if (e.key === "Enter") {
      const cmd = input.trim().toLowerCase();
      const out = commands[cmd] ? commands[cmd]() : cmd ? [{ text: `command not found: ${cmd}`, color: "#ff0055" }] : [];
      setLines(prev => [...prev, { text: `┌──(rintu㉿kali)-[~]`, color: "#00ff88" }, { text: `└─$ ${input}`, color: "#fff" }, ...out]);
      setInput("");
    }
  };

  return (
    <div style={{
      background: "rgba(0,0,0,0.75)", backdropFilter: "blur(12px)",
      border: "1px solid rgba(0,255,136,0.2)", borderRadius: 12,
      fontFamily: "'JetBrains Mono', 'Fira Code', monospace", fontSize: 12,
      height: 320, display: "flex", flexDirection: "column", overflow: "hidden",
      boxShadow: "0 0 40px rgba(0,255,136,0.05)",
    }}>
      {/* Title bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", borderBottom: "1px solid rgba(0,255,136,0.1)", background: "rgba(0,255,136,0.03)" }}>
        {["#ff5f57", "#ffbd2e", "#28ca41"].map((c, i) => (
          <div key={i} style={{ width: 12, height: 12, borderRadius: "50%", background: c }} />
        ))}
        <span style={{ color: "#555", marginLeft: 8, fontSize: 11 }}>bash — rintu@kali:~</span>
      </div>
      {/* Output */}
      <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px" }}>
        {lines.map((l, i) => (
          <div key={i} style={{ color: l.color, lineHeight: 1.6, whiteSpace: "pre" }}>{l.text}</div>
        ))}
        <div ref={endRef} />
      </div>
      {/* Input */}
      <div style={{ display: "flex", padding: "8px 16px", borderTop: "1px solid rgba(0,255,136,0.1)", alignItems: "center", gap: 8 }}>
        <span style={{ color: "#00ff88", fontSize: 11 }}>┌──(rintu㉿kali)-[~]<br />└─$</span>
        <input
          value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKey}
          style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "#fff", fontFamily: "inherit", fontSize: 12 }}
          autoFocus
        />
        <span style={{ color: "#00ff88", opacity: cursor ? 1 : 0 }}>█</span>
      </div>
    </div>
  );
}

// ── Glowing Stat Card ────────────────────────────────────────────────────────
function StatCard({ icon, label, value, color = "#00ff88", sub }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? `rgba(${color === "#00ff88" ? "0,255,136" : color === "#00ccff" ? "0,204,255" : "255,0,85"},0.08)` : "rgba(0,0,0,0.5)",
        backdropFilter: "blur(16px)", border: `1px solid ${hovered ? color : "rgba(255,255,255,0.06)"}`,
        borderRadius: 12, padding: "20px 24px", transition: "all 0.3s ease",
        boxShadow: hovered ? `0 0 30px ${color}22` : "none", cursor: "default",
      }}>
      <div style={{ fontSize: 24, marginBottom: 8 }}>{icon}</div>
      <div style={{ color: "#555", fontSize: 11, letterSpacing: 2, textTransform: "uppercase", marginBottom: 4 }}>{label}</div>
      <div style={{ color, fontSize: 22, fontWeight: 700, fontFamily: "monospace" }}>{value}</div>
      {sub && <div style={{ color: "#444", fontSize: 11, marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

// ── Docker Layer Viz ─────────────────────────────────────────────────────────
function DockerLayers() {
  const layers = [
    { name: "kalilinux/kali-rolling", size: "52MB", color: "#ff0055" },
    { name: "apt packages + build tools", size: "380MB", color: "#ff6600" },
    { name: "Node.js LTS", size: "120MB", color: "#00ccff" },
    { name: "GitHub CLI", size: "45MB", color: "#9900ff" },
    { name: "npm global packages", size: "85MB", color: "#00ff88" },
    { name: "Python packages", size: "210MB", color: "#ffcc00" },
    { name: "user + bash config", size: "2MB", color: "#00ff88" },
  ];
  const [active, setActive] = useState(null);
  return (
    <div style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: 24 }}>
      <div style={{ color: "#00ff88", fontSize: 11, letterSpacing: 3, textTransform: "uppercase", marginBottom: 20 }}>Docker Image Layers</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {layers.map((l, i) => (
          <div key={i} onMouseEnter={() => setActive(i)} onMouseLeave={() => setActive(null)}
            style={{
              display: "flex", alignItems: "center", gap: 12, padding: "10px 14px",
              background: active === i ? `${l.color}11` : "rgba(255,255,255,0.02)",
              border: `1px solid ${active === i ? l.color + "44" : "transparent"}`,
              borderRadius: 8, cursor: "default", transition: "all 0.2s",
            }}>
            <div style={{ width: 3, height: 32, background: l.color, borderRadius: 2, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ color: "#ddd", fontSize: 12, fontFamily: "monospace" }}>LAYER {i}</div>
              <div style={{ color: "#555", fontSize: 11 }}>{l.name}</div>
            </div>
            <div style={{ color: l.color, fontSize: 12, fontFamily: "monospace" }}>{l.size}</div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 16, padding: "10px 14px", background: "rgba(0,255,136,0.05)", borderRadius: 8, border: "1px solid rgba(0,255,136,0.15)", display: "flex", justifyContent: "space-between" }}>
        <span style={{ color: "#555", fontSize: 11 }}>TOTAL SIZE</span>
        <span style={{ color: "#00ff88", fontFamily: "monospace", fontSize: 13, fontWeight: 700 }}>1.12 GB</span>
      </div>
    </div>
  );
}

// ── CI/CD Pipeline Viz ───────────────────────────────────────────────────────
function CIPipeline() {
  const steps = [
    { name: "Checkout", icon: "⬇️", status: "done" },
    { name: "Login", icon: "🔑", status: "done" },
    { name: "Buildx", icon: "🔧", status: "done" },
    { name: "Build & Push", icon: "🚀", status: "done" },
    { name: "Done", icon: "✅", status: "done" },
  ];
  return (
    <div style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: 24 }}>
      <div style={{ color: "#00ff88", fontSize: 11, letterSpacing: 3, textTransform: "uppercase", marginBottom: 20 }}>GitHub Actions CI/CD</div>
      <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
        {steps.map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", flex: 1 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, flex: 1 }}>
              <div style={{
                width: 44, height: 44, borderRadius: "50%",
                background: "rgba(0,255,136,0.1)", border: "2px solid #00ff88",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 18, boxShadow: "0 0 20px rgba(0,255,136,0.3)",
                animation: "pulse 2s infinite",
              }}>{s.icon}</div>
              <div style={{ color: "#555", fontSize: 10, textAlign: "center", whiteSpace: "nowrap" }}>{s.name}</div>
            </div>
            {i < steps.length - 1 && (
              <div style={{ height: 2, flex: 0.5, background: "linear-gradient(90deg, #00ff88, #00ccff)", marginBottom: 18, borderRadius: 2 }} />
            )}
          </div>
        ))}
      </div>
      <div style={{ marginTop: 20, padding: "10px 14px", background: "rgba(0,255,136,0.05)", borderRadius: 8, border: "1px solid rgba(0,255,136,0.15)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ color: "#555", fontSize: 11 }}>LAST RUN</span>
        <span style={{ color: "#00ff88", fontSize: 11 }}>✔ Pushed to riinnttuu/dev-env:latest</span>
      </div>
    </div>
  );
}

// ── Scanline Overlay ─────────────────────────────────────────────────────────
function Scanlines() {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1, pointerEvents: "none",
      backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)",
    }} />
  );
}

// ── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("dashboard");
  const [glitch, setGlitch] = useState(false);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    const g = setInterval(() => { setGlitch(true); setTimeout(() => setGlitch(false), 150); }, 8000);
    return () => { clearInterval(t); clearInterval(g); };
  }, []);

  const tabs = [
    { id: "dashboard", label: "Dashboard" },
    { id: "terminal", label: "Terminal" },
    { id: "docker", label: "Docker" },
    { id: "pipeline", label: "CI/CD" },
  ];

  return (
    <div style={{
      minHeight: "100vh", background: "#050505",
      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
      color: "#fff", position: "relative", overflow: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #0a0a0a; }
        ::-webkit-scrollbar-thumb { background: #00ff8844; border-radius: 2px; }
        @keyframes pulse { 0%,100% { box-shadow: 0 0 20px rgba(0,255,136,0.3); } 50% { box-shadow: 0 0 35px rgba(0,255,136,0.6); } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        @keyframes glitch {
          0% { transform: translate(0); }
          20% { transform: translate(-2px, 1px); clip-path: inset(10% 0 80% 0); }
          40% { transform: translate(2px, -1px); clip-path: inset(60% 0 20% 0); }
          60% { transform: translate(-1px, 2px); clip-path: inset(30% 0 50% 0); }
          80% { transform: translate(1px, -2px); clip-path: inset(80% 0 5% 0); }
          100% { transform: translate(0); clip-path: none; }
        }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        .tab { transition: all 0.2s ease; cursor: pointer; }
        .tab:hover { color: #00ff88 !important; }
      `}</style>

      <ParticleCanvas />
      <Scanlines />

      <div style={{ position: "relative", zIndex: 2, maxWidth: 1100, margin: "0 auto", padding: "0 24px 60px" }}>

        {/* Header */}
        <div style={{ padding: "32px 0 24px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{
              fontSize: 32, fontWeight: 700, letterSpacing: -1,
              animation: glitch ? "glitch 0.15s linear" : "none",
              color: "#fff",
            }}>
              <span style={{ color: "#00ff88" }}>rintu</span>
              <span style={{ color: "#333" }}>@</span>
              <span style={{ color: "#00ccff" }}>kali</span>
              <span style={{ color: "#333" }}>:~</span>
              <span style={{ color: "#00ff88", animation: "blink 1s infinite" }}>█</span>
            </div>
            <div style={{ color: "#333", fontSize: 11, letterSpacing: 3, marginTop: 4 }}>PERSONAL DEV ENVIRONMENT · DOCKER HUB · GITHUB ACTIONS</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ color: "#00ff88", fontSize: 13, fontFamily: "monospace" }}>
              {time.toLocaleTimeString("en-GB")}
            </div>
            <div style={{ color: "#333", fontSize: 10, marginTop: 2 }}>
              {time.toLocaleDateString("en-GB", { weekday: "short", day: "2-digit", month: "short", year: "numeric" })}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: 32, borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: 0 }}>
          {tabs.map(t => (
            <button key={t.id} className="tab" onClick={() => setTab(t.id)}
              style={{
                background: "none", border: "none", color: tab === t.id ? "#00ff88" : "#444",
                fontSize: 12, letterSpacing: 1, padding: "10px 20px", cursor: "pointer",
                borderBottom: tab === t.id ? "2px solid #00ff88" : "2px solid transparent",
                fontFamily: "inherit", textTransform: "uppercase",
              }}>{t.label}</button>
          ))}
        </div>

        {/* Dashboard Tab */}
        {tab === "dashboard" && (
          <div style={{ animation: "fadeIn 0.4s ease" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
              <StatCard icon="🐳" label="Docker Image" value="1.12 GB" color="#00ccff" sub="riinnttuu/dev-env" />
              <StatCard icon="⚡" label="Node.js" value="LTS" color="#00ff88" sub="via NodeSource" />
              <StatCard icon="🐍" label="Python" value="3.x" color="#ffcc00" sub="+ pip tools" />
              <StatCard icon="🔁" label="CI/CD" value="Active" color="#00ff88" sub="GitHub Actions" />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: 24 }}>
                <div style={{ color: "#00ff88", fontSize: 11, letterSpacing: 3, textTransform: "uppercase", marginBottom: 16 }}>Quick Start</div>
                {[
                  "docker pull riinnttuu/dev-env:latest",
                  "docker run -it --rm \\",
                  "  -v $(pwd):/home/kalidev/workspace \\",
                  "  riinnttuu/dev-env:latest",
                ].map((line, i) => (
                  <div key={i} style={{ color: i === 0 ? "#00ccff" : "#666", fontSize: 12, fontFamily: "monospace", lineHeight: 2 }}>{line}</div>
                ))}
              </div>
              <div style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: 24 }}>
                <div style={{ color: "#00ff88", fontSize: 11, letterSpacing: 3, textTransform: "uppercase", marginBottom: 16 }}>Installed Tools</div>
                {[
                  ["git + gh CLI", "#00ff88"],
                  ["curl · wget · jq", "#00ccff"],
                  ["nodemon · typescript · prettier", "#9900ff"],
                  ["ipython · black · ruff", "#ffcc00"],
                  ["httpx · requests", "#ff6600"],
                ].map(([tool, color], i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: color, boxShadow: `0 0 8px ${color}` }} />
                    <span style={{ color: "#aaa", fontSize: 12 }}>{tool}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Terminal Tab */}
        {tab === "terminal" && (
          <div style={{ animation: "fadeIn 0.4s ease" }}>
            <Terminal />
            <div style={{ marginTop: 12, color: "#333", fontSize: 11, textAlign: "center" }}>
              Type <span style={{ color: "#00ff88" }}>help</span> to see available commands
            </div>
          </div>
        )}

        {/* Docker Tab */}
        {tab === "docker" && (
          <div style={{ animation: "fadeIn 0.4s ease" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 24 }}>
              <StatCard icon="📦" label="Base Image" value="kali-rolling" color="#ff0055" />
              <StatCard icon="🏷️" label="Tag" value="latest" color="#00ff88" sub="+ git sha tags" />
              <StatCard icon="☁️" label="Registry" value="Docker Hub" color="#00ccff" sub="riinnttuu" />
            </div>
            <DockerLayers />
          </div>
        )}

        {/* CI/CD Tab */}
        {tab === "pipeline" && (
          <div style={{ animation: "fadeIn 0.4s ease" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 24 }}>
              <StatCard icon="🔁" label="Trigger" value="git push" color="#00ff88" sub="on: push to main" />
              <StatCard icon="🏃" label="Runner" value="ubuntu-latest" color="#00ccff" />
              <StatCard icon="⏱️" label="Build Time" value="~155s" color="#ffcc00" sub="with layer cache" />
            </div>
            <CIPipeline />
          </div>
        )}

      </div>
    </div>
  );
}
