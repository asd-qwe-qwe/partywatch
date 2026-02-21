// Theme Toggle
const themeToggle = document.getElementById('themeToggle');
const htmlElement = document.documentElement;
const icon = themeToggle ? themeToggle.querySelector('i') : null;

// Check local storage
const savedTheme = localStorage.getItem('theme') || 'dark';
htmlElement.setAttribute('data-theme', savedTheme);
updateIcon(savedTheme);

if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        const currentTheme = htmlElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        htmlElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateIcon(newTheme);
    });
}

function updateIcon(theme) {
    if (!icon) return;
    if (theme === 'dark') {
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
    } else {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
    }
}

// Sticky Navbar Effect
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    if (!navbar) return;
    if (window.scrollY > 50) {
        navbar.style.padding = '0';
        navbar.style.backgroundColor = 'var(--bg-glass)';
    } else {
        navbar.style.padding = '10px 0';
        navbar.style.backgroundColor = 'transparent';
    }
});




// --- New Features Logic ---

// Modal Logic
const extensionModal = document.getElementById('extensionModal');

function showExtensionModal() {
    if (extensionModal) {
        extensionModal.style.display = 'flex';
        // Trigger reflow for transition
        extensionModal.offsetHeight;
        extensionModal.classList.add('active');
        extensionModal.style.opacity = '1';
    }
}

function closeModal() {
    if (extensionModal) {
        extensionModal.classList.remove('active');
        extensionModal.style.opacity = '0';
        setTimeout(() => {
            extensionModal.style.display = 'none';
        }, 300);
    }
}

function redirectToDownload() {
    closeModal();
    const downloadSection = document.getElementById('download');
    if (downloadSection) {
        downloadSection.scrollIntoView({ behavior: 'smooth' });
    }
}

// Close modal when clicking outside
if (extensionModal) {
    extensionModal.addEventListener('click', (e) => {
        if (e.target === extensionModal) {
            closeModal();
        }
    });
}

// View All Rooms Logic
const viewAllBtn = document.getElementById('viewAllBtn');

if (viewAllBtn) {
    viewAllBtn.addEventListener('click', () => {
        const hiddenRooms = document.querySelectorAll('.hidden-room');
        hiddenRooms.forEach(room => {
            room.style.display = 'flex'; // Use flex to maintain card layout
            room.classList.remove('hidden-room');
        });
        viewAllBtn.style.display = 'none'; // Hide button after expanding
    });
}
// --- Auth Logic ---
function initAuth() {
    // Select forms safely
    const authForm = document.querySelector('.auth-card form');
    const usernameInput = document.getElementById('username');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirm-password');

    // Identify Page Type
    const isRegisterPage = !!(authForm && usernameInput && confirmPasswordInput);
    const isLoginPage = !!(authForm && emailInput && passwordInput && !usernameInput);

    // Handle Register
    if (isRegisterPage) {
        // Password strength indicator
        const strengthFill = document.getElementById('passwordStrengthFill');
        const strengthLabel = document.getElementById('passwordStrengthLabel');
        if (passwordInput && strengthFill && strengthLabel) {
            function updatePasswordStrength() {
                const p = passwordInput.value;
                let score = 0;
                if (p.length >= 8) score += 20;
                if (p.length >= 12) score += 15;
                if (p.length >= 16) score += 10;
                if (/[a-z]/.test(p)) score += 15;
                if (/[A-Z]/.test(p)) score += 15;
                if (/\d/.test(p)) score += 15;
                if (/[^a-zA-Z0-9]/.test(p)) score += 10;

                const level = score < 25 ? 'weak' : score < 50 ? 'fair' : score < 75 ? 'good' : 'strong';
                const labels = { weak: 'Weak', fair: 'Fair', good: 'Good', strong: 'Strong' };
                const width = Math.min(100, score);

                strengthFill.style.width = width + '%';
                strengthFill.className = 'password-strength-fill ' + (p.length ? level : '');
                strengthLabel.textContent = p.length ? labels[level] : '';
            }
            passwordInput.addEventListener('input', updatePasswordStrength);
            passwordInput.addEventListener('focus', updatePasswordStrength);
        }

        authForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = usernameInput.value;
            const email = emailInput.value;
            const password = passwordInput.value;
            const confirmPass = confirmPasswordInput.value;

            if (password.length < 8) {
                alert("Password must be at least 8 characters!");
                return;
            }
            if (password !== confirmPass) {
                alert("Passwords do not match!");
                return;
            }

            // Get existing users (safe parse in case of corrupted data)
            let users = [];
            try {
                users = JSON.parse(localStorage.getItem('watch4party_users') || '[]');
            } catch (_) {
                users = [];
            }
            if (!Array.isArray(users)) users = [];

            // Check duplicate
            if (users.find(u => u.email === email)) {
                alert("User with this email already exists!");
                return;
            }

            // Register new user
            const newUser = { username, email, password };
            users.push(newUser);
            localStorage.setItem('watch4party_users', JSON.stringify(users));

            // Auto-login
            localStorage.setItem('watch4party_currentUser', JSON.stringify(newUser));

            // Visual feedback
            const btn = authForm.querySelector('button');
            const originalText = btn.textContent;
            btn.textContent = 'Success! Redirecting...';
            btn.style.background = '#4CAF50';
            btn.disabled = true;

            setTimeout(() => {
                window.location.href = '../index.html';
            }, 1000);
        });
    }

    // Handle Login
    if (isLoginPage) {
        authForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = emailInput.value;
            const password = passwordInput.value;

            let users = [];
            try {
                users = JSON.parse(localStorage.getItem('watch4party_users') || '[]');
            } catch (_) {
                users = [];
            }
            if (!Array.isArray(users)) users = [];
            const validUser = users.find(u => u.email === email && u.password === password);

            if (validUser) {
                // Success
                localStorage.setItem('watch4party_currentUser', JSON.stringify(validUser));

                const btn = authForm.querySelector('button');
                btn.textContent = 'Logging In...';

                setTimeout(() => {
                    window.location.href = '../index.html';
                }, 800);
            } else {
                // Error
                alert("Invalid email or password!");
            }
        });
    }

    // Check Auth State (Global)
    checkAuthState();
}

