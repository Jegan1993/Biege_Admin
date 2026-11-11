
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "react-toastify/dist/ReactToastify.css";

// Authentication
import Login from "./Seperate/Login";
import Forgetpassword from "./Seperate/Forgetpassword";
import Resetpassword from "./Seperate/Resetpassword";
import Otp from "./Seperate/Otp";

// Dashboard
import SideBar from "./Seperate/SideBar";
import ProtectedRoute from "./Auth/ProtectedRoute";

function App() {
  return (
    <div className="App">
      <BrowserRouter>

        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/forgetpassword" element={<Forgetpassword />} />
          <Route path="/resetpassword/:token" element={<Resetpassword />} />
          <Route path="/otp" element={<Otp />} />

          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <SideBar />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
