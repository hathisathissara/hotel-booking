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
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: red;">Failed to load bookings.</td></tr>';
            return;
        }

        const bookings = await res.json();
        tbody.innerHTML = '';

        if (bookings.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">You have no bookings yet. <a href="/">Book a room</a></td></tr>';
            return;
        }

        bookings.forEach(b => {
            const checkIn = new Date(b.check_in_date).toLocaleDateString();
            const checkOut = new Date(b.check_out_date).toLocaleDateString();
            
            // Status Badge Colors
            let statusColor = b.status === 'Pending' ? 'orange' : (b.status === 'Confirmed' ? 'green' : (b.status === 'Cancelled' ? 'red' : 'blue'));

            let actionBtn = '';
            if (b.status !== 'Cancelled' && b.status !== 'Checked-in' && b.status !== 'Checked-out') {
                actionBtn = `<button onclick="cancelBooking('${b._id}')" style="background: #ff4c4c; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">Cancel</button>`;
            } else if (b.status === 'Cancelled') {
                actionBtn = '<span style="color: gray; font-size: 12px;">Cancelled</span>';
            } else if (b.status === 'Checked-out') {
                actionBtn = `<button onclick="openReviewModal('${b.room._id}')" style="background: #28a745; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">Review</button>`;
            } else {
                actionBtn = '-';
            }

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
                    <td>${actionBtn}</td>
                </tr>
            `;
        });
    } catch (error) {
        console.error("Error loading my bookings:", error);
        document.getElementById('myBookingsTableBody').innerHTML = '<tr><td colspan="6" style="text-align: center; color: red;">Server error occurred.</td></tr>';
    }
}

// Initial Load
if (token) {
    loadMyBookings();
}

window.cancelBooking = async function(bookingId) {
    const confirm = await Swal.fire({
        title: 'Cancel Booking?',
        text: "Are you sure you want to cancel this booking?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, cancel it!'
    });

    if (confirm.isConfirmed) {
        try {
            const res = await fetch(`/api/bookings/${bookingId}/cancel`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                Swal.fire('Cancelled!', 'Your booking has been cancelled.', 'success');
                loadMyBookings();
            } else {
                const data = await res.json();
                Swal.fire('Error', data.message || 'Failed to cancel', 'error');
            }
        } catch (err) {
            Swal.fire('Error', 'Something went wrong', 'error');
        }
    }
};

const reviewModal = document.getElementById('reviewModal');
const closeReviewModal = document.getElementById('closeReviewModal');
const reviewForm = document.getElementById('reviewForm');

window.openReviewModal = function(roomId) {
    document.getElementById('review_room_id').value = roomId;
    reviewModal.style.display = 'flex';
};

closeReviewModal.addEventListener('click', () => {
    reviewModal.style.display = 'none';
});

window.addEventListener('click', (event) => {
    if (event.target === reviewModal) {
        reviewModal.style.display = 'none';
    }
});

reviewForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const roomId = document.getElementById('review_room_id').value;
    const rating = document.getElementById('review_rating').value;
    const comment = document.getElementById('review_comment').value;

    try {
        const res = await fetch('/api/reviews', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({ room_id: roomId, rating, comment })
        });
        const data = await res.json();
        
        if (res.ok) {
            Swal.fire('Success', 'Review added successfully', 'success');
            reviewModal.style.display = 'none';
            reviewForm.reset();
        } else {
            Swal.fire('Error', data.message, 'error');
        }
    } catch (err) {
        Swal.fire('Error', 'Something went wrong', 'error');
    }
});
