import React from "react";
import { createRoot } from "react-dom/client";
import CssBaseline from "@material-ui/core/CssBaseline";

import App from "./App";

const container = document.getElementById("root");
const root = createRoot(container);

root.render(
	<CssBaseline>
		<App />
	</CssBaseline>
);

// Para StrictMode (opcional):
// root.render(
// 	<React.StrictMode>
// 		<CssBaseline>
// 			<App />
// 		</CssBaseline>
//   </React.StrictMode>
// );
