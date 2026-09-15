/**
 * ==========================================================================
 * RaatFlix - TV Series & Movies Dedicated Logic (Connected to Player Engine)
 * ==========================================================================
 */

const RaatFlixSeriesState = {
    series: [],
    featured: [],
    currentHeroIndex: 0,
    heroInterval: null,
    activeModalItem: null,
    currentPlaying: null
};

// --- Utility Functions ---
function slugify(text) {
    return String(text || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function escapeHtml(str) {
    return String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function debounce(fn, delay = 200) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
}

// --- Application Lifecycle ---
document.addEventListener('DOMContentLoaded', () => {
    initSeriesApp();
});

async function initSeriesApp() {
    setupNavbarScroll();
    setupFooterYear();
    setupSliders();
    setupModalCloseListeners();
    
    await fetchSeriesData();
    
    if (RaatFlixSeriesState.featured.length > 0) {
        renderHeroSection();
        setHeroSlide(0);
        startHeroRotation();
    }
    
    renderSeriesSliders();
    initSeriesSearch();
}

async function fetchSeriesData() {
    try {
        const res = await fetch(`data/series.json?t=${Date.now()}`);
        const rawSeries = res.ok ? await res.json() : getFallbackSeries();

        RaatFlixSeriesState.series = rawSeries.map((item, index) => {
            const title = item.title || `Series ${index + 1}`;
            const seasons = Array.isArray(item.seasons) ? item.seasons : [];
            
            return {
                id: String(item.id || item.tmdb_id || slugify(title) || `series-${index}`),
                type: item.type || (seasons.length > 0 ? 'series' : 'movie'),
                title: title,
                posterUrl: item.poster || item.posterUrl || "",
                bannerUrl: item.backdrop || item.bannerUrl || item.poster || "",
                description: item.overview || item.description || "No description available.",
                year: item.year || "",
                rating: item.rating || "N/A",
                matchPercentage: item.matchPercentage || Math.floor(Math.random() * (99 - 80 + 1) + 80),
                genre: Array.isArray(item.genres || item.genre) 
                    ? (item.genres || item.genre) 
                    : [item.genres || item.genre || 'Drama'],
                streamUrl: item.streamUrl || item.url || "",
                seasons: seasons.map(season => ({
                    seasonNumber: season.season_number || season.season || season.seasonNumber || 1,
                    episodes: (season.episodes || []).map((ep, epIndex) => ({
                        ...ep,
                        episodeNumber: ep.episodeNumber || epIndex + 1,
                        streamUrl: ep.streamUrl || ep.url || ""
                    }))
                }))
            };
        });

        RaatFlixSeriesState.featured = [...RaatFlixSeriesState.series]
            .sort(() => 0.5 - Math.random())
            .slice(0, 8);
    } catch (error) {
        console.error("RaatFlix Media Data Error:", error);
        RaatFlixSeriesState.series = getFallbackSeries();
        RaatFlixSeriesState.featured = getFallbackSeries().slice(0, 3);
    }
}

// --- UI Rendering ---
function renderSeriesSliders() {
    const mapSeriesHTML = (seriesList) => seriesList.map(s => createSeriesCard(s)).join('');

    const populate = (id, data) => {
        const container = document.getElementById(id);
        if (container) container.innerHTML = mapSeriesHTML(data);
    };

    const all = RaatFlixSeriesState.series;
    
    populate('series-continue-container', all.slice(0, 8));
    populate('series-top10-container', [...all].sort((a, b) => b.matchPercentage - a.matchPercentage).slice(0, 10));
    populate('all-series-container', all);
    
    populate('anime-container', all.filter(s => s.genre.some(g => String(g).toLowerCase().includes('anime') || String(g).toLowerCase().includes('animation'))));
    populate('kdramas-container', all.filter(s => s.genre.some(g => String(g).toLowerCase().includes('korean') || String(g).toLowerCase().includes('k-drama'))));
    populate('hollywood-container', all.filter(s => s.genre.some(g => String(g).toLowerCase().includes('hollywood') || String(g).toLowerCase().includes('english'))));
    populate('bollywood-container', all.filter(s => s.genre.some(g => String(g).toLowerCase().includes('bollywood') || String(g).toLowerCase().includes('hindi'))));
}

function createSeriesCard(item) {
    const metaInfo = item.type === 'movie' 
        ? 'Movie' 
        : `${item.seasons ? item.seasons.length : 0} Seasons`;

    return `
        <div class="media-card" data-id="${escapeHtml(item.id)}" onclick="openSeriesModal('${escapeHtml(item.id)}')">
            <img src="${escapeHtml(item.posterUrl)}" alt="${escapeHtml(item.title)}" class="card-image" loading="lazy" onerror="this.src='https://via.placeholder.com/300x450?text=No+Poster';">
            <div class="card-overlay">
                <div class="play-icon-overlay"><span class="material-symbols-rounded">play_arrow</span></div>
                <div class="card-info">
                    <h3>${escapeHtml(item.title)}</h3>
                    <div class="card-meta"><span>${escapeHtml(item.year)}</span><span>•</span><span>${escapeHtml(metaInfo)}</span></div>
                </div>
            </div>
        </div>
    `;
}

// --- Native Player Integration Engine ---
function playMedia(itemId, seasonIndex = 0, episodeIndex = 0) {
    const item = RaatFlixSeriesState.series.find(s => String(s.id) === String(itemId));
    if (!item) {
        alert("Media content not found.");
        return;
    }

    // Single Movie or Non-episodic Video
    if (item.type === 'movie' || (!item.seasons.length && item.streamUrl)) {
        if (!item.streamUrl) {
            alert("No video stream URL available for this movie yet.");
            return;
        }

        RaatFlixSeriesState.currentPlaying = { item, seasonIndex: -1, episodeIndex: -1 };

        if (typeof window.launchPlayer === 'function') {
            window.launchPlayer(item.streamUrl, item.title, {
                episodesCallback: null,
                nextEpisodeCallback: null
            });
        } else {
            console.error("RaatFlix Player Engine (player.js) is not loaded.");
        }
        return;
    }

    // TV Series Episodic Content
    const season = item.seasons[seasonIndex];
    if (!season || !season.episodes || !season.episodes[episodeIndex]) {
        alert("Selected episode is unavailable.");
        return;
    }

    const episode = season.episodes[episodeIndex];
    if (!episode.streamUrl) {
        alert("No video stream URL available for this episode yet.");
        return;
    }

    RaatFlixSeriesState.currentPlaying = { item, seasonIndex, episodeIndex };

    const epNum = episode.episodeNumber || (episodeIndex + 1);
    const epTitle = episode.title ? `: ${episode.title}` : '';
    const fullDisplayTitle = `${item.title} - S${season.seasonNumber}:E${epNum}${epTitle}`;

    let nextCallback = null;
    if (season.episodes[episodeIndex + 1]) {
        nextCallback = () => playMedia(itemId, seasonIndex, episodeIndex + 1);
    } else if (item.seasons[seasonIndex + 1] && item.seasons[seasonIndex + 1].episodes?.length > 0) {
        nextCallback = () => playMedia(itemId, seasonIndex + 1, 0);
    }

    const episodesCallback = () => {
        if (typeof window.stopPlayer === 'function') window.stopPlayer();
        openSeriesModal(itemId);
    };

    if (typeof window.launchPlayer === 'function') {
        window.launchPlayer(episode.streamUrl, fullDisplayTitle, {
            nextEpisodeCallback: nextCallback,
            episodesCallback: episodesCallback
        });
    } else {
        console.error("RaatFlix Player Engine (player.js) is not loaded.");
    }
}

// --- Hero & Navigation Logic ---
function setupNavbarScroll() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;
    window.addEventListener('scroll', () => navbar.classList.toggle('scrolled', window.scrollY > 50));
}

function setupFooterYear() {
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) yearSpan.textContent = new Date().getFullYear();
}

