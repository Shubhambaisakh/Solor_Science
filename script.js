document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide Icons
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  // Native smooth-scrolling is enabled globally in style.css for 100% smooth, hardware-accelerated rendering.

  /* ==========================================================================
     0. LETTER POP ANIMATION FOR TITLE
     ========================================================================== */
  const letterAnimateElements = document.querySelectorAll('.letter-animate');
  
  letterAnimateElements.forEach(element => {
    const text = element.textContent || '';
    element.textContent = '';
    
    text.split('').forEach(char => {
      const span = document.createElement('span');
      span.className = char === ' ' ? 'letter space' : 'letter';
      span.textContent = char === ' ' ? '\u00A0' : char;
      element.appendChild(span);
    });
  });

  /* ==========================================================================
     1. MOBILE MENU TOGGLE
     ========================================================================== */
  const menuToggle = document.getElementById('menu-toggle');
  const navMenu = document.getElementById('nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');

  if (menuToggle && navMenu) {
    // Toggle Menu
    menuToggle.addEventListener('click', () => {
      const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
      menuToggle.setAttribute('aria-expanded', !isExpanded);
      menuToggle.classList.toggle('active');
      navMenu.classList.toggle('active');
      
      // Prevent body scroll when menu is active
      document.body.style.overflow = isExpanded ? '' : 'hidden';
    });

    // Close Menu when clicking Links
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.classList.remove('active');
        navMenu.classList.remove('active');
        document.body.style.overflow = '';
      });
    });

    // Close Menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!navMenu.contains(e.target) && !menuToggle.contains(e.target) && navMenu.classList.contains('active')) {
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.classList.remove('active');
        navMenu.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  }

  /* ==========================================================================
     2. STICKY NAVBAR ON SCROLL
     ========================================================================== */
  const navbar = document.getElementById('navbar');
  
  const handleScrollNavbar = () => {
    if (!navbar) return;
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };

  handleScrollNavbar(); // Initial check on load

  /* ==========================================================================
     3. INTERSECTION OBSERVER - SCROLL REVEALS
     ========================================================================== */
  const revealElements = document.querySelectorAll('.reveal');
  
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal-active');
        // Unobserve to keep performance optimal after animating
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -50px 0px'
  });

  revealElements.forEach(el => revealObserver.observe(el));

  /* ==========================================================================
     4. INTERSECTION OBSERVER - STATS COUNT-UP (Both Hero and About) - AUTO ANIMATE
     ========================================================================== */
  const statNumbers = document.querySelectorAll('.stat-number, .stat-number-large, .stat-number-hero');
  
  console.log('Found stat elements:', statNumbers.length);
  
  const animateCount = (element) => {
    // Get target from data attribute or text content
    let target;
    let hasPlus = false;
    let isPercentage = false;
    
    if (element.hasAttribute('data-target')) {
      // If data-target exists, use it
      target = parseInt(element.getAttribute('data-target'), 10);
      // Check original content for + or %
      const originalText = element.textContent || '';
      hasPlus = originalText.includes('+');
      isPercentage = originalText.includes('%');
    } else {
      // Extract from text content
      const originalText = element.textContent || '';
      hasPlus = originalText.includes('+');
      isPercentage = originalText.includes('%');
      target = parseInt(originalText.replace(/\D/g, ''), 10);
      // Store for future reference
      element.setAttribute('data-target', target);
    }
    
    console.log('Animating element:', element, 'Target:', target, 'hasPlus:', hasPlus);
    
    if (isNaN(target)) {
      console.warn('Invalid target for element:', element);
      return;
    }
    
    const duration = 1500; // 1.5 second animation - fast and smooth
    const startTime = performance.now();
    
    const update = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Fast easing function (easeOutCubic for speed)
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.floor(easeProgress * target);
      
      // Update text
      if (hasPlus) {
        element.textContent = currentValue + '+';
      } else if (isPercentage) {
        element.textContent = currentValue + '%';
      } else {
        element.textContent = currentValue;
      }
      
      // Add pulse effect during counting
      if (progress < 1) {
        const scale = 1 + Math.sin(progress * Math.PI * 4) * 0.05;
        element.style.transform = `scale(${scale})`;
        element.style.transition = 'transform 0.1s ease';
        requestAnimationFrame(update);
      } else {
        // Final value
        if (hasPlus) {
          element.textContent = target + '+';
        } else if (isPercentage) {
          element.textContent = target + '%';
        } else {
          element.textContent = target;
        }
        element.style.transform = 'scale(1)';
      }
    };
    
    // Start from 0
    element.textContent = '0' + (hasPlus ? '+' : isPercentage ? '%' : '');
    requestAnimationFrame(update);
  };

  // Use lower threshold so animation triggers more reliably
  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        console.log('Element entered viewport:', entry.target);
        // Animate immediately
        animateCount(entry.target);
        statsObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1, // Trigger when just 10% visible
    rootMargin: '0px 0px -50px 0px'
  });

  statNumbers.forEach(num => {
    console.log('Observing:', num);
    statsObserver.observe(num);
  });

  // highlightNav removed to prevent severe scroll lag from layout-thrashing section query lookups.
  // Active links are statically assigned per-page in their respective HTML markup.

  /* ==========================================================================
     6. FAQ ACCORDION INTERACTION
     ========================================================================== */
  const faqHeaders = document.querySelectorAll('.faq-header');

  faqHeaders.forEach(header => {
    header.addEventListener('click', () => {
      const parent = header.parentElement;
      const isActive = parent.classList.contains('active');
      
      // Close all other FAQ items for a clean single-open accordion feel
      document.querySelectorAll('.faq-item').forEach(item => {
        item.classList.remove('active');
        item.querySelector('.faq-header').setAttribute('aria-expanded', 'false');
      });
      
      if (!isActive) {
        parent.classList.add('active');
        header.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* ==========================================================================
     7. SCROLL PROGRESS BAR & THROTTLED SCROLL CONTROLLER
     ========================================================================== */
  const scrollProgress = document.getElementById('scroll-progress');
  
  const updateScrollProgress = () => {
    const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
    if (totalScroll > 0 && scrollProgress) {
      const progressPercentage = (window.scrollY / totalScroll) * 100;
      scrollProgress.style.width = `${progressPercentage}%`;
    }
  };

  updateScrollProgress(); // Initial check

  // Throttled Scroll Controller to prevent layout thrashing and scroll lag
  let isScrollTicking = false;
  const handleScrollEvent = () => {
    if (!isScrollTicking) {
      window.requestAnimationFrame(() => {
        handleScrollNavbar();
        updateScrollProgress();
        isScrollTicking = false;
      });
      isScrollTicking = true;
    }
  };

  window.addEventListener('scroll', handleScrollEvent, { passive: true });

  /* ==========================================================================
     8. AWWWARDS CUSTOM TRAILING CURSOR
     ========================================================================== */
  const cursor = document.getElementById('custom-cursor');
  const cursorDot = document.getElementById('custom-cursor-dot');
  
  // Hide cursor completely on touch/mobile devices
  const isTouchDevice = ('ontouchstart' in window) || 
    (navigator.maxTouchPoints > 0) || 
    (window.innerWidth <= 767);
  
  if (isTouchDevice) {
    if (cursor) cursor.style.display = 'none';
    if (cursorDot) cursorDot.style.display = 'none';
  }

  if (cursor && cursorDot && !isTouchDevice) {
    let mouseX = 0;
    let mouseY = 0;
    let cursorX = 0;
    let cursorY = 0;
    let hasMoved = false;
    let isAnimating = false;
    
    // Smooth custom physics outer ring loop
    const animateCursor = () => {
      const ease = 0.16; // trailing delay ease
      const dx = mouseX - cursorX;
      const dy = mouseY - cursorY;
      
      cursorX += dx * ease;
      cursorY += dy * ease;
      
      cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0) translate(-50%, -50%)`;
      cursorDot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
      
      // Stop loop when cursor matches target position closely
      if (Math.abs(dx) < 0.1 && Math.abs(dy) < 0.1) {
        isAnimating = false;
        cursor.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
        cursorDot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
      } else {
        requestAnimationFrame(animateCursor);
      }
    };
    
    // Track mouse movements
    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      
      if (!isAnimating) {
        isAnimating = true;
        requestAnimationFrame(animateCursor);
      }
      
      if (!hasMoved) {
        cursor.style.opacity = '1';
        cursorDot.style.opacity = '1';
        hasMoved = true;
      }
    });
    
    // Hide when mouse departs document window
    document.addEventListener('mouseleave', () => {
      cursor.classList.add('hidden');
      cursorDot.classList.add('hidden');
    });
    
    document.addEventListener('mouseenter', () => {
      cursor.classList.remove('hidden');
      cursorDot.classList.remove('hidden');
    });
    
    // Expand outer ring on interactive hovers
    const hoverables = document.querySelectorAll('a, button, .why-card, .faq-header, .service-card, .project-card, .pillar-card, input, select, textarea');
    
    hoverables.forEach(item => {
      item.addEventListener('mouseenter', () => {
        cursor.classList.add('hovered');
      });
      item.addEventListener('mouseleave', () => {
        cursor.classList.remove('hovered');
      });
    });
  }

  /* ==========================================================================
     9. PRELOADER LOADING SCREEN DISMISSAL
     ========================================================================== */
  const preloader = document.getElementById('preloader');
  if (preloader) {
    // Dismiss preloader after loading animation completes
    setTimeout(() => {
      preloader.classList.add('loaded');
      setTimeout(() => {
        preloader.style.display = 'none';
      }, 800); // matches CSS transition time
    }, 1600); // matches CSS progress bar loader time
  }

  /* ==========================================================================
     9.5 PAUSE OFFSCREEN ANIMATIONS GLOBAL SYSTEM (Performance Boost)
     ========================================================================== */
  const animatedContainers = document.querySelectorAll('section, .hero, .banner, .work-gallery, .why-us, footer');
  
  if (animatedContainers.length > 0) {
    const animationObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.remove('animations-paused');
        } else {
          entry.target.classList.add('animations-paused');
        }
      });
    }, {
      threshold: 0, // trigger as soon as it leaves
      rootMargin: '150px 0px 150px 0px' // buffer so animations activate slightly before entry
    });
    
    animatedContainers.forEach(container => {
      animationObserver.observe(container);
    });
  }

  /* ==========================================================================
     10. INTAKE FORM SUBMISSION - SEND TO WHATSAPP
     ========================================================================== */
  const consultationForm = document.getElementById('consultation-form');
  const successOverlay = document.getElementById('form-success-overlay');
  const resetFormBtn = document.getElementById('btn-reset-form');

  if (consultationForm && successOverlay) {
    consultationForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      // Get all form values
      const name = document.getElementById('name').value;
      const phone = document.getElementById('phone').value;
      const email = document.getElementById('email').value;
      const location = document.getElementById('location').value;
      const customerType = document.getElementById('customer-type').value;
      const message = document.getElementById('message').value;
      
      // Format WhatsApp message
      let whatsappMessage = `*New Solar Consultation Request*\n\n`;
      whatsappMessage += `👤 *Name:* ${name}\n`;
      whatsappMessage += `📱 *Phone:* ${phone}\n`;
      whatsappMessage += `📧 *Email:* ${email}\n`;
      whatsappMessage += `📍 *Location:* ${location}\n`;
      whatsappMessage += `🏢 *Property Type:* ${customerType}\n`;
      if (message) {
        whatsappMessage += `\n💬 *Message:*\n${message}`;
      }
      
      // Encode message for URL
      const encodedMessage = encodeURIComponent(whatsappMessage);
      
      // WhatsApp number (7400561349)
      const whatsappURL = `https://wa.me/917400561349?text=${encodedMessage}`;
      
      // Open WhatsApp in new tab
      window.open(whatsappURL, '_blank');
      
      // Show success overlay
      successOverlay.classList.add('active');
    });
  }

  if (resetFormBtn && consultationForm && successOverlay) {
    resetFormBtn.addEventListener('click', () => {
      consultationForm.reset();
      successOverlay.classList.remove('active');
    });
  }
  
  /* ==========================================================================
     MOBILE HERO FULL SCREEN FIX
     ========================================================================== */
  function fixMobileHero() {
    if (window.innerWidth <= 767) {
      const hero = document.querySelector('.hero');
      if (hero) {
        const vh = window.innerHeight;
        // On very small height screens (like iPhone SE), allow scrolling so content isn't cut off
        if (vh <= 680) {
          hero.style.height = 'auto';
          hero.style.minHeight = vh + 'px';
          hero.style.maxHeight = 'none';
          hero.style.overflow = 'visible';
          hero.style.paddingTop = '80px';
          hero.style.paddingBottom = '30px';
          
          const container = hero.querySelector('.container');
          if (container) {
            container.style.maxHeight = 'none';
            container.style.overflow = 'visible';
            container.style.height = 'auto';
          }
        } else {
          hero.style.height = vh + 'px';
          hero.style.minHeight = vh + 'px';
          hero.style.maxHeight = vh + 'px';
          hero.style.overflow = 'hidden';
          hero.style.paddingBottom = '0';
          hero.style.marginBottom = '0';
          
          const container = hero.querySelector('.container');
          if (container) {
            container.style.maxHeight = (vh - 65) + 'px';
            container.style.overflow = 'hidden';
          }
        }
      }
    }
  }
  
  // Run on load and resize
  fixMobileHero();
  window.addEventListener('resize', fixMobileHero);
  window.addEventListener('orientationchange', fixMobileHero);
});


/* ==========================================================================
   ANIMATED COUNTER FOR HERO STATS - STOPS AT TARGET
   ========================================================================== */
const animateCounters = () => {
  const counters = document.querySelectorAll('.stat-number-hero[data-target]');
  
  counters.forEach(counter => {
    const target = parseInt(counter.getAttribute('data-target'));
    
    // Check if this stat should have a plus sign
    const originalHTML = counter.innerHTML;
    const shouldHavePlus = originalHTML.includes('stat-plus') || originalHTML.includes('+');
    
    // Count up animation (easeOut)
    const steps = 80;
    let step = 0;
    const easeOut = (t) => 1 - Math.pow(1 - t, 3);

    const update = () => {
      step++;
      const progress = easeOut(Math.min(step / steps, 1));
      const current = Math.round(progress * target);
      
      // Format number and add + if needed
      let displayText = current.toLocaleString('en-US');
      if (shouldHavePlus) {
        displayText += '+';
      }
      
      counter.textContent = displayText;

      if (step < steps) {
        requestAnimationFrame(update);
      } else {
        // Reached target — STOP HERE
        let finalText = target.toLocaleString('en-US');
        if (shouldHavePlus) {
          finalText += '+';
        }
        counter.textContent = finalText;
      }
    };

    counter.textContent = shouldHavePlus ? '0+' : '0';
    requestAnimationFrame(update);
  });
};

window.addEventListener('load', () => {
  setTimeout(animateCounters, 500);
});

/* ==========================================================================
   SOLAR CALCULATOR FUNCTIONALITY - CUSTOM CALCULATIONS
   ========================================================================== */
const calculatorInit = () => {
  const typeButtons = document.querySelectorAll('.type-btn');
  const monthlyBillInput = document.getElementById('monthlyBill');
  let currentType = 'home';

  // Per kW installation cost
  const costPerKW = 63000;

  // Bill range to kW mapping
  const getSystemSizeFromBill = (bill) => {
    if (bill >= 1000 && bill <= 3000) {
      return 3; // 3 kW
    } else if (bill >= 3001 && bill <= 5000) {
      return 5; // 5 kW
    } else if (bill >= 5001 && bill <= 8000) {
      return 7; // 7 kW
    } else if (bill >= 8001 && bill <= 12000) {
      return 10; // 10 kW
    } else if (bill >= 12001 && bill <= 20000) {
      return 15; // 15 kW
    } else if (bill >= 20001 && bill <= 35000) {
      return 25; // 25 kW
    } else if (bill >= 35001 && bill <= 60000) {
      return 40; // 40 kW
    } else if (bill >= 60001) {
      return 50; // 50 kW
    } else {
      return 2; // Default 2 kW for bills below 1000
    }
  };

  // Roof area per kW (sqft)
  const roofPerKW = 80;

  typeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      typeButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentType = btn.dataset.type;
      calculateSavings();
    });
  });

  if (monthlyBillInput) {
    monthlyBillInput.addEventListener('input', calculateSavings);
    calculateSavings();
  }

  function calculateSavings() {
    const monthlyBill = parseFloat(monthlyBillInput.value) || 5000;

    // Step 1: Get system size based on bill range
    const systemSize = getSystemSizeFromBill(monthlyBill);

    // Step 2: Calculate total cost (kW × ₹63,000)
    const totalCost = systemSize * costPerKW;

    // Step 3: Yearly generation (1kW = ~1440 units/year in India)
    const yearlyGen = Math.round(systemSize * 1440);

    // Step 4: Annual savings (assuming 90% bill reduction)
    const annualSavings = monthlyBill * 12 * 0.90;

    // Step 5: Roof space needed
    const roofNeeded = Math.round(systemSize * roofPerKW);

    // Format cost display
    let costDisplay;
    if (totalCost >= 100000) {
      costDisplay = '₹' + (totalCost / 100000).toFixed(2) + ' Lakh';
    } else {
      costDisplay = '₹' + totalCost.toLocaleString('en-IN');
    }

    // Update UI
    document.getElementById('systemSize').textContent    = systemSize + ' kW';
    document.getElementById('annualSavings').textContent = '₹' + (annualSavings / 1000).toFixed(1) + 'k';
    document.getElementById('yearlyGen').textContent     = yearlyGen.toLocaleString('en-IN') + ' units';
    document.getElementById('roofNeeded').textContent    = roofNeeded + ' sqft';
    document.getElementById('solarCost').textContent     = costDisplay;
  }
  
  // Get Quote Button - Send to WhatsApp with calculation
  const sendQuoteBtn = document.getElementById('sendQuoteBtn');
  if (sendQuoteBtn) {
    sendQuoteBtn.addEventListener('click', () => {
      const name = document.getElementById('quoteName').value.trim();
      const mobile = document.getElementById('quoteMobile').value.trim();
      
      if (!name || !mobile) {
        alert('Please enter your Name and Mobile number');
        return;
      }
      
      // Get current calculation values
      const monthlyBill = document.getElementById('monthlyBill').value;
      const systemSize = document.getElementById('systemSize').textContent;
      const annualSavings = document.getElementById('annualSavings').textContent;
      const yearlyGen = document.getElementById('yearlyGen').textContent;
      const roofNeeded = document.getElementById('roofNeeded').textContent;
      const solarCost = document.getElementById('solarCost').textContent;
      const customerType = document.querySelector('.type-btn.active').textContent;
      
      // Format WhatsApp message
      let message = `*Solar Quote Request*\n\n`;
      message += `👤 *Name:* ${name}\n`;
      message += `📱 *Mobile:* ${mobile}\n\n`;
      message += `*📊 Calculation Details:*\n`;
      message += `━━━━━━━━━━━━━━━━\n`;
      message += `💡 Customer Type: ${customerType}\n`;
      message += `💰 Monthly Bill: ₹${monthlyBill}\n\n`;
      message += `*Recommended System:*\n`;
      message += `⚡ System Size: ${systemSize}\n`;
      message += `💵 Total Cost: ${solarCost}\n`;
      message += `💚 Annual Savings: ${annualSavings}\n`;
      message += `🔋 Yearly Generation: ${yearlyGen}\n`;
      message += `📐 Roof Area Needed: ${roofNeeded}\n\n`;
      message += `I want a detailed quote for this solar system.`;
      
      // Encode and send to WhatsApp
      const encodedMessage = encodeURIComponent(message);
      const whatsappURL = `https://wa.me/917400561349?text=${encodedMessage}`;
      window.open(whatsappURL, '_blank');
      
      // Clear inputs
      document.getElementById('quoteName').value = '';
      document.getElementById('quoteMobile').value = '';
    });
  }
};

if (document.querySelector('.calculator-section')) {
  calculatorInit();
}
