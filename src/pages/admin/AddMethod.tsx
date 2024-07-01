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
import api from "../../api/api";
import CustomBackButton from "../../components/CustomBackButton";
import { AppContext } from "../../providers/AppProvider";
import { MarketContext } from "../../providers/MarketProvider";
import { getTelegram } from "../../utils";
import errorHandler from "../../utils/utils";

interface FormBody {
	name_en: string;
	name_ru?: string;
	currency: string;
	logo: File;
}

export default function AdminAddMethod() {
	const context = useContext(AppContext);
	const market = useContext(MarketContext);

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
				"admin/add_method",
				context.props.auth?.token,
				data
			);
			toast({ status: "success", title: "Success" });
			reset();
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
					Add Method to Market
				</Heading>

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
					placeholder="Name (English)"
					{...register("name_en", { required: true })}
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
					placeholder="Name (Russian)"
					{...register("name_ru", { required: false })}
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
					placeholder="Currency"
					{...register("currency", { required: true })}
				>
					{market.currencies?.map(e => (
						<option value={e}>{e}</option>
					))}
				</Select>

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
					placeholder="Logo"
					onFileChange={files => {
						setValue("logo", files[0]);
					}}
					accept="image/png"
					hideClearButton={true}
				/>

				<Button type="submit" isDisabled={isSubmitting} colorScheme="button">
					Submit
				</Button>
			</Stack>
		</form>
	);
}
