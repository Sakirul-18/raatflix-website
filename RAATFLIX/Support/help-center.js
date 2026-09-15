/* ==========================================================================
   🎬 RaatFlix - Help Center Interactive Logic (Apple-Style & Step-by-Step)
   ========================================================================== */

// 1. CONFIGURATION: Set your Telegram credentials
const TELEGRAM_BOT_TOKEN = '8285355146:AAHgtSPABnH0JpvWFZSG-Eq1XSpPXWmgGdw'; 
const TELEGRAM_CHAT_ID = '-5151980516';

// Data mapping for all Help Center categories
const helpData = {
    'watching': {
        title: "Watching RaatFlix",
        type: "faq",
        items: [
            { 
                q: "How do I watch a movie or TV series?", 
                a: "Follow these simple steps to start streaming:<br><br>" +
                   "1. Look at the top navigation bar or the home screen.<br>" +
                   "2. Click or tap on any movie or show poster you would like to watch.<br>" +
                   "3. Once the preview screen opens, click the large yellow <b>'Play'</b> button.<br>" +
                   "4. Sit back and enjoy! The video will automatically start playing in high definition." 
            },
            { 
                q: "How do I select a specific episode in a TV show?", 
                a: "To pick an exact season or episode:<br><br>" +
                   "1. Click on the TV series card from the main page.<br>" +
                   "2. Scroll down slightly until you see the <b>'Seasons & Episodes'</b> section.<br>" +
                   "3. Click the dropdown menu to select your desired Season (e.g., Season 1, Season 2).<br>" +
                   "4. Click directly on the episode thumbnail you wish to watch." 
            },
            { 
                q: "What should I do if the video keeps buffering or loading slowly?", 
                a: "If playback pauses frequently, try these quick fixes:<br><br>" +
                   "1. <b>Check Connection:</b> Ensure your Wi-Fi or mobile data is turned on and stable.<br>" +
                   "2. <b>Refresh Page:</b> Press the refresh icon on your browser address bar or press 'F5' on your keyboard.<br>" +
                   "3. <b>Lower Stream Quality:</b> Click the Gear icon ⚙️ inside the video player and change resolution from 1080p to 720p." 
            },
            { 
                q: "How do I turn on subtitles or change the audio language?", 
                a: "Customizing your listening and viewing experience is easy:<br><br>" +
                   "1. Move your mouse or tap the screen while the video is playing to show controls.<br>" +
                   "2. Look for the <b>'Audio & Subtitles'</b> icon (looks like a speech bubble or gear icon ⚙️) in the bottom-right corner.<br>" +
                   "3. Select your preferred spoken language or turn English Subtitles ON." 
            },
            { 
                q: "How do I make the video full screen?", 
                a: "To expand the video to fill your entire display screen:<br><br>" +
                   "1. Click the square <b>Fullscreen Icon</b> located at the far bottom-right corner of the player bar.<br>" +
                   "2. Alternatively, simply press the <b>'F' key</b> on your keyboard.<br>" +
                   "3. To exit full screen at any time, press the <b>'Esc' key</b> or tap the fullscreen icon again." 
            }
        ]
    },
    'account': {
        title: "Account & Library",
        type: "faq",
        items: [
            { 
                q: "How do I create a new RaatFlix account?", 
                a: "Setting up an account takes less than a minute:<br><br>" +
                   "1. Look at the top right corner of the website navbar.<br>" +
                   "2. Click the <b>Profile / Sign In</b> button.<br>" +
                   "3. Click on <b>'Create Account'</b> at the bottom of the popup.<br>" +
                   "4. Enter your preferred username, email address, and password, then click <b>Register</b>." 
            },
            { 
                q: "How do I reset my account password?", 
                a: "If you forgot your password, follow these step-by-step instructions:<br><br>" +
                   "1. Click <b>Sign In</b> at the top right of the screen.<br>" +
                   "2. Click the yellow link that says <b>'Forgot Password?'</b>.<br>" +
                   "3. Enter the email address linked to your RaatFlix account.<br>" +
                   "4. Open your email inbox, find the message from RaatFlix, and click the password reset button inside." 
            },
            { 
                q: "How do I add or remove titles from my Watchlist / Favorites?", 
                a: "Keep track of movies you want to watch later:<br><br>" +
                   "1. Hover over any movie poster or open its detail page.<br>" +
                   "2. Look for the <b>Bookmark / Heart Icon</b>.<br>" +
                   "3. Click the icon once—it will highlight in gold, meaning it is saved to your Favorites.<br>" +
                   "4. Click it again at any time to remove it from your personal collection." 
            },
            { 
                q: "Why are my saved Favorites missing?", 
                a: "If your saved library appears empty:<br><br>" +
                   "1. Check the top bar to verify if you are signed into your account.<br>" +
                   "2. Guest sessions do not sync across devices. Ensure you sign in with your account credentials." 
            }
        ]
    },
    'search-browse': {
        title: "Search & Discovery",
        type: "faq",
        items: [
            { 
                q: "How do I search for a specific movie or actor?", 
                a: "Finding your favorite titles is seamless:<br><br>" +
                   "1. Click on the wide <b>Search Bar</b> located near the top center of the website.<br>" +
                   "2. Type the title of the show, movie name, or actor's full name.<br>" +
                   "3. Instant search results will appear automatically on your screen as you type." 
            },
            { 
                q: "How do I filter between Movies and TV Series?", 
                a: "If you only want to look for feature films or multi-episode shows:<br><br>" +
                   "1. Locate the top navigation menu at the very top of the webpage.<br>" +
                   "2. Click on <b>'Movies'</b> to display feature films only.<br>" +
                   "3. Click on <b>'Series'</b> to explore television shows and serials." 
            },
            { 
                q: "How do I browse content by genre (Action, Anime, Drama)?", 
                a: "To find titles matching a specific mood:<br><br>" +
                   "1. Scroll down on the homepage until you locate the <b>Categories Section</b>.<br>" +
                   "2. Select any genre button (such as Action, Sci-Fi, Horror, or Anime).<br>" +
                   "3. The page will reload instantly with a curated collection of titles matching that category." 
            }
        ]
    },
    'request': {
        title: "Request Content",
        type: "form-request"
    },
    'report-bug': {
        title: "Report an Issue",
        type: "form-bug"
    },
    'feedback': {
        title: "Share Feedback",
        type: "form-feedback"
    },
    'contact': {
        title: "Contact Support",
        type: "form-contact"
    },
    'copyright': {
        title: "Legal & Copyright",
        type: "faq",
        items: [
            { 
                q: "How do I report inaccurate movie details or posters?", 
                a: "If you notice an incorrect release year, wrong thumbnail, or description error:<br><br>" +
                   "1. Click on the <b>'Report an Issue'</b> card from the main Help Center page.<br>" +
                   "2. Select <b>'Missing Artwork or Metadata'</b> from the dropdown options.<br>" +
                   "3. Type the movie title and explain what details need fixing.<br>" +
                   "4. Click <b>Submit</b> and our editing team will update it within 24 hours." 
            },
            { 
                q: "How are copyright and DMCA takedown requests processed?", 
                a: "RaatFlix respects intellectual property rights:<br><br>" +
                   "1. Official copyright holders or legal representatives can draft an official inquiry.<br>" +
                   "2. Send your formal notice including title information directly to our legal team at <b>legal@raatflix.com</b>.<br>" +
                   "3. Our compliance team responds to all formal DMCA communications within 1 to 2 business days." 
            }
        ]
    }
};

