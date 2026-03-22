# API Documentation

Complete API reference for the Finance Tracker Backend.

## Base URL

```
http://localhost:5000
```

## Authentication

Most endpoints require authentication using JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <token>
```

---

## 📍 Authentication Endpoints

### Register User

Create a new user account.

**Endpoint:** `POST /api/auth/register`

**Access:** Public

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "currency": "USD"  // Optional, default: USD
}
```

**Validation Rules:**
- name: 2-50 characters, required
- email: Valid email format, required, unique
- password: Minimum 6 characters, required
- currency: One of [USD, EUR, GBP, INR, JPY, CAD, AUD]

**Success Response (201):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "_id": "65f8a4b5c2e1234567890abc",
    "name": "John Doe",
    "email": "john@example.com",
    "currency": "USD",
    "createdAt": "2024-03-15T10:30:00.000Z",
    "updatedAt": "2024-03-15T10:30:00.000Z"
  }
}
```

---

### Login User

Authenticate and receive a JWT token.

**Endpoint:** `POST /api/auth/login`

**Access:** Public

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "_id": "65f8a4b5c2e1234567890abc",
    "name": "John Doe",
    "email": "john@example.com",
    "currency": "USD"
  }
}
```

**Error Response (401):**
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

---

### Get Current User

Get the profile of the currently logged-in user.

**Endpoint:** `GET /api/auth/me`

**Access:** Private (requires authentication)

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "65f8a4b5c2e1234567890abc",
    "name": "John Doe",
    "email": "john@example.com",
    "currency": "USD",
    "createdAt": "2024-03-15T10:30:00.000Z",
    "updatedAt": "2024-03-15T10:30:00.000Z"
  }
}
```

---

### Update User Profile

Update user information.

**Endpoint:** `PUT /api/auth/updateprofile`

**Access:** Private

**Request Body:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "currency": "EUR"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "65f8a4b5c2e1234567890abc",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "currency": "EUR"
  }
}
```

---

### Logout User

Clear the authentication cookie.

**Endpoint:** `POST /api/auth/logout`

**Access:** Private

**Success Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully",
  "data": {}
}
```

---

## 💰 Transaction Endpoints

### Create Transaction

Add a new income or expense transaction.

**Endpoint:** `POST /api/transactions`

**Access:** Private

**Request Body:**
```json
{
  "type": "expense",
  "amount": 50.00,
  "category": "Food",
  "note": "Grocery shopping",
  "date": "2024-03-15"  // Optional, defaults to current date
}
```

**Validation Rules:**
- type: "income" or "expense", required
- amount: Positive number, required
- category: Valid category from the list, required
- note: Max 200 characters, optional
- date: ISO 8601 date format, optional

**Available Categories:**
- Income: Salary, Investment, Business, Other
- Expense: Food, Travel, Rent, Shopping, Health, Entertainment, Education, Utilities, Transportation, Insurance, Savings, Other

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "_id": "65f8a6c3d4e1234567890def",
    "userId": "65f8a4b5c2e1234567890abc",
    "type": "expense",
    "amount": 50,
    "category": "Food",
    "note": "Grocery shopping",
    "date": "2024-03-15T00:00:00.000Z",
    "createdAt": "2024-03-15T11:00:00.000Z",
    "updatedAt": "2024-03-15T11:00:00.000Z"
  }
}
```

---

### Get All Transactions

Retrieve all transactions with filtering, pagination, and sorting.

**Endpoint:** `GET /api/transactions`

**Access:** Private

**Query Parameters:**
- `type` - Filter by type (income/expense)
- `category` - Filter by category
- `startDate` - Filter from date (YYYY-MM-DD)
- `endDate` - Filter to date (YYYY-MM-DD)
- `page` - Page number (default: 1)
- `limit` - Results per page (default: 10)
- `sort` - Sort field (default: -date for newest first)

