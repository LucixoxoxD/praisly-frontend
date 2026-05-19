import { useState, useEffect, useRef, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Cell,
  ResponsiveContainer, AreaChart, Area,
} from 'recharts'
import api, { authService } from '../services/api'
import { stripMarkdown } from '../utils/helpers'

// ─── Helpers ────────────────────────────────────────────────────────────────

function cleanText(text) {
  if (!text) return ''
  let t = stripMarkdown(text)
  while ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) {
    t = t.slice(1, -1).trim()
  }
  return t.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1')
}

function fmtIN(n) {
  return new Intl.NumberFormat('en-IN').format(Math.floor(n || 0))
}

function ratingBorder(r) {
  if (r >= 4) return 'var(--win)'
  if (r === 3) return '#f59e0b'
  return '#ef4444'
}

function fmtChartDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
}

function buildGrowthChartData(series) {
  if (!series?.length) return []
  const dateMap = {}
  series.forEach(s => {
    s.data.forEach(pt => {
      if (!dateMap[pt.date]) dateMap[pt.date] = { _date: pt.date }
      dateMap[pt.date][s.name] = pt.count
    })
  })
  return Object.values(dateMap).sort((a, b) => a._date.localeCompare(b._date))
}

function getInitials(name) {
  if (!name) return '?'
  const words = name.trim().split(/\s+/)
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

const AVATAR_GRADS = [
  'linear-gradient(135deg,#EFC659,#C9971F)',
  'linear-gradient(135deg,#C8CDD3,#8E97A2)',
  'linear-gradient(135deg,#DA9263,#B26A3C)',
  'linear-gradient(135deg,#5b6ee8,#3950b8)',
  'linear-gradient(135deg,#2a8c5e,#1a6843)',
  'linear-gradient(135deg,#c84b8f,#9b1d6e)',
]

const CONF_COLORS = ['#D89020', '#f59e0b', '#3b82f6', '#8b5cf6', '#ef4444', '#ec4899']

// ─── CSS ────────────────────────────────────────────────────────────────────

const PAGE_CSS = `
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: none; }
  }
  @keyframes slideIn {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: none; }
  }
  @keyframes skelpulse { 0%,100% { opacity: 1; } 50% { opacity: 0.45; } }
  @keyframes confettiFall {
    0%   { transform: translateY(-10px) rotateZ(0deg); opacity: 1; }
    100% { transform: translateY(110vh) rotateZ(720deg); opacity: 0; }
  }
  @keyframes milestoneIn {
    from { opacity: 0; transform: translate(-50%,-50%) scale(0.85); }
    to   { opacity: 1; transform: translate(-50%,-50%) scale(1); }
  }
  @keyframes overlayIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes livePulse {
    0%   { box-shadow: 0 0 0 0 rgba(31,138,91,.5); }
    70%  { box-shadow: 0 0 0 8px rgba(31,138,91,0); }
    100% { box-shadow: 0 0 0 0 rgba(31,138,91,0); }
  }

  /* ── Shared card ── */
  .d-card {
    background: var(--surface);
    border-radius: 16px;
    border: 1px solid var(--line);
    transition: box-shadow 0.2s ease;
  }
  .d-card:hover { box-shadow: 0 6px 24px rgba(0,0,0,0.07); }

  /* ── Legacy helpers (charts, reviews) ── */
  .d-hero-num { font-size: 36px; font-weight: 800; color: var(--ink); line-height: 1; }
  .d-label    { font-size: 13px; font-weight: 500; color: var(--ink-3); margin: 0 0 8px; }
  .d-sub      { font-size: 12px; color: var(--ink-4); margin: 6px 0 0; }
  .d-badge { display: inline-flex; align-items: center; gap: 3px; padding: 3px 9px; border-radius: 20px; font-size: 11px; font-weight: 700; }
  .d-badge-green  { background: var(--win-soft);  color: var(--win); }
  .d-badge-amber  { background: #fef3c7; color: #92400e; }
  .d-badge-gray   { background: #f1f5f9; color: #475569; }

  /* CompetitorModal search */
  .search-result {
    padding: 12px 14px; border-radius: 10px;
    border: 1px solid var(--line); margin-bottom: 8px;
    cursor: pointer; transition: background 0.15s, border-color 0.15s;
    background: var(--surface);
  }
  .search-result:hover { background: var(--primary-soft); border-color: var(--primary); }

  /* Recent review cards */
  .review-card {
    background: var(--surface); border-radius: 12px;
    padding: 16px; border: 1px solid var(--line);
    margin-bottom: 10px; transition: box-shadow 0.2s;
  }
  .review-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.07); }

  /* ── Greeting ── */
  .d-greeting {
    display: flex; align-items: flex-end;
    justify-content: space-between; gap: 16px;
  }
  .d-greeting h1 {
    font-size: 26px; font-weight: 700; letter-spacing: -0.02em;
    margin: 0; color: var(--ink);
  }
  .d-greeting p { margin: 5px 0 0; font-size: 14px; color: var(--ink-3); line-height: 1.5; }
  .d-time-pill {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 7px 14px; background: var(--surface);
    border: 1px solid var(--line); border-radius: 999px;
    font-size: 12.5px; color: var(--ink-2); font-weight: 500;
    white-space: nowrap; flex-shrink: 0;
  }
  .d-live {
    width: 6px; height: 6px; border-radius: 50%;
    background: var(--win); animation: livePulse 2s infinite;
  }

  /* ── Hero rank card ── */
  .d-hero {
    background: var(--surface); border-radius: 20px;
    border: 1px solid var(--line); padding: 32px 36px;
    display: grid; grid-template-columns: 1.05fr 1fr;
    gap: 28px; align-items: center; position: relative; overflow: hidden;
  }
  .d-hero::before {
    content: ""; position: absolute; inset: 0;
    background:
      radial-gradient(80% 60% at 0% 100%, rgba(216,144,32,0.08), transparent 60%),
      radial-gradient(60% 80% at 100% 0%, rgba(245,185,69,0.06), transparent 60%);
    pointer-events: none;
  }
  .d-hero-content { position: relative; }
  .d-hero-eyebrow {
    display: inline-flex; align-items: center; gap: 8px;
    font-size: 11px; font-weight: 700; letter-spacing: 0.12em;
    text-transform: uppercase; color: var(--bronze); margin-bottom: 14px;
  }
  .d-dot-spark { width: 6px; height: 6px; border-radius: 50%; background: var(--primary); }
  .d-rank-row { display: flex; align-items: flex-start; gap: 16px; margin-bottom: 18px; }
  .d-rank-num {
    font-weight: 800; font-size: 100px; line-height: 0.85;
    letter-spacing: -0.06em; color: var(--ink);
    display: inline-flex; align-items: flex-start; flex-shrink: 0;
  }
  .d-hash { font-size: 40px; color: var(--bronze); margin-right: 2px; margin-top: 8px; font-weight: 700; }
  .d-rank-context {
    font-size: 18px; font-weight: 600; letter-spacing: -0.01em;
    color: var(--ink); line-height: 1.3; max-width: 300px;
  }
  .d-rank-sub { color: var(--ink-3); font-size: 12px; margin-top: 6px; }
  .d-momentum-row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
  .d-momentum-badge {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 6px 13px; background: var(--win-soft); color: var(--win);
    border-radius: 999px; font-size: 12.5px; font-weight: 700;
  }
  .d-streak-badge {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 6px 13px; background: var(--primary-soft); color: var(--primary-ink);
    border-radius: 999px; font-size: 12.5px; font-weight: 700;
  }

  /* ── Podium card ── */
  .d-podium-card {
    position: relative;
    background: linear-gradient(180deg, var(--surface-tint), var(--surface));
    border: 1px solid var(--line); border-radius: 14px; padding: 20px 22px;
    display: flex; flex-direction: column; gap: 16px;
  }
  .d-podium-head {
    display: flex; justify-content: space-between; align-items: center;
    font-size: 11px; color: var(--ink-3); font-weight: 700;
    letter-spacing: 0.08em; text-transform: uppercase;
  }
  .d-target-pill {
    background: var(--ink); color: white; padding: 4px 10px;
    border-radius: 999px; font-size: 11px; letter-spacing: 0; text-transform: none;
  }
  .d-podium {
    display: grid; grid-template-columns: 1fr 1fr 1fr;
    align-items: end; gap: 8px; height: 148px;
  }
  .d-pod { display: flex; flex-direction: column; align-items: center; gap: 5px; text-align: center; }
  .d-pod-name {
    font-size: 10.5px; font-weight: 600; color: var(--ink-2); line-height: 1.2;
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 100%;
  }
  .d-pod-rev { font-size: 9.5px; color: var(--ink-3); }
  .d-pod-block {
    width: 100%; border-radius: 8px 8px 0 0;
    display: flex; align-items: flex-start; justify-content: center;
    padding-top: 8px; font-weight: 800; font-size: 20px; color: white;
    position: relative;
  }
  .d-pod-1 .d-pod-block { background: linear-gradient(180deg,#EFC659,#C9971F); height: 100%; box-shadow: inset 0 2px 0 rgba(255,255,255,.3); }
  .d-pod-2 .d-pod-block { background: linear-gradient(180deg,#C8CDD3,#9098A3); height: 76%; box-shadow: inset 0 2px 0 rgba(255,255,255,.3); }
  .d-pod-3 .d-pod-block { background: linear-gradient(180deg,#DA9263,#B26A3C); height: 58%; box-shadow: inset 0 2px 0 rgba(255,255,255,.3); }
  .d-you .d-pod-block::after {
    content: "YOU";
    position: absolute; top: -22px; left: 50%; transform: translateX(-50%);
    background: var(--ink); color: white; font-size: 9px; font-weight: 800;
    letter-spacing: 0.1em; padding: 3px 7px; border-radius: 999px;
  }
  .d-you .d-pod-name { color: var(--ink); font-weight: 700; }

  .d-chase-line {
    display: flex; align-items: center; gap: 10px;
    padding: 11px 14px; background: var(--ink); color: white;
    border-radius: 12px; font-size: 13px;
  }
  .d-target-icon {
    width: 28px; height: 28px; border-radius: 8px; background: var(--primary);
    display: grid; place-items: center; flex-shrink: 0; font-size: 14px;
  }
  .d-gap-num { font-weight: 800; font-size: 17px; color: var(--primary); margin-right: 2px; }
  .d-chase-cta {
    margin-left: auto; background: var(--primary); color: white; border: 0;
    padding: 7px 13px; border-radius: 8px; font-size: 12px; font-weight: 700;
    white-space: nowrap; cursor: pointer; font-family: inherit;
  }
  .d-chase-cta:hover { opacity: 0.85; }

  /* ── Stat cards ── */
  .d-stats { display: grid; grid-template-columns: repeat(3,1fr); gap: 14px; }
  .d-stat {
    background: var(--surface); border: 1px solid var(--line);
    border-radius: 14px; padding: 18px 20px;
    display: grid; grid-template-columns: 1fr auto;
    grid-template-rows: auto auto 1fr;
    column-gap: 8px; row-gap: 6px;
    min-height: 148px; position: relative; overflow: hidden;
    transition: transform .18s, box-shadow .18s;
  }
  .d-stat:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(0,0,0,0.07); }
  .d-stat-head { grid-column: 1/-1; display: flex; align-items: center; justify-content: space-between; gap: 8px; }
  .d-stat-row  { grid-column: 1/-1; display: flex; align-items: baseline; gap: 10px; }
  .d-stat-foot { grid-column: 1; align-self: end; font-size: 11.5px; color: var(--ink-3); display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
  .d-stat-foot strong { color: var(--ink-2); font-weight: 600; }
  .d-stat-spark { grid-column: 2; align-self: end; }
  .d-stat-label { font-size: 12.5px; color: var(--ink-3); font-weight: 600; }
  .d-stat-icon { width: 32px; height: 32px; border-radius: 9px; display: grid; place-items: center; font-size: 15px; }
  .d-stat-icon.coral { background: var(--primary-soft); }
  .d-stat-icon.gold  { background: var(--gold-soft); }
  .d-stat-icon.dark  { background: var(--surface-tint); }
  .d-stat-val {
    font-size: 40px; font-weight: 800; line-height: 1;
    letter-spacing: -0.03em; color: var(--ink); white-space: nowrap;
  }
  .d-stat-unit { font-size: 20px; color: var(--ink-3); font-weight: 600; margin-left: 2px; }
  .d-stat-delta {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 3px 9px; border-radius: 999px;
    background: var(--win-soft); color: var(--win);
    font-size: 11.5px; font-weight: 700;
  }
  .d-stars-row { display: flex; gap: 2px; align-items: center; }
  .d-spark { width: 84px; height: 34px; display: block; opacity: .9; }

  /* ── AI strip ── */
  .d-ai-strip {
    background: linear-gradient(135deg, var(--ink) 0%, #2A1F18 100%);
    color: white; border-radius: 14px; padding: 18px 22px;
    display: flex; align-items: center; gap: 16px;
    position: relative; overflow: hidden;
    border: 1px solid rgba(255,255,255,0.06);
  }
  .d-ai-strip::before {
    content: ""; position: absolute; inset: 0;
    background: radial-gradient(60% 100% at 100% 50%, rgba(216,144,32,0.15), transparent 60%);
    pointer-events: none;
  }
  .d-ai-icon {
    width: 44px; height: 44px; border-radius: 12px;
    background: linear-gradient(135deg,#E8B43A,#C9971F);
    display: grid; place-items: center; flex-shrink: 0;
    font-size: 22px; position: relative; z-index: 1;
    box-shadow: 0 6px 16px rgba(216,144,32,0.35);
  }
  .d-ai-content { flex: 1; min-width: 0; position: relative; z-index: 1; }
  .d-ai-eyebrow {
    font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase;
    color: var(--primary); font-weight: 700; margin-bottom: 4px;
  }
  .d-ai-title { font-size: 13.5px; font-weight: 500; line-height: 1.45; color: rgba(255,255,255,0.9); }
  .d-ai-title strong { color: white; font-weight: 700; }
  .d-ai-title em { font-style: normal; color: #F5B945; font-weight: 700; }
  .d-ai-cta {
    background: white; color: var(--ink); border: 0;
    padding: 9px 15px; border-radius: 9px; font-size: 12.5px; font-weight: 700;
    white-space: nowrap; cursor: pointer; font-family: inherit;
    position: relative; z-index: 1;
  }
  .d-ai-cta:hover { background: var(--primary-soft); color: var(--primary-ink); }
  .d-ai-dismiss {
    background: transparent; border: 0; color: rgba(255,255,255,.35);
    width: 28px; height: 28px; border-radius: 8px;
    display: grid; place-items: center; cursor: pointer;
    font-size: 20px; position: relative; z-index: 1; line-height: 1;
  }
  .d-ai-dismiss:hover { background: rgba(255,255,255,.08); color: white; }

  /* ── Leaderboard table card ── */
  .d-lb-card { background: var(--surface); border: 1px solid var(--line); border-radius: 14px; overflow: hidden; }
  .d-lb-head {
    display: flex; align-items: center; justify-content: space-between;
    padding: 16px 20px; border-bottom: 1px solid var(--line); gap: 12px; flex-wrap: wrap;
  }
  .d-lb-title { font-size: 16px; font-weight: 700; letter-spacing: -0.01em; display: flex; align-items: center; gap: 10px; }
  .d-lb-where {
    font-size: 12px; font-weight: 500; color: var(--ink-3);
    padding: 3px 9px; background: var(--surface-tint);
    border: 1px solid var(--line); border-radius: 999px; white-space: nowrap;
  }
  .d-lb-actions { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
  .d-btn-ghost {
    background: transparent; border: 1px solid var(--line); color: var(--ink-2);
    padding: 6px 12px; border-radius: 9px; font-size: 12.5px; font-weight: 600;
    cursor: pointer; font-family: inherit;
  }
  .d-btn-ghost:hover { background: var(--surface-tint); }
  .d-btn-primary {
    background: var(--primary); color: white; border: 0;
    padding: 7px 14px; border-radius: 9px; font-size: 12.5px; font-weight: 700;
    cursor: pointer; font-family: inherit; white-space: nowrap;
  }
  .d-btn-primary:hover { opacity: 0.88; }
  .d-lb-wrap { overflow-x: auto; }
  table.d-lb { width: 100%; border-collapse: collapse; font-size: 13.5px; min-width: 500px; }
  .d-lb thead th {
    text-align: left; font-size: 10.5px; letter-spacing: 0.08em;
    text-transform: uppercase; font-weight: 600; color: var(--ink-3);
    padding: 11px 16px; background: var(--surface-tint); border-bottom: 1px solid var(--line);
  }
  .d-lb thead th.num { text-align: right; }
  .d-lb tbody td { padding: 13px 16px; border-bottom: 1px solid var(--line); vertical-align: middle; }
  .d-lb tbody tr:last-child td { border-bottom: 0; }
  .d-lb tbody tr.d-you-row {
    background: linear-gradient(90deg, rgba(216,144,32,0.07), rgba(216,144,32,0.02));
  }
  .d-lb tbody tr.d-you-row td:first-child { box-shadow: inset 3px 0 0 var(--primary); }
  .d-lb tbody tr:hover:not(.d-you-row) { background: var(--surface-tint); }

  .d-rank-cell { display: flex; align-items: center; gap: 10px; }
  .d-rank-label { font-size: 10px; color: var(--ink-3); font-weight: 700; letter-spacing: .06em; }
  .d-lb-medal {
    width: 28px; height: 28px; border-radius: 50%;
    display: grid; place-items: center; font-weight: 800; font-size: 11px;
    color: white; border: 2px solid white; flex-shrink: 0;
    box-shadow: 0 2px 6px rgba(0,0,0,0.1);
  }
  .d-lb-medal.gm1 { background: linear-gradient(135deg,#EFC659,#C9971F); }
  .d-lb-medal.gm2 { background: linear-gradient(135deg,#C8CDD3,#8E97A2); }
  .d-lb-medal.gm3 { background: linear-gradient(135deg,#DA9263,#B26A3C); }
  .d-lb-medal.gm4 { background: var(--surface-tint); color: var(--ink-3); border: 1px solid var(--line); box-shadow: none; font-size: 10px; }
  .d-lb-medal.gm5 { background: var(--surface-tint); color: var(--ink-3); border: 1px solid var(--line); box-shadow: none; font-size: 10px; }

  .d-biz-cell { display: flex; align-items: center; gap: 11px; }
  .d-biz-avatar {
    width: 34px; height: 34px; border-radius: 10px;
    display: grid; place-items: center; font-weight: 700; font-size: 12px;
    color: white; flex-shrink: 0;
  }
  .d-biz-name { font-weight: 600; color: var(--ink); white-space: nowrap; }
  .d-biz-sub  { font-size: 11px; color: var(--ink-4); margin-top: 1px; }
  .d-you-pill {
    margin-left: 6px; background: var(--primary); color: white;
    font-size: 9.5px; font-weight: 800; letter-spacing: 0.06em;
    padding: 2px 7px; border-radius: 999px; vertical-align: middle;
  }
  .d-rating-cell { display: inline-flex; align-items: center; gap: 5px; justify-content: flex-end; font-weight: 700; }
  .d-num-cell { text-align: right; font-weight: 700; }
  .d-trend-cell { display: flex; align-items: center; gap: 10px; justify-content: flex-end; }
  .d-delta-pill { display: inline-flex; align-items: center; gap: 3px; padding: 3px 8px; border-radius: 999px; font-size: 11.5px; font-weight: 700; }
  .d-delta-pill.up   { background: var(--win-soft);     color: var(--win); }
  .d-delta-pill.hot  { background: var(--primary-soft); color: var(--primary-ink); }
  .d-delta-pill.flat { background: var(--surface-tint); color: var(--ink-3); }

  /* ── Responsive ── */
  @media (max-width: 960px) {
    .d-hero { grid-template-columns: 1fr; padding: 24px; gap: 20px; }
    .d-rank-num { font-size: 76px; }
    .d-stats { gap: 12px; }
  }
  @media (max-width: 700px) {
    .d-stats { grid-template-columns: 1fr; }
    .d-greeting { flex-direction: column; align-items: flex-start; gap: 10px; }
    .d-ai-strip { flex-wrap: wrap; }
  }
  @media (max-width: 640px) {
    .d-chart-grid { grid-template-columns: 1fr !important; }
  }
`

// ─── Hooks ──────────────────────────────────────────────────────────────────

function useCountUp(target, duration = 1000) {
  const [val, setVal] = useState(0)
  const num = typeof target === 'number' ? target : 0
  useEffect(() => {
    if (num === 0) { setVal(0); return }
    let cur = 0
    const steps = duration / 16
    const step = num / steps
    const t = setInterval(() => {
      cur += step
      if (cur >= num) { setVal(num); clearInterval(t) }
      else setVal(cur)
    }, 16)
    return () => clearInterval(t)
  }, [num, duration])
  return val
}

// ─── Shared small components ─────────────────────────────────────────────────

function Skel({ style }) {
  return <div style={{ background: '#e2e8f0', borderRadius: 8, animation: 'skelpulse 1.5s ease-in-out infinite', ...style }} />
}

function Stars({ rating }) {
  return (
    <span>
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ color: i <= rating ? '#f59e0b' : '#e2e8f0', fontSize: 13 }}>★</span>
      ))}
    </span>
  )
}