// Open Section Function
function openSection(key) {
    const data = helpData[key];
    if (!data) return;

    const grid = document.getElementById('categories-grid');
    const panel = document.getElementById('help-detail-panel');
    const content = document.getElementById('panel-content');

    grid.style.display = 'none';
    panel.classList.remove('hidden');

    let html = `<h2 class="section-title" style="margin-bottom: 24px; font-weight: 600; letter-spacing: -0.02em;">${data.title}</h2>`;

    if (data.type === 'faq') {
        html += '<div class="faq-list">';
        data.items.forEach(item => {
            html += `
                <div class="faq-item" style="padding: 16px 0; border-bottom: 1px solid rgba(255,255,255,0.08);">
                    <div class="faq-question" onclick="toggleFaq(this)" style="cursor: pointer; display: flex; justify-space-between; align-items: center;">
                        <span style="font-size: 16px; font-weight: 600;">${item.q}</span>
                        <i class="fa-solid fa-chevron-down"></i>
                    </div>
                    <div class="faq-answer" style="line-height: 1.7; font-size: 14px; color: #cfcfcf; margin-top: 12px;">${item.a}</div>
                </div>
            `;
        });
        html += '</div>';
    } else if (data.type === 'form-request') {
        html += `
            <form class="help-form" onsubmit="handleFormSubmit(event)">
                <div class="form-group">
                    <label>Your Name</label>
                    <input type="text" placeholder="First and last name or username" required>
                </div>
                <div class="form-group">
                    <label>Title Name</label>
                    <input type="text" placeholder="Title name" required>
                </div>
                <div class="form-group">
                    <label>Content Format</label>
                    <select required>
                        <option value="Movie">Movie</option>
                        <option value="TV Series">TV Series</option>
                        <option value="Anime">Anime</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Release Year (Optional)</label>
                    <input type="number" placeholder="YYYY">
                </div>
                <div class="form-group">
                    <label>Additional Details</label>
                    <textarea rows="4" placeholder="Specify language preferences, audio tracks, or season details..."></textarea>
                </div>
                <button type="submit" class="submit-btn">Submit Request</button>
            </form>
        `;
    } else if (data.type === 'form-bug') {
        html += `
            <form class="help-form" onsubmit="handleFormSubmit(event)">
                <div class="form-group">
                    <label>Your Name</label>
                    <input type="text" placeholder="First and last name or username" required>
                </div>
                <div class="form-group">
                    <label>Issue Category</label>
                    <select required>
                        <option value="Playback / Streaming Error">Playback / Streaming Error</option>
                        <option value="Broken Navigation or Button">Broken Navigation or Button</option>
                        <option value="Search Functionality">Search Functionality</option>
                        <option value="Missing Artwork or Metadata">Missing Artwork or Metadata</option>
                        <option value="Mobile Display Issue">Mobile Display Issue</option>
                        <option value="General Technical Problem">General Technical Problem</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Description</label>
                    <textarea rows="5" placeholder="Describe the issue, including steps to reproduce or affected pages..." required></textarea>
                </div>
                <button type="submit" class="submit-btn">Send Report</button>
            </form>
        `;
    } else if (data.type === 'form-feedback') {
        html += `
            <form class="help-form" onsubmit="handleFormSubmit(event)">
                <div class="form-group">
                    <label>Your Name</label>
                    <input type="text" placeholder="First and last name or username" required>
                </div>
                <div class="form-group">
                    <label>Feedback Topic</label>
                    <select>
                        <option value="Feature Suggestion">Feature Suggestion</option>
                        <option value="Interface Experience">Interface Experience</option>
                        <option value="General Feedback">General Feedback</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Message</label>
                    <textarea rows="5" placeholder="Share your suggestions to help us improve RaatFlix..." required></textarea>
                </div>
                <button type="submit" class="submit-btn">Submit Feedback</button>
            </form>
        `;
    } else if (data.type === 'form-contact') {
        html += `
            <form class="help-form" onsubmit="handleFormSubmit(event)">
                <div class="form-group">
                    <label>Your Name</label>
                    <input type="text" placeholder="First and last name" required>
                </div>
                <div class="form-group">
                    <label>Email Address</label>
                    <input type="email" placeholder="name@example.com" required>
                </div>
                <div class="form-group">
                    <label>Message</label>
                    <textarea rows="5" placeholder="How can our team assist you?" required></textarea>
                </div>
                <button type="submit" class="submit-btn">Send Message</button>
            </form>
        `;
    }

    content.innerHTML = html;
}

