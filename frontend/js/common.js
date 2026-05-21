/* ══════════════════════════════════════════════
   COMMON — Navbar, Footer & Global Styles
   Lumière Hotel
══════════════════════════════════════════════ */

function initNavbar() {
    const token    = localStorage.getItem('hotel_token');
    const userInfo = JSON.parse(localStorage.getItem('user_info') || 'null');
    const isAdmin  = userInfo?.role === 'admin';
    const isCustomer = userInfo?.role === 'customer';

    /* ── Navbar HTML ── */
    const navbarHTML = `
    <nav class="navbar navbar-expand-md navbar-custom" id="mainNavbar">
        <div class="container-fluid px-4">

            <!-- Brand -->
            <a href="/" class="navbar-brand-text text-decoration-none d-flex align-items-center gap-2">
                <span class="brand-icon"><i class="bi bi-building"></i></span>
                <span>Lumière</span>
            </a>

            ${isAdmin ? `<span class="admin-badge ms-2"><i class="bi bi-shield-check me-1"></i>Admin</span>` : ''}

            <!-- Mobile toggle -->
            <button class="navbar-toggler border-0 shadow-none ms-auto" type="button"
                data-bs-toggle="collapse" data-bs-target="#navbarLinks"
                aria-controls="navbarLinks" aria-expanded="false" aria-label="Toggle navigation">
                <i class="bi bi-list" style="color:var(--gold);font-size:1.6rem;"></i>
            </button>

            <!-- Nav Links -->
            <div class="collapse navbar-collapse justify-content-end" id="navbarLinks">
                <div class="d-flex flex-column flex-md-row align-items-start align-items-md-center gap-1 py-2 py-md-0">
                    <a href="/" class="nav-link"><i class="bi bi-house me-1"></i>Home</a>

                    ${!token ? `
                    <a href="/login" class="nav-link"><i class="bi bi-person me-1"></i>Login</a>
                    <a href="/register" class="nav-link nav-link-highlight"><i class="bi bi-person-plus me-1"></i>Register</a>
                    ` : ''}

                    ${isAdmin ? `
                    <a href="/admin" class="nav-link nav-link-gold">
                        <i class="bi bi-speedometer2 me-1"></i>Dashboard
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

    /* ── Premium Footer HTML ── */
    const footerHTML = `
    <footer class="site-footer">
        <!-- Gold top border -->
        <div class="footer-topline"></div>

        <div class="footer-main">
            <div class="container">
                <div class="row g-5">

                    <!-- Brand column -->
                    <div class="col-lg-4 col-md-12">
                        <div class="footer-brand-wrap">
                            <div class="footer-logo">
                                <span class="footer-logo-icon"><i class="bi bi-building"></i></span>
                                <span class="footer-logo-text">Lumière</span>
                            </div>
                            <p class="footer-tagline">
                                Sri Lanka's premier ocean-front luxury hotel. Where every moment is crafted to perfection.
                            </p>
                            <!-- Social icons -->
                            <div class="footer-socials">
                                <a href="#" class="social-btn" aria-label="Facebook"><i class="bi bi-facebook"></i></a>
                                <a href="#" class="social-btn" aria-label="Instagram"><i class="bi bi-instagram"></i></a>
                                <a href="#" class="social-btn" aria-label="Twitter"><i class="bi bi-twitter-x"></i></a>
                                <a href="#" class="social-btn" aria-label="TripAdvisor"><i class="bi bi-globe"></i></a>
                            </div>
                        </div>
                    </div>

                    <!-- Quick Links -->
                    <div class="col-lg-2 col-md-4 col-6">
                        <h6 class="footer-col-title">Quick Links</h6>
                        <ul class="footer-links">
                            <li><a href="/">Home</a></li>
                            <li><a href="/#rooms">Rooms</a></li>
                            <li><a href="/login">Sign In</a></li>
                            <li><a href="/register">Register</a></li>
                            <li><a href="/my-bookings">My Bookings</a></li>
                        </ul>
                    </div>

                    <!-- Services -->
                    <div class="col-lg-2 col-md-4 col-6">
                        <h6 class="footer-col-title">Services</h6>
                        <ul class="footer-links">
                            <li><a href="#">Room Service</a></li>
                            <li><a href="#">Spa &amp; Wellness</a></li>
                            <li><a href="#">Fine Dining</a></li>
                            <li><a href="#">Infinity Pool</a></li>
                            <li><a href="#">Valet Parking</a></li>
                        </ul>
                    </div>

                    <!-- Contact -->
                    <div class="col-lg-4 col-md-4">
                        <h6 class="footer-col-title">Contact Us</h6>
                        <ul class="footer-contact">
                            <li>
                                <i class="bi bi-geo-alt"></i>
                                <span>123 Ocean Drive, Colombo 03,<br>Sri Lanka</span>
                            </li>
                            <li>
                                <i class="bi bi-telephone"></i>
                                <a href="tel:+94701207991">+94 70 120 7991</a>
                            </li>
                            <li>
                                <i class="bi bi-envelope"></i>
                                <a href="mailto:contact@lumierehotel.com">contact@lumierehotel.com</a>
                            </li>
                            <li>
                                <i class="bi bi-clock"></i>
                                <span>Check-in: 2:00 PM · Check-out: 12:00 PM</span>
                            </li>
                        </ul>
                    </div>

                </div>
            </div>
        </div>

        <!-- Footer bottom bar -->
        <div class="footer-bottom">
            <div class="container">
                <div class="d-flex flex-wrap justify-content-between align-items-center gap-2">
                    <p class="mb-0" style="font-size:0.78rem;color:#4a5a70;">
                        &copy; 2026 Lumière Hotel. All rights reserved.
                    </p>
                    <div class="d-flex gap-3">
                        <a href="#" style="font-size:0.75rem;color:#4a5a70;text-decoration:none;">Privacy Policy</a>
                        <a href="#" style="font-size:0.75rem;color:#4a5a70;text-decoration:none;">Terms of Service</a>
                    </div>
                </div>
            </div>
        </div>
    </footer>`;

    /* ── Inject into DOM ── */
    const headerEl = document.getElementById('header-placeholder');
    if (headerEl) headerEl.innerHTML = navbarHTML;

    const footerEl = document.getElementById('footer-placeholder');
    if (footerEl) footerEl.innerHTML = footerHTML;

    /* ── Logout handler ── */
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('hotel_token');
            localStorage.removeItem('user_info');
            window.location.href = '/';
        });
    }

    /* ── Navbar scroll-shrink ── */
    const nav = document.getElementById('mainNavbar');
    if (nav) {
        window.addEventListener('scroll', () => {
            nav.classList.toggle('navbar-shrunk', window.scrollY > 60);
        }, { passive: true });
    }
}