function setupSliders() {
    document.querySelectorAll('.slider-wrapper').forEach(wrapper => {
        const track = wrapper.querySelector('.media-track');
        const prev = wrapper.querySelector('.prev');
        const next = wrapper.querySelector('.next');
        if (!track || !prev || !next) return;

        next.onclick = () => track.scrollBy({ left: track.clientWidth * 0.8, behavior: 'smooth' });
        prev.onclick = () => track.scrollBy({ left: -(track.clientWidth * 0.8), behavior: 'smooth' });
    });
}

function renderHeroSection() {
    const heroContent = document.getElementById('hero-content');
    const heroIndicators = document.getElementById('hero-indicators');
    if (!heroContent || !heroIndicators) return;
    
    heroContent.innerHTML = '';
    heroIndicators.innerHTML = '';

    RaatFlixSeriesState.featured.forEach((item, index) => {
        const slide = document.createElement('div');
        slide.className = 'hero-slide';
        slide.innerHTML = `
            <img src="${escapeHtml(item.bannerUrl)}" alt="${escapeHtml(item.title)}" class="hero-bg-image">
            <div class="hero-overlay">
                <div class="hero-info">
                    <h1 class="hero-title">${escapeHtml(item.title)}</h1>
                    <div class="hero-meta">
                        <span class="match-score">${item.matchPercentage}% Match</span>
                        <span class="year">${escapeHtml(item.year)}</span>
                        <span class="age-rating">${escapeHtml(item.rating)}</span>
                        <span>${escapeHtml(Array.isArray(item.genre) ? item.genre.join(', ') : item.genre)}</span>
                    </div>
                    <p class="hero-desc">${escapeHtml(item.description)}</p>
                    <div class="hero-actions">
                        <button class="btn primary-btn" onclick="openSeriesModal('${escapeHtml(item.id)}')"><span class="material-symbols-rounded">play_arrow</span> Watch</button>
                        <button class="btn secondary-btn" onclick="openSeriesModal('${escapeHtml(item.id)}')"><span class="material-symbols-rounded">info</span> Info / Episodes</button>
                    </div>
                </div>
            </div>
        `;
        heroContent.appendChild(slide);

        const indicator = document.createElement('div');
        indicator.className = 'indicator';
        indicator.addEventListener('click', () => { setHeroSlide(index); resetHeroRotation(); });
        heroIndicators.appendChild(indicator);
    });
}

