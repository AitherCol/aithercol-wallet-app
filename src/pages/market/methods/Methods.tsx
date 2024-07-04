import { Center, Heading, Link, Stack, Text } from "@chakra-ui/react";
import { useContext } from "react";
import Cell from "../../../components/Cell";
import CellButton from "../../../components/CellButton";
import CustomBackButton from "../../../components/CustomBackButton";
import { AppContext } from "../../../providers/AppProvider";
import { HistoryContext } from "../../../providers/HistoryProviders";
import { MarketContext } from "../../../providers/MarketProvider";
import { getTelegram } from "../../../utils";
import { getMethodName } from "../../../utils/utils";

export default function MarketMethods() {
	const context = useContext(AppContext);
	const router = useContext(HistoryContext);
	const market = useContext(MarketContext);

	const getMethod = (id: number) => {
		return market.methods?.find(e => id === e.id);
	};

	return (
		<Stack direction={"column"} spacing={2}>
			<CustomBackButton />

			<Heading
				size={"sm"}
				color={getTelegram().themeParams.hint_color}
				textTransform={"uppercase"}
			>
				{context.getTranslation("Payment Methods")}
			</Heading>

			{(market.myMethods?.length === 0 && (
				<Center>
					<Stack
						alignItems={"center"}
						textAlign={"center"}
						direction={"column"}
						spacing={2}
					>
						<Heading>{context.getTranslation("No Methods Yet")}</Heading>
						<Text>
							{context.getTranslation("You haven't added any payment methods")}
						</Text>
						<Link
							onClick={() => router.push("/market/profile/methods/new")}
							color={getTelegram().themeParams.link_color}
						>
							{context.getTranslation("Add Payment Method")}
						</Link>
					</Stack>
				</Center>
			)) || (
				<>
					<CellButton
						title={context.getTranslation("Add Payment Method")}
						onClick={() => router.push("/market/profile/methods/new")}
					/>

					{market.myMethods?.map(method => (
						<Cell
							title={method.name}
							subTitle={`${getMethodName(
								getMethod(method.method_id) as any,
								context
							)} • ${getMethod(method.method_id)?.currency}`}
							onClick={() =>
								router.push(`/market/profile/methods/${method.id}`)
							}
						/>
					))}
				</>
			)}
		</Stack>
	);
}
