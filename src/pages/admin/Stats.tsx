import { Heading, Stack, useToast } from "@chakra-ui/react";
import { useHapticFeedback } from "@vkruglikov/react-telegram-web-app";
import { useContext, useState } from "react";
import api from "../../api/api";
import CustomBackButton from "../../components/CustomBackButton";
import InfoRawCell from "../../components/InfoRawCell";
import useInterval from "../../hooks/useInterval";
import { AppContext } from "../../providers/AppProvider";
import { getTelegram } from "../../utils";
import errorHandler from "../../utils/utils";

export default function Stats() {
	const context = useContext(AppContext);
	const [stats, setStats] = useState<any>();
	const toast = useToast();
	const { 1: notificationOccurred } = useHapticFeedback();

	useInterval(async () => {
		try {
			const data = await api.custom.get(
				"admin/stats",
				context.props.auth?.token
			);
			setStats(data.stats);
		} catch (error) {
			errorHandler(error, toast);
			notificationOccurred("error");
		}
	}, 10000);
	return (
		<Stack direction={"column"} spacing={2}>
			<CustomBackButton />

			<Heading
				size={"sm"}
				color={getTelegram().themeParams.hint_color}
				textTransform={"uppercase"}
			>
				Stats
			</Heading>

			{stats && (
				<>
					<InfoRawCell title="Wallets" value={stats.wallets.toString()} />
					<InfoRawCell
						title="Today Transactions (+)"
						value={stats.todayIncreaseTransactions.toString()}
					/>
					<InfoRawCell
						title="Today Transactions (-)"
						value={stats.todayDecreaseTransactions.toString()}
					/>
					<InfoRawCell
						title="Yesterday Transactions (+)"
						value={stats.yesterdayIncreaseTransactions.toString()}
					/>
					<InfoRawCell
						title="Yesterday Transactions (-)"
						value={stats.yesterdayDecreaseTransactions.toString()}
					/>
				</>
			)}
		</Stack>
	);
}
