
import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import { makeApiRequest } from "../../AxiosServices/apiCall";
import { toast } from "react-toastify";

// Convert different API response formats into an array of module strings
const normalizeModules = (response) => {
  // Supports Axios response and already-unwrapped API response
  const result = response?.data ?? response;

  // Extract the API data
  const moduleData = result?.data ?? result;

  const items = Array.isArray(moduleData)
    ? moduleData
    : [moduleData];

  const normalizedModules = items.flatMap((item) => {
    // Example: "userList"
    if (typeof item === "string") {
      return [item];
    }

    // Example: { USER_LIST: "userList", PRODUCT_LIST: "productList" }
    if (item && typeof item === "object" && !Array.isArray(item)) {
      return Object.values(item).filter(
        (value) => typeof value === "string"
      );
    }

    return [];
  });

  // Remove empty values and duplicates
  return [...new Set(
    normalizedModules.filter((module) => module.trim() !== "")
  )];
};

const validationSchema = Yup.object({
  name: Yup.string()
    .trim()
    .min(2, "Name must contain at least 2 characters")
    .required("Name is required"),

  email: Yup.string()
    .trim()
    .email("Enter a valid email address")
    .required("Email is required"),

  status: Yup.string()
    .oneOf(["ACTIVE", "INACTIVE"], "Select a valid status")
    .required("Status is required"),

  permissions: Yup.array()
    .of(
      Yup.object({
        module: Yup.string().required(),
        view: Yup.boolean(),
        edit: Yup.boolean(),
      })
    )
    .test(
      "at-least-one-module",
      "Please select at least one module",
      (permissions) =>
        Array.isArray(permissions) &&
        permissions.some(
          (permission) => permission.view || permission.edit
        )
    ),
});

