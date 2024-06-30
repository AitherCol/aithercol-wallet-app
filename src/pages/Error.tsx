import { Center, Heading, Stack, Text } from "@chakra-ui/react";
import Lottie from "lottie-react";
import { useContext } from "react";
import { AppContext } from "../providers/AppProvider";
import duckThinkOut from "../stickers/duck_think_out.json";

function Error() {
	const context = useContext(AppContext);

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
					animationData={duckThinkOut}
					loop
				/>
				<Stack direction={"column"} spacing={2}>
					<Heading>{context.getTranslation("Oops...")}</Heading>
					<Text>
						{context.getTranslation(
							"Something happened! Don't worry, your coins are safe, try logging in later."
						)}
					</Text>
				</Stack>
			</Stack>
		</Center>
	);
}

export default Error;
