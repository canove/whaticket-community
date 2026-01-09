import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { format, parseISO } from 'date-fns';
import { Message as MessageType } from '@/types/message';
import { Done as DoneIcon, DoneAll as DoneAllIcon } from '@mui/icons-material';

interface MessageProps {
    message: MessageType;
}

const Message: React.FC<MessageProps> = ({ message }) => {
    const isMe = message.fromMe;

    const renderStatus = () => {
        if (!isMe) return null;
        if (message.read) return <DoneAllIcon fontSize="small" sx={{ color: '#53bdeb', fontSize: 16 }} />;
        return <DoneIcon fontSize="small" sx={{ color: '#919191', fontSize: 16 }} />;
    };

    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: isMe ? 'flex-end' : 'flex-start',
                mb: 1,
                px: 2,
            }}
        >
            <Paper
                elevation={1}
                sx={{
                    maxWidth: '70%',
                    p: 1,
                    bgcolor: isMe ? '#d9fdd3' : '#ffffff',
                    borderRadius: isMe ? '10px 0 10px 10px' : '0 10px 10px 10px',
                    position: 'relative',
                }}
            >
                <Typography variant="body2" component="div" sx={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
                    {message.body}
                </Typography>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mt: 0.5, gap: 0.5 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                        {format(parseISO(message.createdAt), 'HH:mm')}
                    </Typography>
                    {renderStatus()}
                </Box>
            </Paper>
        </Box>
    );
};

export default Message;
