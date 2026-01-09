export interface Tag {
    id: number;
    name: string;
    color: string;
    userId?: number;
    createdAt: string;
    updatedAt: string;
    _count?: {
        tickets: number;
        contacts: number;
    };
}

export interface TagTicket {
    id: number;
    tagId: number;
    ticketId: number;
    tag: Tag;
    createdAt: string;
}

export interface TagContact {
    id: number;
    tagId: number;
    contactId: number;
    tag: Tag;
    createdAt: string;
}