// Close Detail Section
function closeSection() {
    document.getElementById('categories-grid').style.display = 'grid';
    document.getElementById('help-detail-panel').classList.add('hidden');
}

// FAQ Accordion Toggle
function toggleFaq(element) {
    const parent = element.parentElement;
    parent.classList.toggle('active');
}

// Telegram Form Submission Handler
async function handleFormSubmit(e) {
    e.preventDefault();

    const form = e.target;
    const submitBtn = form.querySelector('.submit-btn');
    
    submitBtn.disabled = true;
    submitBtn.innerText = 'Sending...';

    const pageUrl = window.location.href;
    const deviceType = navigator.userAgent.includes('Mobile') ? 'Mobile' : 'Desktop';
    const timeSubmitted = new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });

    const formElements = form.querySelectorAll('input, select, textarea');
    let formData = {};

    formElements.forEach(input => {
        const label = input.previousElementSibling?.innerText || input.name || 'Field';
        if (input.value.trim() !== '') {
            formData[label] = input.value.trim();
        }
    });

    let message = `🎬 <b>RAATFLIX SUPPORT SUBMISSION</b>\n\n`;
    message += `<b>Submitted:</b> ${timeSubmitted}\n`;
    message += `<b>Platform:</b> ${deviceType}\n`;
    message += `<b>URL:</b> ${pageUrl}\n`;
    message += `───────────────────────\n\n`;

    for (const [key, value] of Object.entries(formData)) {
        message += `<b>${key}:</b> ${value}\n`;
    }

    try {
        const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: message,
                parse_mode: 'HTML'
            })
        });

        if (response.ok) {
            alert('Your submission has been received. Thank you for contacting RaatFlix.');
            form.reset();
            closeSection();
        } else {
            alert('Unable to transmit request. Please confirm bot credentials.');
        }
    } catch (error) {
        console.error('Submission error:', error);
        alert('Network connection error. Please try again.');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerText = 'Submit';
    }
}

