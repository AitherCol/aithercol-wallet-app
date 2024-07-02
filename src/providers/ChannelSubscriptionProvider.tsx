import { Center, Image, Stack, Text, useToast } from "@chakra-ui/react";
import {
	MainButton,
	useHapticFeedback,
} from "@vkruglikov/react-telegram-web-app";
import Lottie from "lottie-react";
import { useContext } from "react";
import api from "../api/api";
import Cell from "../components/Cell";
import channel from "../images/channel.jpg";
import comp from "../stickers/Comp.json";
import { getTelegram } from "../utils";
import errorHandler from "../utils/utils";
import { AppContext } from "./AppProvider";

export default function ChannelSubscriptionProvider({
	children,
}: {
	children: any;
}) {
	const context = useContext(AppContext);
	const toast = useToast();
	const { 1: notification } = useHapticFeedback();

	return context.props.auth?.profile.is_subscribed ? (
		children
	) : (
		<Center h={"var(--tg-viewport-stable-height)"}>
			<Stack
				alignItems={"center"}
				textAlign={"center"}
				direction={"column"}
				spacing={4}
			>
				<Stack alignItems={"center"} direction={"column"} spacing={2}>
					<Lottie
						style={{ width: 120, height: 120 }}
						animationData={comp}
						loop
					/>
					<Text>
						{context.getTranslation(
							"To use AitherCol Wallet, subscribe to our channel!"
						)}
					</Text>
				</Stack>
				<Stack textAlign={"start"}>
					<Cell
						icon={
							<Image src={channel} w="40px" h="40px" borderRadius={"999px"} />
						}
						title="AitherCol"
						subTitle="The official news channel of @AitherColBot"
						onClick={() => {
							getTelegram().openTelegramLink("https://t.me/AitherCol");
						}}
					/>
				</Stack>

				<MainButton
					text={context.getTranslation("Check Subscription")}
					onClick={async () => {
						try {
							getTelegram().MainButton.showProgress();
							const data = await api.custom.post(
								"auth/check_subscription",
								context.props.auth?.token
							);
							if (!data.result) {
								toast({
									title: context.getTranslation("error"),
									description: context.getTranslation("You are not subscribed"),
									status: "error",
								});
							} else {
								await context.updateProfile();
							}
						} catch (error) {
							notification("error");
							errorHandler(error, toast);
						} finally {
							getTelegram().MainButton.hideProgress();
						}
					}}
				/>
			</Stack>
		</Center>
	);
}
