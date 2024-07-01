import React, { useContext } from "react";
import NotFound from "../pages/NotFound";
import { AppContext } from "./AppProvider";

export default function AdminProvider({
	children,
}: {
	children: React.ReactElement;
}) {
	const context = useContext(AppContext);
	return context.props.auth?.profile.is_admin ? children : <NotFound />;
}
