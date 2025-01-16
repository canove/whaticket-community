import { toast } from "react-toastify";
import { i18n } from "../translate/i18n";
import { Error } from "../types/Error";

const toastError = (err: Error): void => {
  const errorMsg = err.response?.data?.message || err.response?.data?.error;
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
