import { Heading, Image, Stack, useToast } from "@chakra-ui/react";
import {
	BackButton,
	useHapticFeedback,
} from "@vkruglikov/react-telegram-web-app";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/api";
import Balance from "../../api/types/Balance";
import Cell from "../../components/Cell";
import { AppContext } from "../../providers/AppProvider";
import { getTelegram } from "../../utils";
import { getCacheItemJSON, setCacheItem } from "../../utils/cache";
import errorHandler from "../../utils/utils";

function WithdrawToken() {
	const context = useContext(AppContext);
	const toast = useToast();
	const navigate = useNavigate();
	const [impactOccurred, notificationOccurred, selectionChanged] =
		useHapticFeedback();

	const [balances, setBalances] = useState<Balance[]>(
		getCacheItemJSON("balances") || []
	);

	useEffect(() => {
		const getBalances = async () => {
			try {
				const data = await api.wallet.balances.list(
					context.props.auth?.token || ""
				);
				setBalances(data.balances);
				setCacheItem("balances", JSON.stringify(data.balances));
			} catch (error) {
				errorHandler(error, toast);
				notificationOccurred("error");
			}
		};

		getBalances();
	}, []);

	return (
		<Stack direction={"column"} spacing={2}>
			<BackButton onClick={() => navigate("/")} />
			<Heading
				size={"sm"}
				color={getTelegram().themeParams.hint_color}
				textTransform={"uppercase"}
			>
				Choose Token
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
