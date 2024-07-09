import {
	Center,
	Heading,
	Stack,
	Switch,
	Text,
	useBoolean,
	useToast,
} from "@chakra-ui/react";
import { useHapticFeedback } from "@vkruglikov/react-telegram-web-app";
import Lottie from "lottie-react";
import { useContext } from "react";
import { FaGift, FaUserLarge } from "react-icons/fa6";
import api from "../../api/api";
import CellButton from "../../components/CellButton";
import CustomBackButton from "../../components/CustomBackButton";
import { AppContext } from "../../providers/AppProvider";
import { HistoryContext } from "../../providers/HistoryProviders";
import gift from "../../stickers/gift.json";
import { getTelegram } from "../../utils";
import errorHandler from "../../utils/utils";

function Giveaways() {
	const context = useContext(AppContext);
	const router = useContext(HistoryContext);
	const toast = useToast();
	const { 1: notificationOccurred } = useHapticFeedback();

	const [loading, setLoading] = useBoolean();
	const toggleAnonymous = async () => {
		setLoading.on();
		try {
			await api.custom.post(
				"wallet/giveaways/toggle_anonymous",
				context.props.auth?.token
			);
			await context.updateProfile();
			notificationOccurred("success");
		} catch (error) {
			notificationOccurred("error");
			errorHandler(error, toast);
		} finally {
			setLoading.off();
		}
	};

	return (
		<Stack direction={"column"} spacing={4}>
			<CustomBackButton />
			<Stack
				alignItems={"center"}
				textAlign={"center"}
				direction={"column"}
				spacing={2}
			>
				<Lottie
					style={{ width: 120, height: 120 }}
					animationData={gift}
					loop={true}
				/>

				<Heading size={"md"}>{context.getTranslation("Giveaways")}</Heading>

				<Text textAlign={"center"}>
					{context.getTranslation(
						"Start a giveaway to promote your channels and get new followers by gifting coins to subscribers."
					)}
				</Text>
			</Stack>

			<Stack direction={"column"} spacing={2}>
				<CellButton
					title={context.getTranslation("Create Giveaway")}
					icon={
						<Center
							w={"24px"}
							h="24px"
							borderRadius={"999px"}
							overflow={"hidden"}
							bgColor={getTelegram().themeParams.accent_text_color}
							color={getTelegram().themeParams.button_text_color}
						>
							<FaGift size={"14px"} />
						</Center>
					}
					onClick={() => router.push("/giveaways/create")}
				/>
			</Stack>
			<CellButton
				title={context.getTranslation("Hide Profile")}
				icon={
					<Center
						w={"24px"}
						h="24px"
						borderRadius={"999px"}
						overflow={"hidden"}
						bgColor={getTelegram().themeParams.accent_text_color}
						color={getTelegram().themeParams.button_text_color}
					>
						<FaUserLarge size={"14px"} />
					</Center>
				}
				rightItem={
					<Switch
						isChecked={context.props.auth?.profile.is_anonymous}
						size={"md"}
						colorScheme="button"
						onClick={toggleAnonymous}
						onChange={toggleAnonymous}
						isDisabled={loading}
					/>
				}
			/>
		</Stack>
	);
}

export default Giveaways;
