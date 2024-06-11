import {
	createContext,
	Dispatch,
	ReactNode,
	SetStateAction,
	useState,
} from "react";
import User from "../api/types/User";

export type AppContextType = {
	props: PropsType;
	setProps?: Dispatch<SetStateAction<PropsType>>;
};

export type PropsType = {
	auth: {
		token: string;
		profile: User;
	} | null;
	network: "mainnet" | "testnet";
};

const AppContext = createContext<AppContextType>({
	props: {
		auth: null,
		network: "mainnet",
	},
});

export default function AppProvider({ children }: { children: ReactNode }) {
	const [props, setProps] = useState<PropsType>({
		auth: null,
		network: "mainnet",
	});

	return (
		<AppContext.Provider value={{ props, setProps }}>
			{children}
		</AppContext.Provider>
	);
}

export { AppContext };
