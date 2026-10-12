import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "./visual-landing.css";

const VERTEX = `attribute vec2 a_position;
void main(){ gl_Position=vec4(a_position,0.,1.); }`;
const FRAGMENT = `precision highp float;
uniform vec2 u_resolution;
uniform vec2 u_pointer;
uniform float u_time;
uniform vec3 u_accent;
mat2 rot(float a){float s=sin(a),c=cos(a);return mat2(c,-s,s,c);}
float capsule(vec3 p, vec3 a, vec3 b, float r){vec3 pa=p-a,ba=b-a;return length(pa-ba*clamp(dot(pa,ba)/dot(ba,ba),0.,1.))-r;}
float smoothMin(float a,float b,float k){float h=clamp(.5+.5*(b-a)/k,0.,1.);return mix(b,a,h)-k*h*(1.-h);}
float map(vec3 p){
 p.xz*=rot(u_time*.19+u_pointer.x*.35);
 p.yz*=rot(.35+sin(u_time*.16)*.3+u_pointer.y*.3);
 p.xy*=rot(.32+u_time*.1);
 float d=length(p)-.45;
 for(int i=0;i<6;i++){
  float a=float(i)*1.04719755;
  vec3 end=vec3(cos(a)*1.32,sin(a)*1.32, .18*sin(a*2.));
  d=smoothMin(d,capsule(p,vec3(0.),end,.255),.3);
 }
 d=smoothMin(d,capsule(p,vec3(0.,0.,-.88),vec3(0.,0.,.88),.29),.24);
 return d;
}
vec3 normal(vec3 p){vec2 e=vec2(.0015,0.);return normalize(vec3(map(p+e.xyy)-map(p-e.xyy),map(p+e.yxy)-map(p-e.yxy),map(p+e.yyx)-map(p-e.yyx)));}
vec3 environment(vec3 r){
 vec3 c=vec3(.07,.075,.085);
 float band=pow(max(0.,sin(r.y*5.+r.x*2.)),8.);
 c+=vec3(.9,.96,1.)*band*1.35;
 c+=vec3(.72,.66,.9)*pow(max(0.,dot(r,normalize(vec3(-1.,.5,.5)))),12.)*1.3;
 c+=u_accent*pow(max(0.,dot(r,normalize(vec3(1.,-.3,1.)))),8.)*1.8;
 c+=vec3(1.,.9,.78)*smoothstep(.52,.57,r.x)*(1.-smoothstep(.8,.96,r.x))*.75;
 c+=vec3(.9)*pow(max(0.,r.y),16.);
 return c;
}
void main(){
 vec2 uv=(gl_FragCoord.xy*2.-u_resolution.xy)/min(u_resolution.x,u_resolution.y);
 vec3 ro=vec3(0.,0.,4.9),rd=normalize(vec3(uv,-2.8));
 float t=0.;float d=1.;
 for(int i=0;i<70;i++){vec3 p=ro+rd*t;d=map(p);if(d<.0015||t>9.)break;t+=d*.83;}
 vec3 bg=vec3(.035,.039,.046);
 float halo=exp(-dot(uv,uv)*.5)*.09;
 bg+=u_accent*halo;
 if(t<9. && d<.004){
  vec3 p=ro+rd*t,n=normal(p),r=reflect(rd,n);
  float fres=pow(1.-max(0.,dot(n,-rd)),3.);
  vec3 col=environment(r)*(.62+.38*fres);
  col+=u_accent*pow(1.-abs(dot(n,-rd)),2.)*.25;
  col+=vec3(.95)*pow(max(dot(n,normalize(vec3(-2.,4.,5.))),0.),90.)*1.5;
  col*=.73+.27*max(0.,n.y);
  col=pow(col,vec3(.82));
  gl_FragColor=vec4(col,1.);
 }else{gl_FragColor=vec4(bg,1.);}
}`;

