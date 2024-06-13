import {
	Box,
	Center,
	Heading,
	Menu,
	MenuButton,
	MenuItem,
	MenuList,
	Stack,
	useToast,
} from "@chakra-ui/react";
import { useContext } from "react";
import { FaEarthEurope } from "react-icons/fa6";
import { IoMegaphone } from "react-icons/io5";
import api from "../api/api";
import Cell from "../components/Cell";

import CustomBackButton from "../components/CustomBackButton";
import { AppContext } from "../providers/AppProvider";
import { HistoryContext } from "../providers/HistoryProviders";
import { getTelegram } from "../utils";
import errorHandler from "../utils/utils";

function Settings() {
	const context = useContext(AppContext);
	const router = useContext(HistoryContext);
	const toast = useToast();

	const updateProfile = async () => {
		try {
			const profile = await api.auth.getProfile(
				context.props.auth?.token || ""
			);
			if (profile && context.setProps) {
				context.setProps({
					...context.props,
					auth: { profile, token: context.props.auth?.token || "" },
				});
			}
		} catch (error) {
			errorHandler(error, toast);
		}
	};

	const changeLanguage = async (language: "en" | "ru") => {
		try {
			await api.auth.editSettings(
				{ language },
				context.props.auth?.token || ""
			);
			await updateProfile();
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
				<MenuButton as={Box}>
					<Cell
						icon={
							<Center
								w={"40px"}
								h="40px"
								borderRadius={"999px"}
								overflow={"hidden"}
								bgColor={getTelegram().themeParams.accent_text_color}
								color={getTelegram().themeParams.button_text_color}
							>
								<FaEarthEurope size={"20px"} />
							</Center>
						}
						onClick={() => {}}
						title={context.getTranslation("language")}
						additional={{
							title: `${
								context.props.auth?.profile.language === "en"
									? context.getTranslation("english")
									: context.getTranslation("russian")
							}`,
						}}
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

			<Cell
				icon={
					<Center
						w={"40px"}
						h="40px"
						borderRadius={"999px"}
						overflow={"hidden"}
						bgColor={getTelegram().themeParams.accent_text_color}
						color={getTelegram().themeParams.button_text_color}
					>
						<IoMegaphone size={"20px"} />
					</Center>
				}
				title={context.getTranslation("our_channel")}
				subTitle={context.getTranslation(
					"Stay tuned for AitherCol Wallet updates"
				)}
				onClick={() => {
					getTelegram().openTelegramLink("https://t.me/aithercol");
				}}
			/>
		</Stack>
	);
}

export default Settings;
