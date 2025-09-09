// Import dependencies
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Observer } from 'gsap/Observer';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger, Observer);

// Wait for DOM to be loaded
document.addEventListener('DOMContentLoaded', () => {
  // Initialize elements
  const heroSection = document.querySelector('.hero-section');
  const heroBgImage = document.querySelector('.hero-bg-image');
  const heroContent = document.querySelector('.hero-content');
  const heroImage = document.querySelector('.hero-image');
  const faqItems = document.querySelectorAll('.faq-item');
  
  // Mobile Menu Functionality
  const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
  const navMenu = document.querySelector('.nav-menu');
  const navLinks = document.querySelectorAll('.nav-menu li a');
  
  if (mobileMenuBtn && navMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileMenuBtn.classList.toggle('active');
      navMenu.classList.toggle('active');
      document.body.classList.toggle('menu-open');
    });
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
      if (navMenu.classList.contains('active') && 
          !navMenu.contains(e.target) && 
          !mobileMenuBtn.contains(e.target)) {
        mobileMenuBtn.classList.remove('active');
        navMenu.classList.remove('active');
        document.body.classList.remove('menu-open');
      }
    });
    
    // Close mobile menu when clicking a link
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileMenuBtn.classList.remove('active');
        navMenu.classList.remove('active');
        document.body.classList.remove('menu-open');
      });
    });
  }
  
  // Initialize Lenis for smooth scrolling (global vertical scrolling)
  const lenis = new Lenis({
    duration: 1.4,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    mouseMultiplier: 1,
    smoothTouch: true,
    touchMultiplier: 2,
    infinite: false,
  });

  // Connect lenis to RAF (Request Animation Frame)
  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  // Sync ScrollTrigger with Lenis
  lenis.on('scroll', ScrollTrigger.update);
  
  // Initial loading animation - optimized to prevent jumping
  const tl = gsap.timeline();
  
  // Make sure elements are properly positioned before animation
  gsap.set(heroBgImage, { opacity: 0, x: 0, y: 0 });
  gsap.set(heroImage, { opacity: 0, x: 0, y: 0, rotationX: 0, rotationY: 0 });
  gsap.set(heroContent, { opacity: 0, y: 20 });
  
  tl.to(heroBgImage, { 
      opacity: 1, 
      duration: 1.5, 
      ease: 'power2.out',
      clearProps: 'opacity'
    })
    .to(heroImage, { 
      opacity: 1,
      duration: 1.2, 
      ease: 'power3.out',
      clearProps: 'opacity'
    }, '-=0.8')
    .to(heroContent, { 
      opacity: 1, 
      y: 0, 
      duration: 1.2, 
      ease: 'power3.out',
      clearProps: 'opacity'
    }, '-=0.8');

  // Advanced Parallax for Hero Section - optimized to prevent jumping
  const heroParallax = gsap.timeline({
    scrollTrigger: {
      trigger: heroSection,
      start: 'top top',
      end: 'bottom top',
      scrub: 0.5,
      invalidateOnRefresh: true
    }
  });
  
  // Create a hyper-interactive parallax effect with more stable transforms
  heroParallax
    .to(heroBgImage, {
      y: '30%',
      scale: 1.1,
      ease: 'none',
      force3D: true
    }, 0)
    .to(heroContent.querySelector('h1'), {
      y: '-80%',
      ease: 'none',
      force3D: true
    }, 0)
    .to(heroContent.querySelector('p'), {
      y: '-60%',
      ease: 'none',
      force3D: true
    }, 0)
    .to(heroContent.querySelector('.btn'), {
      y: '-40%',
      ease: 'none',
      force3D: true
    }, 0)
    .to(heroImage, {
      y: '15%',
      scale: 0.85,
      ease: 'none',
      force3D: true
    }, 0);
    
  // Create a smooth exit animation for the hero section as courses section appears
  const heroExitAnimation = gsap.timeline({
    scrollTrigger: {
      trigger: coursesSection,
      start: 'top bottom',
      end: 'top 70%',
      scrub: true,
    }
  });
  
  // Add a subtle fade out and scale effect to the hero as we scroll down
  heroExitAnimation
    .to(heroSection, {
      opacity: 0.7,
      scale: 0.95,
      ease: 'power1.in',
      force3D: true,
    });
  
  // Mouse movement parallax - optimized to prevent jumping
  let mouseTl = gsap.timeline({ paused: true });
  
  // Pre-define the animation timeline
  mouseTl
    .to(heroBgImage, {
      x: 20,
      y: 20,
      duration: 1,
      ease: 'power2.out'
    }, 0)
    .to(heroImage, {
      x: -15,
      y: -15,
      rotationY: 5,
      rotationX: -5,
      duration: 1, 
      ease: 'power2.out'
    }, 0)
    .to(heroContent.querySelector('h1'), {
      x: 10,
      duration: 1,
      ease: 'power2.out'
    }, 0);
  
  // Use Observer to control the progress of the timeline
  Observer.create({
    target: heroSection,
    type: 'pointer',
    onMove: (self) => {
      const xProgress = gsap.utils.clamp(0, 1, (self.x / window.innerWidth));
      const yProgress = gsap.utils.clamp(0, 1, (self.y / window.innerHeight));
      
      // Map x and y to -1 to 1 range
      const xNorm = xProgress * 2 - 1;
      const yNorm = yProgress * 2 - 1;
      
      // Apply the normalized values to control timeline progress
      gsap.to(heroBgImage, {
        x: xNorm * 20,
        y: yNorm * 20,
        overwrite: 'auto',
        duration: 1,
        ease: 'power3.out'
      });
      
      gsap.to(heroImage, {
        x: xNorm * -15,
        y: yNorm * -15,
        rotationY: xNorm * 5,
        rotationX: yNorm * -5,
        overwrite: 'auto',
        duration: 1,
        ease: 'power3.out'
      });
      
      gsap.to(heroContent.querySelector('h1'), {
        x: xNorm * 10,
        overwrite: 'auto',
        duration: 1,
        ease: 'power3.out'
      });
    }
  });
  
  // Courses Section - Horizontal Smooth Scroll Gallery Implementation
  const coursesSection = document.querySelector('.courses-section');
  const slidesWrapper = document.querySelector('#slidesWrapper');
  const slidesContainer = document.querySelector('#slidesContainer');
  const slides = document.querySelectorAll('.slide');
  const progressFill = document.querySelector('.progress-fill');
  const currentSlideEl = document.querySelector('.current');
  const totalSlidesEl = document.querySelector('.total');

  // Entrance animation for courses header
  gsap.set([coursesSection.querySelector('.section-title'), coursesSection.querySelector('.section-subtitle')], { 
    opacity: 0, 
    y: 30 
  });

  // Create a smooth transition ScrollTrigger between hero and courses sections
  const heroToCoursesTl = gsap.timeline({
    scrollTrigger: {
      trigger: coursesSection,
      start: 'top bottom',
      end: 'top 50%',
      scrub: true,
      markers: false,
    }
  });

  // Add the smooth reveal animation from top
  heroToCoursesTl
    .from(coursesSection, {
      y: 100,
      opacity: 0.5,
      scale: 0.98,
      ease: 'power2.out',
    })
    .to(coursesSection, {
      y: 0,
      opacity: 1,
      scale: 1,
      ease: 'power2.inOut',
    });

  // Standard entrance animation for the header content
  ScrollTrigger.create({
    trigger: coursesSection,
    start: 'top 80%',
    onEnter: () => {
      gsap.to(coursesSection.querySelector('.section-title'), {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power3.out'
      });
      gsap.to(coursesSection.querySelector('.section-subtitle'), {
        opacity: 1,
        y: 0,
        duration: 0.8,
        delay: 0.2,
        ease: 'power3.out'
      });
    }
  });

  // Set the total number of slides
  const totalSlides = slides.length;
  if (totalSlidesEl) {
    totalSlidesEl.textContent = totalSlides.toString().padStart(2, '0');
  }

  // Initialize
  let currentSlide = 0;

  // Create a horizontal scroll animation
  const horizontalScrollTl = gsap.timeline({
    scrollTrigger: {
      trigger: '.horizontal-slider-container',
      pin: true,
      pinSpacing: true,
      start: "top top",
      end: "+=2000", // Adjust this value to control scroll distance
      scrub: 1,
      onEnter: () => {
        // Show the progress bar and counter
        gsap.to('.slider-progress-container', {
          opacity: 1,
          duration: 0.5
        });
        
        // Initialize first slide
        slides[0].classList.add('active');
        gsap.to(slides[0].querySelector('.slide-content'), {
          opacity: 1,
          y: 0,
          duration: 0.5
        });
      },
      onUpdate: self => {
        // Update progress bar
        if (progressFill) {
          gsap.to(progressFill, {
            width: `${self.progress * 100}%`,
            duration: 0.1,
            overwrite: true
          });
        }
        
        // Calculate which slide should be active
        const newSlide = Math.floor(self.progress * totalSlides);
        if (newSlide < totalSlides && currentSlideEl) {
          currentSlideEl.textContent = (newSlide + 1).toString().padStart(2, '0');
        }
        
        // Update slides visibility
        slides.forEach((slide, i) => {
          const slideProgress = (self.progress * totalSlides) - i;
          const isActive = slideProgress > -0.5 && slideProgress < 0.5;
          
          if (isActive) {
            slide.classList.add('active');
            gsap.to(slide.querySelector('.slide-content'), {
              opacity: 1,
              y: 0,
              duration: 0.5,
              ease: 'power2.out'
            });
          } else {
            slide.classList.remove('active');
            gsap.to(slide.querySelector('.slide-content'), {
              opacity: 0,
              y: 20,
              duration: 0.3,
              ease: 'power2.in'
            });
          }
        });
      }
    }
  });

  // Animate the horizontal scroll
  horizontalScrollTl.to(slidesContainer, {
    x: () => -(slidesContainer.scrollWidth - window.innerWidth + 100), // Add some extra space
    ease: "none"
  });

  // Add parallax effect to slide backgrounds
  slides.forEach(slide => {
    const bg = slide.querySelector('.slide-bg');
    
    // Create parallax effect on slide background as it moves
    gsap.to(bg, {
      xPercent: -20,
      ease: 'none',
      scrollTrigger: {
        trigger: slide,
        containerAnimation: horizontalScrollTl,
        start: 'left right',
        end: 'right left',
        scrub: 0.5
      }
    });
  });
  
  // FAQ items animation (appear on scroll with diagonal stagger)
  faqItems.forEach((item, index) => {
    // Calculate position in grid (assuming 3 columns in desktop and 1 in mobile)
    const row = Math.floor(index / 3);
    const col = index % 3;
    
    // Create diagonal stagger delay (items diagonally aligned animate together)
    const diagonalIndex = row + col;
    const staggerDelay = diagonalIndex * 0.15;
    
    gsap.set(item, { 
      opacity: 0,
      y: 30,
      x: 20
    });
    
    ScrollTrigger.create({
      trigger: item,
      start: 'top 85%',
      onEnter: () => {
        gsap.to(item, {
          opacity: 1,
          y: 0,
          x: 0,
          duration: 0.8,
          delay: staggerDelay,
          ease: 'power3.out',
          onComplete: () => {
            item.classList.add('active');
          }
        });
      }
    });
    
    // Add click event for FAQ items
    item.querySelector('.faq-question').addEventListener('click', () => {
      const answer = item.querySelector('.faq-answer');
      const isExpanded = answer.style.maxHeight;
      
      // Close all other answers
      document.querySelectorAll('.faq-answer').forEach(a => {
        a.style.maxHeight = null;
      });
      
      document.querySelectorAll('.faq-item').forEach(faqItem => {
        if (faqItem !== item) {
          gsap.to(faqItem, {
            backgroundColor: 'white',
            boxShadow: '0 5px 15px rgba(0, 0, 0, 0.05)',
            duration: 0.3
          });
        }
      });
      
      // Toggle current answer
      if (!isExpanded) {
        answer.style.maxHeight = answer.scrollHeight + 'px';
        gsap.to(item, {
          backgroundColor: 'rgba(0, 160, 227, 0.05)',
          boxShadow: '0 15px 30px rgba(0, 0, 0, 0.15)',
          duration: 0.3
        });
      } else {
        answer.style.maxHeight = null;
        gsap.to(item, {
          backgroundColor: 'white',
          boxShadow: '0 5px 15px rgba(0, 0, 0, 0.05)',
          duration: 0.3
        });
      }
    });
  });
  
  // Portfolio Gallery Section Animation - Inspired by Alex Tourgis
  const portfolioSection = document.querySelector('.portfolio-section');
  const galleryItems = document.querySelectorAll('.gallery-item');
  
  // Create a timeline for each gallery item
  galleryItems.forEach((item, index) => {
    const imageContainer = item.querySelector('.gallery-image-container');
    const image = item.querySelector('.gallery-image');
    const content = item.querySelector('.gallery-content');
    
    // Set initial states
    gsap.set(item, { opacity: 1 });
    gsap.set(imageContainer, { scale: 0.8 });
    gsap.set(image, { scale: 1.2 });
    gsap.set(content, { 
      opacity: 0,
      x: index % 2 === 0 ? 50 : -50 
    });
    
    // Create the scroll-triggered animation
    const itemTl = gsap.timeline({
      scrollTrigger: {
        trigger: item,
        start: 'top 70%',
        end: 'center 30%',
        scrub: 0.6,
        markers: false,
      }
    });
    
    // Add animations to the timeline
    itemTl
      .to(imageContainer, {
        scale: 1,
        duration: 1,
        ease: 'power2.out'
      }, 0)
      .to(image, {
        scale: 1,
        duration: 1.5,
        ease: 'power2.out'
      }, 0)
      .to(content, {
        x: 0,
        opacity: 1,
        duration: 1,
        ease: 'power2.out'
      }, 0.2);
      
    // Add a reveal animation for text elements
    const title = content.querySelector('h3');
    const paragraph = content.querySelector('p');
    const number = content.querySelector('.gallery-number');
    
    gsap.from([number, title, paragraph], {
      y: 30,
      opacity: 0,
      stagger: 0.1,
      duration: 0.8,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: content,
        start: 'top 70%',
        toggleActions: 'play none none none'
      }
    });
  });
  
  // Update ScrollTrigger when window resizes
  // Custom debounce function
  function debounce(func, wait) {
    let timeout;
    return function(...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  // Testimonials Section Animation with Instagram-style videos
  const videoTestimonials = document.querySelectorAll('.video-testimonial');
  
  videoTestimonials.forEach((testimonial, index) => {
    // Set initial state
    gsap.set(testimonial, { opacity: 0, y: 30 });
    
    // Add staggered entrance animation
    ScrollTrigger.create({
      trigger: testimonial,
      start: 'top 85%',
      onEnter: () => {
        gsap.to(testimonial, {
          opacity: 1,
          y: 0,
          duration: 0.8,
          delay: index * 0.15,
          ease: 'power3.out',
          onComplete: () => {
            testimonial.classList.add('active');
          }
        });
      }
    });
    
    // Handle video functionality
    const videoEl = testimonial.querySelector('video');
    const playBtn = testimonial.querySelector('.play-btn');
    const videoOverlay = testimonial.querySelector('.video-overlay');
    const likeCount = testimonial.querySelector('.video-like-count');
    
    if (videoEl && playBtn) {
      playBtn.addEventListener('click', () => {
        if (videoEl.paused) {
          // Pause all other videos first
          document.querySelectorAll('.video-testimonial video').forEach(video => {
            if (video !== videoEl) {
              video.pause();
              const overlay = video.closest('.video-testimonial').querySelector('.video-overlay');
              if (overlay) overlay.style.opacity = '1';
            }
          });
          
          // Play this video
          videoEl.play();
          videoOverlay.style.opacity = '0';
          
          // Simulate Instagram-style like animation when video plays
          gsap.fromTo(likeCount, 
            { scale: 1 },
            { 
              scale: 1.3, 
              duration: 0.3, 
              ease: 'back.out(1.7)', 
              yoyo: true,
              repeat: 1
            }
          );
          
          // Add mute/unmute functionality
          videoEl.muted = false;
        } else {
          videoEl.pause();
          videoOverlay.style.opacity = '1';
        }
      });
      
      // Double-click to like (Instagram-style)
      videoEl.addEventListener('dblclick', () => {
        const heart = document.createElement('div');
        heart.innerHTML = '<i class="fas fa-heart"></i>';
        heart.className = 'instagram-heart';
        Object.assign(heart.style, {
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: 'white',
          fontSize: '80px',
          opacity: '0',
          zIndex: '10',
          pointerEvents: 'none'
        });
        
        testimonial.querySelector('.video-wrapper').appendChild(heart);
        
        gsap.timeline()
          .to(heart, {
            opacity: 1,
            scale: 1.2,
            duration: 0.3,
            ease: 'back.out(1.7)'
          })
          .to(heart, {
            opacity: 0,
            scale: 0.5,
            duration: 0.3,
            delay: 0.5,
            onComplete: () => heart.remove()
          });
          
        // Increment like count animation
        gsap.fromTo(likeCount, 
          { scale: 1 },
          { 
            scale: 1.3, 
            duration: 0.3, 
            ease: 'back.out(1.7)', 
            yoyo: true,
            repeat: 1
          }
        );
      });
      
      // Reset when video ends
      videoEl.addEventListener('ended', () => {
        videoOverlay.style.opacity = '1';
      });
    }
  });
  
  // Pricing Section Animation
  const pricingCards = document.querySelectorAll('.pricing-card');
  const pricingGuarantee = document.querySelector('.pricing-guarantee');
  
  pricingCards.forEach((card, index) => {
    gsap.set(card, { opacity: 0, y: 30 });
    
    ScrollTrigger.create({
      trigger: card,
      start: 'top 85%',
      onEnter: () => {
        gsap.to(card, {
          opacity: 1,
          y: 0,
          duration: 0.8,
          delay: index * 0.15,
          ease: 'power3.out',
          onComplete: () => {
            card.classList.add('active');
          }
        });
      }
    });
  });
  
  if (pricingGuarantee) {
    gsap.set(pricingGuarantee, { opacity: 0, y: 20 });
    
    ScrollTrigger.create({
      trigger: pricingGuarantee,
      start: 'top 85%',
      onEnter: () => {
        gsap.to(pricingGuarantee, {
          opacity: 1,
          y: 0,
          duration: 0.8,
          delay: 0.3,
          ease: 'power3.out',
          onComplete: () => {
            pricingGuarantee.classList.add('active');
          }
        });
      }
    });
  }
  
  // CTA Section Animation
  const ctaSection = document.querySelector('.cta-section');
  const ctaContent = document.querySelector('.cta-content');
  const ctaForm = document.querySelector('.cta-form');
  const ctaFeatures = document.querySelectorAll('.cta-feature');
  
  if (ctaContent && ctaForm) {
    const ctaHeading = ctaContent.querySelector('h2');
    const ctaParagraph = ctaContent.querySelector('p');
    
    gsap.set([ctaHeading, ctaParagraph, ctaForm], { opacity: 0, y: 30 });
    gsap.set(ctaFeatures, { opacity: 0, x: -20 });
    
    ScrollTrigger.create({
      trigger: ctaSection,
      start: 'top 70%',
      onEnter: () => {
        gsap.to(ctaHeading, {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
          onComplete: () => {
            ctaHeading.classList.add('active');
          }
        });
        
        gsap.to(ctaParagraph, {
          opacity: 1,
          y: 0,
          duration: 0.8,
          delay: 0.2,
          ease: 'power3.out',
          onComplete: () => {
            ctaParagraph.classList.add('active');
          }
        });
        
        gsap.to(ctaForm, {
          opacity: 1,
          y: 0,
          duration: 0.8,
          delay: 0.3,
          ease: 'power3.out',
          onComplete: () => {
            ctaForm.classList.add('active');
          }
        });
        
        ctaFeatures.forEach((feature, index) => {
          gsap.to(feature, {
            opacity: 1,
            x: 0,
            duration: 0.6,
            delay: 0.4 + (index * 0.1),
            ease: 'power3.out',
            onComplete: () => {
              feature.classList.add('active');
            }
          });
        });
      }
    });
  }
  
  // Footer Animation
  const footerSection = document.querySelector('.footer');
  const footerColumns = document.querySelectorAll('.footer-grid > div');
  const footerBottom = document.querySelector('.footer-bottom');
  
  if (footerSection && footerColumns.length > 0) {
    gsap.set(footerColumns, { opacity: 0, y: 20 });
    gsap.set(footerBottom, { opacity: 0 });
    
    ScrollTrigger.create({
      trigger: footerSection,
      start: 'top 80%',
      onEnter: () => {
        footerColumns.forEach((column, index) => {
          gsap.to(column, {
            opacity: 1,
            y: 0,
            duration: 0.8,
            delay: index * 0.1,
            ease: 'power3.out'
          });
        });
        
        gsap.to(footerBottom, {
          opacity: 1,
          duration: 0.8,
          delay: 0.5,
          ease: 'power3.out'
        });
      }
    });
  }

  window.addEventListener('resize', debounce(() => {
    ScrollTrigger.refresh(true);
  }, 250));

  // Handle smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      
      if (targetElement) {
        lenis.scrollTo(targetElement, {
          offset: -80, // Offset for header height
          duration: 1.5,
        });
      }
    });
  });
});
