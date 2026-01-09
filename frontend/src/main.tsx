import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import App from "./app/App.tsx";
import './styles/theme.css';

import "./styles/index.css";


ReactDOM.createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);