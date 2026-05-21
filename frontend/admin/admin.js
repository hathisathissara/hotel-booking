const token = localStorage.getItem('hotel_token');
const userInfo = JSON.parse(localStorage.getItem('user_info'));

if (!token || !userInfo || userInfo.role !== 'admin') {
    Swal.fire({ 
        icon: 'error', 
        title: 'Access Denied', 
        text: 'You are not authorized to view the admin panel.' 
    }).then(() => {
        window.location.href = "/login";
    });
}

document.addEventListener('DOMContentLoaded', () => {
    // Render Date
    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('currentDateString').innerText = new Date().toLocaleDateString('en-US', dateOptions);

    // Render Admin details
    if (userInfo) {
        document.getElementById('adminNameDisplay').innerText = userInfo.full_name || 'Admin Manager';
        if (userInfo.full_name) {
            document.getElementById('avatarLetter').innerText = userInfo.full_name.charAt(0).toUpperCase();
        }
    }

    // Load Stats
    loadDashboardStats();

    // Logout Handler
    document.getElementById('logoutBtn').addEventListener('click', (e) => {
        e.preventDefault();
        Swal.fire({
            title: 'Are you sure?',
            text: "Do you want to log out of the admin panel?",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#c9a84c',
            cancelButtonColor: '#ef4444',
            confirmButtonText: 'Yes, Logout'
        }).then((result) => {
            if (result.isConfirmed) {
                localStorage.removeItem('hotel_token');
                localStorage.removeItem('user_info');
                window.location.href = '/login';
            }
        });
    });
});

/* ── Stats Loading & Charts ── */
async function loadDashboardStats() {
    try {
        const res = await fetch('/api/admin/stats', { 
            headers: { 'Authorization': `Bearer ${token}` } 
        });
        if (!res.ok) return;
        const s = await res.json();
        
        document.getElementById('stat_arrivals').innerText = s.arrivalsToday;
        document.getElementById('stat_revenue').innerText = `LKR ${Number(s.monthlyRevenue).toLocaleString()}`;
        document.getElementById('stat_rooms').innerText = s.totalRooms;
        document.getElementById('stat_users').innerText = s.totalUsers;

        const ctx = document.getElementById('revenueChart').getContext('2d');
        new Chart(ctx, { 
            type: 'bar', 
            data: { 
                labels: ['Monthly Revenue'], 
                datasets: [{ 
                    label: 'Revenue (LKR)', 
                    data: [s.monthlyRevenue], 
                    backgroundColor: 'rgba(201, 168, 76, 0.2)', 
                    borderColor: 'rgba(201, 168, 76, 1)', 
                    borderWidth: 2, 
                    borderRadius: 8,
                    barThickness: 120
                }] 
            }, 
            options: { 
                responsive: true,
                maintainAspectRatio: false,
                scales: { 
                    y: { 
                        beginAtZero: true, 
                        grid: { color: '#f1f5f9' },
                        ticks: {
                            font: { family: 'Plus Jakarta Sans' }
                        }
                    },
                    x: {
                        ticks: {
                            font: { family: 'Plus Jakarta Sans', weight: 'bold' }
                        }
                    }
                }, 
                plugins: { 
                    legend: { display: false } 
                } 
            } 
        });
    } catch (e) { 
        console.error("Error loading dashboard statistics: ", e); 
    }
}
