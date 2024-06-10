import { Center, Spinner } from "@chakra-ui/react";
import { getTelegram } from "../utils";

function Loader() {
	return (
		<Center h="80vh">
			<Spinner size="xl" color={getTelegram().themeParams.text_color} />
		</Center>
	);
}

export default Loader;