// Run when DOM is ready (script is at end of body so DOM may already be loaded)
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAuth);
} else {
    initAuth();
}

function checkAuthState() {
    let currentUser = null;
    try {
        currentUser = JSON.parse(localStorage.getItem('watch4party_currentUser'));
    } catch (_) {
        currentUser = null;
    }
    const authBtn = document.querySelector('.navbar .desktop-only .btn-primary');

    // Only run this on pages with the navbar login button (like index.html)
    if (currentUser && authBtn && authBtn.textContent.trim() === 'Login') {
        const parent = authBtn.parentElement;
        const dropdown = document.createElement('div');
        dropdown.className = 'profile-dropdown';
        dropdown.innerHTML = `
            <button type="button" class="btn profile-dropdown-trigger" aria-expanded="false" aria-haspopup="true">
                <span>${escapeHtml(currentUser.username)}</span>
                <i class="fa-solid fa-chevron-down"></i>
            </button>
            <div class="profile-dropdown-menu" role="menu">
                <div class="profile-menu-header">
                    <span class="profile-menu-user">${escapeHtml(currentUser.username)}</span>
                    <button type="button" class="profile-menu-close" aria-label="Close"><i class="fa-solid fa-times"></i></button>
                </div>
                <nav class="profile-menu-nav">
                    <a href="profile/" class="profile-menu-item"><i class="fa-solid fa-user"></i> Profile</a>
                    <a href="settings/" class="profile-menu-item"><i class="fa-solid fa-sliders"></i> Settings</a>
                    <button type="button" class="profile-menu-item profile-menu-logout"><i class="fa-solid fa-right-from-bracket"></i> Log out</button>
                </nav>
            </div>
        `;
        parent.replaceChild(dropdown, authBtn);

        const trigger = dropdown.querySelector('.profile-dropdown-trigger');
        const menu = dropdown.querySelector('.profile-dropdown-menu');
        const closeBtn = dropdown.querySelector('.profile-menu-close');
        const logoutBtn = dropdown.querySelector('.profile-menu-logout');

        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('open');
            trigger.setAttribute('aria-expanded', dropdown.classList.contains('open'));
        });

        closeBtn.addEventListener('click', () => {
            dropdown.classList.remove('open');
            trigger.setAttribute('aria-expanded', 'false');
        });

        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            dropdown.classList.remove('open');
            if (confirm(`Log out as ${currentUser.username}?`)) {
                localStorage.removeItem('watch4party_currentUser');
                window.location.reload();
            }
        });

        dropdown.querySelectorAll('.profile-menu-item[href]').forEach((link) => {
            link.addEventListener('click', () => { dropdown.classList.remove('open'); });
        });

        document.addEventListener('click', () => {
            dropdown.classList.remove('open');
            trigger.setAttribute('aria-expanded', 'false');
        });
        menu.addEventListener('click', (e) => e.stopPropagation());
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

