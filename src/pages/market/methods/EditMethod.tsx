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
	useShowPopup,
} from "@vkruglikov/react-telegram-web-app";
import { useContext, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../../api/api";
import CellButton from "../../../components/CellButton";
import CustomBackButton from "../../../components/CustomBackButton";
import { AppContext } from "../../../providers/AppProvider";
import { HistoryContext } from "../../../providers/HistoryProviders";
import { MarketContext } from "../../../providers/MarketProvider";
import { getTelegram } from "../../../utils";
import errorHandler from "../../../utils/utils";

export default function EditMethod() {
	const context = useContext(AppContext);
	const router = useContext(HistoryContext);
	const market = useContext(MarketContext);
	const toast = useToast();
	const params = useParams();
	const { 1: notificationOccurred } = useHapticFeedback();

	const getMethod = () => {
		const method = market.myMethods?.find(e => params.id === e.id.toString());
		return {
			...method,
			method: market.methods?.find(e => e.id === method?.method_id),
		};
	};

	const [value, setValue] = useState<string>(getMethod().value || "");
	const [name, setName] = useState<string>(getMethod().name || "");

	const save = async () => {
		try {
			getTelegram().MainButton.showProgress();
			await api.custom.post(
				"wallet/market/edit_method",
				context.props.auth?.token,
				{ value, name, id: getMethod().id }
			);

			await market.update();
			notificationOccurred("success");
			router.back();
		} catch (error) {
			errorHandler(error, toast);
			notificationOccurred("error");
		} finally {
			getTelegram().MainButton.hideProgress();
		}
	};

	const deleteMethod = async () => {
		try {
			getTelegram().MainButton.showProgress();
			await api.custom.post(
				"wallet/market/delete_method",
				context.props.auth?.token,
				{ id: getMethod().id }
			);

			await market.update();
			notificationOccurred("success");
			router.back();
		} catch (error) {
			errorHandler(error, toast);
			notificationOccurred("error");
		} finally {
			getTelegram().MainButton.hideProgress();
		}
	};

	const isOk =
		value.trim() !== "" && value.trim().length > 5 && name.trim() !== "";

	const showPopup = useShowPopup();

	return (
		<Stack direction={"column"} spacing={4}>
			<CustomBackButton />

			{isOk && (
				<MainButton text={context.getTranslation("Save")} onClick={save} />
			)}

			<Stack direction={"column"} spacing={2}>
				<Heading
					size={"sm"}
					color={getTelegram().themeParams.hint_color}
					textTransform={"uppercase"}
				>
					{context
						.getTranslation("Edit %method%")
						.replaceAll("%method%", getMethod()?.name || "")}
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

			<CellButton
				title={context.getTranslation("Remove Payment Method")}
				isDestructive
				hideRight
				onClick={async () => {
					const button = await showPopup({
						title: context.getTranslation("Remove payment method"),
						message: context.getTranslation(
							"Do you confirm the payment method removal?"
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
						await deleteMethod();
					}
				}}
			/>
		</Stack>
	);
}
