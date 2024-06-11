import { defineStyleConfig, extendTheme } from "@chakra-ui/react";
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
		text: getTelegram().themeParams.text_color,
	},
	components: {
		Button,
	},
	config: {
		initialColorMode: "light",
		useSystemColorMode: false,
	},
});
