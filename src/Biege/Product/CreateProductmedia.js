
// import React, { useEffect, useState } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import { toast } from "react-toastify";
// import { makeApiRequest } from "../../AxiosServices/apiCall";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import {
//   faSave,
//   faArrowLeft,
//   faTrash,
// } from "@fortawesome/free-solid-svg-icons";

// function CreateProductmedia() {
//   const navigate = useNavigate();
//   const { productId: wizardProductId } = useParams();

//   const isWizard = Boolean(wizardProductId);

//   const [products, setProducts] = useState([]);
//   const [productId, setProductId] = useState(wizardProductId || "");
//   const [images, setImages] = useState([]);
//   const [mainImage, setMainImage] = useState("0");
//   const [video, setVideo] = useState("");
//   const [submitting, setSubmitting] = useState(false);

//   const getAllProducts = async () => {
//     try {
//       const result = await makeApiRequest({
//         url: "getproduct",
//         method: "GET",
//       });

//       if (result?.status && Array.isArray(result.data)) {
//         setProducts(result.data);
//       } else {
//         setProducts([]);
//         toast.error(result?.message || "Products not found");
//       }
//     } catch (error) {
//       console.log("Get products error:", error);
//       toast.error(
//         error?.response?.data?.message || "Failed to fetch products"
//       );
//     }
//   };

//   useEffect(() => {
//     getAllProducts();

//     if (wizardProductId) {
//       setProductId(wizardProductId);
//     }
//   }, [wizardProductId]);

//   const handleImageChange = (e) => {
//     const selectedFiles = Array.from(e.target.files || []);

//     const validFiles = selectedFiles.filter((file) =>
//       file.type.startsWith("image/")
//     );

//     if (validFiles.length !== selectedFiles.length) {
//       toast.error("Please select only image files");
//     }

//     if (images.length + validFiles.length > 10) {
//       toast.error("Maximum 10 images are allowed");
//       e.target.value = "";
//       return;
//     }

//     setImages((prev) => [...prev, ...validFiles]);
//     e.target.value = "";
//   };

//   const handleRemoveImage = (index) => {
//     const updatedImages = images.filter((_, i) => i !== index);
//     setImages(updatedImages);