/* ══════════════════════════════════════════════
   INJECTED STYLES — Navbar & Footer
══════════════════════════════════════════════ */
(function injectGlobalStyles() {
    if (document.getElementById('lumiere-global-styles')) return;
    const style = document.createElement('style');
    style.id = 'lumiere-global-styles';
    style.textContent = `
        /* ── Navbar ── */
        .navbar-custom {
            background: rgba(8, 15, 26, 0.96);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border-bottom: 1px solid rgba(201, 168, 76, 0.18);
            position: sticky;
            top: 0;
            z-index: 1000;
            padding: 0.9rem 0;
            transition: padding 0.3s ease, box-shadow 0.3s ease;
        }
        .navbar-custom.navbar-shrunk {
            padding: 0.5rem 0;
            box-shadow: 0 8px 32px rgba(0,0,0,0.35);
        }

        .navbar-brand-text {
            font-family: 'Playfair Display', serif;
            font-size: 1.5rem;
            color: var(--gold, #c9a84c) !important;
            letter-spacing: 1px;
            font-weight: 600;
        }
        .brand-icon {
            width: 34px; height: 34px;
            background: rgba(201,168,76,0.15);
            border: 1px solid rgba(201,168,76,0.3);
            border-radius: 9px;
            display: flex; align-items: center; justify-content: center;
            font-size: 0.95rem;
            color: var(--gold, #c9a84c);
            flex-shrink: 0;
        }

        .navbar-custom .nav-link {
            color: rgba(205, 217, 232, 0.9) !important;
            font-size: 0.84rem;
            font-weight: 500;
            padding: 0.48rem 0.9rem !important;
            border-radius: 8px;
            transition: color 0.2s, background 0.2s;
            letter-spacing: 0.2px;
        }
        .navbar-custom .nav-link:hover {
            color: var(--gold, #c9a84c) !important;
            background: rgba(201, 168, 76, 0.08);
        }
        .nav-link-gold {
            color: var(--gold, #c9a84c) !important;
            font-weight: 600 !important;
        }
        .nav-link-highlight {
            background: rgba(201,168,76,0.1) !important;
            border: 1px solid rgba(201,168,76,0.25) !important;
        }
        .nav-link-danger { color: #ff7878 !important; }
        .nav-link-danger:hover {
            color: #ff4c4c !important;
            background: rgba(255, 76, 76, 0.08) !important;
        }

        .admin-badge {
            background: rgba(201,168,76,0.15);
            border: 1px solid rgba(201,168,76,0.3);
            color: var(--gold, #c9a84c);
            font-size: 0.62rem;
            font-weight: 700;
            letter-spacing: 1.5px;
            text-transform: uppercase;
            padding: 4px 12px;
            border-radius: 6px;
        }

        @media (max-width: 767px) {
            #navbarLinks {
                border-top: 1px solid rgba(201,168,76,0.12);
                margin-top: 10px;
                padding-top: 6px;
            }
            .navbar-custom .nav-link {
                padding: 0.6rem 0.5rem !important;
                width: 100%;
                border-radius: 8px;
            }
        }

        /* ── Footer ── */
        .site-footer {
            background: #060d18;
            color: #7a8da0;
            margin-top: 0;
        }

        .footer-topline {
            height: 1px;
            background: linear-gradient(90deg, transparent 0%, rgba(201,168,76,0.6) 30%, rgba(232,201,126,0.8) 50%, rgba(201,168,76,0.6) 70%, transparent 100%);
        }

        .footer-main {
            padding: 4.5rem 0 3rem;
        }

        .footer-logo {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 1.1rem;
        }
        .footer-logo-icon {
            width: 40px; height: 40px;
            background: rgba(201,168,76,0.12);
            border: 1px solid rgba(201,168,76,0.25);
            border-radius: 10px;
            display: flex; align-items: center; justify-content: center;
            font-size: 1.05rem;
            color: var(--gold, #c9a84c);
        }
        .footer-logo-text {
            font-family: 'Playfair Display', serif;
            font-size: 1.5rem;
            color: var(--gold, #c9a84c);
            font-weight: 600;
        }
        .footer-tagline {
            font-size: 0.84rem;
            color: #5a6e84;
            line-height: 1.7;
            margin-bottom: 1.4rem;
            max-width: 300px;
        }

        .footer-socials {
            display: flex;
            gap: 10px;
        }
        .social-btn {
            width: 36px; height: 36px;
            background: rgba(201,168,76,0.08);
            border: 1px solid rgba(201,168,76,0.18);
            border-radius: 9px;
            display: flex; align-items: center; justify-content: center;
            color: #5a6e84;
            font-size: 0.9rem;
            text-decoration: none;
            transition: all 0.25s ease;
        }
        .social-btn:hover {
            background: rgba(201,168,76,0.18);
            border-color: rgba(201,168,76,0.45);
            color: var(--gold, #c9a84c);
            transform: translateY(-2px);
        }

        .footer-col-title {
            font-family: 'Playfair Display', serif;
            font-size: 0.95rem;
            color: rgba(255,255,255,0.85);
            font-weight: 600;
            margin-bottom: 1.2rem;
            position: relative;
            padding-bottom: 0.7rem;
        }
        .footer-col-title::after {
            content: '';
            position: absolute;
            bottom: 0; left: 0;
            width: 28px; height: 1.5px;
            background: var(--gold, #c9a84c);
            border-radius: 2px;
        }

        .footer-links {
            list-style: none;
            padding: 0; margin: 0;
            display: flex;
            flex-direction: column;
            gap: 0.55rem;
        }
        .footer-links li a {
            color: #5a6e84;
            text-decoration: none;
            font-size: 0.84rem;
            transition: color 0.2s, padding-left 0.2s;
            display: inline-block;
        }
        .footer-links li a:hover {
            color: var(--gold, #c9a84c);
            padding-left: 4px;
        }

        .footer-contact {
            list-style: none;
            padding: 0; margin: 0;
            display: flex;
            flex-direction: column;
            gap: 0.8rem;
        }
        .footer-contact li {
            display: flex;
            align-items: flex-start;
            gap: 10px;
            font-size: 0.83rem;
            color: #5a6e84;
            line-height: 1.5;
        }
        .footer-contact li i {
            color: var(--gold, #c9a84c);
            font-size: 0.95rem;
            margin-top: 2px;
            flex-shrink: 0;
        }
        .footer-contact li a {
            color: #5a6e84;
            text-decoration: none;
            transition: color 0.2s;
        }
        .footer-contact li a:hover { color: var(--gold, #c9a84c); }

        .footer-bottom {
            border-top: 1px solid rgba(255,255,255,0.05);
            padding: 1.2rem 0;
        }
    `;
    document.head.appendChild(style);
})();

/* ── Async layout stub (kept for backward compat) ── */
async function loadLayout() {}

/* ── Init on DOM ready ── */
document.addEventListener('DOMContentLoaded', initNavbar);
document.addEventListener('DOMContentLoaded', loadLayout);