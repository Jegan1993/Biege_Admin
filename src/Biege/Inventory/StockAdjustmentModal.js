
import React, { useEffect, useState } from "react";

const initialValues = {
  movementType: "OUT",
  reason: "DAMAGED",
  quantity: "",
  batchNumber: "",
  manufacturingDate: "",
  expiryDate: "",
  notes: "",
};

function StockAdjustmentModal({
  inventory,
  inventoryList = [],
  submitting,
  onClose,
  onSubmit,
}) {
  const [formData, setFormData] = useState(initialValues);
  const [selectedInventoryId, setSelectedInventoryId] = useState(
    inventory?._id || ""
  );

  const activeInventory =
    inventory ||
    inventoryList.find(
      (item) => item._id === selectedInventoryId
    );

  useEffect(() => {
    setSelectedInventoryId(inventory?._id || "");
    setFormData(initialValues);
  }, [inventory?._id]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleMovementChange = (e) => {
    const movementType = e.target.value;

    setFormData((prev) => ({
      ...prev,
      movementType,
      reason: movementType === "OUT" ? "DAMAGED" : "CORRECTION",
      quantity: "",
      batchNumber: "",
      manufacturingDate: "",
      expiryDate: "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!activeInventory) {
      return window.alert("Please select an inventory item");
    }

    const {
      movementType,
      reason,
      quantity,
      batchNumber,
      manufacturingDate,
      expiryDate,
      notes,
    } = formData;

    if (quantity === "" || !Number.isInteger(Number(quantity))) {
      return window.alert("Enter a valid whole number");
    }

    const amount = Number(quantity);

    if (amount < 0) {
      return window.alert("Quantity cannot be negative");
    }

    if (movementType !== "ADJUSTMENT" && amount <= 0) {
      return window.alert("Quantity must be greater than zero");
    }

    const currentStock = Number(activeInventory.onHand || 0);

    const newStock =
      movementType === "IN"
        ? currentStock + amount
        : movementType === "OUT"
          ? currentStock - amount
          : amount;

    const stockIncrease = newStock > currentStock;

    if (stockIncrease && (!batchNumber.trim() || !expiryDate)) {
      return window.alert(
        "Batch number and expiry date are required when adding stock"
      );
    }

    if (
      manufacturingDate &&
      expiryDate &&
      expiryDate <= manufacturingDate
    ) {
      return window.alert(
        "Expiry date must be after manufacturing date"
      );
    }

    const payload = {
      inventoryId: activeInventory._id,
      movementType,
      reason,
      quantity: amount,
      notes: notes.trim(),
    };

    if (stockIncrease) {
      payload.batchNumber = batchNumber.trim();
      payload.manufacturingDate = manufacturingDate || undefined;
      payload.expiryDate = expiryDate;
    }

    await onSubmit(payload);
  };

  return (
    <div
      className="modal show d-block"
      tabIndex="-1"
      style={{
        position: "fixed",
        inset: 0,
        overflowY: "auto",
        backgroundColor: "rgba(0,0,0,0.5)",
        zIndex: 99999,
      }}
    >
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content">
          <form onSubmit={handleSubmit}>
            <div className="modal-header">
              <h5 className="modal-title">Stock Adjustment</h5>

              <button
                type="button"
                className="btn-close"
                onClick={onClose}
                disabled={submitting}
              />
            </div>

            <div className="modal-body">
              {!inventory && (
                <div className="mb-3">
                  <label className="form-label">
                    Select Inventory *
                  </label>

                  <select
                    className="form-select"
                    value={selectedInventoryId}
                    onChange={(e) => {
                      setSelectedInventoryId(e.target.value);
                      setFormData(initialValues);
                    }}
                    required
                  >
                    <option value="">Choose inventory</option>

                    {inventoryList.map((item) => (
                      <option key={item._id} value={item._id}>
                        {item.productId?.name || "Product"} -{" "}
                        {item.sku ||
                          item.variantId?.sku ||
                          "No SKU"}{" "}
                        (Stock: {item.onHand})
                      </option>
                    ))}
                  </select>

                  {inventoryList.length === 0 && (
                    <small className="text-danger">
                      No inventory records available.
                    </small>
                  )}
                </div>
              )}

              {activeInventory && (
                <>
                  <div className="alert alert-light border">
                    <strong>Product:</strong>{" "}
                    {activeInventory.productId?.name || "N/A"}
                    <br />

                    <strong>SKU:</strong>{" "}
                    {activeInventory.sku ||
                      activeInventory.variantId?.sku ||
                      "N/A"}
                    <br />

                    <strong>Current On Hand:</strong>{" "}
                    {activeInventory.onHand}
                    <br />

                    <strong>Reserved:</strong>{" "}
                    {activeInventory.reserved}
                  </div>

                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">
                        Adjustment Type *
                      </label>

                      <select
                        className="form-select"
                        value={formData.movementType}
                        onChange={handleMovementChange}
                      >
                        <option value="IN">Stock IN</option>
                        <option value="OUT">Stock OUT</option>
                        <option value="ADJUSTMENT">
                          Physical Stock Correction
                        </option>
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">Reason *</label>

                      <select
                        className="form-select"
                        name="reason"
                        value={formData.reason}
                        onChange={handleChange}
                      >
                        {formData.movementType === "OUT" && (
                          <>
                            <option value="DAMAGED">Damaged</option>
                            <option value="EXPIRED">Expired</option>
                            <option value="CORRECTION">Correction</option>
                          </>
                        )}

                        {formData.movementType === "IN" && (
                          <option value="CORRECTION">Correction</option>
                        )}

                        {formData.movementType === "ADJUSTMENT" && (
                          <option value="CORRECTION">
                            Physical Count Correction
                          </option>
                        )}
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">
                        {formData.movementType === "ADJUSTMENT"
                          ? "Actual Physical Stock *"
                          : "Adjustment Quantity *"}
                      </label>

                      <input
                        type="number"
                        min="0"
                        step="1"
                        className="form-control"
                        name="quantity"
                        value={formData.quantity}
                        onChange={handleChange}
                        required
                      />

                      <small className="text-muted">
                        {formData.movementType === "ADJUSTMENT"
                          ? "Enter the actual physical stock count"
                          : "Enter the quantity to add or remove"}
                      </small>
                    </div>

                    {(formData.movementType === "IN" ||
                      (formData.movementType === "ADJUSTMENT" &&
                        Number(formData.quantity) >
                        Number(activeInventory.onHand))) && (
                        <>
                          <div className="col-md-6">
                            <label className="form-label">
                              Batch Number *
                            </label>

                            <input
                              type="text"
                              className="form-control"
                              name="batchNumber"
                              value={formData.batchNumber}
                              onChange={handleChange}
                              required
                            />
                          </div>

                          <div className="col-md-6">
                            <label className="form-label">
                              Manufacturing Date
                            </label>

                            <input
                              type="date"
                              className="form-control"
                              name="manufacturingDate"
                              value={formData.manufacturingDate}
                              onChange={handleChange}
                            />
                          </div>

                          <div className="col-md-6">
                            <label className="form-label">
                              Expiry Date *
                            </label>

                            <input
                              type="date"
                              className="form-control"
                              name="expiryDate"
                              value={formData.expiryDate}
                              onChange={handleChange}
                              required
                            />
                          </div>
                        </>
                      )}

                    <div className="col-md-12">
                      <label className="form-label">Notes</label>

                      <textarea
                        className="form-control"
                        rows="3"
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        placeholder="Enter adjustment reason or notes"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
                disabled={submitting}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting || !activeInventory}
              >
                {submitting ? "Adjusting..." : "Adjust Stock"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default StockAdjustmentModal;
