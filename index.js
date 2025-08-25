import express from "express";
import dotenv from "dotenv";
import connectDb from "./config/db.js";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes.js";
import cors from "cors";
import userRoutes from "./routes/userRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";

dotenv.config();

let port = process.env.PORT || 8000;

let app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());

// Log cookies and headers for debugging
app.use((req, res, next) => {
  console.log("Cookies received:", req.cookies);
  console.log("Authorization header:", req.headers.authorization);
  console.log("Origin:", req.headers.origin);
  next();
});

// CORS Configuration
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:3000",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Accept",
      "X-Requested-With",
      "Origin",
    ],
    exposedHeaders: ["Set-Cookie"],
  }),
);

// Log incoming requests for debugging
app.use((req, res, next) => {
  console.log(`Incoming Request: ${req.method} ${req.url}`);
  next();
});

// Set CORS and security headers
app.use((req, res, next) => {
  const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:3000",
  ];
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  // Security headers
  res.setHeader("Cross-Origin-Opener-Policy", "unsafe-none");
  res.setHeader("Cross-Origin-Embedder-Policy", "unsafe-none");

  // CORS headers
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS",
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization",
  );
  res.setHeader("Access-Control-Max-Age", "3600");

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  next();
});

// Test route for cookie debugging
app.get("/test-cookie", (req, res) => {
  console.log("Test cookie route called");
  console.log("Received cookies:", req.cookies);

  // Set a test cookie
  const testToken = "test-token-value";
  res.cookie("test-token", testToken, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 24 * 60 * 60 * 1000, // 1 day
    path: "/",
  });

  return res.status(200).json({
    message: "Test cookie set",
    cookiesReceived: req.cookies,
  });
});

// Test route to verify auth
app.get("/test-auth", (req, res) => {
  console.log("Test auth route called");
  console.log("Received cookies:", req.cookies);

  if (req.cookies.token) {
    return res.status(200).json({
      authenticated: true,
      token: "Token exists (not showing full value)",
    });
  } else {
    return res.status(401).json({
      authenticated: false,
      message: "No token found",
    });
  }
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/product", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/order", orderRoutes);

// Database Connection and Server Start
app.listen(port, async () => {
  try {
    await connectDb(); // Ensure the database connection is established
    console.log(`Server is running on http://localhost:${port}`);
  } catch (error) {
    console.error("Database connection failed:", error.message);
    process.exit(1); // Exit the process if the database connection fails
  }
});
