import { Container } from "@chakra-ui/react";
import React from "react";

function BaseProvider({ children }: { children: React.ReactNode }) {
	return (
		<Container maxW="full" p={4}>
			{children}
		</Container>
	);
}

export default BaseProvider;
