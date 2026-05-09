# PlayInGround Backend - Node.js/Express

Complete backend API for the PlayInGround booking platform, built with Node.js, Express, and MongoDB.

## 🚀 Features

- User authentication (JWT)
- Ground booking system
- Availability management
- Admin panel for schedule requests
- Idempotency protection
- CORS enabled

## 📋 Prerequisites

- Node.js 18+ 
- MongoDB Atlas account
- npm or yarn

## 🛠️ Installation

```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Update .env with your MongoDB URI and JWT secret
```

## 🏃 Running Locally

```bash
# Development mode
npm start

# The server will run on http://localhost:8000
```

## 📚 API Endpoints

### Authentication
- `POST /auth/signup` - Register new user
- `POST /auth/login` - Login user

### Bookings
- `POST /bookings` - Create booking
- `GET /bookings/my-bookings` - Get user's bookings
- `GET /bookings/:id` - Get booking by ID
- `DELETE /bookings/:id` - Cancel booking

### Grounds
- `GET /grounds` - Get all grounds
- `GET /grounds/:id` - Get ground by ID
- `GET /grounds/locations` - Get unique locations
- `POST /grounds` - Create ground (Owner only)

### Availability
- `GET /grounds/:id/availability` - Get ground availability
- `POST /grounds/:id/availability` - Set availability (Owner only)
- `POST /grounds/:id/block-date` - Block date (Owner only)
- `POST /grounds/:id/request-hours-change` - Request custom hours (Owner only)

### Admin
- `GET /admin/schedule-requests` - Get pending requests
- `PUT /admin/schedule-requests/:id/approve` - Approve request
- `PUT /admin/schedule-requests/:id/reject` - Reject request

## 🐳 Docker

```bash
# Build image
docker build -t playinground-backend .

# Run container
docker run -p 8000:8000 --env-file .env playinground-backend
```

## 🌐 Deployment

### Render
1. Push code to GitHub
2. Connect repository to Render
3. Set environment variables in Render dashboard
4. Deploy

## 📝 Environment Variables

```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
PORT=8000
NODE_ENV=production
```

## 🔒 Security

- Passwords hashed with bcrypt
- JWT tokens for authentication
- CORS configured
- Input validation

## 📦 Tech Stack

- **Runtime**: Node.js 18
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Authentication**: JWT + bcrypt
- **CORS**: cors middleware

## 👥 Roles

- **Player**: Book grounds
- **Owner**: Manage grounds and availability
- **Admin**: Approve schedule changes

## 📄 License

MIT
