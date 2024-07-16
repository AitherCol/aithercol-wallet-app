import {
	Button,
	Heading,
	Input,
	Select,
	Stack,
	useToast,
} from "@chakra-ui/react";
import FilePicker from "chakra-ui-file-picker";
import { useContext } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import api from "../../../api/api";
import CustomBackButton from "../../../components/CustomBackButton";
import { AppContext } from "../../../providers/AppProvider";
import { HistoryContext } from "../../../providers/HistoryProviders";
import { getTelegram } from "../../../utils";
import errorHandler from "../../../utils/utils";

interface FormBody {
	photo: File;
	title: string;
	description: string;
	link: { type: "external" | "internal"; href: string };
	language: "en" | "ru";
}

export default function AddBonus() {
	const context = useContext(AppContext);
	const router = useContext(HistoryContext);

	const {
		register,
		handleSubmit,
		formState: { isSubmitting },
		setValue,

		reset,
	} = useForm<FormBody>();
	const toast = useToast();

	const onSubmit: SubmitHandler<FormBody> = async data => {
		try {
			await api.custom.postForm(
				"admin/bonuses/add",
				context.props.auth?.token,
				data
			);
			toast({ status: "success", title: "Success" });
			router.back();
		} catch (error) {
			errorHandler(error, toast);
		}
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)}>
			<Stack direction={"column"} spacing={2}>
				<CustomBackButton />

				<Heading
					size={"sm"}
					color={getTelegram().themeParams.hint_color}
					textTransform={"uppercase"}
				>
					Add Bonus
				</Heading>

				<FilePicker
					inputProps={{
						borderColor: "transparent",
						bgColor: getTelegram().themeParams.bg_color,
						_hover: { borderColor: getTelegram().themeParams.hint_color },
						_focus: {
							borderColor: getTelegram().themeParams.accent_text_color,
							boxShadow: "none",
						},
					}}
					placeholder="Photo"
					onFileChange={files => {
						setValue("photo", files[0]);
					}}
					accept="image/png"
					hideClearButton={true}
				/>

				<Input
					borderColor={"transparent"}
					bgColor={getTelegram().themeParams.bg_color}
					_hover={{
						borderColor: getTelegram().themeParams.hint_color,
					}}
					isDisabled={isSubmitting}
					_focus={{
						borderColor: getTelegram().themeParams.accent_text_color,
						boxShadow: "none",
					}}
					placeholder="Title"
					{...register("title", { required: true })}
				></Input>
				<Input
					borderColor={"transparent"}
					bgColor={getTelegram().themeParams.bg_color}
					_hover={{
						borderColor: getTelegram().themeParams.hint_color,
					}}
					isDisabled={isSubmitting}
					_focus={{
						borderColor: getTelegram().themeParams.accent_text_color,
						boxShadow: "none",
					}}
					placeholder="Description"
					{...register("description", { required: true })}
				></Input>

				<Select
					borderColor={"transparent"}
					bgColor={getTelegram().themeParams.bg_color}
					_hover={{
						borderColor: getTelegram().themeParams.hint_color,
					}}
					isDisabled={isSubmitting}
					_focus={{
						borderColor: getTelegram().themeParams.accent_text_color,
						boxShadow: "none",
					}}
					placeholder="Language"
					{...register("language", { required: true })}
				>
					<option value={"en"}>English</option>
					<option value={"ru"}>Russian</option>
				</Select>

				<Select
					borderColor={"transparent"}
					bgColor={getTelegram().themeParams.bg_color}
					_hover={{
						borderColor: getTelegram().themeParams.hint_color,
					}}
					isDisabled={isSubmitting}
					_focus={{
						borderColor: getTelegram().themeParams.accent_text_color,
						boxShadow: "none",
					}}
					placeholder="Link Type"
					{...register("link.type", { required: true })}
				>
					<option value={"internal"}>Internal</option>
					<option value={"external"}>External</option>
				</Select>

				<Input
					borderColor={"transparent"}
					bgColor={getTelegram().themeParams.bg_color}
					_hover={{
						borderColor: getTelegram().themeParams.hint_color,
					}}
					isDisabled={isSubmitting}
					_focus={{
						borderColor: getTelegram().themeParams.accent_text_color,
						boxShadow: "none",
					}}
					placeholder="URL"
					{...register("link.href", { required: true })}
				></Input>

				<Button type="submit" isDisabled={isSubmitting} colorScheme="button">
					Submit
				</Button>
			</Stack>
		</form>
	);
}
