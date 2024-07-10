import { Center, Stack, Text } from "@chakra-ui/react";
import Lottie from "lottie-react";
import duckIDK from "../stickers/duck_idk.json";
import { getTelegram } from "../utils";

export default function NotFoundBadge({ text }: { text: string }) {
	return (
		<Center>
			<Stack
				alignItems={"center"}
				textAlign={"center"}
				direction={"column"}
				spacing={2}
			>
				<Lottie
					style={{ width: 120, height: 120 }}
					animationData={duckIDK}
					loop={false}
				/>
				<Text color={getTelegram().themeParams.hint_color}>{text}</Text>
			</Stack>
		</Center>
	);
}
