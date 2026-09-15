/**
 * ==========================================================================
 * RaatFlix - Favorites / My List Engine (Connected to Player & LocalStorage)
 * ==========================================================================
 */

const FAVORITES_STORAGE_KEY = 'raatflix_favorites';

const RaatFlixFavoritesState = {
    allItems: [],
    favoriteItems: [],
    featured: [],
    currentHeroIndex: 0,
    heroInterval: null,
    activeModalItem: null,
    currentPlaying: null
};

// --- LocalStorage Helpers ---
function getSavedFavorites() {
    try {
        const data = localStorage.getItem(FAVORITES_STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch (e) {
        console.error("Error reading favorites from localStorage", e);
        return [];
    }
}

function isFavorite(id) {
    const favorites = getSavedFavorites();
    return favorites.includes(String(id));
}

function toggleFavorite(id) {
    let favorites = getSavedFavorites();
    const strId = String(id);

    if (favorites.includes(strId)) {
        favorites = favorites.filter(favId => favId !== strId);
    } else {
        favorites.push(strId);
    }

    try {
        localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
    } catch (e) {
        console.error("Error saving favorites to localStorage", e);
    }

    // Refresh state and UI
    updateFavoritesState();
    updateModalAddButton(strId);
    renderFavoritePageUI();
}

function updateFavoritesState() {
    const favoriteIds = getSavedFavorites();
    RaatFlixFavoritesState.favoriteItems = RaatFlixFavoritesState.allItems.filter(item => 
        favoriteIds.includes(String(item.id))
    );
}

function slugify(text) {
    return String(text || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

// --- App Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    initFavoritesApp();
});

async function initFavoritesApp() {
    setupNavbarScroll();
    setupFooterYear();
    setupSliders();
    setupModalCloseListeners();

    await fetchAllMediaData();
    updateFavoritesState();

    renderFavoritePageUI();
    initFavoritesSearch();
}

// --- Data Fetching ---
async function fetchAllMediaData() {
    let rawSeries = [];
    let rawMovies = [];

    // Fetch Series Data
    try {
        const resSeries = await fetch(`data/series.json?t=${Date.now()}`);
        if (resSeries.ok) rawSeries = await resSeries.json();
    } catch (err) {
        console.warn("Could not fetch series data, using fallbacks.", err);
    }

    // Fetch Movies Data
    try {
        const resMovies = await fetch(`data/movies.json?t=${Date.now()}`);
        if (resMovies.ok) rawMovies = await resMovies.json();
    } catch (err) {
        console.warn("Could not fetch movies data.", err);
    }

    // Combine & Normalize Data
    const combined = [...rawSeries, ...rawMovies];

    if (combined.length === 0) {
        RaatFlixFavoritesState.allItems = getFallbackFavoritesData();
    } else {
        RaatFlixFavoritesState.allItems = combined.map((item, index) => {
            const title = item.title || `Title ${index + 1}`;
            const seasons = item.seasons || [];

            return {
                id: String(item.id || item.tmdb_id || slugify(title) || `media-${index}`),
                type: item.type || (seasons.length > 0 ? 'series' : 'movie'),
                title: title,
                posterUrl: item.poster || item.posterUrl || "",
                bannerUrl: item.backdrop || item.bannerUrl || item.poster || "",
                description: item.overview || item.description || "No description available.",
                year: item.year || "",
                rating: item.rating || "N/A",
                matchPercentage: item.matchPercentage || Math.floor(Math.random() * (99 - 80 + 1) + 80),
                genre: Array.isArray(item.genres || item.genre) ? (item.genres || item.genre) : [item.genres || item.genre || 'Drama'],
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
    }
}

// --- UI Rendering Engine ---
function renderFavoritePageUI() {
    const favs = RaatFlixFavoritesState.favoriteItems;

    // Featured Hero Section
    if (favs.length > 0) {
        RaatFlixFavoritesState.featured = [...favs].sort(() => 0.5 - Math.random()).slice(0, 5);
        renderHeroSection();
        setHeroSlide(0);
        startHeroRotation();
    } else {
        renderEmptyHero();
    }

    // Render Favorites Sliders & Grid
    renderFavoriteSliders();
    renderAllFavoritesGrid();
}

function renderFavoriteSliders() {
    const favMoviesContainer = document.getElementById('fav-movies-container');
    const favSeriesContainer = document.getElementById('fav-series-container');

    const favoriteMovies = RaatFlixFavoritesState.favoriteItems.filter(item => item.type === 'movie');
    const favoriteSeries = RaatFlixFavoritesState.favoriteItems.filter(item => item.type === 'series');

    if (favMoviesContainer) {
        favMoviesContainer.innerHTML = favoriteMovies.length > 0 
            ? favoriteMovies.map(item => createMediaCard(item)).join('')
            : '<p class="empty-msg" style="padding: 1rem; color: #888;">No favorite movies added yet.</p>';
    }

    if (favSeriesContainer) {
        favSeriesContainer.innerHTML = favoriteSeries.length > 0 
            ? favoriteSeries.map(item => createMediaCard(item)).join('')
            : '<p class="empty-msg" style="padding: 1rem; color: #888;">No favorite TV series added yet.</p>';
    }
}

function renderAllFavoritesGrid() {
    const gridContainer = document.getElementById('all-favorites-container');
    if (!gridContainer) return;

    const favs = RaatFlixFavoritesState.favoriteItems;

    if (favs.length === 0) {
        gridContainer.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem; color: #888;">
                <span class="material-symbols-rounded" style="font-size: 4rem; opacity: 0.5;">bookmark_border</span>
                <h3 style="margin-top: 1rem; font-size: 1.5rem; color: #fff;">Your Favorites List is Empty</h3>
                <p style="margin-top: 0.5rem;">Explore movies and TV shows to add them to your list.</p>
            </div>
        `;
    } else {
        gridContainer.innerHTML = favs.map(item => createMediaCard(item)).join('');
    }
}

function createMediaCard(item) {
    const metaInfo = item.type === 'movie' 
        ? 'Movie' 
        : `${item.seasons ? item.seasons.length : 0} Seasons`;

    return `
        <div class="media-card" data-id="${item.id}" onclick="openMediaModal('${item.id}')">
            <img src="${item.posterUrl}" alt="${item.title}" class="card-image" loading="lazy" onerror="this.src='https://via.placeholder.com/300x450?text=No+Poster';">
            <div class="card-overlay">
                <div class="play-icon-overlay"><span class="material-symbols-rounded">play_arrow</span></div>
                <div class="card-info">
                    <h3>${item.title}</h3>
                    <div class="card-meta"><span>${item.year}</span><span>•</span><span>${metaInfo}</span></div>
                </div>
            </div>
        </div>
    `;
}

// --- Hero Banner Engine ---
function renderHeroSection() {
    const heroContent = document.getElementById('hero-content');
    const heroIndicators = document.getElementById('hero-indicators');
    if (!heroContent || !heroIndicators) return;
    
    heroContent.innerHTML = '';
    heroIndicators.innerHTML = '';

    RaatFlixFavoritesState.featured.forEach((item, index) => {
        const slide = document.createElement('div');
        slide.className = 'hero-slide';
        slide.innerHTML = `
            <img src="${item.bannerUrl}" alt="${item.title}" class="hero-bg-image">
            <div class="hero-overlay">
                <div class="hero-info">
                    <h1 class="hero-title">${item.title}</h1>
                    <div class="hero-meta">
                        <span class="match-score">${item.matchPercentage}% Match</span>
                        <span class="year">${item.year}</span>
                        <span class="age-rating">${item.rating}</span>
                        <span>${Array.isArray(item.genre) ? item.genre.join(', ') : item.genre}</span>
                    </div>
                    <p class="hero-desc">${item.description}</p>
                    <div class="hero-actions">
                        <button class="btn primary-btn" onclick="openMediaModal('${item.id}')"><span class="material-symbols-rounded">play_arrow</span> Watch</button>
                        <button class="btn secondary-btn" onclick="openMediaModal('${item.id}')"><span class="material-symbols-rounded">info</span> Info</button>
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

function renderEmptyHero() {
    const heroContent = document.getElementById('hero-content');
    const heroIndicators = document.getElementById('hero-indicators');
    if (!heroContent) return;
    
    if (heroIndicators) heroIndicators.innerHTML = '';
    
    heroContent.innerHTML = `
        <div class="hero-slide active" style="z-index: 2; pointer-events: auto;">
            <div class="hero-overlay" style="background: linear-gradient(180deg, rgba(15,23,42,0.6) 0%, rgba(15,23,42,1) 100%); display: flex; align-items: center; justify-content: center;">
                <div class="hero-info" style="text-align: center; max-width: 600px;">
                    <h1 class="hero-title" style="font-size: 2.5rem;">My Favorites</h1>
                    <p class="hero-desc" style="margin-top: 1rem; color: #cbd5e1;">All your saved movies and TV shows in one place. Click the '+' or favorite button on any title to add it here.</p>
                </div>
            </div>
        </div>
    `;
}

function setHeroSlide(index) {
    const slides = document.querySelectorAll('.hero-slide');
    const indicators = document.querySelectorAll('.indicator');
    if (!slides.length || !indicators.length) return;

    slides.forEach((s, idx) => {
        if (idx === index) {
            s.classList.add('active');
            s.style.pointerEvents = 'auto';
            s.style.zIndex = '2';
        } else {
            s.classList.remove('active');
            s.style.pointerEvents = 'none';
            s.style.zIndex = '1';
        }
    });

    indicators.forEach((ind, idx) => ind.classList.toggle('active', idx === index));
    RaatFlixFavoritesState.currentHeroIndex = index;
}

function startHeroRotation() {
    if (RaatFlixFavoritesState.heroInterval) clearInterval(RaatFlixFavoritesState.heroInterval);
    RaatFlixFavoritesState.heroInterval = setInterval(() => {
        if (RaatFlixFavoritesState.featured.length <= 1) return;
        let nextIndex;
        do { nextIndex = Math.floor(Math.random() * RaatFlixFavoritesState.featured.length); } 
        while (nextIndex === RaatFlixFavoritesState.currentHeroIndex);
        setHeroSlide(nextIndex);
    }, 7000);
}

function resetHeroRotation() {
    clearInterval(RaatFlixFavoritesState.heroInterval);
    startHeroRotation();
}

// --- Player Integration Engine ---
function playMedia(itemId, seasonIndex = 0, episodeIndex = 0) {
    const item = RaatFlixFavoritesState.allItems.find(s => String(s.id) === String(itemId));
    if (!item) {
        alert("Media content not found.");
        return;
    }

    // Single Movie
    if (item.type === 'movie' || (!item.seasons.length && item.streamUrl)) {
        if (!item.streamUrl) {
            alert("No video stream URL available for this movie yet.");
            return;
        }

        RaatFlixFavoritesState.currentPlaying = { item, seasonIndex: -1, episodeIndex: -1 };

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

    RaatFlixFavoritesState.currentPlaying = { item, seasonIndex, episodeIndex };

    const epNum = episode.episodeNumber || (episodeIndex + 1);
    const epTitle = episode.title ? `: ${episode.title}` : '';
    const fullDisplayTitle = `${item.title} - S${season.seasonNumber}:E${epNum}${epTitle}`;

    let nextCallback = null;
    if (season.episodes[episodeIndex + 1]) {
        nextCallback = () => playMedia(itemId, seasonIndex, episodeIndex + 1);
    } else if (item.seasons[seasonIndex + 1] && item.seasons[seasonIndex + 1].episodes.length > 0) {
        nextCallback = () => playMedia(itemId, seasonIndex + 1, 0);
    }

    const episodesCallback = () => {
        if (typeof window.stopPlayer === 'function') window.stopPlayer();
        openMediaModal(itemId);
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

// --- Modal & Favorite Toggle UI Logic ---
function setupModalCloseListeners() {
    const modal = document.getElementById('media-modal');
    const closeBtn = document.getElementById('close-modal');
    if (!modal || !closeBtn) return;

    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });
}

function openMediaModal(id) {
    const modal = document.getElementById('media-modal');
    const item = RaatFlixFavoritesState.allItems.find(s => String(s.id) === String(id));
    if (!modal || !item) return;

    RaatFlixFavoritesState.activeModalItem = item;

    document.getElementById('modal-banner').style.backgroundImage = `url(${item.bannerUrl || item.posterUrl})`;
    document.getElementById('modal-title').textContent = item.title;
    document.getElementById('modal-match').textContent = `${item.matchPercentage}% Match`;
    document.getElementById('modal-year').textContent = item.year;
    document.getElementById('modal-rating').textContent = item.rating;
    document.getElementById('modal-duration').textContent = item.type === 'movie' ? 'Movie' : `${item.seasons ? item.seasons.length : 0} Seasons`;
    document.getElementById('modal-genres').textContent = Array.isArray(item.genre) ? item.genre.join(' • ') : item.genre;
    document.getElementById('modal-description').textContent = item.description;

    // Play Button in Modal
    document.getElementById('modal-play-btn').onclick = () => {
        closeModal();
        playMedia(item.id, 0, 0);
    };

    // Favorite / Add Button in Modal
    const addBtn = document.getElementById('modal-add-btn');
    if (addBtn) {
        updateModalAddButton(item.id);
        addBtn.onclick = () => toggleFavorite(item.id);
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

function updateModalAddButton(id) {
    const addBtn = document.getElementById('modal-add-btn');
    if (!addBtn) return;

    const favorited = isFavorite(id);
    addBtn.setAttribute('aria-label', favorited ? 'Remove from List' : 'Add to List');
    addBtn.innerHTML = `<span class="material-symbols-rounded">${favorited ? 'check' : 'add'}</span>`;
}

function closeModal() {
    const modal = document.getElementById('media-modal');
    if (!modal) return;
    modal.classList.add('hidden');
    document.body.style.overflow = 'auto';
    RaatFlixFavoritesState.activeModalItem = null;
}

function renderSeasonsDropdown(itemId, seasons) {
    const select = document.getElementById('season-select');
    if (!select || seasons.length === 0) return;

    select.innerHTML = seasons.map((s, i) => `<option value="${i}">Season ${s.seasonNumber}</option>`).join('');
    renderEpisodes(itemId, seasons[0].episodes, 0);

    select.onchange = (e) => {
        const seasonIdx = parseInt(e.target.value, 10);
        renderEpisodes(itemId, seasons[seasonIdx].episodes, seasonIdx);
    };
}

function renderEpisodes(itemId, episodes, seasonIdx) {
    const container = document.getElementById("episodes-list");
    if (!container) return;

    container.innerHTML = episodes.map((ep, index) => `
        <div class="episode-card" onclick="closeModal(); playMedia('${itemId}', ${seasonIdx}, ${index});" style="cursor: pointer;">
            <div class="episode-number">${ep.episodeNumber || index + 1}</div>
            <img src="${ep.thumbnailUrl || ep.poster || 'https://picsum.photos/seed/fallback/300/169'}" class="episode-img" alt="${ep.title || 'Episode'}">
            <div class="episode-details">
                <div class="episode-header-info">
                    <h4>Episode ${ep.episodeNumber || index + 1}${ep.title ? ': ' + ep.title : ''}</h4>
                    <span>${ep.duration || "45m"}</span>
                </div>
                <p class="episode-desc">${ep.description || (ep.filename ? ep.filename.split('/').pop() : "Episode description not available.")}</p>
            </div>
        </div>
    `).join("");
}

// --- Search Engine ---
function initFavoritesSearch() {
    const searchInput = document.getElementById('global-search');
    let searchDropdown = document.getElementById('search-results');
    if (!searchInput) return;

    if (!searchDropdown) {
        searchDropdown = document.createElement('div');
        searchDropdown.id = 'search-results';
        searchDropdown.className = 'search-dropdown hidden';
        searchInput.parentElement.appendChild(searchDropdown);
    }

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        if (query.length < 2) { searchDropdown.classList.add('hidden'); return; }

        const results = RaatFlixFavoritesState.allItems.filter(s => s.title.toLowerCase().includes(query)).slice(0, 10);
        
        searchDropdown.innerHTML = results.length === 0 
            ? '<div class="search-result-item"><div class="search-result-info"><p>No results found.</p></div></div>'
            : results.map(item => `
                <div class="search-result-item" data-id="${item.id}">
                    <img src="${item.posterUrl}" alt="${item.title}" class="search-result-img" onerror="this.src='https://via.placeholder.com/100x150?text=No+Img'">
                    <div class="search-result-info">
                        <h4>${item.title}</h4>
                        <p>${item.year} • ${item.type === 'movie' ? 'Movie' : (item.seasons ? item.seasons.length : 0) + ' Seasons'}</p>
                    </div>
                </div>
            `).join('');

        searchDropdown.querySelectorAll('.search-result-item').forEach(item => {
            item.addEventListener('click', (e) => {
                searchDropdown.classList.add('hidden');
                openMediaModal(e.currentTarget.dataset.id);
            });
        });
        searchDropdown.classList.remove('hidden');
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-container')) searchDropdown.classList.add('hidden');
    });
}

// --- Layout Helpers ---
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

        next.addEventListener('click', () => track.scrollBy({ left: track.clientWidth * 0.8, behavior: 'smooth' }));
        prev.addEventListener('click', () => track.scrollBy({ left: -(track.clientWidth * 0.8), behavior: 'smooth' }));
    });
}

function getFallbackFavoritesData() {
    return Array.from({length: 4}, (_, i) => ({
        id: `media-${i+1}`,
        title: `Sample Saved Title ${i+1}`,
        type: i % 2 === 0 ? "movie" : "series",
        description: "A featured movie or TV show saved to your favorites.",
        posterUrl: `https://picsum.photos/seed/fav${i+1}/300/450`,
        bannerUrl: `https://picsum.photos/seed/fav${i+1}/1920/1080`,
        year: 2024,
        rating: "TV-MA",
        matchPercentage: 95,
        genre: ["Drama", "Action"],
        streamUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        seasons: i % 2 === 0 ? [] : [{ seasonNumber: 1, episodes: [{ title: "Pilot", streamUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" }]}]
    }));
}