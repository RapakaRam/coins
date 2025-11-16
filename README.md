# 🪙 Coin Collector App

A full-stack web application for collecting and organizing coins by continent and country. Built with Express, React, and MongoDB.

## ⚠️ IMPORTANT: MongoDB Connection Required

**Before starting the backend, you MUST:**

1. Create a `.env` file in the `backend` directory
2. Add your MongoDB connection string: `MONGO_URI=mongodb://localhost:27017/coin-collector`
3. See [Backend Setup](#backend-setup) section below for detailed instructions

> 💡 **Quick Setup**: `cd backend && cp env.example .env` then edit `.env` with your connection string

## 📋 Features

- **User Authentication**: JWT-based login and registration
- **Dynamic Continents & Countries**: Stored in MongoDB, not hardcoded
- **Coin Upload**: Upload coin images as Base64 strings
- **Visual Indicators**: Countries with coins appear green, empty countries appear gray
- **Gallery View**: Browse coins by country with modal image viewer
- **Responsive Design**: Modern UI with smooth animations

## 🛠️ Tech Stack

### Backend

- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- bcrypt for password hashing

### Frontend

- React + React Router
- Axios for API calls
- Tailwind CSS for styling

## 📁 Project Structure

```
coin-collector-app/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Coin.js
│   │   └── Location.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── coinRoutes.js
│   │   └── locationRoutes.js
│   ├── scripts/
│   │   └── seedLocations.js
│   ├── server.js
│   └── package.json
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   ├── ContinentAccordion.jsx
    │   │   ├── CountryButton.jsx
    │   │   └── ImageModal.jsx
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Home.jsx
    │   │   ├── AddCoin.jsx
    │   │   └── Gallery.jsx
    │   ├── services/
    │   │   └── api.js
    │   ├── App.jsx
    │   ├── App.css
    │   ├── index.jsx
    │   └── index.css
    └── package.json
```

## 🚀 Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:

```bash
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the backend directory:

**Option A: Copy from example file**

```bash
cp env.example .env
```

**Option B: Create manually**

Create a file named `.env` in the `backend` directory with:

```env
# MongoDB Connection String (REQUIRED)
# For local MongoDB:
MONGO_URI=mongodb://localhost:27017/coin-collector

# For MongoDB Atlas (cloud):
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/coin-collector?retryWrites=true&w=majority

# JWT Secret Key (REQUIRED - change this in production!)
JWT_SECRET=your-secret-key-change-this-in-production

# Server Port (optional, defaults to 5000)
PORT=5000
```

**Important Connection String Formats:**

- **Local MongoDB**: `mongodb://localhost:27017/coin-collector`
- **MongoDB Atlas**: `mongodb+srv://username:password@cluster.mongodb.net/coin-collector?retryWrites=true&w=majority`
- **Custom MongoDB**: `mongodb://username:password@host:port/database-name`

4. Start MongoDB (if running locally):

```bash
# macOS (using Homebrew)
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Windows
net start MongoDB
```

5. (Optional) Initialize database indexes:

```bash
npm run init-db
```

6. Seed the database with continents and countries:

```bash
npm run seed
```

7. Start the backend server:

```bash
npm start
# or for development with auto-reload
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the frontend directory (optional):

```env
REACT_APP_API_URL=http://localhost:5000/api
```

4. Start the development server:

```bash
npm start
```

The frontend will run on `http://localhost:3000`

## 📡 API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user

### Locations

- `POST /api/locations/continent` - Create a continent
- `POST /api/locations/country` - Create a country
- `GET /api/locations/continents` - Get all continents
- `GET /api/locations/:continentId/countries` - Get countries for a continent
- `GET /api/locations/:id` - Get a location by ID

### Coins (Requires Authentication)

- `POST /api/coins/upload` - Upload a new coin
- `GET /api/coins/:countryId` - Get coins for a country
- `GET /api/coins/summary` - Get summary of countries with coins

## 🧪 Testing with Postman

### Import Postman Collection

1. Open Postman
2. Import the collection file: `postman/Coin-Collector-API.postman_collection.json`
3. Set up environment variables:
   - `base_url`: `http://localhost:5000/api`
   - `token`: (will be set automatically after login)

### Test Flow

1. **Register a new user**:

   - POST `/api/auth/register`
   - Body: `{ "email": "test@example.com", "password": "password123" }`

2. **Login**:

   - POST `/api/auth/login`
   - Body: `{ "email": "test@example.com", "password": "password123" }`
   - Copy the token from response

3. **Get continents**:

   - GET `/api/locations/continents`
   - No auth required

4. **Get countries for a continent**:

   - GET `/api/locations/:continentId/countries`
   - Replace `:continentId` with an actual continent ID

5. **Upload a coin**:

   - POST `/api/coins/upload`
   - Headers: `Authorization: Bearer <token>`
   - Body:
     ```json
     {
       "continentId": "...",
       "countryId": "...",
       "imageBase64": "BASE64_STRING_HERE"
     }
     ```

6. **Get coins for a country**:

   - GET `/api/coins/:countryId`
   - Headers: `Authorization: Bearer <token>`

7. **Get coin summary**:
   - GET `/api/coins/summary`
   - Headers: `Authorization: Bearer <token>`

## 🗄️ Database Models

### User

```javascript
{
  email: String (required, unique),
  passwordHash: String (required),
  createdAt: Date
}
```

### Location

```javascript
{
  name: String (required),
  type: String (enum: ["continent", "country"]),
  parent: ObjectId (ref: "Location", null for continents),
  displayOrder: Number
}
```

### Coin

```javascript
{
  userId: ObjectId (ref: "User", required),
  continentId: ObjectId (ref: "Location", required),
  countryId: ObjectId (ref: "Location", required),
  imageBase64: String (required),
  uploadedAt: Date
}
```

## 📊 MongoDB Collections

**Important**: MongoDB doesn't use "tables" like SQL databases. Instead, it uses **collections**, which are created automatically when you first insert a document.

### Collections in this app:

1. **`users`** - Created automatically when you register/login
2. **`locations`** - Created automatically when you run the seed script
3. **`coins`** - Created automatically when you upload your first coin

### No manual setup required!

- Collections are created automatically by Mongoose when you save the first document
- You don't need to manually create "tables" or collections
- The `init-db` script (optional) creates indexes for better performance but doesn't create collections

### To verify collections exist:

```bash
# Connect to MongoDB
mongosh

# Switch to your database
use coin-collector

# List all collections
show collections

# View documents in a collection
db.users.find()
db.locations.find()
db.coins.find()
```

## 🌍 Continent Display Order

Continents are displayed in this exact order:

1. Africa
2. Asia
3. Europe
4. North America
5. South America
6. Oceania
7. Antarctica

This order is stored in MongoDB via the `displayOrder` field.

## 📝 Usage

1. **Login/Register**: Start by creating an account or logging in
2. **Browse Continents**: Click on a continent to expand and see countries
3. **View Countries**: Countries with coins appear green, empty countries appear gray
4. **View Gallery**: Click on a country to see all coins uploaded for that country
5. **Add Coins**: Use the "Add Coin" button to upload new coins with images

## 🔒 Security Notes

- Passwords are hashed using bcrypt
- JWT tokens expire after 7 days
- All coin routes require authentication
- CORS is enabled for development (configure for production)

## 🐛 Troubleshooting

### MongoDB Connection Issues

- Ensure MongoDB is running
- Check the `MONGO_URI` in `.env` file
- Verify MongoDB is accessible on the specified port

### CORS Errors

- Ensure backend is running on port 5000
- Check `REACT_APP_API_URL` in frontend `.env`

### Image Upload Issues

- Ensure image is converted to Base64 correctly
- Check that Base64 string doesn't include the data URL prefix (e.g., `data:image/jpeg;base64,`)

## 📄 License

This project is open source and available for personal use.

## 👨‍💻 Development

### Running in Development Mode

Backend with auto-reload:

```bash
cd backend
npm run dev
```

Frontend with hot-reload:

```bash
cd frontend
npm start
```

### Building for Production

Frontend:

```bash
cd frontend
npm run build
```

The build folder will contain the production-ready static files.

---

**Happy Coin Collecting! 🪙**
