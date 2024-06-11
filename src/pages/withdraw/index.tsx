import { Heading, Image, Stack, useToast } from "@chakra-ui/react";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/api";
import Balance from "../../api/types/Balance";
import Rate from "../../api/types/Rate";
import Cell from "../../components/Cell";
import { AppContext } from "../../providers/AppProvider";
import { getTelegram } from "../../utils";
import { getCacheItemJSON, setCacheItem } from "../../utils/cache";
import errorHandler from "../../utils/utils";

function WithdrawToken() {
	const context = useContext(AppContext);
	const toast = useToast();
	const navigate = useNavigate();

	const [balances, setBalances] = useState<Balance[]>(
		getCacheItemJSON("balances") || []
	);
	const [rates, setRates] = useState<Rate[]>(getCacheItemJSON("rates") || []);

	useEffect(() => {
		const getBalances = async () => {
			try {
				const data = await api.wallet.balances.list(
					context.props.auth?.token || ""
				);
				setBalances(data.balances);
				setCacheItem("balances", JSON.stringify(data.balances));
				try {
					const rates = await api.wallet.getRates(
						data.balances.map(e => e.contract),
						context.props.auth?.token || ""
					);
					setRates(rates.rates);
					setCacheItem("rates", JSON.stringify(rates.rates));
				} catch (error) {
					errorHandler(error, toast);
				}
			} catch (error) {
				errorHandler(error, toast);
			}
		};

		getBalances();

		const onBack = () => {
			navigate("/");
		};

		getTelegram().BackButton.onClick(onBack);
		getTelegram().BackButton.show();

		return () => {
			getTelegram().BackButton.offClick(onBack);
			getTelegram().BackButton.hide();
		};
	}, []);

	return (
		<Stack direction={"column"} spacing={2}>
			<Heading
				size={"sm"}
				color={getTelegram().themeParams.hint_color}
				textTransform={"uppercase"}
			>
				Withdraw Asset
			</Heading>

			{balances.map((e, key) => (
				<Cell
					icon={
						<Image
							borderRadius={"999px"}
							width={"40px"}
							height={"40px"}
							src={e.image}
						/>
					}
					title={e.name}
					subTitle={e.symbol}
					onClick={() => navigate(`/withdraw/${e.contract}`)}
				/>
			))}
		</Stack>
	);
}

export default WithdrawToken;
