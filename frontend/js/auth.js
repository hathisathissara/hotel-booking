// Register Logic
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitBtn = registerForm.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.innerHTML = "Registering... ⏳";

        const userData = {
            full_name: document.getElementById('full_name').value,
            address: document.getElementById('address').value,
            phone: document.getElementById('phone_number').value,
            email: document.getElementById('email').value,
            password: document.getElementById('password').value,
            identity_type: document.getElementById('identity_type').value,
            identity_number: document.getElementById('identity_number').value
        };

        try {
            const res = await fetch('/api/users/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });
            const data = await res.json();

            Swal.fire({
                icon: res.ok ? 'success' : 'error',
                title: res.ok ? 'Success!' : 'Oops...',
                text: res.ok ? "Registration Successful! Please login." : data.message,
            });

            if (res.ok) registerForm.reset();
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Error', text: "Server connection failed!" });
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = "Register";
        }
    });
}

// Login Logic
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitBtn = loginForm.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.innerHTML = "Logging in... ⏳";

        const loginData = {
            email: document.getElementById('login_email').value,
            password: document.getElementById('login_password').value
        };

        try {
            const res = await fetch('/api/users/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(loginData)
            });
            const data = await res.json();

            if (res.ok) {
                localStorage.setItem('hotel_token', data.token);
                localStorage.setItem('user_info', JSON.stringify(data));

                Swal.fire({
                    icon: 'success',
                    title: 'Welcome!',
                    text: 'Login successful. Redirecting...',
                    showConfirmButton: false,
                    timer: 1500
                }).then(() => {
                    window.location.href = "/";
                });
            } else {
                Swal.fire({ icon: 'error', title: 'Login Failed', text: data.message });
            }
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Error', text: "Server connection failed!" });
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = "Login";
        }
    });
}