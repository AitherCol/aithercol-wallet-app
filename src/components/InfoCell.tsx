import { Stack, Text } from "@chakra-ui/react";
import HTMLReactParser from "html-react-parser";
import React from "react";
import { getColorMap, getTelegram } from "../utils";

export interface InfoCellProps {
	icon?: React.ReactElement;
	title: string;
	value: string;
	onClick?: () => void;
	isLink?: boolean;
	variant?: "solid" | "transparent";
	rightIcon?: React.ReactElement;
	alignItems?: "center" | "start";
}

function InfoCell({
	icon,
	title,
	value,
	isLink,
	onClick,
	variant = "solid",
	rightIcon,
	alignItems = "center",
}: InfoCellProps) {
	const colors = getColorMap(getTelegram().themeParams.bg_color);
	return (
		<Stack
			p={variant === "solid" ? 3 : 0}
			direction={"row"}
			justifyContent={"space-between"}
			alignItems={"center"}
			borderRadius={"lg"}
			bgColor={
				variant === "solid" ? getTelegram().themeParams.bg_color : "transparent"
			}
			_active={{
				bgColor: onClick
					? colors[getTelegram().colorScheme === "dark" ? "700" : "200"]
					: undefined,
			}}
			onClick={onClick}
			cursor={onClick ? "pointer" : "default"}
			transitionProperty={"var(--aithercol-transition-property-common)"}
			transitionDuration={"var(--aithercol-transition-duration-normal)"}
		>
			<Stack alignItems={alignItems} direction={"row"} spacing={3}>
				{icon}
				<Stack direction={"column"} spacing={0}>
					<Text
						color={getTelegram().themeParams.subtitle_text_color}
						fontSize={"sm"}
					>
						{title}
					</Text>

					<Text
						fontSize={"md"}
						color={
							isLink
								? getTelegram().themeParams.link_color
								: getTelegram().themeParams.text_color
						}
						fontWeight={"semibold"}
					>
						{HTMLReactParser(value)}
					</Text>
				</Stack>
			</Stack>
			{rightIcon && rightIcon}
		</Stack>
	);
}

export default InfoCell;
