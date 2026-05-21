/* ══════════════════════════════════════════════
   PREMIUM ROOM LOADER — Lumière Hotel
══════════════════════════════════════════════ */
const roomsContainer = document.getElementById('roomsContainer');
const bsBookingModal = new bootstrap.Modal(document.getElementById('bookingModal'));
const bsReviewsModal = new bootstrap.Modal(document.getElementById('reviewsModal'));

/* Room type metadata for richer cards */
const ROOM_META = {
    Single:  { icon: 'bi-person',          guests: '1 Guest',   size: '28 m²', bed: 'Single Bed' },
    Double:  { icon: 'bi-people',           guests: '2 Guests',  size: '38 m²', bed: 'Queen Bed'  },
    Family:  { icon: 'bi-house-heart',      guests: '4 Guests',  size: '55 m²', bed: 'King + Bunk' },
    Suite:   { icon: 'bi-gem',              guests: '2 Guests',  size: '72 m²', bed: 'King Bed'   },
};

/* ── Render a single premium room card ── */
function buildRoomCard(room, index) {
    const meta   = ROOM_META[room.type] || { icon:'bi-door-open', guests:'—', size:'—', bed:'—' };
    const avail  = room.status !== 'Maintenance';
    const delay  = (index * 0.07).toFixed(2);

    return `
    <div class="col-xl-4 col-lg-6 col-md-6" style="animation: fadeUp 0.55s ${delay}s ease both; opacity:0;">
        <div class="room-card">

            <!-- Image -->
            <div class="room-img-wrap">
                <img src="${room.image_url || '/uploads/placeholder.jpg'}"
                     alt="${room.type} Room ${room.room_number}"
                     loading="lazy"
                     onerror="this.src='https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=600&q=80'"
                >
                <div class="room-img-overlay"></div>

                <!-- Type badge -->
                <span class="room-badge">${room.type}</span>

                <!-- Status pill -->
                <span class="room-status-ribbon ${avail ? 'room-status-available' : 'room-status-maintenance'}">
                    <i class="bi ${avail ? 'bi-check-circle' : 'bi-tools'} me-1"></i>
                    ${avail ? 'Available' : 'Maintenance'}
                </span>
            </div>

            <!-- Body -->
            <div class="room-card-body">

                <!-- Meta row -->
                <div class="room-card-meta">
                    <span class="room-meta-item">
                        <i class="bi bi-arrows-fullscreen"></i>${meta.size}
                    </span>
                    <span class="room-meta-item">
                        <i class="bi bi-person"></i>${meta.guests}
                    </span>
                    <span class="room-meta-item">
                        <i class="bi bi-moon-stars"></i>${meta.bed}
                    </span>
                </div>

                <!-- Title -->
                <h5>Room No. ${room.room_number}</h5>

                <!-- Description -->
                <p class="room-desc">${room.description || 'A beautifully appointed room with premium furnishings and modern amenities for an unforgettable stay.'}</p>

                <div class="room-card-divider"></div>

                <!-- Price row -->
                <div class="room-price-row">
                    <div class="room-price">
                        LKR ${Number(room.price).toLocaleString()}
                        <sub>/ night</sub>
                    </div>
                    <div class="room-price-note">
                        <span style="color:var(--gold);">★★★★★</span><br>
                        5-Star Rated
                    </div>
                </div>

                <!-- Actions -->
                <div class="room-actions">
                    ${avail
                        ? `<button class="btn btn-gold" onclick="bookRoom('${room._id}', 'Room No. ${room.room_number}', ${room.price})">
                               <i class="bi bi-calendar-plus me-1"></i>Book Now
                           </button>`
                        : `<button class="btn btn-navy" disabled style="flex:1;opacity:0.6;cursor:not-allowed;">
                               <i class="bi bi-tools me-1"></i>Unavailable
                           </button>`
                    }
                    <button class="btn btn-teal" onclick="viewReviews('${room._id}')">
                        <i class="bi bi-star me-1"></i>Reviews
                    </button>
                </div>

            </div>
        </div>
    </div>`;
}

/* ── Fetch and display rooms ── */
async function fetchRooms(checkIn = '', checkOut = '', type = '', maxPrice = '') {
    roomsContainer.innerHTML = `
        <div class="col-12">
            <div class="loading-state">
                <div class="luxury-spinner"></div>
                <p style="color:var(--text-muted);font-size:0.78rem;letter-spacing:3px;text-transform:uppercase;margin:0;">
                    Loading Rooms…
                </p>
            </div>
        </div>`;

    try {
        let url = '/api/rooms';
        const params = new URLSearchParams();
        if (checkIn && checkOut) { params.append('check_in', checkIn); params.append('check_out', checkOut); }
        if (type)     params.append('type', type);
        if (maxPrice) params.append('maxPrice', maxPrice);
        if (params.toString()) url = `/api/rooms/available?${params.toString()}`;

        const res   = await fetch(url);
        const rooms = await res.json();

        if (rooms.length === 0) {
            roomsContainer.innerHTML = `
                <div class="col-12">
                    <div class="empty-state">
                        <i class="bi bi-inbox"></i>
                        <p>No rooms match your criteria.<br>
                           <span style="color:var(--gold);cursor:pointer;" onclick="fetchRooms()">View all available rooms →</span>
                        </p>
                    </div>
                </div>`;
            return;
        }

        roomsContainer.innerHTML = rooms.map((room, i) => buildRoomCard(room, i)).join('');

    } catch (err) {
        roomsContainer.innerHTML = `
            <div class="col-12">
                <div class="empty-state">
                    <i class="bi bi-wifi-off"></i>
                    <p style="color:#e55;">Failed to load rooms.<br>
                       <span style="font-size:0.8rem;color:var(--text-muted);">Check your connection and try again.</span>
                    </p>
                </div>
            </div>`;
    }
}

