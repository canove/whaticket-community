import api from "./api";

export const findAll = async (params) => {
	const { data } = await api.get("/tags", { params });
	return data;
};

export const create = async (tagData) => {
	const { data } = await api.post("/tags", tagData);
	return data;
};

export const update = async (tagId, tagData) => {
	const { data } = await api.put(`/tags/${tagId}`, tagData);
	return data;
};

export const deleteTag = async (tagId) => {
	const { data } = await api.delete(`/tags/${tagId}`);
	return data;
};