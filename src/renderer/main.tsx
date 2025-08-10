import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./main.css";
declare global {
  interface Window {
    api?: any;
  }
}

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Failed to find the root element");

const root = ReactDOM.createRoot(rootElement);
root.render(
  <>
    <App />
  </>
);
