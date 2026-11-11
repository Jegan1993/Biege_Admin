
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { makeApiRequest } from "../../AxiosServices/apiCall";
import { toast } from "react-toastify";

// Initial form values
const getEmptyValues = () => ({
  name: "",
  email: "",
  status: "ACTIVE",
  permissions: [],
});

// Convert API module response into an array of strings
const normalizeModules = (response) => {
  const result = response?.data ?? response;
  const moduleData = result?.data ?? result;

  const items = Array.isArray(moduleData)
    ? moduleData
    : [moduleData];

  const normalizedModules = items.flatMap((item) => {
    if (typeof item === "string") {
      return [item];
    }

    if (
      item &&
      typeof item === "object" &&
      !Array.isArray(item)
    ) {
      return Object.values(item).filter(
        (value) => typeof value === "string"
      );
    }

    return [];
  });

  return [
    ...new Set(
      normalizedModules.filter(
        (module) => module.trim() !== ""
      )
    ),
  ];
};

// Validation
const validationSchema = Yup.object({
  name: Yup.string()
    .trim()
    .min(2, "Name must contain at least 2 characters.")
    .max(50, "Name cannot exceed 50 characters.")
    .required("Name is required."),

  email: Yup.string()
    .trim()
    .email("Enter a valid email address.")
    .max(100, "Email cannot exceed 100 characters.")
    .required("Email is required."),

  status: Yup.string()
    .oneOf(["ACTIVE", "INACTIVE"], "Select a valid status.")
    .required("Status is required."),

  permissions: Yup.array()
    .of(
      Yup.object({
        module: Yup.string().required("Module is required."),
        view: Yup.boolean(),
        edit: Yup.boolean(),
      })
    )
    .test(
      "at-least-one-module",
      "Please select at least one module permission.",
      (permissions) =>
        Array.isArray(permissions) &&
        permissions.some(
          (permission) =>
            permission.view || permission.edit
        )
    ),
});

// Map existing admin data into Formik values
const mapAdminToForm = (admin, modules) => {
  const existingPermissions = Array.isArray(admin.permissions)
    ? admin.permissions
    : [];

  return {
    name: admin.name || "",
    email: admin.email || "",
    status: admin.status || "ACTIVE",

    // Create one permission entry for every backend module
    permissions: modules.map((module) => {
      const savedPermission = existingPermissions.find(
        (permission) => permission.module === module
      );

      const edit = Boolean(savedPermission?.edit);

      return {
        module,
        view: Boolean(savedPermission?.view || edit),
        edit,
      };
    }),
  };
};

