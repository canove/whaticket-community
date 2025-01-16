export interface ErrorResponse {
	data?: {
		message?: string;
		error?: string;
	};
}

export interface Error {
	response?: ErrorResponse;
}