import uploadOnCloudinary from "../config/cloudinary.js";
import Product from "../model/productModel.js";

export const addProduct = async (req, res) => {
  try {
    let { name, description, price, category, subCategory, sizes, bestseller } =
      req.body;

    // Helper to get file path safely
    const getFilePath = (files, key) => {
      return files && files[key] && files[key][0] ? files[key][0].path : null;
    };

    let image1 = await uploadOnCloudinary(getFilePath(req.files, "image1"));
    let image2 = await uploadOnCloudinary(getFilePath(req.files, "image2"));
    let image3 = await uploadOnCloudinary(getFilePath(req.files, "image3"));
    let image4 = await uploadOnCloudinary(getFilePath(req.files, "image4"));

    let productData = {
      name,
      description,
      price: Number(price),
      category,
      subCategory,
      sizes: JSON.parse(sizes),
      bestseller: bestseller === "true" ? true : false,
      date: Date.now(),
      image1,
      image2,
      image3,
      image4,
    };

    const product = await Product.create(productData);

    return res.status(201).json(product);
  } catch (error) {
    console.error("AddProduct error:", error.message, error); // Improved error logging
    return res
      .status(500)
      .json({ message: "AddProduct error", error: error.message });
  }
};

export const listProduct = async (req, res) => {
  try {
    const product = await Product.find({});
    return res.status(200).json(product);
  } catch (error) {
    console.log("ListProduct error");
    return res.status(500).json({ message: `ListProduct error ${error}` });
  }
};

export const removeProduct = async (req, res) => {
  try {
    let { id } = req.params;
    const product = await Product.findByIdAndDelete(id);
    return res.status(200).json(product);
  } catch (error) {
    console.log("RemoveProduct error");
    return res.status(500).json({ message: `RemoveProduct error ${error}` });
  }
};
