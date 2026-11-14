
import React from "react";
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

// Common Product Layout
import ProductPageLayout from "../Biege/Product/ProductPageLayout";

// ==================================================
// ADD PRODUCT STEP COMPONENT
// ==================================================

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

// ==================================================
// EDIT PRODUCT STEP COMPONENT
// ==================================================

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
      content = <ProductAiTags />;
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

// ==================================================
// SIDEBAR COMPONENT
// ==================================================

function SideBar() {
  const location = useLocation();
  const pathname = location.pathname;

  // Logout
  const logOut = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  // Product pages
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

  // Subadmin pages
  const isSubAdminPage =
    pathname === "/permissionmodule" ||
    pathname === "/view-subadmin" ||
    pathname === "/add-subadmin" ||
    pathname.startsWith("/edit-subadmin/");

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

                    {/* SUBADMIN */}
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

                    {/* PRODUCT */}
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

                    {/* LOGOUT */}
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

              {/* ==========================================
                  SUBADMIN ROUTES
              ========================================== */}

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


              {/* ==========================================
                  PRODUCT LIST ROUTES
              ========================================== */}

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


              {/* ==========================================
                  BASIC PRODUCT CRUD
              ========================================== */}

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


              {/* ==========================================
                  ADD PRODUCT WIZARD
              ========================================== */}

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


              {/* ==========================================
                  EDIT PRODUCT WIZARD
              ========================================== */}

              <Route
                path="/edit-product/:id"
                element={<Navigate to="product" replace />}
              />

              <Route
                path="/edit-product/:id/:tab"
                element={<EditProductStep />}
              />


              {/* ==========================================
                  MEDIA MODULE ROUTES
              ========================================== */}

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


              {/* ==========================================
                  VARIANTS MODULE ROUTES
              ========================================== */}

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


              {/* ==========================================
                  INGREDIENTS MODULE ROUTES
              ========================================== */}

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

            </Routes>

          </main>
        </div>
      </div>
    </div>
  );
}

export default SideBar;
