import { useToast } from "@chakra-ui/react";
import React, { createContext, useContext, useState } from "react";
import api from "../api/api";
import MarketMethod, { UserMarketMethod } from "../api/types/MarketMethod";
import MarketToken from "../api/types/MarketToken";
import Loader from "../components/Loader";
import useInterval from "../hooks/useInterval";
import errorHandler from "../utils/utils";
import { AppContext } from "./AppProvider";

export const MarketContext = createContext<{
	update: () => void;
	tokens?: MarketToken[];
	currencies?: string[];
	methods?: MarketMethod[];
	myMethods?: UserMarketMethod[];
	minAmount?: any;
}>({ update: () => {}, tokens: [], currencies: [] });

export default function MarketProvider({
	children,
}: {
	children: React.ReactElement;
}) {
	const context = useContext(AppContext);
	const toast = useToast();

	const [currencies, setCurrencies] = useState<string[]>();
	const [tokens, setTokens] = useState<MarketToken[]>();
	const [methods, setMethods] = useState<MarketMethod[]>();
	const [myMethods, setMyMethods] = useState<UserMarketMethod[]>();
	const [minAmount, setMinAmount] = useState<any>();

	const update = async () => {
		if (context.props.auth?.profile.is_market_registred) {
			try {
				const data = await api.custom.get(
					"wallet/market/min_amount",
					context.props.auth?.token
				);

				setMinAmount(data.data);
			} catch (error) {
				errorHandler(error, toast);
			}
			try {
				const data = await api.custom.get(
					"wallet/market/tokens",
					context.props.auth?.token
				);

				setTokens(data.tokens);
			} catch (error) {
				errorHandler(error, toast);
			}

			try {
				const data = await api.custom.get(
					"wallet/market/methods",
					context.props.auth?.token
				);

				setMethods(data.methods);
			} catch (error) {
				errorHandler(error, toast);
			}

			try {
				const data = await api.custom.get(
					"wallet/market/my_methods",
					context.props.auth?.token
				);

				setMyMethods(data.methods);
			} catch (error) {
				errorHandler(error, toast);
			}
		}
		try {
			const data = await api.custom.get(
				"wallet/market/currencies",
				context.props.auth?.token
			);

			setCurrencies(data.currencies);
		} catch (error) {
			errorHandler(error, toast);
		}
	};

	useInterval(() => {
		update();
	}, 30000);

	return (
		<MarketContext.Provider
			value={{ update, currencies, tokens, methods, myMethods, minAmount }}
		>
			{currencies ? children : <Loader />}
		</MarketContext.Provider>
	);
}
