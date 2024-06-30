import {
	Heading,
	Stack,
	Text,
	useDisclosure,
	useToast,
} from "@chakra-ui/react";
import {
	MainButton,
	useHapticFeedback,
	useShowPopup,
} from "@vkruglikov/react-telegram-web-app";
import moment from "moment";
import { useContext } from "react";
import Countdown from "react-countdown";
import { BsBank } from "react-icons/bs";
import { FaCoins, FaCopy, FaCreditCard } from "react-icons/fa6";
import { DealStatusProps } from "..";
import api from "../../../../api/api";
import InfoCell from "../../../../components/InfoCell";
import { AppContext } from "../../../../providers/AppProvider";
import { HistoryContext } from "../../../../providers/HistoryProviders";
import { MarketContext } from "../../../../providers/MarketProvider";
import { getTelegram } from "../../../../utils";
import errorHandler from "../../../../utils/utils";

function SendPayment({ dealInfo, update }: DealStatusProps) {
	const router = useContext(HistoryContext);
	const context = useContext(AppContext);
	const market = useContext(MarketContext);
	const showPopup = useShowPopup();
	const { 1: notificationOccurred } = useHapticFeedback();
	const methodSelect = useDisclosure();

	const toast = useToast();

	const getContract = () => {
		return market.tokens?.find(e => e.contract === dealInfo.deal.contract);
	};
	const getMyMethod = (id: number) => {
		return market.myMethods?.find(e => e.id === id);
	};
	const getMethod = (id: number) => {
		return market.methods?.find(e => e.id === id);
	};

	return (
		<Stack direction={"column"} spacing={2}>
			<Heading
				size={"sm"}
				color={getTelegram().themeParams.hint_color}
				textTransform={"uppercase"}
			>
				{context.getTranslation("Make Payment")}
			</Heading>

			<InfoCell
				icon={<BsBank size={"20px"} />}
				title={context.getTranslation("Payment Method")}
				value={`${
					context.props.auth?.profile.language === "ru"
						? getMethod(dealInfo.deal.method_type)?.name_ru ||
						  getMethod(dealInfo.deal.method_type)?.name_en
						: getMethod(dealInfo.deal.method_type)?.name_en
				}`}
			/>

			{dealInfo.method && (
				<>
					<InfoCell
						icon={<FaCreditCard size={"20px"} />}
						title={context.getTranslation("Account, Card Number or Phone")}
						value={dealInfo.method.value}
						rightIcon={<FaCopy color={getTelegram().themeParams.link_color} />}
						onClick={() => {
							window.navigator.clipboard.writeText(
								dealInfo.method?.value || ""
							);
							toast({ title: context.getTranslation("Copied to clipboard") });
						}}
					/>
					<InfoCell
						icon={<FaCoins size={"20px"} />}
						title={context.getTranslation("amount")}
						value={`${dealInfo.deal.amount_fiat} ${dealInfo.deal.currency}`}
						rightIcon={<FaCopy color={getTelegram().themeParams.link_color} />}
						onClick={() => {
							window.navigator.clipboard.writeText(
								dealInfo.deal.amount_fiat.toString()
							);
							toast({ title: context.getTranslation("Copied to clipboard") });
						}}
					/>
				</>
			)}

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
				text={context.getTranslation("Confirm Payment (action)")}
				onClick={async () => {
					try {
						getTelegram().MainButton.showProgress();
						await api.custom.post(
							"wallet/market/deals/handle",
							context.props.auth?.token,
							{ id: dealInfo.deal.id, action: "payment_sent" }
						);
						await update(true);
						notificationOccurred("success");
					} catch (error) {
						notificationOccurred("error");
						errorHandler(error, toast);
					} finally {
						getTelegram().MainButton.hideProgress();
					}
				}}
			/>
		</Stack>
	);
}

export default SendPayment;