//     if (updatedImages.length === 0) {
//       setMainImage("");
//     } else if (Number(mainImage) === index) {
//       setMainImage("0");
//     } else if (Number(mainImage) > index) {
//       setMainImage(String(Number(mainImage) - 1));
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!productId) {
//       toast.error("Please select a product");
//       return;
//     }

//     if (images.length === 0) {
//       toast.error("Please upload at least one image");
//       return;
//     }

//     if (mainImage === "" || !images[Number(mainImage)]) {
//       toast.error("Please select a main image");
//       return;
//     }

//     try {
//       setSubmitting(true);

//       const formData = new FormData();

//       formData.append("productId", productId);
//       formData.append("video", video);
//       formData.append("mainImage", mainImage);

//       images.forEach((image) => {
//         formData.append("images", image);
//       });

//       const result = await makeApiRequest({
//         url: "createproduct-media",
//         method: "POST",
//         data: formData,
//         header: "image",
//       });

//       if (result?.status) {
//         toast.success(
//           result.message || "Product media created successfully"
//         );

//         if (isWizard) {
//           navigate(`/add-product/${wizardProductId}/variants`);
//         } else {
//           navigate("/add-product/media");
//         }
//       } else {
//         toast.error(
//           result?.message || "Failed to create product media"
//         );
//       }
//     } catch (error) {
//       console.log("Create media error:", error);

//       toast.error(
//         error?.response?.data?.message ||
//         "Failed to create product media"
//       );
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const handleBack = () => {
//     if (isWizard) {
//       navigate(`/add-product/${wizardProductId}/pricing`);
//     } else {
//       navigate("/add-product/media");
//     }
//   };

//   return (
//     <div className="container-fluid py-3">
//       <div className="d-flex justify-content-between align-items-center mb-4">
//         <h4 className="mb-0">Create Product Media</h4>

//         <button
//           type="button"
//           className="btn btn-secondary"
//           onClick={handleBack}
//         >
//           <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
//           Back
//         </button>
//       </div>

//       <div className="card shadow-sm">
//         <div className="card-body">
//           <form onSubmit={handleSubmit}>
//             <div className="row">

//               {/* Product */}
//               {!isWizard && (
//                 <div className="col-md-6 mb-3">
//                   <label className="form-label">
//                     Product <span className="text-danger">*</span>
//                   </label>

//                   <select
//                     className="form-select"
//                     value={productId}
//                     onChange={(e) => setProductId(e.target.value)}
//                     required
//                   >
//                     <option value="">Select Product</option>

//                     {products.map((item) => (
//                       <option key={item._id} value={item._id}>
//                         {item.name}
//                       </option>
//                     ))}
//                   </select>
//                 </div>
//               )}

//               {/* Video URL */}
//               <div className="col-md-6 mb-3">
//                 <label className="form-label">Video URL</label>

//                 <input
//                   type="url"
//                   className="form-control"
//                   placeholder="Enter product video URL"
//                   value={video}
//                   onChange={(e) => setVideo(e.target.value)}
//                 />
//               </div>

//               {/* Product Images */}
//               <div className="col-md-12 mb-3">
//                 <label className="form-label">
//                   Product Images <span className="text-danger">*</span>
//                 </label>

//                 <input
//                   type="file"
//                   className="form-control"
//                   accept="image/*"
//                   multiple
//                   onChange={handleImageChange}
//                 />

//                 <small className="text-muted">
//                   Maximum 10 images allowed.
//                 </small>
//               </div>
//             </div>

//             {/* Image Preview */}
//             {images.length > 0 && (
//               <div className="row mb-3">
//                 {images.map((image, index) => (
//                   <div
//                     className="col-md-3 col-sm-6 mb-3"
//                     key={`${image.name}-${index}`}
//                   >
//                     <div className="card h-100">
//                       <img
//                         src={URL.createObjectURL(image)}
//                         alt={image.name}
//                         style={{
//                           width: "100%",
//                           height: "160px",
//                           objectFit: "contain",
//                           padding: "8px",
//                         }}
//                       />

//                       <div className="card-body p-2">
//                         <div className="form-check">
//                           <input
//                             type="radio"
//                             className="form-check-input"
//                             name="mainImage"
//                             checked={mainImage === String(index)}
//                             onChange={() =>
//                               setMainImage(String(index))
//                             }
//                           />

//                           <label className="form-check-label">
//                             Main Image
//                           </label>
//                         </div>

//                         <button
//                           type="button"
//                           className="btn btn-sm btn-outline-danger mt-2"
//                           onClick={() => handleRemoveImage(index)}
//                         >
//                           <FontAwesomeIcon icon={faTrash} /> Remove
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}

//             <button
//               type="submit"
//               className="btn btn-success"
//               disabled={submitting}
//             >
//               <FontAwesomeIcon icon={faSave} className="me-2" />

//               {submitting ? "Saving..." : "Create Media"}
//             </button>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default CreateProductmedia;



import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { makeApiRequest } from "../../AxiosServices/apiCall";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSave,
  faArrowLeft,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";

function CreateProductmedia() {
  const navigate = useNavigate();
  const { productId: wizardProductId, id } = useParams();

  // Create wizard: /add-product/:productId/media
  const isWizard = Boolean(wizardProductId);

  // Edit wizard: /edit-product/:id/media
  const isEditWizard = Boolean(id);

  const activeProductId = wizardProductId || id;

  const [products, setProducts] = useState([]);
  const [productId, setProductId] = useState(activeProductId || "");

  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);

  const [mainImage, setMainImage] = useState("");
  const [video, setVideo] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);

  // =====================================
  // GET ALL PRODUCTS
  // =====================================

  const getAllProducts = async () => {
    try {
      const result = await makeApiRequest({
        url: "getproduct",
        method: "GET",
      });

      if (result?.status && Array.isArray(result.data)) {
        setProducts(result.data);
      } else {
        setProducts([]);
        toast.error(result?.message || "Products not found");
      }
    } catch (error) {
      console.log("Get products error:", error);

      toast.error(
        error?.response?.data?.message ||
        "Failed to fetch products"
      );
    }
  };

  // =====================================
  // GET EXISTING PRODUCT MEDIA
  // =====================================

  const getProductMedia = async (selectedProductId) => {
    if (!selectedProductId) return;

    try {
      setLoading(true);

      const result = await makeApiRequest({
        url: `getproduct-media/${selectedProductId}`,
        method: "GET",
      });

      console.log("EXISTING PRODUCT MEDIA:", result);

      if (result?.status && result.data) {
        const media = result.data;

        setExistingImages(media.images || []);
        setVideo(media.video || "");

        const selectedMainImage = media.mainImage || "";

        setMainImage(
          selectedMainImage
            ? `existing-${(media.images || []).findIndex(
              (image) => image.url === selectedMainImage
            )}`
            : ""
        );

        if (
          selectedMainImage &&
          !(media.images || []).some(
            (image) => image.url === selectedMainImage
          )
        ) {
          setMainImage("");
        }
      } else {
        setExistingImages([]);
        setImages([]);
        setVideo("");
        setMainImage("");

        toast.error(
          result?.message || "Product media not found"
        );
      }
    } catch (error) {
      console.log("Get product media error:", error);

      setExistingImages([]);
      setImages([]);
      setVideo("");
      setMainImage("");

      toast.error(
        error?.response?.data?.message ||
        "Failed to fetch product media"
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================
  // INITIAL LOAD
  // =====================================

  useEffect(() => {
    getAllProducts();

    if (activeProductId) {
      setProductId(activeProductId);

      if (isEditWizard) {
        getProductMedia(activeProductId);
      }
    }
  }, [wizardProductId, id]);

  // =====================================
  // HANDLE IMAGE CHANGE
  // =====================================

  const handleImageChange = (e) => {
    const selectedFiles = Array.from(e.target.files || []);

    const validFiles = selectedFiles.filter((file) =>
      file.type.startsWith("image/")
    );

    if (validFiles.length !== selectedFiles.length) {
      toast.error("Please select only image files");
    }

    if (
      existingImages.length + images.length + validFiles.length >
      10
    ) {
      toast.error("Maximum 10 images are allowed");
      e.target.value = "";
      return;
    }

    setImages((prev) => [...prev, ...validFiles]);

    e.target.value = "";
  };

  // =====================================
  // REMOVE NEW IMAGE
  // =====================================

  const handleRemoveImage = (index) => {
    const updatedImages = images.filter((_, i) => i !== index);

    setImages(updatedImages);

    if (mainImage === `new-${index}`) {
      setMainImage(
        existingImages.length > 0
          ? "existing-0"
          : updatedImages.length > 0
            ? "new-0"
            : ""
      );
    } else if (mainImage.startsWith("new-")) {
      const selectedIndex = Number(mainImage.split("-")[1]);

      if (selectedIndex > index) {
        setMainImage(`new-${selectedIndex - 1}`);
      }
    }
  };

  // =====================================
  // SELECT MAIN IMAGE
  // =====================================

  const handleMainImageChange = (value) => {
    setMainImage(value);
  };

  // =====================================
  // SUBMIT CREATE / UPDATE MEDIA
  // =====================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!productId) {
      toast.error("Please select a product");
      return;
    }

    if (!isEditWizard && images.length === 0) {
      toast.error("Please upload at least one image");
      return;
    }

    if (
      isEditWizard &&
      existingImages.length === 0 &&
      images.length === 0
    ) {
      toast.error("Please upload at least one image");
      return;
    }

    if (mainImage === "") {
      toast.error("Please select a main image");
      return;
    }

    try {
      setSubmitting(true);

      const formData = new FormData();

      formData.append("productId", productId);
      formData.append("video", video);

      // Backend expects mainImage as the index
      // in the combined existing + newly uploaded image array.
      let selectedMainIndex = -1;

      if (mainImage.startsWith("existing-")) {
        selectedMainIndex = Number(
          mainImage.split("-")[1]
        );
      } else if (mainImage.startsWith("new-")) {
        selectedMainIndex =
          existingImages.length +
          Number(mainImage.split("-")[1]);
      }

      if (selectedMainIndex < 0) {
        toast.error("Please select a valid main image");
        return;
      }

      formData.append(
        "mainImage",
        String(selectedMainIndex)
      );

      images.forEach((image) => {
        formData.append("images", image);
      });

      const result = await makeApiRequest({
        url: isEditWizard
          ? `updateproduct-media/${productId}`
          : "createproduct-media",

        method: isEditWizard ? "PUT" : "POST",

        data: formData,
        header: "image",
      });

      if (result?.status) {
        toast.success(
          result.message ||
          (isEditWizard
            ? "Product media updated successfully"
            : "Product media created successfully")
        );

        // EDIT: Return to product list
        if (isEditWizard) {
          navigate("/view-product");
          return;
        }

        // CREATE: Move to variants
        if (isWizard) {
          navigate(
            `/add-product/${wizardProductId}/variants`
          );
          return;
        }

        navigate("/add-product/media");
      } else {
        toast.error(
          result?.message ||
          "Failed to save product media"
        );
      }
    } catch (error) {
      console.log("Save media error:", error);

      toast.error(
        error?.response?.data?.message ||
        "Failed to save product media"
      );
    } finally {
      setSubmitting(false);
    }
  };

  // =====================================
  // BACK
  // =====================================

  const handleBack = () => {
    if (isEditWizard) {
      navigate(`/edit-product/${id}/pricing`);
      return;
    }

    if (isWizard) {
      navigate(
        `/add-product/${wizardProductId}/pricing`
      );
      return;
    }

    navigate("/add-product/media");
  };

  // =====================================
  // MAIN IMAGE RADIO BUTTON
  // =====================================

  const renderMainImageRadio = (value) => (
    <div className="form-check">
      <input
        type="radio"
        className="form-check-input"
        name="mainImage"
        checked={mainImage === value}
        onChange={() => handleMainImageChange(value)}
      />

      <label className="form-check-label">
        Main Image
      </label>
    </div>
  );

  // =====================================
  // UI
  // =====================================

  return (
    <div className="container-fluid py-3">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="mb-0">
          {isEditWizard
            ? "Update Product Media"
            : "Create Product Media"}
        </h4>

        <button
          type="button"
          className="btn btn-secondary"
          onClick={handleBack}
        >
          <FontAwesomeIcon
            icon={faArrowLeft}
            className="me-2"
          />
          Back
        </button>
      </div>

      <div className="card shadow-sm">
        <div className="card-body">
          {loading ? (
            <div className="text-center py-4">
              Loading product media...
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="row">
                {/* PRODUCT */}

                {!isWizard && !isEditWizard && (
                  <div className="col-md-6 mb-3">
                    <label className="form-label">
                      Product{" "}
                      <span className="text-danger">*</span>
                    </label>

                    <select
                      className="form-select"
                      value={productId}
                      onChange={(e) =>
                        setProductId(e.target.value)
                      }
                      required
                    >
                      <option value="">
                        Select Product
                      </option>

                      {products.map((item) => (
                        <option
                          key={item._id}
                          value={item._id}
                        >
                          {item.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* VIDEO URL */}

                <div className="col-md-6 mb-3">
                  <label className="form-label">
                    Video URL
                  </label>

                  <input
                    type="url"
                    className="form-control"
                    placeholder="Enter product video URL"
                    value={video}
                    onChange={(e) =>
                      setVideo(e.target.value)
                    }
                  />
                </div>

                {/* PRODUCT IMAGES */}

                <div className="col-md-12 mb-3">
                  <label className="form-label">
                    Product Images{" "}
                    <span className="text-danger">*</span>
                  </label>

                  <input
                    type="file"
                    className="form-control"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                  />

                  <small className="text-muted">
                    Maximum 10 images allowed.
                    {isEditWizard &&
                      " New images will be added to existing images."}
                  </small>
                </div>
              </div>

              {/* EXISTING IMAGE PREVIEW */}

              {existingImages.length > 0 && (
                <>
                  <h6 className="mb-3">
                    Existing Product Images
                  </h6>

                  <div className="row mb-3">
                    {existingImages.map((image, index) => (
                      <div
                        className="col-md-3 col-sm-6 mb-3"
                        key={image.publicId || image.url || index}
                      >
                        <div className="card h-100">
                          <img
                            src={image.url}
                            alt={image.altText || "Product"}
                            style={{
                              width: "100%",
                              height: "160px",
                              objectFit: "contain",
                              padding: "8px",
                            }}
                          />

                          <div className="card-body p-2">
                            {renderMainImageRadio(
                              `existing-${index}`
                            )}

                            {image.url ===
                              existingImages.find(
                                (item) =>
                                  item.url ===
                                  existingImages[index]?.url
                              )?.url && (
                                <small className="text-muted">
                                  Existing image
                                </small>
                              )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* NEW IMAGE PREVIEW */}

              {images.length > 0 && (
                <>
                  <h6 className="mb-3">
                    Newly Selected Images
                  </h6>

                  <div className="row mb-3">
                    {images.map((image, index) => (
                      <div
                        className="col-md-3 col-sm-6 mb-3"
                        key={`${image.name}-${index}`}
                      >
                        <div className="card h-100">
                          <img
                            src={URL.createObjectURL(image)}
                            alt={image.name}
                            style={{
                              width: "100%",
                              height: "160px",
                              objectFit: "contain",
                              padding: "8px",
                            }}
                          />

                          <div className="card-body p-2">
                            {renderMainImageRadio(
                              `new-${index}`
                            )}

                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger mt-2"
                              onClick={() =>
                                handleRemoveImage(index)
                              }
                            >
                              <FontAwesomeIcon
                                icon={faTrash}
                              />{" "}
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* SUBMIT */}

              <button
                type="submit"
                className="btn btn-success"
                disabled={submitting}
              >
                <FontAwesomeIcon
                  icon={faSave}
                  className="me-2"
                />

                {submitting
                  ? "Saving..."
                  : isEditWizard
                    ? "Update Media"
                    : "Create Media"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default CreateProductmedia;
