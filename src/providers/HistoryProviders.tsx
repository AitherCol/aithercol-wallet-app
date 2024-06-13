import React, { createContext } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

export const HistoryContext = createContext<{
	back: () => void;
	push: (location: string, back?: boolean, prev?: string) => void;
}>({ back() {}, push(location) {} });

export function HistoryProvider({
	children,
}: {
	children: React.ReactElement;
}) {
	const navigate = useNavigate();
	const [query] = useSearchParams();
	const currentLocation = useLocation();

	const push = (location: string, back?: boolean, prev?: string) => {
		let queryString = "";

		let history = query.get("history")?.split(".") || [];
		if (history.length === 0) {
			history.push(currentLocation.pathname.split("#")[0]);
		}
		if (back) {
			history.pop();
		} else {
			if (prev) {
				history.push(prev.split("#")[0]);
			}
			history.push(location.split("#")[0]);
		}
		queryString = `?history=${history.join(".")}`;

		navigate(location.split("#")[0] + `${queryString}${window.location.hash}`);
	};
	const back = () => {
		const historyString = query.get("history");
		if (historyString) {
			const history = historyString.split(".");
			if (history.length >= 2) {
				push(history[history.length - 2], true);
				return;
			}
		}
		navigate("/");
	};

	return (
		<HistoryContext.Provider value={{ back, push }}>
			{children}
		</HistoryContext.Provider>
	);
}
