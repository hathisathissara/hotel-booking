// Function to load layout components
async function loadLayout() {
    const headerPlaceholder = document.getElementById('header-placeholder');
    const footerPlaceholder = document.getElementById('footer-placeholder');

    if (headerPlaceholder) {
        try {
            const res = await fetch('/layout/header.html');
            if (res.ok) {
                headerPlaceholder.innerHTML = await res.text();
            }
        } catch (e) {
            console.error('Error loading header:', e);
        }
    }

    if (footerPlaceholder) {
        try {
            const res = await fetch('/layout/footer.html');
            if (res.ok) {
                footerPlaceholder.innerHTML = await res.text();
            }
        } catch (e) {
            console.error('Error loading footer:', e);
        }
    }

    // Now initialize the navbar logic
    initNavbar();
}
function initNavbar() {
    const token = localStorage.getItem('hotel_token');
    const userInfo = JSON.parse(localStorage.getItem('user_info'));

    const isAdmin = userInfo && userInfo.role === 'admin';
    const isCustomer = userInfo && userInfo.role === 'customer';

    const navbarHTML = `
    <nav class="navbar navbar-expand-md navbar-custom">
        <div class="container-fluid px-3">
            <div class="d-flex align-items-center gap-2">
                <a href="/" class="navbar-brand-text text-decoration-none">
                    <i class="bi bi-building me-1" style="color: var(--gold);"></i>Lumière
                </a>
                ${isAdmin ? `<span class="admin-badge"><i class="bi bi-shield-check me-1"></i>Admin</span>` : ''}
            </div>

            <button class="navbar-toggler border-0 shadow-none" type="button"
                data-bs-toggle="collapse"
                data-bs-target="#navbarLinks"
                aria-controls="navbarLinks"
                aria-expanded="false"
                aria-label="Toggle navigation"
                style="padding: 4px 8px;">
                <i class="bi bi-list" style="color: var(--gold); font-size: 1.5rem;"></i>
            </button>

            <div class="collapse navbar-collapse justify-content-end" id="navbarLinks">
                <div class="d-flex flex-column flex-md-row align-items-start align-items-md-center gap-1 py-2 py-md-0"
                    id="nav-links-container">
                    <a href="/" class="nav-link"><i class="bi bi-house me-1"></i>Home</a>

                    ${!token ? `
                    <a href="/login" class="nav-link" id="loginLink">
                        <i class="bi bi-person me-1"></i>Login
                    </a>
                    <a href="/register" class="nav-link" id="registerLink">
                        <i class="bi bi-person-plus me-1"></i>Register
                    </a>` : ''}

                    ${isAdmin ? `
                    <a href="/admin" class="nav-link" style="color: var(--gold) !important; font-weight: 600;">
                        <i class="bi bi-speedometer2 me-1"></i>Admin Dashboard
                    </a>` : ''}

                    ${isCustomer ? `
                    <a href="/my-bookings" class="nav-link">
                        <i class="bi bi-calendar2-check me-1"></i>My Bookings
                    </a>` : ''}

                    ${token ? `
                    <a href="#" id="logoutBtn" class="nav-link nav-link-danger">
                        <i class="bi bi-box-arrow-right me-1"></i>Logout
                    </a>` : ''}
                </div>
            </div>
        </div>
    </nav>`;

    const footerHTML = `
    <footer>
        <div class="footer-brand mb-1"><i class="bi bi-building me-2"></i>Lumière Hotel</div>
        <p class="mb-0" style="font-size:0.82rem;">
            contact@lumierehotel.com &nbsp;|&nbsp; +94 77 123 4567 &nbsp;|&nbsp;
            123 Ocean Drive, Colombo &copy; 2026
        </p>
    </footer>`;

    const headerEl = document.getElementById('header-placeholder');
    if (headerEl) headerEl.innerHTML = navbarHTML;

    const footerEl = document.getElementById('footer-placeholder');
    if (footerEl) footerEl.innerHTML = footerHTML;

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('hotel_token');
            localStorage.removeItem('user_info');
            window.location.href = '/';
        });
    }
}

(function injectNavbarStyles() {
    if (document.getElementById('navbar-injected-styles')) return;
    const style = document.createElement('style');
    style.id = 'navbar-injected-styles';
    style.textContent = `
        .navbar-custom {
            background: rgba(13, 27, 42, 0.97);
            backdrop-filter: blur(12px);
            border-bottom: 1px solid rgba(201, 168, 76, 0.2);
            position: sticky;
            top: 0;
            z-index: 999;
        }
        .navbar-brand-text {
            font-family: 'Playfair Display', serif;
            font-size: 1.4rem;
            color: var(--gold);
            letter-spacing: 1px;
        }
        .navbar-custom .nav-link {
            color: #cdd9e8 !important;
            font-size: 0.875rem;
            font-weight: 500;
            padding: 0.5rem 0.85rem;
            border-radius: 6px;
            transition: color 0.2s, background 0.2s;
        }
        .navbar-custom .nav-link:hover {
            color: var(--gold) !important;
            background: rgba(201, 168, 76, 0.08);
        }
        .nav-link-danger { color: #ff7373 !important; }
        .nav-link-danger:hover {
            color: #ff4c4c !important;
            background: rgba(255, 76, 76, 0.08) !important;
        }
        .admin-badge {
            background: rgba(201, 168, 76, 0.15);
            color: var(--gold);
            font-size: 0.68rem;
            font-weight: 600;
            letter-spacing: 1px;
            text-transform: uppercase;
            padding: 3px 10px;
            border-radius: 4px;
        }
        @media (max-width: 767px) {
            #navbarLinks {
                border-top: 1px solid rgba(201, 168, 76, 0.15);
                margin-top: 8px;
                padding-top: 4px;
            }
            .navbar-custom .nav-link {
                padding: 0.6rem 0.5rem;
                width: 100%;
            }
        }
        footer {
            background: var(--navy, #0d1b2a);
            color: #8a9ab0;
            text-align: center;
            padding: 2rem;
            font-size: 0.85rem;
            margin-top: 1rem;
        }
        footer .footer-brand {
            font-family: 'Playfair Display', serif;
            color: var(--gold, #c9a84c);
            font-size: 1.2rem;
        }
    `;
    document.head.appendChild(style);
})();

document.addEventListener("DOMContentLoaded", initNavbar);

document.addEventListener("DOMContentLoaded", () => {
    loadLayout();
});