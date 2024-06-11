import { Box } from "@chakra-ui/react";
import { getTelegram } from "../utils";

function LinkedItem() {
	return (
		<Box width={"40px"} position={"relative"}>
			<Box
				borderBottom={`2px solid ${getTelegram().themeParams.hint_color}`}
				borderBottomLeftRadius={`10px`}
				borderLeft={`2px solid ${getTelegram().themeParams.hint_color}`}
				height={"40px"}
				left={"calc(50% - 1px)"}
				position={"absolute"}
				top={"-20px"}
				width={"16px"}
			></Box>
		</Box>
	);
}

export default LinkedItem;
