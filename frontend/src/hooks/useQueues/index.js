import api from "../../services/api";
import { useContext } from 'react';
import { AuthContext } from "../../context/Auth/AuthContext";

const useQueues = () => {
    const { user } = useContext(AuthContext);

	const findAll = async () => {
        const { data } = await api.get("/queue", {
            params: { companyId: user.companyId }
        });
        return data;
    }

	return { findAll };
};

export default useQueues;
