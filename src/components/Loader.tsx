import { Center, Spinner } from "@chakra-ui/react";
import { getTelegram } from "../utils";

function Loader({ isStableHeight }: { isStableHeight?: boolean }) {
	return (
		<Center
			h={isStableHeight ? "80svh" : "var(--tg-viewport-stable-height)"}
			transition={"height 0.3s linear"}
		>
			<Spinner size="xl" color={getTelegram().themeParams.accent_text_color} />
		</Center>
	);
}

export default Loader;
