// Login welada kiyala balala Navbar eka update karanawa
document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem('hotel_token');
    const logoutBtn = document.getElementById('logoutBtn');
    const loginLink = document.querySelector('a[href="/login"]');
    const registerLink = document.querySelector('a[href="/register"]');

    if (token && logoutBtn) {
        if (loginLink) loginLink.style.display = 'none';
        if (registerLink) registerLink.style.display = 'none';
        logoutBtn.style.display = 'inline';

        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('hotel_token');
            localStorage.removeItem('user_info');
            window.location.reload();
        });
        const userInfo = JSON.parse(localStorage.getItem('user_info'));
        const navbar = document.querySelector('.navbar');
        
        if (userInfo && userInfo.role === 'admin') {
            const adminLink = document.createElement('a');
            adminLink.href = "/admin";
            adminLink.innerText = "Admin Dashboard";
            adminLink.style.backgroundColor = "#28a745"; 
            navbar.insertBefore(adminLink, logoutBtn); 
        } else if (userInfo && userInfo.role === 'customer') {
            const myBookingsLink = document.createElement('a');
            myBookingsLink.href = "/my-bookings";
            myBookingsLink.innerText = "My Bookings";
            navbar.insertBefore(myBookingsLink, logoutBtn);
        }
    }
    // User admin nam navbar ekata Admin link ekak add karanawa

});