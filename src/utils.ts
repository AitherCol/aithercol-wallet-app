import chroma from "chroma-js";

export function getTelegram() {
	return (window as any).Telegram.WebApp;
}

export function getColorMap(color: string) {
	const LIGHTNESS_MAP = [
		0.95, 0.85, 0.75, 0.65, 0.55, 0.45, 0.35, 0.25, 0.15, 0.05,
	];
	const SATURATION_MAP = [0.32, 0.16, 0.08, 0.04, 0, 0, 0.04, 0.08, 0.16, 0.32];
	const UNKNOWN_USER_COLOR_STRING = "#000";

	const getUserColorChroma = (
		colorString: string,
		fallbackValue = UNKNOWN_USER_COLOR_STRING
	) =>
		chroma.valid(colorString) ? chroma(colorString) : chroma(fallbackValue);

	const lightnessGoal = getUserColorChroma(color).get("hsl.l");
	const closestLightness = LIGHTNESS_MAP.reduce((prev, curr) =>
		Math.abs(curr - lightnessGoal) < Math.abs(prev - lightnessGoal)
			? curr
			: prev
	);
	const baseColorIndex = LIGHTNESS_MAP.findIndex(l => l === closestLightness);
	let index = 50;
	const rawMap = LIGHTNESS_MAP.map(l =>
		getUserColorChroma(color).set("hsl.l", l)
	)
		.map(color => chroma(color))
		.map((color, i) => {
			const saturationDelta =
				SATURATION_MAP[i] - SATURATION_MAP[baseColorIndex];
			return saturationDelta >= 0
				? color.saturate(saturationDelta)
				: color.desaturate(saturationDelta * -1);
		});

	let map: any = {};
	for (const color of rawMap) {
		map[index] = color.hex();
		if (index === 50) {
			index += 50;
		} else {
			index += 100;
		}
	}
	console.log(map);
	return map;
}
