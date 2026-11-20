
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
  return response?.data?.status !== undefined
    ? response.data
    : response;
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
          throw new Error(
            result?.message || "Unable to load dashboard."
          );
        }

        if (cancelled) return;

        setRole(result.data?.role || "");

        setPermissions(
          Array.isArray(result.data?.permissions)
            ? result.data.permissions
            : []
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
    (card) =>
      hasModuleAccess(card.module) &&
      stats[card.statKey] !== undefined
  );

  const styles = {
    page: {
      minHeight: "100vh",
      background: "#f6f7fb",
      padding: "28px",
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      flexWrap: "wrap",
      gap: "15px",
      marginBottom: "25px",
    },
    heading: {
      color: "#202b43",
      fontWeight: "700",
      marginBottom: "6px",
    },
    subtitle: {
      color: "#8791a5",
      fontSize: "14px",
      marginBottom: 0,
    },
    role: {
      background: "#e9edff",
      color: "#4258ad",
      borderRadius: "8px",
      padding: "10px 16px",
      fontWeight: "600",
      fontSize: "13px",
    },
    banner: {
      background: "linear-gradient(110deg, #253c86, #596ed0)",
      borderRadius: "15px",
      padding: "30px 35px",
      color: "#ffffff",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: "32px",
      boxShadow: "0 7px 20px rgba(49, 68, 143, 0.13)",
    },
    bannerLabel: {
      fontSize: "11px",
      letterSpacing: "2px",
      opacity: 0.75,
      fontWeight: "700",
    },
    bannerTitle: {
      fontWeight: "700",
      marginTop: "10px",
    },
    bannerText: {
      color: "#e1e6ff",
      fontSize: "14px",
      marginBottom: 0,
    },
    bannerIcon: {
      fontSize: "60px",
      opacity: 0.3,
      paddingRight: "20px",
    },
    sectionHeading: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "20px",
    },
    card: {
      background: "#ffffff",
      border: "1px solid #edf0f5",
      borderRadius: "13px",
      padding: "23px",
      cursor: "pointer",
      boxShadow: "0 3px 12px rgba(30, 40, 70, 0.035)",
      height: "100%",
      transition: "transform 0.2s ease, box-shadow 0.2s ease",
    },
    cardTitle: {
      color: "#7e899b",
      fontSize: "14px",
      marginBottom: "12px",
    },
    cardValue: {
      color: "#26334a",
      fontSize: "30px",
      fontWeight: "700",
      marginBottom: "7px",
    },
    cardDescription: {
      color: "#9aa2b1",
      fontSize: "12px",
    },
    cardFooter: {
      borderTop: "1px solid #f0f1f5",
      marginTop: "22px",
      paddingTop: "15px",
      display: "flex",
      justifyContent: "space-between",
      color: "#5269cb",
      fontSize: "13px",
      fontWeight: "600",
    },
    empty: {
      background: "#ffffff",
      borderRadius: "13px",
      padding: "55px 20px",
      textAlign: "center",
      marginTop: "20px",
    },
  };

  if (loading) {
    return (
      <div
        className="container-fluid text-center"
        style={{ padding: "100px 20px" }}
      >
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="text-muted mt-3">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-fluid py-4">
        <div className="alert alert-danger">{error}</div>
        <button
          className="btn btn-primary"
          onClick={() => window.location.reload()}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="container-fluid" style={styles.page}>

      {/* Header */}
      <div style={styles.header}>
        <div>
          <h3 style={styles.heading}>Dashboard</h3>
          <p style={styles.subtitle}>
            Welcome back! Here's your business overview.
          </p>
        </div>

        <div style={styles.role}>
          <i className="fa fa-user-shield me-2"></i>
          {role === "SUPER_ADMIN" ? "Super Admin" : "Admin"}
        </div>
      </div>

      {/* Welcome Banner */}
      <div style={styles.banner}>
        <div>
          <span style={styles.bannerLabel}>BEIGE ADMIN PANEL</span>

          <h4 style={styles.bannerTitle}>
            Business Overview
          </h4>

          <p style={styles.bannerText}>
            Monitor your business activities and manage your modules
            from one place.
          </p>
        </div>

        <div style={styles.bannerIcon}>
          <i className="fa fa-chart-line"></i>
        </div>
      </div>

      {/* Section Heading */}
      <div style={styles.sectionHeading}>
        <div>
          <h5 className="fw-bold mb-1">Overview</h5>
          <p className="text-muted small mb-0">
            Quick summary of your business
          </p>
        </div>

        <span className="text-muted small">
          {visibleCards.length} available sections
        </span>
      </div>

      {/* Dashboard Cards */}
      <div className="row g-4">
        {visibleCards.map((card) => (
          <div
            className="col-12 col-sm-6 col-xl-4"
            key={card.statKey}
          >
            <div
              style={styles.card}
              onClick={() => navigate(card.route)}
              onMouseEnter={(event) => {
                event.currentTarget.style.transform = "translateY(-5px)";
                event.currentTarget.style.boxShadow =
                  "0 9px 24px rgba(30, 40, 70, 0.09)";
              }}
              onMouseLeave={(event) => {
                event.currentTarget.style.transform = "translateY(0)";
                event.currentTarget.style.boxShadow =
                  "0 3px 12px rgba(30, 40, 70, 0.035)";
              }}
            >
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <p style={styles.cardTitle}>{card.title}</p>

                  <h2 style={styles.cardValue}>
                    {Number(stats[card.statKey]).toLocaleString("en-IN")}
                  </h2>

                  <span style={styles.cardDescription}>
                    {card.description}
                  </span>
                </div>

                <div
                  style={{
                    width: "52px",
                    height: "52px",
                    minWidth: "52px",
                    borderRadius: "12px",
                    background: card.background,
                    color: card.color,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    fontSize: "21px",
                  }}
                >
                  <i className={`fa ${card.icon}`}></i>
                </div>
              </div>

              <div style={styles.cardFooter}>
                <span>View Details</span>
                <i className="fa fa-arrow-right"></i>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* No Permissions */}
      {visibleCards.length === 0 && (
        <div style={styles.empty}>
          <i
            className="fa fa-lock fa-3x text-secondary mb-3"
          ></i>

          <h5 className="fw-bold">No Dashboard Access</h5>

          <p className="text-muted mb-0">
            No dashboard modules have been assigned to your account.
            Please contact your Super Admin.
          </p>
        </div>
      )}

    </div>
  );
}

export default Dashboard;
