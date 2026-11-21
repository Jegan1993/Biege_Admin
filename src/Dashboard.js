import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { makeApiRequest } from "./AxiosServices/apiCall";

const dashboardCards = [
  {
    module: "PRODUCT",
    title: "Total Products",
    description: "Manage your products",
    icon: "fa-box",
    color: "#5269cb",
    background: "#e9edff",
    statKey: "totalProducts",
    route: "/view-product",
  },
  {
    module: "CATEGORY",
    title: "Categories",
    description: "Manage product categories",
    icon: "fa-tags",
    color: "#23965e",
    background: "#e4f7ed",
    statKey: "totalCategories",
    route: "/view-categories",
  },
  {
    module: "COLLECTION",
    title: "Collections",
    description: "Manage product collections",
    icon: "fa-layer-group",
    color: "#218cac",
    background: "#e1f4fb",
    statKey: "totalCollections",
    route: "/collections",
  },
  {
    module: "INVENTORY",
    title: "Total Inventory",
    description: "Monitor available stock",
    icon: "fa-warehouse",
    color: "#d49322",
    background: "#fff3dc",
    statKey: "totalInventory",
    route: "/inventory",
  },
  {
    module: "INVENTORY",
    title: "Low Stock Items",
    description: "Products requiring restocking",
    icon: "fa-exclamation-triangle",
    color: "#d74c4c",
    background: "#fde9e9",
    statKey: "lowStockItems",
    route: "/inventory",
  },
  {
    module: "INVENTORY",
    title: "Out of Stock",
    description: "Products with no available stock",
    icon: "fa-ban",
    color: "#73788b",
    background: "#eeeeF3",
    statKey: "outOfStockItems",
    route: "/inventory",
  },
  {
    module: "WAREHOUSE",
    title: "Warehouses",
    description: "Manage warehouse locations",
    icon: "fa-building",
    color: "#7953c7",
    background: "#f0e9ff",
    statKey: "totalWarehouses",
    route: "/warehouse",
  },
  {
    module: "SUB_ADMIN",
    title: "Sub Admins",
    description: "Manage admin accounts",
    icon: "fa-users",
    color: "#3d4654",
    background: "#e8ebef",
    statKey: "totalSubAdmins",
    route: "/view-subadmin",
  },
];

const getResponseBody = (response) => {
  return response?.data?.status !== undefined ? response.data : response;
};

