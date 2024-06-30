import {
	Modal,
	ModalContent,
	ModalOverlay,
	Text,
	useBoolean,
	useDisclosure,
	useToast,
} from "@chakra-ui/react";
import {
	MainButton,
	useHapticFeedback,
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
import { getTelegram } from "../../../../utils";
import errorHandler from "../../../../utils/utils";

export default function SendMethod({ dealInfo, update }: DealStatusProps) {
	const router = useContext(HistoryContext);
	const context = useContext(AppContext);
	const market = useContext(MarketContext);
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

	const submitMethod = async (method: number) => {
		try {
			getTelegram().MainButton.showProgress();
			await api.custom.post(
				"wallet/market/deals/handle",
				context.props.auth?.token,
				{
					id: dealInfo.deal.id,
					action: "send_method",
					payment_method_id: method,
				}
			);
			await update(true);
			notificationOccurred("success");
		} catch (error) {
			notificationOccurred("error");
			errorHandler(error, toast);
		} finally {
			getTelegram().MainButton.hideProgress();
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
							submitMethod(Number(e));
						}}
						onClose={methodSelect.onClose}
					/>
				</ModalContent>
			</Modal>
		);
	}
	return (
		<>
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
			<MainButton
				text={context.getTranslation("Select Payment Method (action)")}
				onClick={methodSelect.onOpen}
			/>
		</>
	);
}
