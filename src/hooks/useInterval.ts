import React from "react";

const useInterval = (callback: () => void, delay: number) => {
	const savedCallback = React.useRef();

	React.useEffect(() => {
		savedCallback.current = callback as any;
	}, [callback]);

	React.useEffect(() => {
		function tick() {
			if (savedCallback.current) {
				(savedCallback as any).current();
			}
		}
		tick();
		let id = setInterval(tick, delay);
		return () => clearInterval(id);
	}, []);
};

export default useInterval;
