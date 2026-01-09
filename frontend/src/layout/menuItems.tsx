import React from 'react';
import {
    Dashboard as DashboardIcon,
    WhatsApp as WhatsAppIcon,
    People as PeopleIcon,
    ContactPhone as ContactPhoneIcon,
    Settings as SettingsIcon,
    Group as GroupIcon,
    QuestionAnswer as ChatIcon,
    Api as ApiIcon,
    SmartToy as SmartToyIcon,
    LocalOffer as LocalOfferIcon,
    ViewKanban as ViewKanbanIcon,
    Schedule as ScheduleIcon,
    Campaign as CampaignIcon,
    Forum as ForumIcon,
} from '@mui/icons-material';

export interface MenuItem {
    title: string;
    path: string;
    icon: React.ElementType;
    roles?: string[];
}

export const menuItems: MenuItem[] = [
    {
        title: 'Dashboard',
        path: '/',
        icon: DashboardIcon,
    },
    {
        title: 'Tickets',
        path: '/tickets',
        icon: ChatIcon,
    },
    {
        title: 'Contatos',
        path: '/contacts',
        icon: ContactPhoneIcon,
    },
    {
        title: 'Conexões',
        path: '/connections',
        icon: WhatsAppIcon,
        roles: ['admin', 'supervisor'],
    },
    {
        title: 'Filas',
        path: '/queues',
        icon: GroupIcon,
        roles: ['admin'],
    },
    {
        title: 'Etiquetas',
        path: '/tags',
        icon: LocalOfferIcon,
    },
    {
        title: 'Kanban',
        path: '/kanban',
        icon: ViewKanbanIcon,
    },
    {
        title: 'Agendamentos',
        path: '/schedules',
        icon: ScheduleIcon,
    },
    {
        title: 'Campanhas',
        path: '/campaigns',
        icon: CampaignIcon,
        roles: ['admin'],
    },
    {
        title: 'Chat Interno',
        path: '/internal-chat',
        icon: ForumIcon,
    },
    {
        title: 'Usuários',
        path: '/users',
        icon: PeopleIcon,
        roles: ['admin'],
    },
    {
        title: 'Webhooks',
        path: '/webhooks',
        icon: ApiIcon,
        roles: ['admin'],
    },
    {
        title: 'Inteligência Artificial',
        path: '/prompts',
        icon: SmartToyIcon,
        roles: ['admin'],
    },
    {
        title: 'Configurações',
        path: '/settings',
        icon: SettingsIcon,
        roles: ['admin'],
    },
];