function AddSubadmin() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [modules, setModules] = useState([]);
  const [modulesLoading, setModulesLoading] = useState(false);

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      status: "ACTIVE",
      permissions: [],
    },

    validationSchema,

    onSubmit: async (values, { resetForm }) => {
      setLoading(true);

      try {
        const response = await makeApiRequest({
          url: "/create-admin",
          method: "POST",
          data: {
            ...values,
            name: values.name.trim(),
            email: values.email.trim().toLowerCase(),
            permissions: values.permissions
              .filter(
                (permission) =>
                  permission.view || permission.edit
              )
              .map((permission) => ({
                module: permission.module,
                view: permission.view || permission.edit,
                edit: permission.edit,
              })),
          },
        });

        const result = response?.data ?? response;

        if (result?.status === false) {
          throw new Error(
            result.message || "Unable to create sub-admin."
          );
        }

        toast.success(
          result?.message || "Sub-admin created successfully."
        );

        resetForm();
      } catch (error) {
        console.error("Create Subadmin Error:", error);

        toast.error(
          error.response?.data?.message ||
          error.message ||
          "Unable to create sub-admin."
        );
      } finally {
        setLoading(false);
      }
    },
  });

  // Fetch backend modules
  useEffect(() => {
    const fetchModules = async () => {
      setModulesLoading(true);

      try {
        const response = await makeApiRequest({
          url: "/get-modules",
          method: "GET",
        });

        console.log("GET MODULES API RESPONSE:", response);

        const moduleData = normalizeModules(response);

        console.log("NORMALIZED MODULES:", moduleData);

        if (moduleData.length === 0) {
          throw new Error("No valid modules received from backend.");
        }

        setModules(moduleData);
      } catch (error) {
        console.error("Fetch Modules Error:", error);

        setModules([]);

        toast.error(
          error.response?.data?.message ||
          error.message ||
          "Unable to fetch modules."
        );
      } finally {
        setModulesLoading(false);
      }
    };

    fetchModules();
  }, []);

  // Handle module permission changes
  const handlePermissionChange = (module, type, checked) => {
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

  return (
    <div className="container-fluid subadmin-page py-4">

      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h2 className="subadmin-title mb-1">
            Add Sub Admin
          </h2>

          <p className="text-secondary mb-0">
            Create an admin account and assign module permissions.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={() => navigate(-1)}
        >
          Back
        </button>
      </div>

      <div className="card subadmin-card border-0 shadow-sm">

        <div className="card-header bg-white px-4 py-3">
          <h5 className="mb-0">
            Sub-admin information
          </h5>
        </div>

        <div className="card-body p-4">

          <form onSubmit={formik.handleSubmit} noValidate>

            <div className="row g-4">

              {/* Name */}
              <div className="col-md-6">
                <label htmlFor="name" className="form-label">
                  Full Name
                </label>

                <input
                  id="name"
                  name="name"
                  type="text"
                  className={`form-control ${formik.touched.name && formik.errors.name
                    ? "is-invalid"
                    : ""
                    }`}
                  placeholder="Enter full name"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />

                {formik.touched.name && formik.errors.name && (
                  <div className="invalid-feedback">
                    {formik.errors.name}
                  </div>
                )}
              </div>

              {/* Email */}
              <div className="col-md-6">
                <label htmlFor="email" className="form-label">
                  Email Address
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  className={`form-control ${formik.touched.email && formik.errors.email
                    ? "is-invalid"
                    : ""
                    }`}
                  placeholder="Enter email address"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />

                {formik.touched.email && formik.errors.email && (
                  <div className="invalid-feedback">
                    {formik.errors.email}
                  </div>
                )}
              </div>

              {/* Status */}
              <div className="col-md-6">
                <label htmlFor="status" className="form-label">
                  Account Status
                </label>

                <select
                  id="status"
                  name="status"
                  className={`form-select ${formik.touched.status && formik.errors.status
                    ? "is-invalid"
                    : ""
                    }`}
                  value={formik.values.status}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>

                {formik.touched.status && formik.errors.status && (
                  <div className="invalid-feedback">
                    {formik.errors.status}
                  </div>
                )}
              </div>

              {/* Module Permissions */}
              <div className="col-12">

                <h5 className="mb-1">
                  Module Permissions
                </h5>

                <p className="text-secondary small mb-3">
                  Edit permission automatically includes View permission.
                </p>

                <div className="table-responsive">

                  <table className="table table-bordered align-middle mb-0">

                    <thead className="table-light">
                      <tr>
                        <th>Module</th>
                        <th className="text-center">View</th>
                        <th className="text-center">Edit</th>
                      </tr>
                    </thead>

                    <tbody>

                      {modulesLoading ? (
                        <tr>
                          <td colSpan="3" className="text-center py-3">
                            Loading modules...
                          </td>
                        </tr>
                      ) : modules.length > 0 ? (

                        modules.map((module) => {
                          const permission =
                            formik.values.permissions.find(
                              (item) => item.module === module
                            );

                          return (
                            <tr key={module}>

                              <td>{module}</td>

                              <td className="text-center">
                                <input
                                  type="checkbox"
                                  className="form-check-input"
                                  checked={permission?.view || false}
                                  onChange={(e) =>
                                    handlePermissionChange(
                                      module,
                                      "view",
                                      e.target.checked
                                    )
                                  }
                                />
                              </td>

                              <td className="text-center">
                                <input
                                  type="checkbox"
                                  className="form-check-input"
                                  checked={permission?.edit || false}
                                  onChange={(e) =>
                                    handlePermissionChange(
                                      module,
                                      "edit",
                                      e.target.checked
                                    )
                                  }
                                />
                              </td>

                            </tr>
                          );
                        })

                      ) : (
                        <tr>
                          <td colSpan="3" className="text-center py-3">
                            No modules available.
                          </td>
                        </tr>
                      )}

                    </tbody>
                  </table>

                </div>

                {formik.touched.permissions &&
                  typeof formik.errors.permissions === "string" && (
                    <div className="text-danger mt-2">
                      {formik.errors.permissions}
                    </div>
                  )}

              </div>

              {/* Buttons */}
              <div className="col-12 d-flex justify-content-end gap-2 pt-2">

                <button
                  type="button"
                  className="btn btn-light border"
                  disabled={loading}
                  onClick={() => formik.resetForm()}
                >
                  Clear
                </button>

                <button
                  type="submit"
                  className="btn btn-primary px-4"
                  disabled={
                    loading ||
                    modulesLoading ||
                    modules.length === 0
                  }
                >
                  {loading ? "Creating..." : "Create Sub Admin"}
                </button>

              </div>

            </div>

          </form>

        </div>
      </div>
    </div>
  );
}

export default AddSubadmin;
