const roomsContainer = document.getElementById('roomsContainer');
// Modal Elements select karaganima
const modal = document.getElementById('bookingModal');
const closeModal = document.getElementById('closeModal');
const bookingForm = document.getElementById('bookingForm');
const modalRoomId = document.getElementById('modal_room_id');
const bookingMessage = document.getElementById('bookingMessage');


async function fetchRooms(checkIn = '', checkOut = '', type = '', maxPrice = '') {
    try {
        let url = '/api/rooms';
        let params = new URLSearchParams();
        if (checkIn && checkOut) {
            params.append('check_in', checkIn);
            params.append('check_out', checkOut);
        }
        if (type) params.append('type', type);
        if (maxPrice) params.append('maxPrice', maxPrice);

        if (params.toString()) {
            url = `/api/rooms/available?${params.toString()}`;
        }

        const res = await fetch(url);
        const rooms = await res.json();
        roomsContainer.innerHTML = '';

        if (rooms.length === 0) {
            roomsContainer.innerHTML = '<h2>No rooms available.</h2>';
            return;
        }

        rooms.forEach(room => {
            roomsContainer.innerHTML += `
                <div class="room-card">
                    <img src="${room.image_url}" alt="${room.type}">
                    <h3>${room.type} Room (No: ${room.room_number})</h3>
                    <p>${room.description}</p>
                    <h4>LKR ${room.price} / night</h4>
                    <div style="display: flex; gap: 10px;">
                        <button class="book-btn" onclick="bookRoom('${room._id}')" style="flex: 1;">Book Now</button>
                        <button class="book-btn" onclick="viewReviews('${room._id}')" style="flex: 1; background-color: #17a2b8;">Reviews</button>
                    </div>
                </div>
            `;
        });
    } catch (error) {
        roomsContainer.innerHTML = '<h2 style="color:red;">Failed to load rooms.</h2>';
    }
}

// 1. "Book Now" obuwama Modal eka Open kirima
function bookRoom(roomId) {
    const token = localStorage.getItem('hotel_token');
    
    // Login wela nattam yawanna
    if (!token) {
        Swal.fire({
            icon: 'warning',
            title: 'Login Required',
            text: 'Please login to book a room!',
            showCancelButton: true,
            confirmButtonText: 'Go to Login'
        }).then((result) => {
            if (result.isConfirmed) {
                window.location.href = "/login";
            }
        });
        return;
    }

    // Modal eka pennanna saha Room ID eka hangala form eke set karanna
    modal.style.display = 'block';
    modalRoomId.value = roomId;
    bookingMessage.innerHTML = ''; // Parana messages ain karanawa
    bookingForm.reset(); // Form eka clear karanawa
}

const reviewsModal = document.getElementById('reviewsModal');
const closeReviewsModal = document.getElementById('closeReviewsModal');
const reviewsList = document.getElementById('reviewsList');

window.viewReviews = async function(roomId) {
    reviewsModal.style.display = 'block';
    reviewsList.innerHTML = '<p>Loading reviews...</p>';

    try {
        const res = await fetch(`/api/reviews/${roomId}`);
        const reviews = await res.json();
        
        if (reviews.length === 0) {
            reviewsList.innerHTML = '<p>No reviews yet for this room.</p>';
            return;
        }

        let html = '';
        reviews.forEach(r => {
            const stars = '⭐'.repeat(r.rating);
            html += `
                <div style="border-bottom: 1px solid #eee; padding-bottom: 10px; margin-bottom: 10px;">
                    <strong>${r.user.full_name}</strong> - <span style="color: gold;">${stars}</span>
                    <p style="margin: 5px 0; font-size: 14px;">"${r.comment}"</p>
                    <small style="color: gray;">${new Date(r.createdAt).toLocaleDateString()}</small>
                </div>
            `;
        });
        reviewsList.innerHTML = html;
    } catch (err) {
        reviewsList.innerHTML = '<p style="color: red;">Failed to load reviews.</p>';
    }
};

closeReviewsModal.addEventListener('click', () => {
    reviewsModal.style.display = 'none';
});

// 2. Modal eke X (Close) eka obuwama eka waheema
closeModal.addEventListener('click', () => {
    modal.style.display = 'none';
});

// 3. Modal eken eliye obuwamath Modal eka waheema
window.addEventListener('click', (event) => {
    if (event.target === modal) {
        modal.style.display = 'none';
    }
    if (event.target === reviewsModal) {
        reviewsModal.style.display = 'none';
    }
});

// 4. Booking Data tika Backend ekata yawima
if (bookingForm) {
    bookingForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitBtn = bookingForm.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.innerHTML = "Confirming... ⏳";

        const bookingData = {
            room_id: document.getElementById('modal_room_id').value,
            check_in_date: document.getElementById('check_in').value,
            check_out_date: document.getElementById('check_out').value
        };

        const token = localStorage.getItem('hotel_token');

        try {
            const res = await fetch('/api/bookings', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify(bookingData)
            });

            const data = await res.json();

            if (res.ok) {
                Swal.fire({ icon: 'success', title: 'Success!', text: data.message, timer: 2000, showConfirmButton: false });
                bookingForm.reset();
                setTimeout(() => { modal.style.display = 'none'; }, 2000);
            } else {
                Swal.fire({ icon: 'error', title: 'Booking Failed', text: data.message });
            }
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Error', text: "Server connection failed!" });
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = "Confirm Booking";
        }
    });
}

// Date Search Logic
const searchForm = document.getElementById('searchForm');
if (searchForm) {
    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const checkIn = document.getElementById('search_check_in').value;
        const checkOut = document.getElementById('search_check_out').value;
        const roomType = document.getElementById('search_room_type').value;
        const maxPrice = document.getElementById('search_max_price').value;
        
        if (checkIn || checkOut) {
            if (!checkIn || !checkOut) {
                Swal.fire({ icon: 'error', title: 'Invalid Dates', text: 'Please select both Check-in and Check-out dates.' });
                return;
            }
            const inDate = new Date(checkIn);
            const outDate = new Date(checkOut);
            
            if (inDate >= outDate) {
                Swal.fire({ icon: 'error', title: 'Invalid Dates', text: 'Check-out date must be after Check-in date.' });
                return;
            }
        }

        roomsContainer.innerHTML = '<h2>Searching... ⏳</h2>';
        fetchRooms(checkIn, checkOut, roomType, maxPrice);
    });
}
// Page load weddi run wenna
fetchRooms();