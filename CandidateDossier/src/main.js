import { React } from "./lib/react.js";
import { createRoot } from "https://esm.sh/react-dom@18.3.1/client";
import { App } from "./app.js";

const container = document.getElementById("root");
const root = createRoot(container);

root.render(React.createElement(App));
