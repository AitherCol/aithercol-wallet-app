import { Center, Heading, Stack } from "@chakra-ui/react";
import { useShowPopup } from "@vkruglikov/react-telegram-web-app";
import { useContext } from "react";
import { FaKey, FaRepeat } from "react-icons/fa6";
import CellButton from "../../components/CellButton";
import CustomBackButton from "../../components/CustomBackButton";
import { AppContext } from "../../providers/AppProvider";
import { HistoryContext } from "../../providers/HistoryProviders";
import { getTelegram } from "../../utils";

export default function Recovery() {
	const context = useContext(AppContext);
	const router = useContext(HistoryContext);
	const showPopup = useShowPopup();

	return (
		<Stack direction={"column"} spacing={2}>
			<CustomBackButton />
			<Heading
				size={"sm"}
				color={getTelegram().themeParams.hint_color}
				textTransform={"uppercase"}
			>
				{context.getTranslation("Backup")}
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
						<FaRepeat size={"14px"} />
					</Center>
				}
				title={context.getTranslation("Restore")}
				onClick={() => router.push("/settings/recovery/restore")}
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
				title={context.getTranslation("Show Recovery Phrase")}
				onClick={async () => {
					const button = await showPopup({
						title: context.getTranslation("Attention"),
						message: context.getTranslation(
							"Never enter or share this phrase with anyone. This phrase is only needed if you have lost access to your Telegram account."
						),
						buttons: [
							{
								id: "confirm",
								type: "default",
								text: context.getTranslation("Continue"),
							},
							{ type: "cancel" },
						],
					});

					if (button === "confirm") {
						router.push("/settings/recovery/phrase");
					}
				}}
			/>
		</Stack>
	);
}
