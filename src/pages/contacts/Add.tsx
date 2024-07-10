import {
	FormControl,
	FormLabel,
	Heading,
	IconButton,
	Input,
	InputGroup,
	InputRightElement,
	Stack,
	useToast,
} from "@chakra-ui/react";
import {
	BackButton,
	MainButton,
	useHapticFeedback,
	useScanQrPopup,
} from "@vkruglikov/react-telegram-web-app";
import { useContext, useState } from "react";
import { LuScanLine } from "react-icons/lu";
import { useParams } from "react-router-dom";
import api from "../../api/api";
import CustomBackButton from "../../components/CustomBackButton";
import { AppContext } from "../../providers/AppProvider";
import { HistoryContext } from "../../providers/HistoryProviders";
import { getTelegram } from "../../utils";
import errorHandler from "../../utils/utils";

export default function AddContact() {
	const context = useContext(AppContext);
	const router = useContext(HistoryContext);
	const params = useParams();

	const { 1: notificationOccurred } = useHapticFeedback();
	const [showQrPopup, closeQrPopup] = useScanQrPopup();
	const toast = useToast();

	const [address, setAddress] = useState<string>(params.address || "");
	const [title, setTitle] = useState<string>("");

	const isOk = address.trim() !== "" && title.trim() !== "";

	const submit = async () => {
		try {
			getTelegram().MainButton.showProgress();
			await api.custom.post("wallet/contacts/add", context.props.auth?.token, {
				address,
				title,
			});
			notificationOccurred("success");
			toast({
				title: context.getTranslation("success"),
				description: context.getTranslation("Address saved"),
			});
			if (params.address) {
				router.push("/");
			} else {
				router.back();
			}
		} catch (error) {
			notificationOccurred("error");
			errorHandler(error, toast);
		} finally {
			getTelegram().MainButton.hideProgress();
		}
	};

	return (
		<Stack direction={"column"} spacing={2}>
			{params.address ? (
				<BackButton onClick={() => router.push("/")} />
			) : (
				<CustomBackButton />
			)}
			<Heading
				size={"sm"}
				color={getTelegram().themeParams.hint_color}
				textTransform={"uppercase"}
			>
				{context.getTranslation("Add Address")}
			</Heading>

			<FormControl>
				<FormLabel>{context.getTranslation("address")}</FormLabel>
				<InputGroup>
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
						value={address}
						onChange={e => setAddress(e.currentTarget.value)}
						inputMode="text"
					></Input>
					<InputRightElement width="3rem">
						<IconButton
							variant={"ghost"}
							colorScheme="button"
							color="button.500"
							size={"sm"}
							aria-label="scan"
							icon={<LuScanLine size={"20px"} />}
							onClick={() => {
								showQrPopup(
									{
										text: context.getTranslation(
											"Find QR that contains wallet address"
										),
									},
									text => {
										closeQrPopup();
										setAddress(text);
									}
								);
							}}
						/>
					</InputRightElement>
				</InputGroup>
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
					inputMode="text"
				></Input>
			</FormControl>

			{isOk && (
				<MainButton text={context.getTranslation("Save")} onClick={submit} />
			)}
		</Stack>
	);
}
