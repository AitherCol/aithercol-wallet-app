import {
	Button,
	Heading,
	Link,
	SimpleGrid,
	Stack,
	Text,
	useToast,
} from "@chakra-ui/react";
import { useHapticFeedback } from "@vkruglikov/react-telegram-web-app";
import moment from "moment";
import { useContext, useEffect, useState } from "react";
import api from "../../api/api";
import CustomBackButton from "../../components/CustomBackButton";
import Loader from "../../components/Loader";
import { AppContext } from "../../providers/AppProvider";
import { HistoryContext } from "../../providers/HistoryProviders";
import { getColorMap, getTelegram } from "../../utils";
import errorHandler, { getTonViewer } from "../../utils/utils";

export default function StuckTransactions() {
	const router = useContext(HistoryContext);
	const context = useContext(AppContext);
	const toast = useToast();
	const { 1: notificationOccurred } = useHapticFeedback();

	const [transitions, setTransactions] = useState<any[]>();
	const update = async () => {
		try {
			const data = await api.custom.get(
				"admin/transactions/stuck",
				context.props.auth?.token
			);
			setTransactions(data.transactions);
		} catch (error) {
			errorHandler(error, toast);
		}
	};
	useEffect(() => {
		update();
	}, []);

	const handle = async (id: number, action: "confirm" | "error") => {
		try {
			await api.custom.post(
				"admin/transactions/handle",
				context.props.auth?.token,
				{ id, action }
			);
			await update();
			toast({ title: "Success" });
		} catch (error) {
			errorHandler(error, toast);
		}
	};

	return !transitions ? (
		<Loader />
	) : (
		<Stack direction={"column"} spacing={2}>
			<CustomBackButton />

			<Heading
				size={"sm"}
				color={getTelegram().themeParams.hint_color}
				textTransform={"uppercase"}
			>
				Stucked Transactions
			</Heading>

			{transitions.map(e => (
				<Stack
					direction={"column"}
					spacing={2}
					p={3}
					bgColor={getTelegram().themeParams.bg_color}
					borderRadius={"lg"}
				>
					<Heading size={"sm"}>#T{e.id}</Heading>
					<Stack direction={"column"} spacing={0}>
						<Text fontSize={"sm"}>
							To:{" "}
							<Link
								color={"button.500"}
								onClick={() =>
									getTelegram().openLink(`${getTonViewer(context)}/${e.to}`)
								}
							>
								{e.to || ""}
							</Link>
						</Text>
						<Text fontSize={"sm"}>Contract: {e.contract}</Text>
						<Text fontSize={"sm"}>Amount: {e.amount}</Text>
						{e.comment && <Text fontSize={"sm"}>Comment: {e.comment}</Text>}
						<Text fontSize={"sm"}>
							Date: {moment(e.created_at).format("LLL")}
						</Text>
					</Stack>

					<SimpleGrid columns={2} spacing={2}>
						<Button
							size={"sm"}
							colorScheme="button"
							onClick={() => handle(e.id, "confirm")}
						>
							Confirm
						</Button>
						<Button
							size="sm"
							colorScheme="destructive"
							variant={"ghost"}
							bgColor={
								getColorMap(getTelegram().themeParams.destructive_text_color)[
									"500"
								] + "10"
							}
							onClick={() => handle(e.id, "error")}
						>
							Error
						</Button>
					</SimpleGrid>
				</Stack>
			))}
		</Stack>
	);
}
