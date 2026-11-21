import React, { useEffect, useState } from "react";
import {
  Link,
  useLocation,
  useParams,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { GrClose, GrMenu } from "react-icons/gr";
import { IoMdLogOut } from "react-icons/io";

import "../Assets/css/Dashboard.css";

// API
import { makeApiRequest } from "../AxiosServices/apiCall";

// Permission Components
import AddSubadmin from "../Biege/ModulePermission/AddSubadmin";
import ViewSubAdmin from "../Biege/ModulePermission/ViewSubAdmin";
import EditSubAdmin from "../Biege/ModulePermission/EditSubAdmin";

// Product Components
import ViewProduct from "../Biege/Product/ViewProduct";
import ProductBasics from "../Biege/Product/ProductBasics";
import AddEditBasic from "../Biege/Product/AddEditBasic";

import CreateProduct from "../Biege/Product/CreateProduct";
import EditProduct from "../Biege/Product/EditProduct";
import ProductPricing from "../Biege/Product/ProductPricing";
import ProductMedia from "../Biege/Product/ProductMedia";
import ProductVariants from "../Biege/Product/ProductVariants";
import ProductIngredients from "../Biege/Product/ProductIngredients";

import CreateProductmedia from "../Biege/Product/CreateProductmedia";
import EditProductMedia from "../Biege/Product/EditProductMedia";
import ViewProductMedia from "../Biege/Product/ViewProductMedia";

import CreateProductVariant from "../Biege/Product/CreateProductVariant";
import EditProductVariant from "../Biege/Product/EditProductVariant";
import ViewProductVariant from "../Biege/Product/ViewProductVariant";

import CreateProductIngredients from "../Biege/Product/CreateProductIngredients";
import EditProductIngredients from "../Biege/Product/EditProductIngredients";
import ViewProductIngredients from "../Biege/Product/ViewProductIngredients";

import ProductAiTags from "../Biege/Product/ProductAiTags/ProductAiTags";
import EditProductAiTags from "../Biege/Product/ProductAiTags/EditProductAiTags";

// Common Product Layout
import ProductPageLayout from "../Biege/Product/ProductPageLayout";

// Other Components
import ViewCategories from "../Biege/Categories/ViewCategories";
import ViewCollections from "../Biege/Categories/ViewCollections";
import ViewInventory from "../Biege/Inventory/ViewInventory";
import ViewWarehouse from "../Biege/Inventory/ViewWarehouse";
import ExpiryManagement from "../Biege/Inventory/ExpiryManagement";
import Dashboard from "../Dashboard";


// ======================================================
// ADD PRODUCT STEP
// ======================================================

function AddProductStep() {
  const { productId, tab } = useParams();

  let content;

  switch (tab) {
    case "basic":
      content = <AddEditBasic />;
      break;

    case "pricing":
      content = <ProductPricing />;
      break;

    case "media":
      content = <CreateProductmedia />;
      break;

    case "variants":
      content = <CreateProductVariant />;
      break;

    case "ingredients":
      content = <CreateProductIngredients />;
      break;

    case "ai-tags":
      content = <ProductAiTags />;
      break;

    default:
      return (
        <Navigate
          to={`/add-product/${productId}/basic`}
          replace
        />
      );
  }

  return <ProductPageLayout>{content}</ProductPageLayout>;
}


// ======================================================
// EDIT PRODUCT STEP
// ======================================================

function EditProductStep() {
  const { id, tab } = useParams();

  let content;

  switch (tab) {
    case "product":
      content = <EditProduct />;
      break;

    case "basic":
      content = <AddEditBasic />;
      break;

    case "pricing":
      content = <ProductPricing />;
      break;

    case "media":
      content = <CreateProductmedia />;
      break;

    case "variants":
      content = <CreateProductVariant />;
      break;

    case "ingredients":
      content = <CreateProductIngredients />;
      break;

    case "ai-tags":
      content = <EditProductAiTags />;
      break;

    default:
      return (
        <Navigate
          to={`/edit-product/${id}/product`}
          replace
        />
      );
  }

  return <ProductPageLayout>{content}</ProductPageLayout>;
}


// ======================================================
// SIDEBAR COMPONENT
// ======================================================

function SideBar() {
  const location = useLocation();
  const pathname = location.pathname;

  // Mobile drawer open / close
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close the drawer whenever the page changes
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // ====================================================
  // MODULE PERMISSIONS
  // ====================================================

  const [allowedModules, setAllowedModules] = useState([]);
  const [loadingPermissions, setLoadingPermissions] = useState(true);

  useEffect(() => {
    const fetchSidebarModules = async () => {
      try {
        const response = await makeApiRequest({
          url: "sidebar-modules",
          method: "GET",
        });

        // Supports both direct response and Axios response formats
        const responseBody =
          response?.data?.success !== undefined
            ? response.data
            : response;

        if (responseBody?.success) {
          setAllowedModules(responseBody.data?.modules || []);
        } else {
          setAllowedModules([]);
        }
      } catch (error) {
        console.error("Sidebar permission error:", error);
        setAllowedModules([]);
      } finally {
        setLoadingPermissions(false);
      }
    };

    fetchSidebarModules();
  }, []);

  // Check module permission
  const hasModuleAccess = (module) => {
    return allowedModules.includes(module);
  };


  // ====================================================
  // LOGOUT
  // ====================================================

  const logOut = () => {
    localStorage.clear();
    window.location.href = "/";
  };


  // ====================================================
  // PRODUCT PAGES
  // ====================================================

  const isProductPage =
    pathname === "/view-product" ||
    pathname === "/create-product" ||
    pathname === "/product-basics" ||
    pathname === "/add-product-basic" ||
    pathname.startsWith("/edit-product-basic/") ||
    pathname.startsWith("/add-product/") ||
    pathname.startsWith("/edit-product/") ||
    pathname === "/product-media" ||
    pathname.startsWith("/view-product-media/") ||
    pathname === "/create-product-media" ||
    pathname.startsWith("/edit-product-media/") ||
    pathname === "/product-variants" ||
    pathname.startsWith("/view-product-variant/") ||
    pathname === "/create-product-variant" ||
    pathname.startsWith("/edit-product-variant/") ||
    pathname === "/product-ingredients" ||
    pathname === "/create-product-ingredients" ||
    pathname.startsWith("/edit-product-ingredients/") ||
    pathname.startsWith("/view-product-ingredients/") ||
    pathname === "/product-pricing" ||
    pathname === "/product-ai-tags";


  // ====================================================
  // SUB ADMIN PAGES
  // ====================================================

  const isSubAdminPage =
    pathname === "/permissionmodule" ||
    pathname === "/view-subadmin" ||
    pathname === "/add-subadmin" ||
    pathname.startsWith("/edit-subadmin/");


  // ====================================================
  // OTHER MODULE PAGES
  // ====================================================

  const isCategoryPage = pathname === "/view-categories";

  const isCollection = pathname === "/collections";

  const isInventory =
    pathname === "/inventory" ||
    pathname === "/expiry-management";

  const isWarehouse = pathname === "/warehouse";


  // ====================================================
  // MENU ITEMS (module = null means always visible)
  // ====================================================

  const menuItems = [
    { label: "Dashboard", to: "/dashboard", module: null, active: pathname === "/dashboard" },
    { label: "Product Details", to: "/view-product", module: "PRODUCT", active: isProductPage },
    { label: "Categories Details", to: "/view-categories", module: "CATEGORY", active: isCategoryPage },
    { label: "Collections", to: "/collections", module: "COLLECTION", active: isCollection },
    { label: "Inventory", to: "/inventory", module: "INVENTORY", active: isInventory },
    { label: "Warehouse", to: "/warehouse", module: "WAREHOUSE", active: isWarehouse },
    { label: "SubAdmin Details", to: "/view-subadmin", module: "SUB_ADMIN", active: isSubAdminPage },
  ];

  const linkBase =
    "mx-2.5 flex items-center rounded-full px-4 py-[15px] text-[15px] leading-none text-black no-underline transition";


  // ====================================================
  // SIDEBAR UI (Tailwind)
  // ====================================================

  return (
    <div className="min-h-screen bg-[#f5f6fb]">

      {/* ================= MOBILE MENU BUTTON ================= */}

      <button
        type="button"
        aria-label="Open menu"
        onClick={() => setMobileOpen(true)}
        className="fixed left-3 top-3 z-40 flex h-10 w-10 items-center justify-center rounded-[10px] bg-[#6f533b] text-white shadow-[0_6px_14px_rgba(233,138,155,0.35)] lg:hidden"
      >
        <GrMenu className="[&_path]:stroke-white" />
      </button>

      {/* ================= MOBILE OVERLAY ================= */}

      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-[#1f2a4a]/45 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ================= SIDEBAR ================= */}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[200px] overflow-y-auto bg-[#f0e5d3] pb-6 transition-transform duration-200 lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo + mobile close */}
        <div className="mb-3 flex items-center justify-between px-5 pb-2 pt-4">
          <Link
            to="/dashboard"
            className="font-['Playfair_Display',serif] text-[30px] font-bold leading-none tracking-wide text-[#8c2f3f] no-underline"
          >
            Beige
          </Link>

          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#8c2f3f] hover:bg-white/40 lg:hidden"
          >
            <GrClose />
          </button>
        </div>

        <nav>
          <ul className="m-0 flex list-none flex-col gap-[7px] p-0">
            {menuItems.map((item) => {
              // Dashboard is always visible, others need module access
              if (item.module && (loadingPermissions || !hasModuleAccess(item.module))) {
                return null;
              }

              return (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className={`${linkBase} ${
                      item.active
                        ? "bg-[#6f533b] font-medium shadow-[0_4px_10px_rgba(233,138,155,0.3)] text-white"
                        : "hover:bg-white/40"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}

            {/* ================= LOGOUT ================= */}

            <li className="mt-2 border-t border-black/10 pt-2">
              <button
                type="button"
                onClick={logOut}
                className="mx-2.5 flex w-[calc(100%-20px)] cursor-pointer items-center gap-2.5 rounded-full border-0 bg-transparent px-4 py-[15px] text-left text-[15px] leading-none text-black transition hover:bg-white/40"
              >
                <IoMdLogOut className="h-5 w-5 shrink-0" />
                <span>Log Out</span>
              </button>
            </li>
          </ul>
        </nav>
      </aside>


      {/* ================= MAIN CONTENT ================= */}

      <main className="min-h-screen pt-14 lg:ml-[200px] lg:pt-0">

        <Routes>
          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          {/* ================= SUB ADMIN ROUTES ================= */}

          <Route
            path="/add-subadmin"
            element={<AddSubadmin />}
          />

          <Route
            path="/view-subadmin"
            element={<ViewSubAdmin />}
          />

          <Route
            path="/edit-subadmin/:adminId"
            element={<EditSubAdmin />}
          />


          {/* ================= PRODUCT ROUTES ================= */}

          <Route
            path="/view-product"
            element={<ViewProduct />}
          />

          <Route
            path="/product-basics"
            element={
              <ProductPageLayout activeStep={0}>
                <ProductBasics />
              </ProductPageLayout>
            }
          />

          <Route
            path="/product-pricing"
            element={
              <ProductPageLayout activeStep={2}>
                <ProductPricing />
              </ProductPageLayout>
            }
          />

          <Route
            path="/product-ai-tags"
            element={
              <ProductPageLayout activeStep={6}>
                <ProductAiTags />
              </ProductPageLayout>
            }
          />

          <Route
            path="/add-product-basic"
            element={
              <ProductPageLayout activeStep={1}>
                <AddEditBasic />
              </ProductPageLayout>
            }
          />

          <Route
            path="/edit-product-basic/:id"
            element={
              <ProductPageLayout activeStep={1}>
                <AddEditBasic />
              </ProductPageLayout>
            }
          />

          <Route
            path="/create-product"
            element={
              <ProductPageLayout activeStep={0}>
                <CreateProduct />
              </ProductPageLayout>
            }
          />

          <Route
            path="/add-product"
            element={<Navigate to="/create-product" replace />}
          />

          <Route
            path="/add-product/:productId/:tab"
            element={<AddProductStep />}
          />

          <Route
            path="/edit-product/:id"
            element={<Navigate to="product" replace />}
          />

          <Route
            path="/edit-product/:id/:tab"
            element={<EditProductStep />}
          />


          {/* ================= PRODUCT MEDIA ================= */}

          <Route
            path="/product-media"
            element={
              <ProductPageLayout activeStep={3}>
                <ProductMedia />
              </ProductPageLayout>
            }
          />

          <Route
            path="/view-product-media/:id"
            element={
              <ProductPageLayout activeStep={3}>
                <ViewProductMedia />
              </ProductPageLayout>
            }
          />

          <Route
            path="/create-product-media"
            element={
              <ProductPageLayout activeStep={3}>
                <CreateProductmedia />
              </ProductPageLayout>
            }
          />

          <Route
            path="/edit-product-media/:id"
            element={
              <ProductPageLayout activeStep={3}>
                <EditProductMedia />
              </ProductPageLayout>
            }
          />


          {/* ================= PRODUCT VARIANTS ================= */}

          <Route
            path="/product-variants"
            element={
              <ProductPageLayout activeStep={4}>
                <ProductVariants />
              </ProductPageLayout>
            }
          />

          <Route
            path="/view-product-variant/:id"
            element={
              <ProductPageLayout activeStep={4}>
                <ViewProductVariant />
              </ProductPageLayout>
            }
          />

          <Route
            path="/create-product-variant"
            element={
              <ProductPageLayout activeStep={4}>
                <CreateProductVariant />
              </ProductPageLayout>
            }
          />

          <Route
            path="/edit-product-variant/:id"
            element={
              <ProductPageLayout activeStep={4}>
                <EditProductVariant />
              </ProductPageLayout>
            }
          />


          {/* ================= PRODUCT INGREDIENTS ================= */}

          <Route
            path="/product-ingredients"
            element={
              <ProductPageLayout activeStep={5}>
                <ProductIngredients />
              </ProductPageLayout>
            }
          />

          <Route
            path="/create-product-ingredients"
            element={
              <ProductPageLayout activeStep={5}>
                <CreateProductIngredients />
              </ProductPageLayout>
            }
          />

          <Route
            path="/edit-product-ingredients/:id"
            element={
              <ProductPageLayout activeStep={5}>
                <EditProductIngredients />
              </ProductPageLayout>
            }
          />

          <Route
            path="/view-product-ingredients/:id"
            element={
              <ProductPageLayout activeStep={5}>
                <ViewProductIngredients />
              </ProductPageLayout>
            }
          />


          {/* ================= CATEGORY ================= */}

          <Route
            path="/view-categories"
            element={<ViewCategories />}
          />


          {/* ================= COLLECTION ================= */}

          <Route
            path="/collections"
            element={<ViewCollections />}
          />


          {/* ================= INVENTORY ================= */}

          <Route
            path="/inventory"
            element={<ViewInventory />}
          />

          <Route
            path="/expiry-management"
            element={<ExpiryManagement />}
          />


          {/* ================= WAREHOUSE ================= */}

          <Route
            path="/warehouse"
            element={<ViewWarehouse />}
          />

        </Routes>

      </main>
    </div>
  );
}

export default SideBar;