function Dashboard() {
  const navigate = useNavigate();

  const [role, setRole] = useState("");
  const [permissions, setPermissions] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await makeApiRequest({
          url: "dashboard",
          method: "GET",
        });

        const result = getResponseBody(response);

        if (result?.status !== true) {
          throw new Error(result?.message || "Unable to load dashboard.");
        }

        if (cancelled) return;

        setRole(result.data?.role || "");

        setPermissions(
          Array.isArray(result.data?.permissions) ? result.data.permissions : []
        );

        setStats(result.data?.stats || {});
      } catch (error) {
        if (!cancelled) {
          console.error("Dashboard Error:", error);

          setError(
            error.response?.data?.message ||
              error.message ||
              "Unable to load dashboard."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchDashboard();

    return () => {
      cancelled = true;
    };
  }, []);

  const hasModuleAccess = (module) => {
    if (role === "SUPER_ADMIN") {
      return true;
    }

    return permissions.some((permission) => {
      if (typeof permission === "string") {
        return permission === module;
      }

      return (
        permission?.module === module &&
        (permission?.view === true || permission?.edit === true)
      );
    });
  };

  const visibleCards = dashboardCards.filter(
    (card) => hasModuleAccess(card.module) && stats[card.statKey] !== undefined
  );

  // ================= LOADING =================

  if (loading) {
    return (
      <div className="px-5 py-24 text-center">
        <div
          className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-[#e3c8cc] border-t-[#e98d9d]"
          role="status"
        >
          <span className="sr-only">Loading...</span>
        </div>
        <p className="mt-3 text-sm text-[#8791a5]">Loading dashboard...</p>
      </div>
    );
  }

  // ================= ERROR =================

  if (error) {
    return (
      <div className="px-4 py-6">
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>

        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-md bg-[#e98d9d] px-[18px] py-2.5 text-[13px] font-semibold text-white transition hover:bg-[#d97589]"
        >
          Try Again
        </button>
      </div>
    );
  }

  // ================= PAGE =================

  return (
    <div className="min-h-screen bg-[#f5f5f5] p-4 sm:p-7">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="mb-1.5 text-[28px] font-bold text-[#000]">
            Dashboard
          </h3>
          <p className="text-sm text-[#000]">
            Welcome back! Here's your business overview.
          </p>
        </div>

        <div className="rounded-lg bg-[#6f533b] px-4 py-2.5 text-[13px] font-semibold text-[#fff]">
          <i className="fa fa-user-shield mr-2"></i>
          {role === "SUPER_ADMIN" ? "Super Admin" : "Admin"}
        </div>
      </div>

      {/* Welcome Banner */}
      <div className="mb-8 flex items-center justify-between rounded-[15px] bg-[#6f533b] px-[35px] py-[30px] text-white shadow-[0_4px_20px_rgba(0,0,0,0.1)]">
        <div>
          <span className="text-[11px] font-bold tracking-[2px] opacity-75">
            BEIGE ADMIN PANEL
          </span>

          <h4 className="mt-2.5 text-2xl font-bold">Business Overview</h4>

          <p className="text-sm text-white/80">
            Monitor your business activities and manage your modules from one
            place.
          </p>
        </div>

        <div className="hidden pr-5 text-[60px] opacity-30 sm:block">
          <i className="fa fa-chart-line"></i>
        </div>
      </div>

      {/* Section Heading */}
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h5 className="mb-1 text-xl font-bold text-black">Overview</h5>
          <p className="text-sm text-[#8791a5]">Quick summary of your business</p>
        </div>

        <span className="text-sm text-[#8791a5]">
          {visibleCards.length} available sections
        </span>
      </div>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {visibleCards.map((card) => (
          <div
            key={card.statKey}
            onClick={() => navigate(card.route)}
            className="h-full cursor-pointer rounded-[13px] border border-[#edf0f5] bg-white p-[23px] shadow-[0_3px_12px_rgba(30,40,70,0.035)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_9px_24px_rgba(30,40,70,0.09)]"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="mb-3 text-sm text-[#7e899b]">{card.title}</p>

                <h2 className="mb-[7px] text-[30px] font-bold text-[#26334a]">
                  {Number(stats[card.statKey]).toLocaleString("en-IN")}
                </h2>

                <span className="text-xs text-[#9aa2b1]">{card.description}</span>
              </div>

              <div
                className="flex h-[52px] w-[52px] min-w-[52px] items-center justify-center rounded-xl text-[21px]"
                style={{ background: card.background, color: card.color }}
              >
                <i className={`fa ${card.icon}`}></i>
              </div>
            </div>

            <div className="mt-[22px] flex justify-between border-t border-[#f0f1f5] pt-[15px] text-[13px] font-semibold">
              <span className="text-black">View Details</span>
              <i className="fa fa-arrow-right"></i>
            </div>
          </div>
        ))}
      </div>

      {/* No Permissions */}
      {visibleCards.length === 0 && (
        <div className="mt-5 rounded-[13px] bg-white px-5 py-[55px] text-center">
          <i className="fa fa-lock fa-3x mb-3 text-gray-500"></i>

          <h5 className="text-xl font-bold text-black">No Dashboard Access</h5>

          <p className="text-sm text-[#8791a5]">
            No dashboard modules have been assigned to your account. Please
            contact your Super Admin.
          </p>
        </div>
      )}

    </div>
  );
}

export default Dashboard;