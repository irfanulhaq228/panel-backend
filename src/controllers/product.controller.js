/**
 * @description      :
 * @author           :
 * @group            :
 * @created          : 13/08/2024 - 14:28:20
 *
 * MODIFICATION LOG
 * - Version         : 1.0.0
 * - Date            : 13/08/2024
 * - Author          :
 * - Modification    :
 **/
const httpStatus = require("http-status");
const pick = require("../utils/pick");
const ApiError = require("../utils/ApiError");
const catchAsync = require("../utils/catchAsync");
const { productService } = require("../services");

const Product = require("../models/product.model");

const createProduct = catchAsync(async (req, res) => {
  const {
    productName,
    productCode,
    productDescription,
    productPrice,
    productDiscount,
  } = req.body;
  const images = req.files.map((file) => file.path);
  const productData = {
    productName,
    productCode,
    productDescription,
    productPrice,
    productDiscount,
    images,
  };
  const product = await Product.create(productData);
  res
    .status(200)
    .json({ success: true, message: "Product Created Succfully", product });
});

const getAllProducts = catchAsync(async (req, res) => {
  const filter = pick(req.query, ["name", "price"]);
  const options = pick(req.query, ["sortBy", "limit", "page"]);
  const result = await productService.queryProduct(filter, options);
  res.send(result);
});

const getProductById = catchAsync(async (req, res) => {
  console.log("singleId", req?.params?.productId);
  const product = await productService.getProductById(req.params.productId);
  if (!product) {
    throw new ApiError(httpStatus.NOT_FOUND, "Product not found");
  }
  res.send(product);
});

const deleteProduct = catchAsync(async (req, res) => {
  await productService.deleteProductsById(req.params.productId);
  res.status(200).json({ message: "Product deleted" });
});

const updateProduct = catchAsync(async (req, res) => {
  const { productId } = req.params;

  let product = await productService.getProductById(productId);

  if (!product) {
    return res.status(404).send({ message: 'Product not found' });
  }

  let newImages = [];
  if (req.files) {
    newImages = req.files.map(file => file.filename);
  }
  let images = req.body.images || [];
  if (typeof images === 'string') {
    images = [images];
  }
  console.log("parse image ==> ", images);
  images = [...product.images, ...newImages];

  const updatedProduct = await productService.updateProductsById(productId, {
    ...req.body,
    images,
  });

  res.send(updatedProduct);
});

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  deleteProduct,
  updateProduct,
};
