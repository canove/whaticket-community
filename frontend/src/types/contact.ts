export interface ContactExtraInfo {
    id?: number;
    name: string;
    value: string;
}

export interface Contact {
    id: number;
    name: string;
    number: string;
    email: string;
    profilePicUrl: string;
    extraInfo: ContactExtraInfo[];
    pushname?: string;
    isGroup: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface ContactListResponse {
    contacts: Contact[];
    count: number;
    hasMore: boolean;
}

export interface ContactParams {
    searchParam?: string;
    pageNumber?: string;
}
