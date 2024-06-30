import { Button, Center, Heading, Stack, Text } from "@chakra-ui/react";
import Lottie from "lottie-react";
import { useContext } from "react";
import { AppContext } from "../providers/AppProvider";
import { HistoryContext } from "../providers/HistoryProviders";
import duckIDK from "../stickers/duck_idk.json";

function NotFound() {
	const context = useContext(AppContext);
	const router = useContext(HistoryContext);

	return (
		<Center h={"var(--tg-viewport-stable-height)"}>
			<Stack
				alignItems={"center"}
				textAlign={"center"}
				direction={"column"}
				spacing={4}
			>
				<Lottie
					style={{ width: 150, height: 150 }}
					animationData={duckIDK}
					loop={false}
				/>
				<Stack direction={"column"} spacing={2}>
					<Heading>{context.getTranslation("Page not found")}</Heading>
					<Text>
						{context.getTranslation(
							"Please try to come back later or return to Home."
						)}
					</Text>
				</Stack>

				<Button
					onClick={() => router.push("/")}
					minW="150px"
					colorScheme="button"
				>
					{context.getTranslation("Open Wallet")}
				</Button>
			</Stack>
		</Center>
	);
}

export default NotFound;
