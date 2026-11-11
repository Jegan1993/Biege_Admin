
import React from "react";
import {
  Link,
  useLocation,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { GrClose } from "react-icons/gr";
import { IoMdLogOut } from "react-icons/io";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUsers } from "@fortawesome/free-solid-svg-icons";

import "../Assets/css/Dashboard.css";

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
import ProductAiTags from "../Biege/Product/ProductAiTags";

function SideBar() {
  const location = useLocation();
  const pathname = location.pathname;

  // Logout
  const logOut = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  // Product listing pages
  const isProductPage =
    pathname === "/view-product" ||
    pathname === "/create-product" ||
    pathname === "/product-basics" ||
    pathname === "/add-product-basic" ||
    pathname.startsWith("/edit-product-basic/") ||
    pathname.startsWith("/add-product/") ||
    pathname.startsWith("/edit-product/");

  // Subadmin pages
  const isSubAdminPage =
    pathname === "/permissionmodule" ||
    pathname === "/view-subadmin" ||
    pathname === "/add-subadmin" ||
    pathname.startsWith("/edit-subadmin/");

  // Existing product tab pages
  const isEditProduct = pathname.startsWith("/edit-product/");
  const isAddProduct = pathname.startsWith("/add-product/");

  // Get product ID from URL
  const pathParts = pathname.split("/");
  const productId = isEditProduct ? pathParts[2] : null;

  // Get current tab
  const currentTab = isEditProduct
    ? pathParts[3] || "basic"
    : pathParts[2] || "basic";

  // Product tabs
  const tabs = [
    { id: "basic", label: "Basics" },
    { id: "pricing", label: "Pricing" },
    { id: "media", label: "Media" },
    { id: "variants", label: "Variants" },
    { id: "ingredients", label: "Ingredients" },
    { id: "ai-tags", label: "AI Tags" },
  ];

  // Product tab navigation
  const getTabUrl = (tab) => {
    return isEditProduct
      ? `/edit-product/${productId}/${tab}`
      : `/add-product/${tab}`;
  };

  return (
    <div className="App dashboard-navhide-section">
      <div className="container-fluid">
        <div className="row">

          {/* Sidebar */}
          <div>
            <span id="mobile-three-line-collapse">&#9776;</span>

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

                    {/* SubAdmin */}
                    <li className="nav-item">
                      <Link
                        className={`nav-link component-tabs ${isSubAdminPage ? "active" : ""
                          }`}
                        to="/view-subadmin"
                      >
                        <FontAwesomeIcon icon={faUsers} />
                        {" "}SubAdmin Details
                      </Link>
                    </li>

                    {/* Product */}
                    <li className="nav-item">
                      <Link
                        className={`nav-link component-tabs ${isProductPage ? "active" : ""
                          }`}
                        to="/view-product"
                      >
                        <FontAwesomeIcon icon={faUsers} />
                        {" "}Product Details
                      </Link>
                    </li>

                    {/* Logout */}
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

          {/* Main Content */}
          <main className="col-md-12 ms-sm-auto col-lg-10 px-md-4">

            <Routes>

              {/* ================= SUBADMIN ROUTES ================= */}

              <Route
                path="/add-subadmin"
                element={<AddSubadmin />}
              />

              <Route
                path="/view-subadmin"
                element={<ViewSubAdmin />}
              />

              <Route
                path="/edit-subadmin/:id"
                element={<EditSubAdmin />}
              />


              {/* ================= PRODUCT LIST ROUTES ================= */}

              <Route
                path="/view-product"
                element={<ViewProduct />}
              />

              <Route
                path="/product-basics"
                element={<ProductBasics />}
              />


              {/* ================= PRODUCT BASIC ADD / EDIT ================= */}

              <Route
                path="/add-product-basic"
                element={<AddEditBasic />}
              />

              <Route
                path="/edit-product-basic/:id"
                element={<AddEditBasic />}
              />
              <Route
                path="/create-product"
                element={<CreateProduct />}
              />

              <Route
                path="/product-media"
                element={<ProductMedia />}
              />
              <Route
                path="/view-product-media/:id"
                element={<ViewProductMedia />}
              />
              <Route
                path="/create-product-media"
                element={<CreateProductmedia />}
              />

              <Route
                path="/edit-product-media/:id"
                element={<EditProductMedia />}
              />
              <Route path="/product-variants" element={<ProductVariants />} />
              <Route
                path="/view-product-variant/:id"
                element={<ViewProductVariant />}
              />
              <Route path="/create-product-variant" element={<CreateProductVariant />} />
              <Route path="/edit-product-variant/:id" element={<EditProductVariant />} />
              <Route
                path="/product-ingredients"
                element={<ProductIngredients />}
              />

              <Route
                path="/create-product-ingredients"
                element={<CreateProductIngredients />}
              />

              <Route
                path="/edit-product-ingredients/:id"
                element={<EditProductIngredients />}
              />

              <Route
                path="/view-product-ingredients/:id"
                element={<ViewProductIngredients />}
              />
              {/* ================= EXISTING PRODUCT ADD ================= */}

              <Route
                path="/add-product/:tab"
                element={
                  <div className="container-fluid py-4">

                    <h4 className="fw-bold mb-3">
                      Add Product
                    </h4>

                    <div className="card border-0 shadow-sm mb-4">
                      <div className="card-body">
                        <div className="d-flex flex-wrap gap-2">

                          {tabs.map((tab) => (
                            <Link
                              key={tab.id}
                              to={getTabUrl(tab.id)}
                              className={`btn ${currentTab === tab.id
                                ? "btn-primary"
                                : "btn-outline-secondary"
                                }`}
                            >
                              {tab.label}
                            </Link>
                          ))}

                        </div>
                      </div>
                    </div>

                    <div className="card border-0 shadow-sm">
                      <div className="card-body p-4">

                        {currentTab === "basic" && (
                          <ProductBasics />
                        )}

                        {currentTab === "pricing" && (
                          <ProductPricing />
                        )}

                        {currentTab === "media" && (
                          <ProductMedia />
                        )}

                        {currentTab === "variants" && (
                          <ProductVariants />
                        )}

                        {currentTab === "ingredients" && (
                          <ProductIngredients />
                        )}

                        {currentTab === "ai-tags" && (
                          <div>
                            <ProductAiTags />
                          </div>
                        )}

                      </div>
                    </div>

                  </div>
                }
              />


              {/* ================= EXISTING PRODUCT EDIT ================= */}

              {/* Redirect to Basic tab */}
              <Route
                path="/edit-product/:id"
                element={
                  <Navigate to="basic" replace />
                }
              />

              <Route
                path="/edit-product/:id/:tab"
                element={
                  <div className="container-fluid py-4">

                    <h4 className="fw-bold mb-3">
                      Edit Product
                    </h4>

                    <div className="card border-0 shadow-sm mb-4">
                      <div className="card-body">
                        <div className="d-flex flex-wrap gap-2">

                          {tabs.map((tab) => (
                            <Link
                              key={tab.id}
                              to={getTabUrl(tab.id)}
                              className={`btn ${currentTab === tab.id
                                ? "btn-primary"
                                : "btn-outline-secondary"
                                }`}
                            >
                              {tab.label}
                            </Link>
                          ))}

                        </div>
                      </div>
                    </div>

                    <div className="card border-0 shadow-sm">
                      <div className="card-body p-4">

                        {currentTab === "basic" && (
                          <EditProduct />
                        )}

                        {currentTab === "pricing" && (
                          <ProductPricing />
                        )}

                        {currentTab === "media" && (
                          <ProductMedia />
                        )}

                        {currentTab === "variants" && (
                          <ProductVariants />
                        )}

                        {currentTab === "ingredients" && (
                          <ProductIngredients />
                        )}

                        {currentTab === "ai-tags" && (
                          <div>
                            AI Tags component needs to be added.
                          </div>
                        )}

                      </div>
                    </div>

                  </div>
                }
              />

            </Routes>

          </main>
        </div>
      </div>
    </div>
  );
}

export default SideBar;
