import React, { useCallback, useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { toast } from "react-toastify";
import { makeApiRequest } from "../../AxiosServices/apiCall";

const initialValues = {
  name: "",
  code: "",
  address: "",
  contactPerson: "",
  phone: "",
  status: "ACTIVE",
  isDefault: false,
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
  "w-full rounded-[10px] border border-[#e9ebf3] bg-[#f5f6fb] px-3.5 py-2.5 text-sm text-[#1f2a4a] outline-none transition placeholder:text-[#a9b2c7] focus:border-[#e98a9b] focus:bg-white focus:ring-4 focus:ring-[#e98a9b]/20";
const labelCls = "mb-1.5 block text-[13px] font-semibold text-[#1f2a4a]";
const btnPrimary =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[10px] bg-[#e98a9b] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_6px_14px_rgba(233,138,155,0.35)] transition hover:bg-[#d9748a] disabled:cursor-not-allowed disabled:opacity-60";
const btnGhost =
  "inline-flex items-center justify-center whitespace-nowrap rounded-[10px] border border-[#e9ebf3] bg-white px-5 py-2.5 text-sm font-semibold text-[#1f2a4a] transition hover:bg-[#f5f6fb]";

function ViewWarehouse() {
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState(initialValues);

  const [page, setPage] = useState(1);
  const limit = 10;

  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
  });

  // GET WAREHOUSE LIST
  const getWarehouses = useCallback(async () => {
    try {
      setLoading(true);

      const response = await makeApiRequest({
        url: `warehouse/get-warehouses?page=${page}&limit=${limit}`,
        method: "GET",
      });

      if (response?.status && Array.isArray(response.data)) {
        setWarehouses(response.data);

        setPagination({
          total: response.pagination?.total || 0,
          totalPages: response.pagination?.totalPages || 0,
        });
      } else {
        setWarehouses([]);
        setPagination({ total: 0, totalPages: 0 });
      }
    } catch (error) {
      console.error("Get Warehouses Error:", error);
      toast.error(
        error?.response?.data?.message || "Failed to fetch warehouses"
      );
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    if (!showForm) {
      getWarehouses();
    }
  }, [getWarehouses, showForm]);

  // INPUT CHANGE
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // OPEN CREATE FORM
  const handleCreate = () => {
    setEditId(null);
    setFormData({ ...initialValues });
    setShowForm(true);
  };

  // CLOSE FORM AND RETURN TO LIST
  const handleCancel = () => {
    setShowForm(false);
    setEditId(null);
    setFormData({ ...initialValues });
  };

  // GET WAREHOUSE BY ID
  const handleEdit = async (id) => {
    try {
      setLoading(true);

      const response = await makeApiRequest({
        url: `warehouse/get-warehouse/${id}`,
        method: "GET",
      });

      if (!response?.status) {
        toast.error(response?.message || "Failed to fetch warehouse");
        return;
      }

      // Supports common API response structures
      const warehouse =
        response.data?.warehouse ||
        response.data?.data?.warehouse ||
        response.data?.data ||
        response.data;

      if (!warehouse || Array.isArray(warehouse)) {
        toast.error("Warehouse details not found");
        return;
      }

      setFormData({
        name: warehouse.name || "",
        code: warehouse.code || "",
        address: warehouse.address || "",
        contactPerson: warehouse.contactPerson || "",
        phone: warehouse.phone || "",
        status: warehouse.status || "ACTIVE",
        isDefault: Boolean(warehouse.isDefault),
      });

      setEditId(id);
      setShowForm(true);
    } catch (error) {
      console.error("Get Warehouse Error:", error);
      toast.error(
        error?.response?.data?.message || "Failed to fetch warehouse"
      );
    } finally {
      setLoading(false);
    }
  };

  // CREATE / UPDATE WAREHOUSE
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.code.trim()) {
      toast.error("Warehouse name and code are required");
      return;
    }

    try {
      setSubmitting(true);

      const response = await makeApiRequest({
        url: editId
          ? `warehouse/update-warehouse/${editId}`
          : "warehouse/create-warehouse",
        method: editId ? "PUT" : "POST",
        data: formData,
      });

      if (response?.status) {
        toast.success(response.message || "Warehouse saved successfully");

        setShowForm(false);
        setEditId(null);
        setFormData({ ...initialValues });

        getWarehouses();
      } else {
        toast.error(response?.message || "Failed to save warehouse");
      }
    } catch (error) {
      console.error("Save Warehouse Error:", error);
      toast.error(
        error?.response?.data?.message || "Failed to save warehouse"
      );
    } finally {
      setSubmitting(false);
    }
  };

  // SET DEFAULT WAREHOUSE
  const handleSetDefault = async (id) => {
    try {
      const response = await makeApiRequest({
        url: `warehouse/set-default/${id}`,
        method: "PUT",
      });

      if (response?.status) {
        toast.success(response.message || "Default warehouse updated");
        getWarehouses();
      } else {
        toast.error(response?.message || "Failed to set default warehouse");
      }
    } catch (error) {
      console.error("Set Default Error:", error);
      toast.error(
        error?.response?.data?.message || "Failed to set default warehouse"
      );
    }
  };

  // DELETE WAREHOUSE (currently not shown in the table)
  // eslint-disable-next-line no-unused-vars
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this warehouse?")) {
      return;
    }

    try {
      const response = await makeApiRequest({
        url: `warehouse/delete-warehouse/${id}`,
        method: "DELETE",
      });

      if (response?.status) {
        toast.success(response.message || "Warehouse deleted successfully");

        if (warehouses.length === 1 && page > 1) {
          setPage((prev) => prev - 1);
        } else {
          getWarehouses();
        }
      } else {
        toast.error(response?.message || "Failed to delete warehouse");
      }
    } catch (error) {
      console.error("Delete Warehouse Error:", error);
      toast.error(
        error?.response?.data?.message || "Failed to delete warehouse"
      );
    }
  };

  // DATATABLE COLUMNS
  const columns = [
    {
      name: "S.No",
      width: "70px",
      cell: (row, index) => (
        <span className="font-semibold text-[#7f8ba5]">
          {(page - 1) * limit + index + 1}
        </span>
      ),
    },
    {
      name: "Warehouse",
      minWidth: "200px",
      selector: (row) => row.name,
      sortable: true,
      cell: (row) => (
        <div className="py-2">
          <div className="font-bold text-[#1f2a4a]">{row.name}</div>
          <div className="text-xs text-[#7f8ba5]">
            {row.address || "No address"}
          </div>
        </div>
      ),
    },
    {
      name: "Code",
      selector: (row) => row.code,
      sortable: true,
      cell: (row) => (
        <span className="rounded-md bg-[#fbeef0] px-2.5 py-1 font-mono text-xs text-[#b5576a]">
          {row.code}
        </span>
      ),
    },
    {
      name: "Contact Person",
      minWidth: "150px",
      selector: (row) => row.contactPerson || "-",
      sortable: true,
    },
    {
      name: "Phone",
      selector: (row) => row.phone || "-",
      minWidth: "140px",
    },
    {
      name: "Status",
      selector: (row) => row.status,
      cell: (row) => (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold tracking-wide ${
            row.status === "ACTIVE"
              ? "bg-[#e1f6ea] text-[#1f9d62]"
              : "bg-[#fdeaea] text-[#d64550]"
          }`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-current" />
          {row.status}
        </span>
      ),
    },
    {
      name: "Default",
      selector: (row) => row.isDefault,
      center: true,
      cell: (row) =>
        row.isDefault ? (
          <span className="rounded-full bg-[#fff6dc] px-2.5 py-1 text-xs font-bold text-[#b8860b]">
            ★ Default
          </span>
        ) : (
          <span className="text-[#7f8ba5]">-</span>
        ),
    },
    {
      name: "Actions",
      width: "240px",
      center: true,
      cell: (row) => (
        <div className="flex gap-2 py-1">
          {!row.isDefault && row.status === "ACTIVE" && (
            <button
              type="button"
              onClick={() => handleSetDefault(row._id)}
              className="cursor-pointer rounded-lg border border-[#e9ebf3] bg-white px-3 py-1.5 text-xs font-semibold text-[#8c2f3f] transition hover:border-[#e98a9b] hover:bg-[#fbeef0]"
            >
              Set Default
            </button>
          )}

          <button
            type="button"
            onClick={() => handleEdit(row._id)}
            className="cursor-pointer rounded-lg border border-[#e98a9b] bg-[#e98a9b] px-3 py-1.5 text-xs font-semibold text-white transition hover:border-[#d9748a] hover:bg-[#d9748a]"
          >
            Edit
          </button>
        </div>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },
  ];

  // DATATABLE CUSTOM STYLES (react-data-table-component needs an object)
  const customStyles = {
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
        color: theme.headText,
        fontSize: "12px",
        fontWeight: "700",
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        paddingLeft: "16px",
        paddingRight: "16px",
      },
    },
    rows: {
      style: {
        minHeight: "70px",
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
      style: { paddingLeft: "16px", paddingRight: "16px" },
    },
    pagination: {
      style: {
        borderTop: `1px solid ${theme.border}`,
        fontSize: "13px",
        color: theme.muted,
        minHeight: "58px",
      },
    },
  };

  return (
    <div className="min-h-screen bg-[#f5f6fb] px-3.5 py-[18px] md:px-8 md:py-7">
      {/* PAGE HEADER */}
      <div className="mb-[22px] flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="mb-1 text-[28px] font-bold text-[#e98a9b]">
            Warehouse Management
          </h1>
          <p className="text-sm text-[#7f8ba5]">Manage your warehouse locations</p>
        </div>

        {!showForm && warehouses.length === 0 && !loading && (
          <button type="button" onClick={handleCreate} className={btnPrimary}>
            <span className="text-lg leading-none">+</span>
            Add Warehouse
          </button>
        )}
      </div>

      {/* CREATE / EDIT PAGE */}
      {showForm ? (
        <div className="overflow-hidden rounded-2xl border border-[#e9ebf3] bg-white shadow-[0_4px_18px_rgba(31,42,74,0.04)]">
          <div className="bg-[#e8cdd1] px-6 py-5">
            <h5 className="text-lg font-bold text-[#8c2f3f]">
              {editId ? "Edit Warehouse" : "Create Warehouse"}
            </h5>
            <span className="text-[13px] text-[#8c2f3f]/80">
              Fields marked with * are required
            </span>
          </div>

          <form onSubmit={handleSubmit} className="px-7 pb-8 pt-6">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-12">
              <div className="md:col-span-6">
                <label className={labelCls}>Warehouse Name *</label>
                <input
                  type="text"
                  className={inputCls}
                  name="name"
                  placeholder="Enter warehouse name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="md:col-span-6">
                <label className={labelCls}>Warehouse Code *</label>
                <input
                  type="text"
                  className={inputCls}
                  name="code"
                  placeholder="Enter warehouse code"
                  value={formData.code}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="md:col-span-6">
                <label className={labelCls}>Address</label>
                <textarea
                  className={inputCls}
                  name="address"
                  placeholder="Enter warehouse address"
                  rows="3"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>

              <div className="md:col-span-3">
                <label className={labelCls}>Contact Person</label>
                <input
                  type="text"
                  className={inputCls}
                  name="contactPerson"
                  placeholder="Contact person"
                  value={formData.contactPerson}
                  onChange={handleChange}
                />
              </div>

              <div className="md:col-span-3">
                <label className={labelCls}>Phone</label>
                <input
                  type="text"
                  className={inputCls}
                  name="phone"
                  placeholder="Phone number"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>

              <div className="md:col-span-6">
                <label className={labelCls}>Status</label>
                <select
                  className={inputCls}
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>

              <div className="md:col-span-6">
                <label
                  htmlFor="isDefault"
                  className="flex h-full cursor-pointer items-center gap-2.5 rounded-[10px] bg-[#fbeef0] px-3.5 py-3"
                >
                  <input
                    type="checkbox"
                    id="isDefault"
                    name="isDefault"
                    checked={formData.isDefault}
                    onChange={handleChange}
                    className="h-[18px] w-[18px] accent-[#e98a9b]"
                  />
                  <span className="text-[13px] font-semibold text-[#1f2a4a]">
                    Set as Default Warehouse
                  </span>
                </label>
              </div>
            </div>

            <div className="mt-7 flex gap-3 border-t border-[#e9ebf3] pt-[22px]">
              <button type="submit" disabled={submitting} className={btnPrimary}>
                {submitting
                  ? "Saving..."
                  : editId
                    ? "Update Warehouse"
                    : "Create Warehouse"}
              </button>

              <button type="button" onClick={handleCancel} className={btnGhost}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* WAREHOUSE LIST PAGE */
        <div className="overflow-hidden rounded-2xl border border-[#e9ebf3] bg-white shadow-[0_4px_18px_rgba(31,42,74,0.04)]">
          <div className="flex items-center justify-between border-b border-[#e9ebf3] px-6 py-5">
            <div>
              <h5 className="mb-0.5 text-lg font-bold text-[#1f2a4a]">
                Warehouse List
              </h5>
              <span className="text-[13px] text-[#7f8ba5]">
                Quick view of all your locations
              </span>
            </div>
            <div className="rounded-[10px] bg-[#e9ebff] px-3.5 py-1.5 text-xs font-bold text-[#6b73d6]">
              {pagination.total}{" "}
              {pagination.total === 1 ? "warehouse" : "warehouses"}
            </div>
          </div>

          <DataTable
            keyField="_id"
            columns={columns}
            data={warehouses}
            customStyles={customStyles}
            progressPending={loading}
            pagination
            paginationServer
            paginationTotalRows={pagination.total}
            paginationPerPage={limit}
            paginationDefaultPage={page}
            onChangePage={(newPage) => setPage(newPage)}
            paginationRowsPerPageOptions={[10]}
            highlightOnHover
            responsive
            persistTableHead
            noDataComponent={
              <div className="py-12 text-center">
                <div className="mb-3 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fbeef0] text-2xl text-[#e98a9b]">
                  ▦
                </div>
                <h6 className="mb-1 font-bold text-[#1f2a4a]">
                  No warehouses found
                </h6>
                <p className="text-[13px] text-[#7f8ba5]">
                  Add a warehouse to get started.
                </p>
              </div>
            }
          />
        </div>
      )}
    </div>
  );
}

export default ViewWarehouse;