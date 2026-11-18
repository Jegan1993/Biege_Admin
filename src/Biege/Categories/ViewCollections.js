
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import * as Yup from "yup";
import DataTable from "react-data-table-component";
import { makeApiRequest } from "../../AxiosServices/apiCall";

const initialValues = {
  name: "",
  slug: "",
  image: null,
  description: "",
  products: [],
  displayOrder: 0,
  status: "DRAFT",
};

const collectionSchema = Yup.object().shape({
  name: Yup.string()
    .trim()
    .required("Collection name is required")
    .max(100, "Name cannot exceed 100 characters"),

  slug: Yup.string()
    .trim()
    .required("Collection slug is required")
    .matches(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Enter a valid slug (example: best-sellers)"
    ),

  image: Yup.mixed()
    .nullable()
    .test("image-required", "Collection image is required", function (value) {
      return Boolean(value) || Boolean(this.parent.existingImage);
    })
    .test(
      "image-type",
      "Only JPG, JPEG, PNG and WEBP images are allowed",
      (file) => {
        if (!file) return true;
        return ["image/jpeg", "image/png", "image/webp"].includes(file.type);
      }
    )
    .test("image-size", "Image size must be less than 5 MB", (file) => {
      if (!file) return true;
      return file.size <= 5 * 1024 * 1024;
    }),

  description: Yup.string().max(
    500,
    "Description cannot exceed 500 characters"
  ),

  products: Yup.array()
    .of(Yup.string().required())
    .min(1, "Please select at least one product")
    .required("Please select products"),

  displayOrder: Yup.number()
    .typeError("Display order must be a number")
    .integer("Display order must be a whole number")
    .min(0, "Display order cannot be negative")
    .required("Display order is required"),

  status: Yup.string()
    .oneOf(["DRAFT", "ACTIVE", "ARCHIVED"])
    .required("Status is required"),
});

