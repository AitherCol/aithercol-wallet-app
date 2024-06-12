import { ChakraProvider } from "@chakra-ui/react";
import { WebAppProvider } from "@vkruglikov/react-telegram-web-app";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import AppProvider from "./providers/AppProvider";
import { HistoryProvider } from "./providers/HistoryProviders";
import reportWebVitals from "./reportWebVitals";
import theme from "./theme";

const root = ReactDOM.createRoot(
	document.getElementById("root") as HTMLElement
);
root.render(
	<WebAppProvider options={{ smoothButtonsTransition: true }}>
		<ChakraProvider
			toastOptions={{ defaultOptions: { position: "top", duration: 3000 } }}
			theme={theme}
		>
			<AppProvider>
				<BrowserRouter>
					<HistoryProvider>
						<App />
					</HistoryProvider>
				</BrowserRouter>
			</AppProvider>
		</ChakraProvider>
	</WebAppProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
