import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import * as Yup from "yup";
import DataTable from "react-data-table-component";
import { makeApiRequest } from "../../AxiosServices/apiCall";

// ================= TAILWIND CLASS HELPERS =================

const disabledCls = "disabled:cursor-not-allowed disabled:opacity-60";

const btnPrimary = `rounded-md bg-[#5a432f] px-[18px] py-2.5 text-[13px] font-semibold text-white transition hover:bg-[#4e3016]`;

const btnGhost = `rounded-md border border-[#e3c8cc] bg-white px-5 py-2.5 text-[13px] font-semibold text-[#8c3d4e] transition hover:border-[#e98d9d] hover:bg-[#faf2f3] ${disabledCls}`;

const rowEdit =
  "rounded-md border border-[#e98d9d] bg-white px-3.5 py-1.5 text-xs font-semibold text-[#c25b70] transition hover:bg-[#e98d9d] hover:text-white";

const rowDelete =
  "rounded-md border border-red-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-600 hover:text-white";

const fieldCore =
  "w-full rounded-md border px-3 py-2.5 text-[13px] text-[#26334a] outline-none transition focus:ring-4";

const fieldOk =
  "border-[#e3c8cc] bg-white focus:border-[#e98d9d] focus:ring-[#e98d9d]/30";

const fieldBad =
  "border-red-600 bg-red-50 focus:border-red-600 focus:ring-red-200";

const labelClass = "text-xs font-semibold text-[#8c3d4e]";
const errorClass = "text-xs font-medium text-red-600";

const statusBadge = {
  ACTIVE: "bg-[#e3f2e8] text-[#2f6b46]",
  DRAFT: "bg-[#fff3dc] text-[#b7791f]",
  ARCHIVED: "bg-[#eeeef3] text-[#5f6475]",
};

