import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import DataTable from "react-data-table-component";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPenToSquare,
  faTrash,
  faMagnifyingGlass,
  faPlus,
  faRotate,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import { makeApiRequest } from "../../AxiosServices/apiCall";

function ViewSubAdmin() {
  const navigate = useNavigate();

  const [admins, setAdmins] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const fetchAdmins = useCallback(async () => {
    try {
      setLoading(true);

      const response = await makeApiRequest({
        url: "view-admin",
        method: "GET",
      });

      const result = response?.data ?? response;

      const adminList = Array.isArray(result)
        ? result
        : Array.isArray(result?.admins)
          ? result.admins
          : Array.isArray(result?.data)
            ? result.data
            : null;

      if (!adminList) {
        throw new Error("Unexpected admin list API response.");
      }

      setAdmins(adminList);
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
        err.message ||
        "Unable to fetch sub-admins."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  const filteredAdmins = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    if (!searchText) return admins;

    return admins.filter(
      (admin) =>
        (admin.name || "").toLowerCase().includes(searchText) ||
        (admin.email || "").toLowerCase().includes(searchText)
    );
  }, [admins, search]);

  const handleEdit = (admin) => {
    navigate(`/edit-subadmin/${admin._id}`, {
      state: { admin },
    });
  };

  const handleDelete = async (adminId) => {
    try {
      setDeletingId(adminId);

      const response = await makeApiRequest({
        url: `/delete-admin/${adminId}`,
        method: "DELETE",
      });

      toast.success(
        response?.data?.message ||
        response?.message ||
        "Sub-admin deleted successfully."
      );

      setAdmins((prev) =>
        prev.filter((admin) => admin._id !== adminId)
      );
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
        err.message ||
        "Unable to delete sub-admin."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const columns = useMemo(
    () => [
      {
        name: "S.No",
        width: "75px",
        sortable: false,
        cell: (row, index) => (
          <span style={{ color: "#64748b", fontWeight: 500 }}>
            {index + 1}
          </span>
        ),
      },
      {
        name: "SUB ADMIN",
        selector: (row) => row.name || "",
        sortable: true,
        minWidth: "190px",
        cell: (row) => (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "8px 0",
            }}
          >
            <div
              style={{
                width: "38px",
                height: "38px",
                minWidth: "38px",
                borderRadius: "50%",
                backgroundColor: "#e8efff",
                color: "#2458c6",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: "14px",
              }}
            >
              {(row.name || "S").trim().charAt(0).toUpperCase()}
            </div>

            <span
              style={{
                color: "#1e293b",
                fontWeight: 600,
                overflowWrap: "anywhere",
              }}
            >
              {row.name || "Unnamed"}
            </span>
          </div>
        ),
      },
      {
        name: "EMAIL ADDRESS",
        selector: (row) => row.email || "",
        sortable: true,
        minWidth: "250px",
        wrap: true,
        cell: (row) => (
          <span style={{ color: "#475569", overflowWrap: "anywhere" }}>
            {row.email || "N/A"}
          </span>
        ),
      },
      {
        name: "STATUS",
        selector: (row) => row.status || "",
        sortable: true,
        width: "150px",
        cell: (row) => {
          const isActive = row.status === "ACTIVE";

          return (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "7px",
                padding: "6px 11px",
                borderRadius: "20px",
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.3px",
                color: isActive ? "#15803d" : "#64748b",
                backgroundColor: isActive ? "#dcfce7" : "#f1f5f9",
                whiteSpace: "nowrap",
              }}
            >
              <span
                style={{
                  width: "7px",
                  height: "7px",
                  borderRadius: "50%",
                  backgroundColor: isActive ? "#22c55e" : "#94a3b8",
                }}
              />
              {row.status || "N/A"}
            </span>
          );
        },
      },
      {
        name: "ACTIONS",
        width: "155px",
        minWidth: "155px",
        cell: (row) => (
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "flex-start",
              gap: "10px",
              width: "100%",
              whiteSpace: "nowrap",
            }}
          >
            <button
              type="button"
              title="Edit Sub Admin"
              aria-label={`Edit ${row.name || "sub-admin"}`}
              onClick={() => handleEdit(row)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "38px",
                minWidth: "38px",
                height: "38px",
                padding: 0,
                flexShrink: 0,
                border: "1px solid #bfdbfe",
                borderRadius: "8px",
                backgroundColor: "#eff6ff",
                color: "#2563eb",
                cursor: "pointer",
              }}
            >
              <FontAwesomeIcon icon={faPenToSquare} />
            </button>

            <button
              type="button"
              title="Delete Sub Admin"
              aria-label={`Delete ${row.name || "sub-admin"}`}
              disabled={deletingId === row._id}
              onClick={() => handleDelete(row._id)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "38px",
                minWidth: "38px",
                height: "38px",
                padding: 0,
                flexShrink: 0,
                border: "1px solid #fecaca",
                borderRadius: "8px",
                backgroundColor: "#fef2f2",
                color: "#dc2626",
                cursor:
                  deletingId === row._id ? "not-allowed" : "pointer",
                opacity: deletingId === row._id ? 0.6 : 1,
              }}
            >
              {deletingId === row._id ? (
                <span
                  className="spinner-border spinner-border-sm"
                  role="status"
                  aria-label="Deleting"
                />
              ) : (
                <FontAwesomeIcon icon={faTrash} />
              )}
            </button>
          </div>
        ),
      },
    ],
    [deletingId]
  );

  const customStyles = useMemo(
    () => ({
      tableWrapper: {
        style: {
          width: "100%",
          overflowX: "auto",
        },
      },
      table: {
        style: {
          width: "100%",
          minWidth: "800px",
        },
      },
      headRow: {
        style: {
          minHeight: "54px",
          backgroundColor: "#f8fafc",
          borderBottom: "1px solid #e2e8f0",
        },
      },
      headCells: {
        style: {
          paddingLeft: "20px",
          paddingRight: "20px",
          color: "#64748b",
          fontSize: "11px",
          fontWeight: 700,
          letterSpacing: "0.6px",
          whiteSpace: "nowrap",
        },
      },
      rows: {
        style: {
          minHeight: "68px",
          backgroundColor: "#ffffff",
          borderBottom: "1px solid #f1f5f9",
          fontSize: "13px",
          color: "#334155",
        },
        highlightOnHoverStyle: {
          backgroundColor: "#f8fafc",
          transition: "background-color 0.15s ease",
        },
      },
      cells: {
        style: {
          paddingLeft: "20px",
          paddingRight: "20px",
          overflow: "visible",
        },
      },
      pagination: {
        style: {
          minHeight: "60px",
          borderTop: "1px solid #e2e8f0",
          color: "#64748b",
          fontSize: "12px",
        },
      },
      progress: {
        style: {
          minHeight: "180px",
        },
      },
      noData: {
        style: {
          minHeight: "150px",
          color: "#64748b",
          fontSize: "14px",
        },
      },
    }),
    []
  );

  return (
    <div
      style={{
        width: "100%",
        minHeight: "100%",
        padding: "28px",
        backgroundColor: "#f5f7fb",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "16px",
          marginBottom: "26px",
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              marginBottom: "7px",
              color: "#172033",
              fontSize: "26px",
              fontWeight: 700,
              letterSpacing: "-0.5px",
            }}
          >
            Sub Admins
          </h2>

          <p
            style={{
              margin: 0,
              color: "#64748b",
              fontSize: "14px",
            }}
          >
            Manage sub-admin accounts and their access.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/add-subadmin")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "9px",
            padding: "12px 18px",
            border: "none",
            borderRadius: "9px",
            backgroundColor: "#2563eb",
            color: "#ffffff",
            fontSize: "13px",
            fontWeight: 600,
            cursor: "pointer",
            boxShadow: "0 3px 8px rgba(37, 99, 235, 0.18)",
          }}
        >
          <FontAwesomeIcon icon={faPlus} />
          Add Sub Admin
        </button>
      </div>


      <div
        style={{
          width: "100%",
          backgroundColor: "#ffffff",
          border: "1px solid #e8edf5",
          borderRadius: "14px",
          boxShadow: "0 4px 18px rgba(15, 23, 42, 0.04)",
          overflow: "hidden",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "16px",
            padding: "22px 24px",
            borderBottom: "1px solid #edf0f5",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "44px",
                height: "44px",
                borderRadius: "10px",
                backgroundColor: "#eff6ff",
                color: "#2563eb",
                fontSize: "18px",
              }}
            >
              <FontAwesomeIcon icon={faUsers} />
            </div>

            <div>
              <h5
                style={{
                  margin: 0,
                  marginBottom: "5px",
                  fontSize: "16px",
                  fontWeight: 700,
                  color: "#1e293b",
                }}
              >
                All Sub Admins
              </h5>

              <p
                style={{
                  margin: 0,
                  color: "#94a3b8",
                  fontSize: "12px",
                }}
              >
                View and manage registered accounts
              </p>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 13px",
              borderRadius: "9px",
              backgroundColor: "#f8fafc",
              border: "1px solid #e2e8f0",
              color: "#475569",
              fontSize: "12px",
            }}
          >
            Total Sub Admins
            <strong
              style={{
                color: "#1d4ed8",
                fontSize: "15px",
                marginLeft: "4px",
              }}
            >
              {admins.length}
            </strong>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "14px",
            padding: "20px 24px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              width: "100%",
              maxWidth: "380px",
              padding: "0 13px",
              border: "1px solid #dce3ed",
              borderRadius: "9px",
              backgroundColor: "#ffffff",
              boxSizing: "border-box",
            }}
          >
            <FontAwesomeIcon
              icon={faMagnifyingGlass}
              style={{ color: "#94a3b8", fontSize: "13px" }}
            />

            <input
              type="search"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search sub-admins"
              style={{
                width: "100%",
                minWidth: 0,
                height: "42px",
                border: "none",
                outline: "none",
                backgroundColor: "transparent",
                color: "#334155",
                fontSize: "13px",
              }}
            />
          </div>

          <button
            type="button"
            onClick={fetchAdmins}
            disabled={loading}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              padding: "11px 15px",
              border: "1px solid #dce3ed",
              borderRadius: "8px",
              backgroundColor: "#ffffff",
              color: "#475569",
              fontSize: "12px",
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.65 : 1,
            }}
          >
            <FontAwesomeIcon icon={faRotate} />
            Refresh
          </button>
        </div>

        <div style={{ width: "100%", overflowX: "auto" }}>
          <DataTable
            columns={columns}
            data={filteredAdmins}
            keyField="_id"
            customStyles={customStyles}
            responsive={false}
            pagination
            paginationPerPage={10}
            paginationRowsPerPageOptions={[5, 10, 25, 50]}
            paginationComponentOptions={{
              rowsPerPageText: "Rows per page:",
              rangeSeparatorText: "of",
              selectAllRowsItem: false,
            }}
            highlightOnHover
            persistTableHead
            progressPending={loading}
            progressComponent={
              <div style={{ padding: "45px 20px", textAlign: "center" }}>
                <div
                  className="spinner-border text-primary"
                  role="status"
                />
                <p
                  style={{
                    marginTop: "14px",
                    marginBottom: 0,
                    color: "#64748b",
                    fontSize: "13px",
                  }}
                >
                  Loading sub-admins...
                </p>
              </div>
            }
            noDataComponent={
              <div
                style={{
                  padding: "45px 20px",
                  textAlign: "center",
                  color: "#64748b",
                  fontSize: "13px",
                }}
              >
                {search.trim()
                  ? "No matching sub-admins found."
                  : "No sub-admins found."}
              </div>
            }
          />
        </div>
      </div>

      <p
        style={{
          marginTop: "18px",
          marginBottom: 0,
          textAlign: "right",
          color: "#94a3b8",
          fontSize: "11px",
        }}
      >
        Sub Admin Management
      </p>
    </div>
  );
}

export default ViewSubAdmin;