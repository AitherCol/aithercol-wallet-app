import { useToast } from "@chakra-ui/react";
import { useHapticFeedback } from "@vkruglikov/react-telegram-web-app";
import { useContext, useEffect, useState } from "react";
import api from "../api/api";
import Contact from "../api/types/Contact";
import { AppContext } from "../providers/AppProvider";
import errorHandler from "../utils/utils";

export default function useContacts() {
	const context = useContext(AppContext);
	const { 1: notificationOccurred } = useHapticFeedback();
	const toast = useToast();

	const [contacts, setContacts] = useState<Contact[]>();

	const update = async () => {
		try {
			const data = await api.custom.get(
				"wallet/contacts",
				context.props.auth?.token
			);
			setContacts(data.contacts);
		} catch (error) {
			notificationOccurred("error");
			errorHandler(error, toast);
		}
	};

	useEffect(() => {
		update();
	}, []);

	return {
		contacts,
		update,
		getAddressName: (address: string) => {
			const contact = contacts?.find(e => e.address === address);
			if (contact) {
				return contact.title;
			}
			return address;
		},
	};
}
