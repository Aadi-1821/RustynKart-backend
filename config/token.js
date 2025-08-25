import jwt from "jsonwebtoken";

export const genToken = async (userId) => {
  try {
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is missing from environment variables");
      throw new Error("JWT_SECRET configuration missing");
    }

    if (!userId) {
      console.error("UserId is required for token generation");
      throw new Error("Missing userId for token generation");
    }

    let token = jwt.sign({ userId }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    console.log("Token generated successfully for user:", userId);
    return token;
  } catch (error) {
    console.error("Token generation error:", error.message);
    throw error;
  }
};
export const genToken1 = async (email) => {
  try {
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is missing from environment variables");
      throw new Error("JWT_SECRET configuration missing");
    }

    if (!email) {
      console.error("Email is required for admin token generation");
      throw new Error("Missing email for token generation");
    }

    let token = jwt.sign({ email }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    console.log("Admin token generated successfully for email:", email);
    return token;
  } catch (error) {
    console.error("Admin token generation error:", error.message);
    throw error;
  }
};
