import api from "../../services/api";

const useDialogflows = () => {
	const findAll = async () => {
        const { data } = await api.get("/dialogflow");
        return data;
    }

	return { findAll };
};

export default useDialogflows;