function ChromeSculpture({ paused, palette }) {
  const canvas = useRef(null);
  const settings = useRef({ paused, palette });
  useEffect(() => {
    settings.current = { paused, palette };
  }, [paused, palette]);
  useEffect(() => {
    const el = canvas.current;
    const gl = el.getContext("webgl", {
      alpha: false,
      antialias: false,
      powerPreference: "low-power",
    });
    if (!gl) return;
    const compile = (type, code) => {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, code);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };
    const vertex = compile(gl.VERTEX_SHADER, VERTEX),
      fragment = compile(gl.FRAGMENT_SHADER, FRAGMENT);
    if (!vertex || !fragment) {
      if (vertex) gl.deleteShader(vertex);
      if (fragment) gl.deleteShader(fragment);
      return;
    }
    const program = gl.createProgram();
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      gl.deleteProgram(program);
      gl.deleteShader(vertex);
      gl.deleteShader(fragment);
      return;
    }
    gl.useProgram(program);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW,
    );
    const position = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    const res = gl.getUniformLocation(program, "u_resolution"),
      pointer = gl.getUniformLocation(program, "u_pointer"),
      time = gl.getUniformLocation(program, "u_time"),
      accent = gl.getUniformLocation(program, "u_accent");
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0,
      previous = 0,
      elapsed = 1.2,
      visible = true,
      dirty = true,
      lastPalette = "",
      x = 0,
      y = 0;
    const resize = () => {
      const bounds = el.getBoundingClientRect();
      const scale = Math.min(window.devicePixelRatio || 1, 1.25);
      el.width = Math.max(1, Math.round(bounds.width * scale));
      el.height = Math.max(1, Math.round(bounds.height * scale));
      gl.viewport(0, 0, el.width, el.height);
      dirty = true;
    };
    const observer = new ResizeObserver(resize);
    observer.observe(el);
    const visibility = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      dirty = true;
    });
    visibility.observe(el);
    const move = (event) => {
      if (settings.current.paused || preference.matches) return;
      const b = el.getBoundingClientRect();
      x = ((event.clientX - b.left) / b.width) * 2 - 1;
      y = ((event.clientY - b.top) / b.height) * 2 - 1;
      dirty = true;
    };
    el.addEventListener("pointermove", move);
    const draw = (stamp) => {
      frame = requestAnimationFrame(draw);
      const delta = Math.min((stamp - previous) / 1000 || 0, 0.05);
      previous = stamp;
      if (!visible || document.hidden || (stamp % 34 > 21 && !dirty)) return;
      const moving = !settings.current.paused && !preference.matches;
      const color = settings.current.palette;
      if (color !== lastPalette) {
        lastPalette = color;
        dirty = true;
      }
      if (!moving && !dirty) return;
      if (moving) elapsed += delta;
      const rgb =
        color === "violet"
          ? [0.65, 0.4, 1]
          : color === "ember"
            ? [1, 0.22, 0.06]
            : [0.68, 1, 0.22];
      gl.uniform2f(res, el.width, el.height);
      gl.uniform2f(pointer, x, y);
      gl.uniform1f(time, elapsed);
      gl.uniform3fv(accent, rgb);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      el.classList.add("v-canvas-ready");
      dirty = false;
    };
    resize();
    frame = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      visibility.disconnect();
      el.removeEventListener("pointermove", move);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vertex);
      gl.deleteShader(fragment);
    };
  }, []);
  return (
    <div className="v-sculpture">
      <div className="v-sculpture-fallback" aria-hidden="true">
        ✳
      </div>
      <canvas
        ref={canvas}
        aria-label="Interactive chrome sculpture, slowly rotating and reflecting the selected colour"
        role="img"
      />
      <div className="v-sculpture-cross v-cross-top">+</div>
      <div className="v-sculpture-cross v-cross-bottom">+</div>
      <span className="v-object-id">
        OBJECT P—01
        <br />
        CHROME / GOOD ENERGY
      </span>
      <span className="v-object-note">
        MOVE YOUR POINTER
        <br />
        BEND THE LIGHT ↗
      </span>
    </div>
  );
}

function Arrow({ diagonal = false }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      aria-hidden="true"
    >
      {diagonal ? (
        <path d="M5 19 19 5M5 5h14v14" />
      ) : (
        <path d="M3 12h17m-7-7 7 7-7 7" />
      )}
    </svg>
  );
}
function VisualBrand() {
  return (
    <Link
      className="v-brand"
      to="/preview"
      aria-label="Praisly visual preview home"
    >
      praisly<span>✳</span>
    </Link>
  );
}

