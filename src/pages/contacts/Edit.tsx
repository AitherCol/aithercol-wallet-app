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
import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../api/api";
import CustomBackButton from "../../components/CustomBackButton";
import { AppContext } from "../../providers/AppProvider";
import { HistoryContext } from "../../providers/HistoryProviders";
import { getTelegram } from "../../utils";
import errorHandler from "../../utils/utils";

export default function EditContact() {
	const context = useContext(AppContext);
	const router = useContext(HistoryContext);
	const params = useParams();

	const { 1: notificationOccurred } = useHapticFeedback();
	const toast = useToast();

	const [title, setTitle] = useState<string>("");

	const isOk = title.trim() !== "";

	useEffect(() => {
		(async () => {
			try {
				const data = await api.custom.get(
					"wallet/contacts",
					context.props.auth?.token
				);
				const contact = data.contacts.find(
					(e: any) => e.id === Number(params.id)
				);
				if (contact) {
					setTitle(contact.title);
				} else {
					notificationOccurred("error");
					router.back();
				}
			} catch (error) {
				notificationOccurred("error");
				errorHandler(error, toast);
			}
		})();
	}, []);

	const submit = async () => {
		try {
			getTelegram().MainButton.showProgress();
			await api.custom.post("wallet/contacts/edit", context.props.auth?.token, {
				id: params.id,
				title,
			});
			notificationOccurred("success");

			router.back();
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
				{context.getTranslation("Edit Address")}
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
					value={title}
					onChange={e => setTitle(e.currentTarget.value)}
					inputMode="text"
				></Input>
			</FormControl>

			{isOk && (
				<MainButton text={context.getTranslation("Save")} onClick={submit} />
			)}
		</Stack>
	);
}
