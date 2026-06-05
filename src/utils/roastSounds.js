let ctx = null

function getCtx() {
  try {
    if (!ctx || ctx.state === 'closed') ctx = new (window.AudioContext || window.webkitAudioContext)()
    if (ctx.state === 'suspended') ctx.resume()
    return ctx
  } catch { return null }
}

export function playPop() {
  try {
    const c = getCtx(); if (!c) return
    const o = c.createOscillator()
    const g = c.createGain()
    o.type = 'sine'
    o.frequency.setValueAtTime(600, c.currentTime)
    o.frequency.exponentialRampToValueAtTime(200, c.currentTime + 0.15)
    g.gain.setValueAtTime(0.15, c.currentTime)
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.15)
    o.connect(g).connect(c.destination)
    o.start(); o.stop(c.currentTime + 0.15)
  } catch {}
}

export function playWhoosh() {
  try {
    const c = getCtx(); if (!c) return
    const buf = c.createBuffer(1, c.sampleRate * 0.3, c.sampleRate)
    const data = buf.getChannelData(0)
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
    const src = c.createBufferSource()
    src.buffer = buf
    const bp = c.createBiquadFilter()
    bp.type = 'bandpass'
    bp.frequency.setValueAtTime(1000, c.currentTime)
    bp.frequency.exponentialRampToValueAtTime(300, c.currentTime + 0.3)
    bp.Q.value = 1
    const g = c.createGain()
    g.gain.setValueAtTime(0.08, c.currentTime)
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.3)
    src.connect(bp).connect(g).connect(c.destination)
    src.start(); src.stop(c.currentTime + 0.3)
  } catch {}
}

export function playKaching() {
  try {
    const c = getCtx(); if (!c) return
    ;[1400, 1300, 1200].forEach((freq, i) => {
      const o = c.createOscillator()
      const g = c.createGain()
      o.type = 'triangle'
      o.frequency.value = freq
      const start = c.currentTime + i * 0.07
      g.gain.setValueAtTime(0, start)
      g.gain.linearRampToValueAtTime(0.1, start + 0.02)
      g.gain.exponentialRampToValueAtTime(0.001, start + 0.15)
      o.connect(g).connect(c.destination)
      o.start(start); o.stop(start + 0.15)
    })
  } catch {}
}

export function playDoom() {
  try {
    const c = getCtx(); if (!c) return
    const o = c.createOscillator()
    const g = c.createGain()
    o.type = 'sine'
    o.frequency.setValueAtTime(80, c.currentTime)
    o.frequency.exponentialRampToValueAtTime(40, c.currentTime + 0.8)
    g.gain.setValueAtTime(0.2, c.currentTime)
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.8)
    o.connect(g).connect(c.destination)
    o.start(); o.stop(c.currentTime + 0.8)
  } catch {}
}

export function vibrate(pattern) {
  try { navigator.vibrate?.(pattern) } catch {}
}
