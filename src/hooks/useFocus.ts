import { MutableRefObject, useRef } from "react";

export default function useFocus(): [
	MutableRefObject<HTMLInputElement | null>,
	() => void
] {
	const htmlElRef = useRef<HTMLInputElement | null>(null);
	const setFocus = () => {
		if (htmlElRef.current) {
			htmlElRef.current.focus();
		}
	};

	return [htmlElRef, setFocus];
}
