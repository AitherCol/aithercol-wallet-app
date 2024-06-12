import React, { createContext } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

export const HistoryContext = createContext<{
	back: () => void;
	push: (location: string) => void;
}>({ back() {}, push(location) {} });

export function HistoryProvider({
	children,
}: {
	children: React.ReactElement;
}) {
	const navigate = useNavigate();
	const [query] = useSearchParams();
	const currentLocation = useLocation();

	const push = (location: string, ignore?: boolean) => {
		navigate(
			location +
				`${!ignore ? `?back=${currentLocation.pathname}` : ""}${
					window.location.hash
				}`
		);
	};
	const back = () => {
		const back = query.get("back");
		if (back) {
			push(back.split("#")[0], true);
		}
	};

	return (
		<HistoryContext.Provider value={{ back, push }}>
			{children}
		</HistoryContext.Provider>
	);
}
