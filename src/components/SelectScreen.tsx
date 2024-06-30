import { Heading, Image, Stack } from "@chakra-ui/react";
import { BackButton } from "@vkruglikov/react-telegram-web-app";
import { getTelegram } from "../utils";
import CellButton from "./CellButton";

export interface SelectScreenProps {
	options: { name: string; value: string; image?: string }[];
	title?: string;
	onChange: (value: string) => void;
	onClose: () => void;
}

export default function SelectScreen({
	options,
	onChange,
	onClose,
	title,
}: SelectScreenProps) {
	return (
		<Stack w="full" direction={"column"} spacing={2}>
			<BackButton onClick={() => onClose()} />

			{title && (
				<Heading
					size={"sm"}
					color={getTelegram().themeParams.hint_color}
					textTransform={"uppercase"}
				>
					{title}
				</Heading>
			)}

			{options.map(e => (
				<CellButton
					title={e.name}
					icon={
						e.image ? (
							<Image w={"24px"} h="24px" src={e.image} borderRadius="999px" />
						) : undefined
					}
					hideRight
					onClick={() => {
						onChange(e.value);
						onClose();
					}}
				/>
			))}
		</Stack>
	);
}
