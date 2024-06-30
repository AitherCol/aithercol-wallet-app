import { Menu, MenuButton, MenuItem, MenuList } from "@chakra-ui/react";
import React from "react";
import { FaCheck } from "react-icons/fa6";
import { getTelegram } from "../utils";

export interface MenuSelectProps {
	children: React.ReactElement;
	value?: string;
	options: { value: string; placeholder: string }[];
	onChange?: (value: string) => void;
}

export default function MenuSelect({
	children,
	value,
	options,
	onChange,
}: MenuSelectProps) {
	return (
		<Menu isLazy>
			<MenuButton>{children}</MenuButton>

			<MenuList bgColor={getTelegram().themeParams.bg_color}>
				{options.map(e => (
					<MenuItem
						onClick={() => {
							if (onChange) {
								onChange(e.value);
							}
						}}
						icon={value === e.value ? <FaCheck size={"16px"} /> : undefined}
						bgColor={getTelegram().themeParams.bg_color}
					>
						{e.placeholder}
					</MenuItem>
				))}
			</MenuList>
		</Menu>
	);
}
