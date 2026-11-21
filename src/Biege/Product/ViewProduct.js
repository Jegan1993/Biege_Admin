import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import DataTable from "react-data-table-component";
import { makeApiRequest } from "../../AxiosServices/apiCall";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import { faPenToSquare, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// ================= TAILWIND CLASS HELPERS =================

const disabledCls = "disabled:cursor-not-allowed disabled:opacity-50";

const btnPrimary = `rounded-md bg-[#e98d9d] px-5 py-2.5 text-[13px] font-semibold text-white shadow-sm transition hover:bg-[#d97589] hover:!text-white hover:!opacity-100 ${disabledCls}`;
const btnGhost = `rounded-md border border-[#e3c8cc] bg-white px-4 py-2.5 text-[13px] font-semibold text-[#000] transition hover:border-[#e98d9d] hover:bg-[#f9f6f1] hover:!text-[#000] hover:!opacity-100 ${disabledCls}`;

const btnActivate = `rounded-md bg-[#23965e] px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-[#1d7d4e] hover:!text-white hover:!opacity-100 ${disabledCls}`;
const btnArchive = `rounded-md bg-[#73788b] px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-[#5f6475] hover:!text-white hover:!opacity-100 ${disabledCls}`;
const btnChangeCat = `rounded-md border border-[#e98d9d] bg-white px-3.5 py-2 text-xs font-semibold text-[#c25b70] transition hover:bg-[#e98d9d] hover:!text-black hover:!opacity-100 ${disabledCls}`;
const btnExportSel = `rounded-md border border-[#23965e] bg-white px-3.5 py-2 text-xs font-semibold text-[#23965e] transition hover:bg-[#23965e] hover:!text-black hover:!opacity-100 ${disabledCls}`;
const btnExportAll = `rounded-md border border-[#3d4654] bg-white px-3.5 py-2 text-xs font-semibold text-[#3d4654] transition hover:bg-[#3d4654] hover:!text-black hover:!opacity-100 ${disabledCls}`;
// inputs
const fieldClass =
  "rounded-md border border-[#e3c8cc] bg-white px-3 py-2 text-[13px] text-[#26334a] outline-none transition focus:border-[#e98d9d] focus:ring-4 focus:ring-[#e98d9d]/30 disabled:cursor-not-allowed disabled:opacity-60";

// badges
const typeBadge = {
  SKIN_CARE: "bg-[#e1f4fb] text-[#218cac]",
  BEAUTY: "bg-[#f0e9ff] text-[#7953c7]",
};

const statusBadge = {
  ACTIVE: "bg-[#e3f2e8] text-[#2f6b46]",
  DRAFT: "bg-[#fff3dc] text-[#b7791f]",
  ARCHIVED: "bg-[#eeeef3] text-[#5f6475]",
};

function ViewProduct() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [bulkCategoryId, setBulkCategoryId] = useState("");

  const [selectedRows, setSelectedRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [error, setError] = useState("");

  const [selectedImage, setSelectedImage] = useState("");
  const [showImageModal, setShowImageModal] = useState(false);

  const [importRows, setImportRows] = useState([]);
  const [importErrors, setImportErrors] = useState([]);
  const [importResult, setImportResult] = useState(null);
  const [showImportModal, setShowImportModal] = useState(false);

  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  // GET CATEGORIES FROM CATEGORY MANAGEMENT
  const getCategories = useCallback(async () => {
    try {
      const response = await makeApiRequest({
        url: "get-categories?status=ACTIVE&limit=500&page=1",
        method: "GET",
      });

      if (response.status) {
        setCategories(response.data || []);
      } else {
        setCategories([]);
        toast.error(response.message || "Failed to fetch categories");
      }
    } catch (err) {
      console.error("Get categories error:", err);
      setCategories([]);
      toast.error(err.response?.data?.message || "Failed to fetch categories");
    }
  }, []);

  // GET PRODUCTS
  const getProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await makeApiRequest({
        url: "getproduct?limit=10000&page=1",
        method: "GET",
      });

      if (response.status) {
        setProducts(response.data || []);
        setSelectedRows([]);
      } else {
        setProducts([]);
        setError(response.message || "Failed to fetch products");
      }
    } catch (err) {
      console.error("Get products error:", err);
      setProducts([]);
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  // INITIAL LOAD
  useEffect(() => {
    getProducts();
    getCategories();
  }, [getProducts, getCategories]);

  // REFRESH PRODUCTS AND CATEGORIES
  const handleRefresh = async () => {
    await Promise.all([getProducts(), getCategories()]);
  };

  // GET CATEGORY ID
  const getCategoryId = (category) => {
    if (!category) return "";

    if (typeof category === "object") {
      return category._id || "";
    }

    return String(category);
  };

  // GET CATEGORY NAME
  const getCategoryName = (category) => {
    if (!category) return "";

    if (typeof category === "object") {
      return category.name || "";
    }

    const matchedCategory = categories.find(
      (item) => item._id === String(category)
    );

    return matchedCategory?.name || String(category);
  };

  // GET CATEGORY LABEL
  const getCategoryLabel = (category) => {
    if (!category) return "";

    if (typeof category === "object") {
      const parentName =
        typeof category.parentCategory === "object"
          ? category.parentCategory?.name
          : "";

      return parentName
        ? `${parentName} / ${category.name}`
        : category.name || "";
    }

    return getCategoryName(category);
  };

  // GET CATEGORY BY ID / SLUG / NAME
  const findCategory = (value) => {
    const searchValue = String(value || "").trim().toLowerCase();

    if (!searchValue) return null;

    return categories.find(
      (category) =>
        String(category._id).toLowerCase() === searchValue ||
        String(category.slug || "").toLowerCase() === searchValue ||
        String(category.name || "").toLowerCase() === searchValue
    );
  };

  // DELETE PRODUCT
  const handleDelete = useCallback(
    async (id) => {
      if (!window.confirm("Are you sure you want to delete this product?")) {
        return;
      }

      try {
        const response = await makeApiRequest({
          url: `deleteproduct/${id}`,
          method: "DELETE",
        });

        if (response.status) {
          toast.success(response.message || "Product deleted successfully");
          getProducts();
        } else {
          toast.error(response.message || "Failed to delete product");
        }
      } catch (err) {
        console.error("Delete product error:", err);
        toast.error(err.response?.data?.message || "Something went wrong");
      }
    },
    [getProducts]
  );

  // FILTER PRODUCTS
  const filteredProducts = useMemo(() => {
    const value = search.toLowerCase().trim();

    return products.filter((product) => {
      const categoryName = getCategoryName(product.category);
      const categoryId = getCategoryId(product.category);

      const matchesSearch =
        !value ||
        product.name?.toLowerCase().includes(value) ||
        product.sku?.toLowerCase().includes(value) ||
        categoryName?.toLowerCase().includes(value);

      const matchesStatus = !statusFilter || product.status === statusFilter;

      const matchesType = !typeFilter || product.type === typeFilter;

      const matchesCategory = !categoryFilter || categoryId === categoryFilter;

      return matchesSearch && matchesStatus && matchesType && matchesCategory;
    });
  }, [products, search, statusFilter, typeFilter, categoryFilter, categories]);

  // SELECTED PRODUCT IDS
  const selectedIds = useMemo(
    () => selectedRows.map((row) => row._id),
    [selectedRows]
  );

  // BULK STATUS UPDATE
  const handleBulkStatus = async (status) => {
    if (!selectedIds.length) {
      toast.warning("Please select at least one product");
      return;
    }

    const action = status === "ACTIVE" ? "activate" : "archive";

    if (
      !window.confirm(
        `Are you sure you want to ${action} ${selectedIds.length} selected product(s)?`
      )
    ) {
      return;
    }

    try {
      setBulkLoading(true);

      const response = await makeApiRequest({
        url: "bulk-update-status",
        method: "PATCH",
        data: {
          productIds: selectedIds,
          status,
        },
      });

      if (response.status) {
        toast.success(response.message || "Products updated successfully");
        await getProducts();
      } else {
        toast.error(response.message || "Bulk update failed");
      }
    } catch (err) {
      console.error("Bulk status error:", err);
      toast.error(err.response?.data?.message || "Bulk update failed");
    } finally {
      setBulkLoading(false);
    }
  };

  // BULK CATEGORY UPDATE
  const handleBulkCategory = async () => {
    if (!selectedIds.length) {
      toast.warning("Please select products");
      return;
    }

    if (!bulkCategoryId) {
      toast.warning("Please select a category");
      return;
    }

    try {
      setBulkLoading(true);

      const response = await makeApiRequest({
        url: "bulk-update-category",
        method: "PATCH",
        data: {
          productIds: selectedIds,
          category: bulkCategoryId,
        },
      });

      if (response.status) {
        toast.success(response.message || "Category updated successfully");
        setBulkCategoryId("");
        await getProducts();
      } else {
        toast.error(response.message || "Category update failed");
      }
    } catch (err) {
      console.error("Bulk category error:", err);
      toast.error(err.response?.data?.message || "Category update failed");
    } finally {
      setBulkLoading(false);
    }
  };

  // EXPORT CSV
  const exportCSV = (rows, fileName) => {
    if (!rows.length) {
      toast.warning("No products available to export");
      return;
    }

    const exportData = rows.map((product) => {
      const category =
        typeof product.category === "object"
          ? product.category?.slug || product.category?.name || ""
          : getCategoryName(product.category);

      return {
        name: product.name || "",
        sku: product.sku || "",
        category,
        type: product.type || "",
        price: product.price ?? "",
        stock: product.stock ?? "",
        status: product.status || "",
        image: product.image || "",
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Products");

    XLSX.writeFile(workbook, fileName, {
      bookType: "csv",
    });
  };

  const handleExportSelected = () => {
    exportCSV(selectedRows, "selected-products.csv");
  };

  const handleExportFiltered = () => {
    exportCSV(filteredProducts, "products.csv");
  };

  // DOWNLOAD CSV TEMPLATE
  const downloadTemplate = () => {
    const firstCategory = categories[0];

    const template = [
      {
        name: "Aloe Vera Gel",
        sku: "SKIN001",
        category: firstCategory
          ? firstCategory.slug || firstCategory.name
          : "category-slug",
        type: "SKIN_CARE",
        price: 500,
        stock: 100,
        status: "DRAFT",
        image: "",
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(template);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Products");

    XLSX.writeFile(workbook, "product-import-template.csv", {
      bookType: "csv",
    });
  };

  // READ CSV / EXCEL FILE
  const handleImportFile = async (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const extension = file.name.split(".").pop().toLowerCase();

    if (!["csv", "xlsx", "xls"].includes(extension)) {
      toast.error("Only CSV, XLS and XLSX files are supported");
      event.target.value = "";
      return;
    }

    try {
      if (!categories.length) {
        toast.error(
          "Active categories are not available. Please create a category first."
        );
        event.target.value = "";
        return;
      }

      const buffer = await file.arrayBuffer();

      const workbook = XLSX.read(buffer, {
        type: "array",
        cellDates: false,
      });

      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];

      const rawRows = XLSX.utils.sheet_to_json(firstSheet, {
        defval: "",
        raw: false,
      });

      if (!rawRows.length) {
        toast.warning("The uploaded file is empty");
        event.target.value = "";
        return;
      }

      const normalizedRows = rawRows.map((row) => {
        const normalized = {};

        Object.keys(row).forEach((key) => {
          normalized[key.trim().toLowerCase()] = row[key];
        });

        const enteredCategory = String(normalized.category ?? "").trim();

        const matchedCategory = findCategory(enteredCategory);

        return {
          name: String(normalized.name ?? "").trim(),
          sku: String(normalized.sku ?? "").trim().toUpperCase(),
          category: matchedCategory ? matchedCategory._id : enteredCategory,
          type: String(normalized.type ?? "").trim().toUpperCase(),
          price: String(normalized.price ?? "").trim(),
          stock: String(normalized.stock ?? "").trim(),
          status: String(normalized.status || "DRAFT")
            .trim()
            .toUpperCase(),
          image: String(normalized.image ?? "").trim(),
        };
      });

      const previewErrors = [];
      const seenSkus = new Set();

      normalizedRows.forEach((row, index) => {
        const rowErrors = [];

        if (!row.name) {
          rowErrors.push("Name is required");
        }

        if (!row.sku) {
          rowErrors.push("SKU is required");
        }

        if (!row.category) {
          rowErrors.push("Category is required");
        } else {
          const categoryExists = categories.some(
            (category) => category._id === row.category
          );

          if (!categoryExists) {
            rowErrors.push(
              "Invalid category. Use an active category name or slug"
            );
          }
        }

        if (!["SKIN_CARE", "BEAUTY"].includes(row.type)) {
          rowErrors.push("Invalid type");
        }

        if (!["DRAFT", "ACTIVE", "ARCHIVED"].includes(row.status)) {
          rowErrors.push("Invalid status");
        }

        if (
          row.price === "" ||
          !Number.isFinite(Number(row.price)) ||
          Number(row.price) < 0
        ) {
          rowErrors.push("Invalid price");
        }

        if (
          row.stock === "" ||
          !Number.isInteger(Number(row.stock)) ||
          Number(row.stock) < 0
        ) {
          rowErrors.push("Invalid stock");
        }

        if (row.sku && seenSkus.has(row.sku)) {
          rowErrors.push("Duplicate SKU in file");
        }

        if (row.sku) {
          seenSkus.add(row.sku);
        }

        if (rowErrors.length) {
          previewErrors.push({
            row: index + 2,
            sku: row.sku,
            message: rowErrors.join(", "),
          });
        }
      });

      setImportRows(normalizedRows);
      setImportErrors(previewErrors);
      setImportResult(null);
      setShowImportModal(true);
    } catch (err) {
      console.error("File read error:", err);
      toast.error("Unable to read the uploaded file");
    } finally {
      event.target.value = "";
    }
  };

  // CONFIRM IMPORT
  const confirmImport = async () => {
    if (!importRows.length) {
      toast.warning("No products available to import");
      return;
    }

    if (importErrors.length) {
      toast.warning("Please correct the validation errors before importing");
      return;
    }

    try {
      setImportLoading(true);

      const response = await makeApiRequest({
        url: "bulk-import",
        method: "POST",
        data: {
          products: importRows,
        },
      });

      if (response.status) {
        setImportResult(response.data);

        toast.success(`${response.data?.importedCount || 0} product(s) imported`);

        await getProducts();
      } else {
        toast.error(response.message || "Import failed");
      }
    } catch (err) {
      console.error("Bulk import error:", err);
      toast.error(err.response?.data?.message || "Import failed");
    } finally {
      setImportLoading(false);
    }
  };

  // TABLE COLUMNS
  const columns = useMemo(
    () => [
      {
        name: "S.NO",
        width: "75px",
        cell: (row, index) => (
          <span className="font-semibold text-[#26334a]">{index + 1}</span>
        ),
      },
      {
        name: "IMAGE",
        width: "100px",
        cell: (row) => (
          <div className="py-2">
            {row.image ? (
              <img
                src={row.image}
                alt={row.name || "Product"}
                className="h-[55px] w-[55px] cursor-pointer rounded-lg border border-[#edf0f5] object-cover transition hover:scale-105"
                onClick={() => {
                  setSelectedImage(row.image);
                  setShowImageModal(true);
                }}
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            ) : (
              <span className="text-xs text-[#8791a5]">No Image</span>
            )}
          </div>
        ),
      },
      {
        name: "PRODUCT NAME",
        selector: (row) => row.name,
        sortable: true,
        minWidth: "180px",
        cell: (row) => (
          <span className="font-semibold text-[#26334a]">{row.name}</span>
        ),
      },
      {
        name: "SKU",
        selector: (row) => row.sku,
        sortable: true,
        minWidth: "120px",
        cell: (row) => (
          <span className="rounded border border-[#e3c8cc] bg-[#f9f6f1] px-2 py-0.5 font-mono text-xs text-[#000]">
            {row.sku}
          </span>
        ),
      },
      {
        name: "CATEGORY",
        selector: (row) => getCategoryName(row.category),
        sortable: true,
        minWidth: "150px",
        cell: (row) => <span>{getCategoryLabel(row.category)}</span>,
      },
      {
        name: "TYPE",
        selector: (row) => row.type,
        sortable: true,
        cell: (row) => (
          <span
            className={`rounded-full px-3 py-1.5 text-[11px] font-bold ${
              typeBadge[row.type] || "bg-[#eeeef3] text-[#5f6475]"
            }`}
          >
            {row.type === "SKIN_CARE" ? "Skin Care" : "Beauty"}
          </span>
        ),
      },
      {
        name: "PRICE",
        selector: (row) => row.price,
        sortable: true,
        cell: (row) => (
          <span className="font-semibold text-[#26334a]">
            ₹{Number(row.price).toLocaleString("en-IN")}
          </span>
        ),
      },
      {
        name: "STOCK",
        selector: (row) => row.stock,
        sortable: true,
        cell: (row) => (
          <span
            className={
              row.stock === 0 ? "font-semibold text-red-600" : "text-[#26334a]"
            }
          >
            {row.stock}
          </span>
        ),
      },
      {
        name: "STATUS",
        selector: (row) => row.status,
        sortable: true,
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
      },
      {
        name: "ACTION",
        width: "140px",
        minWidth: "140px",
        button: true,
        cell: (row) => (
          <div className="flex w-full items-center justify-center gap-2.5 whitespace-nowrap">
            <button
              type="button"
              title="Edit Product"
              onClick={() => navigate(`/edit-product/${row._id}/basic`)}
              className="flex h-[36px] w-[36px] items-center justify-center rounded-md border border-[#e98d9d] bg-white text-[#e98d9d] transition hover:bg-[#e98d9d] hover:text-white"
            >
              <FontAwesomeIcon icon={faPenToSquare} />
            </button>

            <button
              type="button"
              title="Delete Product"
              onClick={() => handleDelete(row._id)}
              className="flex h-[36px] w-[36px] items-center justify-center rounded-md border border-red-300 bg-white text-red-600 transition hover:bg-red-600 hover:text-white"
            >
              <FontAwesomeIcon icon={faTrash} />
            </button>
          </div>
        ),
      },
    ],
    [navigate, handleDelete, categories]
  );

  const customStyles = {
    headRow: {
      style: {
        backgroundColor: "rgb(240 229 211)",
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
        color: "#000",
        paddingLeft: "16px",
        paddingRight: "16px",
      },
    },
    rows: {
      style: {
        minHeight: "72px",
        fontSize: "13px",
        color: "#26334a",
        borderBottomColor: "#edf0f5",
      },
      stripedStyle: {
        backgroundColor: "#fdf8f9",
        color: "#26334a",
      },
      highlightOnHoverStyle: {
        backgroundColor: "#f9f6f1",
        color: "#26334a",
        borderBottomColor: "#edf0f5",
        outline: "none",
        transition: "0.2s",
      },
    },
    cells: {
      style: {
        paddingLeft: "12px",
        paddingRight: "12px",
        overflow: "visible",
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

  const hasFilters = search || statusFilter || typeFilter || categoryFilter;

  return (
    <div className="min-h-screen bg-[#f6f7fb] p-4 sm:p-7">
      {/* PAGE HEADER */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="mb-1.5 text-[28px] font-bold text-[#000]">
            Products
          </h3>
          <p className="text-sm text-[#000]">
            Manage your skincare and beauty products
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            type="button"
            className={btnGhost}
            onClick={handleRefresh}
            disabled={loading}
          >
            <i className="fa-solid fa-rotate mr-2"></i>
            Refresh
          </button>

          <button type="button" className={btnGhost} onClick={downloadTemplate}>
            <i className="fa-solid fa-download mr-2"></i>
            CSV Template
          </button>

          <button
            type="button"
            className={btnGhost}
            onClick={() => fileInputRef.current?.click()}
          >
            <i className="fa-solid fa-file-import mr-2"></i>
            Import CSV / Excel
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            className="hidden"
            onChange={handleImportFile}
          />

         <button
  type="button"
  onClick={() => navigate("/create-product")}
  className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-[4px] border-0 bg-[#6f533b] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#5a432f] focus:outline-none focus:ring-4 focus:ring-[#6f533b]/25"
>
  <i className="fa-solid fa-plus"></i>
  Add Product
</button>
        </div>
      </div>

      {/* PRODUCT TABLE CARD */}
      <div className="rounded-[13px] border border-[#edf0f5] bg-white p-4 shadow-[0_3px_12px_rgba(30,40,70,0.035)] md:p-6">
        {/* SEARCH AND FILTERS */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h6 className="mb-1 text-base font-bold text-[#26334a]">
              Product List
            </h6>
            <span className="text-xs text-[#8791a5]">
              Total: {products.length} | Filtered: {filteredProducts.length}
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            <input
              type="text"
              className={`${fieldClass} w-full sm:w-[230px]`}
              placeholder="Search name / SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select
              className={`${fieldClass} w-[145px]`}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="DRAFT">Draft</option>
              <option value="ACTIVE">Active</option>
              <option value="ARCHIVED">Archived</option>
            </select>

            <select
              className={`${fieldClass} w-[145px]`}
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="">All Types</option>
              <option value="SKIN_CARE">Skin Care</option>
              <option value="BEAUTY">Beauty</option>
            </select>

            <select
              className={`${fieldClass} w-[180px]`}
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {getCategoryLabel(category)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* BULK ACTIONS */}
        <div className="mb-4 flex flex-wrap items-center gap-2.5 rounded-[10px] border border-[#f1dfe2] bg-[#6f533b] p-3.5">
          <span className="mr-1 rounded-full bg-[#e98d9d] px-3 py-1 text-xs font-bold text-white">
            {selectedRows.length} Selected
          </span>

          <button
            type="button"
            className={btnActivate}
            disabled={!selectedRows.length || bulkLoading}
            onClick={() => handleBulkStatus("ACTIVE")}
          >
            <i className="fa-solid fa-circle-check mr-1.5"></i>
            Activate
          </button>

          <button
            type="button"
            className={btnArchive}
            disabled={!selectedRows.length || bulkLoading}
            onClick={() => handleBulkStatus("ARCHIVED")}
          >
            <i className="fa-solid fa-box-archive mr-1.5"></i>
            Archive
          </button>

          <select
            className={`${fieldClass} w-[200px] !py-[7px] text-xs`}
            value={bulkCategoryId}
            onChange={(e) => setBulkCategoryId(e.target.value)}
            disabled={!categories.length || bulkLoading}
          >
            <option value="">Select Category</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {getCategoryLabel(category)}
              </option>
            ))}
          </select>

          <button
            type="button"
            className={btnChangeCat}
            disabled={!selectedRows.length || !bulkCategoryId || bulkLoading}
            onClick={handleBulkCategory}
          >
            Change Category
          </button>

          <span className="mx-1 hidden h-6 w-px bg-[#e3c8cc] md:block" />

          <button
            type="button"
            className={btnExportSel}
            disabled={!selectedRows.length}
            onClick={handleExportSelected}
          >
            <i className="fa-solid fa-file-csv mr-1.5"></i>
            Export Selected CSV
          </button>

          <button
            type="button"
            className={btnExportAll}
            disabled={!filteredProducts.length}
            onClick={handleExportFiltered}
          >
            <i className="fa-solid fa-file-export mr-1.5"></i>
            Export Filtered CSV
          </button>

          {bulkLoading && (
            <span className="text-xs text-[#8791a5]">Updating...</span>
          )}
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-4 flex flex-wrap items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
            {error}
            <button
              type="button"
              className="rounded-md border border-red-300 bg-white px-3 py-1 text-xs font-semibold text-red-700 transition hover:bg-red-600 hover:text-white"
              onClick={getProducts}
            >
              Retry
            </button>
          </div>
        )}

        {/* DATA TABLE */}
        <DataTable
          columns={columns}
          data={filteredProducts}
          customStyles={customStyles}
          progressPending={loading}
          progressComponent={
            <div className="py-12 text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-[#e3c8cc] border-t-[#e98d9d]" />
              <p className="mt-3 text-sm text-[#8791a5]">Loading products...</p>
            </div>
          }
          selectableRows
          selectableRowsHighlight
          onSelectedRowsChange={({ selectedRows: rows }) =>
            setSelectedRows(rows)
          }
          clearSelectedRows={loading}
          pagination
          paginationPerPage={10}
          paginationRowsPerPageOptions={[10, 25, 50, 100]}
          highlightOnHover
          striped
          responsive
          persistTableHead
          noDataComponent={
            <div className="py-12 text-center">
              <i className="fa-solid fa-box-open mb-3 text-3xl text-[#e3c8cc]"></i>
              <h6 className="text-base font-semibold text-[#8791a5]">
                {hasFilters
                  ? "No matching products found"
                  : "No products available"}
              </h6>
            </div>
          }
        />
      </div>

      {/* PRODUCT IMAGE MODAL */}
      {showImageModal && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 p-4"
          onClick={() => setShowImageModal(false)}
        >
          <div
            className="w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between bg-[#e3c8cc] px-6 py-4">
              <h5 className="text-lg font-bold text-[#26334a]">
                Product Image
              </h5>

              <button
                type="button"
                aria-label="Close"
                onClick={() => setShowImageModal(false)}
                className="h-8 w-8 rounded-full bg-white text-sm text-[#000] transition hover:bg-[#e98d9d] hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-4 text-center">
              <img
                src={selectedImage}
                alt="Product"
                className="mx-auto max-h-[70vh] max-w-full rounded-lg object-contain"
              />
            </div>
          </div>
        </div>
      )}

      {/* IMPORT PREVIEW MODAL */}
      {showImportModal && (
        <div className="fixed inset-0 z-[1000] flex items-start justify-center overflow-y-auto bg-black/60 px-4 py-10">
          <div className="w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between bg-[#e3c8cc] px-6 py-4">
              <h5 className="text-lg font-bold text-[#26334a]">
                Import Products
              </h5>

              <button
                type="button"
                aria-label="Close"
                disabled={importLoading}
                onClick={() => setShowImportModal(false)}
                className="h-8 w-8 rounded-full bg-white text-sm text-[#000] transition hover:bg-[#e98d9d] hover:text-white disabled:opacity-50"
              >
                ✕
              </button>
            </div>

            <div className="p-6">
              {!importResult ? (
                <>
                  <div className="mb-4 rounded-lg border border-[#bfe3f2] bg-[#e1f4fb] px-4 py-3 text-sm text-[#1a6e88]">
                    File contains {importRows.length} product row(s). Review
                    validation errors before importing.
                  </div>

                  <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="rounded-[10px] border border-[#edf0f5] p-4">
                      <span className="text-xs text-[#8791a5]">Total rows</span>
                      <h4 className="text-2xl font-bold text-[#26334a]">
                        {importRows.length}
                      </h4>
                    </div>

                    <div className="rounded-[10px] border border-[#edf0f5] p-4">
                      <span className="text-xs text-[#8791a5]">
                        Preview errors
                      </span>
                      <h4 className="text-2xl font-bold text-red-600">
                        {importErrors.length}
                      </h4>
                    </div>
                  </div>

                  {importErrors.length > 0 && (
                    <div className="mb-4 rounded-lg border border-[#f3d9a4] bg-[#fff3dc] px-4 py-3 text-sm text-[#8a5a12]">
                      <strong>Rows with validation errors:</strong>
                      <div className="mt-2 max-h-[180px] overflow-y-auto">
                        {importErrors.map((item, index) => (
                          <div key={index} className="mb-1 text-xs">
                            Row {item.row} ({item.sku || "No SKU"}):{" "}
                            {item.message}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="overflow-x-auto rounded-[10px] border border-[#edf0f5]">
                    <table className="w-full min-w-[560px] border-collapse text-[13px]">
                      <thead className="bg-[#f9f6f1]">
                        <tr>
                          {[
                            "Name",
                            "SKU",
                            "Category",
                            "Type",
                            "Price",
                            "Stock",
                            "Status",
                          ].map((heading) => (
                            <th
                              key={heading}
                              className="px-3 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-[#000]"
                            >
                              {heading}
                            </th>
                          ))}
                        </tr>
                      </thead>

                      <tbody>
                        {importRows.slice(0, 10).map((row, index) => (
                          <tr key={index} className="border-t border-[#edf0f5]">
                            <td className="px-3 py-2.5">{row.name}</td>
                            <td className="px-3 py-2.5">{row.sku}</td>
                            <td className="px-3 py-2.5">
                              {getCategoryName(row.category) || row.category}
                            </td>
                            <td className="px-3 py-2.5">{row.type}</td>
                            <td className="px-3 py-2.5">{row.price}</td>
                            <td className="px-3 py-2.5">{row.stock}</td>
                            <td className="px-3 py-2.5">{row.status}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {importRows.length > 10 && (
                    <span className="mt-2 block text-xs text-[#8791a5]">
                      Showing first 10 rows of {importRows.length}.
                    </span>
                  )}

                  <span className="mt-2 block text-xs text-[#8791a5]">
                    Category must match an active category name, slug, or ID.
                    Backend will also check existing SKU duplicates.
                  </span>
                </>
              ) : (
                <>
                  <div className="mb-4 rounded-lg border border-[#bfe6cf] bg-[#e4f7ed] px-4 py-3 text-sm text-[#1d6b45]">
                    Import process completed.
                  </div>

                  <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div className="rounded-[10px] border border-[#edf0f5] p-4">
                      <span className="text-xs text-[#8791a5]">Total rows</span>
                      <h4 className="text-2xl font-bold text-[#26334a]">
                        {importResult.totalRows}
                      </h4>
                    </div>

                    <div className="rounded-[10px] border border-[#edf0f5] p-4">
                      <span className="text-xs text-[#8791a5]">Imported</span>
                      <h4 className="text-2xl font-bold text-[#23965e]">
                        {importResult.importedCount}
                      </h4>
                    </div>

                    <div className="rounded-[10px] border border-[#edf0f5] p-4">
                      <span className="text-xs text-[#8791a5]">Failed</span>
                      <h4 className="text-2xl font-bold text-red-600">
                        {importResult.failedCount}
                      </h4>
                    </div>
                  </div>

                  {importResult.errors?.length > 0 && (
                    <div className="rounded-lg border border-[#f3d9a4] bg-[#fff3dc] px-4 py-3 text-sm text-[#8a5a12]">
                      <strong>Import errors:</strong>
                      <div className="mt-2 max-h-[200px] overflow-y-auto">
                        {importResult.errors.map((item, index) => (
                          <div key={index} className="mb-1 text-xs">
                            Row {item.row} ({item.sku || "No SKU"}):{" "}
                            {item.message}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2.5 border-t border-[#edf0f5] bg-[#f9f6f1] px-6 py-4">
              <button
                type="button"
                className={btnGhost}
                disabled={importLoading}
                onClick={() => setShowImportModal(false)}
              >
                Close
              </button>

              {!importResult && (
                <button
                  type="button"
                  className={btnPrimary}
                  disabled={
                    importLoading || !importRows.length || importErrors.length > 0
                  }
                  onClick={confirmImport}
                >
                  {importLoading ? "Importing..." : "Confirm Import"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ViewProduct;