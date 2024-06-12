import { useToast } from "@chakra-ui/react";
import { useHapticFeedback } from "@vkruglikov/react-telegram-web-app";
import {
	createContext,
	Dispatch,
	ReactNode,
	SetStateAction,
	useState,
} from "react";
import api from "../api/api";
import Balance from "../api/types/Balance";
import Rate from "../api/types/Rate";
import User from "../api/types/User";
import Wallet from "../api/types/Wallet";
import useInterval from "../hooks/useInterval";
import { getCacheItemJSON, setCacheItem } from "../utils/cache";
import errorHandler from "../utils/utils";

export type AppContextType = {
	props: PropsType;
	setProps?: Dispatch<SetStateAction<PropsType>>;
	wallet: Wallet | undefined;
	balances: Balance[];
	rates: Rate[];
	update: () => void;
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
	balances: [],
	rates: [],
	wallet: undefined,
	update() {},
});

export default function AppProvider({ children }: { children: ReactNode }) {
	const [props, setProps] = useState<PropsType>({
		auth: null,
		network: "mainnet",
	});
	const [wallet, setWallet] = useState<Wallet>(getCacheItemJSON("wallet"));
	const [balances, setBalances] = useState<Balance[]>(
		getCacheItemJSON("balances")
	);
	const [rates, setRates] = useState<Rate[]>(getCacheItemJSON("rates") || []);
	const [impactOccurred, notificationOccurred] = useHapticFeedback();
	const toast = useToast();

	const update = async () => {
		if (!props.auth) {
			return;
		}
		try {
			const data = await api.wallet.get(props.auth?.token || "");
			setWallet(data.wallet);
			setCacheItem("wallet", JSON.stringify(data.wallet));
		} catch (error) {
			errorHandler(error, toast);
			notificationOccurred("error");
		}
		try {
			const data = await api.wallet.balances.list(props.auth?.token || "");
			setBalances(data.balances);
			setCacheItem("balances", JSON.stringify(data.balances));
			try {
				const rates = await api.wallet.getRates(
					data.balances.map(e => e.contract),
					props.auth?.token || ""
				);
				setRates(rates.rates);
				setCacheItem("rates", JSON.stringify(rates.rates));
			} catch (error) {
				errorHandler(error, toast);
				notificationOccurred("error");
			}
		} catch (error) {
			errorHandler(error, toast);
			notificationOccurred("error");
		}
	};

	useInterval(() => {
		update();
	}, 60000);

	return (
		<AppContext.Provider
			value={{ props, setProps, wallet, balances, rates, update }}
		>
			{children}
		</AppContext.Provider>
	);
}

export { AppContext };
