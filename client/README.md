# Finance Tracker Frontend

A modern, production-ready React frontend for the Personal Finance Tracker SaaS application. Built with React, Vite, Tailwind CSS, and Recharts for data visualization.

## 🚀 Features

### Core Functionality
- **User Authentication**: Secure login and registration with JWT
- **Dashboard**: Overview of financial stats with charts and recent transactions
- **Transaction Management**: Create, edit, delete, and filter income/expense transactions
- **Budget Tracking**: Set monthly budgets with progress tracking and warnings
- **Analytics**: Visualize spending patterns with interactive charts

### Technical Features
- **Protected Routes**: Secure routing with authentication checks
- **API Integration**: Axios interceptors for seamless backend communication
- **State Management**: Context API for global authentication state
- **Responsive Design**: Tailwind CSS for mobile-first UI
- **Toast Notifications**: Real-time user feedback
- **Form Validation**: Client-side validation for data integrity
- **Chart Visualizations**: Recharts for pie, line, and bar charts

## 🛠 Tech Stack

- **React** 18.2.0 - UI library
- **Vite** 5.0.8 - Build tool and dev server
- **React Router** 6.20.0 - Client-side routing
- **Axios** 1.6.2 - HTTP client
- **Recharts** 2.10.3 - Chart library
- **Tailwind CSS** 3.4.0 - Utility-first CSS
- **React Hot Toast** 2.4.1 - Notifications
- **React Icons** 4.12.0 - Icon library
- **date-fns** 2.30.0 - Date formatting

## 📦 Installation

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Backend API running (see backend README)

### Setup Steps

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Environment Configuration**
   ```bash
   # Create .env file
   cp .env.example .env
   ```

3. **Configure API URL**
   
   Edit `.env` file:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

   Application will be available at `http://localhost:3000`

## 🚦 Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## 📁 Project Structure

```
finance-tracker-frontend/
├── public/              # Static assets
├── src/
│   ├── api/            # API configuration and endpoints
│   │   └── axios.js    # Axios instance with interceptors
│   ├── components/     # Reusable components
│   │   ├── Navbar.jsx
│   │   ├── Sidebar.jsx
│   │   ├── TransactionForm.jsx
│   │   ├── TransactionList.jsx
│   │   ├── BudgetCard.jsx
│   │   └── BudgetForm.jsx
│   ├── context/        # React Context providers
│   │   └── AuthContext.jsx
│   ├── hooks/          # Custom React hooks
│   │   └── useAuth.js
│   ├── pages/          # Page components
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Transactions.jsx
│   │   ├── Budgets.jsx
│   │   └── Analytics.jsx
│   ├── routes/         # Route protection
│   │   └── ProtectedRoute.jsx
│   ├── utils/          # Utility functions
│   │   └── formatCurrency.js
│   ├── App.jsx         # Main app component
│   ├── main.jsx        # Entry point
│   └── index.css       # Global styles
├── .env.example        # Environment variables template
├── index.html          # HTML template
├── package.json        # Dependencies
├── tailwind.config.js  # Tailwind configuration
├── vite.config.js      # Vite configuration
└── README.md           # This file
```

## 🔐 Authentication Flow

1. User registers or logs in through `/login` or `/register`
2. Backend returns JWT token
3. Token stored in localStorage
4. Axios interceptor attaches token to all requests
5. ProtectedRoute component checks authentication
6. On 401 response, user is automatically logged out

## 🎨 Key Components

### Pages
- **Login**: User authentication page
- **Register**: New user registration
- **Dashboard**: Financial overview with charts and stats
- **Transactions**: CRUD operations for transactions with filtering
- **Budgets**: Monthly budget management with progress tracking
- **Analytics**: Data visualization with multiple chart types

### Components
- **Navbar**: Top navigation with user menu
- **Sidebar**: Side navigation menu
- **TransactionForm**: Modal form for creating/editing transactions
- **TransactionList**: Table display of transactions
- **BudgetCard**: Budget card with progress bar
- **BudgetForm**: Modal form for creating/editing budgets

## 🌐 API Integration

The application communicates with the backend API through Axios. API base URL is configured in `.env`.

### API Endpoints Used
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /auth/profile` - Get user profile
- `GET /transactions` - List transactions
- `POST /transactions` - Create transaction
- `PUT /transactions/:id` - Update transaction
- `DELETE /transactions/:id` - Delete transaction
- `GET /budgets` - List budgets
- `POST /budgets` - Create budget
- `PUT /budgets/:id` - Update budget
- `DELETE /budgets/:id` - Delete budget
- `GET /analytics/category` - Category analytics
- `GET /analytics/monthly` - Monthly analytics

## 🎯 Environment Variables

Create a `.env` file in the root directory:

```env
# Backend API URL
VITE_API_URL=http://localhost:5000/api
```

> **Note**: Vite requires environment variables to be prefixed with `VITE_`

## 🚀 Production Build

```bash
# Build for production
npm run build

# Preview production build locally
npm run preview
```

The production build will be generated in the `dist/` directory.

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop (1024px+)
- Tablet (768px - 1023px)
- Mobile (< 768px)

## 🎨 Styling

The application uses Tailwind CSS utility classes for styling. Custom styles are defined in:
- `index.css` - Global styles and Tailwind directives
- `tailwind.config.js` - Tailwind configuration

### Color Scheme
- Primary: Blue (#3B82F6)
- Success: Green (#10B981)
- Warning: Yellow (#F59E0B)
- Danger: Red (#EF4444)

## 🔧 Configuration Files

### vite.config.js
- React plugin configuration
- Proxy setup for API requests (avoids CORS in development)

### tailwind.config.js
- Custom color palette
- Extended utility classes
- Plugin configurations

### postcss.config.js
- Tailwind CSS processing
- Autoprefixer for vendor prefixes

## 📊 Charts and Visualizations

The application uses Recharts for data visualization:
- **Pie Chart**: Category spending breakdown
- **Line Chart**: Monthly income vs expense trends
- **Bar Chart**: Category comparison

## 🛡️ Security Features

- JWT token authentication
- Automatic token refresh on API calls
- 401 redirect to login
- Protected routes
- XSS protection via React
- HTTPS ready for production

## 🐛 Troubleshooting

### Common Issues

**Issue: Cannot connect to API**
- Solution: Ensure backend is running on port 5000
- Check `VITE_API_URL` in `.env` file

**Issue: White screen after login**
- Solution: Check browser console for errors
- Verify token is stored in localStorage

**Issue: Charts not rendering**
- Solution: Ensure Recharts is installed
- Check if analytics data is being fetched

## 📝 Development Notes

### Adding New Pages
1. Create page component in `src/pages/`
2. Add route in `src/App.jsx`
3. Wrap with `ProtectedRoute` if authentication required
4. Add navigation link in `Sidebar.jsx`

### API Calls
All API calls should go through `src/api/axios.js` to ensure proper error handling and token attachment.

## 🚀 Deployment

### Vercel/Netlify
1. Build the application: `npm run build`
2. Deploy `dist/` directory
3. Set environment variable: `VITE_API_URL=<your-backend-url>`

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
ENV VITE_API_URL=http://localhost:5000/api
RUN npm run build
CMD ["npm", "run", "preview"]
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit pull request

## 📄 License

This project is licensed under the MIT License.

## 👤 Author

Your Name - Personal Finance Tracker SaaS

## 🙏 Acknowledgments

- React team for the amazing library
- Tailwind CSS for the utility-first framework
- Recharts for beautiful charts
- Vite for blazing fast builds
