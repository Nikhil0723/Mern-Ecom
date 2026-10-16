import Category from "../models/categoryModel.js";

// Get all categories, optionally filtered for the navbar
const getCategories = async (req, res) => {
  try {
    const filter = {};

    if (req.query.showInNavbar === "true") {
      filter.showInNavbar = true;
    }

    const sort =
      req.query.showInNavbar === "true"
        ? { navbarOrder: 1, name: 1 }
        : { name: 1 };

    const categories = await Category.find(filter).sort(sort);

    return res.status(200).json(categories);
  } catch (error) {
    console.error("Error in getCategories:", error.message);
    return res.status(500).json({
      message: "Failed to fetch categories",
    });
  }
};

// Get category by ID
const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    return res.status(200).json(category);
  } catch (error) {
    console.error("Error in getCategoryById:", error.message);
    return res.status(500).json({
      message: "Failed to fetch category",
    });
  }
};

// Create category
const createCategory = async (req, res) => {
  try {
    const {
      name,
      description,
      showInNavbar,
      navbarOrder,
    } = req.body;

    const categoryName = name?.trim();

    if (!categoryName) {
      return res.status(400).json({
        message: "Category name is required",
      });
    }

    const existingCategory = await Category.findOne({
      name: {
        $regex: `^${categoryName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
        $options: "i",
      },
    });

    if (existingCategory) {
      return res.status(400).json({
        message: "Category already exists",
      });
    }

    const category = await Category.create({
      name: categoryName,
      description: description?.trim() || "",
      showInNavbar: showInNavbar === true,
      navbarOrder:
        Number.isFinite(Number(navbarOrder)) &&
        navbarOrder !== "" &&
        navbarOrder !== null &&
        navbarOrder !== undefined
          ? Number(navbarOrder)
          : 0,
    });

    return res.status(201).json(category);
  } catch (error) {
    console.error("Error in createCategory:", error.message);
    return res.status(500).json({
      message: "Failed to create category",
    });
  }
};

// Update category
const updateCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    const {
      name,
      description,
      showInNavbar,
      navbarOrder,
    } = req.body;

    if (name !== undefined) {
      const trimmedName = name.trim();

      if (!trimmedName) {
        return res.status(400).json({
          message: "Category name is required",
        });
      }

      const existingCategory = await Category.findOne({
        _id: { $ne: category._id },
        name: trimmedName,
      }).collation({ locale: "en", strength: 2 });

      if (existingCategory) {
        return res.status(400).json({
          message: "Category already exists",
        });
      }

      category.name = trimmedName;
    }

    if (description !== undefined) {
      category.description = description.trim();
    }

    if (showInNavbar !== undefined) {
      if (typeof showInNavbar !== "boolean") {
        return res.status(400).json({
          message: "showInNavbar must be a boolean",
        });
      }

      category.showInNavbar = showInNavbar;
    }

    if (navbarOrder !== undefined) {
      const order = Number(navbarOrder);

      if (
        navbarOrder === "" ||
        navbarOrder === null ||
        !Number.isFinite(order)
      ) {
        return res.status(400).json({
          message: "navbarOrder must be a valid number",
        });
      }

      category.navbarOrder = order;
    }

    const updatedCategory = await category.save();

    return res.status(200).json(updatedCategory);
  } catch (error) {
    console.error("Error in updateCategory:", error.message);
    return res.status(500).json({
      message: "Failed to update category",
    });
  }
};

// Delete category
const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    await category.deleteOne();

    return res.status(200).json({
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("Error in deleteCategory:", error.message);
    return res.status(500).json({
      message: "Failed to delete category",
    });
  }
};

export {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
