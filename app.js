/* ============================================
   SAP S/4HANA Finance - Discovering Finance App
   Navigation, Progress & Interaction Logic
   ============================================ */

(function () {
  'use strict';

  // ---- State ----
  const STATE_KEY = 'sap_finance_progress';
  let state = {
    currentView: 'home',       // 'home' | lesson id
    completedLessons: [],
    expandedSections: {},
    sidebarOpen: false
  };

  function loadState() {
    try {
      const saved = localStorage.getItem(STATE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        state.completedLessons = parsed.completedLessons || [];
        state.expandedSections = parsed.expandedSections || {};
      }
    } catch (e) { /* ignore */ }
  }

  function saveState() {
    try {
      localStorage.setItem(STATE_KEY, JSON.stringify({
        completedLessons: state.completedLessons,
        expandedSections: state.expandedSections
      }));
    } catch (e) { /* ignore */ }
  }

  // ---- Lesson Data ----
  const LESSONS = [
    { id: 'u1-l1-s1', unit: 1, unitTitle: 'عمليات Record to Report', title: 'مراحل عملية R2R وحلول SAP' },
    { id: 'u1-l1-s2', unit: 1, unitTitle: 'عمليات Record to Report', title: 'تسجيل العمليات المالية والـ Universal Journal' },
    { id: 'u1-l2-s2', unit: 1, unitTitle: 'عمليات Record to Report', title: 'المحاسبة المتوازية (Parallel Accounting)' },
    { id: 'u1-l2-s3', unit: 1, unitTitle: 'عمليات Record to Report', title: 'التقارير القطاعية (Segment Reporting)' },
    { id: 'u1-l2-s4', unit: 1, unitTitle: 'عمليات Record to Report', title: 'Profit Centers ومراكز الربح' },
    { id: 'u1-l2-s5', unit: 1, unitTitle: 'عمليات Record to Report', title: 'Cost of Sales Accounting' },
    { id: 'u1-l3-s1', unit: 1, unitTitle: 'عمليات Record to Report', title: 'المحاسبة العامة والفرعية (GL & Sub-ledgers)' },
    { id: 'u1-l3-s2', unit: 1, unitTitle: 'عمليات Record to Report', title: 'الهيكل التنظيمي للمؤسسة' },
    { id: 'u2-l1-s1', unit: 2, unitTitle: 'إدارة الحسابات الدائنة', title: 'إدارة الموردين (Payables Management)' },
    { id: 'u2-l1-s2', unit: 2, unitTitle: 'إدارة الحسابات الدائنة', title: 'حساب التسوية والفاتورة والـ KPIs' },
    { id: 'u6-l1-s1', unit: 6, unitTitle: 'إدارة الأصول الثابتة', title: 'دورة حياة الأصل والهيكل التنظيمي' },
    { id: 'u6-l1-s2', unit: 6, unitTitle: 'إدارة الأصول الثابتة', title: 'البيانات الأساسية للأصل (Asset Master Data)' },
    { id: 'u6-l1-s3', unit: 6, unitTitle: 'إدارة الأصول الثابتة', title: 'حساب الإهلاك (Depreciation)' },
    { id: 'u6-l1-s4', unit: 6, unitTitle: 'إدارة الأصول الثابتة', title: 'الارتباط بالمحاسبة العامة (G/L)' },
    { id: 'u8-l1-s1', unit: 8, unitTitle: 'إدارة التكاليف والربحية', title: 'Management Accounting في SAP' },
    { id: 'u8-l1-s2', unit: 8, unitTitle: 'إدارة التكاليف والربحية', title: 'الفرق بين FI و CO' },
    { id: 'u8-l1-s3', unit: 8, unitTitle: 'إدارة التكاليف والربحية', title: 'هندسة Controlling (Architecture)' },
    { id: 'u8-l1-s4', unit: 8, unitTitle: 'إدارة التكاليف والربحية', title: 'الـ Universal Journal (ACDOCA)' },
    { id: 'u8-l1-s5', unit: 8, unitTitle: 'إدارة التكاليف والربحية', title: 'المحاسبة المتوازية الشاملة (UPA)' },
    { id: 'u8-l1-s6', unit: 8, unitTitle: 'إدارة التكاليف والربحية', title: 'Profit Center Accounting' },
    { id: 'u8-l3-s1', unit: 8, unitTitle: 'إدارة التكاليف والربحية', title: 'Core Data Service (CDS) Views' },
    { id: 'u8-l3-s2', unit: 8, unitTitle: 'إدارة التكاليف والربحية', title: 'التقارير المدمجة (Embedded Reporting)' }
  ];

  const UNITS = [
    { id: 1, title: 'عمليات Record to Report', icon: '📊', lessons: LESSONS.filter(l => l.unit === 1) },
    { id: 2, title: 'إدارة الحسابات الدائنة', icon: '💳', lessons: LESSONS.filter(l => l.unit === 2) },
    { id: 6, title: 'إدارة الأصول الثابتة', icon: '🏢', lessons: LESSONS.filter(l => l.unit === 6) },
    { id: 8, title: 'إدارة التكاليف والربحية', icon: '📈', lessons: LESSONS.filter(l => l.unit === 8) }
  ];

  // ---- DOM Helpers ----
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.from((ctx || document).querySelectorAll(sel)); }

  // ---- Progress ----
  function getProgress() {
    const total = LESSONS.length;
    const done = state.completedLessons.length;
    return { total, done, percent: total > 0 ? Math.round((done / total) * 100) : 0 };
  }

  function updateProgressUI() {
    const p = getProgress();
    const fill = $('.progress-fill');
    const lbl = $('.progress-percent');
    if (fill) fill.style.width = p.percent + '%';
    if (lbl) lbl.textContent = p.percent + '%';

    // Update nav lesson icons
    LESSONS.forEach(l => {
      const navEl = $(`.nav-lesson[data-id="${l.id}"]`);
      if (navEl) {
        if (state.completedLessons.includes(l.id)) {
          navEl.classList.add('completed');
          navEl.querySelector('.lesson-icon').textContent = '✓';
        } else {
          navEl.classList.remove('completed');
          navEl.querySelector('.lesson-icon').textContent = '';
        }
      }
    });

    // Stats on home
    const statDone = $('#stat-done');
    const statTotal = $('#stat-total');
    const statPercent = $('#stat-percent');
    if (statDone) statDone.textContent = p.done;
    if (statTotal) statTotal.textContent = p.total;
    if (statPercent) statPercent.textContent = p.percent + '%';
  }

  // ---- Navigation ----
  function navigateTo(viewId) {
    state.currentView = viewId;

    // Hide all views
    $$('.view-page').forEach(v => v.classList.add('hidden'));

    if (viewId === 'home') {
      $('#home-view').classList.remove('hidden');
      updateBreadcrumbs('الرئيسية', '');
    } else {
      const lessonEl = $(`#lesson-${viewId}`);
      if (lessonEl) {
        lessonEl.classList.remove('hidden');
        const lesson = LESSONS.find(l => l.id === viewId);
        if (lesson) {
          updateBreadcrumbs(lesson.unitTitle, lesson.title);
        }
      }
    }

    // Update nav items
    $$('.nav-lesson').forEach(n => n.classList.remove('active'));
    const activeNav = $(`.nav-lesson[data-id="${viewId}"]`);
    if (activeNav) activeNav.classList.add('active');

    // Scroll to top
    $('.main-content').scrollTo({ top: 0, behavior: 'smooth' });

    // Close sidebar on mobile
    closeSidebar();

    updateProgressUI();
  }

  function updateBreadcrumbs(unit, lesson) {
    const bc = $('.breadcrumbs');
    if (!bc) return;
    if (lesson) {
      bc.innerHTML = `
        <span class="bc-home" style="cursor:pointer" onclick="window.appNav('home')">🏠</span>
        <span>‹</span>
        <span>${unit}</span>
        <span>‹</span>
        <span class="current">${lesson}</span>
      `;
    } else {
      bc.innerHTML = `<span class="current">🏠 ${unit}</span>`;
    }
  }

  function navigateToNext(currentId) {
    const idx = LESSONS.findIndex(l => l.id === currentId);
    if (idx >= 0 && idx < LESSONS.length - 1) {
      navigateTo(LESSONS[idx + 1].id);
    } else {
      navigateTo('home');
    }
  }

  function navigateToPrev(currentId) {
    const idx = LESSONS.findIndex(l => l.id === currentId);
    if (idx > 0) {
      navigateTo(LESSONS[idx - 1].id);
    }
  }

  // ---- Sidebar ----
  function toggleSidebar() {
    const sidebar = $('.sidebar');
    const overlay = $('.sidebar-overlay');
    if (sidebar.classList.contains('open')) {
      closeSidebar();
    } else {
      sidebar.classList.add('open');
      sidebar.classList.remove('collapsed');
      overlay.classList.add('visible');
      state.sidebarOpen = true;
    }
  }

  function closeSidebar() {
    const sidebar = $('.sidebar');
    const overlay = $('.sidebar-overlay');
    if (window.innerWidth <= 768) {
      sidebar.classList.remove('open');
      overlay.classList.remove('visible');
      state.sidebarOpen = false;
    }
  }

  function toggleUnit(unitId) {
    const items = $(`#nav-unit-items-${unitId}`);
    const header = $(`#nav-unit-header-${unitId}`);
    if (!items || !header) return;

    const isExpanded = items.classList.contains('expanded');
    if (isExpanded) {
      items.classList.remove('expanded');
      header.classList.remove('expanded');
    } else {
      items.classList.add('expanded');
      header.classList.add('expanded');
    }
  }

  // ---- Section expand/collapse ----
  function toggleSection(sectionId) {
    const header = $(`#section-header-${sectionId}`);
    const body = $(`#section-body-${sectionId}`);
    if (!header || !body) return;

    const isExpanded = body.classList.contains('expanded');
    if (isExpanded) {
      body.classList.remove('expanded');
      header.classList.remove('expanded');
    } else {
      body.classList.add('expanded');
      header.classList.add('expanded');
    }
  }

  // ---- Mark lesson done ----
  function toggleLessonDone(lessonId) {
    const idx = state.completedLessons.indexOf(lessonId);
    if (idx >= 0) {
      state.completedLessons.splice(idx, 1);
    } else {
      state.completedLessons.push(lessonId);
    }
    saveState();
    updateProgressUI();

    // Update button
    const btn = $(`#done-btn-${lessonId}`);
    if (btn) {
      if (state.completedLessons.includes(lessonId)) {
        btn.classList.add('done');
        btn.innerHTML = '✓ تمت المراجعة';
      } else {
        btn.classList.remove('done');
        btn.innerHTML = '☐ وضع علامة كمكتمل';
      }
    }
  }

  // ---- Global API ----
  window.appNav = function (id) { navigateTo(id); };
  window.appToggleSidebar = function () { toggleSidebar(); };
  window.appToggleUnit = function (id) { toggleUnit(id); };
  window.appToggleSection = function (id) { toggleSection(id); };
  window.appMarkDone = function (id) { toggleLessonDone(id); };
  window.appNextLesson = function (id) { navigateToNext(id); };
  window.appPrevLesson = function (id) { navigateToPrev(id); };

  // ---- Init ----
  document.addEventListener('DOMContentLoaded', function () {
    loadState();

    // Expand all units by default
    UNITS.forEach(u => {
      const items = $(`#nav-unit-items-${u.id}`);
      const header = $(`#nav-unit-header-${u.id}`);
      if (items && header) {
        items.classList.add('expanded');
        header.classList.add('expanded');
      }
    });

    updateProgressUI();
    navigateTo('home');
  });

})();
