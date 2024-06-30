import { Center, Heading, Image, Stack, Text } from "@chakra-ui/react";
import {
	MainButton,
	useHapticFeedback,
} from "@vkruglikov/react-telegram-web-app";
import HTMLReactParser from "html-react-parser";
import { useContext } from "react";
import { AppContext } from "../../providers/AppProvider";
import { HistoryContext } from "../../providers/HistoryProviders";
import { getTelegram } from "../../utils";

function RegisterMarket() {
	const context = useContext(AppContext);
	const router = useContext(HistoryContext);

	const { 1: notificationOccurred } = useHapticFeedback();

	return (
		<Center mt="36px" mb="36px">
			<MainButton
				text={context.getTranslation("Agree")}
				onClick={() => {
					notificationOccurred("success");
					router.push("/market/currency");
				}}
			/>

			<Stack direction={"column"} spacing={6} alignItems={"center"}>
				<Stack
					alignItems={"center"}
					textAlign={"center"}
					direction={"column"}
					spacing={2}
				>
					<Image
						src={"/emoji/exchange.gif"}
						w={"80px"}
						h="80px"
						borderRadius={"999px"}
					/>

					<Heading size={"md"}>{context.getTranslation("P2P Market")}</Heading>

					<Text textAlign={"center"}>
						{context.getTranslation(
							"Sell ​​and buy cryptocurrency directly from real people by transferring money to any bank."
						)}
					</Text>
				</Stack>

				<Stack direction={"column"} spacing={2}>
					<Text textAlign={"center"}>
						{context.getTranslation(
							"All users must read and agree to the P2P Market's terms of use before creating a deal or ad. If you violate the rules, your account will be blocked."
						)}
					</Text>

					<Stack
						p={3}
						bgColor={getTelegram().themeParams.bg_color}
						borderRadius={"lg"}
						direction={"column"}
						spacing={1}
					>
						<Text>
							{HTMLReactParser(
								context.getTranslation(
									"1. <b>Be polite.</b> Real people respond to transactions and messages in your wallet. Follow the terms of the deal and the rules of business communication."
								)
							)}
						</Text>
						<Text>
							{HTMLReactParser(
								context.getTranslation(
									"2. <b>Be careful.</b> Payment must only be sent through the selected payment method. Send the exact payment amount specified in the transaction."
								)
							)}
						</Text>
						<Text>
							{HTMLReactParser(
								context.getTranslation(
									"3. <b>Be confident.</b> Make sure you can send or receive payment without third parties involved. Once the details have been received or sent, the transaction cannot be cancelled."
								)
							)}
						</Text>
					</Stack>
				</Stack>
			</Stack>
		</Center>
	);
}

export default RegisterMarket;
