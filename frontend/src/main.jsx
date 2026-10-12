import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";
import TeacherLogin from "./pages/TeacherLogin";
import TeacherDashboard from "./pages/TeacherDashboard";

import "./index.css";

const path = window.location.pathname;

let Page;

if (path === "/teacher-login") {

  Page = TeacherLogin;

} else if (path === "/teacher-dashboard") {

  Page = TeacherDashboard;

} else {

  Page = App;

}

ReactDOM.createRoot(
  document.getElementById("root")
).render(
  <React.StrictMode>
    <Page />
  </React.StrictMode>
);