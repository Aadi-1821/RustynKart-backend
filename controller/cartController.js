import User from "../model/userModel.js";

export const addToCart = async (req, res) => {
  try {
    const { itemId, size } = req.body;

    const userData = await User.findById(req.userId);

    // Check if user exists
    if (!userData) {
      return res.status(404).json({ message: "User not found" });
    }

    // Ensure cartData is initialized
    let cartData = userData.cartData || {};

    if (cartData[itemId]) {
      if (cartData[itemId][size]) {
        cartData[itemId][size] += 1;
      } else {
        cartData[itemId][size] = 1;
      }
    } else {
      cartData[itemId] = {};
      cartData[itemId][size] = 1;
    }

    await User.findByIdAndUpdate(req.userId, { cartData });

    return res.status(201).json({ message: "Added to cart" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "addToCart error" });
  }
};

export const UpdateCart = async (req, res) => {
  try {
    const { itemId, size, quantity } = req.body;

    // Validate input
    if (!itemId || !size || quantity === undefined) {
      return res
        .status(400)
        .json({ message: "itemId, size, and quantity are required" });
    }

    const userData = await User.findById(req.userId);

    // Check if user exists
    if (!userData) {
      return res.status(404).json({ message: "User not found" });
    }

    let cartData = userData.cartData || {};

    // Check if itemId and size exist in cartData
    if (!cartData[itemId] || !cartData[itemId][size]) {
      return res
        .status(404)
        .json({ message: "Item or size not found in cart" });
    }

    // Update quantity
    cartData[itemId][size] = quantity;

    // Save updated cartData
    await User.findByIdAndUpdate(req.userId, { cartData });

    return res.status(200).json({ message: "Cart updated" });
  } catch (error) {
    console.error("UpdateCart error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getUserCart = async (req, res) => {
  try {
    console.log("getUserCart called with method:", req.method);
    console.log("Request User ID:", req.userId); // Log user ID

    if (req.method === "POST") {
      console.log("Request Body:", req.body); // Log request body for POST
    }

    const userData = await User.findById(req.userId);

    // Check if user exists
    if (!userData) {
      console.error("User not found for ID:", req.userId); // Log error for missing user
      return res.status(404).json({ message: "User not found" });
    }

    let cartData = userData.cartData || {};
    console.log("Cart Data:", cartData); // Log cart data

    return res.status(200).json(cartData);
  } catch (error) {
    console.error("getUserCart error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