function EditSubAdmin() {
  const navigate = useNavigate();
  const location = useLocation();
  const { adminId } = useParams();

  const [initialValues, setInitialValues] = useState(
    getEmptyValues
  );

  const [modules, setModules] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pageError, setPageError] = useState("");

  // Fetch modules and selected sub-admin
  useEffect(() => {
    let cancelled = false;

    const loadAdmin = async () => {
      if (!adminId) {
        setPageError("Invalid sub-admin ID.");
        setInitialLoading(false);
        return;
      }

      setInitialLoading(true);
      setPageError("");

      try {
        // 1. Fetch modules
        const moduleResponse = await makeApiRequest({
          url: "/get-modules",
          method: "GET",
        });

        const moduleList = normalizeModules(moduleResponse);

        if (!moduleList.length) {
          throw new Error(
            "No valid modules received from backend."
          );
        }

        if (cancelled) return;

        setModules(moduleList);

        // 2. Get selected admin
        let admin;

        const selectedAdmin = location.state?.admin;

        if (
          selectedAdmin &&
          String(selectedAdmin._id) === String(adminId)
        ) {
          admin = selectedAdmin;
        } else {
          const response = await makeApiRequest({
            url: `/get-admin/${adminId}`,
            method: "GET",
          });

          const body = response?.data ?? response;

          admin = body?.admin ?? body?.data ?? body;

          if (
            body?.status === false ||
            !admin ||
            typeof admin !== "object" ||
            Array.isArray(admin) ||
            !admin._id
          ) {
            throw new Error(
              body?.message ||
              "Sub-admin details not found."
            );
          }
        }

        if (cancelled) return;

        // 3. Map existing permissions to dynamic modules
        setInitialValues(
          mapAdminToForm(admin, moduleList)
        );
      } catch (error) {
        if (!cancelled) {
          console.error("Load Edit Subadmin Error:", error);

          setPageError(
            error.response?.data?.message ||
            error.message ||
            "Unable to load sub-admin details."
          );
        }
      } finally {
        if (!cancelled) {
          setInitialLoading(false);
        }
      }
    };

    loadAdmin();

    return () => {
      cancelled = true;
    };
  }, [adminId, location.state]);

  // Formik
  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    validationSchema,

    onSubmit: async (values) => {
      if (!adminId) {
        setPageError("Invalid sub-admin ID.");
        return;
      }

      try {
        setSaving(true);
        setPageError("");

        // Send only selected permissions
        const payload = {
          name: values.name.trim(),
          email: values.email.trim().toLowerCase(),
          status: values.status,

          permissions: values.permissions
            .filter(
              (permission) =>
                permission.view || permission.edit
            )
            .map((permission) => ({
              module: permission.module,
              view: Boolean(
                permission.view || permission.edit
              ),
              edit: Boolean(permission.edit),
            })),
        };

        const response = await makeApiRequest({
          url: `/update-admin/${adminId}`,
          method: "PUT",
          data: payload,
        });

        const result = response?.data ?? response;

        if (result?.status === false) {
          throw new Error(
            result.message || "Unable to update sub-admin."
          );
        }

        toast.success(
          result?.message || "Sub-admin updated successfully."
        );

        navigate("/view-subadmin", {
          replace: true,
          state: {
            success:
              result?.message ||
              "Sub-admin updated successfully.",
          },
        });
      } catch (error) {
        console.error("Update Subadmin Error:", error);

        const message =
          error.response?.data?.message ||
          error.message ||
          "Unable to update sub-admin.";

        setPageError(message);
        toast.error(message);
      } finally {
        setSaving(false);
      }
    },
  });

  // Handle module permission changes - same logic as AddSubadmin
  const handlePermissionChange = (
    module,
    type,
    checked
  ) => {
    const permissions = [...formik.values.permissions];

    const existingIndex = permissions.findIndex(
      (permission) => permission.module === module
    );

    if (existingIndex === -1) {
      permissions.push({
        module,
        view:
          type === "view"
            ? checked
            : type === "edit" && checked,
        edit: type === "edit" ? checked : false,
      });
    } else {
      permissions[existingIndex] = {
        ...permissions[existingIndex],
        [type]: checked,
      };

      // Edit selected -> View automatically selected
      if (type === "edit" && checked) {
        permissions[existingIndex].view = true;
      }

      // View unselected -> Edit automatically unselected
      if (type === "view" && !checked) {
        permissions[existingIndex].edit = false;
      }
    }

    formik.setFieldValue("permissions", permissions);
    formik.setFieldTouched("permissions", true, false);
  };

  const fieldError = (field) =>
    formik.touched[field] && formik.errors[field];

  const permissionError =
    formik.submitCount > 0 &&
      typeof formik.errors.permissions === "string"
      ? formik.errors.permissions
      : "";

  // Loading screen
  if (initialLoading) {
    return (
      <div className="container-fluid py-5 text-center">
        <div
          className="spinner-border text-primary"
          role="status"
        >
          <span className="visually-hidden">
            Loading...
          </span>
        </div>

        <p className="text-secondary mt-3">
          Loading sub-admin details...
        </p>
      </div>
    );
  }

  return (
    <div className="container-fluid bg-light min-vh-100 py-4">
      <div className="row justify-content-center">
        <div className="col-12 col-xl-9">

          {/* Header */}
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
            <div>
              <h2 className="fw-bold mb-1">
                Edit Sub Admin
              </h2>

              <p className="text-secondary mb-0">
                Update account details and module permissions.
              </p>
            </div>

            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() =>
                navigate("/view-subadmin")
              }
              disabled={saving}
            >
              Back to Sub Admins
            </button>
          </div>

          {pageError && (
            <div className="alert alert-danger" role="alert">
              {pageError}
            </div>
          )}

          <div className="card border-0 shadow-sm rounded-3">

            <div className="card-header bg-white border-bottom py-3 px-4">
              <h5 className="fw-semibold mb-0">
                Account Information
              </h5>
            </div>

            <div className="card-body p-4">

              <form
                onSubmit={formik.handleSubmit}
                noValidate
              >
                <div className="row g-4">

                  {/* Name */}
                  <div className="col-12 col-md-6">
                    <label
                      htmlFor="name"
                      className="form-label fw-semibold"
                    >
                      Full Name{" "}
                      <span className="text-danger">*</span>
                    </label>

                    <input
                      id="name"
                      name="name"
                      type="text"
                      className={`form-control ${fieldError("name")
                        ? "is-invalid"
                        : ""
                        }`}
                      placeholder="Enter full name"
                      maxLength={50}
                      value={formik.values.name}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      disabled={saving}
                    />

                    {fieldError("name") && (
                      <div className="invalid-feedback">
                        {formik.errors.name}
                      </div>
                    )}
                  </div>

                  {/* Email */}
                  <div className="col-12 col-md-6">
                    <label
                      htmlFor="email"
                      className="form-label fw-semibold"
                    >
                      Email Address{" "}
                      <span className="text-danger">*</span>
                    </label>

                    <input
                      id="email"
                      name="email"
                      type="email"
                      className={`form-control ${fieldError("email")
                        ? "is-invalid"
                        : ""
                        }`}
                      placeholder="Enter email address"
                      maxLength={100}
                      value={formik.values.email}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      disabled={saving}
                    />

                    {fieldError("email") && (
                      <div className="invalid-feedback">
                        {formik.errors.email}
                      </div>
                    )}
                  </div>

                  {/* Status */}
                  <div className="col-12 col-md-6">
                    <label
                      htmlFor="status"
                      className="form-label fw-semibold"
                    >
                      Account Status{" "}
                      <span className="text-danger">*</span>
                    </label>

                    <select
                      id="status"
                      name="status"
                      className={`form-select ${fieldError("status")
                        ? "is-invalid"
                        : ""
                        }`}
                      value={formik.values.status}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      disabled={saving}
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="INACTIVE">Inactive</option>
                    </select>

                    {fieldError("status") && (
                      <div className="invalid-feedback">
                        {formik.errors.status}
                      </div>
                    )}
                  </div>

                  {/* Module Permissions */}
                  <div className="col-12">
                    <hr />

                    <h5 className="fw-semibold mb-1">
                      Module Permissions
                    </h5>

                    <p className="text-secondary small mb-3">
                      Edit permission automatically includes View permission.
                    </p>

                    <div className="table-responsive border rounded-3">
                      <table className="table table-hover table-bordered align-middle mb-0">

                        <thead className="table-light">
                          <tr>
                            <th className="py-3">
                              Module
                            </th>

                            <th
                              className="text-center py-3"
                              style={{ width: "120px" }}
                            >
                              View
                            </th>

                            <th
                              className="text-center py-3"
                              style={{ width: "120px" }}
                            >
                              Edit
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {modules.length > 0 ? (
                            modules.map((module) => {
                              const permission =
                                formik.values.permissions.find(
                                  (item) =>
                                    item.module === module
                                );

                              return (
                                <tr key={module}>
                                  <td className="fw-semibold">
                                    {module}
                                  </td>

                                  <td className="text-center">
                                    <input
                                      type="checkbox"
                                      className="form-check-input"
                                      aria-label={`${module} view permission`}
                                      checked={Boolean(
                                        permission?.view
                                      )}
                                      onChange={(event) =>
                                        handlePermissionChange(
                                          module,
                                          "view",
                                          event.target.checked
                                        )
                                      }
                                      disabled={saving}
                                    />
                                  </td>

                                  <td className="text-center">
                                    <input
                                      type="checkbox"
                                      className="form-check-input"
                                      aria-label={`${module} edit permission`}
                                      checked={Boolean(
                                        permission?.edit
                                      )}
                                      onChange={(event) =>
                                        handlePermissionChange(
                                          module,
                                          "edit",
                                          event.target.checked
                                        )
                                      }
                                      disabled={saving}
                                    />
                                  </td>
                                </tr>
                              );
                            })
                          ) : (
                            <tr>
                              <td
                                colSpan="3"
                                className="text-center py-3"
                              >
                                No modules available.
                              </td>
                            </tr>
                          )}
                        </tbody>

                      </table>
                    </div>

                    {permissionError && (
                      <div className="text-danger small mt-2">
                        {permissionError}
                      </div>
                    )}
                  </div>

                  {/* Buttons */}
                  <div className="col-12">
                    <div className="d-flex justify-content-end flex-wrap gap-2 pt-2">

                      <button
                        type="button"
                        className="btn btn-light border px-4"
                        onClick={() =>
                          navigate("/view-subadmin")
                        }
                        disabled={saving}
                      >
                        Cancel
                      </button>

                      <button
                        type="submit"
                        className="btn btn-primary px-4"
                        disabled={saving || modules.length === 0}
                      >
                        {saving ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" />
                            Updating...
                          </>
                        ) : (
                          "Update Sub Admin"
                        )}
                      </button>

                    </div>
                  </div>

                </div>
              </form>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditSubAdmin;
