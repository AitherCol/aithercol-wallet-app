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
import { useParams } from "react-router-dom";
import api from "../../../api/api";
import CustomBackButton from "../../../components/CustomBackButton";
import { AppContext } from "../../../providers/AppProvider";
import { HistoryContext } from "../../../providers/HistoryProviders";
import { MarketContext } from "../../../providers/MarketProvider";
import { getTelegram } from "../../../utils";
import errorHandler from "../../../utils/utils";

export default function AddMarketMethod() {
	const context = useContext(AppContext);
	const router = useContext(HistoryContext);
	const market = useContext(MarketContext);
	const toast = useToast();
	const params = useParams();
	const { 1: notificationOccurred } = useHapticFeedback();

	const [value, setValue] = useState<string>("");
	const [name, setName] = useState<string>("");

	const getMethod = () => {
		return market.methods?.find(e => params.id === e.id.toString());
	};

	const addMethod = async () => {
		try {
			getTelegram().MainButton.showProgress();
			await api.custom.post(
				"wallet/market/add_method",
				context.props.auth?.token,
				{ value, name, method: getMethod()?.id }
			);

			await market.update();
			notificationOccurred("success");
			router.push("/market", false, "/");
		} catch (error) {
			errorHandler(error, toast);
			notificationOccurred("error");
		} finally {
			getTelegram().MainButton.hideProgress();
		}
	};

	const isOk = value.trim() !== "" && value.trim().length > 5;

	return (
		<Stack direction={"column"} spacing={2}>
			<CustomBackButton />

			{isOk && (
				<MainButton text={context.getTranslation("Add")} onClick={addMethod} />
			)}

			<Heading
				size={"sm"}
				color={getTelegram().themeParams.hint_color}
				textTransform={"uppercase"}
			>
				{context
					.getTranslation("Add %method%")
					.replaceAll(
						"%method%",
						context.props.auth?.profile.language === "ru"
							? getMethod()?.name_ru || getMethod()?.name_en || ""
							: getMethod()?.name_en || ""
					)}
			</Heading>

			<FormControl>
				<FormLabel>
					{context.getTranslation("Name")} ({context.getTranslation("optional")}
					)
				</FormLabel>
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
					inputMode="text"
				></Input>
			</FormControl>

			<FormControl>
				<FormLabel>
					{context.getTranslation("Account, Card Number or Phone")}
				</FormLabel>
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
					value={value}
					onChange={e => setValue(e.currentTarget.value)}
					inputMode="text"
				></Input>
			</FormControl>
		</Stack>
	);
}
