import api from "../../services/api";

const useContactLists = () => {
  const save = async (data) => {
    const { data: responseData } = await api.request({
      url: "/contact-lists",
      method: "POST",
      data,
    });
    return responseData;
  };

  const update = async (data) => {
    const { data: responseData } = await api.request({
      url: `/contact-lists/${data.id}`,
      method: "PUT",
      data,
    });
    return responseData;
  };

  const deleteRecord = async (id) => {
    const { data } = await api.request({
      url: `/contact-lists/${id}`,
      method: "DELETE",
    });
    return data;
  };

  const findById = async (id) => {
    const { data } = await api.request({
      url: `/contact-lists/${id}`,
      method: "GET",
    });
    return data;
  };

  const list = async (params) => {
    const { data } = await api.request({
      url: "/contact-lists/list",
      method: "GET",
      params,
    });
    return data;
  };

  return {
    findById,
    save,
    update,
    deleteRecord,
    list,
  };
};

export default useContactLists;
