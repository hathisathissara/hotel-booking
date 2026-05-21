const token = localStorage.getItem('hotel_token');
const userInfo = JSON.parse(localStorage.getItem('user_info'));

if (!token || !userInfo || userInfo.role !== 'admin') {
    Swal.fire({ icon: 'error', title: 'Access Denied', text: 'You are not authorized to view the admin panel.' }).then(() => window.location.href = "/login");
}

let bsEditModal;
let bsAddModal;

document.addEventListener('DOMContentLoaded', () => {
    // Render Admin details
    if (userInfo) {
        document.getElementById('adminNameDisplay').innerText = userInfo.full_name || 'Admin Manager';
        if (userInfo.full_name) {
            document.getElementById('avatarLetter').innerText = userInfo.full_name.charAt(0).toUpperCase();
        }
    }

    // Modal Initializations
    bsEditModal = new bootstrap.Modal(document.getElementById('editRoomModal'));
    const addModalEl = document.getElementById('addRoomModal');
    if (addModalEl) bsAddModal = new bootstrap.Modal(addModalEl);

    // Load rooms
    loadRooms();

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

    // Add Room Submit Form
    document.getElementById('addRoomForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = e.target.querySelector('button[type="submit"]');
        btn.disabled = true; 
        btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Adding...';
        try {
            let image_url = 'https://via.placeholder.com/300x200?text=Hotel+Room';
            const file = document.getElementById('room_image').files[0];
            const manualUrl = document.getElementById('room_image_url').value;
            
            if (file) {
                const fd = new FormData(); 
                fd.append('image', file);
                const ur = await fetch('/api/rooms/upload', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: fd
                });
                if (!ur.ok) throw new Error('Image upload failed.');
                const ud = await ur.json();
                image_url = ud.image_url;
            } else if (manualUrl.trim()) {
                image_url = manualUrl.trim();
            }

            const res = await fetch('/api/rooms', {
                method: 'POST', 
                headers: { 
                    'Content-Type': 'application/json', 
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({
                    room_number: document.getElementById('room_number').value,
                    type: document.getElementById('room_type').value,
                    price: document.getElementById('room_price').value,
                    image_url, 
                    description: document.getElementById('room_desc').value
                })
            });
            const data = await res.json();
            if (res.ok) {
                Swal.fire({
                    icon: 'success',
                    title: 'Room Added!',
                    text: 'The new hotel room has been recorded successfully.',
                    timer: 1500, 
                    showConfirmButton: false
                });
                e.target.reset();
                if (bsAddModal) bsAddModal.hide(); 
                loadRooms();
            } else {
                Swal.fire({ icon: 'error', title: 'Error', text: data.message });
            }
        } catch (err) {
            Swal.fire({ icon: 'error', title: 'Error', text: err.message || 'Failed' });
        } finally {
            btn.disabled = false;
            btn.innerHTML = '<i class="bi bi-plus-lg me-2"></i>Add Room';
        }
    });

    // Edit Room Submit Form
    document.getElementById('editRoomForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('edit_room_id').value;
        let updateData = { 
            type: document.getElementById('edit_room_type').value,
            price: document.getElementById('edit_room_price').value, 
            description: document.getElementById('edit_room_desc').value, 
            status: document.getElementById('edit_room_status').value 
        };
        const file = document.getElementById('edit_room_image').files[0];
        const manualUrl = document.getElementById('edit_room_image_url').value;
        
        try {
            if (file) { 
                const fd = new FormData(); 
                fd.append('image', file); 
                const ur = await fetch('/api/rooms/upload', { 
                    method: 'POST', 
                    headers: { 'Authorization': `Bearer ${token}` }, 
                    body: fd 
                }); 
                if (ur.ok) { 
                    const ud = await ur.json(); 
                    updateData.image_url = ud.image_url; 
                } 
            } else if (manualUrl.trim()) {
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
                Swal.fire({ 
                    icon: 'success', 
                    title: 'Updated!', 
                    text: 'Room details updated.', 
                    timer: 1500, 
                    showConfirmButton: false 
                }); 
                bsEditModal.hide(); 
                loadRooms(); 
            } else { 
                const d = await res.json(); 
                Swal.fire({ icon: 'error', title: 'Error', text: d.message }); 
            }
        } catch (err) {
            Swal.fire({ icon: 'error', title: 'Error', text: 'An unexpected error occurred.' });
        }
    });
});

/* ── Load and Render Rooms ── */
async function loadRooms() {
    try {
        const res = await fetch('/api/rooms');
        const rooms = await res.json();
        const tbody = document.getElementById('roomsTableBody');
        tbody.innerHTML = '';
        if (!rooms.length) { 
            tbody.innerHTML = '<tr><td colspan="5" class="text-center py-4 text-muted">No rooms found.</td></tr>'; 
            return; 
        }
        rooms.forEach(r => {
            const sClass = r.status === 'Available' ? 's-available' : (r.status === 'Maintenance' ? 's-maintenance' : 's-occupied');
            tbody.innerHTML += `<tr>
                <td><strong>${r.room_number}</strong></td>
                <td>${r.type}</td>
                <td>LKR ${Number(r.price).toLocaleString()}</td>
                <td><span class="status-badge-sm ${sClass}">${r.status}</span></td>
                <td>
                    <button class="action-btn" style="background:#dbeafe;color:#1e40af;" onclick="openEditRoomModal('${r._id}','${r.type}','${r.price}',encodeURIComponent('${r.description.replace(/'/g, "\\'")}'),'${r.status}')"><i class="bi bi-pencil"></i> Edit</button>
                    <button class="action-btn" style="background:#fee2e2;color:#991b1b;" onclick="deleteRoom('${r._id}')"><i class="bi bi-tools"></i> Disable</button>
                </td>
            </tr>`;
        });
    } catch (e) { 
        console.error("Error loading rooms: ", e); 
    }
}

window.openEditRoomModal = function (id, type, price, desc, status) {
    document.getElementById('edit_room_id').value = id;
    document.getElementById('edit_room_type').value = type;
    document.getElementById('edit_room_price').value = price;
    document.getElementById('edit_room_desc').value = decodeURIComponent(desc);
    document.getElementById('edit_room_status').value = status;
    bsEditModal.show();
};

window.deleteRoom = async function (id) {
    const conf = await Swal.fire({ 
        title: 'Disable Room?', 
        text: 'This moves the room status to Maintenance.', 
        icon: 'warning', 
        showCancelButton: true, 
        confirmButtonColor: '#ef4444', 
        confirmButtonText: 'Yes, disable' 
    });
    if (conf.isConfirmed) { 
        const res = await fetch(`/api/rooms/${id}`, { 
            method: 'DELETE', 
            headers: { 'Authorization': `Bearer ${token}` } 
        }); 
        if (res.ok) { 
            Swal.fire('Disabled!', 'Room status set to maintenance.', 'success'); 
            loadRooms(); 
        } else {
            Swal.fire('Error', 'Failed to disable.', 'error'); 
        }
    }
};
