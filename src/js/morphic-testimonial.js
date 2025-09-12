import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

// Morphic Hero Testimonial Block (ESM)
// Requires GSAP and ScrollTrigger loaded globally

const MORPH_PATHS = [
  "M200,60Q320,100,300,200Q280,300,200,340Q120,300,100,200Q80,100,200,60Z",
  "M200,80Q320,160,260,240Q200,320,120,260Q80,160,200,80Z",
  "M200,70Q330,130,270,220Q200,310,110,220Q70,130,200,70Z"
];
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
    this.blob = section.querySelector('#blob path');
    this.blobSVG = section.querySelector('#blob');
    this.particlesSVG = section.querySelector('.morphic-particles');
    this.confetti = section.querySelector('.morphic-confetti');
    this.wordSpans = [];
    this.morphTl = null;
    this.waveTl = null;
    this.confettiNodes = [];
    this.active = false;
    this.revealed = false;
    this.pointerActive = false;
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
    this.blob.setAttribute('d', MORPH_PATHS[0]);
    this.morphTl = gsap.timeline({ paused: true })
      .to(this.blob, { duration: 1.2, morphSVG: MORPH_PATHS[1], ease: 'sine.inOut' })
      .to(this.blob, { duration: 1.2, morphSVG: MORPH_PATHS[2], ease: 'sine.inOut' })
      .to(this.blob, { duration: 1.2, morphSVG: MORPH_PATHS[0], ease: 'sine.inOut' });
    // Particle drift
    this._driftParticles();
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
    // ScrollTrigger for morph scrub
    ScrollTrigger.create({
      trigger: this.section,
      start: 'top bottom',
      end: 'bottom top',
      scrub: 0.6,
      onUpdate: self => {
        if (!REDUCED_MOTION_MODE && this.morphTl) {
          this.morphTl.progress(self.progress);
        }
      }
    });
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
    if (this.morphTl) this.morphTl.play();
    // Pointer parallax
    this._attachPointer();
  }
  deactivate() {
    if (!this.active) return;
    this.active = false;
    this.section.dispatchEvent(new CustomEvent('morphic:leave'));
    if (REDUCED_MOTION_MODE) return;
    if (this.morphTl) this.morphTl.pause();
    this._detachPointer();
    this._stopWave();
    gsap.to(this.blobSVG, { x: 0, y: 0, duration: 0.5, ease: 'power2.out' });
    gsap.to(this.particlesSVG, { x: 0, y: 0, duration: 0.5, ease: 'power2.out' });
  }
  _driftParticles() {
    if (!this.particlesSVG) return;
    Array.from(this.particlesSVG.children).forEach((circle, i) => {
      gsap.to(circle, {
        x: `+=${Math.random()*PARTICLE_DRIFT_AMT-8}`,
        y: `+=${Math.random()*PARTICLE_DRIFT_AMT-8}`,
        duration: 2.5 + Math.random()*2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: i*0.2
      });
    });
  }
  _confettiBurst() {
    if (!this.confetti) return;
    this.confetti.innerHTML = '';
    for (let i=0; i<CONFETTI_COUNT; i++) {
      const dot = document.createElement('div');
      dot.className = 'morphic-confetti-dot';
      dot.style.position = 'absolute';
      dot.style.width = dot.style.height = `${6+Math.random()*6}px`;
      dot.style.borderRadius = '50%';
      dot.style.background = `linear-gradient(90deg,#00A0E3,#70D5FF)`;
      dot.style.left = '170px';
      dot.style.top = '170px';
      this.confetti.appendChild(dot);
      const angle = Math.random()*2*Math.PI;
      const dist = 60+Math.random()*60;
      gsap.to(dot, {
        x: Math.cos(angle)*dist,
        y: Math.sin(angle)*dist,
        opacity: 0,
        scale: 0.7+Math.random()*0.7,
        duration: 1.2+Math.random()*0.5,
        ease: 'power2.out',
        onComplete: () => dot.remove()
      });
    }
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
  _attachPointer() {
    if (this.pointerActive) return;
    this.pointerActive = true;
    this._pointerHandler = e => {
      const rect = this.blobSVG.getBoundingClientRect();
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
      gsap.to(this.blobSVG, { x: mx, y: my, duration: 0.4, ease: 'power2.out' });
      gsap.to(this.particlesSVG, { x: mx*0.5, y: my*0.5, duration: 0.6, ease: 'power2.out' });
    };
    this.blobSVG.parentElement.addEventListener('pointermove', this._pointerHandler);
  }
  _detachPointer() {
    if (!this.pointerActive) return;
    this.pointerActive = false;
    this.blobSVG.parentElement.removeEventListener('pointermove', this._pointerHandler);
  }
  destroy() {
    if (this._observer) this._observer.disconnect();
    ScrollTrigger.getAll().forEach(t => t.kill());
    if (this.morphTl) this.morphTl.kill();
    if (this.waveTl) this.waveTl.kill();
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
