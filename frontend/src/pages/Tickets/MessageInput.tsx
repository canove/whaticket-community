import React, { useState } from 'react';
import {
    Paper,
    InputBase,
    IconButton,
    Box,
    CircularProgress,
    Popover,
} from '@mui/material';
import {
    Send as SendIcon,
    AttachFile as AttachFileIcon,
    EmojiEmotions as EmojiEmotionsIcon,
} from '@mui/icons-material';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import api from '@/services/api';
import { toast } from 'react-toastify';

interface MessageInputProps {
    ticketId: number;
    disabled?: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({ ticketId, disabled }) => {
    const [loading, setLoading] = useState(false);
    const [text, setText] = useState('');
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const handleEmojiClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleEmojiClose = () => {
        setAnchorEl(null);
    };

    const handleEmojiSelect = (emoji: any) => {
        setText((prev) => prev + emoji.native);
    };

    const handleSend = async () => {
        if (!text.trim() || loading) return;

        setLoading(true);
        try {
            await api.post(`/messages/${ticketId}`, {
                body: text,
                fromMe: true,
                read: true
            });
            setText('');
        } catch (err) {
            toast.error('Erro ao enviar mensagem');
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const openEmoji = Boolean(anchorEl);

    return (
        <Paper
            component="form"
            sx={{
                p: '2px 4px',
                display: 'flex',
                alignItems: 'center',
                width: '100%',
                borderRadius: 20, // Rounded bubble style
                bgcolor: '#f0f2f5',
                boxShadow: 'none'
            }}
            onSubmit={(e) => {
                e.preventDefault();
                handleSend();
            }}
        >
            <IconButton disabled={disabled} color="primary" sx={{ p: '10px' }} onClick={handleEmojiClick}>
                <EmojiEmotionsIcon />
            </IconButton>

            <Popover
                open={openEmoji}
                anchorEl={anchorEl}
                onClose={handleEmojiClose}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                }}
                transformOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
            >
                <Picker
                    data={data}
                    onEmojiSelect={handleEmojiSelect}
                    theme="light"
                    locale="pt"
                />
            </Popover>

            <IconButton disabled={disabled} sx={{ p: '10px' }}>
                <AttachFileIcon />
            </IconButton>

            <InputBase
                sx={{ ml: 1, flex: 1 }}
                placeholder="Digite uma mensagem"
                multiline
                maxRows={4}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyPress}
                disabled={disabled}
            />

            <Box sx={{ position: 'relative' }}>
                <IconButton
                    type="submit"
                    color="primary"
                    sx={{ p: '10px' }}
                    disabled={!text.trim() || loading || disabled}
                >
                    <SendIcon />
                </IconButton>
                {loading && (
                    <CircularProgress
                        size={24}
                        sx={{
                            color: 'primary.main',
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            marginTop: '-12px',
                            marginLeft: '-12px',
                        }}
                    />
                )}
            </Box>
        </Paper>
    );
};

export default MessageInput;
