import { Heading, Stack, Text } from "@chakra-ui/react";
import React from "react";
import { getColorMap, getTelegram } from "../utils";

export interface CellProps {
	icon?: React.ReactElement;
	title: string;
	subTitle?: string;
	additional?: { title: string; subTitle?: string };
	onClick?: () => void;
}

function Cell({ icon, title, subTitle, additional, onClick }: CellProps) {
	const colors = getColorMap(getTelegram().themeParams.bg_color);

	return (
		<Stack
			p={3}
			direction={"row"}
			justifyContent={"space-between"}
			alignItems={"center"}
			borderRadius={"lg"}
			bgColor={getTelegram().themeParams.bg_color}
			onClick={onClick}
			cursor={onClick ? "pointer" : "default"}
			_active={{
				bgColor: onClick
					? colors[getTelegram().colorScheme === "dark" ? "700" : "200"]
					: "",
			}}
			transitionProperty={"var(--aithercol-transition-property-common)"}
			transitionDuration={"var(--aithercol-transition-duration-normal)"}
		>
			<Stack alignItems={"center"} direction={"row"} spacing={3}>
				{icon}
				<Stack direction={"column"} spacing={0}>
					<Heading size={"sm"}>{title}</Heading>
					{subTitle && (
						<Text
							fontSize={"sm"}
							color={getTelegram().themeParams.subtitle_text_color}
						>
							{subTitle}
						</Text>
					)}
				</Stack>
			</Stack>
			{additional && (
				<Stack alignItems={"end"} direction={"column"} spacing={0}>
					<Heading size={"sm"}>{additional.title}</Heading>
					{additional.subTitle && (
						<Text
							fontSize={"sm"}
							color={getTelegram().themeParams.subtitle_text_color}
						>
							{additional.subTitle}
						</Text>
					)}
				</Stack>
			)}
		</Stack>
	);
}

export default Cell;
