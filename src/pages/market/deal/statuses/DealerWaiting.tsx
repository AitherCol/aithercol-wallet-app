import {
	Button,
	Center,
	Modal,
	ModalContent,
	ModalOverlay,
	SimpleGrid,
	Stack,
	Text,
	useBoolean,
	useDisclosure,
	useToast,
} from "@chakra-ui/react";
import {
	useHapticFeedback,
	useShowPopup,
} from "@vkruglikov/react-telegram-web-app";
import moment from "moment";
import { useContext } from "react";
import Countdown from "react-countdown";
import { DealStatusProps } from "..";
import api from "../../../../api/api";
import SelectScreen from "../../../../components/SelectScreen";
import { AppContext } from "../../../../providers/AppProvider";
import { HistoryContext } from "../../../../providers/HistoryProviders";
import { MarketContext } from "../../../../providers/MarketProvider";
import { getColorMap, getTelegram } from "../../../../utils";
import errorHandler from "../../../../utils/utils";

export default function DealerWaiting({ dealInfo, update }: DealStatusProps) {
	const router = useContext(HistoryContext);
	const context = useContext(AppContext);
	const market = useContext(MarketContext);
	const showPopup = useShowPopup();
	const { 1: notificationOccurred } = useHapticFeedback();
	const methodSelect = useDisclosure();

	const toast = useToast();

	const [loading, setLoading] = useBoolean();

	const getContract = () => {
		return market.tokens?.find(e => e.contract === dealInfo.deal.contract);
	};
	const getMyMethod = (id: number) => {
		return market.myMethods?.find(e => e.id === id);
	};
	const getMethod = (id: number) => {
		return market.methods?.find(e => e.id === id);
	};

	const accept = async (method?: number) => {
		try {
			setLoading.on();
			await api.custom.post(
				"wallet/market/deals/handle",
				context.props.auth?.token,
				{ id: dealInfo.deal.id, action: "accept", payment_method_id: method }
			);
			await update(true);
			notificationOccurred("success");
		} catch (error) {
			notificationOccurred("error");
			errorHandler(error, toast);
		} finally {
			setLoading.off();
		}
	};

	if (methodSelect.isOpen) {
		return (
			<Modal motionPreset="none" isOpen={true} size={"full"} onClose={() => {}}>
				<ModalOverlay />
				<ModalContent
					bgColor={getTelegram().themeParams.secondary_bg_color}
					p={4}
				>
					<SelectScreen
						title={context.getTranslation("Select Payment Method")}
						options={[
							{
								value: "_new",
								name: context.getTranslation("Add Payment Method"),
							},
							...(market.myMethods
								?.filter(e => e.method_id === dealInfo.deal.method_type)
								.map(e => {
									return {
										name: e.name,
										value: e.id.toString(),
										image: getMethod(e.method_id)?.logo || undefined,
									};
								}) || []),
						]}
						onChange={e => {
							if (e === "_new") {
								router.push(
									`/market/profile/methods/new/${dealInfo.deal.method_type}`
								);
								return;
							}
							accept(Number(e));
						}}
						onClose={methodSelect.onClose}
					/>
				</ModalContent>
			</Modal>
		);
	}

	return (
		<Stack direction={"column"} spacing={2}>
			<SimpleGrid w="full" columns={2} spacing={2}>
				<Button
					colorScheme="button"
					onClick={() => {
						if (dealInfo.deal.type === "sell") {
							methodSelect.onOpen();
							return;
						}
						accept();
					}}
					isDisabled={loading}
				>
					{context.getTranslation("Accept")}
				</Button>
				<Button
					variant={"ghost"}
					bgColor={
						getColorMap(getTelegram().themeParams.destructive_text_color)[
							"500"
						] + "10"
					}
					isDisabled={loading}
					onClick={async () => {
						try {
							setLoading.on();
							await api.custom.post(
								"wallet/market/deals/handle",
								context.props.auth?.token,
								{ id: dealInfo.deal.id, action: "reject" }
							);
							notificationOccurred("success");
							router.back();
						} catch (error) {
							notificationOccurred("error");
							errorHandler(error, toast);
						} finally {
							setLoading.off();
						}
					}}
					colorScheme="destructive"
				>
					{context.getTranslation("Reject")}
				</Button>
			</SimpleGrid>
			<Center>
				<Text fontSize={"md"} color={getTelegram().themeParams.hint_color}>
					<Countdown
						date={moment(dealInfo.deal.expired_at).valueOf()}
						renderer={({ minutes, seconds, completed }) => {
							if (completed) {
								return <>{context.getTranslation("Complete this operation")}</>;
							}
							const formatTime = (time: number) => {
								if (time.toString().length === 2) {
									return time.toString();
								}
								return `0${time}`;
							};
							return (
								<>
									{context.getTranslation("Complete this operation")}{" "}
									{context.getTranslation("within")} {minutes}:
									{formatTime(seconds)}
								</>
							);
						}}
					/>
				</Text>
			</Center>
		</Stack>
	);
}
