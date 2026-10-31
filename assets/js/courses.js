/* Static course files are listed in course_details/course-list.js. */
(() => {
  'use strict';

  const browser = document.querySelector('.course-browser');
  if (!browser) return;

  const icons = { coding: 'bi-code-slash', civil: 'bi-buildings', mechanical: 'bi-gear', academic: 'bi-mortarboard' };
  const categoryNames = {
    'coding & development': 'coding',
    'civil & architechture': 'civil',
    'civil & architecture': 'civil',
    'mechanical & design': 'mechanical',
    'academic': 'academic',
    'achademic': 'academic'
  };
  const buttons = [...browser.querySelectorAll('[data-course-category]')];
  const panel = browser.querySelector('#course-dropdown');
  const track = browser.querySelector('#course-card-track');
  const status = browser.querySelector('#course-catalog-status');
  const carousel = browser.querySelector('.course-carousel');
  const previous = browser.querySelector('#course-carousel-previous');
  const next = browser.querySelector('#course-carousel-next');
  const searchForm = document.getElementById('course-search-form');
  const searchInput = document.getElementById('course-search-input');
  const searchSubmit = document.getElementById('course-search-submit');
  const brochurePopup = document.getElementById('course-brochure-popup');
  const brochureImage = document.getElementById('course-brochure-image');
  const brochureStatus = document.getElementById('course-brochure-status');
  const brochureTitle = document.getElementById('course-brochure-title');
  const brochureContent = brochurePopup.querySelector('.course-brochure-content');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let activeButton = null;
  let openingFrame = 0;
  let requestVersion = 0;
  let catalogPromise = null;

  function text(value, name, allowNumber = false) {
    if (value === undefined || value === null) return '';
    if (typeof value === 'string') return value.trim();
    if (allowNumber && typeof value === 'number' && Number.isFinite(value)) return String(value);
    throw new Error(name + ' must be text' + (allowNumber ? ' or a number.' : '.'));
  }

  function object(value, name) {
    if (value === undefined || value === null) return {};
    if (typeof value !== 'object' || Array.isArray(value)) throw new Error(name + ' must be an object.');
    return value;
  }

  function list(value, name) {
    if (value === undefined || value === null) return [];
    if (!Array.isArray(value)) throw new Error(name + ' must be a list, for example ["Python", "SQL"].');
    return value.map(item => text(item, name)).filter(Boolean);
  }

  function flag(value, name) {
    if (value === undefined) return false;
    if (typeof value !== 'boolean') throw new Error(name + ' must be true or false.');
    return value;
  }

  function fileUrl(value, name) {
    const input = text(value, name);
    if (!input) return '';
    const url = new URL(input, document.baseURI);
    const localAsset = window.location.protocol === 'file:' && url.protocol === 'file:';
    if (!['http:', 'https:'].includes(url.protocol) && !localAsset) throw new Error(name + ' must be a website path or HTTP(S) URL.');
    return url.href;
  }

  function normalizeCourse(raw, filename) {
    const data = object(raw, 'Course file');
    if (!flag(data.published, 'published')) return null;
    const category = categoryNames[text(data.category, 'category').toLowerCase()];
    if (!category) throw new Error('category must match one of the course labels.');
    const course = { filename, category };
    for (const key of ['course_name', 'tagline', 'delivery_mode', 'duration', 'level', 'overview', 'audience', 'certificate', 'fees', 'scholarship', 'contact']) {
      course[key] = text(data[key], key);
    }
    if (!course.course_name) throw new Error('course_name is required for published courses.');
    for (const key of ['prerequisites', 'skills', 'modules', 'learning_outcomes']) course[key] = list(data[key], key);
    course.sort_order = data.sort_order === undefined ? 0 : data.sort_order;
    if (typeof course.sort_order !== 'number' || !Number.isFinite(course.sort_order)) throw new Error('sort_order must be a number.');
    for (const [key, fields] of Object.entries({
      projects: ['count', 'description', 'capstone'],
      batch: ['next_batch', 'timings', 'location', 'batch_size', 'enrolled_students'],
      card: ['icon', 'focus', 'banner']
    })) {
      const input = object(data[key], key);
      course[key] = {};
      for (const field of fields) {
        course[key][field] = text(input[field], key + '.' + field, ['count', 'batch_size', 'enrolled_students'].includes(field));
      }
    }
    if (course.card.icon && !/^bi-[a-z0-9-]+$/.test(course.card.icon)) throw new Error('card.icon must be a Bootstrap icon name such as bi-code-slash.');
    course.card.image = fileUrl(object(data.card, 'card').image, 'card.image');
    const brochure = object(data.brochure, 'brochure');
    course.brochure = { show: flag(brochure.show, 'brochure.show'), file: fileUrl(brochure.file, 'brochure.file') };
    if (course.brochure.show && !course.brochure.file) throw new Error('brochure.file is required when brochure.show is true.');
    const program = object(data.program, 'program');
    course.program = {
      show: flag(program.show, 'program.show'),
      action: text(program.action, 'program.action') || 'expand',
      url: fileUrl(program.url, 'program.url')
    };
    if (!['expand', 'link'].includes(course.program.action)) throw new Error('program.action must be expand or link.');
    if (course.program.show && course.program.action === 'link' && !course.program.url) throw new Error('program.url is required for a program link.');
    return course;
  }

  const registrations = new Map();

  window.registerISCTCourse = data => {
    const filename = document.currentScript && document.currentScript.dataset.courseFile;
    if (!filename) return;
    if (registrations.has(filename)) {
      registrations.set(filename, { error: new Error('Each file must register exactly one course.') });
    } else registrations.set(filename, { data });
  };

  function loadCourseFile(filename) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      const url = new URL('course_details/' + encodeURIComponent(filename), document.baseURI);
      url.searchParams.set('v', Date.now());
      script.src = url.href;
      script.async = true;
      script.charset = 'utf-8';
      script.dataset.courseFile = filename;
      const cleanup = () => {
        script.remove();
        registrations.delete(filename);
      };
      script.onload = () => {
        const entry = registrations.get(filename);
        cleanup();
        try {
          if (!entry) throw new Error('File must contain window.registerISCTCourse({ ... });. Check its syntax.');
          if (entry.error) throw entry.error;
          resolve(normalizeCourse(entry.data, filename));
        } catch (error) {
          reject(error);
        }
      };
      script.onerror = () => {
        cleanup();
        reject(new Error('Could not load this course file. Check the filename in course-list.js.'));
      };
      document.head.append(script);
    });
  }

  function loadCatalog() {
    if (!catalogPromise) {
      catalogPromise = (async () => {
        const filenames = window.ISCT_COURSE_FILES;
        if (!Array.isArray(filenames) || filenames.some(name => typeof name !== 'string' || /[\\/]/.test(name) || name.startsWith('_') || !/\.js$/i.test(name) || name.toLowerCase() === 'course-list.js')) {
          throw new Error('Check course_details/course-list.js. List course .js filenames only.');
        }
        const result = { coding: [], civil: [], mechanical: [], academic: [], errors: [] };
        const entries = [...new Set(filenames)];
        const loaded = await Promise.allSettled(entries.map(loadCourseFile));
        loaded.forEach((entry, index) => {
          if (entry.status === 'rejected') result.errors.push(entries[index] + ': ' + entry.reason.message);
          else if (entry.value) result[entry.value.category].push(entry.value);
        });
        for (const key of Object.keys(icons)) {
          result[key].sort((a, b) => a.sort_order - b.sort_order || a.course_name.localeCompare(b.course_name) || a.filename.localeCompare(b.filename));
        }
        return result;
      })().catch(error => {
        catalogPromise = null;
        throw error;
      });
    }
    return catalogPromise;
  }

  function element(tag, className, content) {
    const node = document.createElement(tag);
    node.className = className;
    if (content !== undefined) node.textContent = content;
    return node;
  }

  function addDetail(parent, label, value) {
    if (!value || (Array.isArray(value) && !value.length)) return;
    const section = element('div', 'course-program-section');
    section.append(element('h4', 'course-preview-label', label));
    if (Array.isArray(value)) {
      const items = element('ul', '');
      value.forEach(item => items.append(element('li', '', item)));
      section.append(items);
    } else section.append(element('p', '', value));
    parent.append(section);
  }

  function addProgramDetails(card, course) {
    const details = element('details', 'course-program-details');
    const summary = element('summary', '', 'View Program');
    const arrow = element('i', 'bi bi-chevron-down');
    arrow.setAttribute('aria-hidden', 'true');
    summary.append(arrow);
    details.append(summary);
    const content = element('div', 'course-program-content');
    for (const [label, value] of [
      ['Overview', course.overview], ['Who this course is for', course.audience],
      ['Prerequisites', course.prerequisites], ['Modules', course.modules],
      ['Learning outcomes', course.learning_outcomes], ['Projects', course.projects.description],
      ['Capstone project', course.projects.capstone], ['Certificate', course.certificate],
      ['Class timings', course.batch.timings], ['Training location', course.batch.location],
      ['Batch size', course.batch.batch_size], ['Course fee', course.fees],
      ['Scholarship / offer', course.scholarship], ['Contact', course.contact]
    ]) addDetail(content, label, value);
    details.append(content);
    card.append(details);
  }

  function openBrochure(course) {
    brochureTitle.textContent = course.course_name + ' — Brochure';
    brochureStatus.textContent = 'Loading brochure…';
    brochureStatus.hidden = false;
    brochureImage.hidden = true;
    brochureImage.alt = course.course_name + ' brochure';
    brochureImage.src = course.brochure.file;
    document.body.classList.add('brochure-popup-open');
    brochurePopup.showModal();
    brochureContent.scrollTop = 0;
  }

  function createCard(course, icon) {
    const card = element('article', 'course-preview-card');
    const header = element('div', 'course-preview-header');
    const top = element('div', 'course-preview-top');
    const mark = element('span', 'course-preview-icon');
    const symbol = element('i', 'bi ' + (course.card.icon || icon));
    symbol.setAttribute('aria-hidden', 'true');
    mark.append(symbol);
    if (course.card.image) {
      const image = element('img', 'course-preview-course-image');
      image.src = course.card.image;
      image.alt = '';
      image.addEventListener('error', () => image.replaceWith(symbol), { once: true });
      mark.replaceChildren(image);
    }
    top.append(mark);
    if (course.duration) {
      const duration = element('span', 'course-preview-duration');
      const clock = element('i', 'bi bi-clock-fill');
      clock.setAttribute('aria-hidden', 'true');
      duration.append(clock, document.createTextNode(course.duration));
      top.append(duration);
    }
    header.append(top, element('h3', 'course-preview-title', course.course_name));
    if (course.tagline) header.append(element('p', 'course-preview-subtitle', course.tagline));
    const metadata = [course.delivery_mode, course.level].filter(Boolean);
    if (metadata.length) header.append(element('p', 'course-preview-meta', metadata.join(' · ')));
    card.append(header);

    if (course.skills.length) {
      const body = element('div', 'course-preview-body');
      const skills = element('ul', 'course-preview-skills');
      course.skills.forEach(skill => skills.append(element('li', '', skill)));
      body.append(element('h4', 'course-preview-label', 'Skills & tools'), skills);
      card.append(body);
    }

    const stats = element('div', 'course-preview-stats');
    for (const [label, value, statIcon] of [
      ['Projects', course.projects.count, 'bi-file-earmark-check'],
      ['Students enrolled', course.batch.enrolled_students, 'bi-people-fill'],
      ['Next batch', course.batch.next_batch, 'bi-calendar-event']
    ]) {
      if (value === '') continue;
      const stat = element('div', 'course-preview-stat');
      const symbol = element('i', 'bi ' + statIcon);
      symbol.setAttribute('aria-hidden', 'true');
      stat.append(symbol, element('strong', '', value), element('span', '', label));
      stats.append(stat);
    }
    if (stats.children.length) card.append(stats);
    if (course.card.focus) {
      const footer = element('div', 'course-preview-footer');
      footer.append(element('span', 'course-preview-label', 'Learning focus'), element('p', '', course.card.focus));
      card.append(footer);
    }

    const actions = element('div', 'course-preview-actions');
    if (course.brochure.show) {
      const brochure = element('button', '', 'Brochure');
      brochure.type = 'button';
      brochure.setAttribute('aria-haspopup', 'dialog');
      brochure.setAttribute('aria-controls', 'course-brochure-popup');
      brochure.addEventListener('click', () => openBrochure(course));
      actions.append(brochure);
    }
    if (course.program.show && course.program.action === 'link') {
      const program = element('a', 'course-preview-primary-action', 'View Program');
      program.href = course.program.url;
      actions.append(program);
    }
    if (actions.children.length) card.append(actions);
    if (course.program.show && course.program.action === 'expand') addProgramDetails(card, course);
    if (course.card.banner) card.append(element('div', 'course-preview-banner', course.card.banner));
    return card;
  }

  function setStatus(message, error = false) {
    status.textContent = message;
    status.hidden = !message;
    status.classList.toggle('course-catalog-error', error);
  }

  function syncArrows() {
    const lastPosition = Math.max(0, track.scrollWidth - track.clientWidth);
    previous.disabled = track.scrollLeft <= 2;
    next.disabled = track.scrollLeft >= lastPosition - 2;
  }

  function closePanel(restoreFocus = false) {
    cancelAnimationFrame(openingFrame);
    requestVersion++;
    const trigger = activeButton;
    buttons.forEach(button => button.setAttribute('aria-expanded', 'false'));
    searchSubmit.setAttribute('aria-expanded', 'false');
    panel.hidden = true;
    activeButton = null;
    if (restoreFocus && trigger) trigger.focus({ preventScroll: true });
  }

  async function openPanel(button, query = null) {
    const searching = query !== null;
    if (activeButton === button && !searching) {
      closePanel();
      return;
    }
    cancelAnimationFrame(openingFrame);
    const version = ++requestVersion;
    activeButton = button;
    buttons.forEach(item => {
      item.setAttribute('aria-expanded', String(!searching && item === button));
      item.classList.toggle('course-category-featured', !searching && item === button);
    });
    searchSubmit.setAttribute('aria-expanded', String(searching));
    panel.setAttribute('aria-labelledby', button.id);
    track.setAttribute('aria-label', searching ? 'Courses matching ' + query : button.textContent + ' course cards');
    track.replaceChildren();
    carousel.hidden = true;
    setStatus('Loading courses…');
    panel.hidden = false;
    syncArrows();
    try {
      const catalog = await loadCatalog();
      if (version !== requestVersion) return;
      let courses;
      if (searching) {
        const terms = query.toLocaleLowerCase().split(/\s+/).filter(Boolean);
        courses = Object.keys(icons).flatMap(category => catalog[category]).filter(course => {
          const content = [course.course_name, course.tagline, course.overview, course.duration, course.delivery_mode, course.level, course.card.focus, ...course.skills, ...course.modules, ...course.learning_outcomes].join(' ').toLocaleLowerCase();
          return terms.every(term => content.includes(term));
        });
      } else courses = catalog[button.dataset.courseCategory];
      track.replaceChildren(...courses.map(course => createCard(course, icons[course.category])));
      carousel.hidden = courses.length === 0;
      const notices = [];
      if (!courses.length) notices.push(searching ? 'No courses match “' + query + '”.' : 'No published courses in this category yet.');
      if (catalog.errors.length) notices.push('Course files needing attention:\n' + catalog.errors.join('\n'));
      setStatus(notices.join('\n\n'), catalog.errors.length > 0);
      track.scrollLeft = 0;
      syncArrows();
      openingFrame = requestAnimationFrame(() => {
        const headerBottom = document.getElementById('header').getBoundingClientRect().bottom;
        if (panel.getBoundingClientRect().bottom > window.innerHeight - 20 || browser.getBoundingClientRect().top < headerBottom + 16) {
          browser.scrollIntoView({ behavior: reduceMotion.matches ? 'instant' : 'smooth', block: 'start' });
        }
      });
    } catch (error) {
      if (version !== requestVersion) return;
      setStatus('Unable to load course details. ' + error.message, true);
    }
  }

  function scrollCards(direction) {
    const card = track.firstElementChild;
    if (!card) return;
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    track.scrollBy({ left: direction * (card.getBoundingClientRect().width + gap), behavior: reduceMotion.matches ? 'instant' : 'smooth' });
  }

  buttons.forEach(button => button.addEventListener('click', () => openPanel(button)));
  searchForm.addEventListener('submit', event => {
    event.preventDefault();
    const query = searchInput.value.trim();
    if (!query) {
      searchInput.focus();
      return;
    }
    openPanel(searchSubmit, query);
  });
  previous.addEventListener('click', () => scrollCards(-1));
  next.addEventListener('click', () => scrollCards(1));
  track.addEventListener('scroll', syncArrows, { passive: true });
  track.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      scrollCards(event.key === 'ArrowRight' ? 1 : -1);
    }
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && activeButton && !brochurePopup.open) closePanel(true);
  });
  document.addEventListener('pointerdown', event => {
    if (activeButton && !brochurePopup.open && !browser.contains(event.target) && !searchForm.contains(event.target)) closePanel();
  });
  document.getElementById('course-brochure-close').addEventListener('click', () => brochurePopup.close());
  brochurePopup.addEventListener('click', event => {
    if (event.target === brochurePopup) brochurePopup.close();
  });
  brochurePopup.addEventListener('cancel', event => {
    event.preventDefault();
    brochurePopup.close();
  });
  brochurePopup.addEventListener('close', () => {
    document.body.classList.remove('brochure-popup-open');
    brochureImage.hidden = true;
    brochureImage.removeAttribute('src');
  });
  brochureImage.addEventListener('load', () => {
    brochureStatus.hidden = true;
    brochureImage.hidden = false;
  });
  brochureImage.addEventListener('error', () => {
    if (!brochurePopup.open) return;
    brochureStatus.textContent = 'The brochure image could not be loaded.';
    brochureStatus.hidden = false;
    brochureImage.hidden = true;
  });
  new ResizeObserver(syncArrows).observe(track);
})();
