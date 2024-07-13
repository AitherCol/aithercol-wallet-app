import {
	Center,
	Heading,
	Stack,
	useDisclosure,
	useToast,
} from "@chakra-ui/react";
import {
	BackButton,
	useHapticFeedback,
	useShowPopup,
} from "@vkruglikov/react-telegram-web-app";
import { useContext } from "react";
import { FaArrowUp, FaBook, FaKey, FaPalette, FaTrash } from "react-icons/fa6";
import api from "../../../api/api";
import CellButton from "../../../components/CellButton";
import { AppContext } from "../../../providers/AppProvider";
import { HistoryContext } from "../../../providers/HistoryProviders";
import { getTelegram } from "../../../utils";
import errorHandler from "../../../utils/utils";
import { MerchantPageProps } from "./Merchant";
import MerchantAPIKey from "./MerchantAPIKey";
import MerchantBranding from "./MerchantBranding";

export default function MerchantSettings(props: MerchantPageProps) {
	const context = useContext(AppContext);
	const router = useContext(HistoryContext);
	const toast = useToast();
	const { 1: notificationOccurred } = useHapticFeedback();
	const showPopup = useShowPopup();

	const apiKeyPage = useDisclosure();
	const brandingPage = useDisclosure();

	if (apiKeyPage.isOpen) {
		return <MerchantAPIKey {...props} onClose={apiKeyPage.onClose} />;
	}

	if (brandingPage.isOpen) {
		return <MerchantBranding {...props} onClose={brandingPage.onClose} />;
	}

	return (
		<Stack direction={"column"} spacing={2}>
			<BackButton onClick={props.onClose} />
			<Heading
				size={"sm"}
				color={getTelegram().themeParams.hint_color}
				textTransform={"uppercase"}
			>
				{context.getTranslation("Merchant Settings")}
			</Heading>

			<CellButton
				icon={
					<Center
						w={"24px"}
						h="24px"
						borderRadius={"999px"}
						overflow={"hidden"}
						bgColor={getTelegram().themeParams.accent_text_color}
						color={getTelegram().themeParams.button_text_color}
					>
						<FaPalette size={"14px"} />
					</Center>
				}
				title={context.getTranslation("Branding")}
				onClick={brandingPage.onOpen}
			/>

			<CellButton
				icon={
					<Center
						w={"24px"}
						h="24px"
						borderRadius={"999px"}
						overflow={"hidden"}
						bgColor={getTelegram().themeParams.accent_text_color}
						color={getTelegram().themeParams.button_text_color}
					>
						<FaKey size={"14px"} />
					</Center>
				}
				title={context.getTranslation("API Key")}
				onClick={apiKeyPage.onOpen}
			/>

			<CellButton
				icon={
					<Center
						w={"24px"}
						h="24px"
						borderRadius={"999px"}
						overflow={"hidden"}
						bgColor={getTelegram().themeParams.accent_text_color}
						color={getTelegram().themeParams.button_text_color}
					>
						<FaBook size={"14px"} />
					</Center>
				}
				title={context.getTranslation("API Documentation")}
				onClick={() => {
					getTelegram().openLink("https://docs.pay.aithercol.com/");
				}}
				rightItem={
					<FaArrowUp
						color={getTelegram().themeParams.hint_color}
						style={{ transform: "rotate(45deg)" }}
					/>
				}
			/>

			{props.getTotalBalance() === 0 && (
				<CellButton
					isDestructive
					hideRight
					icon={
						<Center
							w={"24px"}
							h="24px"
							borderRadius={"999px"}
							overflow={"hidden"}
							bgColor={getTelegram().themeParams.destructive_text_color}
							color={getTelegram().themeParams.button_text_color}
						>
							<FaTrash size={"14px"} />
						</Center>
					}
					title={context.getTranslation("Delete Merchant")}
					onClick={async () => {
						const button = await showPopup({
							title: context.getTranslation("Delete Merchant"),
							message: context.getTranslation(
								"Are you sure you want to delete the merchant?"
							),
							buttons: [
								{
									id: "confirm",
									type: "destructive",
									text: context.getTranslation("Confirm"),
								},
								{ type: "cancel" },
							],
						});
						if (button === "confirm") {
							try {
								await api.custom.post(
									"pay/internal/merchants/delete",
									context.props.auth?.token,
									{ id: props.merchant.id }
								);
								notificationOccurred("success");
								router.back();
							} catch (error) {
								notificationOccurred("error");
								errorHandler(error, toast);
							}
						}
					}}
				/>
			)}
		</Stack>
	);
}
