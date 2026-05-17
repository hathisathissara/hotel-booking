/* ── Rooms Loader ── */
const roomsContainer = document.getElementById('roomsContainer');
const bsBookingModal = new bootstrap.Modal(document.getElementById('bookingModal'));
const bsReviewsModal = new bootstrap.Modal(document.getElementById('reviewsModal'));

async function fetchRooms(checkIn='', checkOut='', type='', maxPrice='') {
    roomsContainer.innerHTML = `<div class="col-12 text-center py-5"><div class="spinner-border text-warning"></div></div>`;
    try {
        let url = '/api/rooms';
        let params = new URLSearchParams();
        if (checkIn && checkOut) { params.append('check_in', checkIn); params.append('check_out', checkOut); }
        if (type) params.append('type', type);
        if (maxPrice) params.append('maxPrice', maxPrice);
        if (params.toString()) url = `/api/rooms/available?${params.toString()}`;

        const res = await fetch(url);
        const rooms = await res.json();
        roomsContainer.innerHTML = '';

        if (rooms.length === 0) {
            roomsContainer.innerHTML = `<div class="col-12 text-center py-5"><i class="bi bi-inbox" style="font-size:3rem;color:#ccc;"></i><p class="mt-3 text-muted">No rooms available for your criteria.</p></div>`;
            return;
        }

        rooms.forEach((room, i) => {
            roomsContainer.innerHTML += `
            <div class="col-lg-4 col-md-6" style="animation: fadeUp 0.4s ${i*0.07}s ease both;">
                <div class="room-card">
                    <img src="${room.image_url}" alt="${room.type}" loading="lazy">
                    <div class="room-card-body">
                        <span class="room-badge">${room.type}</span>
                        <h5>Room No. ${room.room_number}</h5>
                        <p>${room.description}</p>
                        <div class="d-flex justify-content-between align-items-center mt-auto">
                            <div class="room-price">LKR ${room.price.toLocaleString()} <span>/ night</span></div>
                        </div>
                        <div class="d-flex gap-2 mt-3">
                            ${room.status === 'Maintenance' ?
                            `<button class="btn btn-secondary flex-fill" disabled>
                                <i class="bi bi-tools me-1"></i>Maintenance
                            </button>` :
                            `<button class="btn btn-gold flex-fill" onclick="bookRoom('${room._id}')">
                                <i class="bi bi-calendar-plus me-1"></i>Book
                            </button>`}
                            <button class="btn btn-teal flex-fill" onclick="viewReviews('${room._id}')">
                                <i class="bi bi-star me-1"></i>Reviews
                            </button>
                        </div>
                    </div>
                </div>
            </div>`;
        });
    } catch {
        roomsContainer.innerHTML = `<div class="col-12 text-center py-5 text-danger"><i class="bi bi-wifi-off" style="font-size:2rem;"></i><p class="mt-2">Failed to load rooms.</p></div>`;
    }
}

function bookRoom(roomId) {
    const token = localStorage.getItem('hotel_token');
    if (!token) {
        Swal.fire({ icon:'warning', title:'Login Required', text:'Please login to book a room!', showCancelButton:true, confirmButtonText:'Go to Login', confirmButtonColor:'#c9a84c' })
            .then(r => { if (r.isConfirmed) window.location.href="/login"; });
        return;
    }
    document.getElementById('modal_room_id').value = roomId;
    document.getElementById('bookingMessage').innerHTML = '';
    document.getElementById('bookingForm').reset();
    document.getElementById('modal_room_id').value = roomId;
    bsBookingModal.show();
}

window.viewReviews = async function(roomId) {
    bsReviewsModal.show();
    const reviewsList = document.getElementById('reviewsList');
    reviewsList.innerHTML = '<p class="text-muted">Loading...</p>';
    try {
        const res = await fetch(`/api/reviews/${roomId}`);
        const reviews = await res.json();
        if (reviews.length === 0) { reviewsList.innerHTML = '<p class="text-muted">No reviews yet.</p>'; return; }
        reviewsList.innerHTML = reviews.map(r => `
            <div class="border-bottom pb-3 mb-3">
                <div class="d-flex justify-content-between align-items-center">
                    <strong>${r.user.full_name}</strong>
                    <span style="color:var(--gold);">${'⭐'.repeat(r.rating)}</span>
                </div>
                <p class="mb-1 mt-1 small">"${r.comment}"</p>
                <small class="text-muted">${new Date(r.createdAt).toLocaleDateString()}</small>
            </div>`).join('');
    } catch { reviewsList.innerHTML = '<p class="text-danger">Failed to load reviews.</p>'; }
};

document.getElementById('bookingForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = e.target.querySelector('button[type="submit"]');
    submitBtn.disabled = true; submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Confirming...';
    const token = localStorage.getItem('hotel_token');
    try {
        const res = await fetch('/api/bookings', {
            method:'POST',
            headers:{'Content-Type':'application/json','Authorization':`Bearer ${token}`},
            body: JSON.stringify({ room_id: document.getElementById('modal_room_id').value, check_in_date: document.getElementById('check_in').value, check_out_date: document.getElementById('check_out').value })
        });
        const data = await res.json();
        if (res.ok) {
            Swal.fire({icon:'success',title:'Booked!',text:data.message,timer:2000,showConfirmButton:false});
            bsBookingModal.hide();
            e.target.reset();
        } else { Swal.fire({icon:'error',title:'Failed',text:data.message}); }
    } catch { Swal.fire({icon:'error',title:'Error',text:'Server connection failed!'}); }
    finally { submitBtn.disabled=false; submitBtn.innerHTML='<i class="bi bi-check2-circle me-2"></i>Confirm Booking'; }
});

document.getElementById('searchForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const checkIn = document.getElementById('search_check_in').value;
    const checkOut = document.getElementById('search_check_out').value;
    const type = document.getElementById('search_room_type').value;
    const maxPrice = document.getElementById('search_max_price').value;
    if ((checkIn || checkOut) && (!checkIn || !checkOut)) {
        Swal.fire({icon:'error',title:'Invalid Dates',text:'Please select both Check-in and Check-out dates.'});
        return;
    }
    if (checkIn && checkOut && new Date(checkIn) >= new Date(checkOut)) {
        Swal.fire({icon:'error',title:'Invalid Dates',text:'Check-out must be after Check-in.'});
        return;
    }
    fetchRooms(checkIn, checkOut, type, maxPrice);
});

fetchRooms();