function VoiceWall() {
  const [active, setActive] = useState(1);
  const cards = [
    {
      text: "THE LITTLE\nTHINGS.\nTHE BIG\nFEELING.",
      label: "01 / EVERY DETAIL COUNTS",
      style: "poster",
    },
    {
      text: "“You had me\nat the first\nsip.”",
      label: "02 / A MOMENT, REMEMBERED",
      style: "note",
    },
    {
      text: "GOOD\nENERGY\nGETS\nAROUND.",
      label: "03 / LET IT TRAVEL",
      style: "type",
    },
  ];
  return (
    <section id="voices" className="v-voices">
      <div className="v-section-meta">
        <span>02 / A CHORUS OF GOOD WORDS</span>
        <span>IMAGINED VOICES. REAL POSSIBILITIES.</span>
      </div>
      <div className="v-voices-heading">
        <h2>
          FEEL IT.
          <br />
          <em>Pass it on.</em>
        </h2>
        <span className="v-side-copy">
          Some things deserve
          <br />
          more than a quiet thank you.
        </span>
      </div>
      <div className="v-voice-cards">
        {cards.map((card, i) => (
          <button
            key={card.style}
            className={`v-voice-card v-card-${card.style} ${active === i ? "v-card-selected" : ""}`}
            onClick={() => setActive(i)}
            aria-pressed={active === i}
            aria-label={`Spotlight poster ${i + 1}: ${card.text.replaceAll("\n", " ")}`}
          >
            <span className="v-card-meta">
              {card.label}
              <span>↗</span>
            </span>
            <span className="v-card-art">
              {i === 0 ? "✳" : i === 1 ? "“" : "↗"}
            </span>
            <span className="v-card-words">{card.text}</span>
            <span className="v-card-bottom">
              PRAISLY
              <span>
                {i === 1 ? "A FICTIONAL LOVE NOTE" : "GOOD WORDS, LOUDER."}
              </span>
            </span>
          </button>
        ))}
      </div>
      <div className="v-wall-caption">
        <span>TOUCH A CARD. GIVE IT THE SPOTLIGHT.</span>
        <span>← THE WORD IS GETTING AROUND →</span>
      </div>
    </section>
  );
}

function SignalScene({ paused }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current,
      motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    const update = () => {
      frame = 0;
      if (paused) return;
      const b = el.getBoundingClientRect();
      const progress = Math.max(
        0,
        Math.min(
          1,
          (window.innerHeight - b.top) / (window.innerHeight + b.height),
        ),
      );
      el.style.setProperty(
        "--signal-progress",
        motion.matches ? ".5" : String(progress),
      );
    };
    const scroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", scroll, { passive: true });
    window.addEventListener("resize", scroll);
    update();
    return () => {
      window.removeEventListener("scroll", scroll);
      window.removeEventListener("resize", scroll);
      cancelAnimationFrame(frame);
    };
  }, [paused]);
  return (
    <section id="signal" className="v-signal" ref={ref}>
      <div className="v-section-meta">
        <span>01 / FROM A WHISPER TO A WAVE</span>
        <span>SCROLL TO SEND IT FURTHER ↓</span>
      </div>
      <div className="v-signal-stage">
        <div className="v-signal-rings" aria-hidden="true">
          {Array.from({ length: 8 }, (_, i) => (
            <span key={i} style={{ "--ring": i }} />
          ))}
        </div>
        <div className="v-signal-core" aria-hidden="true">
          ✳
        </div>
        <h2>
          <span>ONE GOOD</span>
          <em>word.</em>
          <span>EVERYWHERE.</span>
        </h2>
        <div className="v-orbit-word v-word-one">“THAT WAS LOVELY.”</div>
        <div className="v-orbit-word v-word-two">“YOU HAVE TO GO.”</div>
        <div className="v-orbit-word v-word-three">“MY NEW FAVOURITE.”</div>
      </div>
      <div className="v-signal-foot">
        <span>REPUTATION IS A RIPPLE EFFECT.</span>
        <span>LET YOURS MOVE.</span>
      </div>
    </section>
  );
}

function Playground({ palette, setPalette }) {
  const [shape, setShape] = useState(0);
  return (
    <section className="v-playground" id="play">
      <div className="v-section-meta">
        <span>03 / NO SMALL ENERGY</span>
        <span>GO ON. PLAY A LITTLE.</span>
      </div>
      <div className="v-playground-grid">
        <div className="v-play-copy">
          <h2>
            A LITTLE
            <br />
            <em>unexpected.</em>
          </h2>
          <p>
            Because being remembered
            <br />
            should never look forgettable.
          </p>
          <div
            className="v-palette-control"
            aria-label="Choose the visual palette"
          >
            {[
              ["acid", "Acid"],
              ["violet", "Ultraviolet"],
              ["ember", "Ember"],
            ].map(([value, name]) => (
              <button
                key={value}
                aria-pressed={palette === value}
                onClick={() => setPalette(value)}
              >
                <span className={`v-swatch v-swatch-${value}`} />
                {name}
              </button>
            ))}
          </div>
          <button className="v-remix" onClick={() => setShape((shape + 1) % 3)}>
            Remix the shape <span>↻</span>
          </button>
        </div>
        <div
          className={`v-play-art v-shape-${shape}`}
          aria-label={`Abstract sculpture variation ${shape + 1}`}
          role="img"
        >
          <div className="v-art-grid" />
          <div className="v-ribbon-sculpture" aria-hidden="true">
            {Array.from({ length: 12 }, (_, i) => (
              <i key={i} style={{ "--i": i }} />
            ))}
          </div>
          <span className="v-art-label">FORM / 00{shape + 1}</span>
          <span className="v-art-corner">✳</span>
        </div>
      </div>
    </section>
  );
}

