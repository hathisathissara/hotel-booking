const token = localStorage.getItem('hotel_token');
const userInfo = JSON.parse(localStorage.getItem('user_info'));

if (!token || !userInfo || userInfo.role !== 'admin') {
    Swal.fire({ icon: 'error', title: 'Access Denied', text: 'You are not authorized to view the admin panel.' }).then(() => window.location.href = "/login");
}

let bsAddBookModal;
let allBookingsList = [];

document.addEventListener('DOMContentLoaded', () => {
    // Render Admin details
    if (userInfo) {
        document.getElementById('adminNameDisplay').innerText = userInfo.full_name || 'Admin Manager';
        if (userInfo.full_name) {
            document.getElementById('avatarLetter').innerText = userInfo.full_name.charAt(0).toUpperCase();
        }
    }

    // Modal Initializations
    const addBookEl = document.getElementById('addBookModal');
    if (addBookEl) bsAddBookModal = new bootstrap.Modal(addBookEl);

    // Load bookings
    loadBookings();

    // Logout Handler
    document.getElementById('logoutBtn').addEventListener('click', (e) => {
        e.preventDefault();
        Swal.fire({
            title: 'Are you sure?',
            text: "Do you want to log out?",
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

    // Check Available Rooms Event
    if (document.getElementById('btnCheckAvailableRooms')) {
        document.getElementById('btnCheckAvailableRooms').addEventListener('click', async () => {
            const check_in = document.getElementById('book_checkin').value;
            const check_out = document.getElementById('book_checkout').value;
            const type = document.getElementById('book_room_type').value;

            if (!check_in || !check_out) {
                Swal.fire({ icon: 'warning', title: 'Dates Required', text: 'Please select check-in and check-out dates.' });
                return;
            }
            if (new Date(check_in) >= new Date(check_out)) {
                Swal.fire({ icon: 'warning', title: 'Invalid Dates', text: 'Check-out date must be after check-in date.' });
                return;
            }

            const btn = document.getElementById('btnCheckAvailableRooms');
            btn.disabled = true;
            btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Checking Free Rooms...';

            try {
                const res = await fetch(`/api/rooms/available?check_in=${check_in}&check_out=${check_out}&type=${type}`);
                const rooms = await res.json();
                const selectEl = document.getElementById('book_available_rooms');
                const submitBtn = document.getElementById('btnSubmitAdminBooking');

                selectEl.innerHTML = '';

                if (res.ok && rooms.length > 0) {
                    rooms.forEach(r => {
                        selectEl.innerHTML += `<option value="${r._id}">Room ${r.room_number} (${r.type}) — LKR ${Number(r.price).toLocaleString()} / night</option>`;
                    });
                    selectEl.disabled = false;
                    submitBtn.disabled = false;
                } else {
                    selectEl.innerHTML = '<option value="">No available rooms found for these dates & type.</option>';
                    selectEl.disabled = true;
                    submitBtn.disabled = true;
                }
            } catch (err) {
                Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to check available rooms.' });
            } finally {
                btn.disabled = false;
                btn.innerHTML = '<i class="bi bi-search me-2"></i>Check Available Free Rooms';
            }
        });
    }

    // Add Booking Submit Form
    if (document.getElementById('addBookForm')) {
        document.getElementById('addBookForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = document.getElementById('btnSubmitAdminBooking');
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Confirming Booking...';

            const payload = {
                full_name: document.getElementById('book_cust_name').value,
                identity_type: document.getElementById('book_id_type').value,
                identity_number: document.getElementById('book_id_number').value,
                room_id: document.getElementById('book_available_rooms').value,
                check_in_date: document.getElementById('book_checkin').value,
                check_out_date: document.getElementById('book_checkout').value
            };

            try {
                const res = await fetch('/api/bookings/admin', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(payload)
                });
                const data = await res.json();
                if (res.ok) {
                    Swal.fire({ 
                        icon: 'success', 
                        title: 'Booking Confirmed!', 
                        text: 'Reservation created successfully.', 
                        timer: 1500, 
                        showConfirmButton: false 
                    });
                    e.target.reset();
                    document.getElementById('book_available_rooms').innerHTML = '<option value="">Please check availability first...</option>';
                    document.getElementById('book_available_rooms').disabled = true;
                    submitBtn.disabled = true;
                    if (bsAddBookModal) bsAddBookModal.hide();
                    loadBookings();
                } else {
                    Swal.fire({ icon: 'error', title: 'Booking Failed', text: data.message });
                }
            } catch (err) {
                Swal.fire({ icon: 'error', title: 'Error', text: err.message || 'Failed to create booking' });
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="bi bi-check2-circle me-2"></i>Confirm Booking';
            }
        });
    }

    // Search Booking Filter
    if (document.getElementById('searchBookingInput')) {
        document.getElementById('searchBookingInput').addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase().trim();
            if (!term) {
                renderBookingsTable(allBookingsList);
                return;
            }
            const filtered = allBookingsList.filter(b => {
                const idNum = (b.user && b.user.identity_number) ? b.user.identity_number.toLowerCase() : '';
                const name = (b.user && b.user.full_name) ? b.user.full_name.toLowerCase() : '';
                return idNum.includes(term) || name.includes(term);
            });
            renderBookingsTable(filtered);
        });
    }
});

