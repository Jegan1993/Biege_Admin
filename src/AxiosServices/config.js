let config = {};
let environment = "local";
if (environment == "local") {
  config = {
    adminBackendUrl: "http://localhost:3003/admin/",
  };
} else {
  config = {
    adminBackendUrl: "https://new-me.in/admin/",
  };
}
export default config;
