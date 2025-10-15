# Admin Dashboard Guide

## Quick Start

### 1. Set Admin Role (First Time Only)
Open browser console (F12) and run:
```javascript
fetch('/api/admin/set-role', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'folkmtj.one@gmail.com',
    role: 'admin',
    secretKey: 'skillscout-admin-2024'
  })
}).then(r => r.json()).then(console.log);
```

### 2. Login
- Email: folkmtj.one@gmail.com
- Use OTP sent to email

### 3. Access Admin Dashboard
Navigate to: http://localhost:3000/admin

## Features

### Tab 1: Pending Camps
- View all camps waiting for approval
- Click "View" to see details
- Approve or Reject camps

### Tab 2: All Camps
- View all camps (all statuses)
- See registration numbers
- Delete camps

### Tab 3: Users
- View all users
- Change user roles (User → Organizer → Admin)
- See registration dates

## Security
- Only users with role 'admin' can access
- Session-based authentication
- Role verification on every page load