/* ==========================================================================
   Live Multi-Category Search & Step-by-Step Guidance System
   ========================================================================== */

document.getElementById('help-search-input')?.addEventListener('input', function(e) {
    const query = e.target.value.toLowerCase().trim();
    const grid = document.getElementById('categories-grid');
    const panel = document.getElementById('help-detail-panel');
    const content = document.getElementById('panel-content');

    if (query.length === 0) {
        closeSection();
        const cards = grid.querySelectorAll('.category-card');
        cards.forEach(card => card.style.display = 'block');
        return;
    }

    const cards = grid.querySelectorAll('.category-card');
    cards.forEach(card => {
        const text = card.innerText.toLowerCase();
        if (text.includes(query)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });

    if (query.length >= 2) {
        let results = [];

        Object.keys(helpData).forEach(key => {
            const cat = helpData[key];
            if (cat.type === 'faq' && cat.items) {
                cat.items.forEach(item => {
                    if (item.q.toLowerCase().includes(query) || item.a.toLowerCase().includes(query)) {
                        results.push({
                            category: cat.title,
                            question: item.q,
                            answer: item.a
                        });
                    }
                });
            }
        });

        grid.style.display = 'none';
        panel.classList.remove('hidden');

        if (results.length > 0) {
            let html = `<h2 class="section-title" style="margin-bottom: 24px; font-weight: 600;">🔍 Search Results (${results.length})</h2>`;
            html += '<div class="faq-list">';
            
            results.forEach(item => {
                html += `
                    <div class="faq-item active" style="margin-bottom: 20px; padding: 16px; background: rgba(255,255,255,0.03); border-radius: 8px;">
                        <div class="faq-question">
                            <span><small style="color: #ff9900; display: block; font-size: 11px; text-transform: uppercase; font-weight: 600; margin-bottom: 6px;">${item.category}</small><strong style="font-size: 17px;">${item.question}</strong></span>
                        </div>
                        <div class="faq-answer" style="display: block; margin-top: 12px; font-size: 14px; line-height: 1.8; color: #d0d0d0;">${item.answer}</div>
                    </div>
                `;
            });
            
            html += '</div>';
            content.innerHTML = html;
        } else {
            content.innerHTML = `
                <div style="text-align: center; padding: 40px 20px;">
                    <h3 style="font-weight: 600; margin-bottom: 8px;">No matching guide found</h3>
                    <p style="color: #a0a0a0; font-size: 14px;">Try searching with a simpler word or choose a category directly from the options below.</p>
                </div>
            `;
        }
    }
});