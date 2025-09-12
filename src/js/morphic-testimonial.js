import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

// Morphic Hero Testimonial Block (ESM)
// Requires GSAP and ScrollTrigger loaded globally

// Removed path morphing; new visual uses static SVG with subtle float & sparkle.
const VISIBILITY_THRESHOLD = 0.35;
const POINTER_MAGNET_DISTANCE = 160;
const POINTER_MAGNET_STRENGTH = 0.25;
const WORD_STAGGER_TIME = 0.06;
const CONFETTI_COUNT = 18;
const PARTICLE_DRIFT_AMT = 18;
const WAVE_REPEAT_DELAY = 2.5;
const REDUCED_MOTION_MODE = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

class MorphicTestimonial {
  constructor(section) {
    this.section = section;
    this.quote = section.querySelector('.morphic-quote');
    this.title = section.querySelector('.morphic-title');
  this.visual = section.querySelector('.tooth-orb');
  this.sparkLayer = section.querySelector('.spark-layer');
  this.sparks = this.sparkLayer ? Array.from(this.sparkLayer.querySelectorAll('.spark')) : [];
    this.wordSpans = [];
    this.morphTl = null;
    this.waveTl = null;
    this.confettiNodes = [];
    this.active = false;
    this.revealed = false;
    this.pointerActive = false;
    this._pointerPos = { x: 0, y: 0 };
    this._targetPos = { x: 0, y: 0 };
    this._vel = { x: 0, y: 0 };
    this._lastTime = null;
    this._rafId = null;
    this._idleTimer = null;
    this._idle = true;
    this._lastSweep = 0;
    this._sweepCooldown = 380; // ms
    this._maxTilt = 6; // deg
    this._setup();
  }
  _setup() {
    if (REDUCED_MOTION_MODE) {
      this.quote.setAttribute('aria-live', 'polite');
      this.quote.style.opacity = 1;
      return;
    }
    // Split quote into word spans
    const words = this.quote.textContent.trim().split(' ');
    this.quote.innerHTML = '';
    words.forEach(word => {
      const span = document.createElement('span');
      span.textContent = word + ' ';
      span.className = 'morphic-word';
      span.style.opacity = 0;
      this.quote.appendChild(span);
      this.wordSpans.push(span);
    });
    this.quote.setAttribute('aria-live', 'polite');
    // Prepare morph timeline
    this._sparkle();
    // IntersectionObserver for activation
    this._observer = new IntersectionObserver(entries => {
      const entry = entries[0];
      if (entry.intersectionRatio >= VISIBILITY_THRESHOLD) {
        this.activate();
      } else {
        this.deactivate();
      }
    }, { threshold: [0.15, VISIBILITY_THRESHOLD, 0.6] });
    this._observer.observe(this.section);
    // In case it's already visible (e.g., user reloads mid-page or small viewport)
    this._maybeAutoActivate();
    // ScrollTrigger for morph scrub
    ScrollTrigger.create({ trigger: this.section, start: 'top bottom', end: 'bottom top', scrub: 0.6 });
    // Expose API
    this.section.dataset.morphic = 'initialized';
    window.morphicHero = this;
  }
  activate() {
    if (this.active) return;
    this.active = true;
    this.section.dispatchEvent(new CustomEvent('morphic:enter'));
    if (REDUCED_MOTION_MODE) return;
    // Reveal quote word-by-word
    if (!this.revealed) {
      gsap.to(this.wordSpans, {
        opacity: 1,
        stagger: WORD_STAGGER_TIME,
        ease: 'power2.out',
        onComplete: () => {
          this._confettiBurst();
          this._startWave();
        }
      });
      gsap.to(this.title, { scale: 1.04, color: '#00A0E3', duration: 0.5, yoyo: true, repeat: 1 });
      this.revealed = true;
    } else {
      this._startWave();
    }
    // Start morph loop
    this._attachPointer();
    this._startInteractiveLoop();
  }
  deactivate() {
    if (!this.active) return;
    this.active = false;
    this.section.dispatchEvent(new CustomEvent('morphic:leave'));
    if (REDUCED_MOTION_MODE) return;
    this._detachPointer();
    this._stopWave();
    if (this.visual) gsap.to(this.visual, { x:0, y:0, duration:0.5, ease:'power2.out'});
  }
  _confettiBurst() { /* removed */ }
  _sparkle() {
    if (!this.sparks.length || REDUCED_MOTION_MODE) return;
    this.sparks.forEach((spark, i) => {
      const baseScale = 0.4 + Math.random()*0.6;
      gsap.set(spark, { scale: baseScale });
      const tl = gsap.timeline({ repeat:-1, repeatDelay: 2+Math.random()*2 });
      tl.to(spark, { opacity:1, duration:0.35, ease:'sine.out' })
        .to(spark, { scale: baseScale*1.8, duration:0.9, ease:'sine.inOut' }, 0)
        .to(spark, { opacity:0, duration:0.5, ease:'sine.in' }, '>-0.2');
    });
  }
  _startWave() {
    if (REDUCED_MOTION_MODE) return;
    if (this.waveTl) this.waveTl.kill();
    this.waveTl = gsap.timeline({ repeat: -1, repeatDelay: WAVE_REPEAT_DELAY });
    this.waveTl.to(this.wordSpans, {
      color: '#00A0E3',
      textShadow: '0 2px 8px #70D5FF',
      stagger: 0.04,
      duration: 0.6,
      yoyo: true,
      repeat: 1,
      ease: 'sine.inOut'
    });
  }
  _stopWave() {
    if (this.waveTl) this.waveTl.kill();
    this.waveTl = null;
    this.wordSpans.forEach(span => {
      span.style.color = '';
      span.style.textShadow = '';
    });
  }
  _startInteractiveLoop() {
    if (REDUCED_MOTION_MODE) return; // respect user preference
    if (this._rafId) return;
    const tooth = this.section.querySelector('.tooth-simple, .tooth2d-outline, .tooth-shape');
    const highlight = this.section.querySelector('.tooth2d-highlight, .tooth-shine');
    // prepare highlight sweep stroke dash if path
    if (highlight && !highlight._dashSetup) {
      try {
        const len = highlight.getTotalLength();
        highlight.style.strokeDasharray = len;
        highlight.style.strokeDashoffset = len * 0.9;
        highlight._pathLength = len;
        highlight._dashSetup = true;
      } catch(e) { /* not a path */ }
    }
    if (!tooth) return;
    const lerp = (a,b,t)=> a + (b-a)*t;
  // quick setters to avoid spawning many tweens
  const quickOpacity = highlight ? gsap.quickTo(highlight, 'opacity', { duration:0.25, ease:'sine.out' }) : null;
    const update = (ts) => {
      if (!this.active) { this._rafId = null; return; }
      if (!this._lastTime) this._lastTime = ts;
      const dt = (ts - this._lastTime) / 1000; // seconds
      this._lastTime = ts;
      // smooth follow toward target
      this._pointerPos.x = lerp(this._pointerPos.x, this._targetPos.x, 0.12);
      this._pointerPos.y = lerp(this._pointerPos.y, this._targetPos.y, 0.12);
      // velocity (approx)
      const vx = (this._targetPos.x - this._pointerPos.x) / (dt || 0.016);
      const vy = (this._targetPos.y - this._pointerPos.y) / (dt || 0.016);
      this._vel.x = lerp(this._vel.x, vx, 0.25);
      this._vel.y = lerp(this._vel.y, vy, 0.25);
      const speed = Math.min(1, Math.hypot(this._vel.x, this._vel.y) / 600);
      // Map to transforms
  const moveX = this._pointerPos.x * 0.4;
  const moveY = this._pointerPos.y * 0.4;
  // subtle tilt based on normalized pointer
  const tiltX = (this._pointerPos.y / 100) * -this._maxTilt; // invert so upward is positive rotationX
  const tiltY = (this._pointerPos.x / 100) * this._maxTilt;
      const scale = 1 + speed * 0.03; // slight pop when moving faster
      gsap.set(tooth, { x: moveX, y: moveY, scale, rotateX: tiltX, rotateY: tiltY, transformPerspective:800 });
      if (highlight) {
        if (quickOpacity) quickOpacity(0.55 + speed*0.35);
        // velocity-triggered sweep
        if (speed > 0.55) {
          const now = performance.now();
            if (now - this._lastSweep > this._sweepCooldown && highlight._pathLength) {
              this._lastSweep = now;
              gsap.fromTo(highlight,
                { strokeDashoffset: highlight._pathLength },
                { strokeDashoffset: highlight._pathLength * 0.2, duration: 0.5, ease: 'power2.out' }
              );
              gsap.to(highlight, { strokeDashoffset: highlight._pathLength * 0.9, duration: 0.6, ease: 'sine.in', delay: 0.5 });
            }
        }
      }
      // idle drift when no movement
      if (this._idle && !this.pointerActive) {
        const t = ts * 0.0004;
        gsap.set(tooth, { y: Math.sin(t)*8 });
      }
      this._rafId = requestAnimationFrame(update);
    };
    this._rafId = requestAnimationFrame(update);
  }
  _attachPointer() {
    if (this.pointerActive) return;
    this.pointerActive = true;
    this._pointerHandler = e => {
      if (!this.visual) return;
      const rect = this.visual.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const cx = rect.width/2, cy = rect.height/2;
      const dx = x-cx, dy = y-cy;
      const dist = Math.sqrt(dx*dx+dy*dy);
      let mx=0, my=0;
      if (dist < POINTER_MAGNET_DISTANCE) {
        mx = dx*POINTER_MAGNET_STRENGTH;
        my = dy*POINTER_MAGNET_STRENGTH;
        this.section.dispatchEvent(new CustomEvent('morphic:cursor-magnet', {
          detail: { strength: dist/POINTER_MAGNET_DISTANCE, pointerX: x, pointerY: y, blobCenterX: cx, blobCenterY: cy }
        }));
      } else {
        mx = dx*0.08; my = dy*0.08;
      }
      this._idle = false;
      clearTimeout(this._idleTimer);
      this._targetPos.x = mx;
      this._targetPos.y = my;
      this._idleTimer = setTimeout(()=> { this._idle = true; }, 1800);
    };
    this.visual.addEventListener('pointermove', this._pointerHandler);
    this._pointerLeave = () => {
      this._targetPos.x = 0; this._targetPos.y = 0;
      this._idle = true;
    };
    this.visual.addEventListener('pointerleave', this._pointerLeave);
  }
  _detachPointer() {
    if (!this.pointerActive) return;
    this.pointerActive = false;
    if (this.visual) {
      this.visual.removeEventListener('pointermove', this._pointerHandler);
      this.visual.removeEventListener('pointerleave', this._pointerLeave);
    }
  }
  _maybeAutoActivate() {
    const rect = this.section.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight;
    const visible = rect.top < vh * (1 - (1 - VISIBILITY_THRESHOLD)) && rect.bottom > 0;
    if (visible) this.activate();
  }
  destroy() {
    if (this._observer) this._observer.disconnect();
    ScrollTrigger.getAll().forEach(t => t.kill());
    if (this.waveTl) this.waveTl.kill();
    if (this._rafId) cancelAnimationFrame(this._rafId);
    this._detachPointer();
    this.section.dataset.morphic = '';
  }
}

// Auto-init if block exists
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    const section = document.getElementById('morphic-testimonial');
    if (section) new MorphicTestimonial(section);
  });
} else {
  const section = document.getElementById('morphic-testimonial');
  if (section) new MorphicTestimonial(section);
}
