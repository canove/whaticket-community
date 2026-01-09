import React, { useState } from 'react';
import { Grid, Box } from '@mui/material';
import TicketList from './TicketList';
import TicketChat from './TicketChat';
import { Ticket } from '@/types/ticket';

const Tickets: React.FC = () => {
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

    return (
        <Box sx={{ height: 'calc(100vh - 88px)', display: 'flex' }}> {/* 88px = 64px appbar + 24px padding */}
            <Grid container spacing={2} sx={{ height: '100%' }}>
                <Grid item xs={12} md={4} lg={3} sx={{ height: '100%' }}>
                    <TicketList
                        onSelectTicket={setSelectedTicket}
                        selectedTicketId={selectedTicket?.id}
                    />
                </Grid>
                <Grid item xs={12} md={8} lg={9} sx={{ height: '100%' }}>
                    <TicketChat ticket={selectedTicket} />
                </Grid>
            </Grid>
        </Box>
    );
};

export default Tickets;
