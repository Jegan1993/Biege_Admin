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

/* Theme colours (used by the DataTable customStyles, which can't take classes) */
const theme = {
  headBg: "#e8cdd1",
  headText: "#8c2f3f",
  navy: "#1f2a4a",
  muted: "#7f8ba5",
  border: "#e9ebf3",
};

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
          <span className="font-semibold text-[#7f8ba5]">{index + 1}</span>
        ),
      },
      {
        name: "SUB ADMIN",
        selector: (row) => row.name || "",
        sortable: true,
        minWidth: "190px",
        cell: (row) => (
          <div className="flex items-center gap-3 py-2">
            <div className="flex h-[38px] w-[38px] min-w-[38px] items-center justify-center rounded-full bg-[#e8cdd1] text-sm font-bold text-[#8c2f3f]">
              {(row.name || "S").trim().charAt(0).toUpperCase()}
            </div>

            <span className="break-words font-bold text-[#1f2a4a]">
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
          <span className="break-words text-[#1f2a4a]">
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
              className={`inline-flex items-center gap-[7px] whitespace-nowrap rounded-full px-3 py-1.5 text-[11px] font-bold tracking-wide ${
                isActive
                  ? "bg-[#e1f6ea] text-[#1f9d62]"
                  : "bg-[#fdeaea] text-[#d64550]"
              }`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-current" />
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
          <div className="flex w-full flex-row items-center justify-start gap-2.5 whitespace-nowrap">
            <button
              type="button"
              title="Edit Sub Admin"
              aria-label={`Edit ${row.name || "sub-admin"}`}
              onClick={() => handleEdit(row)}
              className="inline-flex h-[38px] w-[38px] min-w-[38px] shrink-0 cursor-pointer items-center justify-center rounded-[10px] border border-[#6f533b] bg-[#fbeef0] p-0 text-[#d9748a] transition hover:bg-[#6f533b] hover:text-white"
            >
              <FontAwesomeIcon icon={faPenToSquare} />
            </button>

            <button
              type="button"
              title="Delete Sub Admin"
              aria-label={`Delete ${row.name || "sub-admin"}`}
              disabled={deletingId === row._id}
              onClick={() => handleDelete(row._id)}
              className="inline-flex h-[38px] w-[38px] min-w-[38px] shrink-0 cursor-pointer items-center justify-center rounded-[10px] border border-[#fdeaea] bg-[#fdeaea] p-0 text-[#d64550] transition hover:bg-[#d64550] hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [deletingId]
  );

  // DATATABLE CUSTOM STYLES (react-data-table-component needs an object)
  const customStyles = useMemo(
    () => ({
      tableWrapper: { style: { width: "100%", overflowX: "auto" } },
      table: { style: { width: "100%", minWidth: "800px" } },
      headRow: {
        style: {
          minHeight: "52px",
          backgroundColor: theme.headBg,
          borderBottom: "none",
        },
      },
      headCells: {
        style: {
          paddingLeft: "20px",
          paddingRight: "20px",
          color: theme.headText,
          fontSize: "12px",
          fontWeight: 700,
          letterSpacing: "0.05em",
          textTransform: "uppercase",
          whiteSpace: "nowrap",
        },
      },
      rows: {
        style: {
          minHeight: "70px",
          backgroundColor: "#ffffff",
          borderBottom: `1px solid ${theme.border}`,
          fontSize: "13px",
          color: theme.navy,
        },
        highlightOnHoverStyle: {
          backgroundColor: "#fdf6f7",
          transitionDuration: "0.15s",
          outline: "none",
        },
      },
      cells: {
        style: { paddingLeft: "20px", paddingRight: "20px", overflow: "visible" },
      },
      pagination: {
        style: {
          minHeight: "60px",
          borderTop: `1px solid ${theme.border}`,
          color: theme.muted,
          fontSize: "12px",
        },
      },
      progress: { style: { minHeight: "180px" } },
      noData: {
        style: { minHeight: "150px", color: theme.muted, fontSize: "14px" },
      },
    }),
    []
  );

  return (
    <div className="min-h-full w-full bg-[#f5f6fb] p-7">
      {/* PAGE HEADER */}
      <div className="mb-[26px] flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="mb-1.5 text-[28px] font-bold text-[#6f533b]">
            Sub Admins
          </h2>
          <p className="text-sm text-[#7f8ba5]">
            Manage sub-admin accounts and their access.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/add-subadmin")}
          className="inline-flex cursor-pointer items-center justify-center gap-[9px] rounded-[10px] bg-[#6f533b] px-5 py-3 text-[13px] font-semibold text-white shadow-[0_6px_14px_rgba(233,138,155,0.35)] transition hover:bg-[#d9748a]"
        >
          <FontAwesomeIcon icon={faPlus} />
          Add Sub Admin
        </button>
      </div>

      {/* CARD */}
      <div className="w-full overflow-hidden rounded-2xl border border-[#e9ebf3] bg-white shadow-[0_4px_18px_rgba(31,42,74,0.04)]">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e9ebf3] px-6 py-[22px]">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#fbeef0] text-lg text-[#6f533b]">
              <FontAwesomeIcon icon={faUsers} />
            </div>

            <div>
              <h5 className="mb-1 text-[17px] font-bold text-[#1f2a4a]">
                All Sub Admins
              </h5>
              <p className="text-xs text-[#7f8ba5]">
                View and manage registered accounts
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-[10px] bg-[#e9ebff] px-3.5 py-2 text-xs font-semibold text-[#6b73d6]">
            Total Sub Admins
            <strong className="ml-1 text-[15px]">{admins.length}</strong>
          </div>
        </div>

        {/* SEARCH + REFRESH */}
        <div className="flex flex-wrap items-center justify-between gap-3.5 px-6 py-5">
          <div className="flex w-full max-w-[380px] items-center gap-2.5 rounded-[10px] border border-[#e9ebf3] bg-[#f5f6fb] px-3.5 focus-within:border-[#6f533b] focus-within:ring-4 focus-within:ring-[#6f533b]/20">
            <FontAwesomeIcon
              icon={faMagnifyingGlass}
              className="text-[13px] text-[#6f533b]"
            />

            <input
              type="search"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search sub-admins"
              className="h-[42px] w-full min-w-0 border-none bg-transparent text-[13px] text-[#1f2a4a] outline-none"
            />
          </div>

          <button
            type="button"
            onClick={fetchAdmins}
            disabled={loading}
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-[10px] border border-[#e9ebf3] bg-white px-4 py-[11px] text-xs font-semibold text-[#8c2f3f] transition hover:bg-[#fbeef0] disabled:cursor-not-allowed disabled:opacity-65"
          >
            <FontAwesomeIcon icon={faRotate} />
            Refresh
          </button>
        </div>

        <div className="w-full overflow-x-auto">
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
              <div className="px-5 py-[45px] text-center">
                <div
                  className="spinner-border text-[#6f533b]"
                  role="status"
                />
                <p className="mb-0 mt-3.5 text-[13px] text-[#7f8ba5]">
                  Loading sub-admins...
                </p>
              </div>
            }
            noDataComponent={
              <div className="px-5 py-[45px] text-center text-[13px] text-[#7f8ba5]">
                {search.trim()
                  ? "No matching sub-admins found."
                  : "No sub-admins found."}
              </div>
            }
          />
        </div>
      </div>

      <p className="mb-0 mt-[18px] text-right text-[11px] text-[#7f8ba5]">
        Sub Admin Management
      </p>
    </div>
  );
}

export default ViewSubAdmin;