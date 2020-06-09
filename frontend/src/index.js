import React from "react";
import ReactDOM from "react-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import ScopedCssBaseline from "@material-ui/core/ScopedCssBaseline";

import App from "./App";

ReactDOM.render(
	<React.StrictMode>
		<ScopedCssBaseline>
			<App />
		</ScopedCssBaseline>
	</React.StrictMode>,
	document.getElementById("root")
);
