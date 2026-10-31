/**
* ISCT Group - Modern JavaScript Controller
*/
(function() {
  "use strict";

  /**
   * Helper selector functions
   */
  const select = (el, all = false) => {
    el = el.trim();
    if (all) {
      return [...document.querySelectorAll(el)];
    } else {
      return document.querySelector(el);
    }
  };

  const on = (type, el, listener, all = false) => {
    let selectEl = select(el, all);
    if (selectEl) {
      if (all) {
        selectEl.forEach(e => e.addEventListener(type, listener));
      } else {
        selectEl.addEventListener(type, listener);
      }
    }
  };

  const onscroll = (el, listener) => {
    el.addEventListener('scroll', listener);
  };

  /**
   * Header scroll class
   */
  let selectHeader = select('#header');
  if (selectHeader) {
    const headerScrolled = () => {
      if (window.scrollY > 40) {
        selectHeader.classList.add('header-scrolled');
      } else {
        selectHeader.classList.remove('header-scrolled');
      }
    };
    window.addEventListener('load', headerScrolled);
    onscroll(document, headerScrolled);
  }

  /**
   * Back to top button
   */
  let backtotop = select('.back-to-top');
  if (backtotop) {
    const toggleBacktotop = () => {
      if (window.scrollY > 120) {
        backtotop.classList.add('active');
      } else {
        backtotop.classList.remove('active');
      }
    };
    window.addEventListener('load', toggleBacktotop);
    onscroll(document, toggleBacktotop);
  }

  /**
   * Mobile nav toggle
   */
  on('click', '.mobile-nav-toggle', function(e) {
    let nav = select('#navbar');
    if (nav) {
      nav.classList.toggle('navbar-mobile');
      this.classList.toggle('bi-list');
      this.classList.toggle('bi-x');
    }
  });

  /**
   * Close mobile nav on click of link
   */
  on('click', '.navbar a', function(e) {
    let nav = select('#navbar');
    if (nav && nav.classList.contains('navbar-mobile')) {
      nav.classList.remove('navbar-mobile');
      let toggle = select('.mobile-nav-toggle');
      if (toggle) {
        toggle.classList.add('bi-list');
        toggle.classList.remove('bi-x');
      }
    }
  }, true);

  /**
   * Preloader removal (immediate)
   */
  let preloader = select('#preloader');
  if (preloader) {
    preloader.remove();
  }

  /**
   * Interactive Course Filter (Tabs)
   */
  on('click', '.course-filter-btn', function(e) {
    e.preventDefault();
    const filter = this.getAttribute('data-filter');

    // Update active tab button
    select('.course-filter-btn', true).forEach(btn => {
      btn.classList.remove('active');
    });
    this.classList.add('active');

    // Filter course cards
    const cards = select('.master-course-card-wrap', true);
    if (cards && cards.length > 0) {
      cards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filter === 'all' || category === filter) {
          card.style.display = 'block';
          card.classList.add('animate__animated', 'animate__fadeIn');
        } else {
          card.style.display = 'none';
        }
      });
    }
  }, true);

  /**
   * Testimonials slider
   */
  if (typeof Swiper !== 'undefined' && select('.testimonials-slider')) {
    new Swiper('.testimonials-slider', {
      speed: 600,
      loop: true,
      autoplay: {
        delay: 5000,
        disableOnInteraction: false
      },
      slidesPerView: 'auto',
      pagination: {
        el: '.swiper-pagination',
        type: 'bullets',
        clickable: true
      },
      breakpoints: {
        320: {
          slidesPerView: 1,
          spaceBetween: 20
        },
        768: {
          slidesPerView: 2,
          spaceBetween: 24
        },
        1200: {
          slidesPerView: 2,
          spaceBetween: 30
        }
      }
    });
  }

  /**
   * Animation on scroll (AOS)
   */
  const initAOS = () => {
    if (typeof AOS !== 'undefined') {
      AOS.init({
        duration: 700,
        easing: 'ease-in-out',
        once: true,
        mirror: false
      });
    }
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAOS);
  } else {
    initAOS();
  }

  /**
   * Initiate Pure Counter
   */
  if (typeof PureCounter !== 'undefined') {
    new PureCounter();
  }

})();
