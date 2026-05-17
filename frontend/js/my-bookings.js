const token = localStorage.getItem('hotel_token');
const userInfo = JSON.parse(localStorage.getItem('user_info'));

if (!token || !userInfo) {
    Swal.fire({ icon: 'warning', title: 'Login Required', text: 'Please login to view your bookings.' })
        .then(() => window.location.href = "/login");
}

let bsReviewModal;
document.addEventListener('DOMContentLoaded', () => {
    bsReviewModal = new bootstrap.Modal(document.getElementById('reviewModal'));
});

async function loadMyBookings() {
    const container = document.getElementById('myBookingsContainer');
    try {
        const res = await fetch('/api/bookings/my', { headers: { 'Authorization': `Bearer ${token}` } });
        if (!res.ok) { container.innerHTML = `<div class="empty-state"><i class="bi bi-exclamation-circle"></i><p class="text-danger">Failed to load bookings.</p></div>`; return; }
        const bookings = await res.json();
        container.innerHTML = '';

        if (bookings.length === 0) {
            container.innerHTML = `<div class="empty-state"><i class="bi bi-calendar-x"></i><p>You have no bookings yet.</p><a href="/" class="btn btn-gold mt-2"><i class="bi bi-search me-2"></i>Browse Rooms</a></div>`;
            return;
        }

        bookings.forEach((b, i) => {
            const checkIn = new Date(b.check_in_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
            const checkOut = new Date(b.check_out_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
            const statusClass = `status-${b.status.replace(/\s+/g, '-')}`;

            let actionBtn = '';
            if (b.status !== 'Cancelled' && b.status !== 'Checked-in' && b.status !== 'Checked-out') {
                actionBtn = `<button onclick="cancelBooking('${b._id}')" class="btn-cancel"><i class="bi bi-x-circle me-1"></i>Cancel</button>`;
            } else if (b.status === 'Checked-out') {
                actionBtn = `<button onclick="openReviewModal('${b.room._id}')" class="btn-gold"><i class="bi bi-star me-1"></i>Review</button>`;
            } else if (b.status === 'Cancelled') {
                actionBtn = `<span class="text-muted small">Cancelled</span>`;
            } else { actionBtn = `<span class="text-muted small">—</span>`; }

            container.innerHTML += `
            <div class="booking-card" style="animation: fadeUp 0.4s ${i * 0.06}s ease both;">
                <div class="d-flex gap-3 align-items-start flex-wrap">
                    <img src="${b.room.image_url}" alt="Room" class="room-thumb">
                    <div class="flex-fill">
                        <div class="d-flex justify-content-between align-items-start flex-wrap gap-2">
                            <div>
                                <h6 class="mb-1 fw-bold">Room ${b.room.room_number} <span class="text-muted fw-normal">(${b.room.type})</span></h6>
                                <span class="status-badge ${statusClass}">${b.status}</span>
                            </div>
                            <div class="price-tag text-end">LKR ${b.total_price.toLocaleString()}<br><small>total</small></div>
                        </div>
                        <div class="d-flex gap-2 mt-2 flex-wrap">
                            <span class="info-pill"><i class="bi bi-calendar-check"></i> ${checkIn}</span>
                            <span class="info-pill"><i class="bi bi-calendar-x"></i> ${checkOut}</span>
                            <span class="info-pill"><i class="bi bi-tag"></i> LKR ${b.room.price}/night</span>
                        </div>
                    </div>
                    <div class="d-flex align-items-center">${actionBtn}</div>
                </div>
            </div>`;
        });
    } catch (err) {
        container.innerHTML = `<div class="empty-state"><i class="bi bi-wifi-off"></i><p class="text-danger">Server error. Please try again.</p></div>`;
    }
}

window.cancelBooking = async function (id) {
    const conf = await Swal.fire({ title: 'Cancel Booking?', text: 'Are you sure?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33', confirmButtonText: 'Yes, cancel' });
    if (conf.isConfirmed) {
        const res = await fetch(`/api/bookings/${id}/cancel`, { method: 'PUT', headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) { Swal.fire('Cancelled!', 'Booking cancelled.', 'success'); loadMyBookings(); }
        else { const d = await res.json(); Swal.fire('Error', d.message || 'Failed', 'error'); }
    }
};

window.openReviewModal = function (roomId) {
    document.getElementById('review_room_id').value = roomId;
    document.getElementById('reviewForm').reset();
    document.getElementById('review_room_id').value = roomId;
    bsReviewModal.show();
};

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('reviewForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = e.target.querySelector('button[type="submit"]');
        btn.disabled = true; btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Submitting...';
        const res = await fetch('/api/reviews', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ room_id: document.getElementById('review_room_id').value, rating: document.getElementById('review_rating').value, comment: document.getElementById('review_comment').value }) });
        const data = await res.json();
        if (res.ok) { Swal.fire('Success', 'Review submitted!', 'success'); bsReviewModal.hide(); }
        else { Swal.fire('Error', data.message, 'error'); }
        btn.disabled = false; btn.innerHTML = '<i class="bi bi-send me-2"></i>Submit Review';
    });

    if (token) loadMyBookings();
});
