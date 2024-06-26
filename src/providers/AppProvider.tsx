import { useToast } from "@chakra-ui/react";
import { useHapticFeedback } from "@vkruglikov/react-telegram-web-app";
import moment from "moment";
import "moment/locale/ru";
import {
	createContext,
	Dispatch,
	ReactNode,
	SetStateAction,
	useEffect,
	useState,
} from "react";
import api from "../api/api";
import Balance from "../api/types/Balance";
import Check from "../api/types/Check";
import Rate from "../api/types/Rate";
import User from "../api/types/User";
import Wallet from "../api/types/Wallet";
import useInterval from "../hooks/useInterval";
import enTranslation from "../translation/en";
import ruTranslation from "../translation/ru";
import errorHandler from "../utils/utils";

export type AppContextType = {
	props: PropsType;
	setProps?: Dispatch<SetStateAction<PropsType>>;
	wallet: Wallet | undefined;
	balances: Balance[];
	rates: Rate[];
	checks: Check[];
	update: () => void;
	getTranslation: (key: string, language?: string) => string;
	updateProfile: () => void;
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
	checks: [],
	update() {},
	getTranslation(key) {
		return key;
	},
	updateProfile() {},
});

export default function AppProvider({ children }: { children: ReactNode }) {
	const [props, setProps] = useState<PropsType>({
		auth: null,
		network: "mainnet",
	});
	const [wallet, setWallet] = useState<Wallet>();
	const [balances, setBalances] = useState<Balance[]>();
	const [rates, setRates] = useState<Rate[]>();
	const [checks, setChecks] = useState<Check[]>();
	const [impactOccurred, notificationOccurred] = useHapticFeedback();
	const toast = useToast();

	const updateProfile = async () => {
		try {
			const profile = await api.auth.getProfile(props.auth?.token || "");
			if (profile) {
				setProps({
					...props,
					auth: { profile, token: props.auth?.token || "" },
				});
			}
		} catch (error) {
			errorHandler(error, toast);
		}
	};

	const update = async () => {
		if (!props.auth) {
			return;
		}
		try {
			const data = await api.wallet.get(props.auth?.token || "");
			setWallet(data.wallet);
		} catch (error) {
			errorHandler(error, toast);
			notificationOccurred("error");
		}
		try {
			const data = await api.wallet.balances.list(props.auth?.token || "");
			setBalances(data.balances);

			try {
				const rates = await api.wallet.getRates(
					data.balances.map(e => e.contract),
					props.auth?.token || ""
				);
				setRates(rates.rates);
			} catch (error) {
				errorHandler(error, toast);
				notificationOccurred("error");
			}

			try {
				const checks = await api.wallet.checks.list(props.auth?.token || "");
				setChecks(checks.checks);
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

	useEffect(() => {
		update();
		moment.locale(props.auth?.profile.language || "en");
	}, [props.auth]);

	return (
		<AppContext.Provider
			value={{
				props,
				setProps,
				wallet,
				balances: balances as any,
				rates: rates as any,
				update,
				checks: checks as any,
				updateProfile,
				getTranslation(key, languageOverride) {
					const language =
						languageOverride || props.auth?.profile.language || "en";
					const keys = [key];
					const translation = language === "en" ? enTranslation : ruTranslation;

					let result: any = translation;
					for (const k of keys) {
						if (result === undefined || result === null) {
							if (language !== "en") {
								return this.getTranslation(key, "en");
							} else {
								return key;
							}
						}
						result = result[k];
					}

					if (!result) {
						if (language !== "en") {
							return this.getTranslation(key, "en");
						} else {
							return key;
						}
					}

					return result as string;
				},
			}}
		>
			{children}
		</AppContext.Provider>
	);
}

export { AppContext };
