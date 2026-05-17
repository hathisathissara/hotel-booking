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
    const logoutBtn = document.getElementById('logoutBtn');
    const loginLink = document.querySelector('#loginLink');
    const registerLink = document.querySelector('#registerLink');
    const adminBadge = document.getElementById('adminBadge');
    
    const userInfo = JSON.parse(localStorage.getItem('user_info'));

    // Show admin badge on header if admin is logged in
    if (userInfo && userInfo.role === 'admin' && adminBadge) {
        adminBadge.style.display = 'inline-block';
    }

    if (token && logoutBtn) {
        if (loginLink) loginLink.style.display = 'none';
        if (registerLink) registerLink.style.display = 'none';
        logoutBtn.style.display = 'inline';

        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('hotel_token');
            localStorage.removeItem('user_info');
            window.location.href = '/';
        });
        
        if (userInfo && userInfo.role === 'admin') {
            const adminLink = document.createElement('a');
            adminLink.href = "/admin";
            adminLink.innerHTML = '<i class="bi bi-speedometer2 me-1"></i>Admin Dashboard';
            adminLink.className = "nav-link";
            adminLink.style.color = "var(--gold)"; 
            logoutBtn.parentNode.insertBefore(adminLink, logoutBtn); 
        } else if (userInfo && userInfo.role === 'customer') {
            const myBookingsLink = document.createElement('a');
            myBookingsLink.href = "/my-bookings";
            myBookingsLink.innerHTML = '<i class="bi bi-calendar2-check me-1"></i>My Bookings';
            myBookingsLink.className = "nav-link";
            logoutBtn.parentNode.insertBefore(myBookingsLink, logoutBtn);
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    loadLayout();
});