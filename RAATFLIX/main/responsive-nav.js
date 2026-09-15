/* ==========================================================================
   RaatFlix - Responsive Navigation Controller
   Handles: mobile hamburger drawer, mobile search toggle, navbar scroll state.
   Self-contained: does not depend on main.js / movies.js / tvseries.js / livetv.js,
   so it works the same way on every page regardless of which page-specific
   script is also loaded.
   ========================================================================== */
(function () {
    'use strict';

    const navbar = document.getElementById('navbar');
    const menuBtn = document.getElementById('mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    const searchBtn = document.getElementById('search-toggle-btn');
    const searchContainer = document.getElementById('search-container');
    const searchInput = document.getElementById('global-search');

    const DESKTOP_BREAKPOINT = 1100;

    function closeMenu() {
        if (!navLinks || !menuBtn) return;
        navLinks.classList.remove('open');
        menuBtn.classList.remove('active');
        menuBtn.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('nav-open');
    }

    function openMenu() {
        if (!navLinks || !menuBtn) return;
        navLinks.classList.add('open');
        menuBtn.classList.add('active');
        menuBtn.setAttribute('aria-expanded', 'true');
        document.body.classList.add('nav-open');
    }

    function closeSearch() {
        if (!searchContainer) return;
        searchContainer.classList.remove('open');
    }

    function openSearch() {
        if (!searchContainer) return;
        searchContainer.classList.add('open');
        window.setTimeout(function () {
            if (searchInput) searchInput.focus();
        }, 150);
    }

    // --- Hamburger toggle ---
    if (menuBtn && navLinks) {
        menuBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            const isOpen = navLinks.classList.contains('open');
            if (isOpen) {
                closeMenu();
            } else {
                closeSearch();
                openMenu();
            }
        });

        // Close the drawer whenever a nav link is tapped
        navLinks.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', closeMenu);
        });
    }

    // --- Mobile search icon toggle ---
    if (searchBtn && searchContainer) {
        searchBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            const isOpen = searchContainer.classList.contains('open');
            if (isOpen) {
                closeSearch();
            } else {
                closeMenu();
                openSearch();
            }
        });
    }

    // --- Close drawers when tapping outside of them ---
    document.addEventListener('click', function (e) {
        if (navLinks && navLinks.classList.contains('open') &&
            !navLinks.contains(e.target) &&
            !(menuBtn && menuBtn.contains(e.target))) {
            closeMenu();
        }
        if (searchContainer && searchContainer.classList.contains('open') &&
            !searchContainer.contains(e.target) &&
            !(searchBtn && searchBtn.contains(e.target))) {
            closeSearch();
        }
    });

    // --- Reset state if the window is resized back to desktop width ---
    window.addEventListener('resize', function () {
        if (window.innerWidth > DESKTOP_BREAKPOINT) {
            closeMenu();
            closeSearch();
        }
    });

    // --- Navbar background on scroll (so movies/series/tv pages get this
    //     effect too, even though they don't load main.js) ---
    if (navbar) {
        let ticking = false;
        function updateNavbar() {
            navbar.classList.toggle('scrolled', window.scrollY > 20);
            ticking = false;
        }
        window.addEventListener('scroll', function () {
            if (!ticking) {
                window.requestAnimationFrame(updateNavbar);
                ticking = true;
            }
        }, { passive: true });
        updateNavbar();
    }
})();