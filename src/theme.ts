import { switchAnatomy } from "@chakra-ui/anatomy";
import {
	createMultiStyleConfigHelpers,
	defineStyleConfig,
	extendTheme,
} from "@chakra-ui/react";
import "./css/global.css";
import { getColorMap, getTelegram } from "./utils";

const Button = defineStyleConfig({
	variants: {
		outline: {
			borderColor: "button.500",
			color: "button.500",
		},
		solid: {
			bg: "button.500",
			color: getTelegram().themeParams.button_text_color,
		},
		defaultProps: {
			colorScheme: "button",
		},
	},
});

const FormLabel = defineStyleConfig({
	baseStyle: {
		color: getTelegram().themeParams.hint_color,
		textTransform: "uppercase",
		fontSize: "sm",
		marginBottom: "4px",
	},
});

const { definePartsStyle, defineMultiStyleConfig } =
	createMultiStyleConfigHelpers(switchAnatomy.keys);

const baseStyle = definePartsStyle({
	track: {
		bg: getTelegram().themeParams.hint_color,
		_checked: {
			bg: getTelegram().themeParams.accent_text_color,
		},
	},
});

export const switchTheme = defineMultiStyleConfig({ baseStyle });

export default extendTheme({
	styles: {
		global: {
			body: {
				color: getTelegram().themeParams.text_color,
				backgroundColor: getTelegram().themeParams.secondary_bg_color,
			},
		},
	},
	colors: {
		button: getColorMap(getTelegram().themeParams.button_color),
		destructive: getColorMap(getTelegram().themeParams.destructive_text_color),
		text: getTelegram().themeParams.text_color,
	},
	components: {
		Button,
		FormLabel,
		Switch: switchTheme,
	},
	config: {
		initialColorMode: "light",
		useSystemColorMode: false,
		cssVarPrefix: "aithercol",
	},
	fontSizes: {
		sm: "13px",
		md: "15px",
	},
});
