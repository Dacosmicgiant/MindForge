# Habit Tracker Backend

A robust REST API for a habit tracking application built with Node.js, Express, and MongoDB.

## Features

- **User Authentication**: JWT-based signup/login with secure password hashing
- **Habit Management**: Create, read, update, delete habits with categories and reminders
- **Progress Tracking**: Mark habits as complete/incomplete with historical data
- **Statistics**: Weekly progress, streaks, and completion rates
- **Data Security**: Protected routes, input validation, and rate limiting
- **MongoDB Integration**: Mongoose ODM with optimized schemas and indexes

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Validation**: Built-in Mongoose validation
- **Security**: Rate limiting, HTTP-only cookies

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local installation or Atlas account)
- npm or yarn package manager

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd habit-tracker/backend
   ```

2. **Install dependencies**

   ```bash
   npm install

   # Optional: Install CORS for frontend-backend communication
   npm install cors
   ```

3. **Environment setup**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` file with your configuration:

   ```env
   PORT=5001
   MONGODB_URI=mongodb://localhost:27017/habit_tracker
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRES_IN=7d
   CLIENT_URL=http://localhost:3000
   ```

4. **Start MongoDB**

   - Local: `mongod`
   - Or use MongoDB Atlas cloud database

5. **Run the server**

   ```bash
   # Development mode with auto-restart
   npm run dev

   # Production mode
   npm start
   ```

**Note**: If you need to enable CORS for frontend communication, uncomment the CORS middleware in `src/index.js` after installing the cors package with `npm install cors`.

The server will start on `http://localhost:5001`

## API Documentation

### Authentication Endpoints

#### POST /api/auth/signup

