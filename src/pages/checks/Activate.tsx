import {
	Center,
	FormControl,
	FormLabel,
	Heading,
	Image,
	Input,
	Stack,
	Text,
	useBoolean,
	useToast,
} from "@chakra-ui/react";
import {
	MainButton,
	useHapticFeedback,
	useInitData,
} from "@vkruglikov/react-telegram-web-app";
import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../api/api";
import { CheckResponse } from "../../api/checks";
import Loader from "../../components/Loader";
import { AppContext } from "../../providers/AppProvider";
import { HistoryContext } from "../../providers/HistoryProviders";
import { getTelegram } from "../../utils";
import errorHandler, { formatBigint } from "../../utils/utils";

function Activate() {
	const [data, setData] = useState<CheckResponse>();
	const toast = useToast();
	const context = useContext(AppContext);
	const params = useParams();
	const router = useContext(HistoryContext);
	const [password, setPassword] = useState<string>("");
	const [impactOccurred, notificationOccurred, selectionChanged] =
		useHapticFeedback();
	const [initData] = useInitData();
	const [loading, setLoading] = useBoolean();

	const activate = async (response?: CheckResponse) => {
		try {
			if (!response) {
				response = data;
			}
			if (!response) {
				return;
			}
			setLoading.on();
			await api.wallet.checks.activate(
				{
					key: response.check.key || "",
					name: initData?.user?.first_name || "",
					password,
				},
				context.props.auth?.token || " "
			);
			await context.update();
			notificationOccurred("success");
			toast({
				title: context.getTranslation("success"),
				description: `${context.getTranslation(
					"you_receive)moment"
				)} ${formatBigint(response.check.amount, response.info.decimals)} ${
					response.info.symbol
				}`,
			});
			router.push("/");
		} catch (error) {
			errorHandler(error, toast);
			notificationOccurred("error");
		} finally {
			setLoading.off();
		}
	};

	useEffect(() => {
		const getData = async () => {
			try {
				const response = await api.wallet.checks.get(params.key || "");

				setData(response);

				if (!response.check.password_protected) {
					await activate(response);
				}
			} catch (error) {
				errorHandler(error, toast);
				router.push("/");
			}
		};

		getData();
	}, []);

	const isOk = !data?.check.password_protected || password.trim() !== "";

	return !data ? (
		<Loader />
	) : (
		<>
			<Center mt="36px" mb="36px">
				{isOk && (
					<MainButton
						disabled={loading}
						progress={loading}
						text={
							loading
								? context.getTranslation("activating")
								: context.getTranslation("activate")
						}
						onClick={() => activate()}
					></MainButton>
				)}

				<Stack direction={"column"} spacing={6} alignItems={"center"}>
					<Stack
						alignItems={"center"}
						textAlign={"center"}
						direction={"column"}
						spacing={3}
					>
						<Image
							src={data.info.image}
							w={"80px"}
							h="80px"
							borderRadius={"999px"}
						/>
						<Stack direction={"column"} spacing={2}>
							<Text color={getTelegram().themeParams.subtitle_text_color}>
								{context.getTranslation("check_for")}
							</Text>
							<Heading size={"2xl"}>
								{formatBigint(data.check.amount, data.info.decimals)}{" "}
								{data.info.symbol}
							</Heading>
							<Text color={getTelegram().themeParams.subtitle_text_color}>
								$
								{(
									(data.info.rate.price || 0) *
									Number(formatBigint(data.check.amount, data.info.decimals))
								).toFixed(2)}
							</Text>
						</Stack>
					</Stack>
				</Stack>
			</Center>

			{data.check.password_protected && (
				<FormControl>
					<FormLabel>{context.getTranslation("password")}</FormLabel>
					<Input
						borderColor={getTelegram().themeParams.hint_color}
						_hover={{
							borderColor: getTelegram().themeParams.hint_color,
						}}
						_focus={{
							borderColor: getTelegram().themeParams.accent_text_color,
							boxShadow: "none",
						}}
						value={password}
						onChange={e => setPassword(e.currentTarget.value)}
						inputMode="text"
						type="password"
						autoComplete="new-password"
					></Input>
				</FormControl>
			)}
		</>
	);
}

export default Activate;
