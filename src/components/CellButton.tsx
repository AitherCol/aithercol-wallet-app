import { Heading, Stack } from "@chakra-ui/react";
import React from "react";
import { FaChevronRight } from "react-icons/fa6";
import { getColorMap, getTelegram } from "../utils";

export interface CellButtonProps {
	icon?: React.ReactElement;
	title: string;
	onClick?: () => void;
	rightItem?: React.ReactElement;
	hideRight?: boolean;
	isDestructive?: boolean;
}

export default function CellButton({
	onClick,
	icon,
	title,
	rightItem,
	hideRight,
	isDestructive,
}: CellButtonProps) {
	const colors = getColorMap(getTelegram().themeParams.bg_color);

	return (
		<Stack
			p={3}
			w="full"
			direction={"row"}
			justifyContent={"space-between"}
			alignItems={"center"}
			borderRadius={"lg"}
			bgColor={getTelegram().themeParams.bg_color}
			onClick={onClick}
			cursor={"pointer"}
			h={!icon ? "40px" : "48px"}
			_active={{
				bgColor: colors[getTelegram().colorScheme === "dark" ? "700" : "200"],
			}}
			transitionProperty={"var(--aithercol-transition-property-common)"}
			transitionDuration={"var(--aithercol-transition-duration-normal)"}
		>
			<Stack direction={"row"} spacing={3} alignItems={"center"}>
				{icon}
				<Heading
					size={"sm"}
					color={
						isDestructive
							? getTelegram().themeParams.destructive_text_color
							: undefined
					}
				>
					{title}
				</Heading>
			</Stack>
			{!hideRight && (
				<>
					{!rightItem ? (
						<FaChevronRight color={getTelegram().themeParams.hint_color} />
					) : (
						rightItem
					)}
				</>
			)}
		</Stack>
	);
}
