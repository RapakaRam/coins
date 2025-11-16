# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### 1. Start MongoDB

```bash
# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Windows
net start MongoDB
```

### 2. Setup Backend

```bash
cd backend
npm install

# Create .env file with MongoDB connection string
cp env.example .env

# Edit .env file - IMPORTANT: Set your MongoDB connection string!
# For local MongoDB: MONGO_URI=mongodb://localhost:27017/coin-collector
# For MongoDB Atlas: MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/coin-collector

npm run init-db  # (Optional) Initialize database indexes
npm run seed     # Seed continents and countries
npm start
```

### 3. Setup Frontend (in a new terminal)

```bash
cd frontend
npm install
npm start
```

### 4. Access the App

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

### 5. First Steps

1. Register a new account at the login page
2. Browse continents and countries
3. Click "Add Coin" to upload your first coin
4. Click on a country to view its coin gallery

## 📝 Environment Variables

### Backend (.env)

```
MONGO_URI=mongodb://localhost:27017/coin-collector
JWT_SECRET=your-secret-key-change-this-in-production
PORT=5000
```

### Frontend (.env - optional)

```
REACT_APP_API_URL=http://localhost:5000/api
```

## 🧪 Test the API

Import the Postman collection from `postman/Coin-Collector-API.postman_collection.json` and test all endpoints.

## 🐛 Troubleshooting

**MongoDB not connecting?**

- Ensure MongoDB is running
- Check your MONGO_URI in backend/.env

**CORS errors?**

- Make sure backend is running on port 5000
- Check REACT_APP_API_URL in frontend/.env

**Can't see continents?**

- Run `npm run seed` in the backend directory

---

For detailed documentation, see [README.md](README.md)
