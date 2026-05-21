const token = localStorage.getItem('hotel_token');
const userInfo = JSON.parse(localStorage.getItem('user_info'));

if (!token || !userInfo || userInfo.role !== 'admin') {
    Swal.fire({ icon: 'error', title: 'Access Denied', text: 'You are not an Admin.' }).then(() => window.location.href = "/");
}

let bsEditModal;
let bsAddModal;
let bsAddBookModal;

document.addEventListener('DOMContentLoaded', () => {
    bsEditModal = new bootstrap.Modal(document.getElementById('editRoomModal'));
    const addModalEl = document.getElementById('addRoomModal');
    if (addModalEl) bsAddModal = new bootstrap.Modal(addModalEl);
    const addBookEl = document.getElementById('addBookModal');
    if (addBookEl) bsAddBookModal = new bootstrap.Modal(addBookEl);
});

/* ── Stats ── */
async function loadDashboardStats() {
    try {
        const res = await fetch('/api/admin/stats', { headers: { 'Authorization': `Bearer ${token}` } });
        if (!res.ok) return;
        const s = await res.json();
        document.getElementById('stat_arrivals').innerText = s.arrivalsToday;
        document.getElementById('stat_revenue').innerText = `LKR ${Number(s.monthlyRevenue).toLocaleString()}`;
        document.getElementById('stat_rooms').innerText = s.totalRooms;
        document.getElementById('stat_users').innerText = s.totalUsers;
        const ctx = document.getElementById('revenueChart').getContext('2d');
        new Chart(ctx, { type: 'bar', data: { labels: ['Monthly Revenue'], datasets: [{ label: 'Revenue (LKR)', data: [s.monthlyRevenue], backgroundColor: 'rgba(201,168,76,0.3)', borderColor: 'rgba(201,168,76,1)', borderWidth: 2, borderRadius: 6 }] }, options: { scales: { y: { beginAtZero: true, grid: { color: '#f1f5f9' } } }, plugins: { legend: { display: false } } } });
    } catch (e) { console.error(e); }
}

/* ── Bookings ── */
let allBookingsList = [];

async function loadBookings() {
    try {
        const res = await fetch('/api/bookings', { headers: { 'Authorization': `Bearer ${token}` } });
        allBookingsList = await res.json();
        renderBookingsTable(allBookingsList);
    } catch (e) { console.error(e); }
}

function renderBookingsTable(bookings) {
    const tbody = document.getElementById('bookingsTableBody');
    tbody.innerHTML = '';
    if (!bookings.length) { tbody.innerHTML = '<tr><td colspan="8" class="text-center py-4 text-muted">No bookings found.</td></tr>'; return; }
    bookings.forEach(b => {
        const sMap = { Pending: 's-pending', Confirmed: 's-confirmed', 'Checked-in': 's-checkin', 'Checked-out': 's-checkout', Cancelled: 's-cancelled' };
        let btns = '—';
        if (b.status === 'Pending') btns = `<button class="action-btn" style="background:#d1fae5;color:#065f46;" onclick="updateBookingStatus('${b._id}','Confirmed')">Confirm</button><button class="action-btn" style="background:#fee2e2;color:#991b1b;" onclick="updateBookingStatus('${b._id}','Cancelled')">Reject</button>`;
        else if (b.status === 'Confirmed') btns = `<button class="action-btn" style="background:#dbeafe;color:#1e40af;" onclick="updateBookingStatus('${b._id}','Checked-in')">Check In</button>`;
        else if (b.status === 'Checked-in') btns = `<button class="action-btn" style="background:#ede9fe;color:#5b21b6;" onclick="updateBookingStatus('${b._id}','Checked-out')">Check Out</button>`;
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
    const res = await fetch(`/api/bookings/${id}/status`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ status }) });
    if (res.ok) { Swal.fire({ icon: 'success', title: 'Updated', text: `Booking marked as ${status}.`, timer: 1500, showConfirmButton: false }); loadBookings(); }
    else { const d = await res.json(); Swal.fire({ icon: 'error', title: 'Failed', text: d.message }); }
};

/* ── Rooms ── */
async function loadRooms() {
    try {
        const res = await fetch('/api/rooms');
        const rooms = await res.json();
        const tbody = document.getElementById('roomsTableBody');
        tbody.innerHTML = '';
        if (!rooms.length) { tbody.innerHTML = '<tr><td colspan="5" class="text-center py-4 text-muted">No rooms found.</td></tr>'; return; }
        rooms.forEach(r => {
            const sClass = r.status === 'Available' ? 's-available' : (r.status === 'Maintenance' ? 's-maintenance' : 's-occupied');
            tbody.innerHTML += `<tr>
                <td><strong>${r.room_number}</strong></td>
                <td>${r.type}</td>
                <td>LKR ${Number(r.price).toLocaleString()}</td>
                <td><span class="status-badge-sm ${sClass}">${r.status}</span></td>
                <td>
                    <button class="action-btn" style="background:#dbeafe;color:#1e40af;" onclick="openEditRoomModal('${r._id}','${r.price}',encodeURIComponent('${r.description.replace(/'/g, "\\'")}'),'${r.status}')"><i class="bi bi-pencil"></i> Edit</button>
                    <button class="action-btn" style="background:#fee2e2;color:#991b1b;" onclick="deleteRoom('${r._id}')"><i class="bi bi-tools"></i> Disable</button>
                </td>
            </tr>`;
        });
    } catch (e) { console.error(e); }
}

