import { Heading, Image, Stack } from "@chakra-ui/react";
import { useHapticFeedback } from "@vkruglikov/react-telegram-web-app";
import { useContext } from "react";
import Cell from "../../components/Cell";
import CustomBackButton from "../../components/CustomBackButton";
import { AppContext } from "../../providers/AppProvider";
import { HistoryContext } from "../../providers/HistoryProviders";
import { getTelegram } from "../../utils";

function BalancesToExchange() {
	const context = useContext(AppContext);
	const router = useContext(HistoryContext);
	const navigate = router.push;
	const [impactOccurred, notificationOccurred, selectionChanged] =
		useHapticFeedback();

	const getRate = (contract: string) => {
		const rate = context.rates.find(e => e.contract === contract);
		return rate?.price || 0;
	};

	return (
		<Stack direction={"column"} spacing={2}>
			<CustomBackButton />
			<Heading
				size={"sm"}
				color={getTelegram().themeParams.hint_color}
				textTransform={"uppercase"}
			>
				Choose Token
			</Heading>

			{context.balances
				.filter(e => {
					if (getRate(e.contract) > 0) {
						return true;
					}

					return false;
				})
				.map(e => (
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
						onClick={() => navigate(`/exchange/pool/${e.contract}`)}
					/>
				))}
		</Stack>
	);
}

export default BalancesToExchange;
