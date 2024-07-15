import { Box, HStack } from "@chakra-ui/react";
import { getTelegram } from "../utils";

export default function LineBar({
	data,
}: {
	data: { color: string; percent: number }[];
}) {
	return (
		<HStack
			w="100%"
			h="12px"
			spacing={0}
			borderRadius="md"
			overflow="hidden"
			bgColor={getTelegram().themeParams.secondary_bg_color}
		>
			{data.map((item, index) => (
				<Box key={index} h="100%" flex={item.percent} bg={item.color} />
			))}
		</HStack>
	);
}
