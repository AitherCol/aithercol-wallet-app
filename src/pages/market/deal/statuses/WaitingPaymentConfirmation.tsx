import {
	Button,
	Center,
	Heading,
	Stack,
	Text,
	useToast,
} from "@chakra-ui/react";
import { useHapticFeedback } from "@vkruglikov/react-telegram-web-app";
import Lottie from "lottie-react";
import moment from "moment";
import { useContext } from "react";
import Countdown from "react-countdown";
import { DealStatusProps } from "..";
import api from "../../../../api/api";
import { AppContext } from "../../../../providers/AppProvider";
import loopmoney from "../../../../stickers/loopmoney.json";
import errorHandler from "../../../../utils/utils";

export default function WaitingPaymentConfirmation({
	dealInfo,
}: DealStatusProps) {
	const context = useContext(AppContext);
	const { 1: notificationOccurred } = useHapticFeedback();
	const toast = useToast();

	return (
		<Center
			h={"var(--tg-viewport-stable-height)"}
			transition={"height 0.3s linear"}
		>
			<Stack
				direction={"column"}
				spacing={4}
				alignItems={"center"}
				textAlign={"center"}
			>
				<Stack direction="column" spacing={2} alignItems={"center"}>
					<Lottie
						animationData={loopmoney}
						loop
						style={{ width: 100, height: 100 }}
					/>
					<Heading size={"sm"}>
						{context.getTranslation("Waiting for confirmation")}
					</Heading>
					<Text fontSize={"md"}>
						{context.getTranslation(
							"It takes around 10 minutes. You can close AitherCol Wallet, we'll notify when your crypto is credited."
						)}
					</Text>
				</Stack>

				<Countdown
					date={moment(dealInfo.deal.expired_at).valueOf()}
					renderer={({ minutes, seconds, completed }) => {
						if (completed) {
							return (
								<Button
									variant="link"
									colorScheme="button"
									onClick={async () => {
										try {
											await api.custom.post(
												"wallet/market/deals/handle",
												context.props.auth?.token,
												{
													id: dealInfo.deal.id,
													action: "open_dispute",
												}
											);
											notificationOccurred("success");
										} catch (error) {
											notificationOccurred("error");
											errorHandler(error, toast);
										}
									}}
								>
									{context.getTranslation("Open Dispute")}
								</Button>
							);
						}
						const formatTime = (time: number) => {
							if (time.toString().length === 2) {
								return time.toString();
							}
							return `0${time}`;
						};
						return (
							<>
								{context.getTranslation(
									"You will be able to open a dispute in"
								)}{" "}
								{minutes}:{formatTime(seconds)}
							</>
						);
					}}
				/>
			</Stack>
			{/** @TODO <MainButton text={context.getTranslation('Send Message')} onClick={() => {}} /> */}
		</Center>
	);
}
