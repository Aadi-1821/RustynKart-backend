# RustynKart Backend API

This is the backend API for RustynKart, an e-commerce platform built with Node.js, Express, and MongoDB.

## Table of Contents

- [Features](#features)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [Deployment](#deployment)
  - [Render.com Deployment](#rendercom-deployment)
- [Technologies Used](#technologies-used)

## Features

- User authentication and authorization
- Product management
- Shopping cart functionality
- Order processing and payment integration with Razorpay
- Image upload with Cloudinary
- User profile management

## Getting Started

### Prerequisites

- Node.js (version 18 or higher)
- MongoDB Atlas account or local MongoDB installation
- Cloudinary account (for image uploads)
- Razorpay account (for payment processing)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/RustynKart-backend.git
   cd RustynKart-backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables (see next section)

4. Start the development server:
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:8000`

### Environment Variables

Create a `.env` file in the root directory with the following variables (see `.env.example` for reference):

```
PORT=8000
NODE_ENV=development
MONGODB_URL=your_mongodb_connection_string
JWT_SECRET=your_secret_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

## Project Structure

```
backend/
├── config/           # Configuration files
├── controller/       # Request handlers
├── middleware/       # Custom middleware
├── model/            # Mongoose models
├── public/           # Static files
├── routes/           # API routes
├── .env              # Environment variables (not in repo)
├── .env.example      # Example environment variables
├── .gitignore        # Git ignore file
├── index.js          # Main application entry point
├── package.json      # Project dependencies
└── README.md         # Project documentation
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login a user
- `GET /api/auth/logout` - Logout a user

### Users
- `GET /api/user/profile` - Get current user profile
- `PUT /api/user/profile` - Update user profile
- `GET /api/user/:id` - Get user by ID (admin only)

### Products
- `GET /api/product` - Get all products
- `GET /api/product/:id` - Get product by ID
- `POST /api/product` - Create a new product (admin only)
- `PUT /api/product/:id` - Update a product (admin only)
- `DELETE /api/product/:id` - Delete a product (admin only)

### Cart
- `GET /api/cart` - Get user's cart
- `POST /api/cart` - Add item to cart
- `PUT /api/cart/:itemId` - Update cart item quantity
- `DELETE /api/cart/:itemId` - Remove item from cart

### Orders
- `GET /api/order` - Get user's orders
- `GET /api/order/:id` - Get order by ID
- `POST /api/order` - Create a new order
- `PUT /api/order/:id/pay` - Update order to paid
- `GET /api/order/checkout/session` - Create payment session

## Deployment

### Render.com Deployment

1. **Create a new Web Service**
   - Sign up or log in to [Render](https://render.com/)
   - Click on "New +" and select "Web Service"
   - Connect your GitHub repository

2. **Configure the Web Service**
   - Name: `rustynkart-backend` (or your preferred name)
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`

3. **Environment Variables**
   - Add all the required environment variables mentioned in the `.env.example` file
   - Make sure to set `NODE_ENV=production`

4. **Advanced Settings**
   - Set Auto-Deploy to `Yes` if you want automatic deployments on code changes

5. **Create Web Service**
   - Click "Create Web Service" and wait for the deployment to complete

6. **Monitor Logs**
   - After deployment, monitor logs to ensure everything is working correctly
   - Troubleshoot any issues that might arise

## Technologies Used

- **Node.js** - JavaScript runtime environment
- **Express** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling for Node.js
- **JSON Web Tokens** - Authentication and authorization
- **Cloudinary** - Cloud-based image management
- **Razorpay** - Payment gateway integration
- **Cors** - Cross-origin resource sharing
- **Bcrypt** - Password hashing
- **dotenv** - Environment variable management