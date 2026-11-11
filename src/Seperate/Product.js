import React, { useState, useEffect } from "react";
import { FaEdit } from "react-icons/fa";
import { RiDeleteBin6Line } from "react-icons/ri";
import DataTable from "react-data-table-component";
import { makeApiRequest } from "../AxiosServices/apiCall";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import Select from "react-select";

function Product() {
  const Navigate = useNavigate();
  const [categoryId, setCategoryId] = useState("");
  const [categoryList, setCategoryList] = useState([]);
  const [product, setProduct] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedOption, setSelectedOption] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState();
  const [viewImage, setViewImage] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleSearch = (event) => {
    const value = event.target.value;
    setSearchTerm(value);

    // Filter products based on the selected category and the search term
    console.log(product, "search");

    let filtered = product.filter(
      (prod) =>
        prod.productname.toLowerCase().includes(value.toLowerCase()) ||
        prod.category.toLowerCase().includes(value.toLowerCase()) ||
        prod.subCategory.toLowerCase().includes(value.toLowerCase()) ||
        prod._id.toLowerCase().includes(value.toLowerCase()),
    );

    // If a category is selected, filter by the selected category as well
    if (categoryId) {
      filtered = filtered.filter((prod) => prod.categoryId === categoryId);
    }

    setFilteredProducts(filtered);
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const getProductdatas = async () => {
    try {
      let params = {
        url: `getproduct`,
        method: "GET",
      };
      let response = await makeApiRequest(params);
      if (response.status === true) {
        const productList = response.data;
        setProduct(productList);
        setFilteredProducts(productList);
      } else {
        setProduct([]);
        setFilteredProducts([]);
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  const fetchCategorieList = async () => {
    try {
      let params = {
        url: "getcategories",
        method: "GET",
      };
      const response = await makeApiRequest(params);
      if (response.status) {
        const { data: categoriesList } = response;
        setCategoryList(categoriesList);
      } else {
        setCategoryList([]);
      }
    } catch (error) {
      console.log("error-", error);
    }
  };

  const handleSelectSkinCare = (selectedValue) => {
    const { value, id } = selectedValue;
    setSelectedOption(selectedValue);
    setCategoryId(id);
    setSelectedCategory(value);
    const filtered = product.filter((prod) => prod.categoryId === id);
    // console.log('filteredProducts==', filtered);
    setFilteredProducts(filtered);
  };

  useEffect(() => {
    getProductdatas();
    fetchCategorieList();
  }, []);

  const skinCareOptions = categoryList.map((data) => {
    return {
      value: data.name,
      label: data.name,
      id: data._id,
    };
  });

  const columnsone = [
    {
      name: "S.no",
      selector: (row, index) => index + 1 + (currentPage - 1) * rowsPerPage,
      sortable: true,
      id: "sno",
      width: "80px",
    },
    {
      name: "Category",
      selector: (row) => row.category,
      sortable: true,
      id: "category",
      width: "100px",
    },
    {
      name: "Sub Category",
      selector: (row) => row.subCategory,
      sortable: true,
      id: "subCategory",
      width: "150px",
    },
    {
      name: "Product ID",
      selector: (row) => row._id,
      sortable: true,
      id: "productId",
      width: "250px",
    },
    {
      name: "Product Name",
      selector: (row) => row.productname,
      sortable: true,
      id: "productname",
      width: "350px",
      cell: (row) => (
        <div style={{ whiteSpace: "normal", wordBreak: "break-word" }}>
          {row.productname}
        </div>
      ),
    },
    {
      name: "Description",
      // selector: row => row.description,
      sortable: true,
      id: "description",
      width: "450px",
      // cell: row => <div className='ddffff'>
      //     {row.description}
      // </div>
      cell: (row) => (
        <div
          data-bs-toggle="modal"
          data-bs-target="#staticBackdrop-1"
          className="custom-cell-space"
          onClick={() => openModal(row.description)}
          dangerouslySetInnerHTML={{
            __html: row.description.substring(0, 50) + "...",
          }}
        />
      ),
    },
    {
      name: "Price",
      selector: (row) => row.price,
      sortable: true,
      id: "price",
      width: "100px",
    },
    {
      name: "Gstprice",
      selector: (row) => row.gst_price,
      sortable: true,
      id: "price",
      width: "100px",
    },
    {
      name: "Discount",
      selector: (row) => row.discount,
      cell: (row) => `${row.discount == "" ? "0" : row.discount}%`,
      sortable: true,
      id: "price",
      width: "105px",
    },
    {
      name: "Final Price",
      selector: (row) => row.final_price,
      sortable: true,
      id: "price",
      width: "100px",
    },
    {
      name: "Fragrance",
      selector: (row) => row.shade,
      sortable: true,
      id: "fragrance",
      width: "100px",
    },
    {
      name: "Stock",
      selector: (row) => row.quantity,
      sortable: true,
      id: "stock",
      width: "100px",
    },
    {
      name: "Quantity(ml or grm)",
      selector: (row) => row.size,
      sortable: true,
      id: "quantity",
      width: "80px",
    },
    {
      name: "Status",
      selector: (row) => row.productStatus,
      cell: (row) => (row.productStatus == 1 ? "Enabled" : "Disabled"),
      sortable: true,
      id: "Status",
      width: "100px",
    },
    {
      name: "View Image",
      width: "100px",
      cell: (row) => (
        <button
          onClick={() => handleViewClick(row)}
          style={{
            padding: "5px 10px",
            backgroundColor: "#e98d9d",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
          type="button"
          data-bs-toggle="modal"
          data-bs-target="#staticBackdrop"
        >
          View Image
        </button>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },
    {
      name: "Action",
      selector: (row) => {
        return (
          <div className="ms-1 d-flex">
            <p onClick={() => handleEdit(row)} style={{ cursor: "pointer" }}>
              <FaEdit className="me-2" />
            </p>
            <p onClick={() => handleDelete(row)} style={{ cursor: "pointer" }}>
              <RiDeleteBin6Line />
            </p>
          </div>
        );
      },
      sortable: true,
      id: "action",
      width: "100px",
    },
  ];

  const handleEdit = (row) => {
    Navigate(`/editproduct/${row._id}`, { state: { productData: row } });
  };

  const handleDelete = async (row) => {
    try {
      let params = {
        url: "delete-productData",
        method: "POST",
        data: { id: row._id },
      };
      const response = await makeApiRequest(params);
      if (response.status == true) {
        toast.success(response.message);
        setTimeout(() => {
          Navigate("/dashboard/product");
        }, 1000);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast("Something Went Wrong...");
    }
  };

  const handleViewClick = async (row) => {
    const images = row.productimages || [];
    setViewImage(images);
  };

  const handleClose = () => {
    setViewImage([]);
  };

  const customStyles = {
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? "#e98d9d"
        : state.isFocused
          ? "#e3c8cc"
          : null,
      color: state.isSelected ? "white" : "black",
    }),
  };

  const [selectedDescription, setSelectedDescription] = useState("");

  const openModal = (description) => {
    setSelectedDescription(description);
  };

  return (
    <div className="App table-1">
      <ToastContainer />
      <div className="container-fluid">
        <div className="custom-userlist min-vh-100">
          <div className="custom-inside-upload">
            <div className="row mb-3 ">
              <h2 className="fw-bold">Product Details</h2>
              <div className="d-flex justify-content-between align-items-center">
                <div className="col-sm-4 mt-4">
                  <Select
                    options={skinCareOptions}
                    value={selectedOption}
                    onChange={handleSelectSkinCare}
                    placeholder="Select Category"
                    styles={customStyles}
                  />
                </div>
                <div className="col-sm-4 mt-4">
                  <input
                    type="text"
                    className="form-control input-text-2"
                    placeholder="Search Products"
                    value={searchTerm}
                    onChange={handleSearch}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-lg-12">
              <a href="/uploadproduct">
                <button className="liquidity-btn-1">ADD Product</button>
              </a>
              <div className="liquidity-table-1 mt-3">
                <DataTable
                  columns={columnsone}
                  data={filteredProducts}
                  theme="solarized"
                  defaultSortAsc={true}
                  pagination
                  paginationTotalRows={filteredProducts.length}
                  paginationPerPage={rowsPerPage}
                  paginationRowsPerPageOptions={[5, 10, 15, 20]}
                  onChangeRowsPerPage={(newRowsPerPage) =>
                    setRowsPerPage(newRowsPerPage)
                  }
                  onChangePage={handlePageChange}
                  highlightOnHover
                  dense
                />
              </div>
            </div>
          </div>
          <div
            class="modal fade"
            id="staticBackdrop"
            data-bs-backdrop="static"
            data-bs-keyboard="false"
            tabindex="-1"
            aria-labelledby="staticBackdropLabel"
            aria-hidden="true"
          >
            <div class="modal-dialog modal-dialog-centered">
              <div class="modal-content">
                <div class="modal-header">
                  <h1 class="modal-title fs-5" id="staticBackdropLabel">
                    Images
                  </h1>
                  <button
                    type="button"
                    class="btn-close"
                    data-bs-dismiss="modal"
                    aria-label="Close"
                    onClick={handleClose}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="row">
                    {viewImage.map((item, i) => (
                      <div className="col-lg-3" key={i}>
                        {item.media.endsWith(".mp4") ? (
                          <video width="100%" controls>
                            <source src={item.media} type="video/mp4" />
                            Your browser does not support the video tag.
                          </video>
                        ) : (
                          <img
                            src={item.media}
                            width="100%"
                            alt="product-images"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div
            class="modal fade"
            id="staticBackdrop-1"
            data-bs-backdrop="static"
            data-bs-keyboard="false"
            tabindex="-1"
            aria-labelledby="staticBackdropLabel-1"
            aria-hidden="true"
          >
            <div class="modal-dialog">
              <div class="modal-content">
                <div class="modal-header">
                  <h1 class="modal-title fs-5" id="staticBackdropLabel">
                    Product Description
                  </h1>
                  <button
                    type="button"
                    class="btn-close"
                    data-bs-dismiss="modal"
                    aria-label="Close"
                  ></button>
                </div>
                <div class="modal-body text-dark">
                  <div
                    dangerouslySetInnerHTML={{ __html: selectedDescription }}
                  />
                </div>
                <div class="modal-footer text-center justify-content-center">
                  <button
                    type="button"
                    class="liquidity-btn-1"
                    data-bs-dismiss="modal"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Product;