function StatusBadge({ status }) {
  const map = {
    posted:  { bg: 'var(--win-soft)',     color: 'var(--win)',         label: 'Posted on Google ✓' },
    pending: { bg: 'var(--primary-soft)', color: 'var(--primary-ink)', label: 'Pending' },
    private: { bg: 'var(--danger-soft)',  color: 'var(--danger)',      label: 'Private feedback' },
  }
  const s = map[status] || map.private
  return <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: s.bg, color: s.color }}>{s.label}</span>
}

function ChartTooltip({ active, payload, label, unit = 'reviews' }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'white', borderRadius: 10, padding: '10px 14px', boxShadow: '0 4px 20px rgba(0,0,0,0.12)', border: '1px solid #f1f5f9', fontSize: 13 }}>
      <p style={{ margin: 0, color: '#64748b', fontSize: 12 }}>{label}</p>
      <p style={{ margin: '4px 0 0', fontWeight: 700, color: '#0f172a' }}>{payload[0].value} {unit}</p>
    </div>
  )
}

function EmptyChart() {
  return (
    <div style={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: 13, background: '#f8fafc', borderRadius: 8 }}>
      No data yet
    </div>
  )
}

function InfoTooltip({ text }) {
  const [show, setShow] = useState(false)
  return (
    <span style={{ position: 'relative', display: 'inline-flex' }}>
      <span
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        style={{ width: 16, height: 16, borderRadius: '50%', background: '#e2e8f0', color: '#64748b', fontSize: 10, fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'default' }}
      >
        i
      </span>
      {show && (
        <div style={{ position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)', width: 200, background: '#1e293b', color: 'white', fontSize: 11, padding: '8px 10px', borderRadius: 8, lineHeight: 1.5, zIndex: 10, pointerEvents: 'none' }}>
          {text}
        </div>
      )}
    </span>
  )
}

// ─── Sparkline ───────────────────────────────────────────────────────────────

function Spark({ points, color }) {
  if (!points || points.length < 2) return null
  const w = 84, h = 34
  const max = Math.max(...points)
  const min = Math.min(...points)
  const range = max - min || 1
  const step = w / (points.length - 1)
  const pts = points.map((p, i) => ({
    x: i * step,
    y: h - ((p - min) / range) * (h - 4) - 2,
  }))
  const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ')
  const area = `${path} L ${w} ${h} L 0 ${h} Z`
  const safeColor = color.replace(/[^a-z0-9]/gi, '_')
  const id = `dsp_${safeColor.slice(0, 10)}_${points.length}`
  const last = pts[pts.length - 1]
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="d-spark">
      <defs>
        <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity=".22" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${id})`} />
      <path d={path} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={last.x.toFixed(1)} cy={last.y.toFixed(1)} r="2.5" fill={color} />
    </svg>
  )
}

// ─── Mini bar chart (30-day activity) ────────────────────────────────────────

function MiniBars({ deltas, color }) {
  const max = Math.max(...deltas, 1)
  return (
    <svg viewBox={`0 0 ${deltas.length * 3} 24`} width={deltas.length * 3} height={24} style={{ display: 'block' }}>
      {deltas.map((v, i) => {
        const h = Math.max(1.5, (v / max) * 22)
        return <rect key={i} x={i * 3} y={24 - h} width="2" height={h} rx="1" fill={color} />
      })}
    </svg>
  )
}

// ─── Hero Rank Card ──────────────────────────────────────────────────────────

function HeroRank({ leaderboard, myRank, stats, biz, onAskNow }) {
  const bizType = biz?.business_type?.trim() || ''
  const bizCity = biz?.city?.trim() || ''
  const total   = leaderboard.length

  const p1 = leaderboard[0]   // 1st — center/tallest
  const p2 = leaderboard[1]   // 2nd — left
  const p3 = leaderboard[2]   // 3rd — right

  function isYou(entry) { return !!entry?.is_self }

  const nextEntry  = myRank > 1 ? leaderboard[myRank - 2] : null
  const selfEntry  = leaderboard.find(e => e.is_self)
  const gap        = nextEntry && selfEntry ? Math.max(0, nextEntry.review_count - selfEntry.review_count) : 0
  const monthDelta = stats?.reviews_last_30_days || 0

  return (
    <section className="d-hero">
      {/* ── Left: rank + text ── */}
      <div className="d-hero-content">
        <div className="d-hero-eyebrow">
          <span className="d-dot-spark" />
          YOUR STANDING{bizType ? ` · ${bizType.toUpperCase()}` : ''}{bizCity ? ` · ${bizCity.toUpperCase()}` : ''}
        </div>

        <div className="d-rank-row">
          <div className="d-rank-num">
            <span className="d-hash">#</span>{myRank}
          </div>
          <div style={{ paddingTop: 10 }}>
            <div className="d-rank-context">
              You're{' '}
              <span style={{ color: 'var(--bronze)', fontWeight: 700 }}>#{myRank} of {total}</span>
              <span style={{ color: 'var(--ink-3)', fontWeight: 500 }}> in </span>
              {bizCity || 'your area'}
            </div>
            <div className="d-rank-sub">Tracked weekly · Updates every few days</div>
          </div>
        </div>

        <div className="d-momentum-row">
          <span className="d-momentum-badge">↑ +{monthDelta} reviews this month</span>
          {monthDelta >= 3 && <span className="d-streak-badge">🔥 Keep it up!</span>}
        </div>
      </div>

      {/* ── Right: podium ── */}
      <div className="d-podium-card">
        <div className="d-podium-head">
          <span>TOP {Math.min(3, total)} · {bizType?.toUpperCase() || 'BUSINESSES'}</span>
          {bizCity && <span className="d-target-pill">📍 {bizCity}</span>}
        </div>

        <div className="d-podium">
          {/* 2nd place — left silver */}
          <div className={`d-pod d-pod-2${isYou(p2) ? ' d-you' : ''}`}>
            <div className="d-pod-name">{p2?.name || '—'}</div>
            <div className="d-pod-rev">{p2 ? fmtIN(p2.review_count) : 0} reviews</div>
            <div className="d-pod-block">2</div>
          </div>
          {/* 1st place — center gold */}
          <div className={`d-pod d-pod-1${isYou(p1) ? ' d-you' : ''}`}>
            <div className="d-pod-name">{p1?.name || '—'}</div>
            <div className="d-pod-rev">{p1 ? fmtIN(p1.review_count) : 0} reviews</div>
            <div className="d-pod-block">1</div>
          </div>
          {/* 3rd place — right bronze */}
          <div className={`d-pod d-pod-3${isYou(p3) ? ' d-you' : ''}`}>
            <div className="d-pod-name">{p3?.name || '—'}</div>
            <div className="d-pod-rev">{p3 ? fmtIN(p3.review_count) : 0} reviews</div>
            <div className="d-pod-block">3</div>
          </div>
        </div>

        <div className="d-chase-line">
          <div className="d-target-icon">{myRank === 1 ? '🏆' : '🎯'}</div>
          <div style={{ flex: 1 }}>
            {myRank === 1 ? (
              <div style={{ color: 'white', fontSize: 13 }}>
                <strong>You're #1!</strong> Keep collecting to maintain your lead.
              </div>
            ) : nextEntry ? (
              <>
                <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,.55)', textTransform: 'uppercase', letterSpacing: '.08em', fontWeight: 600, marginBottom: 2 }}>Next move</div>
                <div style={{ color: 'white', fontSize: 13 }}>
                  <span className="d-gap-num">{gap}</span> more to overtake <strong>{nextEntry.name}</strong>
                </div>
              </>
            ) : (
              <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>Add more competitors to track your position</div>
            )}
          </div>
          {myRank > 1 && nextEntry && (
            <button className="d-chase-cta" onClick={onAskNow}>Ask now</button>
          )}
        </div>
      </div>
    </section>
  )
}

// ─── Stat Cards ──────────────────────────────────────────────────────────────

function StatCards({ stats, sparkGained, sparkCollected }) {
  const gained        = stats?.google_reviews_gained ?? 0
  const currentCount  = stats?.google_current_count ?? 0
  const baselineCount = stats?.google_baseline_count ?? 0
  const currentRating = stats?.google_current_rating ?? 0
  const baselineRating = stats?.google_baseline_rating ?? null
  const collected     = stats?.drafts_sent ?? 0
  const monthDelta    = stats?.reviews_last_30_days ?? 0

  const pct = (baselineCount && currentCount && currentCount > baselineCount)
    ? Math.round(((currentCount - baselineCount) / baselineCount) * 100)
    : null

  const ratingDelta = baselineRating && currentRating
    ? (Number(currentRating) - Number(baselineRating)).toFixed(1)
    : null

  const gainedSpark    = sparkGained.length >= 2    ? sparkGained    : [0, Math.max(gained, 1)]
  const collectedSpark = sparkCollected.length >= 2 ? sparkCollected : [0, Math.max(collected, 1)]

  return (
    <div className="d-stats">

      {/* Card 1 — Google Reviews Gained */}
      <div className="d-stat">
        <div className="d-stat-head">
          <span className="d-stat-label">Google Reviews Gained</span>
          <span className="d-stat-icon coral">📈</span>
        </div>
        <div className="d-stat-row">
          <span className="d-stat-val">+{fmtIN(gained)}</span>
          {pct !== null && pct > 0 && <span className="d-stat-delta">↑ {pct}%</span>}
        </div>
        <div className="d-stat-foot">
          {currentCount > 0
            ? <><strong>{fmtIN(baselineCount)} → {fmtIN(currentCount)}</strong> since joining Praisly</>
            : <span style={{ color: 'var(--primary)', fontWeight: 600 }}>Start collecting reviews!</span>}
        </div>
        <div className="d-stat-spark">
          <Spark points={gainedSpark} color="#D89020" />
        </div>
      </div>

      {/* Card 2 — Google Rating */}
      <div className="d-stat">
        <div className="d-stat-head">
          <span className="d-stat-label">Google Rating</span>
          <span className="d-stat-icon gold">⭐</span>
        </div>
        <div className="d-stat-row">
          <span className="d-stat-val">
            {currentRating ? Number(currentRating).toFixed(1) : '—'}
            {currentRating ? <span className="d-stat-unit">/5</span> : null}
          </span>
          {ratingDelta !== null && Number(ratingDelta) !== 0 && (
            <span className="d-stat-delta">
              {Number(ratingDelta) > 0 ? `↑ +${ratingDelta}` : `↓ ${ratingDelta}`}
            </span>
          )}
        </div>
        <div className="d-stat-foot" style={{ gap: 6 }}>
          <span className="d-stars-row">
            {[1,2,3,4,5].map(i => (
              <svg key={i} viewBox="0 0 24 24" width={13} height={13} fill={i <= Math.round(currentRating) ? '#F5B945' : 'rgba(0,0,0,.1)'} stroke="none">
                <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.62L12 2 9.19 8.62 2 9.24l5.46 4.73L5.82 21z" />
              </svg>
            ))}
          </span>
          {baselineRating && <span>was {Number(baselineRating).toFixed(1)} when you joined</span>}
        </div>
        <div className="d-stat-spark">
          <Spark points={gainedSpark} color="#E8B43A" />
        </div>
      </div>

      {/* Card 3 — Reviews via QR */}
      <div className="d-stat">
        <div className="d-stat-head">
          <span className="d-stat-label">Reviews via QR</span>
          <span className="d-stat-icon dark">✨</span>
        </div>
        <div className="d-stat-row">
          <span className="d-stat-val">{fmtIN(collected)}</span>
          {monthDelta > 0 && <span className="d-stat-delta">↑ {monthDelta} this month</span>}
        </div>
        <div className="d-stat-foot">
          {collected > 0
            ? <><strong>{fmtIN(collected)}</strong> customers reviewed through Praisly</>
            : <span>Scan your QR to start collecting</span>}
        </div>
        <div className="d-stat-spark">
          <Spark points={collectedSpark} color="#1A1610" />
        </div>
      </div>

    </div>
  )
}

// ─── AI Strip ────────────────────────────────────────────────────────────────

function AiStrip({ aiRec, leaderboard, onDismiss, onSendBlast }) {
  let message = aiRec || ''

  if (!message && leaderboard.length > 1) {
    const competitors = leaderboard.filter(e => !e.is_self)
    if (competitors.length > 0) {
      const slowest   = competitors.reduce((a, b) =>
        (a.reviews_last_30_days ?? 0) <= (b.reviews_last_30_days ?? 0) ? a : b
      )
      const selfEntry = leaderboard.find(e => e.is_self)
      const ahead     = selfEntry && selfEntry.review_count > slowest.review_count

      if (ahead) {
        message = `<strong>${slowest.name}</strong> only gained <em>${slowest.reviews_last_30_days ?? 0} reviews</em> this month — your slowest competitor. Keep up your pace to stay ahead!`
      } else {
        const gap = slowest.review_count - (selfEntry?.review_count ?? 0)
        const push = Math.max(1, Math.ceil(gap / 4))
        message = `<strong>${slowest.name}</strong> only gained <em>${slowest.reviews_last_30_days ?? 0} reviews</em> this month. Ask <em>${push} more customers</em> this week and you close the gap.`
      }
    }
  }

  if (!message) return null

  return (
    <section className="d-ai-strip">
      <div className="d-ai-icon">⚡</div>
      <div className="d-ai-content">
        <div className="d-ai-eyebrow">⚡ PRAISLY AI · COMPETITIVE INSIGHT</div>
        <div className="d-ai-title" dangerouslySetInnerHTML={{ __html: message }} />
      </div>
      <button className="d-ai-cta" onClick={onSendBlast}>📤 Send WhatsApp blast</button>
      <button className="d-ai-dismiss" onClick={onDismiss} aria-label="Dismiss">×</button>
    </section>
  )
}

// ─── Confetti + Milestone overlay ────────────────────────────────────────────

function ConfettiPieces() {
  const pieces = useMemo(() =>
    Array.from({ length: 42 }, (_, i) => ({
      key: i,
      color: CONF_COLORS[i % CONF_COLORS.length],
      left: `${5 + Math.random() * 90}%`,
      delay: `${Math.random() * 1.8}s`,
      duration: `${1.8 + Math.random() * 1.5}s`,
      size: 6 + Math.random() * 8,
      isCircle: Math.random() > 0.5,
    })), []
  )
  return (
    <>
      {pieces.map(p => (
        <div
          key={p.key}
          style={{
            position: 'fixed', top: -10, left: p.left,
            width: p.size, height: p.size,
            borderRadius: p.isCircle ? '50%' : 2,
            background: p.color,
            animation: `confettiFall ${p.duration} ${p.delay} ease-in forwards`,
            pointerEvents: 'none', zIndex: 101,
          }}
        />
      ))}
    </>
  )
}

function MilestoneOverlay({ notif, onDismiss }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.65)', animation: 'overlayIn 0.25s ease' }}>
      <ConfettiPieces />
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        background: 'white', borderRadius: 24, padding: '40px 36px',
        maxWidth: 380, width: '90%', textAlign: 'center',
        animation: 'milestoneIn 0.3s ease',
        boxShadow: '0 24px 64px rgba(0,0,0,0.2)',
      }}>
        <p style={{ fontSize: 64, margin: '0 0 8px', lineHeight: 1 }}>🎉</p>
        <h2 style={{ fontFamily: "'Plus Jakarta Sans', system-ui", fontSize: 24, fontWeight: 800, color: '#0f172a', margin: '0 0 12px' }}>
          Congratulations!
        </h2>
        <p style={{ fontSize: 16, color: '#475569', lineHeight: 1.6, margin: '0 0 28px' }}>{notif.message}</p>
        <button
          onClick={onDismiss}
          style={{ background: 'var(--primary)', color: 'white', border: 'none', borderRadius: 12, padding: '13px 32px', fontSize: 16, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
        >
          Awesome! 🙌
        </button>
      </div>
    </div>
  )
}

// ─── Competitor modal ─────────────────────────────────────────────────────────

function CompetitorModal({ bizCity, onClose, onAdd }) {
  const [query, setQuery]       = useState('')
  const [results, setResults]   = useState([])
  const [searching, setSearching] = useState(false)
  const [adding, setAdding]     = useState(null)
  const debounce = useRef(null)

  function handleSearch(val) {
    setQuery(val)
    clearTimeout(debounce.current)
    if (!val.trim()) { setResults([]); return }
    debounce.current = setTimeout(async () => {
      setSearching(true)
      try {
        const res = await api.get(`/api/places/search?query=${encodeURIComponent(val)}&city=${encodeURIComponent(bizCity || '')}`)
        setResults(res.data?.results || [])
      } catch {}
      setSearching(false)
    }, 500)
  }

  async function handleSelect(place) {
    setAdding(place.place_id)
    try {
      await onAdd(place.place_id, place.name)
      onClose()
    } catch (err) {
      alert(err.response?.data?.detail || 'Could not add competitor')
    }
    setAdding(null)
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: 'white', borderRadius: 20, padding: 28, width: '100%', maxWidth: 440, maxHeight: '80vh', overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontFamily: "'Plus Jakarta Sans', system-ui", fontSize: 18, fontWeight: 700, margin: 0, color: '#0f172a' }}>Add Competitor</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#94a3b8' }}>✕</button>
        </div>
        <input
          autoFocus
          value={query}
          onChange={e => handleSearch(e.target.value)}
          placeholder="Search by business name…"
          style={{ width: '100%', padding: '11px 14px', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: 14, fontFamily: 'inherit', outline: 'none', marginBottom: 16, boxSizing: 'border-box' }}
        />
        {searching && <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>Searching…</p>}
        {results.map(r => (
          <div key={r.place_id} className="search-result" onClick={() => handleSelect(r)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontWeight: 600, fontSize: 14, color: '#0f172a', margin: '0 0 3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.name}</p>
                <p style={{ fontSize: 12, color: '#64748b', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.formatted_address}</p>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 12 }}>
                {r.rating && <p style={{ fontSize: 13, fontWeight: 600, color: '#f59e0b', margin: '0 0 2px' }}>⭐ {r.rating}</p>}
                {r.user_ratings_total != null && <p style={{ fontSize: 11, color: '#94a3b8', margin: 0 }}>{fmtIN(r.user_ratings_total)} reviews</p>}
              </div>
            </div>
            {adding === r.place_id && <p style={{ fontSize: 12, color: 'var(--primary)', margin: '6px 0 0', fontWeight: 600 }}>Adding…</p>}
          </div>
        ))}
        {!searching && query && results.length === 0 && (
          <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>No results. Try a different name.</p>
        )}
      </div>
    </div>
  )
}

// ─── Leaderboard section ──────────────────────────────────────────────────────

function LeaderboardSection({ stats, competitors, leaderboard, onAdd, onDelete, loadingComps, bizType, bizCity, sparkMap }) {
  const [showModal, setShowModal]   = useState(false)
  const [showManage, setShowManage] = useState(false)
  const localBizCity = authService.getBusiness()?.city || bizCity || ''

  async function handleAdd(place_id, name) {
    const res = await api.post('/api/competitors/add', { place_id, name })
    onAdd(res.data.competitor)
  }

  if (loadingComps) {
    return (
      <div className="d-lb-card" style={{ padding: 20 }}>
        <Skel style={{ height: 16, width: 140, marginBottom: 16 }} />
        {[0,1,2].map(i => <Skel key={i} style={{ height: 44, borderRadius: 8, marginBottom: 8 }} />)}
      </div>
    )
  }

  if (competitors.length === 0) {
    return (
      <>
        <div className="d-lb-card" style={{ padding: '32px 24px', textAlign: 'center' }}>
          <p style={{ fontSize: 32, margin: '0 0 12px' }}>🏆</p>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)', margin: '0 0 6px' }}>Start competing</h3>
          <p style={{ fontSize: 13, color: 'var(--ink-3)', margin: '0 0 20px', lineHeight: 1.6 }}>
            Add local competitors to see who's winning the review game in your area
          </p>
          <button
            onClick={() => setShowModal(true)}
            style={{ background: 'var(--primary)', color: 'white', border: 'none', borderRadius: 12, padding: '10px 22px', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
          >
            Add Competitors
          </button>
        </div>
        {showModal && <CompetitorModal bizCity={localBizCity} onClose={() => setShowModal(false)} onAdd={handleAdd} />}
      </>
    )
  }

  const canAddMore  = competitors.length < 3
  const whereLabel  = [bizType, bizCity].filter(Boolean).join(' · ')

  return (
    <>
      <div className="d-lb-card">
        {/* Header */}
        <div className="d-lb-head">
          <div className="d-lb-title">
            Local Rankings
            {whereLabel && <span className="d-lb-where">{whereLabel}</span>}
          </div>
          <div className="d-lb-actions">
            {canAddMore && (
              <button className="d-btn-ghost" onClick={() => setShowModal(true)}>+ Add</button>
            )}
            <button
              className="d-btn-ghost"
              onClick={() => setShowManage(v => !v)}
            >
              {showManage ? 'Done' : 'Manage ›'}
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="d-lb-wrap">
          <table className="d-lb">
            <thead>
              <tr>
                <th style={{ width: 88 }}>Rank</th>
                <th>Business</th>
                <th className="num" style={{ width: 76 }}>Rating</th>
                <th className="num" style={{ width: 80 }}>Reviews</th>
                <th className="num" style={{ width: 160 }}>Last 30 days</th>
                {showManage && <th style={{ width: 70 }} />}
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((r, i) => {
                const rank       = i + 1
                const medalClass = `gm${Math.min(rank, 5)}`
                const deltaClass = r.is_self ? 'hot' : ((r.reviews_last_30_days ?? 0) > 0 ? 'up' : 'flat')
                const spark30    = sparkMap?.[r.name] || Array(30).fill(0)
                return (
                  <tr key={r.name + i} className={r.is_self ? 'd-you-row' : ''}>
                    <td>
                      <div className="d-rank-cell">
                        <div className={`d-lb-medal ${medalClass}`}>
                          {rank <= 3 ? rank : `#${rank}`}
                        </div>
                        {rank <= 3 && (
                          <span className="d-rank-label">
                            {['GOLD', 'SILVER', 'BRONZE'][rank - 1]}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="d-biz-cell">
                        <div className="d-biz-avatar" style={{ background: AVATAR_GRADS[i % AVATAR_GRADS.length] }}>
                          {getInitials(r.name)}
                        </div>
                        <div>
                          <div className="d-biz-name">
                            {r.name}
                            {r.is_self && <span className="d-you-pill">YOU</span>}
                          </div>
                          {r.area && <div className="d-biz-sub">{r.area}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="d-num-cell">
                      <span className="d-rating-cell">
                        <span style={{ color: '#F5B945' }}>★</span>
                        {r.rating ? Number(r.rating).toFixed(1) : '—'}
                      </span>
                    </td>
                    <td className="d-num-cell">{fmtIN(r.review_count)}</td>
                    <td>
                      <div className="d-trend-cell">
                        <MiniBars
                          deltas={spark30}
                          color={r.is_self ? '#D89020' : '#B8AFA4'}
                        />
                        <span className={`d-delta-pill ${deltaClass}`}>
                          ↑ +{r.reviews_last_30_days ?? 0}
                        </span>
                      </div>
                    </td>
                    {showManage && (
                      <td style={{ textAlign: 'right' }}>
                        {!r.is_self && (
                          <button
                            onClick={() => onDelete(r.id)}
                            style={{ color: '#ef4444', background: 'none', border: 'none', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}
                          >
                            Remove
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && <CompetitorModal bizCity={localBizCity} onClose={() => setShowModal(false)} onAdd={handleAdd} />}
    </>
  )
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function Dashboard() {
  const navigate = useNavigate()

  const [stats, setStats]                   = useState(null)
  const [reviews, setReviews]               = useState([])
  const [competitors, setCompetitors]       = useState([])
  const [growthData, setGrowthData]         = useState([])
  const [compGrowth, setCompGrowth]         = useState(null)
  const [milestoneNotif, setMilestoneNotif] = useState(null)
  const [milestoneDismissed, setMilestoneDismissed] = useState(false)
  const [loading, setLoading]               = useState(true)
  const [loadingComps, setLoadingComps]     = useState(true)
  const [fetchError, setFetchError]         = useState(null)
  const [bizName, setBizName]               = useState(authService.getBusiness()?.business_name || '')
  const [dismissAI, setDismissAI]           = useState(false)

  const hour     = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const biz      = authService.getBusiness()
  const bizType  = biz?.business_type?.trim() || ''
  const bizCity  = biz?.city?.trim() || ''

  const datePill = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })

  useEffect(() => {
    Promise.all([
      api.get('/api/reviews/stats'),
      api.get('/api/reviews/list?limit=5'),
      api.get('/api/auth/me'),
      api.get('/api/competitors').catch(() => ({ data: [] })),
      api.get('/api/reviews/growth-chart').catch(() => ({ data: [] })),
      api.get('/api/notifications').catch(() => ({ data: { notifications: [] } })),
      api.get('/api/reviews/competitor-growth').catch(() => ({ data: { series: [] } })),
    ]).then(([s, r, me, c, g, n, cg]) => {
      setStats(s.data)
      setReviews(r.data.reviews || [])
      setCompetitors(Array.isArray(c.data) ? c.data : [])
      setGrowthData(Array.isArray(g.data) ? g.data : [])
      setCompGrowth(cg.data)

      const name = me.data?.business?.business_name
      if (name) { setBizName(name); authService.setBusiness(me.data.business) }

      const notifs    = n.data?.notifications || []
      const milestone = notifs.find(x => x.type === 'milestone' && !x.is_read)
      if (milestone) setMilestoneNotif(milestone)
    }).catch(err => {
      setFetchError(err?.response?.status || 'network')
    }).finally(() => { setLoading(false); setLoadingComps(false) })
  }, [])

  async function dismissMilestone() {
    setMilestoneDismissed(true)
    try { await api.post('/api/notifications/mark-read') } catch {}
  }

  function handleAddCompetitor(comp) {
    setCompetitors(prev => [...prev, comp])
  }

  async function handleDeleteCompetitor(id) {
    try {
      await api.delete(`/api/competitors/${id}`)
      setCompetitors(prev => prev.filter(c => c.id !== id))
    } catch {}
  }

  // Leaderboard — sorted by review_count desc
  const leaderboard = useMemo(() => {
    if (!stats) return []
    return [
      {
        name: bizName || 'Your Business',
        rating: stats.google_current_rating,
        review_count: stats.google_current_count || 0,
        reviews_last_30_days: stats.reviews_last_30_days || 0,
        is_self: true,
      },
      ...competitors.map(c => ({
        id: c.id,
        name: c.name,
        rating: c.rating,
        review_count: c.review_count || 0,
        reviews_last_30_days: c.reviews_last_30_days || 0,
        is_self: false,
      })),
    ].sort((a, b) => b.review_count - a.review_count)
  }, [stats, competitors, bizName])

  const myRank = leaderboard.findIndex(e => e.is_self) + 1

  // Chart data
  const ratingData      = stats
    ? [1,2,3,4,5].map(n => ({ star: `${n}★`, count: stats.rating_distribution?.[String(n)] || 0 }))
    : []
  const timeData        = (stats?.reviews_over_time || []).map(d => ({ date: d.date.slice(5), count: d.count }))
  const growthChartData = growthData.map(d => ({ date: d.date.slice(5), count: d.review_count }))
  const noRatingData    = ratingData.every(d => d.count === 0)
  const noTimeData      = timeData.every(d => d.count === 0)
  const noGrowthData    = growthChartData.length === 0

  // Competitor growth chart
  const cgSeries   = compGrowth?.series || []
  const cgDataRaw  = useMemo(() => buildGrowthChartData(cgSeries), [cgSeries])
  const cgData     = cgDataRaw.map(row => { const { _date, ...rest } = row; return { ...rest, date: fmtChartDate(_date) } })
  const cgHasData  = cgData.length > 1
  const showCompGrowthChart = competitors.length > 0

  // Spark arrays for stat cards
  const sparkGained    = growthChartData.map(d => d.count)
  const sparkCollected = timeData.map(d => d.count)

  // 30-day spark map for leaderboard mini-bars
  const sparkMap = useMemo(() => {
    const map = {}
    // business itself
    const bizSpark  = Array(30).fill(0)
    const recTime   = timeData.slice(-30)
    recTime.forEach((d, i) => { bizSpark[i + (30 - recTime.length)] = d.count || 0 })
    map[bizName || 'Your Business'] = bizSpark
    // competitors from competitor-growth series
    cgSeries.forEach(s => {
      const spark  = Array(30).fill(0)
      const recent = s.data.slice(-30)
      recent.forEach((d, i) => { spark[i + (30 - recent.length)] = d.count || 0 })
      map[s.name] = spark
    })
    return map
  }, [timeData, cgSeries, bizName])

  // Greeting subtitle
  const greetingSubtitle = useMemo(() => {
    if (!competitors.length) return 'Your review dashboard is ready. Share your QR to start collecting.'
    if (myRank === 1) return "You're leading the pack in your area! Keep collecting reviews to stay #1."
    if (myRank === 2) return "You're just one step from the top. A little push and you claim #1!"
    const nextName = leaderboard[myRank - 2]?.name
    return nextName
      ? `You're closer than ever to overtaking ${nextName}. Let's close the gap this week.`
      : "You're making progress. Keep collecting reviews to climb the rankings!"
  }, [competitors.length, myRank, leaderboard])

  // Chart summaries
  const ratingChartSummary = (() => {
    try {
      if (!stats || noRatingData) return 'Collect more reviews to see your ratings'
      const total   = ratingData.reduce((s, d) => s + d.count, 0)
      const topEntry = ratingData.reduce((a, b) => b.count > a.count ? b : a, ratingData[0])
      const pct45   = total > 0 ? Math.round(((ratingData[3].count + ratingData[4].count) / total) * 100) : 0
      if (topEntry.star === '5★' && topEntry.count > 0) return "Most customers gave you 5 stars! 🎉"
      if (topEntry.star === '4★' && topEntry.count > 0) return "Most customers rated you 4 stars ⭐"
      if (pct45 > 80) return `${pct45}% of customers gave 4–5 stars 🎉`
      return 'Collect more reviews to see your ratings'
    } catch { return '' }
  })()

  const activitySummary = (() => {
    try {
      const total = timeData.reduce((s, d) => s + d.count, 0)
      return total > 0
        ? `You got ${total} new review${total !== 1 ? 's' : ''} this month 📈`
        : 'No reviews yet this month. Share your QR code!'
    } catch { return '' }
  })()

  const compChartSummary = (() => {
    try {
      if (!showCompGrowthChart) return 'Add competitors to see how you compare'
      if (!cgHasData) return 'Keep going — growth trends will show up in a few days'
      const myEntry  = leaderboard.find(e => e.is_self)
      const myGrowth = myEntry?.reviews_last_30_days ?? 0
      const others   = leaderboard.filter(e => !e.is_self)
      const slower   = others.find(e => (e.reviews_last_30_days ?? 0) < myGrowth)
      if (slower) return `You're growing faster than ${slower.name} 💪`
      const fastest = others.reduce((a, b) => (b.reviews_last_30_days ?? 0) > (a.reviews_last_30_days ?? 0) ? b : a, others[0])
      if (fastest) return `${fastest.name} gained ${fastest.reviews_last_30_days ?? 0} reviews. Time to push harder!`
      return 'Keep going — growth trends will show up in a few days'
    } catch { return '' }
  })()

  // Animated counters
  const gainedAnim      = useCountUp(stats?.google_reviews_gained ?? 0)
  const baselineRating  = stats?.google_baseline_rating

  const showHero = !loading && stats && competitors.length > 0

  // ── Skeleton ──
  if (loading) {
    return (
      <div>
        <style>{PAGE_CSS}</style>
        <Skel style={{ height: 34, width: 240, marginBottom: 8 }} />
        <Skel style={{ height: 14, width: 320, marginBottom: 28 }} />
        <Skel style={{ height: 220, borderRadius: 20, marginBottom: 14 }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 14 }}>
          {[0,1,2].map(i => <Skel key={i} style={{ height: 148, borderRadius: 14 }} />)}
        </div>
        <Skel style={{ height: 68, borderRadius: 14, marginBottom: 14 }} />
        <Skel style={{ height: 260, borderRadius: 14, marginBottom: 20 }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 20 }} className="d-chart-grid">
          {[0,1,2].map(i => <Skel key={i} style={{ height: 220, borderRadius: 16 }} />)}
        </div>
        {[0,1,2].map(i => <Skel key={i} style={{ height: 72, borderRadius: 12, marginBottom: 10 }} />)}
      </div>
    )
  }

  if (fetchError) {
    return (
      <>
        <style>{PAGE_CSS}</style>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center', padding: '0 24px' }}>
          <p style={{ fontSize: 48, marginBottom: 16 }}>😕</p>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>Something went wrong</h2>
          <p style={{ color: '#64748b', fontSize: 14, marginBottom: 24 }}>Please refresh the page to try again.</p>
          <button
            onClick={() => window.location.reload()}
            style={{ padding: '10px 24px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
          >
            Refresh
          </button>
        </div>
      </>
    )
  }

  return (
    <>
      <style>{PAGE_CSS}</style>

      {/* Milestone celebration */}
      {milestoneNotif && !milestoneDismissed && (
        <MilestoneOverlay notif={milestoneNotif} onDismiss={dismissMilestone} />
      )}

      {/* ── Greeting ── */}
      <div className="d-greeting" style={{ marginBottom: 22, animation: 'fadeUp 0.3s ease' }}>
        <div>
          <h1>{greeting}, {bizName || 'there'} 👋</h1>
          <p>{greetingSubtitle}</p>
        </div>
        <span className="d-time-pill">
          <span className="d-live" />
          {datePill}
        </span>
      </div>

      {/* Trial expired banner */}
      {stats?.trial_expired && (
        <div style={{ marginBottom: 20, padding: '16px 20px', background: '#fef2f2', border: '1.5px solid #fecaca', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', animation: 'fadeUp 0.3s ease' }}>
          <div>
            <p style={{ fontSize: 15, fontWeight: 700, color: '#991b1b', margin: '0 0 2px' }}>Your 7-day free trial has ended</p>
            <p style={{ fontSize: 13, color: '#b91c1c', margin: 0 }}>Subscribe to continue collecting reviews.</p>
          </div>
          <Link to="/billing" style={{ display: 'inline-block', padding: '10px 20px', background: 'var(--primary)', color: 'white', borderRadius: 10, fontWeight: 700, fontSize: 14, textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0 }}>
            Subscribe Now →
          </Link>
        </div>
      )}

      {/* ── Hero rank card ── */}
      {showHero && (
        <div style={{ marginBottom: 14, animation: 'fadeUp 0.32s ease both' }}>
          <HeroRank
            leaderboard={leaderboard}
            myRank={myRank}
            stats={stats}
            biz={biz}
            onAskNow={() => navigate('/send')}
          />
        </div>
      )}

      {/* ── Stat cards ── */}
      <div style={{ marginBottom: 14, animation: 'fadeUp 0.35s ease both', animationDelay: '40ms' }}>
        <StatCards
          stats={stats}
          sparkGained={sparkGained}
          sparkCollected={sparkCollected}
        />
      </div>

      {/* ── AI strip ── */}
      {!dismissAI && competitors.length > 0 && (
        <div style={{ marginBottom: 14, animation: 'fadeUp 0.35s ease both', animationDelay: '80ms' }}>
          <AiStrip
            aiRec={stats?.ai_recommendation || ''}
            leaderboard={leaderboard}
            onDismiss={() => setDismissAI(true)}
            onSendBlast={() => navigate('/send')}
          />
        </div>
      )}

      {/* ── Leaderboard ── */}
      <div style={{ marginBottom: 20, animation: 'fadeUp 0.35s ease both', animationDelay: '120ms' }}>
        <LeaderboardSection
          stats={stats}
          competitors={competitors}
          leaderboard={leaderboard}
          onAdd={handleAddCompetitor}
          onDelete={handleDeleteCompetitor}
          loadingComps={loadingComps}
          bizType={bizType}
          bizCity={bizCity}
          sparkMap={sparkMap}
        />
      </div>

      {/* ── Charts ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24, animation: 'fadeUp 0.35s ease both', animationDelay: '160ms' }} className="d-chart-grid">

        {/* Star ratings */}
        <div className="d-card" style={{ padding: '20px 16px' }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: '#374151', margin: '0 0 6px' }}>Your Star Ratings</h3>
          <p style={{ fontSize: 13, color: '#4b5563', margin: '0 0 14px', lineHeight: 1.5 }}>{ratingChartSummary}</p>
          {noRatingData ? <EmptyChart /> : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={ratingData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="star" fontSize={11} tick={{ fill: '#9ca3af', fontFamily: 'system-ui' }} axisLine={false} tickLine={false} />
                <YAxis fontSize={11} tick={{ fill: '#9ca3af' }} allowDecimals={false} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="count" radius={[5,5,0,0]} isAnimationActive label={{ position: 'top', fill: '#6b7280', fontSize: 12 }}>
                  {ratingData.map((_, i) => (
                    <Cell key={i} fill={['#ef4444','#f97316','#facc15','#D89020','#F5B945'][i]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Review activity */}
        <div className="d-card" style={{ padding: '20px 16px' }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: '#374151', margin: '0 0 6px' }}>Your Review Activity</h3>
          <p style={{ fontSize: 13, color: '#4b5563', margin: '0 0 14px', lineHeight: 1.5 }}>{activitySummary}</p>
          {noTimeData ? <EmptyChart /> : (
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={timeData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#D89020" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#D89020" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" fontSize={11} tick={{ fill: '#9ca3af' }} interval="preserveStartEnd" axisLine={false} tickLine={false} />
                <YAxis fontSize={11} tick={{ fill: '#9ca3af' }} allowDecimals={false} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} cursor={{ stroke: '#e2e8f0' }} />
                <Area type="monotone" dataKey="count" stroke="#D89020" fill="url(#areaGrad)" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#D89020', strokeWidth: 0 }} isAnimationActive />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Competitor comparison / Google count */}
        {showCompGrowthChart ? (
          <div className="d-card" style={{ padding: '20px 16px' }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: '#374151', margin: '0 0 6px' }}>You vs Competitors</h3>
            <p style={{ fontSize: 13, color: '#4b5563', margin: '0 0 14px', lineHeight: 1.5 }}>{compChartSummary}</p>
            {(() => {
              const myEntry  = leaderboard.find(e => e.is_self)
              const myGrowth = myEntry?.reviews_last_30_days ?? 0
              const comps    = leaderboard.filter(e => !e.is_self)
              const behind   = comps.filter(e => myGrowth <= (e.reviews_last_30_days ?? 0))
              const ahead    = comps.filter(e => myGrowth >  (e.reviews_last_30_days ?? 0))
              return (
                <>
                  <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--win)', margin: '0 0 12px' }}>
                    📊 Your growth: +{myGrowth} this month
                  </p>
                  <div style={{ height: 1, background: '#e5e7eb', margin: '0 0 12px' }} />
                  <div>
                    {[...behind, ...ahead].map(entry => {
                      const theirs  = entry.reviews_last_30_days ?? 0
                      const isAhead = myGrowth > theirs
                      return (
                        <div key={entry.id} style={{ fontSize: 13, fontWeight: isAhead ? 400 : 600, color: isAhead ? '#374151' : '#92400e', padding: '7px 0', borderBottom: '1px solid #f3f4f6' }}>
                          {isAhead ? `✅ Ahead of ${entry.name} (+${theirs})` : `⚠️ Behind ${entry.name} (+${theirs})`}
                        </div>
                      )
                    })}
                  </div>
                </>
              )
            })()}
          </div>
        ) : (
          <div className="d-card" style={{ padding: '20px 16px' }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: '#374151', margin: '0 0 16px' }}>Google Review Count</h3>
            {noGrowthData ? (
              <div style={{ height: 160, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: 12, textAlign: 'center', background: '#f8fafc', borderRadius: 8, padding: 16 }}>
                <p style={{ margin: '0 0 4px' }}>Data starts accumulating after your first snapshot</p>
                <p style={{ margin: 0 }}>Check back tomorrow 📈</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={160}>
                <AreaChart data={growthChartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#D89020" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#D89020" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" fontSize={11} tick={{ fill: '#9ca3af' }} interval="preserveStartEnd" axisLine={false} tickLine={false} />
                  <YAxis fontSize={11} tick={{ fill: '#9ca3af' }} allowDecimals={false} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip unit="total reviews" />} cursor={{ stroke: '#e2e8f0' }} />
                  <Area type="monotone" dataKey="count" stroke="#D89020" fill="url(#growthGrad)" strokeWidth={2.5} dot={false} activeDot={{ r: 4, fill: '#D89020', strokeWidth: 0 }} isAnimationActive />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        )}
      </div>

      {/* ── Recent Reviews ── */}
      <div style={{ animation: 'fadeUp 0.35s ease both', animationDelay: '200ms' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: '#374151', margin: 0 }}>Recent Reviews</h3>
          <Link to="/reviews" style={{ fontSize: 13, color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>View all →</Link>
        </div>

        {reviews.length === 0 ? (
          <div className="d-card" style={{ padding: '48px 24px', textAlign: 'center' }}>
            <p style={{ fontSize: 36, marginBottom: 12 }}>🌟</p>
            <p style={{ color: '#374151', fontSize: 15, fontWeight: 600, margin: 0 }}>No reviews yet</p>
            <p style={{ color: '#94a3b8', fontSize: 13, marginTop: 4, marginBottom: 16 }}>Share your QR code to start collecting reviews</p>
            <Link to="/qr" style={{ display: 'inline-block', padding: '9px 20px', background: 'var(--primary)', color: 'white', borderRadius: 8, textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>
              View QR Code →
            </Link>
          </div>
        ) : (
          reviews.map(r => (
            <div key={r.id} className="review-card" style={{ borderLeft: `4px solid ${ratingBorder(r.rating)}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 6 }}>
                <span style={{ color: '#0f172a', fontSize: 14, fontWeight: 600 }}>{r.customer_name || 'Anonymous'}</span>
                <span style={{ color: '#94a3b8', fontSize: 12, flexShrink: 0 }}>
                  {r.created_at ? new Date(r.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : ''}
                </span>
              </div>
              <div style={{ marginBottom: 6 }}><Stars rating={r.rating} /></div>
              {(r.customer_edited_text || r.review_text) && (
                <p style={{ color: '#374151', fontSize: 13, lineHeight: 1.55, margin: '0 0 8px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                  {cleanText(r.customer_edited_text || r.review_text)}
                </p>
              )}
              {r.status === 'private' && r.private_feedback && (
                <p style={{ color: '#64748b', fontSize: 13, lineHeight: 1.5, margin: '0 0 8px', fontStyle: 'italic', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                  {cleanText(r.private_feedback)}
                </p>
              )}
              {!r.customer_edited_text && !r.review_text && r.status !== 'private' && r.private_feedback && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
                  {cleanText(r.private_feedback).split(',').map(t => t.trim()).filter(Boolean).map((tag, i) => (
                    <span key={i} style={{ padding: '2px 8px', borderRadius: 20, background: '#f1f5f9', color: '#475569', fontSize: 11, fontWeight: 500 }}>{tag}</span>
                  ))}
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}><StatusBadge status={r.status} /></div>
            </div>
          ))
        )}
      </div>
    </>
  )
}