function setHeroSlide(index) {
    const slides = document.querySelectorAll('.hero-slide');
    const indicators = document.querySelectorAll('.indicator');
    if (!slides.length || !indicators.length) return;

    slides.forEach((s, idx) => {
        const isActive = idx === index;
        s.classList.toggle('active', isActive);
        s.style.pointerEvents = isActive ? 'auto' : 'none';
        s.style.zIndex = isActive ? '2' : '1';
    });

    indicators.forEach((ind, idx) => ind.classList.toggle('active', idx === index));
    RaatFlixSeriesState.currentHeroIndex = index;
}

function startHeroRotation() {
    if (RaatFlixSeriesState.featured.length <= 1) return;
    if (RaatFlixSeriesState.heroInterval) clearInterval(RaatFlixSeriesState.heroInterval);
    
    RaatFlixSeriesState.heroInterval = setInterval(() => {
        let nextIndex;
        do { 
            nextIndex = Math.floor(Math.random() * RaatFlixSeriesState.featured.length); 
        } while (nextIndex === RaatFlixSeriesState.currentHeroIndex);
        
        setHeroSlide(nextIndex);
    }, 7000);
}

function resetHeroRotation() {
    clearInterval(RaatFlixSeriesState.heroInterval);
    startHeroRotation();
}

// --- Details Modal & Episodic Logic ---
function setupModalCloseListeners() {
    const modal = document.getElementById('media-modal');
    const closeBtn = document.getElementById('close-modal');
    if (!modal) return;

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });
}

function openSeriesModal(id) {
    const modal = document.getElementById('media-modal');
    const item = RaatFlixSeriesState.series.find(s => String(s.id) === String(id));
    if (!modal || !item) return;

    RaatFlixSeriesState.activeModalItem = item;

    const modalBanner = document.getElementById('modal-banner');
    if (modalBanner) modalBanner.style.backgroundImage = `url(${item.bannerUrl || item.posterUrl})`;
    
    const setTxt = (elId, txt) => { const el = document.getElementById(elId); if (el) el.textContent = txt; };
    setTxt('modal-title', item.title);
    setTxt('modal-match', `${item.matchPercentage}% Match`);
    setTxt('modal-year', item.year);
    setTxt('modal-rating', item.rating);
    setTxt('modal-duration', item.type === 'movie' ? 'Movie' : `${item.seasons ? item.seasons.length : 0} Seasons`);
    setTxt('modal-genres', Array.isArray(item.genre) ? item.genre.join(' • ') : item.genre);
    setTxt('modal-description', item.description);

    const playBtn = document.getElementById('modal-play-btn');
    if (playBtn) {
        playBtn.onclick = () => {
            closeModal();
            playMedia(item.id, 0, 0);
        };
    }

    const seriesContainer = document.getElementById('series-container');
    if (seriesContainer) {
        if (item.seasons && item.seasons.length > 0) {
            seriesContainer.classList.remove('hidden');
            renderSeasonsDropdown(item.id, item.seasons);
        } else {
            seriesContainer.classList.add('hidden');
        }
    }

    document.body.style.overflow = 'hidden';
    modal.classList.remove('hidden');
}

