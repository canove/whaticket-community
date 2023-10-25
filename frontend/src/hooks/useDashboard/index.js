import api from "../../services/api";

const useDashboard = () => {

    const find = async (params) => {
        const { data } = await api.request({
            url: `/dashboard`,
            method: 'GET',
            params
        });
        return data;
    }

    return {
        find
    }
}

export default useDashboard;