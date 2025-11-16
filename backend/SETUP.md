# 🔧 Backend Setup Guide

## MongoDB Connection String Setup

### Step 1: Create `.env` file

Create a `.env` file in the `backend` directory:

```bash
cd backend
cp env.example .env
```

### Step 2: Configure MongoDB Connection

Edit the `.env` file and set your `MONGO_URI`. Choose one:

#### Option A: Local MongoDB (Default)

If you have MongoDB installed locally:

```env
MONGO_URI=mongodb://localhost:27017/coin-collector
```

**Make sure MongoDB is running:**

- macOS: `brew services start mongodb-community`
- Linux: `sudo systemctl start mongod`
- Windows: `net start MongoDB`

#### Option B: MongoDB Atlas (Cloud)

If you're using MongoDB Atlas (free tier available):

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create a database user
4. Get your connection string
5. Update `.env`:

```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/coin-collector?retryWrites=true&w=majority
```

Replace:

- `username` with your database username
- `password` with your database password
- `cluster` with your cluster name

#### Option C: Custom MongoDB Server

```env
MONGO_URI=mongodb://username:password@host:port/database-name
```

### Step 3: Set JWT Secret

Generate a random secret key for JWT tokens:

```env
JWT_SECRET=your-random-secret-key-here
```

**For production**, use a strong random string:

```bash
# Generate a random secret (Linux/Mac)
openssl rand -base64 32

# Or use an online generator
```

### Step 4: Verify Setup

Your `.env` file should look like:

```env
MONGO_URI=mongodb://localhost:27017/coin-collector
JWT_SECRET=your-secret-key-change-this-in-production
PORT=5000
```

### Step 5: Test Connection

```bash
npm run init-db
```

If successful, you'll see:

```
✅ MongoDB Connected
✅ Database initialization complete!
```

### Troubleshooting

**Error: "MongoServerError: Authentication failed"**

- Check your username and password in the connection string
- For Atlas: Make sure your IP is whitelisted

**Error: "MongooseServerSelectionError: connect ECONNREFUSED"**

- MongoDB is not running (for local setup)
- Check the connection string format
- Verify the port number (default: 27017)

**Error: "MongoNetworkError: failed to connect"**

- Check your internet connection (for Atlas)
- Verify firewall settings
- Check if MongoDB service is running

### Next Steps

After setting up the connection string:

1. Seed the database: `npm run seed`
2. Start the server: `npm start`
3. Test the API: `curl http://localhost:5000/api/health`
