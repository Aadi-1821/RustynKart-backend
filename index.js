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

  // Try to detect if the request is from the Vercel frontend
  const isFromVercel =
    req.headers.origin?.includes("vercel.app") ||
    req.headers.referer?.includes("vercel.app");

  if (isFromVercel) {
    console.log("Request detected from Vercel frontend");
  }

  next();
});

// CORS Configuration
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, curl requests)
      const allowedOrigins = [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:3000",
        "https://rusty-kart.onrender.com",
        "https://rustynkart.onrender.com",
        "https://rustynkart-frontend.vercel.app",
        "https://rustynkart.vercel.app",
        "https://rustynkart-admin.vercel.app",
      ];

      // Allow all vercel.app preview domains
      if (!origin) {
        callback(null, true);
      } else if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else if (origin.includes("vercel.app")) {
        console.log("Allowing Vercel preview domain:", origin);
        callback(null, true);
      } else {
        console.log("Blocked origin:", origin);
        callback(null, false);
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Accept",
      "X-Requested-With",
      "Origin",
      "Cookie",
      "X-Auth-Token",
      "X-Diagnostic-Token",
    ],
    exposedHeaders: [
      "Set-Cookie",
      "Authorization",
      "X-Auth-Token",
      "X-Diagnostic-Token",
    ],
    maxAge: 86400,
  }),
);

// Log request details for debugging
app.use((req, res, next) => {
  console.log(`Incoming Request: ${req.method} ${req.url}`);

  if (req.method === "POST" || req.method === "PUT") {
    console.log(`Request body: ${JSON.stringify(req.body || {})}`);
  }

  if (req.url.includes("/api/cart")) {
    console.log("CART API CALLED:", req.method, req.url);
    console.log("Headers for cart request:", JSON.stringify(req.headers));
  }

  next();
});

// Set CORS and security headers
app.use((req, res, next) => {
  const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:3000",
    "https://rusty-kart.onrender.com",
    "https://rustynkart.onrender.com",
    "https://rustynkart-frontend.vercel.app",
    "https://rustynkart.vercel.app",
    "https://rustynkart-admin.vercel.app",
  ];
  const origin = req.headers.origin;

  // Allow all vercel.app domains
  if (
    allowedOrigins.includes(origin) ||
    (origin && origin.includes("vercel.app"))
  ) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  // Security headers - set to be more permissive for cross-origin cookies
  res.setHeader("Cross-Origin-Opener-Policy", "unsafe-none");
  res.setHeader("Cross-Origin-Embedder-Policy", "unsafe-none");
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");

  // CORS headers
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS",
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization, Cookie, X-Auth-Token, X-Diagnostic-Token",
  );
  res.setHeader("Access-Control-Max-Age", "86400");
  res.setHeader(
    "Access-Control-Expose-Headers",
    "Set-Cookie, Authorization, X-Auth-Token, X-Diagnostic-Token",
  );

  // Additional security headers
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");

  // For debugging, log the Cookie header if present
  if (req.headers.cookie) {
    console.log("Cookie header received:", req.headers.cookie);
  }

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
    httpOnly: false,
    secure: true,
    sameSite: "none",
    maxAge: 24 * 60 * 60 * 1000, // 1 day
    path: "/",
  });

  return res.status(200).json({
    message: "Test cookie set",
    cookiesReceived: req.cookies,
  });
});

// Comprehensive auth diagnostic endpoint
app.get("/api/auth/diagnostic", (req, res) => {
  console.log("Auth diagnostic endpoint called");
  console.log("Full request headers:", req.headers);
  console.log("Cookies received:", req.cookies);
  console.log("Origin:", req.headers.origin);
  console.log("Referer:", req.headers.referer);

  // Get auth token from various sources
  const cookieToken = req.cookies?.token || "none";
  const authHeader = req.headers.authorization || "none";
  const xAuthToken = req.headers["x-auth-token"] || "none";

  // Generate a test token and set in multiple ways
  const diagnosticToken = "diagnostic-" + Date.now();

  // Set as cookie
  res.cookie("diagnostic-token", diagnosticToken, {
    httpOnly: false,
    secure: true,
    sameSite: "none",
    maxAge: 10 * 60 * 1000, // 10 minutes
    path: "/",
  });

  // Set headers to help debug
  res.setHeader("X-Diagnostic-Token", diagnosticToken);

  return res.status(200).json({
    status: "Diagnostics completed",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    headers: {
      origin: req.headers.origin,
      referer: req.headers.referer,
      userAgent: req.headers["user-agent"],
    },
    authStatus: {
      cookieTokenExists: !!req.cookies?.token,
      cookieTokenValue: cookieToken.substring(0, 10) + "...",
      authHeaderExists: !!req.headers.authorization,
      authHeaderValue: authHeader.substring(0, 10) + "...",
      xAuthTokenExists: !!req.headers["x-auth-token"],
      xAuthTokenValue: xAuthToken.substring(0, 10) + "...",
    },
    browserInfo: {
      corsOrigin: req.headers.origin,
      sameSiteStatus: "Check if cookie is visible in browser",
      secureCookieStatus: req.secure ? "Secure context" : "Non-secure context",
    },
    diagnosticTokenSet: diagnosticToken,
    nextSteps: [
      "Check browser console for cookies (document.cookie)",
      "Try using the diagnostic token in header for next request",
      "Check DevTools > Application > Cookies to see if diagnostic-token is visible",
      "If no cookies appear, check your browser's security settings",
    ],
  });
});

// Test route to verify auth
app.get("/test-auth", (req, res) => {
  console.log("Test auth route called");
  console.log("Received cookies:", req.cookies);
  console.log("Authorization header:", req.headers.authorization);
  console.log("Cookie header:", req.headers.cookie);

  // Check for token in cookies
  const cookieToken = req.cookies && req.cookies.token;

  // Check for token in Authorization header
  let authToken = null;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    authToken = authHeader.split(" ")[1];
  }

  if (cookieToken || authToken) {
    return res.status(200).json({
      authenticated: true,
      tokenSource: cookieToken ? "cookie" : "header",
      cookieExists: !!cookieToken,
      authHeaderExists: !!authToken,
    });
  } else {
    return res.status(401).json({
      authenticated: false,
      message: "No token found in cookies or Authorization header",
    });
  }
});

// Add a specific test endpoint for client-side cookie testing
app.get("/api/auth/test-client-auth", (req, res) => {
  console.log("Client auth test route called");
  console.log("Headers:", req.headers);
  console.log("Cookies:", req.cookies);

  // Set a test cookie that should be visible to client-side JavaScript
  res.cookie("client-test-cookie", "visible-to-js", {
    httpOnly: false,
    secure: true,
    sameSite: "none",
    maxAge: 10 * 60 * 1000, // 10 minutes
    path: "/",
  });

  return res.status(200).json({
    message: "Test cookie set",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// API health check endpoint
app.get("/api/health", (req, res) => {
  return res.status(200).json({
    status: "ok",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
  });
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