function ViewCollections() {
  const [collections, setCollections] = useState([]);
  const [products, setProducts] = useState([]);

  const [formData, setFormData] = useState(initialValues);
  const [existingImage, setExistingImage] = useState("");

  const [errors, setErrors] = useState({});
  const [editId, setEditId] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    fetchCollections();
    fetchProducts();
  }, []);

  // Fetch collections
  const fetchCollections = async () => {
    try {
      setLoading(true);

      const response = await makeApiRequest({
        url: "get-collections",
        method: "GET",
      });

      if (response.status) {
        setCollections(
          Array.isArray(response.data) ? response.data : []
        );
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to fetch collections"
      );
    } finally {
      setLoading(false);
    }
  };

  // Fetch active products
  const fetchProducts = async () => {
    try {
      const response = await makeApiRequest({
        url: "getproduct?limit=500&page=1",
        method: "GET",
      });

      if (response.status) {
        const productData = Array.isArray(response.data)
          ? response.data
          : Array.isArray(response.data?.products)
            ? response.data.products
            : [];

        setProducts(
          productData.filter(
            (product) => product.status === "ACTIVE"
          )
        );
      }
    } catch (error) {
      console.error("Fetch products error:", error);
      toast.error("Failed to fetch products");
    }
  };

  // Handle normal inputs
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  // Handle image file
  const handleImageChange = (e) => {
    const file = e.target.files?.[0] || null;

    setFormData((prev) => ({
      ...prev,
      image: file,
    }));

    setErrors((prev) => ({
      ...prev,
      image: "",
    }));
  };

  // Handle product selection
  const handleProductSelect = (productId) => {
    const id = String(productId);

    setFormData((prev) => {
      const selectedProducts = prev.products.map((item) => String(item));

      const isSelected = selectedProducts.includes(id);

      const updatedProducts = isSelected
        ? selectedProducts.filter((item) => item !== id)
        : [...selectedProducts, id];

      return {
        ...prev,
        products: updatedProducts,
      };
    });

    setErrors((prev) => ({
      ...prev,
      products: "",
    }));
  };

  // Validate form
  const validateForm = async () => {
    try {
      await collectionSchema.validate(
        {
          ...formData,
          existingImage,
        },
        { abortEarly: false }
      );

      setErrors({});
      return true;
    } catch (error) {
      const validationErrors = {};

      error.inner.forEach((item) => {
        if (!validationErrors[item.path]) {
          validationErrors[item.path] = item.message;
        }
      });

      setErrors(validationErrors);
      return false;
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData(initialValues);
    setExistingImage("");
    setErrors({});
    setEditId(null);
    setShowForm(false);
  };

  // Create form
  const handleCreate = () => {
    setFormData(initialValues);
    setExistingImage("");
    setErrors({});
    setEditId(null);
    setShowForm(true);
  };

  // Edit collection
  const handleEdit = async (id) => {
    try {
      const response = await makeApiRequest({
        url: `get-collection/${id}`,
        method: "GET",
      });

      if (response.status && response.data) {
        const collection = response.data;

        setExistingImage(collection.image || "");

        setFormData({
          name: collection.name || "",
          slug: collection.slug || "",
          image: null,
          description: collection.description || "",
          products: Array.isArray(collection.products)
            ? collection.products.map((product) =>
              typeof product === "object"
                ? String(product._id)
                : String(product)
            )
            : [],
          displayOrder: collection.displayOrder ?? 0,
          status: collection.status || "DRAFT",
        });

        setErrors({});
        setEditId(id);
        setShowForm(true);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to get collection"
      );
    }
  };

  // Submit create/update
  const handleSubmit = async (e) => {
    e.preventDefault();

    const isValid = await validateForm();

    if (!isValid) {
      toast.error("Please correct the validation errors");
      return;
    }

    try {
      setSaving(true);

      const payload = new FormData();

      payload.append("name", formData.name.trim());
      payload.append("slug", formData.slug.trim().toLowerCase());
      payload.append("description", formData.description.trim());

      payload.append(
        "products",
        JSON.stringify(formData.products.map((id) => String(id)))
      );

      payload.append("displayOrder", String(Number(formData.displayOrder)));
      payload.append("status", formData.status);

      if (formData.image instanceof File) {
        payload.append("image", formData.image);
      }

      const response = await makeApiRequest({
        url: editId
          ? `update-collection/${editId}`
          : "create-collection",
        method: editId ? "PUT" : "POST",
        data: payload,
        header: "image",
      });

      if (response.status) {
        toast.success(
          editId
            ? "Collection updated successfully"
            : "Collection created successfully"
        );

        resetForm();
        fetchCollections();
      } else {
        toast.error(response.message || "Collection save failed");
      }
    } catch (error) {
      console.error("COLLECTION SAVE ERROR:", error);

      toast.error(
        error.response?.data?.message ||
        error.message ||
        "Failed to save collection"
      );
    } finally {
      setSaving(false);
    }
  };

  // Delete collection
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this collection?")) {
      return;
    }

    try {
      const response = await makeApiRequest({
        url: `delete-collection/${id}`,
        method: "DELETE",
      });

      if (response.status) {
        toast.success("Collection deleted successfully");
        fetchCollections();
      } else {
        toast.error(response.message || "Delete failed");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to delete collection"
      );
    }
  };

  // DataTable columns
  const columns = useMemo(
    () => [
      {
        name: "#",
        cell: (row, index) => index + 1,
        width: "70px",
        center: true,
      },
      {
        name: "Image",
        cell: (row) =>
          row.image ? (
            <img
              src={row.image}
              alt={row.name}
              width="50"
              height="50"
              style={{
                objectFit: "cover",
                borderRadius: "5px",
              }}
            />
          ) : (
            "-"
          ),
        width: "100px",
        center: true,
      },
      {
        name: "Name",
        selector: (row) => row.name,
        sortable: true,
        grow: 1,
      },
      {
        name: "Slug",
        selector: (row) => row.slug,
        sortable: true,
        grow: 1,
      },
      {
        name: "Products",
        selector: (row) =>
          Array.isArray(row.products) ? row.products.length : 0,
        sortable: true,
        center: true,
        width: "110px",
      },
      {
        name: "Order",
        selector: (row) => row.displayOrder,
        sortable: true,
        center: true,
        width: "100px",
      },
      {
        name: "Status",
        cell: (row) => (
          <span
            style={{
              padding: "5px 10px",
              borderRadius: "5px",
              fontSize: "12px",
              fontWeight: "600",
              color:
                row.status === "ACTIVE"
                  ? "#198754"
                  : row.status === "DRAFT"
                    ? "#856404"
                    : "#dc3545",
              backgroundColor:
                row.status === "ACTIVE"
                  ? "#d1e7dd"
                  : row.status === "DRAFT"
                    ? "#fff3cd"
                    : "#f8d7da",
            }}
          >
            {row.status}
          </span>
        ),
        sortable: true,
        center: true,
        width: "120px",
      },
      {
        name: "Actions",
        cell: (row) => (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              whiteSpace: "nowrap",
            }}
          >
            <button
              type="button"
              onClick={() => handleEdit(row._id)}
              style={{
                display: "inline-block",
                backgroundColor: "#0d6efd",
                color: "#ffffff",
                border: "1px solid #0d6efd",
                borderRadius: "5px",
                padding: "6px 14px",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: "500",
              }}
            >
              Edit
            </button>

            <button
              type="button"
              onClick={() => handleDelete(row._id)}
              style={{
                display: "inline-block",
                backgroundColor: "#dc3545",
                color: "#ffffff",
                border: "1px solid #dc3545",
                borderRadius: "5px",
                padding: "6px 14px",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: "500",
              }}
            >
              Delete
            </button>
          </div>
        ),
        minWidth: "190px",
        center: true,
        ignoreRowClick: true,
        button: true,
      },
    ],
    []
  );

  // Search collections
  const filteredCollections = useMemo(() => {
    const search = searchText.trim().toLowerCase();

    if (!search) return collections;

    return collections.filter(
      (collection) =>
        collection.name?.toLowerCase().includes(search) ||
        collection.slug?.toLowerCase().includes(search)
    );
  }, [collections, searchText]);

  return (
    <div className="container-fluid py-3">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4>Collections</h4>
          <p className="text-muted">
            Manage manual product collections
          </p>
        </div>

        {!showForm && (
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleCreate}
          >
            Add Collection
          </button>
        )}
      </div>

      {showForm ? (
        <div className="card">
          <div className="card-header">
            <h5>{editId ? "Edit Collection" : "Create Collection"}</h5>
          </div>

          <div className="card-body">
            <form onSubmit={handleSubmit} noValidate>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Collection Name *</label>
                  <input
                    type="text"
                    name="name"
                    className="form-control"
                    value={formData.name}
                    onChange={handleChange}
                  />
                  {errors.name && (
                    <small className="text-danger">{errors.name}</small>
                  )}
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">Slug *</label>
                  <input
                    type="text"
                    name="slug"
                    className="form-control"
                    value={formData.slug}
                    onChange={handleChange}
                  />
                  {errors.slug && (
                    <small className="text-danger">{errors.slug}</small>
                  )}
                </div>

                <div className="col-md-12 mb-3">
                  <label className="form-label">Collection Image *</label>
                  <input
                    type="file"
                    className="form-control"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageChange}
                  />

                  {errors.image && (
                    <small className="text-danger">{errors.image}</small>
                  )}

                  {(formData.image || existingImage) && (
                    <div className="mt-2">
                      <img
                        src={
                          formData.image
                            ? URL.createObjectURL(formData.image)
                            : existingImage
                        }
                        alt="Collection preview"
                        width="120"
                        height="100"
                        style={{ objectFit: "cover" }}
                      />
                    </div>
                  )}

                  <small className="text-muted d-block">
                    JPG, PNG or WEBP. Maximum size 5 MB.
                  </small>
                </div>

                <div className="col-md-12 mb-3">
                  <label className="form-label">Description</label>
                  <textarea
                    name="description"
                    className="form-control"
                    rows="3"
                    value={formData.description}
                    onChange={handleChange}
                  />
                  {errors.description && (
                    <small className="text-danger">
                      {errors.description}
                    </small>
                  )}
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">Display Order *</label>
                  <input
                    type="number"
                    name="displayOrder"
                    min="0"
                    className="form-control"
                    value={formData.displayOrder}
                    onChange={handleChange}
                  />
                  {errors.displayOrder && (
                    <small className="text-danger">
                      {errors.displayOrder}
                    </small>
                  )}
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">Status *</label>
                  <select
                    name="status"
                    className="form-select"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="ACTIVE">Active</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>
                  {errors.status && (
                    <small className="text-danger">{errors.status}</small>
                  )}
                </div>
              </div>

              <hr />

              <h5>Select Products *</h5>
              <p className="text-muted">
                Select at least one active product for this collection.
              </p>

              <div className="border rounded p-3">
                {products.length === 0 ? (
                  <p className="text-muted mb-0">
                    No active products available.
                  </p>
                ) : (
                  <div className="row">
                    {products.map((product) => {
                      const productId = String(product._id);

                      const isSelected = formData.products.some(
                        (id) => String(id) === productId
                      );

                      return (
                        <div
                          className="col-md-6 col-lg-4 mb-3"
                          key={productId}
                        >
                          <div className="border rounded p-2 d-flex align-items-center gap-2 h-100">
                            <input
                              type="checkbox"
                              id={`product-${productId}`}
                              checked={isSelected}
                              onChange={() => handleProductSelect(productId)}
                              style={{
                                width: "18px",
                                height: "18px",
                                cursor: "pointer",
                                flexShrink: 0,
                              }}
                            />

                            <label
                              htmlFor={`product-${productId}`}
                              className="d-flex align-items-center gap-2 mb-0"
                              style={{ cursor: "pointer" }}
                            >
                              {product.image && (
                                <img
                                  src={product.image}
                                  alt={product.name}
                                  width="50"
                                  height="50"
                                  style={{ objectFit: "cover" }}
                                />
                              )}

                              <span>
                                <strong className="d-block">
                                  {product.name}
                                </strong>

                                <small className="text-muted d-block">
                                  SKU: {product.sku}
                                </small>

                                <small className="d-block">
                                  Price: {product.price}
                                </small>
                              </span>
                            </label>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="mt-2">
                <small>
                  Selected products: {formData.products.length}
                </small>

                {errors.products && (
                  <div>
                    <small className="text-danger">
                      {errors.products}
                    </small>
                  </div>
                )}
              </div>

              <div className="d-flex gap-2 mt-4">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editId
                      ? "Update Collection"
                      : "Create Collection"}
                </button>

                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={resetForm}
                  disabled={saving}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="card-body">
            <div className="d-flex justify-content-end mb-3">
              <input
                type="text"
                className="form-control"
                placeholder="Search collections..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ maxWidth: "300px" }}
              />
            </div>

            <DataTable
              columns={columns}
              data={filteredCollections}
              progressPending={loading}
              pagination
              paginationPerPage={10}
              paginationRowsPerPageOptions={[5, 10, 25, 50]}
              highlightOnHover
              responsive
              striped
              persistTableHead
              noDataComponent="No collections found."
              customStyles={{
                headCells: {
                  style: {
                    fontSize: "14px",
                    fontWeight: "600",
                    backgroundColor: "#f8f9fa",
                    padding: "12px",
                  },
                },
                cells: {
                  style: {
                    fontSize: "13px",
                    padding: "12px",
                  },
                },
                rows: {
                  style: {
                    minHeight: "65px",
                  },
                },
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default ViewCollections;
