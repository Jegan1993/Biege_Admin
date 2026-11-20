import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import DataTable from "react-data-table-component";
import { toast } from "react-toastify";
import { makeApiRequest } from "../../AxiosServices/apiCall";
import StockAdjustmentModal from "./StockAdjustmentModal";
import StockAdjustmentLog from "./StockAdjustmentLog";
import { useNavigate } from "react-router-dom";

const initialReceiveValues = {
  productId: "",
  variantId: "",
  warehouseId: "",
  batchNumber: "",
  receivedQuantity: "",
  lowStockThreshold: 10,
  manufacturingDate: "",
  expiryDate: "",
  notes: "",
};

/* Theme colours (used by the DataTable customStyles, which can't take classes) */
const theme = {
  headBg: "#e8cdd1",
  headText: "#8c2f3f",
  navy: "#1f2a4a",
  muted: "#7f8ba5",
  border: "#e9ebf3",
};

/* Reusable Tailwind class strings */
const inputCls =
  "w-full rounded-[10px] border border-[#e9ebf3] bg-[#f5f6fb] px-3.5 py-2.5 text-sm text-[#1f2a4a] outline-none transition placeholder:text-[#a9b2c7] focus:border-[#e98a9b] focus:bg-white focus:ring-4 focus:ring-[#e98a9b]/20 disabled:cursor-not-allowed disabled:bg-[#eef0f6] disabled:text-[#7f8ba5]";
const labelCls = "mb-1.5 block text-[13px] font-semibold text-[#1f2a4a]";
const btnBase =
  "inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-[10px] px-[18px] py-[9px] text-[13px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-60";
const btnPrimary = `${btnBase} bg-[#e98a9b] text-white shadow-[0_6px_14px_rgba(233,138,155,0.3)] hover:bg-[#d9748a]`;
const btnOutline = `${btnBase} border border-[#e9ebf3] bg-white text-[#8c2f3f] hover:border-[#e98a9b] hover:bg-[#fbeef0]`;
const btnSoft = `${btnBase} border border-[#e8cdd1] bg-[#e8cdd1] text-[#8c2f3f] hover:bg-[#dfbcc2]`;
const actBase =
  "inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold transition";

const statusColors = {
  IN_STOCK: "bg-[#e1f6ea] text-[#1f9d62]",
  LOW_STOCK: "bg-[#fff3d6] text-[#b7791f]",
  OUT_OF_STOCK: "bg-[#fdeaea] text-[#d64550]",
};

