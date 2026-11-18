
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

      console.log("Warehouse By ID Response:", response);

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

        // Refresh list after saving
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

  // DELETE WAREHOUSE
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
      name: "#",
      width: "65px",
      cell: (row, index) => (
        <span>{(page - 1) * limit + index + 1}</span>
      ),
    },
    {
      name: "WAREHOUSE",
      minWidth: "190px",
      selector: (row) => row.name,
      sortable: true,
      cell: (row) => (
        <div style={{ padding: "8px 0" }}>
          <div style={{ fontWeight: "600", color: "#343a40" }}>
            {row.name}
          </div>
          <small style={{ color: "#888" }}>
            {row.address || "No address"}
          </small>
        </div>
      ),
    },
    {
      name: "CODE",
      selector: (row) => row.code,
      sortable: true,
      cell: (row) => (
        <span
          style={{
            background: "#f0f2f5",
            color: "#495057",
            padding: "5px 10px",
            borderRadius: "5px",
            fontWeight: "600",
            fontSize: "12px",
          }}
        >
          {row.code}
        </span>
      ),
    },
    {
      name: "CONTACT PERSON",
      minWidth: "140px",
      selector: (row) => row.contactPerson || "-",
      sortable: true,
    },
    {
      name: "PHONE",
      selector: (row) => row.phone || "-",
      minWidth: "130px",
    },
    {
      name: "STATUS",
      selector: (row) => row.status,
      cell: (row) => (
        <span
          style={{
            padding: "5px 11px",
            borderRadius: "20px",
            fontSize: "11px",
            fontWeight: "600",
            background: row.status === "ACTIVE" ? "#e5f7ed" : "#fdeaea",
            color: row.status === "ACTIVE" ? "#198754" : "#dc3545",
          }}
        >
          {row.status}
        </span>
      ),
    },
    {
      name: "DEFAULT",
      selector: (row) => row.isDefault,
      center: true,
      cell: (row) =>
        row.isDefault ? (
          <span style={{ color: "#b8860b", fontWeight: "600" }}>
            ★ Default
          </span>
        ) : (
          <span style={{ color: "#999" }}>-</span>
        ),
    },
    {
      name: "ACTIONS",
      width: "245px",
      center: true,
      cell: (row) => (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            padding: "5px 0",
          }}
        >
          {!row.isDefault && row.status === "ACTIVE" && (
            <button
              type="button"
              onClick={() => handleSetDefault(row._id)}
              style={{
                border: "1px solid #198754",
                color: "#198754",
                background: "#fff",
                borderRadius: "5px",
                padding: "6px 9px",
                fontSize: "11px",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              Set Default
            </button>
          )}

          <button
            type="button"
            onClick={() => handleEdit(row._id)}
            style={{
              border: "1px solid #0d6efd",
              color: "#0d6efd",
              background: "#fff",
              borderRadius: "5px",
              padding: "6px 10px",
              cursor: "pointer",
              fontSize: "12px",
            }}
          >
            Edit
          </button>

          <button
            type="button"
            onClick={() => handleDelete(row._id)}
            style={{
              border: "1px solid #dc3545",
              color: "#dc3545",
              background: "#fff",
              borderRadius: "5px",
              padding: "6px 10px",
              cursor: "pointer",
              fontSize: "12px",
            }}
          >
            Delete
          </button>
        </div>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },
  ];

  // DATATABLE CUSTOM STYLES
  const customStyles = {
    table: {
      style: {
        backgroundColor: "#ffffff",
      },
    },
    headRow: {
      style: {
        backgroundColor: "#f7f8fa",
        borderBottom: "1px solid #e9ecef",
        minHeight: "50px",
      },
    },
    headCells: {
      style: {
        color: "#495057",
        fontSize: "12px",
        fontWeight: "600",
        paddingLeft: "14px",
        paddingRight: "14px",
      },
    },
    rows: {
      style: {
        minHeight: "65px",
        fontSize: "13px",
        color: "#495057",
        "&:not(:last-of-type)": {
          borderBottom: "1px solid #f0f1f3",
        },
      },
      highlightOnHoverStyle: {
        backgroundColor: "#f8f9fa",
      },
    },
    cells: {
      style: {
        paddingLeft: "14px",
        paddingRight: "14px",
      },
    },
    pagination: {
      style: {
        borderTop: "1px solid #e9ecef",
        fontSize: "13px",
        minHeight: "55px",
      },
    },
  };

  return (
    <div className="container-fluid" style={{ padding: "20px" }}>
      {/* PAGE HEADER */}
      <div
        className="d-flex justify-content-between align-items-center mb-4"
        style={{ gap: "12px" }}
      >
        <div>
          <h4
            style={{
              fontSize: "22px",
              fontWeight: "600",
              color: "#263238",
              marginBottom: "5px",
            }}
          >
            Warehouse Management
          </h4>

          <p className="text-muted mb-0" style={{ fontSize: "13px" }}>
            Manage your warehouse locations
          </p>
        </div>

        {!showForm && (
          <button
            type="button"
            onClick={handleCreate}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              backgroundColor: "#0d6efd",
              color: "#ffffff",
              border: "1px solid #0d6efd",
              borderRadius: "6px",
              padding: "10px 20px",
              fontSize: "14px",
              fontWeight: "600",
              minHeight: "42px",
              whiteSpace: "nowrap",
              cursor: "pointer",
            }}
          >
            <span style={{ fontSize: "19px", lineHeight: 1 }}>+</span>
            Add Warehouse
          </button>
        )}
      </div>

      {/* CREATE / EDIT PAGE */}
      {showForm ? (
        <div
          className="card border-0 shadow-sm"
          style={{ borderRadius: "10px" }}
        >
          <div className="card-header bg-white py-3">
            <h5 className="mb-0 fw-semibold">
              {editId ? "Edit Warehouse" : "Create Warehouse"}
            </h5>
          </div>

          <div className="card-body p-4">
            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label fw-semibold small">
                    Warehouse Name *
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    name="name"
                    placeholder="Enter warehouse name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold small">
                    Warehouse Code *
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    name="code"
                    placeholder="Enter warehouse code"
                    value={formData.code}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold small">
                    Address
                  </label>
                  <textarea
                    className="form-control"
                    name="address"
                    placeholder="Enter warehouse address"
                    rows="3"
                    value={formData.address}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-3">
                  <label className="form-label fw-semibold small">
                    Contact Person
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    name="contactPerson"
                    placeholder="Contact person"
                    value={formData.contactPerson}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-3">
                  <label className="form-label fw-semibold small">
                    Phone
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    name="phone"
                    placeholder="Phone number"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold small">
                    Status
                  </label>
                  <select
                    className="form-select"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>

                <div className="col-md-6 d-flex align-items-center">
                  <div className="form-check mt-3">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="isDefault"
                      name="isDefault"
                      checked={formData.isDefault}
                      onChange={handleChange}
                    />
                    <label
                      className="form-check-label fw-semibold small"
                      htmlFor="isDefault"
                    >
                      Set as Default Warehouse
                    </label>
                  </div>
                </div>
              </div>

              <div className="d-flex gap-2 mt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    backgroundColor: "#0d6efd",
                    color: "#fff",
                    border: "1px solid #0d6efd",
                    borderRadius: "6px",
                    padding: "9px 20px",
                    fontSize: "13px",
                    fontWeight: "600",
                    cursor: submitting ? "not-allowed" : "pointer",
                    opacity: submitting ? 0.7 : 1,
                  }}
                >
                  {submitting
                    ? "Saving..."
                    : editId
                      ? "Update Warehouse"
                      : "Create Warehouse"}
                </button>

                <button
                  type="button"
                  onClick={handleCancel}
                  style={{
                    backgroundColor: "#6c757d",
                    color: "#fff",
                    border: "1px solid #6c757d",
                    borderRadius: "6px",
                    padding: "9px 20px",
                    fontSize: "13px",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        /* WAREHOUSE LIST PAGE */
        <div
          className="card border-0 shadow-sm"
          style={{ borderRadius: "10px", overflow: "hidden" }}
        >
          <div
            className="card-header bg-white d-flex justify-content-between align-items-center"
            style={{ padding: "18px 20px" }}
          >
            <div>
              <h5 className="mb-1" style={{ fontWeight: "600" }}>
                Warehouse List
              </h5>
              <small className="text-muted">
                Total {pagination.total} warehouses
              </small>
            </div>
          </div>

          <div className="card-body p-0">
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
                <div className="py-5 text-center">
                  <h6 className="text-muted">No warehouses found</h6>
                  <p className="text-muted mb-0">
                    Add a warehouse to get started.
                  </p>
                </div>
              }
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default ViewWarehouse;
