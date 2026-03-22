# 🚀 Finance Tracker SaaS - Complete Setup Guide

## Overview

This guide will help you run both the **backend** (Node.js/Express/MongoDB) and **frontend** (React/Vite) applications together.

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: v18 or higher ([Download](https://nodejs.org/))
- **MongoDB**: Running instance (local or cloud) ([MongoDB Atlas](https://www.mongodb.com/cloud/atlas))
- **npm** or **yarn**: Package manager (comes with Node.js)
- **Git**: For version control (optional)

---

## 🎯 Quick Start (TL;DR)

```bash
# Terminal 1 - Backend
cd finance-tracker-backend
npm install
# Create .env file with your MongoDB URI
npm start

# Terminal 2 - Frontend
cd finance-tracker-frontend
npm install
npm run dev
```

Access the application at: **http://localhost:3000**

---

## 📦 Step-by-Step Setup

### Step 1: Setup Backend

#### 1.1 Navigate to Backend Directory
```bash
cd finance-tracker-backend
```

#### 1.2 Install Dependencies
```bash
npm install
```

This installs:
- express, mongoose, bcryptjs, jsonwebtoken
- express-validator, cookie-parser, cors, helmet, morgan
- dotenv, colors

#### 1.3 Configure Environment Variables

Create a `.env` file in the backend root:

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/finance-tracker
# Or use MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/finance-tracker

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=30d

# Cookie Configuration
COOKIE_EXPIRE=30
```

**⚠️ Important**: Change `JWT_SECRET` to a random string in production!

#### 1.4 Start MongoDB

**Option A: Local MongoDB**
```bash
# Windows
mongod

# macOS/Linux
sudo systemctl start mongod
```

**Option B: MongoDB Atlas** (Cloud)
- Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- Create a cluster
- Get connection string
- Add to `.env` as `MONGODB_URI`

#### 1.5 Start Backend Server
```bash
npm start
```

You should see:
```
✓ Server running in development mode on port 5000
✓ MongoDB Connected: localhost
```

Backend is now running at: **http://localhost:5000**

---

### Step 2: Setup Frontend

#### 2.1 Navigate to Frontend Directory
```bash
cd finance-tracker-frontend
```

#### 2.2 Install Dependencies
```bash
npm install
```

This installs:
- react, react-dom, react-router-dom
- axios, recharts, react-icons
- tailwindcss, react-hot-toast, date-fns

#### 2.3 Configure Environment Variables

The `.env` file should already exist with:

```env
VITE_API_URL=http://localhost:5000/api
```

If not, create it or verify the API URL is correct.

#### 2.4 Start Development Server
```bash
npm run dev
```

You should see:
```
VITE v5.0.8  ready in 500 ms

➜  Local:   http://localhost:3000/
➜  Network: use --host to expose
```

Frontend is now running at: **http://localhost:3000**

---

## 🎮 Using the Application

### First Time Setup

1. **Open your browser** and navigate to: `http://localhost:3000`

2. **Register a new account**:
   - Click "Register" or navigate to `/register`
   - Fill in your details:
     - Name: Your Name
     - Email: your@email.com
     - Password: Strong password (min 6 characters)
     - Currency: USD, EUR, GBP, etc.
   - Click "Register"

3. **Login**:
   - You'll be redirected to the dashboard
   - Or go to `/login` and enter your credentials

4. **Explore the features**:
   - **Dashboard**: View your financial overview
   - **Transactions**: Add income/expense transactions
   - **Budgets**: Set monthly budgets
   - **Analytics**: View spending patterns

---

## 🧪 Testing the Application

### Test Authentication

#### Register New User
```bash
# Using curl (Terminal)
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "currency": "USD"
  }'
```

#### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Test Transactions

#### Create Transaction
```bash
curl -X POST http://localhost:5000/api/transactions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "type": "expense",
    "category": "Food",
    "amount": 50.00,
    "date": "2024-01-10",
    "note": "Dinner"
  }'
```

### Test Budgets

#### Create Budget
```bash
curl -X POST http://localhost:5000/api/budgets \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "category": "Food",
    "limit": 500,
    "month": 1,
    "year": 2024
  }'
```

---

## 📱 Application Features

### 1. Dashboard
- **Overview Cards**: Total income, expenses, balance, savings rate
- **Charts**: 
  - Pie chart showing spending by category
  - Line chart showing monthly income vs expenses
- **Recent Transactions**: Last 5 transactions
- **Real-time Updates**: Data refreshes automatically

### 2. Transactions
- **Add Transaction**: 
  - Toggle between income/expense
  - Select category from dropdown
  - Enter amount, date, and optional note
- **View Transactions**: Table with all transactions
- **Edit/Delete**: Inline actions for each transaction
- **Filters**: Filter by type, category, date range
- **Pagination**: Navigate through large datasets

### 3. Budgets
- **Create Budget**: 
  - Select category
  - Set monthly limit
  - Choose month and year
- **View Budgets**: Cards showing:
  - Budget limit
  - Amount spent
  - Remaining amount
  - Progress bar with color coding
- **Status Indicators**:
  - 🟢 Green: < 80% spent
  - 🟡 Yellow: 80-100% spent
  - 🔴 Red: > 100% (exceeded)

### 4. Analytics
- **Date Range Filter**: Select custom date range
- **Charts**:
  - Category spending pie chart
  - Category bar chart
  - Monthly trend line chart (income vs expense)
- **Summary Stats**: Total income, expense, net savings

---

## 🔧 Development Tips

### Watching for Changes

Both servers support hot reload:
- **Backend**: Uses `nodemon` - auto-restarts on file changes
- **Frontend**: Uses Vite HMR - instant updates without refresh

### Development Workflow

1. **Backend changes**: 
   - Edit files in `finance-tracker-backend/`
   - Server auto-restarts
   - Refresh browser to see changes

2. **Frontend changes**:
   - Edit files in `finance-tracker-frontend/src/`
   - Changes appear instantly in browser
   - No refresh needed

### Checking Logs

**Backend logs** (Terminal 1):
- HTTP requests (via Morgan)
- Database connection status
- Error messages

**Frontend logs** (Browser Console):
- API calls
- State changes
- Error messages

---

## 🐛 Troubleshooting

### Backend Issues

#### Error: "MongoDB connection failed"
**Solution**:
- Check if MongoDB is running
- Verify `MONGODB_URI` in `.env`
- Check MongoDB logs

#### Error: "Port 5000 is already in use"
**Solution**:
```bash
# Find process using port 5000
netstat -ano | findstr :5000  # Windows
lsof -i :5000                  # macOS/Linux

# Kill the process or change PORT in .env
```

#### Error: "JWT_SECRET is not defined"
**Solution**:
- Create `.env` file in backend root
- Add `JWT_SECRET=your_secret_key`

### Frontend Issues

#### Error: "Failed to fetch"
**Solution**:
- Ensure backend is running on port 5000
- Check `VITE_API_URL` in `.env`
- Verify CORS is enabled in backend

#### Error: "Cannot find module"
**Solution**:
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### Blank screen after login
**Solution**:
- Open browser DevTools (F12)
- Check Console for errors
- Verify API responses in Network tab

### Database Issues

#### Error: "Database seeding fails"
**Solution**:
```bash
# Clear existing data
mongo finance-tracker --eval "db.dropDatabase()"

# Or use MongoDB Compass to manually delete collections
```

---

## 🚢 Production Deployment

### Backend Deployment

**Recommended Platforms**:
- Heroku
- AWS Elastic Beanstalk
- DigitalOcean App Platform
- Render

**Environment Variables** (Production):
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=your_production_mongodb_uri
JWT_SECRET=strong_random_secret_key
JWT_EXPIRE=7d
COOKIE_EXPIRE=7
```

**Build Command**:
```bash
npm install --production
npm start
```

### Frontend Deployment

**Recommended Platforms**:
- Vercel (recommended for React)
- Netlify
- AWS S3 + CloudFront
- GitHub Pages

**Environment Variables** (Production):
```env
VITE_API_URL=https://your-backend-domain.com/api
```

**Build Command**:
```bash
npm run build
```

**Output Directory**: `dist/`

---

## 📊 API Endpoints Reference

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Transactions
- `GET /api/transactions` - List all transactions
- `POST /api/transactions` - Create transaction
- `GET /api/transactions/:id` - Get single transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction

### Budgets
- `GET /api/budgets` - List all budgets
- `POST /api/budgets` - Create budget
- `GET /api/budgets/:id` - Get single budget
- `PUT /api/budgets/:id` - Update budget
- `DELETE /api/budgets/:id` - Delete budget

### Analytics
- `GET /api/analytics/category` - Category-wise spending
- `GET /api/analytics/monthly` - Monthly income/expense trends

---

## 🔐 Security Considerations

### For Development
- ✅ CORS enabled for localhost:3000
- ✅ JWT tokens with expiration
- ✅ Password hashing with bcrypt
- ✅ Input validation with express-validator
- ✅ Helmet for security headers

### For Production
- ⚠️ Change `JWT_SECRET` to strong random value
- ⚠️ Use HTTPS for all connections
- ⚠️ Update CORS to allow only production domain
- ⚠️ Enable rate limiting
- ⚠️ Use environment variables for secrets
- ⚠️ Set secure cookie flags
- ⚠️ Implement refresh tokens

---

## 📂 Project Structure

```
fin-edge/
├── finance-tracker-backend/
│   ├── config/             # Configuration files
│   ├── controllers/        # Request handlers
│   ├── middleware/         # Custom middleware
│   ├── models/            # Mongoose models
│   ├── routes/            # API routes
│   ├── utils/             # Utility functions
│   ├── .env               # Environment variables
│   ├── server.js          # Entry point
│   └── package.json       # Dependencies
│
└── finance-tracker-frontend/
    ├── src/
    │   ├── api/           # API integration
    │   ├── components/    # React components
    │   ├── context/       # Context providers
    │   ├── hooks/         # Custom hooks
    │   ├── pages/         # Page components
    │   ├── routes/        # Route protection
    │   ├── utils/         # Utilities
    │   ├── App.jsx        # Main component
    │   └── main.jsx       # Entry point
    ├── .env               # Environment variables
    ├── index.html         # HTML template
    ├── package.json       # Dependencies
    └── vite.config.js     # Vite configuration
```

---

## 🎓 Learning Resources

### Backend
- [Express.js Documentation](https://expressjs.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [JWT.io](https://jwt.io/)

### Frontend
- [React Documentation](https://react.dev/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Recharts Documentation](https://recharts.org/)

---

## ✅ Verification Checklist

Before considering setup complete:

- [ ] Backend server running on port 5000
- [ ] Frontend server running on port 3000
- [ ] MongoDB connected successfully
- [ ] Can register new user
- [ ] Can login with credentials
- [ ] Dashboard loads with no errors
- [ ] Can create transactions
- [ ] Can create budgets
- [ ] Charts render correctly
- [ ] No console errors
- [ ] API calls successful (check Network tab)

---

## 📞 Need Help?

If you encounter issues:

1. **Check the logs**: Both terminal windows for errors
2. **Browser DevTools**: Console and Network tabs
3. **Verify prerequisites**: Node.js, MongoDB versions
4. **Review environment variables**: Check both `.env` files
5. **Clear cache**: Browser cache and localStorage
6. **Restart servers**: Stop and start both applications

---

## 🎉 Success!

If you see the Dashboard with your financial overview, you're all set! 🚀

**Start tracking your finances:**
1. Add some transactions
2. Set monthly budgets
3. View your spending patterns in Analytics

---

**Built with ❤️ using Node.js, Express, MongoDB, React, and Vite**

**Happy Tracking! 💰📊**
