/* ==========================================
   RAATFLIX PROFILE DROPDOWN LOGIC
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {
    const profileTrigger = document.getElementById('profileTrigger');
    const profileMenu = document.getElementById('profileMenu');
    const signOutBtn = document.getElementById('signOutBtn');

    if (!profileTrigger || !profileMenu) return;

    // Toggle dropdown menu on avatar click
    profileTrigger.addEventListener('click', (e) => {
        e.stopPropagation();
        profileMenu.classList.toggle('show');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!profileMenu.contains(e.target) && !profileTrigger.contains(e.target)) {
            profileMenu.classList.remove('show');
        }
    });

    // Sign Out Handler
    if (signOutBtn) {
        signOutBtn.addEventListener('click', () => {
            // Add custom sign-out logic here (e.g., clear tokens, redirect)
            window.location.href = '../main/index.html';
        });
    }
});