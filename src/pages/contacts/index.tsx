import {
	Heading,
	IconButton,
	Stack,
	useBoolean,
	useToast,
} from "@chakra-ui/react";
import {
	MainButton,
	useHapticFeedback,
} from "@vkruglikov/react-telegram-web-app";
import { useContext } from "react";
import { FaPencil, FaTrash } from "react-icons/fa6";
import api from "../../api/api";
import Cell from "../../components/Cell";
import CustomBackButton from "../../components/CustomBackButton";
import Loader from "../../components/Loader";
import NotFoundBadge from "../../components/NotFoundBadge";
import useContacts from "../../hooks/useContacts";
import { AppContext } from "../../providers/AppProvider";
import { HistoryContext } from "../../providers/HistoryProviders";
import { getTelegram } from "../../utils";
import errorHandler, { getTonViewer, reduceString } from "../../utils/utils";

export default function Contacts() {
	const context = useContext(AppContext);
	const router = useContext(HistoryContext);

	const { 1: notificationOccurred } = useHapticFeedback();
	const toast = useToast();
	const [loading, setLoading] = useBoolean();

	const { contacts, update: updateContacts } = useContacts();

	return !contacts ? (
		<Loader />
	) : (
		<Stack direction={"column"} spacing={2}>
			<CustomBackButton />
			<Heading
				size={"sm"}
				color={getTelegram().themeParams.hint_color}
				textTransform={"uppercase"}
			>
				{context.getTranslation("Address Book")}
			</Heading>

			{contacts.length === 0 && (
				<NotFoundBadge
					text={context.getTranslation("No Saved Addresses yet")}
				/>
			)}

			{contacts.map(contact => (
				<Cell
					title={contact.title}
					subTitle={reduceString(contact.address, 20)}
					subTitleLink={`${getTonViewer(context)}/${contact.address}`}
					additionalComponent={
						<Stack alignItems={"center"} direction={"row"} spacing={1}>
							<IconButton
								variant={"link"}
								colorScheme="button.500"
								color={getTelegram().themeParams.link_color}
								aria-label="edit"
								icon={<FaPencil />}
								onClick={() => router.push(`/contacts/edit/${contact.id}`)}
								isDisabled={loading}
							/>
							<IconButton
								variant={"link"}
								colorScheme="button.500"
								color={getTelegram().themeParams.link_color}
								aria-label="delete"
								icon={<FaTrash />}
								onClick={async () => {
									try {
										setLoading.on();
										await api.custom.post(
											"wallet/contacts/delete",
											context.props.auth?.token,
											{ id: contact.id }
										);
										await updateContacts();
										notificationOccurred("success");
									} catch (error) {
										notificationOccurred("error");
										errorHandler(error, toast);
									} finally {
										setLoading.off();
									}
								}}
								isDisabled={loading}
							/>
						</Stack>
					}
				/>
			))}

			<MainButton
				text={context.getTranslation("Add Address")}
				onClick={() => router.push("/contacts/add")}
			/>
		</Stack>
	);
}
