import User from "../model/userModel.js";

export const getCurrentUser = async (req, res) => {
  try {
    console.log("Fetching user with ID:", req.userId); // Log user ID
    if (!req.userId) {
      console.error("getCurrentUser error: Missing user ID in request");
      return res.status(400).json({ message: "User ID is required" });
    }
    let user = await User.findById(req.userId).select("-password");
    if (!user) {
      console.error("User not found for ID:", req.userId); // Log error for missing user
      return res.status(404).json({ message: "User is not found" });
    }
    console.log("User found:", user); // Log user data
    return res.status(200).json(user);
  } catch (error) {
    console.error("Error in getCurrentUser:", error.message); // Log detailed error message
    return res
      .status(500)
      .json({ message: `getCurrentUser error: ${error.message}` });
  }
};

export const getAdmin = async (req, res) => {
  try {
    let adminEmail = req.adminEmail;
    if (!adminEmail) {
      return res.status(404).json({ message: "Admin is not found" });
    }
    return res.status(201).json({
      email: adminEmail,
      role: "admin",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: `getAdmin error ${error}` });
  }
};
