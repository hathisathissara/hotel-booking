const token = localStorage.getItem('hotel_token');
const userInfo = JSON.parse(localStorage.getItem('user_info'));

// 1. Security Check
if (!token || !userInfo || userInfo.role !== 'admin') {
    Swal.fire({ icon: 'error', title: 'Access Denied', text: 'You are not an Admin.' })
        .then(() => window.location.href = "/");
}

// 2. Load Bookings
async function loadBookings() {
    try {
        const res = await fetch('/api/bookings', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const bookings = await res.json();
        const tbody = document.getElementById('bookingsTableBody');
        tbody.innerHTML = '';

        if (bookings.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">No bookings found.</td></tr>';
            return;
        }

        bookings.forEach(b => {
            const checkIn = new Date(b.check_in_date).toLocaleDateString();
            const checkOut = new Date(b.check_out_date).toLocaleDateString();

            // Status Badge Colors
            let statusColor = b.status === 'Pending' ? 'orange' : (b.status === 'Confirmed' ? 'green' : (b.status === 'Checked-in' ? 'blue' : (b.status === 'Checked-out' ? 'purple' : 'red')));

            let actionBtns = '-';
            if (b.status === 'Pending') {
                actionBtns = `
                    <button onclick="updateBookingStatus('${b._id}', 'Confirmed')" style="background: green; color: white; padding: 5px; cursor: pointer; border: none; border-radius: 4px; margin-bottom: 5px;">Confirm</button>
                    <button onclick="updateBookingStatus('${b._id}', 'Cancelled')" style="background: red; color: white; padding: 5px; cursor: pointer; border: none; border-radius: 4px;">Reject</button>
                `;
            } else if (b.status === 'Confirmed') {
                actionBtns = `<button onclick="updateBookingStatus('${b._id}', 'Checked-in')" style="background: #17a2b8; color: white; padding: 5px; cursor: pointer; border: none; border-radius: 4px;">Check In</button>`;
            } else if (b.status === 'Checked-in') {
                actionBtns = `<button onclick="updateBookingStatus('${b._id}', 'Checked-out')" style="background: #6f42c1; color: white; padding: 5px; cursor: pointer; border: none; border-radius: 4px;">Check Out</button>`;
            }

            tbody.innerHTML += `
                <tr>
                    <td>${b.user.full_name}</td>
                    <td>${b.user.identity_number}</td>
                    <td>${b.room.room_number} (${b.room.type})</td>
                    <td>${checkIn}</td>
                    <td>${checkOut}</td>
                    <td>LKR ${b.total_price}</td>
                    <td style="color: ${statusColor}; font-weight: bold;">${b.status}</td>
                    <td>${actionBtns}</td>
                </tr>
            `;
        });
    } catch (error) {
        console.error("Error loading bookings:", error);
    }
}

// Update Booking Status
window.updateBookingStatus = async function (bookingId, status) {
    try {
        const res = await fetch(`/api/bookings/${bookingId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status })
        });
        if (res.ok) {
            Swal.fire({ icon: 'success', title: 'Updated!', text: `Booking marked as ${status}.`, timer: 1500 });
            loadBookings();
        } else {
            const data = await res.json();
            Swal.fire({ icon: 'error', title: 'Failed', text: data.message });
        }
    } catch (error) {
        Swal.fire({ icon: 'error', title: 'Error', text: "Server error" });
    }
}

// 3. Load Rooms
async function loadRooms() {
    try {
        const res = await fetch('/api/rooms');
        const rooms = await res.json();
        const tbody = document.getElementById('roomsTableBody');
        tbody.innerHTML = '';

        if (rooms.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">No rooms found.</td></tr>';
            return;
        }

        rooms.forEach(r => {
            let statusColor = r.status === 'Available' ? 'green' : (r.status === 'Maintenance' ? 'red' : 'orange');

            tbody.innerHTML += `
                <tr>
                    <td>${r.room_number}</td>
                    <td>${r.type}</td>
                    <td>LKR ${r.price}</td>
                    <td style="color: ${statusColor}; font-weight: bold;">${r.status}</td>
                    <td>
                        <button onclick="openEditRoomModal('${r._id}', '${r.price}', encodeURIComponent('${r.description.replace(/'/g, "\\'")}'), '${r.status}')" style="background: blue; color: white; padding: 5px; cursor: pointer; border: none; border-radius: 4px;">Edit</button>
                        <button onclick="deleteRoom('${r._id}')" style="background: red; color: white; padding: 5px; cursor: pointer; border: none; border-radius: 4px;">Disable</button>
                    </td>
                </tr>
            `;
        });
    } catch (error) {
        console.error("Error loading rooms:", error);
    }
}

// Add Room Form
const addRoomForm = document.getElementById('addRoomForm');
if (addRoomForm) {
    addRoomForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = addRoomForm.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.innerHTML = "Adding room... ⏳";

        try {
            let image_url = "https://via.placeholder.com/300x200?text=Hotel+Room";
            const imageFile = document.getElementById('room_image').files[0];
            const manualUrl = document.getElementById('room_image_url')?.value;

            // 1. Upload Image First (If selected)
            if (imageFile) {
                const formData = new FormData();
                formData.append('image', imageFile);

                const uploadRes = await fetch('/api/rooms/upload', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: formData
                });

                if (!uploadRes.ok) throw new Error("Image upload failed");
                const uploadData = await uploadRes.json();
                image_url = uploadData.image_url;
            } else if (manualUrl && manualUrl.trim() !== "") {
                image_url = manualUrl.trim();
            }

            // 2. Add Room
            const roomData = {
                room_number: document.getElementById('room_number').value,
                type: document.getElementById('room_type').value,
                price: document.getElementById('room_price').value,
                image_url: image_url,
                description: document.getElementById('room_desc').value
            };

            const res = await fetch('/api/rooms', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(roomData)
            });

            const data = await res.json();

            if (res.ok) {
                Swal.fire({ icon: 'success', title: 'Success', text: 'Room added successfully!' });
                addRoomForm.reset();
                loadRooms();
            } else {
                Swal.fire({ icon: 'error', title: 'Error', text: data.message });
            }
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Error', text: error.message || "Error adding room!" });
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = "Add Room";
        }
    });
}

// Edit Room Modal Logic
const editModal = document.getElementById('editRoomModal');
window.openEditRoomModal = function (id, price, desc, status) {
    document.getElementById('edit_room_id').value = id;
    document.getElementById('edit_room_price').value = price;
    document.getElementById('edit_room_desc').value = decodeURIComponent(desc);
    document.getElementById('edit_room_status').value = status;
    editModal.style.display = 'flex';
};

document.getElementById('closeEditModal').addEventListener('click', () => {
    editModal.style.display = 'none';
});

const editRoomForm = document.getElementById('editRoomForm');
if (editRoomForm) {
    editRoomForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('edit_room_id').value;
        const price = document.getElementById('edit_room_price').value;
        const description = document.getElementById('edit_room_desc').value;
        const status = document.getElementById('edit_room_status').value;

        try {
            let updateData = { price, description, status };
            const imageFile = document.getElementById('edit_room_image').files[0];
            const manualUrl = document.getElementById('edit_room_image_url')?.value;

            if (imageFile) {
                const formData = new FormData();
                formData.append('image', imageFile);

                const uploadRes = await fetch('/api/rooms/upload', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: formData
                });

                if (uploadRes.ok) {
                    const uploadData = await uploadRes.json();
                    updateData.image_url = uploadData.image_url;
                } else {
                    throw new Error("Image upload failed");
                }
            } else if (manualUrl && manualUrl.trim() !== "") {
                updateData.image_url = manualUrl.trim();
            }

            const res = await fetch(`/api/rooms/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updateData)
            });

            if (res.ok) {
                Swal.fire({ icon: 'success', title: 'Updated!', text: 'Room details updated.', timer: 1500 });
                editModal.style.display = 'none';
                loadRooms();
            } else {
                const data = await res.json();
                Swal.fire({ icon: 'error', title: 'Error', text: data.message });
            }
        } catch (err) {
            Swal.fire({ icon: 'error', title: 'Error', text: 'Update failed' });
        }
    });
}

