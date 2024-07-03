import { Heading, Stack } from "@chakra-ui/react";
import { useContext } from "react";
import Cell from "../../../components/Cell";
import CellButton from "../../../components/CellButton";
import CustomBackButton from "../../../components/CustomBackButton";
import { AppContext } from "../../../providers/AppProvider";
import { HistoryContext } from "../../../providers/HistoryProviders";
import { MarketContext } from "../../../providers/MarketProvider";
import { getTelegram } from "../../../utils";

function SelectMethod() {
	const context = useContext(AppContext);
	const router = useContext(HistoryContext);
	const market = useContext(MarketContext);

	return (
		<Stack direction={"column"} spacing={2}>
			<CustomBackButton />

			<Heading
				size={"sm"}
				color={getTelegram().themeParams.hint_color}
				textTransform={"uppercase"}
			>
				{context.getTranslation("Select Payment Method")}
			</Heading>

			<CellButton
				title={context.props.auth?.profile.market_currency || ""}
				onClick={() => router.push("/market/currency")}
			/>

			{market.methods
				?.filter(
					e => e.currency === context.props.auth?.profile.market_currency
				)
				.map(method => (
					<Cell
						title={
							context.props.auth?.profile.language === "ru"
								? method.name_ru || method.name_en
								: method.name_en
						}
						onClick={() =>
							router.push(`/market/profile/methods/new/${method.id}`)
						}
					/>
				))}
		</Stack>
	);
}

export default SelectMethod;
