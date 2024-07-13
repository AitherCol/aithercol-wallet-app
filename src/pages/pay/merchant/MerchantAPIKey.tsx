import {
	FormControl,
	Heading,
	IconButton,
	Input,
	InputGroup,
	InputRightElement,
	Stack,
	useBoolean,
	useToast,
} from "@chakra-ui/react";
import {
	BackButton,
	MainButton,
	useHapticFeedback,
} from "@vkruglikov/react-telegram-web-app";
import { useContext, useEffect, useState } from "react";
import { FaRepeat } from "react-icons/fa6";
import api from "../../../api/api";
import Loader from "../../../components/Loader";
import { AppContext } from "../../../providers/AppProvider";
import { getTelegram } from "../../../utils";
import errorHandler from "../../../utils/utils";
import { MerchantPageProps } from "./Merchant";

export default function MerchantAPIKey(props: MerchantPageProps) {
	const context = useContext(AppContext);
	const toast = useToast();
	const { 1: notificationOccurred } = useHapticFeedback();

	const [key, setKey] = useState<string>();

	useEffect(() => {
		(async () => {
			try {
				const data = await api.custom.get(
					`pay/internal/merchants/api_key?id=${props.merchant.id}`,
					context.props.auth?.token
				);
				setKey(data.api_key);
			} catch (error) {
				notificationOccurred("error");
				errorHandler(error, toast);
			}
		})();
	}, []);

	const [loading, setLoading] = useBoolean();

	return !key ? (
		<Loader />
	) : (
		<Stack direction={"column"} spacing={2}>
			<BackButton onClick={props.onClose} />
			<Heading
				size={"sm"}
				color={getTelegram().themeParams.hint_color}
				textTransform={"uppercase"}
			>
				{context.getTranslation("API Key")}
			</Heading>

			<FormControl>
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
						value={key}
						isReadOnly
					></Input>
					<InputRightElement width="3rem">
						<IconButton
							variant={"ghost"}
							colorScheme="button"
							color="button.500"
							size={"sm"}
							aria-label="scan"
							icon={<FaRepeat size={"16px"} />}
							isLoading={loading}
							onClick={async () => {
								try {
									setLoading.on();
									const data = await api.custom.post(
										"pay/internal/merchants/api_key/revoke",
										context.props.auth?.token,
										{ id: props.merchant.id }
									);
									setKey(data.api_key);
									notificationOccurred("success");
								} catch (error) {
									notificationOccurred("error");
									errorHandler(error, toast);
								} finally {
									setLoading.off();
								}
							}}
						/>
					</InputRightElement>
				</InputGroup>
			</FormControl>

			<MainButton
				text={context.getTranslation("Copy")}
				onClick={() => {
					window.navigator.clipboard.writeText(key);
					toast({ title: context.getTranslation("Copied to clipboard") });
				}}
			/>
		</Stack>
	);
}