**Examples:**
```
GET /api/transactions
GET /api/transactions?type=expense
GET /api/transactions?category=Food
GET /api/transactions?startDate=2024-01-01&endDate=2024-12-31
GET /api/transactions?page=2&limit=20
GET /api/transactions?type=expense&category=Food&sort=-amount
```

**Success Response (200):**
```json
{
  "success": true,
  "count": 10,
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalTransactions": 50,
    "limit": 10
  },
  "data": [
    {
      "_id": "65f8a6c3d4e1234567890def",
      "userId": "65f8a4b5c2e1234567890abc",
      "type": "expense",
      "amount": 50,
      "category": "Food",
      "note": "Grocery shopping",
      "date": "2024-03-15T00:00:00.000Z"
    }
    // ... more transactions
  ]
}
```

---

### Get Single Transaction

Retrieve details of a specific transaction.

**Endpoint:** `GET /api/transactions/:id`

**Access:** Private

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "65f8a6c3d4e1234567890def",
    "userId": "65f8a4b5c2e1234567890abc",
    "type": "expense",
    "amount": 50,
    "category": "Food",
    "note": "Grocery shopping",
    "date": "2024-03-15T00:00:00.000Z"
  }
}
```

---

### Update Transaction

Update an existing transaction.

**Endpoint:** `PUT /api/transactions/:id`

**Access:** Private

**Request Body:**
```json
{
  "amount": 75.00,
  "note": "Updated grocery shopping"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "65f8a6c3d4e1234567890def",
    "amount": 75,
    "note": "Updated grocery shopping"
    // ... other fields
  }
}
```

---

### Delete Transaction

Delete a transaction.

**Endpoint:** `DELETE /api/transactions/:id`

**Access:** Private

**Success Response (200):**
```json
{
  "success": true,
  "message": "Transaction deleted successfully",
  "data": {}
}
```

---

## 📊 Budget Endpoints

### Create Budget

Set a monthly budget for a category.

**Endpoint:** `POST /api/budgets`

**Access:** Private

**Request Body:**
```json
{
  "category": "Food",
  "limit": 500,
  "month": 3,
  "year": 2024
}
```

**Validation Rules:**
- category: Valid expense category, required
- limit: Positive number, required
- month: Integer 1-12, required
- year: Integer 2000-2100, required

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "_id": "65f8a8d5e6f1234567890ghi",
    "userId": "65f8a4b5c2e1234567890abc",
    "category": "Food",
    "limit": 500,
    "month": 3,
    "year": 2024,
    "createdAt": "2024-03-15T12:00:00.000Z",
    "updatedAt": "2024-03-15T12:00:00.000Z"
  }
}
```

---

### Get All Budgets

Retrieve all budgets with spending information.

**Endpoint:** `GET /api/budgets`

**Access:** Private

**Query Parameters:**
- `month` - Filter by month (1-12)
- `year` - Filter by year

**Examples:**
```
GET /api/budgets
GET /api/budgets?month=3&year=2024
```

