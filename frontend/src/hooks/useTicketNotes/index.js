import api from "../../services/api";

const useTicketNotes = () => {

    const saveNote = async (data) => {
        const { data: responseData } = await api.request({
            url: '/ticket-notes',
            method: 'POST',
            data
        });
        return responseData;
    }

    const deleteNote = async (id) => {
        const { data } = await api.request({
            url: `/ticket-notes/${id}`,
            method: 'DELETE'
        });
        return data;
    }

    const listNotes = async (params) => {
        const { data } = await api.request({
            url: '/ticket-notes/list',
            method: 'GET',
            params
        });
        return data;
    }

    return {
        saveNote,
        deleteNote,
        listNotes
    }
}

export default useTicketNotes;