// Delete Room Logic
window.deleteRoom = async function (id) {
    const confirm = await Swal.fire({
        title: 'Are you sure?',
        text: "This will put the room into Maintenance mode.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, disable it!'
    });

    if (confirm.isConfirmed) {
        try {
            const res = await fetch(`/api/rooms/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                Swal.fire('Disabled!', 'Room has been moved to maintenance.', 'success');
                loadRooms();
            } else {
                Swal.fire('Error!', 'Failed to disable room.', 'error');
            }
        } catch (err) {
            Swal.fire('Error!', 'Server connection failed.', 'error');
        }
    }
}

// Dashboard Stats Load
async function loadDashboardStats() {
    try {
        const res = await fetch('/api/admin/stats', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) return;

        const stats = await res.json();

        document.getElementById('stat_arrivals').innerText = stats.arrivalsToday;
        document.getElementById('stat_revenue').innerText = `LKR ${stats.monthlyRevenue}`;
        document.getElementById('stat_rooms').innerText = stats.totalRooms;
        document.getElementById('stat_users').innerText = stats.totalUsers;

        // Render Chart
        const ctx = document.getElementById('revenueChart').getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Monthly Revenue'],
                datasets: [{
                    label: 'Revenue (LKR)',
                    data: [stats.monthlyRevenue],
                    backgroundColor: 'rgba(40, 167, 69, 0.5)',
                    borderColor: 'rgba(40, 167, 69, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    } catch (error) {
        console.error("Error loading stats:", error);
    }
}

// Initial Load
loadDashboardStats();
loadBookings();
loadRooms();