# 🏨 Lumière Hotel Management System

An elegant, modern, full-stack Hotel Management & Room Reservation System built with Node.js, Express, MongoDB, and Bootstrap 5. Designed for seamless luxury hotel operations, it features robust admin controls, instant room availability checking, walk-in customer management, dynamic revenue analytics, and an exquisite guest booking experience.

---

## ✨ Key Features

### 👑 For Administrators
- **Interactive Dashboard**: Real-time analytical overview displaying total bookings, available rooms, occupied units, and a dynamic monthly revenue chart powered by Chart.js.
- **Room Management**: Add, update, and manage hotel rooms with image uploads, room pricing, room types (*Single, Double, Family, Suite*), and maintenance status toggling.
- **Walk-in & Phone Reservations**: Instantly book rooms on behalf of customers calling in or arriving at the front desk. Automatically registers new walk-in customer accounts using their NIC or Passport number.
- **Live Search & Filter**: Search customer bookings instantly by typing their Name, NIC, or Passport number.
- **Reservation Workflow**: Update booking lifecycles with single-click status transitions (*Pending ➔ Confirmed ➔ Checked-in ➔ Checked-out ➔ Cancelled*). Confirmed bookings show both **Check In** and **Cancel** buttons for enhanced cancellation management.

### 👥 For Guests
- **Available Room Search**: Filter available rooms instantly by check-in/check-out dates, room type preferences, and budget constraints.
- **Secure Authentication**: Register and log in securely with JWT token authentication and encrypted password storage.
- **Reservation Portal**: View personal booking history, check reservation status, and manage upcoming stays.
- **Guest Review System**: Guests can leave star ratings (1–5) and feedback on completed stays, which are showcased to future visitors.

### 📧 Smart Email Notifications (Registered Users)
- **Instant Booking Confirmation**: Automatically validates room availability on booking creation. If available, confirms the booking and sends a premium HTML email instantly.
- **Checkout & Payment Summary**: Automatically triggers a styled summary email containing dates, duration, and the total payment amount when the guest checks out.
- **Walk-in Silence Guard**: Walk-in bookings entered manually by administrators do not trigger automated emails.

---

## 🛠️ Technology Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose ORM)
- **Authentication**: JSON Web Tokens (JWT), Bcrypt.js
- **Frontend**: HTML5, CSS3 (Modern Glassmorphism & Navy/Gold aesthetic), Vanilla JavaScript
- **UI Framework & Libraries**: Bootstrap 5.3, SweetAlert2 (Popups & Notifications), Chart.js (Analytics), Bootstrap Icons

---

## 📂 Project Structure

```text
hotel-booking/
├── backend/
│   ├── config/          # Database configuration (db.js)
│   ├── controllers/     # Business logic (auth, booking, room, user)
│   ├── middleware/      # JWT protection & Admin guard middleware
│   ├── models/          # Mongoose schemas (User, Room, Booking, Review)
│   ├── routes/          # Express API endpoints (/api/auth, /api/rooms, etc.)
│   └── server.js        # Main backend application server
│
└── frontend/
    ├── admin/           # Admin panel and all the files related to admin
    ├── css/             # Custom stylesheet definitions
    ├── js/              # Client-side logic (admin.js, auth.js, common.js, etc.)
    ├── layout/          # Reusable header and footer UI components
    ├── index.html       # Main guest landing page & room explorer
    ├── login.html       # Secure user login portal
    ├── register.html    # Customer registration page
    └── my-bookings.html # Guest personal reservation portal
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v16+ recommended)
- [MongoDB](https://www.mongodb.com/) running locally or via MongoDB Atlas

### 1. Installation & Setup

1. Clone or download the repository to your local machine.
2. Navigate to the backend directory and install dependencies:
   ```bash
   cd backend
   npm install
   ```

3. Configure Environment Variables:
    Create a `.env` file in the `backend` directory with the following variables:
    ```env
    PORT=5000
    MONGO_URI=mongodb://127.0.0.1:27017/hotel_booking
    JWT_SECRET=your_super_secret_jwt_key
    
    # Cloudinary configuration (For room image uploads)
    CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
    CLOUDINARY_API_KEY=your_cloudinary_api_key
    CLOUDINARY_API_SECRET=your_cloudinary_api_secret

    # Email Credentials (Nodemailer/Gmail SMTP)
    EMAIL_USER=your_email@gmail.com
    EMAIL_PASS=your_gmail_app_password
    ```

### 2. Running the System

1. **Start the Backend Server**:
   ```bash
   cd backend
   # Run the server directly
   node server.js
   # (or `npm start` if you add a start script to backend/package.json)
   # Server will start running on http://localhost:5000 and it also
   # serves the frontend static files and API routes under /api/*
   ```

2. **Access the Frontend**:
   Open your browser at `http://localhost:5000` — the backend serves the `frontend` folder statically.

   If you prefer to serve the frontend separately during development, you can still use a static server pointed at the `frontend` directory.

---

## 🔐 Default Roles & Accounts

When creating accounts, users are designated as `customer` by default. To create an Admin account:
1. Register a new user via the registration page.
2. Open your MongoDB database (e.g., via MongoDB Compass) and update the user's `role` field from `"customer"` to `"admin"`.
3. Log back in to access the full Admin Dashboard.

---

## 📱 Responsive & Modern Design
The system incorporates fully responsive UI principles ensuring flawless operation across desktop monitors, tablets, and mobile devices, making front-desk and remote management completely effortless.
