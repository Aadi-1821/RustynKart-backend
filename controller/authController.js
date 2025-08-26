import User from "../model/userModel.js";
import validator from "validator";
import bcrypt from "bcryptjs";
import { genToken, genToken1 } from "../config/token.js";

export const registration = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, email and password are required" });
    }

    const existUser = await User.findOne({ email });
    if (existUser) {
      return res.status(400).json({ message: "User already exist" });
    }
    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: "Enter valid Email" });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: "Enter Strong Password" });
    }

    let hashPassword = await bcrypt.hash(password, 10);

    const user = await User.create({ name, email, password: hashPassword });
    let token = await genToken(user._id);

    console.log("Registration: Generated token for user ID:", user._id);
    console.log("Registration: Token value:", token);

    // Set cookie with proper options for both local and production environments
    res.cookie("token", token, {
      httpOnly: false, // Allow JavaScript access so frontend can read token
      secure: true, // Always use secure for cross-origin
      sameSite: "none", // Required for cross-origin
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    // Also include token in response body for clients that can't use cookies
    const userResponse = { ...user.toObject(), token };

    console.log("Registration: Cookie set successfully");
    return res.status(201).json(userResponse);
  } catch (error) {
    console.error("Registration error:", error);
    return res
      .status(500)
      .json({ message: `Registration error: ${error.message}` });
  }
};

export const login = async (req, res) => {
  try {
    let { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    let user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User is not Found" });
    }

    let isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    let token = await genToken(user._id);
    console.log("Login: Generated token for user ID:", user._id);
    console.log("Login: Token value:", token);

    // Set cookie with proper options for both local and production environments
    res.cookie("token", token, {
      httpOnly: false, // Allow JavaScript access so frontend can read token
      secure: true, // Always use secure for cross-origin
      sameSite: "none", // Required for cross-origin
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    // Also include token in response body for clients that can't use cookies
    const userResponse = { ...user.toObject(), token };

    console.log("Login: Cookie set successfully");
    return res.status(200).json(userResponse);
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: `Login error: ${error.message}` });
  }
};
export const logOut = async (req, res) => {
  try {
    console.log("Logout attempt");

    // Clear cookie with same options as when it was set
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
    });

    console.log("Logout: Cookie cleared successfully");
    return res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({ message: `Logout error: ${error.message}` });
  }
};

export const googleLogin = async (req, res) => {
  try {
    let { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: "Name and email are required" });
    }

    console.log("Google login attempt for:", email);

    let user = await User.findOne({ email });
    if (!user) {
      console.log("Creating new user for Google login:", email);
      user = await User.create({
        name,
        email,
      });
    }

    let token = await genToken(user._id);
    console.log("Google Login: Generated token for user ID:", user._id);
    console.log("Google Login: Token value:", token);

    // Set cookie with proper options for both local and production environments
    res.cookie("token", token, {
      httpOnly: false, // Allow JavaScript access so frontend can read token
      secure: true, // Always use secure for cross-origin
      sameSite: "none", // Required for cross-origin
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    // Also include token in response body for clients that can't use cookies
    const userResponse = { ...user.toObject(), token };

    console.log("Google Login: Cookie set successfully");
    return res.status(200).json(userResponse);
  } catch (error) {
    console.error("Google Login error:", error);
    return res
      .status(500)
      .json({ message: `Google Login error: ${error.message}` });
  }
};

export const adminLogin = async (req, res) => {
  try {
    let { email, password } = req.body;

    if (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    ) {
      let token = await genToken1(email);
      res.cookie("token", token, {
        httpOnly: false, // Allow JavaScript access so frontend can read token
        secure: true, // Always use secure for cross-origin
        sameSite: "none", // Required for cross-origin
        maxAge: 1 * 24 * 60 * 60 * 1000,
        path: "/",
      });
      return res.status(200).json({ token, role: "admin" });
    }
    return res.status(400).json({ message: "Invaild creadintials" });
  } catch (error) {
    console.log("AdminLogin error");
    return res.status(500).json({ message: `AdminLogin error ${error}` });
  }
};
