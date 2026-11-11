
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faPlus,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { makeApiRequest } from "../../AxiosServices/apiCall";

const initialValues = {
  productId: "",
  ingredientList: [""],
  keyActives: [{ name: "", percentage: "" }],
  freeFrom: {
    fragranceFree: false,
    parabenFree: false,
    vegan: false,
    crueltyFree: false,
  },
};

function CreateProductIngredients() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState(initialValues);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getProducts();
  }, []);

  // GET PRODUCTS
  const getProducts = async () => {
    try {
      setLoading(true);

      const response = await makeApiRequest({
        url: "getproduct",
        method: "GET",
      });

      if (response?.status) {
        setProducts(response.data || []);
      } else {
        toast.error(response?.message || "Failed to fetch products");
      }
    } catch (error) {
      console.error("Get products error:", error);
      toast.error(
        error?.response?.data?.message || "Failed to fetch products"
      );
    } finally {
      setLoading(false);
    }
  };

  // PRODUCT CHANGE
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // INGREDIENT LIST CHANGE
  const handleIngredientChange = (index, value) => {
    const updatedIngredients = [...formData.ingredientList];
    updatedIngredients[index] = value;

    setFormData((prev) => ({
      ...prev,
      ingredientList: updatedIngredients,
    }));
  };

  const addIngredient = () => {
    setFormData((prev) => ({
      ...prev,
      ingredientList: [...prev.ingredientList, ""],
    }));
  };

  const removeIngredient = (index) => {
    setFormData((prev) => ({
      ...prev,
      ingredientList: prev.ingredientList.filter((_, i) => i !== index),
    }));
  };

  // KEY ACTIVES CHANGE
  const handleActiveChange = (index, field, value) => {
    const updatedActives = [...formData.keyActives];

    updatedActives[index] = {
      ...updatedActives[index],
      [field]: value,
    };

    setFormData((prev) => ({
      ...prev,
      keyActives: updatedActives,
    }));
  };

  const addActive = () => {
    setFormData((prev) => ({
      ...prev,
      keyActives: [
        ...prev.keyActives,
        { name: "", percentage: "" },
      ],
    }));
  };

  const removeActive = (index) => {
    setFormData((prev) => ({
      ...prev,
      keyActives: prev.keyActives.filter((_, i) => i !== index),
    }));
  };

  // FREE FROM CHANGE
  const handleFreeFromChange = (e) => {
    const { name, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      freeFrom: {
        ...prev.freeFrom,
        [name]: checked,
      },
    }));
  };

  // CREATE INGREDIENTS
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.productId) {
      toast.error("Please select a product");
      return;
    }

    const ingredientList = formData.ingredientList
      .map((item) => item.trim())
      .filter(Boolean);

    const keyActives = formData.keyActives
      .filter((item) => item.name.trim() !== "")
      .map((item) => ({
        name: item.name.trim(),
        percentage: Number(item.percentage),
      }));

    if (ingredientList.length === 0) {
      toast.error("Please enter at least one ingredient");
      return;
    }

    if (
      keyActives.some(
        (item) =>
          !Number.isFinite(item.percentage) ||
          item.percentage < 0 ||
          item.percentage > 100
      )
    ) {
      toast.error("Please enter valid active ingredient percentages (0-100)");
      return;
    }

    try {
      setSubmitting(true);

      const response = await makeApiRequest({
        url: "createproduct-ingredients",
        method: "POST",
        data: {
          productId: formData.productId,
          ingredientList,
          keyActives,
          freeFrom: formData.freeFrom,
        },
      });

      if (response?.status) {
        toast.success(
          response.message || "Product ingredients created successfully"
        );

        navigate("/product-ingredients");
      } else {
        toast.error(response?.message || "Failed to create ingredients");
      }
    } catch (error) {
      console.error("Create ingredients error:", error);
      toast.error(
        error?.response?.data?.message || "Failed to create ingredients"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container-fluid mt-3">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>Create Product Ingredients</h4>

        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => navigate("/product-ingredients")}
        >
          <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
          Back
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {/* PRODUCT */}
        <div className="card shadow-sm mb-4">
          <div className="card-header">
            <h5 className="mb-0">Product Information</h5>
          </div>

          <div className="card-body">
            <label className="form-label fw-bold">
              Select Product <span className="text-danger">*</span>
            </label>

            <select
              name="productId"
              className="form-select"
              value={formData.productId}
              onChange={handleChange}
              disabled={loading}
              required
            >
              <option value="">
                {loading ? "Loading products..." : "Select Product"}
              </option>

              {products.map((product) => (
                <option key={product._id} value={product._id}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* INGREDIENT LIST */}
        <div className="card shadow-sm mb-4">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Ingredient List</h5>

            <button
              type="button"
              className="btn btn-sm btn-primary"
              onClick={addIngredient}
            >
              <FontAwesomeIcon icon={faPlus} className="me-1" />
              Add Ingredient
            </button>
          </div>

          <div className="card-body">
            {formData.ingredientList.map((ingredient, index) => (
              <div className="row align-items-center mb-3" key={index}>
                <div className="col-md-10">
                  <label className="form-label">
                    Ingredient {index + 1}
                  </label>

                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter ingredient name"
                    value={ingredient}
                    onChange={(e) =>
                      handleIngredientChange(index, e.target.value)
                    }
                  />
                </div>

                <div className="col-md-2 mt-4">
                  <button
                    type="button"
                    className="btn btn-danger"
                    disabled={formData.ingredientList.length === 1}
                    onClick={() => removeIngredient(index)}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* KEY ACTIVES */}
        <div className="card shadow-sm mb-4">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Key Actives</h5>

            <button
              type="button"
              className="btn btn-sm btn-primary"
              onClick={addActive}
            >
              <FontAwesomeIcon icon={faPlus} className="me-1" />
              Add Active
            </button>
          </div>

          <div className="card-body">
            {formData.keyActives.map((active, index) => (
              <div className="row align-items-center mb-3" key={index}>
                <div className="col-md-6">
                  <label className="form-label">
                    Active Ingredient {index + 1}
                  </label>

                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter active ingredient"
                    value={active.name}
                    onChange={(e) =>
                      handleActiveChange(index, "name", e.target.value)
                    }
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label">Percentage (%)</label>

                  <input
                    type="number"
                    className="form-control"
                    placeholder="0 - 100"
                    min="0"
                    max="100"
                    step="any"
                    value={active.percentage}
                    onChange={(e) =>
                      handleActiveChange(index, "percentage", e.target.value)
                    }
                  />
                </div>

                <div className="col-md-2 mt-4">
                  <button
                    type="button"
                    className="btn btn-danger"
                    disabled={formData.keyActives.length === 1}
                    onClick={() => removeActive(index)}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FREE FROM */}
        <div className="card shadow-sm mb-4">
          <div className="card-header">
            <h5 className="mb-0">Free From Information</h5>
          </div>

          <div className="card-body">
            <div className="row">
              {[
                { name: "fragranceFree", label: "Fragrance Free" },
                { name: "parabenFree", label: "Paraben Free" },
                { name: "vegan", label: "Vegan" },
                { name: "crueltyFree", label: "Cruelty Free" },
              ].map((item) => (
                <div className="col-md-3 col-sm-6 mb-3" key={item.name}>
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id={item.name}
                      name={item.name}
                      checked={formData.freeFrom[item.name]}
                      onChange={handleFreeFromChange}
                    />

                    <label className="form-check-label" htmlFor={item.name}>
                      {item.label}
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SUBMIT */}
        <div className="d-flex justify-content-end gap-2 mb-4">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate("/product-ingredients")}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting || loading}
          >
            {submitting ? "Saving..." : "Create Ingredients"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateProductIngredients;
