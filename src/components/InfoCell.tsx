import { Stack, Text } from "@chakra-ui/react";
import React from "react";
import { getTelegram } from "../utils";

export interface InfoCellProps {
	icon?: React.ReactElement;
	title: string;
	value: string;
	onClick?: () => void;
	isLink?: boolean;
}

function InfoCell({ icon, title, value, isLink, onClick }: InfoCellProps) {
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
		>
			<Stack alignItems={"center"} direction={"row"} spacing={3}>
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
						{value}
					</Text>
				</Stack>
			</Stack>
		</Stack>
	);
}

export default InfoCell;
