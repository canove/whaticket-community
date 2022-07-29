import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

const toastError = err => {
	const { i18n } = useTranslation();
	
	const errorMsg = err.response?.data?.message || err.response.data.error;
	if (errorMsg) {
		if (i18n.exists(`backendErrors.${errorMsg}`)) {
			toast.error(i18n.t(`backendErrors.${errorMsg}`), {
				toastId: errorMsg,
			});
		} else {
			toast.error(errorMsg, {
				toastId: errorMsg,
			});
		}
	} else {
		toast.error("An error occurred!");
	}
};

export default toastError;