// STATUS BADGE
const renderStatus = (value) => (
  <span
    className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1 text-[11px] font-bold tracking-wide ${
      statusColors[value] || "bg-[#eef0f6] text-[#7f8ba5]"
    }`}
  >
    <span className="h-1.5 w-1.5 rounded-full bg-current" />
    {value?.replaceAll("_", " ") || "N/A"}
  </span>
);

const tableCustomStyles = {
  table: { style: { backgroundColor: "#ffffff" } },
  headRow: {
    style: {
      backgroundColor: theme.headBg,
      borderBottom: "none",
      minHeight: "50px",
    },
  },
  headCells: {
    style: {
      fontSize: "12px",
      fontWeight: "700",
      letterSpacing: "0.05em",
      textTransform: "uppercase",
      color: theme.headText,
      paddingLeft: "14px",
      paddingRight: "14px",
    },
  },
  rows: {
    style: {
      minHeight: "68px",
      fontSize: "13px",
      color: theme.navy,
      "&:not(:last-of-type)": {
        borderBottom: `1px solid ${theme.border}`,
      },
    },
    highlightOnHoverStyle: {
      backgroundColor: "#fdf6f7",
      transitionDuration: "0.15s",
      outline: "none",
    },
  },
  cells: {
    style: { paddingLeft: "14px", paddingRight: "14px" },
  },
  pagination: {
    style: {
      borderTop: `1px solid ${theme.border}`,
      minHeight: "58px",
      fontSize: "13px",
      color: theme.muted,
    },
  },
};

/* Small Tailwind modal shell used by the three modals below */
function Modal({ title, onClose, disabled, size = "max-w-lg", children, footer }) {
  return (
    <div className="fixed inset-0 z-[1050] flex items-center justify-center overflow-y-auto bg-[#1f2a4a]/45 p-4">
      <div
        className={`w-full ${size} overflow-hidden rounded-2xl bg-white shadow-[0_20px_50px_rgba(31,42,74,0.2)]`}
      >
        <div className="flex items-center justify-between bg-[#e8cdd1] px-6 py-[18px]">
          <h5 className="text-lg font-bold text-[#8c2f3f]">{title}</h5>
          <button
            type="button"
            onClick={onClose}
            disabled={disabled}
            aria-label="Close"
            className="cursor-pointer text-2xl leading-none text-[#8c2f3f] transition hover:opacity-70 disabled:cursor-not-allowed disabled:opacity-40"
          >
            &times;
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto p-6">{children}</div>
        <div className="flex justify-end gap-2.5 border-t border-[#e9ebf3] px-6 py-4">
          {footer}
        </div>
      </div>
    </div>
  );
}

function ViewInventory() {
  const [inventory, setInventory] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [variants, setVariants] = useState([]);

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [warehouseId, setWarehouseId] = useState("");

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);

  const [selectedInventory, setSelectedInventory] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [receiveValues, setReceiveValues] = useState(initialReceiveValues);
  const [showAdjustmentLog, setShowAdjustmentLog] = useState(false);
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);
  const [selectedAdjustmentInventory, setSelectedAdjustmentInventory] =
    useState(null);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingInventory, setEditingInventory] = useState(null);
  const [editLowStockThreshold, setEditLowStockThreshold] = useState("");

  const navigate = useNavigate();

  // OPEN EDIT INVENTORY MODAL
  const handleEditInventory = (row) => {
    setEditingInventory(row);
    setEditLowStockThreshold(String(row.lowStockThreshold ?? 0));
    setShowEditModal(true);
  };

  // CLOSE EDIT INVENTORY MODAL
  const closeEditModal = () => {
    if (submitting) return;

    setShowEditModal(false);
    setEditingInventory(null);
    setEditLowStockThreshold("");
  };

  // UPDATE INVENTORY
  const handleUpdateInventory = async (e) => {
    e.preventDefault();

    if (
      editLowStockThreshold === "" ||
      !Number.isInteger(Number(editLowStockThreshold)) ||
      Number(editLowStockThreshold) < 0
    ) {
      toast.error("Enter a valid low stock threshold");
      return;
    }

    try {
      setSubmitting(true);

      const response = await makeApiRequest({
        url: `update-inventory/${editingInventory._id}`,
        method: "PUT",
        data: {
          lowStockThreshold: Number(editLowStockThreshold),
        },
      });

      if (response?.status) {
        toast.success(response.message || "Inventory updated successfully");

        setShowEditModal(false);
        setEditingInventory(null);
        setEditLowStockThreshold("");

        await getInventory();
      } else {
        toast.error(response?.message || "Failed to update inventory");
      }
    } catch (error) {
      console.error("Update inventory error:", error);

      toast.error(
        error?.response?.data?.message || "Failed to update inventory"
      );
    } finally {
      setSubmitting(false);
    }
  };

  // GET INVENTORY
  const getInventory = useCallback(async () => {
    try {
      setLoading(true);

      let url = `get-inventory?page=${page}&limit=${limit}`;

      if (search.trim()) {
        url += `&search=${encodeURIComponent(search.trim())}`;
      }

      if (status) {
        url += `&status=${status}`;
      }

      if (warehouseId) {
        url += `&warehouseId=${warehouseId}`;
      }

      const response = await makeApiRequest({
        url,
        method: "GET",
      });

      if (response?.status && Array.isArray(response.data)) {
        setInventory(response.data);
        setTotalRecords(
          response.pagination?.total ??
            response.pagination?.totalRecords ??
            response.data.length
        );
      } else {
        setInventory([]);
        setTotalRecords(0);
      }
    } catch (error) {
      console.error("Get inventory error:", error);
      setInventory([]);
      setTotalRecords(0);

      toast.error(
        error?.response?.data?.message || "Failed to fetch inventory"
      );
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, status, warehouseId]);

  useEffect(() => {
    getInventory();
  }, [getInventory]);

  // GET WAREHOUSES
  const getWarehouses = async () => {
    try {
      const response = await makeApiRequest({
        url: "warehouse/get-warehouses",
        method: "GET",
      });

      if (response?.status && Array.isArray(response.data)) {
        setWarehouses(response.data);
      } else {
        setWarehouses([]);
      }
    } catch (error) {
      console.error("Get warehouses error:", error);
      toast.error("Failed to fetch warehouses");
    }
  };

  // GET PRODUCTS
  const getProducts = async () => {
    try {
      const response = await makeApiRequest({
        url: "getproduct",
        method: "GET",
      });

      if (response?.status && Array.isArray(response.data)) {
        setProducts(response.data);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error("Get products error:", error);
      toast.error("Failed to fetch products");
    }
  };

  useEffect(() => {
    getWarehouses();
    getProducts();
  }, []);

  // DELETE INVENTORY
  const handleDeleteInventory = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this inventory record?"
    );

    if (!confirmed) return;

    try {
      setSubmitting(true);

      const response = await makeApiRequest({
        url: `delete-inventory/${id}`,
        method: "DELETE",
      });

      if (response?.status) {
        toast.success(response.message || "Inventory deleted successfully");

        await getInventory();
      } else {
        toast.error(response?.message || "Failed to delete inventory");
      }
    } catch (error) {
      console.error("Delete inventory error:", error);

      toast.error(
        error?.response?.data?.message || "Failed to delete inventory"
      );
    } finally {
      setSubmitting(false);
    }
  };

  // GET VARIANTS BY PRODUCT
  const getVariants = async (productId) => {
    try {
      setVariants([]);

      if (!productId) return;

      const response = await makeApiRequest({
        url: "getproduct-variant",
        method: "GET",
      });

      if (response?.status && Array.isArray(response.data)) {
        const filteredVariants = response.data.filter((variant) => {
          const variantProductId =
            typeof variant.product === "object"
              ? variant.product?._id
              : variant.product;

          return String(variantProductId) === String(productId);
        });

        setVariants(filteredVariants);
      } else {
        setVariants([]);
      }
    } catch (error) {
      console.error("Get variants error:", error);
      setVariants([]);
      toast.error("Failed to fetch variants");
    }
  };

  // RECEIVE FORM CHANGE
  const handleReceiveChange = (e) => {
    const { name, value } = e.target;

    if (name === "productId") {
      setReceiveValues((prev) => ({
        ...prev,
        productId: value,
        variantId: "",
      }));

      setVariants([]);
      getVariants(value);
      return;
    }

    setReceiveValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // OPEN RECEIVE MODAL
  const openReceiveModal = () => {
    setReceiveValues({ ...initialReceiveValues });
    setVariants([]);
    setShowReceiveModal(true);
  };

  // CLOSE RECEIVE MODAL
  const closeReceiveModal = () => {
    if (submitting) return;

    setShowReceiveModal(false);
    setReceiveValues({ ...initialReceiveValues });
    setVariants([]);
  };

  // RECEIVE STOCK
  const handleReceiveStock = async (e) => {
    e.preventDefault();

    const {
      productId,
      variantId,
      warehouseId,
      batchNumber,
      receivedQuantity,
      lowStockThreshold,
      manufacturingDate,
      expiryDate,
      notes,
    } = receiveValues;

    if (
      !productId ||
      !variantId ||
      !warehouseId ||
      !batchNumber.trim() ||
      !receivedQuantity ||
      !expiryDate
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    if (
      !Number.isInteger(Number(receivedQuantity)) ||
      Number(receivedQuantity) <= 0
    ) {
      toast.error("Received quantity must be a positive whole number");
      return;
    }

    if (
      !Number.isInteger(Number(lowStockThreshold)) ||
      Number(lowStockThreshold) < 0
    ) {
      toast.error("Low stock threshold must be a non-negative whole number");
      return;
    }

    if (manufacturingDate && expiryDate <= manufacturingDate) {
      toast.error("Expiry date must be after manufacturing date");
      return;
    }

    if (expiryDate <= new Date().toISOString().slice(0, 10)) {
      toast.error("Expiry date must be in the future");
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        productId,
        variantId,
        warehouseId,
        batchNumber: batchNumber.trim(),
        receivedQuantity: Number(receivedQuantity),
        lowStockThreshold: Number(lowStockThreshold),
        manufacturingDate: manufacturingDate || undefined,
        expiryDate,
        notes: notes.trim(),
      };

      const response = await makeApiRequest({
        url: "receive-stock",
        method: "POST",
        data: payload,
      });

      if (response?.status) {
        toast.success(response.message || "Stock received successfully");

        setShowReceiveModal(false);
        setReceiveValues({ ...initialReceiveValues });
        setVariants([]);

        if (page === 1) {
          getInventory();
        } else {
          setPage(1);
        }
      } else {
        toast.error(response?.message || "Failed to receive stock");
      }
    } catch (error) {
      console.error("Receive stock error:", error);
      toast.error(error?.response?.data?.message || "Failed to receive stock");
    } finally {
      setSubmitting(false);
    }
  };

  // VIEW INVENTORY DETAILS
  const handleViewDetails = useCallback(async (id) => {
    try {
      const response = await makeApiRequest({
        url: `get-inventory/${id}`,
        method: "GET",
      });

      if (response?.status) {
        setSelectedInventory(response.data);
        setShowDetails(true);
      } else {
        toast.error(response?.message || "Failed to fetch inventory details");
      }
    } catch (error) {
      console.error("Inventory details error:", error);
      toast.error(
        error?.response?.data?.message || "Failed to fetch inventory details"
      );
    }
  }, []);

  // OPEN STOCK ADJUSTMENT FOR THE SELECTED ROW
  const openAdjustmentModal = (row) => {
    setSelectedAdjustmentInventory(row);
    setShowAdjustmentModal(true);
  };

  // CLOSE STOCK ADJUSTMENT
  const closeAdjustmentModal = () => {
    if (submitting) return;

    setShowAdjustmentModal(false);
    setSelectedAdjustmentInventory(null);
  };

  // HANDLE STOCK ADJUSTMENT API
  const handleStockAdjustment = async (payload) => {
    try {
      setSubmitting(true);

      const response = await makeApiRequest({
        url: "adjust-stock",
        method: "POST",
        data: payload,
      });

      if (response?.status) {
        toast.success(response.message || "Stock adjusted successfully");

        setShowAdjustmentModal(false);
        setSelectedAdjustmentInventory(null);

        await getInventory();
        return true;
      }

      toast.error(response?.message || "Failed to adjust stock");
      return false;
    } catch (error) {
      console.error("Stock adjustment error:", error);
      toast.error(error?.response?.data?.message || "Failed to adjust stock");
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  // SEARCH
  const handleSearch = (value) => {
    setSearch(value);
    setPage(1);
  };

  // STATUS FILTER
  const handleStatusChange = (value) => {
    setStatus(value);
    setPage(1);
  };

  // WAREHOUSE FILTER
  const handleWarehouseChange = (value) => {
    setWarehouseId(value);
    setPage(1);
  };

  // CLOSE DETAILS
  const closeDetails = () => {
    setShowDetails(false);
    setSelectedInventory(null);
  };

  // DATATABLE COLUMNS
  const columns = useMemo(
    () => [
      {
        name: "S.No",
        width: "70px",
        center: true,
        cell: (row, index) => (
          <span className="font-semibold text-[#7f8ba5]">
            {(page - 1) * limit + index + 1}
          </span>
        ),
      },
      {
        name: "Product",
        minWidth: "230px",
        selector: (row) => row.productId?.name || "N/A",
        cell: (row) => (
          <div className="flex items-center gap-3 py-2">
            {row.productId?.image ? (
              <img
                className="h-[42px] w-[42px] rounded-[10px] border border-[#e9ebf3] object-cover"
                src={row.productId.image}
                alt={row.productId.name || "Product"}
              />
            ) : (
              <div className="flex h-[42px] w-[42px] items-center justify-center rounded-[10px] bg-[#fbeef0] text-[#e98a9b]">
                <i className="fa fa-image"></i>
              </div>
            )}

            <div>
              <div className="font-bold text-[#1f2a4a]">
                {row.productId?.name || "N/A"}
              </div>
              <div className="text-[11px] text-[#7f8ba5]">
                {row.productId?.type || ""}
              </div>
            </div>
          </div>
        ),
      },
      {
        name: "SKU",
        minWidth: "150px",
        selector: (row) => row.sku || row.variantId?.sku || "N/A",
        sortable: true,
        cell: (row) => (
          <span className="rounded-md bg-[#fbeef0] px-2.5 py-1 font-mono text-xs text-[#b5576a]">
            {row.sku || row.variantId?.sku || "N/A"}
          </span>
        ),
      },
      {
        name: "Variant",
        minWidth: "120px",
        selector: (row) => row.variantId?.variantName || "N/A",
      },
      {
        name: "Warehouse",
        minWidth: "150px",
        selector: (row) => row.warehouseId?.name || "N/A",
        cell: (row) => (
          <div>
            <div className="font-bold text-[#1f2a4a]">
              {row.warehouseId?.name || "N/A"}
            </div>
            <div className="text-[11px] text-[#7f8ba5]">
              {row.warehouseId?.code || ""}
            </div>
          </div>
        ),
      },
      {
        name: "On Hand",
        width: "100px",
        selector: (row) => row.onHand ?? 0,
        sortable: true,
        center: true,
      },
      {
        name: "Reserved",
        width: "105px",
        selector: (row) => row.reserved ?? 0,
        sortable: true,
        center: true,
      },
      {
        name: "Available",
        width: "110px",
        selector: (row) => row.available ?? 0,
        sortable: true,
        center: true,
        cell: (row) => (
          <strong className="text-[#1f2a4a]">{row.available ?? 0}</strong>
        ),
      },
      {
        name: "Low Stock Limit",
        width: "140px",
        selector: (row) => row.lowStockThreshold ?? 0,
        center: true,
      },
      {
        name: "Status",
        width: "150px",
        selector: (row) => row.status || "",
        cell: (row) => renderStatus(row.status),
      },
      {
        name: "Action",
        minWidth: "360px",
        center: true,
        cell: (row) => (
          <div className="flex flex-wrap items-center justify-center gap-2 py-2">
            <button
              type="button"
              onClick={() => handleViewDetails(row._id)}
              className={`${actBase} border border-[#e9ebf3] bg-white text-[#8c2f3f] hover:border-[#e98a9b] hover:bg-[#fbeef0]`}
            >
              <i className="fa fa-eye"></i>
              View
            </button>

            <button
              type="button"
              onClick={() => openAdjustmentModal(row)}
              className={`${actBase} border border-[#e98a9b] bg-white text-[#d9748a] hover:bg-[#e98a9b] hover:text-white`}
            >
              <i className="fa fa-edit"></i>
              Adjust
            </button>

            <button
              type="button"
              onClick={() => handleEditInventory(row)}
              className={`${actBase} border border-[#e9ebff] bg-[#e9ebff] text-[#6b73d6] hover:bg-[#d9ddff]`}
            >
              <i className="fa fa-pencil"></i>
              Edit
            </button>

            <button
              type="button"
              onClick={() => handleDeleteInventory(row._id)}
              className={`${actBase} border border-[#fdeaea] bg-[#fdeaea] text-[#d64550] hover:bg-[#d64550] hover:text-white`}
            >
              <i className="fa fa-trash"></i>
              Delete
            </button>
          </div>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [page, limit, handleViewDetails]
  );

  const detailLabel = "text-[13px] font-bold text-[#1f2a4a]";
  const detailValue = "mt-0.5 text-sm text-[#1f2a4a]";

  return (
    <div className="min-h-screen bg-[#f5f6fb] px-3.5 py-[18px] text-[#1f2a4a] md:px-8 md:py-7">
      {/* HEADER */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3.5">
        <div>
          <h1 className="mb-1 text-[28px] font-bold text-[#e98a9b]">
            Inventory Management
          </h1>
          <p className="text-sm text-[#7f8ba5]">
            Manage product stock across warehouses
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            type="button"
            className={btnOutline}
            onClick={getInventory}
            disabled={loading}
          >
            <i className="fa fa-refresh"></i>
            Refresh
          </button>

          <button type="button" className={btnPrimary} onClick={openReceiveModal}>
            <i className="fa fa-plus"></i>
            Receive Stock
          </button>
        </div>
      </div>

      {/* FILTERS */}
      <div className="mb-4 rounded-2xl border border-[#e9ebf3] bg-white p-6 shadow-[0_4px_18px_rgba(31,42,74,0.04)]">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div className="w-full max-w-[400px]">
            <label className={labelCls}>Search</label>
            <input
              type="text"
              className={inputCls}
              placeholder="Search product name or SKU"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={btnOutline}
              onClick={() => setShowAdjustmentLog(true)}
            >
              <i className="fa fa-history"></i>
              Adjustment Log
            </button>

            <button
              type="button"
              className={btnSoft}
              onClick={() => navigate("/expiry-management")}
            >
              <i className="fa fa-calendar-times"></i>
              Expiry Management
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className={labelCls}>Stock Status</label>
            <select
              className={inputCls}
              value={status}
              onChange={(e) => handleStatusChange(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="IN_STOCK">In Stock</option>
              <option value="LOW_STOCK">Low Stock</option>
              <option value="OUT_OF_STOCK">Out of Stock</option>
            </select>
          </div>

          <div>
            <label className={labelCls}>Warehouse</label>
            <select
              className={inputCls}
              value={warehouseId}
              onChange={(e) => handleWarehouseChange(e.target.value)}
            >
              <option value="">All Warehouses</option>
              {warehouses.map((warehouse) => (
                <option key={warehouse._id} value={warehouse._id}>
                  {warehouse.name} ({warehouse.code})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* INVENTORY TABLE / ADJUSTMENT LOG */}
      {showAdjustmentLog ? (
        <StockAdjustmentLog
          warehouses={warehouses}
          onBack={() => setShowAdjustmentLog(false)}
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[#e9ebf3] bg-white shadow-[0_4px_18px_rgba(31,42,74,0.04)]">
          <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-[#e9ebf3] px-6 py-[18px]">
            <h5 className="text-lg font-bold text-[#1f2a4a]">Inventory List</h5>

            <span className="rounded-[10px] bg-[#e9ebff] px-3.5 py-1.5 text-xs font-bold text-[#6b73d6]">
              Total Records: {totalRecords}
            </span>
          </div>

          <DataTable
            columns={columns}
            data={inventory}
            customStyles={tableCustomStyles}
            progressPending={loading}
            progressComponent={
              <div className="p-[30px] text-[#7f8ba5]">Loading inventory...</div>
            }
            noDataComponent={
              <div className="p-10 text-[#7f8ba5]">
                No inventory records found
              </div>
            }
            pagination
            paginationServer
            paginationTotalRows={totalRecords}
            paginationPerPage={limit}
            paginationDefaultPage={page}
            paginationRowsPerPageOptions={[10, 20, 50, 100]}
            onChangePage={(newPage) => setPage(newPage)}
            onChangeRowsPerPage={(newLimit) => {
              setLimit(newLimit);
              setPage(1);
            }}
            highlightOnHover
            responsive
            persistTableHead
          />
        </div>
      )}

      {/* RECEIVE STOCK MODAL */}
      {showReceiveModal && (
        <form onSubmit={handleReceiveStock}>
          <Modal
            title="Receive Stock"
            size="max-w-3xl"
            onClose={closeReceiveModal}
            disabled={submitting}
            footer={
              <>
                <button
                  type="button"
                  className={btnOutline}
                  onClick={closeReceiveModal}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={btnPrimary}
                  disabled={submitting}
                >
                  {submitting ? "Receiving..." : "Receive Stock"}
                </button>
              </>
            }
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className={labelCls}>
                  Product <span className="text-[#d64550]">*</span>
                </label>
                <select
                  className={inputCls}
                  name="productId"
                  value={receiveValues.productId}
                  onChange={handleReceiveChange}
                  required
                >
                  <option value="">Select Product</option>
                  {products.map((product) => (
                    <option key={product._id} value={product._id}>
                      {product.name} {product.sku ? `(${product.sku})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelCls}>
                  Variant <span className="text-[#d64550]">*</span>
                </label>
                <select
                  className={inputCls}
                  name="variantId"
                  value={receiveValues.variantId}
                  onChange={handleReceiveChange}
                  required
                  disabled={!receiveValues.productId}
                >
                  <option value="">Select Variant</option>
                  {variants.map((variant) => (
                    <option key={variant._id} value={variant._id}>
                      {variant.variantName} ({variant.sku})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelCls}>
                  Warehouse <span className="text-[#d64550]">*</span>
                </label>
                <select
                  className={inputCls}
                  name="warehouseId"
                  value={receiveValues.warehouseId}
                  onChange={handleReceiveChange}
                  required
                >
                  <option value="">Select Warehouse</option>
                  {warehouses.map((warehouse) => (
                    <option key={warehouse._id} value={warehouse._id}>
                      {warehouse.name} ({warehouse.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelCls}>
                  Batch Number <span className="text-[#d64550]">*</span>
                </label>
                <input
                  type="text"
                  className={inputCls}
                  name="batchNumber"
                  value={receiveValues.batchNumber}
                  onChange={handleReceiveChange}
                  required
                />
              </div>

              <div>
                <label className={labelCls}>
                  Received Quantity <span className="text-[#d64550]">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  className={inputCls}
                  name="receivedQuantity"
                  value={receiveValues.receivedQuantity}
                  onChange={handleReceiveChange}
                  required
                />
              </div>

              <div>
                <label className={labelCls}>Low Stock Threshold</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  className={inputCls}
                  name="lowStockThreshold"
                  value={receiveValues.lowStockThreshold}
                  onChange={handleReceiveChange}
                />
              </div>

              <div>
                <label className={labelCls}>Manufacturing Date</label>
                <input
                  type="date"
                  className={inputCls}
                  name="manufacturingDate"
                  value={receiveValues.manufacturingDate}
                  onChange={handleReceiveChange}
                />
              </div>

              <div>
                <label className={labelCls}>
                  Expiry Date <span className="text-[#d64550]">*</span>
                </label>
                <input
                  type="date"
                  className={inputCls}
                  name="expiryDate"
                  min={new Date().toISOString().slice(0, 10)}
                  value={receiveValues.expiryDate}
                  onChange={handleReceiveChange}
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className={labelCls}>Notes</label>
                <textarea
                  className={inputCls}
                  name="notes"
                  rows="3"
                  value={receiveValues.notes}
                  onChange={handleReceiveChange}
                ></textarea>
              </div>
            </div>
          </Modal>
        </form>
      )}

      {/* INVENTORY DETAILS MODAL */}
      {showDetails && selectedInventory && (
        <Modal
          title="Inventory Details"
          size="max-w-3xl"
          onClose={closeDetails}
          footer={
            <button type="button" className={btnOutline} onClick={closeDetails}>
              Close
            </button>
          }
        >
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="col-span-2">
              <div className={detailLabel}>Product</div>
              <p className={detailValue}>
                {selectedInventory.productId?.name || "N/A"}
              </p>
            </div>

            <div className="col-span-2">
              <div className={detailLabel}>SKU</div>
              <p className={detailValue}>
                {selectedInventory.sku ||
                  selectedInventory.variantId?.sku ||
                  "N/A"}
              </p>
            </div>

            <div className="col-span-2">
              <div className={detailLabel}>Warehouse</div>
              <p className={detailValue}>
                {selectedInventory.warehouseId?.name || "N/A"}
              </p>
            </div>

            <div className="col-span-2">
              <div className={detailLabel}>Variant</div>
              <p className={detailValue}>
                {selectedInventory.variantId?.variantName || "N/A"}
              </p>
            </div>

            <div>
              <div className={detailLabel}>On Hand</div>
              <p className={detailValue}>{selectedInventory.onHand ?? 0}</p>
            </div>

            <div>
              <div className={detailLabel}>Reserved</div>
              <p className={detailValue}>{selectedInventory.reserved ?? 0}</p>
            </div>

            <div>
              <div className={detailLabel}>Available</div>
              <p className={detailValue}>{selectedInventory.available ?? 0}</p>
            </div>

            <div>
              <div className={detailLabel}>Low Stock Limit</div>
              <p className={detailValue}>
                {selectedInventory.lowStockThreshold ?? 0}
              </p>
            </div>

            <div className="col-span-2">
              <div className={detailLabel}>Status</div>
              <div className="mt-1">{renderStatus(selectedInventory.status)}</div>
            </div>

            <div className="col-span-2">
              <div className={detailLabel}>Created At</div>
              <p className={detailValue}>
                {selectedInventory.createdAt
                  ? new Date(selectedInventory.createdAt).toLocaleString()
                  : "N/A"}
              </p>
            </div>
          </div>
        </Modal>
      )}

      {showAdjustmentModal && (
        <StockAdjustmentModal
          inventory={selectedAdjustmentInventory}
          inventoryList={inventory}
          submitting={submitting}
          onClose={closeAdjustmentModal}
          onSubmit={handleStockAdjustment}
        />
      )}

      {/* EDIT INVENTORY MODAL */}
      {showEditModal && editingInventory && (
        <form onSubmit={handleUpdateInventory}>
          <Modal
            title="Edit Inventory"
            onClose={closeEditModal}
            disabled={submitting}
            footer={
              <>
                <button
                  type="button"
                  className={btnOutline}
                  onClick={closeEditModal}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={btnPrimary}
                  disabled={submitting}
                >
                  {submitting ? "Updating..." : "Update Inventory"}
                </button>
              </>
            }
          >
            <div className="space-y-4">
              <div>
                <label className={labelCls}>Product</label>
                <input
                  type="text"
                  className={inputCls}
                  value={editingInventory.productId?.name || "N/A"}
                  disabled
                />
              </div>

              <div>
                <label className={labelCls}>SKU</label>
                <input
                  type="text"
                  className={inputCls}
                  value={
                    editingInventory.sku ||
                    editingInventory.variantId?.sku ||
                    "N/A"
                  }
                  disabled
                />
              </div>

              <div>
                <label className={labelCls}>Warehouse</label>
                <input
                  type="text"
                  className={inputCls}
                  value={editingInventory.warehouseId?.name || "N/A"}
                  disabled
                />
              </div>

              <div>
                <label className={labelCls}>Low Stock Threshold *</label>
                <input
                  type="number"
                  className={inputCls}
                  min="0"
                  step="1"
                  value={editLowStockThreshold}
                  onChange={(e) => setEditLowStockThreshold(e.target.value)}
                  required
                />
                <small className="mt-1 block text-xs text-[#7f8ba5]">
                  Dashboard low-stock alerts use this threshold.
                </small>
              </div>
            </div>
          </Modal>
        </form>
      )}
    </div>
  );
}

export default ViewInventory;