# 🚀 Quick Start Guide

## Prerequisites
- Node.js installed
- MongoDB Atlas account (or local MongoDB)
- Code editor (VS Code recommended)
- API testing tool (Postman/Thunder Client)

## Step 1: Set Up MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new cluster (FREE tier)
4. Click "Connect" on your cluster
5. Create a database user with username and password
6. Whitelist your IP (or use 0.0.0.0/0 for all IPs)
7. Click "Choose a connection method" → "Connect your application"
8. Copy the connection string

## Step 2: Configure Environment Variables

1. Rename `.env.example` to `.env` or create a new `.env` file
2. Update the `.env` file with your values:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/financetracker?retryWrites=true&w=majority
JWT_SECRET=your_long_random_secret_key_here
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:3000
```

**Important:** Replace:
- `username` and `password` with your MongoDB credentials
- `cluster0.xxxxx` with your actual cluster URL
- `financetracker` with your database name
- Generate a secure JWT_SECRET (use a password generator)

## Step 3: Install Dependencies

```bash
npm install
```

## Step 4: Start the Server

Development mode (with auto-restart):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

You should see:
```
✅ MongoDB Connected: cluster0.xxxxx.mongodb.net
📊 Database: financetracker

╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   🚀 Finance Tracker API Server                      ║
║                                                       ║
║   📡 Server running on port 5000                     ║
║   🌍 Environment: development                        ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
```

## Step 5: Test the API

### Option 1: Using curl

```bash
# Test health check
curl http://localhost:5000/

# Register a user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Option 2: Using Postman

1. Open Postman
2. Import the collection (if provided)
3. Or manually create requests following the API documentation

### Option 3: Using Thunder Client (VS Code Extension)

1. Install Thunder Client extension in VS Code
2. Create a new request
3. Follow the API endpoints documentation

## Step 6: Test Authentication Flow

### 1. Register a User

**POST** `http://localhost:5000/api/auth/register`

Body (JSON):
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "currency": "USD"
}
```

Response:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "_id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "currency": "USD"
  }
}
```

**Copy the token!** You'll need it for authenticated requests.

### 2. Create a Transaction

**POST** `http://localhost:5000/api/transactions`

Headers:
```
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json
```

Body (JSON):
```json
{
  "type": "expense",
  "amount": 50.00,
  "category": "Food",
  "note": "Grocery shopping",
  "date": "2024-03-15"
}
```

### 3. Get All Transactions

**GET** `http://localhost:5000/api/transactions`

Headers:
```
Authorization: Bearer YOUR_TOKEN_HERE
```

### 4. Get Analytics Summary

**GET** `http://localhost:5000/api/analytics/summary`

Headers:
```
Authorization: Bearer YOUR_TOKEN_HERE
```

## Common Issues & Solutions

### Issue: MongoDB connection error
**Solution:** 
- Check your MONGO_URI is correct
- Ensure IP whitelist is configured in MongoDB Atlas
- Verify username and password are correct
- Check if password has special characters (URL encode them)

### Issue: Token invalid
**Solution:**
- Make sure you copied the full token
- Token format: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- Check JWT_SECRET is set in .env

### Issue: Port already in use
**Solution:**
- Change PORT in .env to another port (e.g., 5001)
- Or kill the process using port 5000

### Issue: Validation errors
**Solution:**
- Check request body matches the required format
- Ensure all required fields are present
- Verify data types (numbers, strings, dates)

## Next Steps

1. ✅ Create more users
2. ✅ Add income and expense transactions
3. ✅ Set up monthly budgets
4. ✅ View analytics and insights
5. ✅ Test all API endpoints
6. ✅ Build a frontend application
7. ✅ Deploy to production (Render, Railway, etc.)

## Available Categories

**Income Categories:**
- Salary
- Investment
- Business
- Other

**Expense Categories:**
- Food
- Travel
- Rent
- Shopping
- Health
- Entertainment
- Education
- Utilities
- Transportation
- Insurance
- Savings
- Other

## Supported Currencies

- USD (US Dollar)
- EUR (Euro)
- GBP (British Pound)
- INR (Indian Rupee)
- JPY (Japanese Yen)
- CAD (Canadian Dollar)
- AUD (Australian Dollar)

## Pro Tips

1. **Use query parameters** for filtering transactions:
   - `?type=expense`
   - `?category=Food`
   - `?startDate=2024-01-01&endDate=2024-12-31`
   - `?page=1&limit=10`

2. **Check the logs** in the terminal to debug issues

3. **Use environment-specific configs** - keep separate .env files for dev/prod

4. **Test with realistic data** - add multiple transactions to see analytics work

5. **Secure your JWT_SECRET** - use a long, random string in production

## Need Help?

- Check the README.md for full documentation
- Review API_DOCUMENTATION.md for all endpoints
- Look at the code comments for implementation details
- Check terminal output for error messages

Happy Coding! 🎉
