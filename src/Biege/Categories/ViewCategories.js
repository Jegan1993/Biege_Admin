
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { makeApiRequest } from "../../AxiosServices/apiCall";
import * as Yup from "yup";

// ================= YUP VALIDATION =================

const categoryValidationSchema = Yup.object({
  name: Yup.string()
    .trim()
    .required("Category name is required")
    .min(2, "Category name must be at least 2 characters")
    .max(50, "Category name cannot exceed 50 characters"),

  slug: Yup.string()
    .trim()
    .required("Slug is required")
    .matches(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Use lowercase letters, numbers and hyphens only"
    ),

  parentCategory: Yup.string().nullable(),

  description: Yup.string()
    .max(500, "Description cannot exceed 500 characters"),

  displayOrder: Yup.number()
    .transform((value, originalValue) =>
      originalValue === "" ? NaN : value
    )
    .typeError("Display order must be a number")
    .integer("Display order must be a whole number")
    .min(0, "Display order cannot be negative")
    .required("Display order is required"),

  status: Yup.string()
    .oneOf(["ACTIVE", "INACTIVE"], "Invalid category status")
    .required("Status is required"),

  image: Yup.mixed()
    .nullable()
    .test(
      "imageType",
      "Only JPG, JPEG, PNG and WEBP images are allowed",
      (value) => {
        if (!value) return true;

        return [
          "image/jpeg",
          "image/png",
          "image/webp",
        ].includes(value.type);
      }
    )
    .test(
      "imageSize",
      "Image size cannot exceed 5MB",
      (value) => {
        if (!value) return true;
        return value.size <= 5 * 1024 * 1024;
      }
    ),
});

const initialFormData = {
  name: "",
  slug: "",
  parentCategory: "",
  description: "",
  displayOrder: 0,
  status: "ACTIVE",
};

function ViewCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);

  const [image, setImage] = useState(null);
  const [previewImage, setPreviewImage] = useState("");
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({ ...initialFormData });

  // ================= FETCH CATEGORIES =================

  const fetchCategories = async () => {
    try {
      setLoading(true);

      const response = await makeApiRequest({
        url: "get-categories",
        method: "GET",
      });

      const result = response?.data?.data || response?.data || [];

      setCategories(Array.isArray(result) ? result : []);
    } catch (error) {
      console.error("Fetch categories error:", error);
      toast.error("Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // ================= FORM CHANGE =================

  const handleChange = async (e) => {
    const { name, value } = e.target;

    const updatedData = {
      ...formData,
      [name]: value,
    };

    setFormData(updatedData);

    if (errors[name]) {
      try {
        await categoryValidationSchema.validateAt(name, updatedData);

        setErrors((prev) => ({
          ...prev,
          [name]: "",
        }));
      } catch (error) {
        setErrors((prev) => ({
          ...prev,
          [name]: error.message,
        }));
      }
    }
  };

  // ================= IMAGE CHANGE =================

  const handleImageChange = async (e) => {
    const selectedFile = e.target.files?.[0];

    if (!selectedFile) return;

    setImage(selectedFile);

    const imageUrl = URL.createObjectURL(selectedFile);
    setPreviewImage(imageUrl);

    try {
      await categoryValidationSchema.validateAt("image", {
        image: selectedFile,
      });

      setErrors((prev) => ({
        ...prev,
        image: "",
      }));
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        image: error.message,
      }));
    }
  };


  const resetForm = () => {
    setFormData({ ...initialFormData });
    setImage(null);
    setPreviewImage("");
    setEditId(null);
    setErrors({});
    setShowForm(false);
  };


  const handleAddCategory = () => {
    resetForm();
    setShowForm(true);
  };


  const handleAddChild = (category) => {
    resetForm();

    setFormData({
      ...initialFormData,
      parentCategory: category._id,
    });

    setShowForm(true);
  };


  const validateForm = async () => {
    try {
      await categoryValidationSchema.validate(
        {
          ...formData,
          image,
        },
        {
          abortEarly: false,
        }
      );

      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        const validationErrors = {};

        error.inner.forEach((item) => {
          if (item.path && !validationErrors[item.path]) {
            validationErrors[item.path] = item.message;
          }
        });

        setErrors(validationErrors);
      }

      return false;
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    const isValid = await validateForm();

    if (!isValid) return;

    try {
      const payload = new FormData();

      payload.append("name", formData.name.trim());
      payload.append("slug", formData.slug.trim());
      payload.append("parentCategory", formData.parentCategory || "");
      payload.append("description", formData.description);
      payload.append("displayOrder", formData.displayOrder);
      payload.append("status", formData.status);

      if (image) {
        payload.append("image", image);
      }

      const response = await makeApiRequest({
        url: editId
          ? `update-category/${editId}`
          : "create-category",
        method: editId ? "PUT" : "POST",
        data: payload,
        header: "image",
      });

      if (
        response?.data?.status === false ||
        response?.status === false
      ) {
        toast.error(
          response?.data?.message || "Category operation failed"
        );
        return;
      }

      toast.success(
        editId
          ? "Category updated successfully"
          : "Category created successfully"
      );

      resetForm();
      fetchCategories();
    } catch (error) {
      console.error("Submit category error:", error);

      toast.error(
        error?.response?.data?.message || "Something went wrong"
      );
    }
  };


  const handleEdit = (category) => {
    setErrors({});
    setEditId(category._id);

    setFormData({
      name: category.name || "",
      slug: category.slug || "",
      parentCategory:
        category.parentCategory?._id ||
        category.parentCategory ||
        "",
      description: category.description || "",
      displayOrder: category.displayOrder ?? 0,
      status: category.status || "ACTIVE",
    });

    setImage(null);
    setPreviewImage(category.image || "");
    setShowForm(true);
  };


  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this category?"
    );

    if (!confirmDelete) return;

    try {
      const response = await makeApiRequest({
        url: `delete-category/${id}`,
        method: "DELETE",
      });

      if (
        response?.data?.status === false ||
        response?.status === false
      ) {
        toast.error(
          response?.data?.message || "Delete failed"
        );
        return;
      }

      toast.success("Category deleted successfully");

      resetForm();
      fetchCategories();
    } catch (error) {
      console.error("Delete category error:", error);

      toast.error(
        error?.response?.data?.message ||
        "Failed to delete category"
      );
    }
  };


  const getParentId = (category) =>
    category?.parentCategory?._id ||
    category?.parentCategory ||
    null;

  const getDescendantIds = (categoryId) => {
    const descendantIds = new Set();

    const findChildren = (parentId) => {
      categories.forEach((item) => {
        const itemParentId = getParentId(item);

        if (String(itemParentId || "") === String(parentId)) {
          if (!descendantIds.has(String(item._id))) {
            descendantIds.add(String(item._id));
            findChildren(item._id);
          }
        }
      });
    };

    findChildren(categoryId);

    return descendantIds;
  };

  const buildCategoryTree = (items, parentId = null) => {
    return items
      .filter(
        (item) =>
          String(getParentId(item) || "") ===
          String(parentId || "")
      )
      .sort(
        (a, b) =>
          Number(a.displayOrder || 0) -
          Number(b.displayOrder || 0)
      )
      .map((item) => ({
        ...item,
        children: buildCategoryTree(items, item._id),
      }));
  };

  const flattenCategories = (items, level = 0) => {
    let result = [];

    items.forEach((item) => {
      result.push({
        ...item,
        level,
      });

      if (item.children?.length) {
        result = result.concat(
          flattenCategories(item.children, level + 1)
        );
      }
    });

    return result;
  };

  const categoryTree = buildCategoryTree(categories);
  const flattenedCategories = flattenCategories(categoryTree);

  const excludedIds = editId
    ? getDescendantIds(editId)
    : new Set();


  const getCategoryStyle = (level) => {
    if (level === 0) {
      return {
        background: "#F2EDFF",
        borderLeft: "5px solid #7652C8",
        color: "#39246B",
      };
    }

    if (level === 1) {
      return {
        background: "#EAF4FF",
        borderLeft: "5px solid #3986D7",
        color: "#174B80",
      };
    }

    if (level === 2) {
      return {
        background: "#EAF8F0",
        borderLeft: "5px solid #39A36B",
        color: "#205D3D",
      };
    }

    return {
      background: "#FFF4E8",
      borderLeft: "5px solid #D9903D",
      color: "#81501D",
    };
  };


  const getInputStyle = (fieldName) => ({
    ...styles.input,
    ...(errors[fieldName] ? styles.inputError : {}),
  });

  const getTextareaStyle = (fieldName) => ({
    ...styles.textarea,
    ...(errors[fieldName] ? styles.inputError : {}),
  });


  const getParentCategoryName = (category) => {
    const parentId = getParentId(category);

    if (!parentId) {
      return "Main Category";
    }

    const parent = categories.find(
      (item) => String(item._id) === String(parentId)
    );

    return (
      parent?.name ||
      category.parentCategory?.name ||
      "Parent category not found"
    );
  };


  const renderCategoryFields = (category) => (
    <div style={styles.categoryFields}>
      <div style={styles.categoryField}>
        <span style={styles.fieldLabel}>Category Name</span>
        <span style={styles.fieldValue}>
          {category.name || "-"}
        </span>
      </div>

      <div style={styles.categoryField}>
        <span style={styles.fieldLabel}>Slug</span>
        <span style={styles.fieldValue}>
          {category.slug || "-"}
        </span>
      </div>

      <div style={styles.categoryField}>
        <span style={styles.fieldLabel}>Parent Category</span>
        <span style={styles.fieldValue}>
          {getParentCategoryName(category)}
        </span>
      </div>

      <div style={styles.categoryField}>
        <span style={styles.fieldLabel}>Description</span>
        <span style={styles.fieldValue}>
          {category.description || "-"}
        </span>
      </div>

      <div style={styles.categoryField}>
        <span style={styles.fieldLabel}>Display Order</span>
        <span style={styles.fieldValue}>
          {category.displayOrder ?? 0}
        </span>
      </div>

      <div style={styles.categoryField}>
        <span style={styles.fieldLabel}>Status</span>
        <span style={styles.fieldValue}>
          {category.status || "ACTIVE"}
        </span>
      </div>

      {/* <div style={styles.categoryField}>
          <span style={styles.fieldLabel}>Category Image</span>

          {category.image ? (
            <div style={styles.listImageContainer}>
              <img
                src={category.image}
                alt={category.name || "Category"}
                style={styles.listImage}
              />
              <span style={styles.fieldValue}>Image uploaded</span>
            </div>
          ) : (
            <span style={styles.fieldValue}>No image</span>
          )}
        </div> */}
    </div>
  );


  const renderChildCategory = (category, level = 1) => {
    const rowStyle = getCategoryStyle(level);

    return (
      <React.Fragment key={category._id}>
        <div
          style={{
            ...styles.categoryRow,
            ...rowStyle,
            marginLeft: level * 28,
          }}
        >
          <div style={styles.categoryInfo}>
            <div style={styles.smallImage}>
              {category.image ? (
                <img
                  src={category.image}
                  alt={category.name}
                  style={styles.thumbnail}
                />
              ) : (
                <span style={styles.noImageText}>IMG</span>
              )}
            </div>

            <div style={styles.categoryDetails}>
              {renderCategoryFields(category)}
            </div>
          </div>

          <div style={styles.rowRight}>
            <span
              style={{
                ...styles.statusBadge,
                background:
                  category.status === "ACTIVE"
                    ? "#D9F5E4"
                    : "#FFE6E6",
                color:
                  category.status === "ACTIVE"
                    ? "#167344"
                    : "#B42318",
              }}
            >
              {category.status || "ACTIVE"}
            </span>

            <button
              type="button"
              style={styles.addChildButton}
              onClick={() => handleAddChild(category)}
            >
              + Add Child
            </button>

            <button
              type="button"
              style={styles.editButton}
              onClick={() => handleEdit(category)}
            >
              Edit
            </button>
          </div>
        </div>

        {category.children?.length > 0 && (
          <div style={styles.childContainer}>
            {category.children.map((child) =>
              renderChildCategory(child, level + 1)
            )}
          </div>
        )}
      </React.Fragment>
    );
  };


  return (
    <div style={styles.page}>

      <div style={styles.header}>
        <div>
          <h2 style={styles.heading}>Categories</h2>
          <p style={styles.subHeading}>
            Manage parent and child categories
          </p>
        </div>

        {!showForm && (
          <button
            type="button"
            style={styles.createButton}
            onClick={handleAddCategory}
          >
            + Create Category
          </button>
        )}
      </div>


      {showForm && (
        <div style={styles.formContainer}>
          <div style={styles.formHeader}>
            <h3 style={styles.formTitle}>
              {editId ? "Edit Category" : "Create Category"}
            </h3>

            <button
              type="button"
              style={styles.closeButton}
              onClick={resetForm}
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div style={styles.formGrid}>

              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Category Name *
                </label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter category name"
                  style={getInputStyle("name")}
                />

                {errors.name && (
                  <span style={styles.errorText}>
                    {errors.name}
                  </span>
                )}
              </div>


              <div style={styles.formGroup}>
                <label style={styles.label}>Slug *</label>

                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  placeholder="Enter slug"
                  style={getInputStyle("slug")}
                />

                {errors.slug && (
                  <span style={styles.errorText}>
                    {errors.slug}
                  </span>
                )}
              </div>


              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Parent Category
                </label>

                <select
                  name="parentCategory"
                  value={formData.parentCategory}
                  onChange={handleChange}
                  style={styles.input}
                >
                  <option value="">Main Category</option>

                  {flattenedCategories
                    .filter(
                      (item) =>
                        String(item._id) !==
                        String(editId || "") &&
                        !excludedIds.has(String(item._id))
                    )
                    .map((item) => (
                      <option
                        key={item._id}
                        value={item._id}
                      >
                        {"   ".repeat(item.level)}
                        {item.name}
                      </option>
                    ))}
                </select>
              </div>


              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Display Order *
                </label>

                <input
                  type="number"
                  name="displayOrder"
                  value={formData.displayOrder}
                  onChange={handleChange}
                  style={getInputStyle("displayOrder")}
                />

                {errors.displayOrder && (
                  <span style={styles.errorText}>
                    {errors.displayOrder}
                  </span>
                )}
              </div>


              <div style={styles.formGroup}>
                <label style={styles.label}>Status *</label>

                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  style={getInputStyle("status")}
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>

                {errors.status && (
                  <span style={styles.errorText}>
                    {errors.status}
                  </span>
                )}
              </div>


              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Category Image
                </label>

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                  style={styles.fileInput}
                />

                {errors.image && (
                  <span style={styles.errorText}>
                    {errors.image}
                  </span>
                )}

                {previewImage && (
                  <div style={styles.previewContainer}>
                    <img
                      src={previewImage}
                      alt="Category preview"
                      style={styles.previewImage}
                    />
                  </div>
                )}
              </div>


              <div
                style={{
                  ...styles.formGroup,
                  gridColumn: "1 / -1",
                }}
              >
                <label style={styles.label}>
                  Description
                </label>

                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter category description"
                  rows={4}
                  style={getTextareaStyle("description")}
                />

                {errors.description && (
                  <span style={styles.errorText}>
                    {errors.description}
                  </span>
                )}
              </div>
            </div>

            <div style={styles.formActions}>
              {editId && (
                <button
                  type="button"
                  style={styles.deleteButton}
                  onClick={() => handleDelete(editId)}
                >
                  Delete
                </button>
              )}

              <button
                type="button"
                style={styles.cancelButton}
                onClick={resetForm}
              >
                Cancel
              </button>

              <button
                type="submit"
                style={styles.saveButton}
              >
                {editId ? "Update Category" : "Create Category"}
              </button>
            </div>
          </form>
        </div>
      )}


      {!showForm && (
        <div style={styles.listContainer}>
          {loading ? (
            <div style={styles.message}>
              Loading categories...
            </div>
          ) : categoryTree.length === 0 ? (
            <div style={styles.emptyState}>
              <h3>No Categories Found</h3>
              <p>Create your first category to get started.</p>
            </div>
          ) : (
            categoryTree.map((parent) => {
              const parentStyle = getCategoryStyle(0);

              return (
                <div
                  key={parent._id}
                  style={styles.parentSection}
                >
                  <div
                    style={{
                      ...styles.categoryRow,
                      ...parentStyle,
                    }}
                  >
                    <div style={styles.categoryInfo}>
                      <div style={styles.parentImage}>
                        {parent.image ? (
                          <img
                            src={parent.image}
                            alt={parent.name}
                            style={styles.thumbnail}
                          />
                        ) : (
                          <span style={styles.noImageText}>
                            IMG
                          </span>
                        )}
                      </div>

                      <div style={styles.categoryDetails}>
                        {renderCategoryFields(parent)}

                        <div style={styles.categoryMeta}>
                          {parent.children?.length || 0} direct child categories
                        </div>
                      </div>
                    </div>

                    <div style={styles.rowRight}>
                      <span
                        style={{
                          ...styles.statusBadge,
                          background:
                            parent.status === "ACTIVE"
                              ? "#D9F5E4"
                              : "#FFE6E6",
                          color:
                            parent.status === "ACTIVE"
                              ? "#167344"
                              : "#B42318",
                        }}
                      >
                        {parent.status || "ACTIVE"}
                      </span>

                      <button
                        type="button"
                        style={styles.addChildButton}
                        onClick={() => handleAddChild(parent)}
                      >
                        + Add Child
                      </button>

                      <button
                        type="button"
                        style={styles.editButton}
                        onClick={() => handleEdit(parent)}
                      >
                        Edit
                      </button>
                    </div>
                  </div>

                  {parent.children?.length > 0 && (
                    <div style={styles.childContainer}>
                      {parent.children.map((child) =>
                        renderChildCategory(child, 1)
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}


const styles = {
  page: {
    width: "100%",
    padding: "24px",
    boxSizing: "border-box",
    background: "#F8F9FC",
    minHeight: "100vh",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "15px",
    marginBottom: "25px",
  },

  heading: {
    margin: 0,
    fontSize: "25px",
    fontWeight: 700,
    color: "#222B45",
  },

  subHeading: {
    margin: "7px 0 0",
    color: "#8A94A6",
    fontSize: "14px",
  },

  createButton: {
    border: "none",
    background: "#5B45B5",
    color: "#FFFFFF",
    padding: "12px 20px",
    borderRadius: "7px",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
  },

  listContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },

  parentSection: {
    display: "flex",
    flexDirection: "column",
    gap: "9px",
  },

  categoryRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "12px",
    padding: "14px 16px",
    borderRadius: "7px",
    minHeight: "72px",
    boxSizing: "border-box",
  },

  categoryInfo: {
    display: "flex",
    alignItems: "center",
    gap: "13px",
    minWidth: "180px",
    flex: 1,
  },

  parentImage: {
    width: "52px",
    height: "52px",
    borderRadius: "7px",
    overflow: "hidden",
    background: "#FFFFFF",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  smallImage: {
    width: "42px",
    height: "42px",
    borderRadius: "6px",
    overflow: "hidden",
    background: "#FFFFFF",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  thumbnail: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },

  noImageText: {
    fontSize: "10px",
    fontWeight: 700,
    color: "#9AA3B2",
  },

  categoryDetails: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    flex: 1,
    minWidth: 0,
  },

  categoryFields: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
    gap: "10px 18px",
    width: "100%",
  },

  categoryField: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    minWidth: 0,
  },

  fieldLabel: {
    fontSize: "10px",
    fontWeight: 700,
    color: "#788397",
    textTransform: "uppercase",
  },

  fieldValue: {
    fontSize: "12px",
    fontWeight: 600,
    color: "#344054",
    overflowWrap: "anywhere",
  },

  listImageContainer: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
  },

  listImage: {
    width: "32px",
    height: "32px",
    objectFit: "cover",
    borderRadius: "5px",
    border: "1px solid #E1E5EC",
  },

  parentName: {
    fontSize: "16px",
    fontWeight: 700,
  },

  categoryName: {
    fontSize: "14px",
    fontWeight: 600,
  },

  categoryMeta: {
    fontSize: "12px",
    color: "#788397",
  },

  rowRight: {
    display: "flex",
    alignItems: "center",
    gap: "9px",
    flexWrap: "wrap",
  },

  statusBadge: {
    fontSize: "10px",
    fontWeight: 700,
    padding: "5px 9px",
    borderRadius: "20px",
  },

  addChildButton: {
    border: "1px solid #A6B6D0",
    background: "#FFFFFF",
    color: "#3D5D83",
    padding: "8px 11px",
    borderRadius: "5px",
    fontSize: "12px",
    fontWeight: 600,
    cursor: "pointer",
  },

  editButton: {
    border: "none",
    background: "#344C75",
    color: "#FFFFFF",
    padding: "8px 16px",
    borderRadius: "5px",
    fontSize: "12px",
    fontWeight: 600,
    cursor: "pointer",
  },

  childContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },

  message: {
    padding: "35px",
    textAlign: "center",
    color: "#7A8495",
  },

  emptyState: {
    textAlign: "center",
    padding: "55px 20px",
    background: "#FFFFFF",
    border: "1px solid #E7EAF0",
    borderRadius: "8px",
    color: "#7A8495",
  },

  formContainer: {
    background: "#FFFFFF",
    border: "1px solid #E7EAF0",
    borderRadius: "9px",
    padding: "22px",
    boxShadow: "0 3px 12px rgba(30, 40, 70, 0.04)",
  },

  formHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "22px",
  },

  formTitle: {
    margin: 0,
    color: "#222B45",
    fontSize: "19px",
    fontWeight: 700,
  },

  closeButton: {
    border: "none",
    background: "#F1F2F6",
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    cursor: "pointer",
    color: "#555E70",
  },

  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
    gap: "18px",
  },

  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },

  label: {
    fontSize: "13px",
    fontWeight: 600,
    color: "#424B5C",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "11px 12px",
    border: "1px solid #DCE1E9",
    borderRadius: "6px",
    outline: "none",
    fontSize: "13px",
    color: "#333D50",
    background: "#FFFFFF",
  },

  inputError: {
    border: "1px solid #DC3545",
    background: "#FFF8F8",
  },

  errorText: {
    display: "block",
    color: "#DC3545",
    fontSize: "12px",
    fontWeight: 500,
    lineHeight: "16px",
    marginTop: "2px",
  },

  fileInput: {
    width: "100%",
    fontSize: "13px",
    padding: "9px",
    border: "1px solid #DCE1E9",
    borderRadius: "6px",
    background: "#FFFFFF",
  },

  textarea: {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px",
    border: "1px solid #DCE1E9",
    borderRadius: "6px",
    outline: "none",
    resize: "vertical",
    fontSize: "13px",
    fontFamily: "inherit",
  },

  previewContainer: {
    marginTop: "5px",
  },

  previewImage: {
    width: "100px",
    height: "100px",
    objectFit: "cover",
    borderRadius: "7px",
    border: "1px solid #E1E5EC",
  },

  formActions: {
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "10px",
    marginTop: "25px",
    paddingTop: "18px",
    borderTop: "1px solid #E9ECF1",
  },

  cancelButton: {
    border: "1px solid #D5DAE3",
    background: "#FFFFFF",
    color: "#4D586B",
    padding: "10px 18px",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: 600,
  },

  saveButton: {
    border: "none",
    background: "#5B45B5",
    color: "#FFFFFF",
    padding: "10px 20px",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: 600,
  },

  deleteButton: {
    border: "none",
    background: "#D92D20",
    color: "#FFFFFF",
    padding: "10px 18px",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: 600,
    marginRight: "auto",
  },
};

export default ViewCategories;