/* ── Load and Render Bookings ── */
async function loadBookings() {
    try {
        const res = await fetch('/api/bookings', { headers: { 'Authorization': `Bearer ${token}` } });
        allBookingsList = await res.json();
        renderBookingsTable(allBookingsList);
    } catch (e) { 
        console.error("Error fetching bookings list: ", e); 
    }
}

function renderBookingsTable(bookings) {
    const tbody = document.getElementById('bookingsTableBody');
    tbody.innerHTML = '';
    if (!bookings.length) { 
        tbody.innerHTML = '<tr><td colspan="8" class="text-center py-4 text-muted">No bookings found.</td></tr>'; 
        return; 
    }
    bookings.forEach(b => {
        const sMap = { 
            Pending: 's-pending', 
            Confirmed: 's-confirmed', 
            'Checked-in': 's-checkin', 
            'Checked-out': 's-checkout', 
            Cancelled: 's-cancelled' 
        };
        let btns = '—';
        if (b.status === 'Pending') {
            btns = `<button class="action-btn" style="background:#d1fae5;color:#065f46;" onclick="updateBookingStatus('${b._id}','Confirmed')">Confirm</button><button class="action-btn" style="background:#fee2e2;color:#991b1b;" onclick="updateBookingStatus('${b._id}','Cancelled')">Reject</button>`;
        } else if (b.status === 'Confirmed') {
            btns = `<button class="action-btn" style="background:#dbeafe;color:#1e40af;" onclick="updateBookingStatus('${b._id}','Checked-in')">Check In</button>`;
        } else if (b.status === 'Checked-in') {
            btns = `<button class="action-btn" style="background:#ede9fe;color:#5b21b6;" onclick="updateBookingStatus('${b._id}','Checked-out')">Check Out</button>`;
        }
        
        tbody.innerHTML += `<tr>
            <td><strong>${b.user ? b.user.full_name : 'Unknown'}</strong></td>
            <td><code>${b.user ? b.user.identity_number : '—'}</code></td>
            <td>${b.room ? b.room.room_number : '—'} <span class="text-muted">(${b.room ? b.room.type : '—'})</span></td>
            <td>${new Date(b.check_in_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</td>
            <td>${new Date(b.check_out_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</td>
            <td><strong>LKR ${Number(b.total_price).toLocaleString()}</strong></td>
            <td><span class="status-badge-sm ${sMap[b.status] || 's-pending'}">${b.status}</span></td>
            <td>${btns}</td>
        </tr>`;
    });
}

window.updateBookingStatus = async function (id, status) {
    try {
        const res = await fetch(`/api/bookings/${id}/status`, { 
            method: 'PUT', 
            headers: { 
                'Content-Type': 'application/json', 
                'Authorization': `Bearer ${token}` 
            }, 
            body: JSON.stringify({ status }) 
        });
        if (res.ok) { 
            Swal.fire({ 
                icon: 'success', 
                title: 'Updated', 
                text: `Booking marked as ${status}.`, 
                timer: 1500, 
                showConfirmButton: false 
            }); 
            loadBookings(); 
        } else { 
            const d = await res.json(); 
            Swal.fire({ icon: 'error', title: 'Failed', text: d.message }); 
        }
    } catch (err) {
        Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to update booking status.' });
    }
};
