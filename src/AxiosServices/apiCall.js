import axios from "axios";
import config from "./config";

export const makeApiRequest = async (params) => {
  try {
    let headerContentType = "application/json";
    if (params.header == "image") {
      headerContentType = "multipart/form-data";
    }
    let getToken = localStorage.getItem("token");
    const token = getToken != null ? getToken : "";
    const headers = {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": headerContentType,
      "Access-Control-Allow-Headers": "*",
      Authorization: `Bearer ${token}`,
    };
    let response;
    switch (params.method.toUpperCase()) {
      case "GET":
        response = await axios.get(`${config.adminBackendUrl}${params.url}`, {
          headers,
        });
        break;
      case "POST":
        response = await axios.post(
          `${config.adminBackendUrl}${params.url}`,
          params.data,
          { headers },
        );
        break;
      case "PUT":
        response = await axios.put(
          `${config.adminBackendUrl}${params.url}`,
          params.data,
          { headers },
        );
        break;
      case "DELETE":
        response = await axios.delete(
          `${config.adminBackendUrl}${params.url}`,
          { headers },
        );
        break;
      default:
        throw new Error(`Unsupported method: ${params.method}`);
    }
    return response.data;
  } catch (error) {
    console.log("axios error", error);
    throw error;
  }
};
