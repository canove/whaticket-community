import api from "../../services/api";

const useQuickMessages = () => {

    const save = async (data) => {
        const { data: responseData } = await api.request({
            url: '/quick-messages',
            method: 'POST',
            data
        });
        return responseData;
    }

    const update = async (data) => {
        const { data: responseData } = await api.request({
            url: `/quick-messages/${data.id}`,
            method: 'PUT',
            data
        });
        return responseData;
    }

    const deleteRecord = async (id) => {
        const { data } = await api.request({
            url: `/quick-messages/${id}`,
            method: 'DELETE'
        });
        return data;
    }

    const list = async (params) => {
        const { data } = await api.request({
            url: '/quick-messages/list',
            method: 'GET',
            params
        });
        return data;
    }

    return {
        save,
        update,
        deleteRecord,
        list
    }
}

export default useQuickMessages;