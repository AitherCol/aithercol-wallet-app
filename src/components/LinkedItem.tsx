import { Box, Center } from "@chakra-ui/react";
import { getTelegram } from "../utils";

function LinkedItem() {
	return (
		<Center w={"40px"} h="40px" minW="40px" minH="40px" maxW="40px" maxH="40px">
			<Box width={"40px"} position={"relative"}>
				<Box
					borderBottom={`2px solid ${getTelegram().themeParams.hint_color}`}
					borderBottomLeftRadius={`10px`}
					borderLeft={`2px solid ${getTelegram().themeParams.hint_color}`}
					height={"40px"}
					left={"calc(50% - 1px)"}
					position={"absolute"}
					top={"-25px"}
					width={"16px"}
				></Box>
			</Box>
		</Center>
	);
}

export default LinkedItem;
