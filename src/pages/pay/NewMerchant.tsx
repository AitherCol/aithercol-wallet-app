import {
	FormControl,
	FormLabel,
	Heading,
	Input,
	Stack,
	useToast,
} from "@chakra-ui/react";
import {
	MainButton,
	useHapticFeedback,
} from "@vkruglikov/react-telegram-web-app";
import { useContext, useState } from "react";
import api from "../../api/api";
import CustomBackButton from "../../components/CustomBackButton";
import { AppContext } from "../../providers/AppProvider";
import { HistoryContext } from "../../providers/HistoryProviders";
import { getTelegram } from "../../utils";
import errorHandler from "../../utils/utils";

export default function NewMerchant() {
	const context = useContext(AppContext);
	const router = useContext(HistoryContext);
	const toast = useToast();
	const { 1: notificationOccurred } = useHapticFeedback();

	const [name, setName] = useState<string>("");

	const create = async () => {
		try {
			getTelegram().MainButton.showProgress();
			const data = await api.custom.post(
				"pay/internal/merchants/create",
				context.props.auth?.token,
				{ title: name }
			);
			router.push(`/pay/merchants/${data.merchant.id}`);
		} catch (error) {
			notificationOccurred("error");
			errorHandler(error, toast);
		} finally {
			getTelegram().MainButton.hideProgress();
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
				{context.getTranslation("Create Merchant")}
			</Heading>

			<FormControl>
				<FormLabel>{context.getTranslation("Name")}</FormLabel>
				<Input
					borderColor={"transparent"}
					bgColor={getTelegram().themeParams.bg_color}
					_hover={{
						borderColor: getTelegram().themeParams.hint_color,
					}}
					_focus={{
						borderColor: getTelegram().themeParams.accent_text_color,
						boxShadow: "none",
					}}
					value={name}
					onChange={e => setName(e.currentTarget.value)}
				/>
			</FormControl>

			{name.trim() !== "" && (
				<MainButton text={context.getTranslation("Create")} onClick={create} />
			)}
		</Stack>
	);
}
