import { useToast } from "@chakra-ui/react";
import { useHapticFeedback } from "@vkruglikov/react-telegram-web-app";
import { useContext, useEffect, useState } from "react";
import api from "../api/api";
import Contact, { TelegramContact } from "../api/types/Contact";
import { AppContext } from "../providers/AppProvider";
import { getCacheItemJSON, setCacheItem } from "../utils/cache";
import errorHandler from "../utils/utils";

export default function useContacts(telegram?: boolean) {
	const context = useContext(AppContext);
	const { 1: notificationOccurred } = useHapticFeedback();
	const toast = useToast();

	const [contacts, setContacts] = useState<Contact[]>(
		getCacheItemJSON("contacts")
	);
	const [telegramContacts, setTelegramContacts] = useState<TelegramContact[]>(
		getCacheItemJSON("telegram_contacts")
	);

	const update = async () => {
		try {
			const data = await api.custom.get(
				`wallet/contacts${telegram ? "/telegram" : ""}`,
				context.props.auth?.token
			);
			if (telegram) {
				setTelegramContacts(data.contacts);
				setCacheItem("telegram_contacts", JSON.stringify(data.contacts));
			} else {
				setContacts(data.contacts);
				setCacheItem("contacts", JSON.stringify(data.contacts));
			}
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
		telegramContacts,
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