export default function VisualLanding() {
  const [paused, setPaused] = useState(false);
  const [palette, setPalette] = useState("acid");
  return (
    <div className={`v-world v-palette-${palette} ${paused ? "v-paused" : ""}`}>
      <div className="v-grain" aria-hidden="true" />
      <header className="v-nav">
        <VisualBrand />
        <nav aria-label="Visual experience">
          <a href="#signal">The feeling</a>
          <a href="#play">Playground</a>
          <Link to="/preview/studio">
            Inside Praisly <Arrow diagonal />
          </Link>
        </nav>
        <span className="v-edition">
          A NEW FREQUENCY
          <br />
          VOL. 02 — 2026
        </span>
      </header>
      <main>
        <section className="v-hero">
          <div className="v-hero-meta">
            <span>
              <i /> REPUTATION, IN FULL COLOUR.
            </span>
            <span>INDEPENDENT SPIRIT. LOCAL SOUL.</span>
          </div>
          <div className="v-hero-stage">
            <ChromeSculpture paused={paused} palette={palette} />
            <div className="v-hero-type">
              <h1>
                <span>MAKE</span>
                <span>SOME</span>
                <span className="v-noise-word">
                  NOISE<span className="v-type-dot">.</span>
                </span>
              </h1>
              <span className="v-hero-subtitle">
                FOR THE PLACES
                <br />
                THAT MAKE US FEEL SOMETHING.
              </span>
            </div>
            <a className="v-orbit-link" href="#signal">
              <svg viewBox="0 0 120 120" aria-hidden="true">
                <defs>
                  <path
                    id="v-circle-text"
                    d="M60,60m-44,0a44,44 0 1,1 88,0a44,44 0 1,1 -88,0"
                  />
                </defs>
                <text>
                  <textPath href="#v-circle-text">
                    GOOD WORDS TRAVEL · GOOD WORDS TRAVEL ·{" "}
                  </textPath>
                </text>
              </svg>
              <span>↓</span>
              <span className="v-sr-only">Enter the visual experience</span>
            </a>
          </div>
          <div className="v-hero-baseline">
            <span>SCROLL TO FEEL THE FREQUENCY ↓</span>
            <span className="v-baseline-line" />
            <button onClick={() => setPaused(!paused)} aria-pressed={paused}>
              {paused ? "▶ PLAY MOTION" : "Ⅱ PAUSE MOTION"}
            </button>
          </div>
        </section>
        <div className="v-ticker" aria-label="Good words. Big energy.">
          <div aria-hidden="true">
            {[0, 1, 2, 3].map((i) => (
              <span key={i}>
                GOOD WORDS <b>✳</b> BIG ENERGY <b>↗</b>
              </span>
            ))}
          </div>
        </div>
        <SignalScene paused={paused} />
        <VoiceWall />
        <section className="v-interlude">
          <span className="v-interlude-tag">
            THE HUMAN PART. TURNED ALL THE WAY UP.
          </span>
          <div
            className="v-interlude-type"
            aria-label="Noticed. Remembered. Loved."
          >
            <span>NOTICED.</span>
            <span>REMEMBERED.</span>
            <span>
              LOVED<span className="v-interlude-star">✳</span>
            </span>
          </div>
          <div className="v-interlude-foot">
            <span>LESS BACKGROUND NOISE.</span>
            <span>MORE YOU.</span>
          </div>
        </section>
        <Playground palette={palette} setPalette={setPalette} />
        <section className="v-finale">
          <div className="v-section-meta">
            <span>04 / THE AFTERGLOW</span>
            <span>THIS IS JUST THE BEGINNING.</span>
          </div>
          <div className="v-finale-orb" aria-hidden="true" />
          <h2>
            HARD TO
            <br />
            <em>forget.</em>
          </h2>
          <Link className="v-finale-link" to="/preview/studio">
            STEP INSIDE PRAISLY <Arrow diagonal />
          </Link>
          <div className="v-finale-small">
            GOOD EXPERIENCES DESERVE A LITTLE MORE SPACE IN THE WORLD.
          </div>
        </section>
      </main>
      <footer className="v-footer">
        <VisualBrand />
        <span>BUILT AROUND FEELING.</span>
        <div>
          <Link to="/preview/editorial">The quieter edition ↗</Link>
          <Link to="/preview/review">Customer experience ↗</Link>
          <a href="#">BACK TO TOP ↑</a>
        </div>
      </footer>
    </div>
  );
}
