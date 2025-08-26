import jwt from "jsonwebtoken";

const isAuth = async (req, res, next) => {
  try {
    console.log("isAuth middleware called");
    console.log("Request cookies:", req.cookies);
    console.log("Request headers:", req.headers);

    // Try to get token from various sources
    let token;

    // 1. Check cookies
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
      console.log("Token found in cookies:", token.substring(0, 10) + "...");
    }

    // 2. Check Authorization header
    if (!token || token === "undefined") {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
        console.log(
          "Token found in Authorization header:",
          token.substring(0, 10) + "...",
        );
      }
    }

    // 3. Check token in request body
    if (!token || token === "undefined") {
      if (req.body && req.body.token) {
        token = req.body.token;
        console.log("Token found in request body");
      }
    }

    // 4. Check for token in response body from login
    if (!token || token === "undefined") {
      // This assumes a specific usage pattern where we're looking for the token
      // that was just created in a login response
      if (req.headers["x-auth-token"]) {
        token = req.headers["x-auth-token"];
        console.log("Token found in x-auth-token header");
      }
    }

    // 5. Check query parameter (for special cases like webhook callbacks)
    if ((!token || token === "undefined") && req.query && req.query.token) {
      token = req.query.token;
      console.log("Token found in query parameter");
    }

    // If still no token found
    if (!token || token === "undefined") {
      console.error("isAuth error: No valid token found in any source");
      console.log("Cookies received:", req.cookies);
      console.log("Authorization header:", req.headers.authorization);
      console.log("Origin:", req.headers.origin);

      return res
        .status(401) // Changed from 400 to 401 Unauthorized
        .json({
          message: "Authentication required",
          error: "no_token_found",
          details: "No authentication token found in request",
        });
    }

    // Verify the token
    let verifyToken;
    try {
      if (!process.env.JWT_SECRET) {
        console.error("JWT_SECRET is not defined in environment variables");
        return res.status(500).json({
          message: "Server configuration error",
          error: "server_config_error",
        });
      }

      verifyToken = jwt.verify(token, process.env.JWT_SECRET);
      console.log(
        "Token verified successfully for user ID:",
        verifyToken.userId,
      );
    } catch (verifyError) {
      console.error(
        "isAuth error: Token verification failed:",
        verifyError.message,
      );

      // Handle different JWT verification errors
      if (verifyError.name === "TokenExpiredError") {
        return res.status(401).json({
          message: "Authentication session expired",
          error: "token_expired",
          details: "Please log in again",
        });
      } else if (verifyError.name === "JsonWebTokenError") {
        return res.status(401).json({
          message: "Invalid authentication token",
          error: "invalid_token",
          details: verifyError.message,
        });
      } else {
        return res.status(401).json({
          message: "Authentication failed",
          error: "auth_error",
          details: verifyError.message,
        });
      }
    }

    // Verify token structure
    if (!verifyToken || !verifyToken.userId) {
      console.error("isAuth error: Token structure invalid");
      return res.status(401).json({
        message: "Invalid token format",
        error: "invalid_token_structure",
      });
    }

    // Set the user ID on the request object
    req.userId = verifyToken.userId;

    // For admin routes, you might want to check for admin flag
    if (verifyToken.isAdmin) {
      req.isAdmin = true;
    }

    console.log("isAuth: User authenticated with ID:", req.userId);
    next();
  } catch (error) {
    console.error("isAuth error:", error.message);
    console.error("isAuth error stack:", error.stack);
    return res.status(500).json({
      message: "Authentication system error",
      error: "auth_system_error",
      details: error.message,
    });
  }
};

export default isAuth;
