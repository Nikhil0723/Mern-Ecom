import Product from '../models/productModel.js';

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public

const getProducts = async (req, res) => {
  try {
    const {
      keyword,
      category,
      brand,
      minPrice,
      maxPrice,
      rating,
      sort,
      page = 1,
      limit = 12,
    } = req.query;

    const filter = {};

    if (keyword) {
      filter.name = { $regex: keyword.trim(), $options: 'i' };
    }

    if (category) {
      filter.category = { $regex: category.trim(), $options: 'i' };
    }

    if (brand) {
      filter.brand = { $regex: brand.trim(), $options: 'i' };
    }

    const priceFilter = {};

    if (minPrice !== undefined && minPrice !== '') {
      priceFilter.$gte = Number(minPrice);
    }

    if (maxPrice !== undefined && maxPrice !== '') {
      priceFilter.$lte = Number(maxPrice);
    }

    if (Object.keys(priceFilter).length > 0) {
      filter.price = priceFilter;
    }

    // Minimum rating
    if (rating !== undefined && rating !== '') {
      filter.rating = { $gte: Number(rating) };
    }

    const currentPage = Math.max(Number(page) || 1, 1);
    const perPage = Math.min(Math.max(Number(limit) || 12, 1), 100);
    const skip = (currentPage - 1) * perPage;

    // Sorting
    const sortOptions = {
      price_asc: { price: 1 },
      price_desc: { price: -1 },
      rating: { rating: -1 },
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      name_asc: { name: 1 },
      name_desc: { name: -1 },
    };

    const sortOption = sortOptions[sort] ?? { createdAt: -1 };

    const [products, total] = await Promise.all([
      Product.find(filter).sort(sortOption).skip(skip).limit(perPage),
      Product.countDocuments(filter),
    ]);

    const pages = Math.ceil(total / perPage);

    return res.status(200).json({
      products,
      page: currentPage,
      pages,
      total,
      limit: perPage,
    });
  } catch (error) {
    console.error('Error in getProducts:', error.message);
    return res.status(500).json({ message: 'Failed to fetch products' });
  }
};



const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    return res.status(200).json(product);
  } catch (error) {
    console.error('Error in getProductById:', error.message);
    return res.status(500).json({ message: 'Failed to fetch product' });
  }
};


// @desc    Get top rated products
// @route   GET /api/products/top
// @access  Public
const getTopProducts = async (req, res) => {
  try {
    const products = await Product.find({})
      .sort({ rating: -1 })
      .limit(10);

    return res.status(200).json(products);
  } catch (error) {
    console.error('Error in getTopProducts:', error.message);
    return res.status(500).json({ message: 'Failed to fetch top products' });
  }
};



const createProductReview = async (req, res) => {
  try {
    const rating = Number(req.body.rating);
    const comment = req.body.comment?.trim();

    // Validate rating
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({
        message: 'Rating must be a whole number between 1 and 5',
      });
    }

    // Validate comment
    if (!comment) {
      return res.status(400).json({ message: 'Review comment is required' });
    }

    if (comment.length > 1000) {
      return res.status(400).json({
        message: 'Review comment cannot exceed 1000 characters',
      });
    }

    // Ensure product exists
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Prevent duplicate reviews by the same user
    const alreadyReviewed = product.reviews.some(
      (review) => review.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      return res.status(400).json({ message: 'Product already reviewed' });
    }

    // Add the new review
    const review = {
      name: req.user.name,
      rating,
      comment,
      user: req.user._id,
    };

    product.reviews.push(review);
    product.numReviews = product.reviews.length;

    // Recalculate average rating
    const totalRating = product.reviews.reduce(
      (sum, item) => sum + item.rating,
      0
    );

    product.rating = totalRating / product.reviews.length;

    await product.save();

    return res.status(201).json({ message: 'Review added' });
  } catch (error) {
    console.error('Error in createProductReview:', error.message);
    return res.status(500).json({ message: 'Failed to create review' });
  }
};


