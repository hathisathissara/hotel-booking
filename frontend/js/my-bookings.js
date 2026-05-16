const token = localStorage.getItem('hotel_token');
const userInfo = JSON.parse(localStorage.getItem('user_info'));

// Security Check: Must be logged in
if (!token || !userInfo) {
    Swal.fire({
        icon: 'warning',
        title: 'Login Required',
        text: 'Please login to view your bookings.'
    }).then(() => {
        window.location.href = "/login";
    });
}

// Load My Bookings
async function loadMyBookings() {
    try {
        const res = await fetch('/api/bookings/my', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const tbody = document.getElementById('myBookingsTableBody');
        
        if (!res.ok) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: red;">Failed to load bookings.</td></tr>';
            return;
        }

        const bookings = await res.json();
        tbody.innerHTML = '';

        if (bookings.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">You have no bookings yet. <a href="/">Book a room</a></td></tr>';
            return;
        }

        bookings.forEach(b => {
            const checkIn = new Date(b.check_in_date).toLocaleDateString();
            const checkOut = new Date(b.check_out_date).toLocaleDateString();
            
            // Status Badge Colors
            let statusColor = b.status === 'Pending' ? 'orange' : (b.status === 'Confirmed' ? 'green' : 'red');

            tbody.innerHTML += `
                <tr>
                    <td>
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <img src="${b.room.image_url}" alt="Room" style="width: 80px; height: 50px; object-fit: cover; border-radius: 4px;">
                            <div>
                                <strong>Room ${b.room.room_number}</strong><br>
                                <span style="font-size: 12px; color: #555;">${b.room.type} (LKR ${b.room.price}/night)</span>
                            </div>
                        </div>
                    </td>
                    <td>${checkIn}</td>
                    <td>${checkOut}</td>
                    <td><strong>LKR ${b.total_price}</strong></td>
                    <td style="color: ${statusColor}; font-weight: bold;">${b.status}</td>
                </tr>
            `;
        });
    } catch (error) {
        console.error("Error loading my bookings:", error);
        document.getElementById('myBookingsTableBody').innerHTML = '<tr><td colspan="5" style="text-align: center; color: red;">Server error occurred.</td></tr>';
    }
}

// Initial Load
if (token) {
    loadMyBookings();
}
