import jwt from "jsonwebtoken";

const isAuth = async (req, res, next) => {
  try {
    console.log("isAuth middleware called");
    console.log("Request cookies:", req.cookies);
    console.log("Request headers:", req.headers);

    // Check if cookies object exists
    if (!req.cookies || Object.keys(req.cookies).length === 0) {
      console.error("isAuth error: No cookies found in request");
      return res
        .status(400)
        .json({ message: "No authentication cookies found" });
    }

    let { token } = req.cookies;
    console.log("Token from cookies:", token);

    if (!token || token === "undefined") {
      console.error("isAuth error: No valid token found in cookies");
      console.log("Cookies received:", req.cookies); // Log all cookies for debugging
      return res
        .status(400)
        .json({ message: "User does not have a valid token" });
    }

    let verifyToken;
    try {
      console.log("Attempting to verify token with JWT_SECRET");
      if (!process.env.JWT_SECRET) {
        console.error("JWT_SECRET is not defined in environment variables");
        return res.status(500).json({ message: "Server configuration error" });
      }
      verifyToken = jwt.verify(token, process.env.JWT_SECRET);
      console.log("Token verified successfully:", verifyToken);
    } catch (verifyError) {
      console.error("isAuth error: Invalid token", verifyError.message);
      console.log("Token received:", token); // Log the token for debugging
      return res
        .status(400)
        .json({ message: "User does not have a valid token" });
    }

    if (!verifyToken || !verifyToken.userId) {
      console.error(
        "isAuth error: Token verification failed or userId missing",
      );
      return res
        .status(400)
        .json({ message: "User does not have a valid token" });
    }

    if (!verifyToken.userId) {
      console.error("isAuth error: No userId found in verified token");
      return res.status(400).json({ message: "Invalid token structure" });
    }

    req.userId = verifyToken.userId;
    console.log("Decoded User ID:", req.userId);
    console.log("isAuth: User authenticated with ID:", req.userId);
    next();
  } catch (error) {
    console.error("isAuth error:", error.message);
    console.error("isAuth error stack:", error.stack);
    return res.status(500).json({ message: `isAuth error: ${error.message}` });
  }
};

export default isAuth;