const createProduct = async (req, res) => {
  try {
    const {
      name,
      price,
      originalPrice,
      image,
      brand,
      category,
      countInStock,
      description,
      isFeatured,
    } = req.body;

    // Normalize string inputs
    const productName = name?.trim();
    const productBrand = brand?.trim();
    const productCategory = category?.trim();
    const productDescription = description?.trim();
    const productImage = image?.trim();

    // Validate required fields
    if (
      !productName ||
      price === undefined ||
      !productImage ||
      !productBrand ||
      !productCategory ||
      countInStock === undefined ||
      !productDescription
    ) {
      return res.status(400).json({
        message: 'Please provide all product fields',
      });
    }

    // Validate stock
    const stock = Number(countInStock);

    if (!Number.isInteger(stock) || stock < 0) {
      return res.status(400).json({
        message: 'Stock must be a whole number greater than or equal to 0',
      });
    }

    // Validate selling price
    const sellingPrice = Number(price);

    if (Number.isNaN(sellingPrice) || sellingPrice < 0) {
      return res.status(400).json({
        message: 'Please provide a valid selling price',
      });
    }

    // Validate optional original price
    const hasOriginalPrice =
      originalPrice !== undefined &&
      originalPrice !== null &&
      originalPrice !== '';

    const beforeDiscountPrice = hasOriginalPrice
      ? Number(originalPrice)
      : null;

    if (
      beforeDiscountPrice !== null &&
      (Number.isNaN(beforeDiscountPrice) || beforeDiscountPrice < 0)
    ) {
      return res.status(400).json({
        message: 'Please provide a valid original price',
      });
    }

    if (
      beforeDiscountPrice !== null &&
      beforeDiscountPrice < sellingPrice
    ) {
      return res.status(400).json({
        message: 'Original price cannot be lower than selling price',
      });
    }

    // Create product
    const product = new Product({
      name: productName,
      price: sellingPrice,
      originalPrice: beforeDiscountPrice,
      user: req.user._id,
      image: productImage,
      brand: productBrand,
      category: productCategory,
      countInStock: stock,
      numReviews: 0,
      description: productDescription,
      isFeatured: Boolean(isFeatured),
    });

    const createdProduct = await product.save();

    return res.status(201).json(createdProduct);
  } catch (error) {
    console.error('Error in createProduct:', error.message);
    return res.status(500).json({ message: 'Failed to create product' });
  }
};


const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const {
      name,
      price,
      originalPrice,
      image,
      brand,
      category,
      countInStock,
      description,
      isFeatured,
    } = req.body;

    // Resolve next selling price
    const nextPrice = price !== undefined ? Number(price) : product.price;

    if (Number.isNaN(nextPrice) || nextPrice < 0) {
      return res.status(400).json({
        message: 'Please provide a valid selling price',
      });
    }

    // Resolve next original price (empty string clears it)
    let nextOriginalPrice;

    if (originalPrice === '') {
      nextOriginalPrice = null;
    } else if (originalPrice !== undefined) {
      nextOriginalPrice = Number(originalPrice);
    } else {
      nextOriginalPrice = product.originalPrice;
    }

    if (
      nextOriginalPrice !== null &&
      (Number.isNaN(nextOriginalPrice) || nextOriginalPrice < 0)
    ) {
      return res.status(400).json({
        message: 'Please provide a valid original price',
      });
    }

    if (nextOriginalPrice !== null && nextOriginalPrice < nextPrice) {
      return res.status(400).json({
        message: 'Original price cannot be lower than selling price',
      });
    }

    // Resolve next stock (validate only if provided)
    let nextStock = product.countInStock;

    if (countInStock !== undefined) {
      nextStock = Number(countInStock);

      if (!Number.isInteger(nextStock) || nextStock < 0) {
        return res.status(400).json({
          message: 'Stock must be a whole number greater than or equal to 0',
        });
      }
    }

    // Apply updates
    product.name = name ?? product.name;
    product.price = nextPrice;
    product.originalPrice = nextOriginalPrice;
    product.image = image ?? product.image;
    product.brand = brand ?? product.brand;
    product.category = category ?? product.category;
    product.countInStock = nextStock;
    product.description = description ?? product.description;

    if (isFeatured !== undefined) {
      product.isFeatured = Boolean(isFeatured);
    }

    const updatedProduct = await product.save();

    return res.status(200).json(updatedProduct);
  } catch (error) {
    console.error('Error in updateProduct:', error.message);
    return res.status(500).json({ message: 'Failed to update product' });
  }
};




const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await Product.deleteOne({ _id: product._id });

    return res.status(200).json({ message: 'Product removed' });
  } catch (error) {
    console.error('Error in deleteProduct:', error.message);
    return res.status(500).json({ message: 'Failed to delete product' });
  }
};

const getFeaturedProducts = async (req, res) => {
  try {
    const products = await Product.find({ isFeatured: true })
      .sort({ createdAt: -1 });

    return res.status(200).json(products);
  } catch (error) {
    console.error('Error in getFeaturedProducts:', error.message);
    return res.status(500).json({ message: 'Failed to fetch featured products' });
  }
};


export {
  getProducts,
  getProductById,
  createProductReview,
  createProduct,
  updateProduct,
  deleteProduct,
  getTopProducts,
  getFeaturedProducts
};