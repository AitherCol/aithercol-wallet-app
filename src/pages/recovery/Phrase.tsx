import { Grid, Heading, Stack, Text, useToast } from "@chakra-ui/react";
import {
	MainButton,
	useHapticFeedback,
} from "@vkruglikov/react-telegram-web-app";
import Lottie from "lottie-react";
import { useContext, useEffect, useState } from "react";
import api from "../../api/api";
import CustomBackButton from "../../components/CustomBackButton";
import Loader from "../../components/Loader";
import { AppContext } from "../../providers/AppProvider";
import memo from "../../stickers/memo.json";
import { getTelegram } from "../../utils";
import errorHandler from "../../utils/utils";

export default function Phrase() {
	const context = useContext(AppContext);
	const { 1: notificationOccurred } = useHapticFeedback();
	const toast = useToast();

	const [seedPhrase, setSeedPhrase] = useState<string[]>();

	useEffect(() => {
		(async () => {
			try {
				const data = await api.custom.get(
					"auth/seed_phrase",
					context.props.auth?.token
				);
				setSeedPhrase(data.seed_phrase);
				await context.updateProfile();
			} catch (error) {
				notificationOccurred("error");
				errorHandler(error, toast);
			}
		})();
	}, []);

	return !seedPhrase ? (
		<Loader />
	) : (
		<Stack direction={"column"} spacing={4}>
			<CustomBackButton />
			<Stack alignItems={"center"} direction={"column"} spacing={2}>
				<Lottie
					style={{ width: 120, height: 120 }}
					animationData={memo}
					loop={true}
				/>
				<Heading textAlign={"center"}>
					{context.getTranslation("Recovery Phrase")}
				</Heading>
				<Text color={getTelegram().themeParams.hint_color} textAlign={"center"}>
					{context.getTranslation(
						"Write down these words with their numbers and store them in a safe place."
					)}
				</Text>
			</Stack>

			<Grid
				gridTemplateRows={"repeat(12, minmax(0px, 1fr))"}
				gridAutoFlow={"column"}
				gap={"0.5px"}
				placeContent={"space-evenly"}
				margin={"1rem 0px"}
				whiteSpace={"normal"}
			>
				{seedPhrase.map((e, key) => (
					<Text fontSize={"md"}>
						<span
							style={{
								display: "inline-block",
								color: getTelegram().themeParams.hint_color,
								width: "24px",
								userSelect: "none",
							}}
						>
							{key + 1}.
						</span>{" "}
						{e}
					</Text>
				))}
			</Grid>

			<MainButton
				text={context.getTranslation("Copy")}
				onClick={() => {
					window.navigator.clipboard.writeText(seedPhrase.join(" "));
					toast({ title: context.getTranslation("Copied to clipboard") });
				}}
			/>
		</Stack>
	);
}
