import {
	Center,
	Collapse,
	Heading,
	Input,
	Stack,
	Text,
	useBoolean,
	useToast,
} from "@chakra-ui/react";
import {
	MainButton,
	useHapticFeedback,
} from "@vkruglikov/react-telegram-web-app";
import { useLottie } from "lottie-react";
import { useContext, useRef, useState } from "react";
import api from "../../api/api";
import CustomBackButton from "../../components/CustomBackButton";
import { AppContext } from "../../providers/AppProvider";
import { HistoryContext } from "../../providers/HistoryProviders";
import key from "../../stickers/key.json";
import { getTelegram, repeatElement, sleep } from "../../utils";
import errorHandler from "../../utils/utils";

export default function Restore() {
	const context = useContext(AppContext);
	const router = useContext(HistoryContext);
	const { 1: notificationOccurred } = useHapticFeedback();
	const toast = useToast();

	const [seedPhrase, setSeedPhrase] = useState<string[]>(repeatElement("", 24));
	const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

	const LottiePlayer = useLottie(
		{
			animationData: key,
			loop: false,
			autoplay: false,
		},
		{ width: 120, height: 120 }
	);

	const handleInputChange = (index: number, value: string) => {
		const newSeedPhrase = [...seedPhrase];
		newSeedPhrase[index] = value;
		setSeedPhrase(newSeedPhrase);
	};

	const handleKeyDown = (
		index: number,
		event: React.KeyboardEvent<HTMLInputElement>
	) => {
		if (event.key === " " || event.key === "Enter") {
			event.preventDefault(); // предотвратить ввод пробела
			if (index < inputRefs.current.length - 1) {
				inputRefs.current[index + 1]?.focus();
			}
		} else if (event.key === "Backspace" && seedPhrase[index] === "") {
			if (index > 0) {
				inputRefs.current[index - 1]?.focus();
			}
		}
	};

	const handlePaste = (
		event: React.ClipboardEvent<HTMLInputElement>,
		index: number
	) => {
		event.preventDefault();
		const paste = event.clipboardData.getData("text");
		const words = paste.split(" ");

		const newSeedPhrase = [...seedPhrase];
		let i = index;
		for (const word of words) {
			if (i < newSeedPhrase.length) {
				newSeedPhrase[i] = word;
				i++;
			} else {
				break;
			}
		}
		setSeedPhrase(newSeedPhrase);

		// Automatically focus the next input if the current one is filled
		if (index + words.length < inputRefs.current.length) {
			inputRefs.current[index + words.length]?.focus();
		} else {
			inputRefs.current[23]?.focus();
		}
	};

	const isOk = () => {
		let isOk = true;
		for (const word of seedPhrase) {
			if (word.trim() === "") {
				isOk = false;
			}
		}

		return isOk;
	};

	const [loading, setLoading] = useBoolean();

	const restore = async () => {
		try {
			setLoading.on();
			LottiePlayer.goToAndPlay(0);
			await sleep(2500);
			await api.custom.post("auth/restore", context.props.auth?.token, {
				seed_phrase: seedPhrase,
			});
			await context.update();
			toast({
				title: context.getTranslation("success"),
				description: context.getTranslation(
					"The entire wallet balance has been transferred to the current wallet."
				),
			});
			router.push("/");
		} catch (error) {
			notificationOccurred("error");
			errorHandler(error, toast);
		} finally {
			setLoading.off();
		}
	};

	return (
		<Center minH={"var(--tg-viewport-stable-height)"}>
			<Stack w="full" direction={"column"} spacing={4}>
				<CustomBackButton />
				<Stack alignItems={"center"} direction={"column"} spacing={2}>
					{LottiePlayer.View}
					<Collapse animateOpacity in={!loading}>
						<Heading textAlign={"center"}>
							{context.getTranslation("Enter your recovery phrase")}
						</Heading>
						<Text
							color={getTelegram().themeParams.hint_color}
							textAlign={"center"}
						>
							{context.getTranslation(
								"To restore access to your wallet, enter the 24 secret recovery words given to you when you created your wallet."
							)}
						</Text>
					</Collapse>
				</Stack>

				<Collapse animateOpacity in={!loading}>
					<Stack direction={"column"} spacing={2}>
						{seedPhrase.map((word, index) => (
							<Input
								key={index}
								value={word}
								onChange={e => handleInputChange(index, e.target.value)}
								onKeyDown={e => handleKeyDown(index, e)}
								onPaste={e => handlePaste(e, index)}
								borderColor={"transparent"}
								bgColor={getTelegram().themeParams.bg_color}
								_hover={{
									borderColor: getTelegram().themeParams.hint_color,
								}}
								_focus={{
									borderColor: getTelegram().themeParams.accent_text_color,
									boxShadow: "none",
								}}
								placeholder={`${index + 1}.`}
								_placeholder={{ color: getTelegram().themeParams.hint_color }}
								ref={el => (inputRefs.current[index] = el)}
							/>
						))}
					</Stack>
				</Collapse>

				{isOk() && !loading && (
					<MainButton
						text={context.getTranslation("Restore")}
						onClick={restore}
					/>
				)}
			</Stack>
		</Center>
	);
}
