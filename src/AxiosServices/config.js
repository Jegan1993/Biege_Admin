let config = {};
let environment = "local";
if (environment == "local") {
  config = {
    adminBackendUrl: "/admin/",
  };
} else {
  config = {
    adminBackendUrl: "https://new-me.in/admin/",
  };
}
export default config;


