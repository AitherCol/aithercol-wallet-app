import { Button, Input, InputGroup, InputRightElement } from "@chakra-ui/react";
import { getTelegram } from "../utils";

export interface AmountInputProps {
	maxValue?: string;
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	ignoreInputMode?: boolean;
}

export default function AmountInput({
	value,
	onChange,
	maxValue,
	placeholder,
	ignoreInputMode,
}: AmountInputProps) {
	return (
		<InputGroup>
			<Input
				borderColor={"transparent"}
				bgColor={getTelegram().themeParams.bg_color}
				_hover={{
					borderColor: getTelegram().themeParams.hint_color,
				}}
				_focus={{
					borderColor: getTelegram().themeParams.accent_text_color,
					boxShadow: "none",
				}}
				placeholder={placeholder}
				_placeholder={{ color: getTelegram().themeParams.hint_color }}
				value={value}
				inputMode={ignoreInputMode ? undefined : "decimal"}
				onChange={e => {
					let value = e.currentTarget.value.trim();
					if (value === "") {
						onChange("");
					}
					if (value.includes(",")) {
						value = value.replaceAll(",", ".");
					}
					if (value.startsWith(".")) {
						return;
					}
					if (value !== "-") {
						if (value.endsWith(".")) {
							if (
								!new RegExp(/^[-]?[0-9]\d*(\.\d+)?$/gm).test(
									value.replace(".", "")
								)
							) {
								return;
							}
						} else {
							if (!new RegExp(/^[-]?[0-9]\d*(\.\d+)?$/gm).test(value)) {
								return;
							}
						}
					}

					onChange(e.currentTarget.value.trim().replaceAll(",", "."));
				}}
			></Input>
			{maxValue && (
				<InputRightElement width="3.5rem">
					<Button
						color={getTelegram().themeParams.link_color}
						variant={"link"}
						h="1.75rem"
						size="sm"
						onClick={() => onChange(maxValue)}
					>
						MAX
					</Button>
				</InputRightElement>
			)}
		</InputGroup>
	);
}
