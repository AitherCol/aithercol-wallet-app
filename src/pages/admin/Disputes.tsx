import { Button, Heading, Stack, useBoolean, useToast } from "@chakra-ui/react";
import { useHapticFeedback } from "@vkruglikov/react-telegram-web-app";
import { useContext, useEffect, useState } from "react";
import api from "../../api/api";
import { PaginationMeta } from "../../api/types/BasicResponse";
import Deal from "../../api/types/Deal";
import CellButton from "../../components/CellButton";
import CustomBackButton from "../../components/CustomBackButton";
import { AppContext } from "../../providers/AppProvider";
import { HistoryContext } from "../../providers/HistoryProviders";
import { getTelegram } from "../../utils";
import errorHandler from "../../utils/utils";

export default function Disputes() {
	const router = useContext(HistoryContext);
	const context = useContext(AppContext);
	const toast = useToast();
	const { 1: notificationOccurred } = useHapticFeedback();

	const [loading, setLoading] = useBoolean();

	const [deals, setDeals] = useState<Deal[]>([]);
	const [meta, setMeta] = useState<PaginationMeta>();

	useEffect(() => {
		(async () => {
			try {
				const data = await api.custom.get(
					"admin/disputes?page=1&limit=25",
					context.props.auth?.token
				);
				setDeals(data.deals.data);
				setMeta(data.deals.meta);
			} catch (error) {
				errorHandler(error, toast);
				notificationOccurred("error");
				router.back();
			}
		})();
	}, []);

	return (
		<Stack direction={"column"} spacing={2}>
			<CustomBackButton />

			<Heading
				size={"sm"}
				color={getTelegram().themeParams.hint_color}
				textTransform={"uppercase"}
			>
				Disputes
			</Heading>

			{meta && (
				<>
					{deals.map(e => (
						<CellButton
							title={`#D${e.id}`}
							onClick={() => router.push(`/admin/disputes/${e.id}`)}
						/>
					))}
					{meta?.current_page !== meta?.last_page && (
						<Button
							isDisabled={loading}
							onClick={async () => {
								try {
									setLoading.on();
									const data = await api.custom.get(
										`admin/disputes?page=${meta.current_page + 1}&limit=25`,
										context.props.auth?.token
									);

									setDeals([...deals, ...data.deals.data]);
									setMeta(data.offers.meta);
								} catch (error) {
									errorHandler(error, toast);
									notificationOccurred("error");
								} finally {
									setLoading.off();
								}
							}}
							colorScheme="button"
						>
							{context.getTranslation("show_more")}
						</Button>
					)}
				</>
			)}
		</Stack>
	);
}
