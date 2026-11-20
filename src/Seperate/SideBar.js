
import React, { useEffect, useState } from "react";
import {
  Link,
  useLocation,
  useParams,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { GrClose } from "react-icons/gr";
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
  // SIDEBAR UI
  // ====================================================

  return (
    <div className="App dashboard-navhide-section">
      <div className="container-fluid">
        <div className="row">

          {/* ================= SIDEBAR ================= */}

          <div>
            <span id="mobile-three-line-collapse">
              &#9776;
            </span>

            <div
              className="dashboard-sidenav-section"
              id="mySidenav"
            >
              <nav
                id="sidebar"
                className="col-md-12 col-lg-12 d-md-block sidebar component-navbar"
              >
                <div className="d-flex flex-row">
                  <div className="ms-auto me-3">
                    <span id="mobile-close-collapse">
                      <GrClose />
                    </span>
                  </div>
                </div>

                <div className="position-sticky">
                  <ul className="nav flex-column nav-pills">


                    {/* ================= DASHBOARD ================= */}

                    <li className="nav-item">
                      <Link
                        className={`nav-link component-tabs ${pathname === "/dashboard" ? "active" : ""
                          }`}
                        to="/dashboard"
                      >
                        <i className="fa fa-dashboard me-2"></i>
                        Dashboard
                      </Link>
                    </li>

                    {/* ================= PRODUCT ================= */}

                    {!loadingPermissions &&
                      hasModuleAccess("PRODUCT") && (
                        <li className="nav-item">
                          <Link
                            className={`nav-link component-tabs ${isProductPage ? "active" : ""
                              }`}
                            to="/view-product"
                          >
                            Product Details
                          </Link>
                        </li>
                      )}


                    {/* ================= CATEGORY ================= */}

                    {!loadingPermissions &&
                      hasModuleAccess("CATEGORY") && (
                        <li className="nav-item">
                          <Link
                            className={`nav-link component-tabs ${isCategoryPage ? "active" : ""
                              }`}
                            to="/view-categories"
                          >
                            Categories Details
                          </Link>
                        </li>
                      )}


                    {/* ================= COLLECTION ================= */}

                    {!loadingPermissions &&
                      hasModuleAccess("COLLECTION") && (
                        <li className="nav-item">
                          <Link
                            className={`nav-link component-tabs ${isCollection ? "active" : ""
                              }`}
                            to="/collections"
                          >
                            Collections
                          </Link>
                        </li>
                      )}


                    {/* ================= INVENTORY ================= */}

                    {!loadingPermissions &&
                      hasModuleAccess("INVENTORY") && (
                        <li className="nav-item">
                          <Link
                            className={`nav-link component-tabs ${isInventory ? "active" : ""
                              }`}
                            to="/inventory"
                          >
                            Inventory
                          </Link>
                        </li>
                      )}


                    {/* ================= WAREHOUSE ================= */}

                    {!loadingPermissions &&
                      hasModuleAccess("WAREHOUSE") && (
                        <li className="nav-item">
                          <Link
                            className={`nav-link component-tabs ${isWarehouse ? "active" : ""
                              }`}
                            to="/warehouse"
                          >
                            Warehouse
                          </Link>
                        </li>
                      )}


                    {/* ================= SUB ADMIN ================= */}

                    {!loadingPermissions &&
                      hasModuleAccess("SUB_ADMIN") && (
                        <li className="nav-item">
                          <Link
                            className={`nav-link component-tabs ${isSubAdminPage ? "active" : ""
                              }`}
                            to="/view-subadmin"
                          >
                            SubAdmin Details
                          </Link>
                        </li>
                      )}


                    {/* ================= LOGOUT ================= */}

                    <li className="nav-item">
                      <button
                        type="button"
                        className="nav-link component-tabs border-0 bg-transparent w-100 text-start"
                        onClick={logOut}
                      >
                        <IoMdLogOut className="sidenav-icon-size-css" />
                        {" "}Log Out
                      </button>
                    </li>

                  </ul>
                </div>
              </nav>
            </div>
          </div>


          {/* ================= MAIN CONTENT ================= */}

          <main className="col-md-12 ms-sm-auto col-lg-10 px-md-4">

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
      </div>
    </div>
  );
}

export default SideBar;
