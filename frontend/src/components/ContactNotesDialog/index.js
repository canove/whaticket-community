import React, { useState, useEffect } from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import TextField from '@material-ui/core/TextField';
import List from '@material-ui/core/List';
import { makeStyles } from '@material-ui/core/styles';
import * as Yup from "yup";
import { Formik, Form, Field } from "formik";

import ContactNotesDialogListItem from '../ContactNotesDialogListItem';
import ConfirmationModal from '../ConfirmationModal';

import { toast } from "react-toastify";

import { i18n } from "../../translate/i18n";

import ButtonWithSpinner from '../ButtonWithSpinner';

import useTicketNotes from '../../hooks/useTicketNotes';

const useStyles = makeStyles((theme) => ({
    root: {
        '& .MuiTextField-root': {
            margin: theme.spacing(1),
            width: '350px',
        },
    },
    list: {
        width: '100%',
        maxWidth: '350px',
        maxHeight: '200px',
        backgroundColor: theme.palette.background.paper,
    },
    inline: {
        width: '100%'
    }
}));

const NoteSchema = Yup.object().shape({
	note: Yup.string()
		.min(2, "Too Short!")
		.required("Required")
});

export default function ContactNotesDialog ({ modalOpen, onClose, ticket }) {
    const { id: ticketId, contactId } = ticket
    const classes = useStyles()
    const [open, setOpen] = useState(false);
    const [newNote, setNewNote] = useState({ note: "" });
    const [loading, setLoading] = useState(false)
    const [showOnDeleteDialog, setShowOnDeleteDialog] = useState(false)
    const [selectedNote, setSelectedNote] = useState({})
    const [notes, setNotes] = useState([])
    const { saveNote, deleteNote, listNotes } = useTicketNotes()

    useEffect(() => {
        async function openAndFetchData () {
            if (modalOpen) {
                setOpen(true)
                handleResetState()
                await loadNotes()
            }
        }
        openAndFetchData()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [modalOpen])

    const handleResetState = () => {
        setNewNote({ note: "" })
        setLoading(false)
    }

    const handleChangeComment = (e) => {
        setNewNote({ note: e.target.value })
    }
    
    const handleClose = () => {
        setOpen(false);
        onClose()
    };

    const handleSave = async values => {
        setLoading(true)
        try {
            await saveNote({
                ...values,
                ticketId, 
                contactId
            })
            await loadNotes()
            setNewNote({ note: '' })
            toast.success('Observação adicionada com sucesso!')
        } catch (e) {
            toast.error(e)
        }
        setLoading(false)
    }

    const handleOpenDialogDelete = (item) => {
        setSelectedNote(item)
        setShowOnDeleteDialog(true)
    }

    const handleDelete = async () => {
        setLoading(true)
        try {
            await deleteNote(selectedNote.id)
            await loadNotes()
            setSelectedNote({})
            toast.success('Observação excluída com sucesso!')
        } catch (e) {
            toast.error(e)
        }
        setLoading(false)
    }

    const loadNotes = async () => {
        setLoading(true)
        try {
            const notes = await listNotes({ ticketId, contactId })
            setNotes(notes)
        } catch (e) {
            toast.error(e)
        }
        setLoading(false)
    }

    const renderNoteList = () => {
        return notes.map((note) => {
            return <ContactNotesDialogListItem 
                note={note} 
                key={note.id}
                deleteItem={handleOpenDialogDelete}
            />
        })
    }

    return (
        <>
            <ConfirmationModal
                title="Excluir Registro"
                open={showOnDeleteDialog}
                onClose={setShowOnDeleteDialog}
                onConfirm={handleDelete}
            >
                Deseja realmente excluir este registro?
            </ConfirmationModal>
            <Dialog
                open={open}
                onClose={handleClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    { i18n.t("ticketOptionsMenu.appointmentsModal.title") }
                </DialogTitle>
                <Formik
                    initialValues={newNote}
                    enableReinitialize={true}
                    validationSchema={NoteSchema}
                    onSubmit={(values, actions) => {
                        setTimeout(() => {
                            handleSave(values);
                            actions.setSubmitting(false);
                        }, 400);
                    }}
                >

                    {({ touched, errors }) => (
                        <Form>
                            <DialogContent className={classes.root} dividers>
                                <Field
                                    as={TextField}
                                    name="note"
                                    rows={3}
                                    label={i18n.t("ticketOptionsMenu.appointmentsModal.textarea")}
                                    placeholder={i18n.t("ticketOptionsMenu.appointmentsModal.placeholder")}
                                    multiline={true}
                                    error={touched.note && Boolean(errors.note)}
                                    helperText={touched.note && errors.note}
                                    variant="outlined"
                                    onChange={handleChangeComment}
                                />

                                <List className={classes.list}>
                                    { renderNoteList() }
                                </List>
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={handleClose} color="primary">
                                    Fechar
                                </Button>
                                <ButtonWithSpinner loading={loading} color="primary" type="submit" variant="contained" autoFocus>
                                    Salvar
                                </ButtonWithSpinner>
                            </DialogActions>
                        </Form>
                    )}
                </Formik>
            </Dialog>
        </>
    );
}