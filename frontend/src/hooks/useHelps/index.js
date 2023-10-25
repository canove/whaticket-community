import api from "../../services/api";

const usePlans = () => {

    const findAll = async (params) => {
        const { data } = await api.request({
            url: `/helps`,
            method: 'GET',
            params
        });
        return data;
    }

    const list = async (params) => {
        const { data } = await api.request({
            url: '/helps/list',
            method: 'GET',
            params
        });
        return data;
    }

    const save = async (data) => {
        const { data: responseData } = await api.request({
            url: '/helps',
            method: 'POST',
            data
        });
        return responseData;
    }

    const update = async (data) => {
        const { data: responseData } = await api.request({
            url: `/helps/${data.id}`,
            method: 'PUT',
            data
        });
        return responseData;
    }

    const remove = async (id) => {
        const { data } = await api.request({
            url: `/helps/${id}`,
            method: 'DELETE'
        });
        return data;
    }

    return {
        findAll,
        list,
        save,
        update,
        remove
    }
}

export default usePlans;