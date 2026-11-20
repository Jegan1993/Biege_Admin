import React, { useEffect, useMemo, useState } from "react";
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

  description: Yup.string().max(500, "Description cannot exceed 500 characters"),

  displayOrder: Yup.number()
    .transform((value, originalValue) => (originalValue === "" ? NaN : value))
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
        return ["image/jpeg", "image/png", "image/webp"].includes(value.type);
      }
    )
    .test("imageSize", "Image size cannot exceed 5MB", (value) => {
      if (!value) return true;
      return value.size <= 5 * 1024 * 1024;
    }),
});

const initialFormData = {
  name: "",
  slug: "",
  parentCategory: "",
  description: "",
  displayOrder: 0,
  status: "ACTIVE",
};

const slugify = (text) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const getParentId = (category) =>
  category?.parentCategory?._id || category?.parentCategory || null;

// ================= TAILWIND CLASS HELPERS =================

const btnPrimary =
  "rounded-md bg-[#e98d9d] px-[18px] py-2.5 text-[13px] font-semibold text-white transition hover:bg-[#d97589]";

const btnGhost =
  "rounded-md border border-[#e3c8cc] bg-white px-[18px] py-2.5 text-[13px] font-semibold text-[#8c3d4e] transition hover:border-[#e98d9d] hover:bg-[#faf2f3]";

const btnDanger =
  "mr-auto rounded-md border border-red-200 bg-red-50 px-[18px] py-2.5 text-[13px] font-semibold text-red-700 transition hover:bg-red-600 hover:text-white";

const rowBtn =
  "whitespace-nowrap rounded-md border border-[#e3c8cc] bg-white px-3 py-[7px] text-xs font-semibold text-[#8c3d4e] transition hover:bg-[#e3c8cc]";

const rowBtnEdit =
  "whitespace-nowrap rounded-md border border-[#e98d9d] bg-[#e98d9d] px-3 py-[7px] text-xs font-semibold text-white transition hover:bg-[#d97589]";

const fieldCore =
  "w-full rounded-md border px-3 py-2.5 text-[13px] text-[#26334a] outline-none transition focus:ring-4";

const fieldOk =
  "border-[#e3c8cc] bg-white focus:border-[#e98d9d] focus:ring-[#e98d9d]/30";

const fieldBad =
  "border-red-600 bg-red-50 focus:border-red-600 focus:ring-red-200";

const thClass =
  "whitespace-nowrap px-4 py-3.5 text-left text-[11px] font-bold uppercase tracking-widest text-[#8c3d4e]";

const tdClass = "border-b border-[#edf0f5] px-4 py-3.5 align-middle text-[13px]";

function ViewCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);

  const [image, setImage] = useState(null);
  const [previewImage, setPreviewImage] = useState("");
  const [errors, setErrors] = useState({});
  const [slugTouched, setSlugTouched] = useState(false);

  const [formData, setFormData] = useState({ ...initialFormData });

  // list controls
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [collapsedIds, setCollapsedIds] = useState(new Set());

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

    let updatedData = { ...formData, [name]: value };

    // auto-generate slug from name until the user edits slug manually
    if (name === "name" && !editId && !slugTouched) {
      updatedData.slug = slugify(value);
    }
    if (name === "slug") {
      setSlugTouched(true);
    }

    setFormData(updatedData);

    const fieldsToRevalidate = [name];
    if (name === "name" && updatedData.slug !== formData.slug) {
      fieldsToRevalidate.push("slug");
    }

    for (const field of fieldsToRevalidate) {
      if (errors[field]) {
        try {
          await categoryValidationSchema.validateAt(field, updatedData);
          setErrors((prev) => ({ ...prev, [field]: "" }));
        } catch (error) {
          setErrors((prev) => ({ ...prev, [field]: error.message }));
        }
      }
    }
  };

  // ================= IMAGE CHANGE =================

  const handleImageChange = async (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setImage(selectedFile);
    setPreviewImage(URL.createObjectURL(selectedFile));

    try {
      await categoryValidationSchema.validateAt("image", {
        image: selectedFile,
      });
      setErrors((prev) => ({ ...prev, image: "" }));
    } catch (error) {
      setErrors((prev) => ({ ...prev, image: error.message }));
    }
  };

  // ================= RESET FORM =================

  const resetForm = () => {
    setFormData({ ...initialFormData });
    setImage(null);
    setPreviewImage("");
    setEditId(null);
    setErrors({});
    setSlugTouched(false);
    setShowForm(false);
  };

  const handleAddCategory = () => {
    resetForm();
    setShowForm(true);
  };

  const handleAddChild = (category) => {
    resetForm();
    setFormData({ ...initialFormData, parentCategory: category._id });
    setShowForm(true);
  };

  // ================= VALIDATE FORM =================

  const validateForm = async () => {
    try {
      await categoryValidationSchema.validate(
        { ...formData, image },
        { abortEarly: false }
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

  // ================= SUBMIT CATEGORY =================

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
        url: editId ? `update-category/${editId}` : "create-category",
        method: editId ? "PUT" : "POST",
        data: payload,
        header: "image",
      });

      if (response?.data?.status === false || response?.status === false) {
        toast.error(response?.data?.message || "Category operation failed");
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
      toast.error(error?.response?.data?.message || "Something went wrong");
    }
  };

  // ================= EDIT CATEGORY =================

  const handleEdit = (category) => {
    setErrors({});
    setEditId(category._id);
    setSlugTouched(true);

    setFormData({
      name: category.name || "",
      slug: category.slug || "",
      parentCategory: getParentId(category) || "",
      description: category.description || "",
      displayOrder: category.displayOrder ?? 0,
      status: category.status || "ACTIVE",
    });

    setImage(null);
    setPreviewImage(category.image || "");
    setShowForm(true);
  };

  // ================= DELETE CATEGORY =================

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

      if (response?.data?.status === false || response?.status === false) {
        toast.error(response?.data?.message || "Delete failed");
        return;
      }

      toast.success("Category deleted successfully");
      resetForm();
      fetchCategories();
    } catch (error) {
      console.error("Delete category error:", error);
      toast.error(error?.response?.data?.message || "Failed to delete category");
    }
  };

  // ================= CATEGORY TREE =================

  const getDescendantIds = (categoryId) => {
    const descendantIds = new Set();

    const findChildren = (parentId) => {
      categories.forEach((item) => {
        if (String(getParentId(item) || "") === String(parentId)) {
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

  const buildCategoryTree = (items, parentId = null) =>
    items
      .filter(
        (item) => String(getParentId(item) || "") === String(parentId || "")
      )
      .sort((a, b) => Number(a.displayOrder || 0) - Number(b.displayOrder || 0))
      .map((item) => ({
        ...item,
        children: buildCategoryTree(items, item._id),
      }));

  const flattenCategories = (items, level = 0) => {
    let result = [];
    items.forEach((item) => {
      result.push({ ...item, level });
      if (item.children?.length) {
        result = result.concat(flattenCategories(item.children, level + 1));
      }
    });
    return result;
  };

  const categoryTree = useMemo(() => buildCategoryTree(categories), [categories]);
  const flattenedCategories = useMemo(
    () => flattenCategories(categoryTree),
    [categoryTree]
  );

  const excludedIds = editId ? getDescendantIds(editId) : new Set();

  // ================= VISIBLE ROWS (search / filter / collapse) =================

  const isFiltering = search.trim() !== "" || statusFilter !== "ALL";

  const visibleRows = useMemo(() => {
    if (isFiltering) {
      const q = search.trim().toLowerCase();
      return flattenedCategories.filter((item) => {
        const matchesSearch =
          !q ||
          (item.name || "").toLowerCase().includes(q) ||
          (item.slug || "").toLowerCase().includes(q);
        const matchesStatus =
          statusFilter === "ALL" || (item.status || "ACTIVE") === statusFilter;
        return matchesSearch && matchesStatus;
      });
    }

    const rows = [];
    const walk = (nodes, level) => {
      nodes.forEach((node) => {
        rows.push({ ...node, level });
        if (node.children?.length && !collapsedIds.has(String(node._id))) {
          walk(node.children, level + 1);
        }
      });
    };
    walk(categoryTree, 0);
    return rows;
  }, [categoryTree, flattenedCategories, collapsedIds, search, statusFilter, isFiltering]);

  const toggleCollapse = (id) => {
    setCollapsedIds((prev) => {
      const next = new Set(prev);
      const key = String(id);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const collapseAll = () =>
    setCollapsedIds(
      new Set(
        flattenedCategories
          .filter((c) => c.children?.length)
          .map((c) => String(c._id))
      )
    );

  const expandAll = () => setCollapsedIds(new Set());

  // ================= STATS =================

  const totalCount = categories.length;
  const activeCount = categories.filter(
    (c) => (c.status || "ACTIVE") === "ACTIVE"
  ).length;
  const mainCount = categories.filter((c) => !getParentId(c)).length;

  const statCards = [
    { label: "Total Categories", value: totalCount, icon: "fa-tags", color: "#23965e", bg: "#e4f7ed" },
    { label: "Main Categories", value: mainCount, icon: "fa-sitemap", color: "#5269cb", bg: "#e9edff" },
    { label: "Active", value: activeCount, icon: "fa-check-circle", color: "#218cac", bg: "#e1f4fb" },
    { label: "Inactive", value: totalCount - activeCount, icon: "fa-ban", color: "#73788b", bg: "#eeeef3" },
  ];

  // ================= HELPERS =================

  const getParentCategoryName = (category) => {
    const parentId = getParentId(category);
    if (!parentId) return null;

    const parent = categories.find((c) => String(c._id) === String(parentId));
    return parent?.name || category.parentCategory?.name || "Unknown";
  };

  const fieldClass = (field) =>
    `${fieldCore} ${errors[field] ? fieldBad : fieldOk}`;

  // ================= RENDER =================

  return (
    <div className="min-h-screen bg-[#f6f7fb] p-4 sm:p-7">
      {/* HEADER */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="mb-1.5 text-[28px] font-bold text-[#e9899d]">
            Categories
          </h3>
          <p className="text-sm text-[#8791a5]">
            Manage parent and child categories for your storefront menu and
            filters.
          </p>
        </div>

        <button type="button" className={btnPrimary} onClick={handleAddCategory}>
          + Create Category
        </button>
      </div>

      {/* STATS */}
      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="flex items-start justify-between rounded-[13px] border border-[#edf0f5] bg-white px-[22px] py-5 shadow-[0_3px_12px_rgba(30,40,70,0.035)]"
          >
            <div>
              <div className="mb-2 text-sm text-[#8791a5]">{card.label}</div>
              <div className="text-[30px] font-bold leading-none text-[#26334a]">
                {card.value}
              </div>
            </div>

            <div
              className="flex h-[46px] w-[46px] min-w-[46px] items-center justify-center rounded-xl text-[19px]"
              style={{ background: card.bg, color: card.color }}
            >
              <i className={`fa ${card.icon}`}></i>
            </div>
          </div>
        ))}
      </div>

      {/* TOOLBAR */}
      <div className="mb-3.5 flex flex-wrap items-center gap-2.5">
        <input
          type="text"
          placeholder="Search by name or slug..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="min-w-[220px] max-w-full flex-1 rounded-md border border-[#e3c8cc] bg-white px-3.5 py-2.5 text-[13px] text-[#26334a] outline-none focus:border-[#e98d9d] focus:ring-4 focus:ring-[#e98d9d]/30 sm:max-w-[360px]"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-md border border-[#e3c8cc] bg-white px-3 py-2.5 text-[13px] text-[#26334a] outline-none focus:border-[#e98d9d] focus:ring-4 focus:ring-[#e98d9d]/30"
        >
          <option value="ALL">All status</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>

        <div className="flex-1" />

        {!isFiltering && (
          <>
            <button type="button" className={btnGhost} onClick={expandAll}>
              Expand all
            </button>
            <button type="button" className={btnGhost} onClick={collapseAll}>
              Collapse all
            </button>
          </>
        )}
      </div>

      {/* TABLE */}
      <div className="overflow-hidden rounded-[13px] border border-[#edf0f5] bg-white shadow-[0_3px_12px_rgba(30,40,70,0.035)]">
        {loading ? (
          <div className="px-5 py-[60px] text-center text-[#8791a5]">
            <div className="mx-auto mb-3 h-7 w-7 animate-spin rounded-full border-[3px] border-[#e3c8cc] border-t-[#e98d9d]" />
            <p className="text-sm">Loading categories...</p>
          </div>
        ) : visibleRows.length === 0 ? (
          <div className="px-5 py-[60px] text-center text-[#8791a5]">
            <h3 className="mb-1.5 text-[22px] font-bold text-[#26334a]">
              {isFiltering ? "No matching categories" : "No categories yet"}
            </h3>
            <p className="text-sm">
              {isFiltering
                ? "Try a different search or status filter."
                : "Create your first category to get started."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] border-collapse">
              <thead className="bg-[#e3c8cc]">
                <tr>
                  <th className={thClass}>Category</th>
                  <th className={thClass}>Slug</th>
                  <th className={thClass}>Parent</th>
                  <th className={`${thClass} !text-center`}>Order</th>
                  <th className={thClass}>Status</th>
                  <th className={`${thClass} !text-right`}>Actions</th>
                </tr>
              </thead>

              <tbody>
                {visibleRows.map((category) => {
                  const hasChildren = category.children?.length > 0;
                  const isCollapsed = collapsedIds.has(String(category._id));
                  const status = category.status || "ACTIVE";
                  const parentName = getParentCategoryName(category);
                  // const indent = isFiltering ? 0 : category.level * 28;

                  return (
                    <tr
                      key={category._id}
                      className="transition-colors hover:bg-[#faf2f3]"
                    >
                      <td className={tdClass}>
                        <div
                          className="flex items-center gap-3"
                          
                        >
                          {hasChildren && !isFiltering ? (
                            <button
                              type="button"
                              onClick={() => toggleCollapse(category._id)}
                              aria-label={isCollapsed ? "Expand" : "Collapse"}
                              className={`h-6 w-6 shrink-0 rounded-[5px] border border-[#e3c8cc] bg-white text-[11px] leading-none text-[#8c3d4e] transition hover:bg-[#e3c8cc] ${
                                isCollapsed ? "-rotate-90" : ""
                              }`}
                            >
                              ▼
                            </button>
                          ) : (
                            <span className="inline-block w-6 shrink-0" />
                          )}

                          <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[#edf0f5] bg-[#faf2f3] text-[10px] font-bold text-[#8791a5]">
                            {category.image ? (
                              <img
                                src={category.image}
                                alt={category.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              "IMG"
                            )}
                          </div>

                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-[#26334a]">
                              {category.name || "-"}
                              {hasChildren && (
                                <span className="ml-2 text-[11px] font-medium text-[#8791a5]">
                                  {category.children.length} sub
                                </span>
                              )}
                            </div>

                            {category.description && (
                              <div
                                className="mt-0.5 max-w-[320px] truncate text-xs text-[#8791a5]"
                                title={category.description}
                              >
                                {category.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className={tdClass}>
                        <span className="rounded border border-[#e3c8cc] bg-[#faf2f3] px-2 py-0.5 font-mono text-xs text-[#8c3d4e]">
                          {category.slug || "-"}
                        </span>
                      </td>

                      <td className={tdClass}>
                        <span
                          className={`inline-block rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                            parentName
                              ? "bg-[#e3c8cc] text-[#8c3d4e]"
                              : "bg-[#e98d9d] text-white"
                          }`}
                        >
                          {parentName || "Main"}
                        </span>
                      </td>

                      <td className={`${tdClass} text-center`}>
                        {category.displayOrder ?? 0}
                      </td>

                      <td className={tdClass}>
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold tracking-wide ${
                            status === "ACTIVE"
                              ? "bg-[#e3f2e8] text-[#2f6b46]"
                              : "bg-[#fdecea] text-[#b42318]"
                          }`}
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-current" />
                          {status}
                        </span>
                      </td>

                      <td className={`${tdClass} text-right`}>
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            className={rowBtn}
                            onClick={() => handleAddChild(category)}
                          >
                            + Add Child
                          </button>
                          <button
                            type="button"
                            className={rowBtnEdit}
                            onClick={() => handleEdit(category)}
                          >
                            Edit
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* FORM MODAL */}
      {showForm && (
        <div
          className="fixed inset-0 z-[1000] flex items-start justify-center overflow-y-auto bg-black/45 px-4 py-10"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) resetForm();
          }}
        >
          <div className="w-full max-w-[720px] overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#e3c8cc] bg-[#e3c8cc] px-6 py-5">
              <div>
                <h3 className="text-2xl font-bold text-[#26334a]">
                  {editId ? "Edit category" : "Create category"}
                </h3>
                <p className="mt-0.5 text-xs text-[#8c3d4e]">
                  Fields marked with * are required
                </p>
              </div>

              <button
                type="button"
                onClick={resetForm}
                aria-label="Close"
                className="h-[34px] w-[34px] rounded-full border border-[#e3c8cc] bg-white text-sm text-[#8c3d4e] transition hover:bg-[#e98d9d] hover:text-white"
              >
                ✕
              </button>
            </div>

            <form className="px-6 pt-6" onSubmit={handleSubmit} noValidate>
              <div className="grid grid-cols-1 gap-x-5 gap-y-[18px] sm:grid-cols-2">
                {/* NAME */}
                <div className="flex min-w-0 flex-col gap-[7px]">
                  <label className="text-xs font-semibold text-[#8c3d4e]">
                    Category name <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Skin care"
                    className={fieldClass("name")}
                  />
                  {errors.name && (
                    <span className="text-xs font-medium text-red-600">
                      {errors.name}
                    </span>
                  )}
                </div>

                {/* SLUG */}
                <div className="flex min-w-0 flex-col gap-[7px]">
                  <label className="text-xs font-semibold text-[#8c3d4e]">
                    Slug <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
                    placeholder="e.g. skin-care"
                    className={fieldClass("slug")}
                  />
                  {errors.slug ? (
                    <span className="text-xs font-medium text-red-600">
                      {errors.slug}
                    </span>
                  ) : (
                    <span className="text-[11px] text-[#8791a5]">
                      Auto-filled from the name. Lowercase, numbers, hyphens.
                    </span>
                  )}
                </div>

                {/* PARENT */}
                <div className="flex min-w-0 flex-col gap-[7px]">
                  <label className="text-xs font-semibold text-[#8c3d4e]">
                    Parent category
                  </label>
                  <select
                    name="parentCategory"
                    value={formData.parentCategory}
                    onChange={handleChange}
                    className={`${fieldCore} ${fieldOk}`}
                  >
                    <option value="">Main category</option>
                    {flattenedCategories
                      .filter(
                        (item) =>
                          String(item._id) !== String(editId || "") &&
                          !excludedIds.has(String(item._id))
                      )
                      .map((item) => (
                        <option key={item._id} value={item._id}>
                          {"   ".repeat(item.level)}
                          {item.level > 0 ? "↳ " : ""}
                          {item.name}
                        </option>
                      ))}
                  </select>
                </div>

                {/* DISPLAY ORDER */}
                <div className="flex min-w-0 flex-col gap-[7px]">
                  <label className="text-xs font-semibold text-[#8c3d4e]">
                    Display order <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="number"
                    name="displayOrder"
                    value={formData.displayOrder}
                    onChange={handleChange}
                    className={fieldClass("displayOrder")}
                  />
                  {errors.displayOrder && (
                    <span className="text-xs font-medium text-red-600">
                      {errors.displayOrder}
                    </span>
                  )}
                </div>

                {/* STATUS */}
                <div className="flex min-w-0 flex-col gap-[7px]">
                  <label className="text-xs font-semibold text-[#8c3d4e]">
                    Status <span className="text-red-600">*</span>
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className={fieldClass("status")}
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                  {errors.status && (
                    <span className="text-xs font-medium text-red-600">
                      {errors.status}
                    </span>
                  )}
                </div>

                {/* IMAGE */}
                <div className="flex min-w-0 flex-col gap-[7px]">
                  <label className="text-xs font-semibold text-[#8c3d4e]">
                    Category image
                  </label>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageChange}
                    className="w-full rounded-md border border-dashed border-[#e98d9d] bg-[#faf2f3] p-2.5 text-xs file:mr-3 file:cursor-pointer file:rounded file:border-0 file:bg-[#e98d9d] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white"
                  />
                  {errors.image && (
                    <span className="text-xs font-medium text-red-600">
                      {errors.image}
                    </span>
                  )}
                  {previewImage && (
                    <img
                      src={previewImage}
                      alt="Category preview"
                      className="mt-1 h-24 w-24 rounded-[10px] border border-[#edf0f5] object-cover"
                    />
                  )}
                </div>

                {/* DESCRIPTION */}
                <div className="flex min-w-0 flex-col gap-[7px] sm:col-span-2">
                  <label className="text-xs font-semibold text-[#8c3d4e]">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Short description for this category"
                    rows={4}
                    className={`${fieldClass("description")} resize-y`}
                  />
                  {errors.description && (
                    <span className="text-xs font-medium text-red-600">
                      {errors.description}
                    </span>
                  )}
                </div>
              </div>

              {/* ACTIONS */}
              <div className="-mx-6 mt-6 flex flex-wrap items-center justify-end gap-2.5 border-t border-[#edf0f5] bg-[#faf2f3] px-6 py-4">
                {editId && (
                  <button
                    type="button"
                    className={btnDanger}
                    onClick={() => handleDelete(editId)}
                  >
                    Delete
                  </button>
                )}

                <button type="button" className={btnGhost} onClick={resetForm}>
                  Cancel
                </button>

                <button type="submit" className={btnPrimary}>
                  {editId ? "Update Category" : "Create Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ViewCategories;