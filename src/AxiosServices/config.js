// let config = {};
// let environment = "local";
// if (environment == "local") {
//   config = {
//     // adminBackendUrl: "http://localhost:3003/admin/",
//     adminBackendUrl: "https://uncle-disjoin-chewable.ngrok-free.dev/admin/"
//   };
// } else {
//   config = {
//     adminBackendUrl: "https://new-me.in/admin/",
//   };
// }
// export default config;


let config = {};
let environment = "local";

if (environment === "local") {
  config = {
    adminBackendUrl: "/admin/",
  };
} else {
  config = {
    adminBackendUrl: "https://new-me.in/admin/",
  };
}

export default config;