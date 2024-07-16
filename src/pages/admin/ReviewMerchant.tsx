import {
	Button,
	Heading,
	IconButton,
	Input,
	Select,
	Stack,
	Text,
	useToast,
} from "@chakra-ui/react";
import { useContext, useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { FaTrash } from "react-icons/fa6";
import api from "../../api/api";
import CustomBackButton from "../../components/CustomBackButton";
import { AppContext } from "../../providers/AppProvider";
import { HistoryContext } from "../../providers/HistoryProviders";
import { getTelegram } from "../../utils";
import errorHandler from "../../utils/utils";

interface FormBody {
	id: number;
	action: "accept" | "reject";
	categories: string[];
}

export default function ReviewMerchant() {
	const context = useContext(AppContext);
	const router = useContext(HistoryContext);

	const [categories, setCategories] = useState<string[]>();

	useEffect(() => {
		(async () => {
			try {
				const categories = await api.custom.get(
					"wallet/bonuses/merchants/categories",
					context.props.auth?.token
				);
				setCategories(categories.categories);
			} catch (error) {
				errorHandler(error, toast);
			}
		})();
	}, []);

	const {
		register,
		handleSubmit,
		formState: { isSubmitting },
		setValue,
		watch,
		reset,
	} = useForm<FormBody>({ defaultValues: { categories: [] } });
	const toast = useToast();

	const onSubmit: SubmitHandler<FormBody> = async data => {
		try {
			await api.custom.post(
				"admin/handle_merchant",
				context.props.auth?.token,
				{
					...data,
					categories: data.categories.length === 0 ? null : data.categories,
				}
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
					Review Merchant
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
					type="number"
					placeholder="ID"
					{...register("id", { required: true })}
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
					placeholder="Action"
					{...register("action", { required: true })}
				>
					<option value={"accept"}>Accept</option>
					<option value={"reject"}>Reject</option>
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
					placeholder="Add Category"
					onChange={e =>
						setValue("categories", [
							...(watch("categories") || []),
							e.currentTarget.value,
						])
					}
					value={""}
				>
					{categories
						?.filter(e => !watch("categories").includes(e))
						.map(e => (
							<option value={e}>{e}</option>
						))}
				</Select>

				{watch("categories").map(e => (
					<Stack
						direction={"row"}
						justifyContent={"space-between"}
						alignItems={"center"}
					>
						<Text>{e}</Text>
						<IconButton
							color={"button.500"}
							aria-label="remove"
							icon={<FaTrash />}
							colorScheme="button"
							variant={"ghost"}
							onClick={() =>
								setValue(
									"categories",
									watch("categories").filter(v => v !== e)
								)
							}
						/>
					</Stack>
				))}

				<Button type="submit" isDisabled={isSubmitting} colorScheme="button">
					Submit
				</Button>
			</Stack>
		</form>
	);
}
