import { Center, Spinner } from "@chakra-ui/react";
import { getTelegram } from "../utils";

function Loader() {
	return (
		<Center h="80svh">
			<Spinner size="xl" color={getTelegram().themeParams.accent_text_color} />
		</Center>
	);
}

export default Loader;