function closeModal() {
    const modal = document.getElementById('media-modal');
    if (!modal) return;
    modal.classList.add('hidden');
    document.body.style.overflow = 'auto';
    RaatFlixSeriesState.activeModalItem = null;
}

function renderSeasonsDropdown(itemId, seasons) {
    const select = document.getElementById('season-select');
    if (!select || !seasons.length) return;

    select.innerHTML = seasons.map((s, i) => `<option value="${i}">Season ${s.seasonNumber}</option>`).join('');
    renderEpisodes(itemId, seasons[0].episodes, 0);

    select.onchange = (e) => {
        const seasonIdx = parseInt(e.target.value, 10);
        renderEpisodes(itemId, seasons[seasonIdx].episodes, seasonIdx);
    };
}

function renderEpisodes(itemId, episodes, seasonIdx) {
    const container = document.getElementById("episodes-list");
    if (!container || !episodes) return;

    container.innerHTML = episodes.map((ep, index) => `
        <div class="episode-card" onclick="closeModal(); playMedia('${escapeHtml(itemId)}', ${seasonIdx}, ${index});" style="cursor: pointer;">
            <div class="episode-number">${ep.episodeNumber || index + 1}</div>
            <img src="${escapeHtml(ep.thumbnailUrl || ep.poster || 'https://picsum.photos/seed/fallback/300/169')}" class="episode-img" alt="${escapeHtml(ep.title || 'Episode')}">
            <div class="episode-details">
                <div class="episode-header-info">
                    <h4>Episode ${ep.episodeNumber || index + 1}${ep.title ? ': ' + escapeHtml(ep.title) : ''}</h4>
                    <span>${escapeHtml(ep.duration || "45m")}</span>
                </div>
                <p class="episode-desc">${escapeHtml(ep.description || (ep.filename ? ep.filename.split('/').pop() : "Episode description not available."))}</p>
            </div>
        </div>
    `).join("");
}

// --- Search Engine (Series & Movies) ---
function initSeriesSearch() {
    const searchInput = document.getElementById('global-search');
    let searchDropdown = document.getElementById('search-results');
    if (!searchInput) return;

    if (!searchDropdown) {
        searchDropdown = document.createElement('div');
        searchDropdown.id = 'search-results';
        searchDropdown.className = 'search-dropdown hidden';
        searchInput.parentElement.appendChild(searchDropdown);
    }

    const handleSearch = debounce((e) => {
        const query = e.target.value.toLowerCase().trim();
        if (query.length < 2) { 
            searchDropdown.classList.add('hidden'); 
            return; 
        }

        const results = RaatFlixSeriesState.series
            .filter(s => s.title.toLowerCase().includes(query))
            .slice(0, 10);
        
        searchDropdown.innerHTML = results.length === 0 
            ? '<div class="search-result-item"><div class="search-result-info"><p>No results found.</p></div></div>'
            : results.map(item => `
                <div class="search-result-item" data-id="${escapeHtml(item.id)}">
                    <img src="${escapeHtml(item.posterUrl)}" alt="${escapeHtml(item.title)}" class="search-result-img" onerror="this.src='https://via.placeholder.com/100x150?text=No+Img'">
                    <div class="search-result-info">
                        <h4>${escapeHtml(item.title)}</h4>
                        <p>${escapeHtml(item.year)} • ${item.type === 'movie' ? 'Movie' : item.seasons.length + ' Seasons'}</p>
                    </div>
                </div>
            `).join('');

        searchDropdown.querySelectorAll('.search-result-item').forEach(item => {
            item.addEventListener('click', (e) => {
                searchDropdown.classList.add('hidden');
                openSeriesModal(e.currentTarget.dataset.id);
            });
        });
        searchDropdown.classList.remove('hidden');
    }, 200);

    searchInput.addEventListener('input', handleSearch);

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-container')) searchDropdown.classList.add('hidden');
    });
}

function getFallbackSeries() {
    return Array.from({length: 6}, (_, i) => ({
        id: `series-${i+1}`,
        title: `Fallback Series ${i+1}`,
        type: "series",
        description: "A mysterious television series.",
        posterUrl: `https://picsum.photos/seed/series${i+1}/300/450`,
        bannerUrl: `https://picsum.photos/seed/series${i+1}/1920/1080`,
        year: 2023,
        rating: "TV-MA",
        genre: ["Drama", "Thriller"],
        seasons: [{ seasonNumber: 1, episodes: [{ title: "Pilot", streamUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" }]}]
    }));
}