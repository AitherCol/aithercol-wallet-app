import React, { createContext, useState } from "react";
import { useNavigate } from "react-router-dom";

export const HistoryContext = createContext<{
	history: string[];
	back: () => void;
	push: (location: string) => void;
}>({ history: [], back() {}, push(location) {} });

export function HistoryProvider({
	children,
}: {
	children: React.ReactElement;
}) {
	const [history, setHistory] = useState<string[]>(["/"]);
	const navigate = useNavigate();

	const push = (location: string) => {
		navigate(location);
		setHistory([...history, location]);
	};
	const back = () => {
		if (history.length >= 2) {
			const prevUrl = history[history.length - 2];
			let array = history;
			array.pop();
			setHistory(array);
			navigate(prevUrl);
		}
	};

	return (
		<HistoryContext.Provider value={{ history, back, push }}>
			{children}
		</HistoryContext.Provider>
	);
}
