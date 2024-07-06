import { Divider, Heading, Stack, Text } from "@chakra-ui/react";
import { getColorMap, getTelegram } from "../utils";

export interface InfoRawCellProps {
	title: string;
	value: string;
	onClick?: () => void;
	icon?: React.ReactElement;
	variant?: "solid" | "transparent";
	divider?: boolean;
}

export default function InfoRawCell({
	title,
	value,
	onClick,
	icon,
	variant = "solid",
	divider,
}: InfoRawCellProps) {
	const colors = getColorMap(getTelegram().themeParams.bg_color);

	return (
		<Stack w="full" direction={"column"} spacing={1}>
			<Stack
				p={variant === "solid" ? 3 : 0}
				direction={"row"}
				justifyContent={"space-between"}
				alignItems={"center"}
				borderRadius={"lg"}
				bgColor={
					variant === "solid"
						? getTelegram().themeParams.bg_color
						: "transparent"
				}
				onClick={onClick}
				cursor={onClick ? "pointer" : undefined}
				h={"40px"}
				_active={{
					bgColor: onClick
						? colors[getTelegram().colorScheme === "dark" ? "700" : "200"]
						: undefined,
				}}
				transitionProperty={"var(--aithercol-transition-property-common)"}
				transitionDuration={"var(--aithercol-transition-duration-normal)"}
			>
				<Heading size={"sm"}>{title}</Heading>
				<Stack
					alignItems={"center"}
					direction={"row"}
					spacing={1}
					color={onClick ? getTelegram().themeParams.link_color : undefined}
				>
					<Text>{value}</Text>
					{icon}
				</Stack>
			</Stack>
			{divider && (
				<Divider
					borderColor={getTelegram().themeParams.section_header_text_color}
				/>
			)}
		</Stack>
	);
}