Create a new user account.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "name": "John Doe"
}
```

**Response:**

```json
{
  "message": "User created successfully",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "John Doe",
    "profilePicture": "",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "token": "jwt_token_here"
}
```

#### POST /api/auth/login

Authenticate user and get access token.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response:**

```json
{
  "message": "Login successful",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "John Doe",
    "profilePicture": "",
    "lastLoginAt": "2024-01-01T00:00:00.000Z"
  },
  "token": "jwt_token_here"
}
```

#### GET /api/auth/me

Get current user profile (requires authentication).

**Headers:**

```
Authorization: Bearer <token>
```

#### POST /api/auth/logout

Logout user and clear auth cookies.

### Habit Endpoints

All habit endpoints require authentication via Bearer token or cookie.

#### GET /api/habits

Get all habits for authenticated user.

**Query Parameters:**

- `includeArchived` (boolean): Include archived habits
- `category` (string): Filter by category
- `limit` (number): Results per page (default: 50)
- `page` (number): Page number (default: 1)

**Response:**

```json
{
  "message": "Habits retrieved successfully",
  "habits": [
    {
      "_id": "habit_id",
      "name": "Morning Exercise",
      "description": "30 minutes of cardio",
      "userId": "user_id",
      "reminderTime": "07:00",
      "category": "fitness",
      "difficulty": "medium",
      "color": "#3B82F6",
      "streak": 5,
      "longestStreak": 12,
      "totalCompletions": 25,
      "completedToday": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalHabits": 1,
    "hasMore": false
  }
}
```

#### POST /api/habits

Create a new habit.

**Request Body:**

```json
{
  "name": "Morning Exercise",
  "description": "30 minutes of cardio",
  "reminderTime": "07:00",
  "category": "fitness",
  "difficulty": "medium",
  "color": "#3B82F6"
}
```

#### PUT /api/habits/:id/mark

Mark or unmark a habit as completed.

**Request Body:**

```json
{
  "completed": true,
  "notes": "Felt great today!",
  "date": "2024-01-01" // Optional, defaults to today
}
```

**Response:**

```json
{
  "message": "Habit marked as completed successfully",
  "habit": {
    /* updated habit object */
  },
  "record": {
    "date": "2024-01-01T00:00:00.000Z",
    "completed": true,
    "notes": "Felt great today!"
  }
}
```

#### GET /api/habits/:id/progress

Get completion history for a specific habit.

**Query Parameters:**

- `days` (number): Number of days to include (default: 7, max: 365)

**Response:**

```json
{
  "message": "Habit progress retrieved successfully",
  "progress": {
    "habitId": "habit_id",
    "habitName": "Morning Exercise",
    "days": 7,
    "history": [
      {
        "date": "2024-01-01T00:00:00.000Z",
        "completed": true,
        "notes": "Felt great!"
      }
    ],
    "statistics": {
      "completedDays": 5,
      "totalDays": 7,
      "completionRate": 71.43,
      "currentStreak": 3,
      "longestStreak": 12,
      "totalCompletions": 25
    }
  }
}
```

#### GET /api/habits/stats

Get overall habit statistics for the user.

**Response:**

```json
{
  "message": "Habit statistics retrieved successfully",
  "stats": {
    "totalActiveHabits": 10,
    "archivedHabits": 2,
    "habitsCompletedToday": 7,
    "todayCompletionRate": 70,
    "weeklyCompletionRate": 85,
    "longestStreakOverall": 30,
    "categoriesUsed": 5
  }
}
```

### Additional Endpoints

- `PUT /api/habits/:id` - Update habit details
- `DELETE /api/habits/:id` - Delete a habit
- `PUT /api/habits/:id/archive` - Archive/unarchive a habit
- `GET /api/health` - Server health check

## Data Models

### User Schema

```javascript
{
  email: String (required, unique),
  password: String (required, hashed),
  name: String (required),
  profilePicture: String,
  isEmailVerified: Boolean,
  lastLoginAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Habit Schema

```javascript
{
  name: String (required),
  description: String,
  userId: ObjectId (required),
  reminderTime: String, // "HH:MM" format
  isActive: Boolean,
  isArchived: Boolean,
  streak: Number,
  longestStreak: Number,
  totalCompletions: Number,
  category: Enum,
  difficulty: Enum,
  color: String,
  completionRecords: [
    {
      date: Date,
      completed: Boolean,
      notes: String
    }
  ],
  createdAt: Date,
  updatedAt: Date
}
```

## Security Features

- **Password Hashing**: bcryptjs with salt rounds
- **JWT Authentication**: HTTP-only cookies + Bearer tokens
- **Rate Limiting**: Prevents abuse of auth and habit endpoints
- **Input Validation**: Mongoose schemas with custom validators
- **CORS Configuration**: Configurable allowed origins
- **Error Handling**: Comprehensive error responses

## Performance Optimizations

- **Database Indexes**: Optimized queries for user habits
- **Pagination**: Efficient data loading for large datasets
- **Aggregation**: Optimized statistics calculations
- **Connection Pooling**: Mongoose connection management

## Environment Variables

| Variable         | Description               | Default               |
| ---------------- | ------------------------- | --------------------- |
| `PORT`           | Server port               | 5001                  |
| `MONGODB_URI`    | MongoDB connection string | localhost             |
| `JWT_SECRET`     | JWT signing secret        | required              |
| `JWT_EXPIRES_IN` | Token expiration time     | 7d                    |
| `CLIENT_URL`     | Frontend URL for CORS     | http://localhost:3000 |

## Error Handling

The API returns consistent error responses:

```json
{
  "message": "Error description",
  "errors": ["Detailed error messages"],
  "statusCode": 400
}
```

Common HTTP status codes:

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error

## Development

### File Structure

```
backend/
├── src/
│   ├── controllers/     # Route handlers
│   ├── middleware/      # Auth, validation, error handling
│   ├── models/          # Mongoose schemas
│   ├── routes/          # API route definitions
│   ├── lib/             # Database connection
│   └── index.js         # Server entry point
├── package.json
└── README.md
```

### Scripts

- `npm run dev` - Development server with nodemon
- `npm start` - Production server
- `npm test` - Run tests (to be implemented)

## Deployment

### MongoDB Atlas Setup

1. Create a MongoDB Atlas account
2. Create a cluster and database
3. Get connection string and update `MONGODB_URI`
4. Whitelist your server IP

### Environment Variables for Production

```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/habit_tracker
JWT_SECRET=super-secure-secret-key
CLIENT_URL=https://your-frontend-domain.com
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
