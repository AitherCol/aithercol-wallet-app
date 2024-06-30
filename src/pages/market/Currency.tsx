import { Heading, Stack, useBoolean, useToast } from "@chakra-ui/react";
import { useHapticFeedback } from "@vkruglikov/react-telegram-web-app";
import { useContext } from "react";
import api from "../../api/api";
import Cell from "../../components/Cell";
import CustomBackButton from "../../components/CustomBackButton";
import Loader from "../../components/Loader";
import { AppContext } from "../../providers/AppProvider";
import { HistoryContext } from "../../providers/HistoryProviders";
import { MarketContext } from "../../providers/MarketProvider";
import { getTelegram } from "../../utils";
import errorHandler from "../../utils/utils";

export default function MarketCurrency() {
	const context = useContext(AppContext);
	const market = useContext(MarketContext);
	const router = useContext(HistoryContext);
	const toast = useToast();
	const { 1: notificationOccurred } = useHapticFeedback();

	const [loading, setLoading] = useBoolean();

	return !loading ? (
		<Stack direction={"column"} spacing={2}>
			<CustomBackButton />

			<Heading
				size={"sm"}
				color={getTelegram().themeParams.hint_color}
				textTransform={"uppercase"}
			>
				{context.getTranslation("Choose currency")}
			</Heading>

			{market.currencies?.map(e => (
				<Cell
					title={e}
					onClick={async () => {
						try {
							setLoading.on();
							if (context.props.auth?.profile.is_market_registred) {
								// @TODO: Change currency
								await context.updateProfile();
							} else {
								await api.custom.post(
									"wallet/market/register",
									context.props.auth?.token,
									{ currency: e }
								);
								await context.updateProfile();
							}
							router.back();
						} catch (error) {
							errorHandler(error, toast);
							notificationOccurred("error");
						} finally {
							setLoading.off();
						}
					}}
				/>
			))}
		</Stack>
	) : (
		<Loader />
	);
}