/* ── Open booking modal with room context ── */
function bookRoom(roomId, roomName, roomPrice) {
    const token = localStorage.getItem('hotel_token');
    if (!token) {
        Swal.fire({
            icon: 'warning',
            title: 'Login Required',
            text: 'Please log in to reserve a room.',
            showCancelButton: true,
            confirmButtonText: 'Go to Login',
            confirmButtonColor: '#c9a84c',
            cancelButtonColor: '#0f1f35',
            background: '#fff',
        }).then(r => { if (r.isConfirmed) window.location.href = '/login'; });
        return;
    }

    /* Pre-fill modal room context */
    document.getElementById('modal_room_id').value  = roomId;
    document.getElementById('bookingMessage').innerHTML = '';
    document.getElementById('bookingForm').reset();
    document.getElementById('priceEstimate').style.display = 'none';

    const preview = document.getElementById('modalRoomPreview');
    if (preview) {
        preview.style.display = 'block';
        document.getElementById('modalRoomName').textContent  = roomName  || 'Selected Room';
        document.getElementById('modalRoomPrice').textContent = roomPrice
            ? `LKR ${Number(roomPrice).toLocaleString()} / night`
            : '';
    }

    bsBookingModal.show();
}
window.bookRoom = bookRoom;

/* ── Guest reviews modal ── */
window.viewReviews = async function (roomId) {
    bsReviewsModal.show();
    const list = document.getElementById('reviewsList');
    list.innerHTML = `<div class="loading-state" style="padding:2rem 0">
        <div class="luxury-spinner"></div>
    </div>`;

    try {
        const res     = await fetch(`/api/reviews/${roomId}`);
        const reviews = await res.json();

        if (reviews.length === 0) {
            list.innerHTML = `
                <div class="empty-state" style="padding:2rem 0">
                    <i class="bi bi-chat-square-text" style="font-size:2.4rem;color:var(--gold-light);opacity:0.4;"></i>
                    <p style="margin-top:0.8rem;">No reviews yet. Be the first to share your experience!</p>
                </div>`;
            return;
        }

        const stars = n => '★'.repeat(n) + '☆'.repeat(5 - n);

        list.innerHTML = reviews.map(r => `
            <div class="review-item">
                <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:4px;">
                    <span class="review-author">${r.user?.full_name || 'Guest'}</span>
                    <span class="review-stars" style="font-size:0.85rem;">${stars(r.rating)}</span>
                </div>
                <p class="review-comment">"${r.comment}"</p>
                <span class="review-date">${new Date(r.createdAt).toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' })}</span>
            </div>`).join('');

    } catch {
        list.innerHTML = `<p style="color:#e55;text-align:center;padding:1rem;">Failed to load reviews.</p>`;
    }
};

/* ── Booking form submit ── */
document.getElementById('bookingForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span>Confirming…`;

    const token = localStorage.getItem('hotel_token');
    try {
        const res = await fetch('/api/bookings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({
                room_id:        document.getElementById('modal_room_id').value,
                check_in_date:  document.getElementById('check_in').value,
                check_out_date: document.getElementById('check_out').value,
            }),
        });
        const data = await res.json();

        if (res.ok) {
            Swal.fire({
                icon: 'success',
                title: 'Booking Confirmed!',
                text: data.message,
                timer: 2800,
                showConfirmButton: false,
                background: '#fff',
                iconColor: '#c9a84c',
            });
            bsBookingModal.hide();
            e.target.reset();
        } else {
            Swal.fire({ icon: 'error', title: 'Booking Failed', text: data.message, confirmButtonColor: '#c9a84c' });
        }
    } catch {
        Swal.fire({ icon: 'error', title: 'Connection Error', text: 'Unable to reach the server. Please try again.', confirmButtonColor: '#c9a84c' });
    } finally {
        btn.disabled = false;
        btn.innerHTML = `<i class="bi bi-check2-circle me-2"></i>Confirm Booking`;
    }
});

/* ── Search form ── */
document.getElementById('searchForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const checkIn   = document.getElementById('search_check_in').value;
    const checkOut  = document.getElementById('search_check_out').value;
    const type      = document.getElementById('search_room_type').value;
    const maxPrice  = document.getElementById('search_max_price').value;

    if ((checkIn || checkOut) && (!checkIn || !checkOut)) {
        Swal.fire({ icon: 'warning', title: 'Missing Dates', text: 'Please select both check-in and check-out dates.', confirmButtonColor: '#c9a84c' });
        return;
    }
    if (checkIn && checkOut && new Date(checkIn) >= new Date(checkOut)) {
        Swal.fire({ icon: 'warning', title: 'Invalid Dates', text: 'Check-out must be after check-in.', confirmButtonColor: '#c9a84c' });
        return;
    }

    /* Sync filter chips */
    document.querySelectorAll('.filter-chip').forEach(c => {
        c.classList.toggle('active', c.dataset.type === type);
    });

    fetchRooms(checkIn, checkOut, type, maxPrice);
    document.getElementById('rooms').scrollIntoView({ behavior: 'smooth', block: 'start' });
});

/* ── Initial load ── */
fetchRooms();