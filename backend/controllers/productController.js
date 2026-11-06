import Product, { productCategories } from '../models/Product.js';

/**
 * @desc    Get all products with search, filter, sort, and pagination
 * @route   GET /api/products
 * @access  Public
 */
export const getProducts = async (req, res, next) => {
  try {
    const { category, search, minPrice, maxPrice, sort, page = 1, limit = 12 } = req.query;

    const query = {};

    // Filter by Category
    if (category) {
      query.category = category;
    }

    // Search by Name or Description (case-insensitive regex)
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: { $regex: searchRegex } },
        { description: { $regex: searchRegex } }
      ];
    }

    // Filter by Price Range
    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {};
      if (minPrice !== undefined && minPrice !== '') {
        const parsedMin = Number(minPrice);
        if (!isNaN(parsedMin)) {
          query.price.$gte = parsedMin;
        }
      }
      if (maxPrice !== undefined && maxPrice !== '') {
        const parsedMax = Number(maxPrice);
        if (!isNaN(parsedMax)) {
          query.price.$lte = parsedMax;
        }
      }
      if (Object.keys(query.price).length === 0) {
        delete query.price;
      }
    }

    // Sorting
    let sortOptions = { createdAt: -1 }; // Default: newest first
    if (sort === 'price_asc') {
      sortOptions = { price: 1 };
    } else if (sort === 'price_desc') {
      sortOptions = { price: -1 };
    } else if (sort === 'rating') {
      sortOptions = { rating: -1 };
    } else if (sort === 'newest') {
      sortOptions = { createdAt: -1 };
    }

    // Pagination
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 12);
    const skip = (pageNum - 1) * limitNum;

    // Execute queries
    const [total, products] = await Promise.all([
      Product.countDocuments(query),
      Product.find(query).sort(sortOptions).skip(skip).limit(limitNum)
    ]);

    const totalPages = Math.ceil(total / limitNum) || 1;

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      page: pageNum,
      pages: totalPages,
      products
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single product by ID
 * @route   GET /api/products/:id
 * @access  Public
 */
export const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      product
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new product
 * @route   POST /api/products
 * @access  Private/Admin
 */
export const createProduct = async (req, res, next) => {
  try {
    const {
      name,
      description,
      price,
      category,
      imageUrl,
      stock = 0,
      featured = false,
      rating = 0,
      numReviews = 0
    } = req.body;

    const product = await Product.create({
      name,
      description,
      price,
      category,
      imageUrl,
      stock,
      featured,
      rating,
      numReviews
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update existing product
 * @route   PUT /api/products/:id
 * @access  Private/Admin
 */
export const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      product
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a product
 * @route   DELETE /api/products/:id
 * @access  Private/Admin
 */
export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    await product.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get featured products
 * @route   GET /api/products/featured
 * @access  Public
 */
export const getFeaturedProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ featured: true }).limit(8);

    res.status(200).json({
      success: true,
      count: products.length,
      products
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all distinct product categories
 * @route   GET /api/products/categories
 * @access  Public
 */
export const getCategories = async (req, res, next) => {
  try {
    const categoriesFromDb = await Product.distinct('category');
    // Ensure all supported categories are returned even before all are seeded
    const categories = categoriesFromDb.length > 0 ? categoriesFromDb : productCategories;

    res.status(200).json({
      success: true,
      categories
    });
  } catch (error) {
    next(error);
  }
};
