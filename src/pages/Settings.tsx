import {
	Box,
	Center,
	Heading,
	Menu,
	MenuButton,
	MenuItem,
	MenuList,
	Stack,
	Text,
	useToast,
} from "@chakra-ui/react";
import { useContext } from "react";
import { FaArrowUp, FaCommentDots, FaEarthEurope } from "react-icons/fa6";
import { IoMegaphone } from "react-icons/io5";
import api from "../api/api";

import CellButton from "../components/CellButton";
import CustomBackButton from "../components/CustomBackButton";
import { AppContext } from "../providers/AppProvider";
import { getTelegram } from "../utils";
import errorHandler from "../utils/utils";

function Settings() {
	const context = useContext(AppContext);

	const toast = useToast();

	const changeLanguage = async (language: "en" | "ru") => {
		try {
			await api.auth.editSettings(
				{ language },
				context.props.auth?.token || ""
			);
			await context.updateProfile();
		} catch (error) {
			errorHandler(error, toast);
		}
	};

	return (
		<Stack direction={"column"} spacing={2}>
			<CustomBackButton />

			<Heading
				size={"sm"}
				color={getTelegram().themeParams.hint_color}
				textTransform={"uppercase"}
			>
				{context.getTranslation("settings")}
			</Heading>
			<Menu>
				<MenuButton as={Box} cursor={"pointer"}>
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
								<FaEarthEurope size={"14px"} />
							</Center>
						}
						title={context.getTranslation("language")}
						rightItem={
							<Text
								color={getTelegram().themeParams.hint_color}
								fontSize={"sm"}
							>
								{context.props.auth?.profile.language === "en"
									? context.getTranslation("english")
									: context.getTranslation("russian")}
							</Text>
						}
					/>
				</MenuButton>

				<MenuList bgColor={getTelegram().themeParams.bg_color}>
					<MenuItem
						onClick={() => {
							changeLanguage("en");
						}}
						bgColor={getTelegram().themeParams.bg_color}
					>
						{context.getTranslation("english")}
					</MenuItem>
					<MenuItem
						onClick={() => {
							changeLanguage("ru");
						}}
						bgColor={getTelegram().themeParams.bg_color}
					>
						{context.getTranslation("russian")}
					</MenuItem>
				</MenuList>
			</Menu>

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
						<FaCommentDots size={"14px"} />
					</Center>
				}
				title={context.getTranslation("Support")}
				onClick={() => {
					getTelegram().openTelegramLink("https://t.me/AitherColSupport");
				}}
				rightItem={
					<FaArrowUp
						color={getTelegram().themeParams.hint_color}
						style={{ transform: "rotate(45deg)" }}
					/>
				}
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
						<IoMegaphone size={"14px"} />
					</Center>
				}
				title={context.getTranslation("our_channel")}
				onClick={() => {
					getTelegram().openTelegramLink("https://t.me/aithercol");
				}}
				rightItem={
					<FaArrowUp
						color={getTelegram().themeParams.hint_color}
						style={{ transform: "rotate(45deg)" }}
					/>
				}
			/>
		</Stack>
	);
}

export default Settings;
