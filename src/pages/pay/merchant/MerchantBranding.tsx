import {
	FormControl,
	FormLabel,
	Heading,
	Input,
	Stack,
	useToast,
} from "@chakra-ui/react";
import {
	BackButton,
	MainButton,
	useHapticFeedback,
} from "@vkruglikov/react-telegram-web-app";
import FilePicker from "chakra-ui-file-picker";
import { useContext, useState } from "react";
import api from "../../../api/api";
import { AppContext } from "../../../providers/AppProvider";
import { getTelegram } from "../../../utils";
import errorHandler from "../../../utils/utils";
import { MerchantPageProps } from "./Merchant";

export default function MerchantBranding(props: MerchantPageProps) {
	const context = useContext(AppContext);
	const toast = useToast();
	const { 1: notificationOccurred } = useHapticFeedback();

	const [title, setTitle] = useState<string>(props.merchant.title);
	const [url, setUrl] = useState<string>(props.merchant.url || "");
	const [newPhoto, setNewPhoto] = useState<File>();

	const isOk = title.trim() !== "";

	const save = async () => {
		try {
			getTelegram().MainButton.showProgress();
			await api.custom.postForm(
				"pay/internal/merchants/edit",
				context.props.auth?.token,
				{ id: props.merchant.id, new_photo: newPhoto, url, title }
			);
			await props.update();
			notificationOccurred("success");
			props.onClose();
		} catch (error) {
			notificationOccurred("error");
			errorHandler(error, toast);
		} finally {
			getTelegram().MainButton.hideProgress();
		}
	};

	return (
		<Stack direction={"column"} spacing={2}>
			<BackButton onClick={props.onClose} />
			<Heading
				size={"sm"}
				color={getTelegram().themeParams.hint_color}
				textTransform={"uppercase"}
			>
				{context.getTranslation("Merchant Branding")}
			</Heading>

			<FormControl>
				<FormLabel>{context.getTranslation("Photo")}</FormLabel>
				<FilePicker
					inputProps={{
						borderColor: "transparent",
						bgColor: getTelegram().themeParams.bg_color,
						_hover: { borderColor: getTelegram().themeParams.hint_color },
						_focus: {
							borderColor: getTelegram().themeParams.accent_text_color,
							boxShadow: "none",
						},
					}}
					placeholder={context.getTranslation("Click to upload new photo")}
					onFileChange={files => {
						setNewPhoto(files[0]);
					}}
					accept="image/png"
					hideClearButton={true}
				/>
			</FormControl>

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
				/>
			</FormControl>

			<FormControl>
				<FormLabel>URL</FormLabel>
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
					value={url}
					onChange={e => setUrl(e.currentTarget.value)}
				/>
			</FormControl>

			{isOk && (
				<MainButton text={context.getTranslation("Save")} onClick={save} />
			)}
		</Stack>
	);
}
