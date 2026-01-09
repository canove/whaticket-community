import React, { useState, useEffect } from 'react';
import {
    Box,
    Chip,
    Autocomplete,
    TextField,
    CircularProgress,
} from '@mui/material';
import { toast } from 'react-toastify';
import tagService from '@/services/tagService';
import { Tag, TagTicket } from '@/types/tag';

interface TagSelectorProps {
    ticketId: number;
    readonly?: boolean;
}

const TagSelector: React.FC<TagSelectorProps> = ({ ticketId, readonly = false }) => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [allTags, setAllTags] = useState<Tag[]>([]);
    const [ticketTags, setTicketTags] = useState<TagTicket[]>([]);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        fetchData();
    }, [ticketId]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [tags, tTags] = await Promise.all([
                tagService.list(),
                tagService.getTicketTags(ticketId),
            ]);
            setAllTags(tags);
            setTicketTags(tTags);
        } catch (err) {
            console.error('Error loading tags:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddTag = async (tag: Tag) => {
        setSaving(true);
        try {
            const newTicketTag = await tagService.attachToTicket(tag.id, ticketId);
            setTicketTags((prev) => [...prev, newTicketTag]);
            setOpen(false);
        } catch (err: any) {
            const message = err.response?.data?.message || 'Erro ao adicionar etiqueta';
            toast.error(message);
        } finally {
            setSaving(false);
        }
    };

    const handleRemoveTag = async (tagId: number) => {
        if (readonly) return;
        setSaving(true);
        try {
            await tagService.detachFromTicket(tagId, ticketId);
            setTicketTags((prev) => prev.filter((tt) => tt.tagId !== tagId));
        } catch (err) {
            toast.error('Erro ao remover etiqueta');
        } finally {
            setSaving(false);
        }
    };

    // Tags already attached to ticket
    const attachedTagIds = ticketTags.map((tt) => tt.tagId);

    // Tags available to add
    const availableTags = allTags.filter((t) => !attachedTagIds.includes(t.id));

    if (loading) {
        return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={16} />
            </Box>
        );
    }

    return (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, alignItems: 'center' }}>
            {ticketTags.map((tt) => (
                <Chip
                    key={tt.id}
                    label={tt.tag.name}
                    size="small"
                    onDelete={readonly ? undefined : () => handleRemoveTag(tt.tagId)}
                    sx={{
                        bgcolor: tt.tag.color,
                        color: 'white',
                        fontWeight: 500,
                        textShadow: '0 0 2px rgba(0,0,0,0.4)',
                        '& .MuiChip-deleteIcon': {
                            color: 'rgba(255,255,255,0.7)',
                            '&:hover': {
                                color: 'white',
                            },
                        },
                    }}
                />
            ))}

            {!readonly && availableTags.length > 0 && (
                <Autocomplete
                    open={open}
                    onOpen={() => setOpen(true)}
                    onClose={() => setOpen(false)}
                    options={availableTags}
                    getOptionLabel={(option) => option.name}
                    loading={saving}
                    disabled={saving}
                    onChange={(_, value) => {
                        if (value) handleAddTag(value);
                    }}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            variant="standard"
                            placeholder="+ Etiqueta"
                            size="small"
                            sx={{ minWidth: 100, maxWidth: 150 }}
                            InputProps={{
                                ...params.InputProps,
                                disableUnderline: true,
                                endAdornment: (
                                    <>
                                        {saving ? (
                                            <CircularProgress size={16} />
                                        ) : null}
                                        {params.InputProps.endAdornment}
                                    </>
                                ),
                            }}
                        />
                    )}
                    renderOption={(props, option) => (
                        <li {...props}>
                            <Chip
                                label={option.name}
                                size="small"
                                sx={{
                                    bgcolor: option.color,
                                    color: 'white',
                                    fontWeight: 500,
                                }}
                            />
                        </li>
                    )}
                    size="small"
                />
            )}
        </Box>
    );
};

export default TagSelector;
