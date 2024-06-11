import React, { createContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export const HistoryContext = createContext<{
	history: string[];
	back: () => void;
}>({ history: [], back() {} });

export function HistoryProvider({
	children,
}: {
	children: React.ReactElement;
}) {
	const [history, setHistory] = useState<string[]>([]);
	const location = useLocation();
	const navigate = useNavigate();

	const push = (location: string) => setHistory([...history, location]);
	const back = () => {
		if (history.length !== 0) {
			navigate(history[history.length - 1]);
		}
	};

	useEffect(() => {
		push(location.pathname);
	}, [location]);

	return (
		<HistoryContext.Provider value={{ history, back }}>
			{children}
		</HistoryContext.Provider>
	);
}
