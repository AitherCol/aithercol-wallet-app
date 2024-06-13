import { Heading, Stack, useToast } from "@chakra-ui/react";
import { useHapticFeedback } from "@vkruglikov/react-telegram-web-app";
import { useContext } from "react";
import { LazyLoadImage } from "react-lazy-load-image-component";
import Cell from "../../components/Cell";
import CustomBackButton from "../../components/CustomBackButton";
import { AppContext } from "../../providers/AppProvider";
import { HistoryContext } from "../../providers/HistoryProviders";
import { getTelegram } from "../../utils";

function WithdrawToken() {
	const context = useContext(AppContext);
	const toast = useToast();
	const router = useContext(HistoryContext);
	const navigate = router.push;
	const [impactOccurred, notificationOccurred, selectionChanged] =
		useHapticFeedback();

	return (
		<Stack direction={"column"} spacing={2}>
			<CustomBackButton />
			<Heading
				size={"sm"}
				color={getTelegram().themeParams.hint_color}
				textTransform={"uppercase"}
			>
				{context.getTranslation("choose_token")}
			</Heading>

			{context.balances.map((e, key) => (
				<Cell
					icon={
						<LazyLoadImage
							style={{ borderRadius: "999px" }}
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