**Success Response (200):**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "_id": "65f8a8d5e6f1234567890ghi",
      "userId": "65f8a4b5c2e1234567890abc",
      "category": "Food",
      "limit": 500,
      "month": 3,
      "year": 2024,
      "spent": 350.50,
      "remaining": 149.50,
      "percentageUsed": 70.10,
      "status": "good"  // "good", "warning" (>80%), or "exceeded" (>100%)
    }
    // ... more budgets
  ]
}
```

---

### Get Single Budget

**Endpoint:** `GET /api/budgets/:id`

**Access:** Private

---

### Update Budget

**Endpoint:** `PUT /api/budgets/:id`

**Access:** Private

**Request Body:**
```json
{
  "limit": 600
}
```

---

### Delete Budget

**Endpoint:** `DELETE /api/budgets/:id`

**Access:** Private

---

## 📈 Analytics Endpoints

### Get Financial Summary

Get overview of income, expenses, and balance.

**Endpoint:** `GET /api/analytics/summary`

**Access:** Private

**Query Parameters:**
- `startDate` - Start date (YYYY-MM-DD)
- `endDate` - End date (YYYY-MM-DD)

If no dates provided, defaults to current month.

**Example:**
```
GET /api/analytics/summary
GET /api/analytics/summary?startDate=2024-01-01&endDate=2024-12-31
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "totalIncome": 5000,
    "totalExpense": 3500,
    "balance": 1500,
    "savingsRate": 30.00,
    "incomeTransactions": 5,
    "expenseTransactions": 45,
    "period": {
      "startDate": "2024-03-01T00:00:00.000Z",
      "endDate": "2024-03-31T23:59:59.000Z"
    }
  }
}
```

---

### Get Category Analytics

Get spending breakdown by category.

**Endpoint:** `GET /api/analytics/category`

**Access:** Private

**Query Parameters:**
- `type` - Transaction type (income/expense), default: expense
- `startDate` - Start date
- `endDate` - End date

**Example:**
```
GET /api/analytics/category
GET /api/analytics/category?type=expense&startDate=2024-01-01&endDate=2024-12-31
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "type": "expense",
    "categories": [
      {
        "category": "Food",
        "total": 1200,
        "count": 25,
        "avgAmount": 48,
        "percentage": 34.29
      },
      {
        "category": "Travel",
        "total": 800,
        "count": 8,
        "avgAmount": 100,
        "percentage": 22.86
      }
      // ... more categories
    ],
    "total": 3500,
    "period": {
      "startDate": "2024-03-01T00:00:00.000Z",
      "endDate": "2024-03-31T23:59:59.000Z"
    }
  }
}
```

---

### Get Monthly Analytics

Get monthly income/expense trends for a year.

**Endpoint:** `GET /api/analytics/monthly`

**Access:** Private

**Query Parameters:**
- `year` - Year (default: current year)
- `months` - Number of months (default: 12)

**Example:**
```
GET /api/analytics/monthly
GET /api/analytics/monthly?year=2024
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "year": 2024,
    "months": [
      {
        "month": 1,
        "monthName": "Jan",
        "income": 5000,
        "expense": 3000,
        "balance": 2000,
        "transactions": 30
      },
      {
        "month": 2,
        "monthName": "Feb",
        "income": 5500,
        "expense": 3200,
        "balance": 2300,
        "transactions": 35
      }
      // ... all 12 months
    ],
    "yearTotals": {
      "income": 60000,
      "expense": 42000,
      "balance": 18000
    }
  }
}
```

---

### Get Spending Trends

Get 6-month spending trends.

**Endpoint:** `GET /api/analytics/trends`

**Access:** Private

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": {
        "year": 2024,
        "month": 1,
        "type": "income"
      },
      "total": 5000
    },
    {
      "_id": {
        "year": 2024,
        "month": 1,
        "type": "expense"
      },
      "total": 3000
    }
    // ... more data
  ]
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Please provide a valid email"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Not authorized to access this route. Please login."
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Not authorized to access this resource"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Resource not found"
}
```

### 500 Server Error
```json
{
  "success": false,
  "message": "Server Error"
}
```

---

## Rate Limiting

Currently not implemented. Consider adding rate limiting for production deployment.

---

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## Best Practices

1. Always include authentication token in headers for private routes
2. Use query parameters for filtering large datasets
3. Implement pagination for better performance
4. Handle errors gracefully on the client side
5. Store JWT token securely (httpOnly cookies or secure storage)
6. Never expose sensitive information in API responses
7. Use HTTPS in production

---

## Testing Tips

1. **Use Postman Collections** - Create and save requests for reuse
2. **Environment Variables** - Store base URL and token in Postman environments
3. **Test Error Cases** - Don't just test happy paths
4. **Check Response Times** - Monitor API performance
5. **Validate Response Structure** - Ensure responses match documentation

---

## Support

For issues or questions:
- Check the README.md
- Review the QUICKSTART.md guide
- Examine server logs for errors
- Verify environment variables are set correctly
