import { ChakraProvider } from "@chakra-ui/react";
import ReactDOM from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import App from "./App";
import AppProvider from "./providers/AppProvider";
import reportWebVitals from "./reportWebVitals";
import theme from "./theme";

const root = ReactDOM.createRoot(
	document.getElementById("root") as HTMLElement
);
root.render(
	<ChakraProvider
		toastOptions={{ defaultOptions: { position: "top" } }}
		theme={theme}
	>
		<AppProvider>
			<MemoryRouter>
				<App />
			</MemoryRouter>
		</AppProvider>
	</ChakraProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