document.addEventListener('DOMContentLoaded', () => {
    /* Add Room */
    document.getElementById('addRoomForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = e.target.querySelector('button[type="submit"]');
        btn.disabled = true; btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Adding...';
        try {
            let image_url = 'https://via.placeholder.com/300x200?text=Hotel+Room';
            const file = document.getElementById('room_image').files[0];
            const manualUrl = document.getElementById('room_image_url').value;
            if (file) {
                const fd = new FormData(); fd.append('image', file);
                const ur = await fetch('/api/rooms/upload',
                    {
                        method: 'POST',
                        headers: { 'Authorization': `Bearer ${token}` },
                        body: fd
                    });
                if (!ur.ok) throw new Error('Upload failed');
                const ud = await ur.json();
                image_url = ud.image_url;
            }
            else if
                (manualUrl.trim()) image_url = manualUrl.trim();
            const res = await fetch('/api/rooms', {
                method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    room_number: document.getElementById('room_number').value,
                    type: document.getElementById('room_type').value,
                    price: document.getElementById('room_price').value,
                    image_url, description: document.getElementById('room_desc').value
                })
            });
            const data = await res.json();
            if (res.ok) {
                Swal.fire({
                    icon: 'success',
                    title: 'Room Added!',
                    timer: 1500, showConfirmButton: false
                });
                e.target.reset();
                if (bsAddModal) bsAddModal.hide(); loadRooms();
            }
            else
                Swal.fire({ icon: 'error', title: 'Error', text: data.message });
        } catch (err) {
            Swal.fire({ icon: 'error', title: 'Error', text: err.message || 'Failed' });
        }
        finally {
            btn.disabled = false;
            btn.innerHTML = '<i class="bi bi-plus-lg me-2"></i>Add Room';
        }
    });

    document.getElementById('editRoomForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('edit_room_id').value;
        let updateData = { price: document.getElementById('edit_room_price').value, description: document.getElementById('edit_room_desc').value, status: document.getElementById('edit_room_status').value };
        const file = document.getElementById('edit_room_image').files[0];
        const manualUrl = document.getElementById('edit_room_image_url').value;
        if (file) { const fd = new FormData(); fd.append('image', file); const ur = await fetch('/api/rooms/upload', { method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, body: fd }); if (ur.ok) { const ud = await ur.json(); updateData.image_url = ud.image_url; } }
        else if (manualUrl.trim()) updateData.image_url = manualUrl.trim();
        const res = await fetch(`/api/rooms/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(updateData) });
        if (res.ok) { Swal.fire({ icon: 'success', title: 'Updated!', timer: 1500, showConfirmButton: false }); bsEditModal.hide(); loadRooms(); }
        else { const d = await res.json(); Swal.fire({ icon: 'error', title: 'Error', text: d.message }); }
    });

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
                    Swal.fire({ icon: 'success', title: 'Booking Confirmed!', text: 'Reservation created successfully.', timer: 1500, showConfirmButton: false });
                    e.target.reset();
                    document.getElementById('book_available_rooms').innerHTML = '<option value="">Please check availability first...</option>';
                    document.getElementById('book_available_rooms').disabled = true;
                    submitBtn.disabled = true;
                    if (bsAddBookModal) bsAddBookModal.hide();
                    loadBookings();
                    loadDashboardStats();
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

    loadDashboardStats(); loadBookings(); loadRooms();
});

window.openEditRoomModal = function (id, price, desc, status) {
    document.getElementById('edit_room_id').value = id;
    document.getElementById('edit_room_price').value = price;
    document.getElementById('edit_room_desc').value = decodeURIComponent(desc);
    document.getElementById('edit_room_status').value = status;
    bsEditModal.show();
};

window.deleteRoom = async function (id) {
    const conf = await Swal.fire({ title: 'Disable Room?', text: 'This moves the room to Maintenance.', icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33', confirmButtonText: 'Yes, disable' });
    if (conf.isConfirmed) { const res = await fetch(`/api/rooms/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } }); if (res.ok) { Swal.fire('Disabled!', 'Room set to maintenance.', 'success'); loadRooms(); } else Swal.fire('Error', 'Failed to disable.', 'error'); }
};
