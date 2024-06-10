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
};

const AppContext = createContext<AppContextType>({
	props: {
		auth: null,
	},
});

export default function AppProvider({ children }: { children: ReactNode }) {
	const [props, setProps] = useState<PropsType>({
		auth: null,
	});

	return (
		<AppContext.Provider value={{ props, setProps }}>
			{children}
		</AppContext.Provider>
	);
}

export { AppContext };
