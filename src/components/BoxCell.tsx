import { Box, Heading, Stack, Text } from "@chakra-ui/react";
import React from "react";
import { getColorMap, getTelegram } from "../utils";

export interface BoxCellProps {
	title: string;
	description?: string;
	customComponent?: React.ReactElement;
	onClick?: () => void;
	spacing?: number | "auto";
}

export default function BoxCell({
	title,
	description,
	customComponent,
	onClick,
	spacing = 1,
}: BoxCellProps) {
	const colors = getColorMap(getTelegram().themeParams.bg_color);

	return (
		<Stack
			direction={"column"}
			spacing={0}
			minH="92px"
			onClick={onClick}
			bgColor={getTelegram().themeParams.bg_color}
			p={3}
			borderRadius={"lg"}
			cursor={onClick ? "pointer" : undefined}
			_active={{
				bgColor: onClick
					? colors[getTelegram().colorScheme === "dark" ? "700" : "200"]
					: undefined,
			}}
			transitionProperty={"var(--aithercol-transition-property-common)"}
			transitionDuration={"var(--aithercol-transition-duration-normal)"}
		>
			<Heading size={"md"}>{title}</Heading>
			{description && (
				<Text mt={spacing} fontSize={"md"}>
					{description}
				</Text>
			)}

			{customComponent && <Box mt={spacing}>{customComponent}</Box>}
		</Stack>
	);
}
