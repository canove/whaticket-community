import api from "../../services/api";

const useContactListItems = () => {
  const findAll = async (params) => {
    const { data } = await api.request({
      url: "/contact-list-items",
      method: "GET",
      params,
    });
    return data;
  };

  const save = async (data) => {
    const { data: responseData } = await api.request({
      url: "/contact-list-items",
      method: "POST",
      data,
    });
    return responseData;
  };

  const update = async (data) => {
    const { data: responseData } = await api.request({
      url: `/contact-list-items/${data.id}`,
      method: "PUT",
      data,
    });
    return responseData;
  };

  const deleteRecord = async (id) => {
    const { data } = await api.request({
      url: `/contact-list-items/${id}`,
      method: "DELETE",
    });
    return data;
  };

  const list = async (params) => {
    const { data } = await api.request({
      url: `/contact-list-items/list`,
      method: "GET",
      params,
    });
    return data;
  };

  return {
    save,
    update,
    deleteRecord,
    list,
    findAll,
  };
};

export default useContactListItems;
