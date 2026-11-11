import React, { useEffect, useState } from "react";
import "../Assets/css/sign.css";
import frame2 from "../Assets/images/mobile-login.png";
import { BsFillEyeFill, BsFillEyeSlashFill } from "react-icons/bs";
import Profile from "../Assets/images/profile.png";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { makeApiRequest } from "../AxiosServices/apiCall";

function Login() {
  const year = new Date().getFullYear();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [socialMediaLinks, setSocialMediaLinks] = useState([]);
  const [sitename, setSitename] = useState([]);
  const [siteyear, setSiteyear] = useState([]);

  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  async function handleLoginSubmit(event) {
    event.preventDefault();
    const validationErrors = {};

    try {
      if (!email) {
        validationErrors.email = "Email is required";
      } else if (!isValidEmail(email)) {
        validationErrors.email = "Invalid email format";
      }

      if (!password) {
        validationErrors.password = "Password is required";
      }
      setLoginError(validationErrors);

      if (Object.keys(validationErrors).length > 0) {
        setLoginError(validationErrors);
      } else {
        let payload = {
          email,
          password,
          // ipAddress
        };

        let params = {
          url: `admin-login`,
          method: "POST",
          data: payload,
        };
        const response = await makeApiRequest(params);

        if (response.data && response.data.email) {
          const email = response.data.email;
          const token = response.token;
          localStorage.setItem("email", email);
          localStorage.setItem("token", token);
        }
        const gettoken = localStorage.getItem("token");

        if (response.status == true) {
          toast.success(response.message);
          setTimeout(() => {
            {
              gettoken ? navigate("/view-subadmin") : navigate("/");
            }
          }, 1000);
        } else {
          toast.warn(response.message);
        }
      }
    } catch (error) {
      console.log(error);
      if (error.response) {
        const { data } = error.response;
        if (data) {
          toast.error(data);
        } else {
          toast.error("An error occurred while processing your request.");
        }
      } else {
        toast.error("An unexpected error occurred.");
      }
    }
  }

  const isValidEmail = (email) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const isValidPassword = (password) => {
    return /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!#%*?&.,])[A-Za-z\d@$#!%*?&,.]{8,}$/.test(
      password,
    );
  };
  useEffect(() => {
    const fetchSocialMediaLinks = async () => {
      try {
        let params = {
          url: `siteAddress`,
          method: "GET",
        };
        let response = await makeApiRequest(params);
        if (response) {
          setSitename(response.data[0].siteName);
          setSiteyear(response.data[0].siteYear);
          console.log("responseso", response.data.siteyear);
        }
      } catch (error) {
        console.error("Error fetching social media links:", error);
      }
    };

    fetchSocialMediaLinks();
  }, []);

  return (
    <>
      <ToastContainer />
      <div className="App">
        <div className="container-fluid">
          <div className="custom-sign min-vh-100">
            <div className="row">
              <div className="col-lg-12">
                <div className="row align-items-center">
                  <div className="col-lg-6 animi">
                    <div className="custom-sign-right">
                      <img
                        src={frame2}
                        class="animated-image"
                        alt="Animated Image"
                      ></img>
                    </div>
                  </div>
                  <div className="col-lg-5">
                    <div className="custom-inside-sign">
                      <div className="text-center">
                        <img style={{ width: "50px" }} src={Profile}></img>
                        <p className="fw-bold">Login</p>
                      </div>
                      <form>
                        <div class="mb-3">
                          <label
                            for="exampleInputEmail1"
                            class="form-label fw-bold"
                          >
                            Email
                          </label>
                          <input
                            type="email"
                            class="form-control custom-input"
                            id="exampleInputEmail1"
                            aria-describedby="emailHelp"
                            placeholder="Example@email.com"
                            value={email}
                            onChange={(e) => {
                              setEmail(e.target.value);
                              setLoginError((prevErrors) => ({
                                ...prevErrors,
                                email: "",
                              }));
                            }}
                          />
                          <span style={{ color: "red" }}>
                            {" "}
                            {loginError.email && <p>{loginError.email}</p>}
                          </span>
                        </div>
                        <div className="mb-3 position-relative">
                          <label
                            htmlFor="exampleInputPassword1"
                            className="form-label fw-bold"
                          >
                            Password
                          </label>
                          <input
                            type={showPassword ? "text" : "password"}
                            className="form-control custom-input"
                            id="exampleInputPassword1"
                            placeholder="At least 8 characters"
                            value={password}
                            onChange={(e) => {
                              setPassword(e.target.value);
                              setLoginError((prevErrors) => ({
                                ...prevErrors,
                                email: "",
                              }));
                            }}
                          />
                          <span
                            onClick={togglePasswordVisibility}
                            className="position-absolute"
                            style={{
                              right: "10px",
                              top: "39px",
                              cursor: "pointer",
                            }}
                          >
                            {showPassword ? (
                              <BsFillEyeFill />
                            ) : (
                              <BsFillEyeSlashFill />
                            )}
                          </span>
                          <span style={{ color: "red" }}>
                            {" "}
                            {loginError.password && (
                              <p>{loginError.password}</p>
                            )}
                          </span>
                        </div>
                        <div className="text-end">
                          <Link to="/forgetpassword">
                            <p className="costom-forgot-color">
                              Forgot Password?
                            </p>
                          </Link>
                        </div>
                        <div className="text-center w-100">
                          <button
                            type="submit"
                            class="custom-sign-btn w-100"
                            onClick={handleLoginSubmit}
                          >
                            Submit
                          </button>
                        </div>

                        <div className="text-center">
                          <p>@ {sitename + -siteyear} ALL RIGHTS RESERVED</p>
                        </div>
                      </form>
                      <div>{/* <Darklight/> */}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;