// ================= FORM CONFIG =================

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

  description: Yup.string().max(500, "Description cannot exceed 500 characters"),

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
        setCollections(Array.isArray(response.data) ? response.data : []);
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

        setProducts(productData.filter((product) => product.status === "ACTIVE"));
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
      toast.error(error.response?.data?.message || "Failed to get collection");
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
        url: editId ? `update-collection/${editId}` : "create-collection",
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
        name: "S.NO",
        cell: (row, index) => (
          <span className="font-semibold text-[#26334a]">{index + 1}</span>
        ),
        width: "70px",
        center: true,
      },
      {
        name: "IMAGE",
        cell: (row) =>
          row.image ? (
            <img
              src={row.image}
              alt={row.name}
              className="h-[50px] w-[50px] rounded-lg border border-[#edf0f5] object-cover"
            />
          ) : (
            <span className="text-[#8791a5]">-</span>
          ),
        width: "100px",
        center: true,
      },
      {
        name: "NAME",
        selector: (row) => row.name,
        sortable: true,
        grow: 1,
        cell: (row) => (
          <span className="font-semibold text-[#26334a]">{row.name}</span>
        ),
      },
      {
        name: "SLUG",
        selector: (row) => row.slug,
        sortable: true,
        grow: 1,
        cell: (row) => (
          <span className="rounded border border-[#e3c8cc] bg-[#faf2f3] px-2 py-0.5 font-mono text-xs text-[#8c3d4e]">
            {row.slug}
          </span>
        ),
      },
      {
        name: "PRODUCTS",
        selector: (row) =>
          Array.isArray(row.products) ? row.products.length : 0,
        sortable: true,
        center: true,
        width: "120px",
        cell: (row) => (
          <span className="rounded-full bg-[#e1f4fb] px-3 py-1 text-xs font-bold text-[#218cac]">
            {Array.isArray(row.products) ? row.products.length : 0}
          </span>
        ),
      },
      {
        name: "ORDER",
        selector: (row) => row.displayOrder,
        sortable: true,
        center: true,
        width: "100px",
      },
      {
        name: "STATUS",
        cell: (row) => (
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold tracking-wide ${
              statusBadge[row.status] || "bg-[#eeeef3] text-[#26334a]"
            }`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            {row.status}
          </span>
        ),
        sortable: true,
        center: true,
        width: "130px",
      },
      {
        name: "ACTIONS",
        cell: (row) => (
          <div className="flex items-center gap-2 whitespace-nowrap">
            <button
              type="button"
              className={rowEdit}
              onClick={() => handleEdit(row._id)}
            >
              Edit
            </button>

            <button
              type="button"
              className={rowDelete}
              onClick={() => handleDelete(row._id)}
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

  const tableStyles = {
    headRow: {
      style: {
        backgroundColor: "#e3c8cc",
        minHeight: "52px",
        borderBottom: "none",
        borderTopLeftRadius: "10px",
        borderTopRightRadius: "10px",
      },
    },
    headCells: {
      style: {
        fontSize: "11px",
        fontWeight: "700",
        letterSpacing: "0.08em",
        color: "#8c3d4e",
        padding: "12px",
      },
    },
    cells: {
      style: {
        fontSize: "13px",
        color: "#26334a",
        padding: "12px",
      },
    },
    rows: {
      style: {
        minHeight: "68px",
        borderBottomColor: "#edf0f5",
      },
      stripedStyle: {
        backgroundColor: "#fdf8f9",
        color: "#26334a",
      },
      highlightOnHoverStyle: {
        backgroundColor: "#faf2f3",
        color: "#26334a",
        borderBottomColor: "#edf0f5",
        outline: "none",
        transition: "0.2s",
      },
    },
    pagination: {
      style: {
        borderTop: "1px solid #edf0f5",
        minHeight: "60px",
        color: "#8791a5",
      },
    },
  };

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

  const fieldClass = (name) =>
    `${fieldCore} ${errors[name] ? fieldBad : fieldOk}`;

  return (
    <div className="min-h-screen bg-[#f6f7fb] p-4 sm:p-7">
      {/* HEADER */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="mb-1.5 text-[28px] font-bold text-[#000]">
            Collections
          </h3>
          <p className="text-sm text-[#000]">
            Manage manual product collections
          </p>
        </div>

        {!showForm && (
          <button type="button" className={btnPrimary} onClick={handleCreate}>
            <i className="fa-solid fa-plus mr-2"></i>
            Add Collection
          </button>
        )}
      </div>

      {showForm ? (
        /* ================= FORM ================= */
        <div className="overflow-hidden rounded-[13px] border border-[#edf0f5] bg-white shadow-[0_3px_12px_rgba(30,40,70,0.035)]">
          <div className="border-b border-[#e3c8cc] bg-[#e3c8cc] px-6 py-4">
            <h5 className="text-xl font-bold text-[#26334a]">
              {editId ? "Edit Collection" : "Create Collection"}
            </h5>
            <p className="mt-0.5 text-xs text-[#8c3d4e]">
              Fields marked with * are required
            </p>
          </div>

          <form className="p-5 sm:p-6" onSubmit={handleSubmit} noValidate>
            <div className="grid grid-cols-1 gap-x-5 gap-y-[18px] md:grid-cols-2">
              {/* NAME */}
              <div className="flex flex-col gap-[7px]">
                <label className={labelClass}>
                  Collection Name <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  className={fieldClass("name")}
                  value={formData.name}
                  onChange={handleChange}
                />
                {errors.name && <span className={errorClass}>{errors.name}</span>}
              </div>

              {/* SLUG */}
              <div className="flex flex-col gap-[7px]">
                <label className={labelClass}>
                  Slug <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="slug"
                  className={fieldClass("slug")}
                  value={formData.slug}
                  onChange={handleChange}
                />
                {errors.slug && <span className={errorClass}>{errors.slug}</span>}
              </div>

              {/* IMAGE */}
              <div className="flex flex-col gap-[7px] md:col-span-2">
                <label className={labelClass}>
                  Collection Image <span className="text-red-600">*</span>
                </label>
                <input
                  type="file"
                  className="w-full rounded-md border border-dashed border-[#e98d9d] bg-[#faf2f3] p-2.5 text-xs file:mr-3 file:cursor-pointer file:rounded file:border-0 file:bg-[#e98d9d] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                />

                {errors.image && (
                  <span className={errorClass}>{errors.image}</span>
                )}

                {(formData.image || existingImage) && (
                  <img
                    src={
                      formData.image
                        ? URL.createObjectURL(formData.image)
                        : existingImage
                    }
                    alt="Collection preview"
                    className="mt-1 h-[100px] w-[120px] rounded-[10px] border border-[#edf0f5] object-cover"
                  />
                )}

                <span className="text-[11px] text-[#8791a5]">
                  JPG, PNG or WEBP. Maximum size 5 MB.
                </span>
              </div>

              {/* DESCRIPTION */}
              <div className="flex flex-col gap-[7px] md:col-span-2">
                <label className={labelClass}>Description</label>
                <textarea
                  name="description"
                  rows="3"
                  className={`${fieldClass("description")} resize-y`}
                  value={formData.description}
                  onChange={handleChange}
                />
                {errors.description && (
                  <span className={errorClass}>{errors.description}</span>
                )}
              </div>

              {/* DISPLAY ORDER */}
              <div className="flex flex-col gap-[7px]">
                <label className={labelClass}>
                  Display Order <span className="text-red-600">*</span>
                </label>
                <input
                  type="number"
                  name="displayOrder"
                  min="0"
                  className={fieldClass("displayOrder")}
                  value={formData.displayOrder}
                  onChange={handleChange}
                />
                {errors.displayOrder && (
                  <span className={errorClass}>{errors.displayOrder}</span>
                )}
              </div>

              {/* STATUS */}
              <div className="flex flex-col gap-[7px]">
                <label className={labelClass}>
                  Status <span className="text-red-600">*</span>
                </label>
                <select
                  name="status"
                  className={fieldClass("status")}
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="DRAFT">Draft</option>
                  <option value="ACTIVE">Active</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
                {errors.status && (
                  <span className={errorClass}>{errors.status}</span>
                )}
              </div>
            </div>

            {/* PRODUCT PICKER */}
            <div className="mt-7 border-t border-[#edf0f5] pt-6">
              <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
                <div>
                  <h5 className="text-lg font-bold text-[#26334a]">
                    Select Products <span className="text-red-600">*</span>
                  </h5>
                  <p className="text-sm text-[#8791a5]">
                    Select at least one active product for this collection.
                  </p>
                </div>

                <span className="rounded-full bg-[#e98d9d] px-3 py-1 text-xs font-bold text-white">
                  {formData.products.length} selected
                </span>
              </div>

              <div
                className={`rounded-[10px] border p-4 ${
                  errors.products
                    ? "border-red-400 bg-red-50"
                    : "border-[#e3c8cc] bg-[#fdf8f9]"
                }`}
              >
                {products.length === 0 ? (
                  <p className="text-sm text-[#8791a5]">
                    No active products available.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                    {products.map((product) => {
                      const productId = String(product._id);

                      const isSelected = formData.products.some(
                        (id) => String(id) === productId
                      );

                      return (
                        <label
                          key={productId}
                          htmlFor={`product-${productId}`}
                          className={`pointer-events-auto flex h-full cursor-pointer items-center gap-3 rounded-[10px] border p-2.5 transition ${
                            isSelected
                              ? "border-[#e98d9d] bg-[#faf2f3] shadow-sm"
                              : "border-[#edf0f5] bg-white hover:border-[#e3c8cc]"
                          }`}
                        >
                          <input
                            type="checkbox"
                            id={`product-${productId}`}
                            checked={isSelected}
                            onChange={() => handleProductSelect(productId)}
                            className="h-[18px] w-[18px] shrink-0 cursor-pointer accent-[#e98d9d]"
                          />

                          {product.image && (
                            <img
                              src={product.image}
                              alt={product.name}
                              className="h-[50px] w-[50px] shrink-0 rounded-lg border border-[#edf0f5] object-cover"
                            />
                          )}

                          <span className="min-w-0">
                            <strong className="block truncate text-[13px] text-[#26334a]">
                              {product.name}
                            </strong>

                            <span className="block text-[11px] text-[#8791a5]">
                              SKU: {product.sku}
                            </span>

                            <span className="block text-xs font-semibold text-[#8c3d4e]">
                              Price: {product.price}
                            </span>
                          </span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              {errors.products && (
                <div className="mt-2">
                  <span className={errorClass}>{errors.products}</span>
                </div>
              )}
            </div>

            {/* ACTIONS */}
            <div className="mt-6 flex flex-wrap items-center justify-end gap-2.5 border-t border-[#edf0f5] pt-5">
              <button
                type="button"
                className={btnGhost}
                onClick={resetForm}
                disabled={saving}
              >
                Cancel
              </button>

              <button type="submit" className={btnPrimary} disabled={saving}>
                {saving
                  ? "Saving..."
                  : editId
                  ? "Update Collection"
                  : "Create Collection"}
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* ================= LIST ================= */
        <div className="rounded-[13px] border border-[#edf0f5] bg-white p-4 shadow-[0_3px_12px_rgba(30,40,70,0.035)] md:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h6 className="mb-1 text-base font-bold text-[#26334a]">
                Collection List
              </h6>
              <span className="text-xs text-[#8791a5]">
                Total: {collections.length} | Showing:{" "}
                {filteredCollections.length}
              </span>
            </div>

            <input
              type="text"
              className="w-full rounded-md border border-[#e3c8cc] bg-white px-3.5 py-2.5 text-[13px] text-[#26334a] outline-none transition focus:border-[#e98d9d] focus:ring-4 focus:ring-[#e98d9d]/30 sm:w-[300px]"
              placeholder="Search collections..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>

          <DataTable
            columns={columns}
            data={filteredCollections}
            progressPending={loading}
            progressComponent={
              <div className="py-12 text-center">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-[#e3c8cc] border-t-[#e98d9d]" />
                <p className="mt-3 text-sm text-[#8791a5]">
                  Loading collections...
                </p>
              </div>
            }
            pagination
            paginationPerPage={10}
            paginationRowsPerPageOptions={[5, 10, 25, 50]}
            highlightOnHover
            responsive
            striped
            persistTableHead
            noDataComponent={
              <div className="py-12 text-center">
                <i className="fa-solid fa-layer-group mb-3 text-3xl text-[#e3c8cc]"></i>
                <h6 className="text-base font-semibold text-[#8791a5]">
                  No collections found.
                </h6>
              </div>
            }
            customStyles={tableStyles}
          />
        </div>
      )}
    </div>
  );
}

export default ViewCollections;