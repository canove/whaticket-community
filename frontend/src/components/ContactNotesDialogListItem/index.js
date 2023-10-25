import React from 'react';
import PropTypes from 'prop-types';
import IconButton from '@material-ui/core/IconButton';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Avatar from '@material-ui/core/Avatar';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import DeleteIcon from '@material-ui/icons/Delete';
import moment from 'moment';

const useStyles = makeStyles((theme) => ({
    inline: {
        width: '100%'
    }
}));

export default function ContactNotesDialogListItem (props) {
    const { note, deleteItem } = props;
    const classes = useStyles();

    const handleDelete = (item) => {
        deleteItem(item);
    }

    return (
        <ListItem alignItems="flex-start">
            <ListItemAvatar>
                <Avatar alt={note.user.name} src="/static/images/avatar/1.jpg" />
            </ListItemAvatar>
            <ListItemText
                primary={
                    <>
                        <Typography
                            component="span"
                            variant="body2"
                            className={classes.inline}
                            color="textPrimary"
                        >
                            {note.note}
                        </Typography>
                    </>
                }
                secondary={
                    <>
                        {note.user.name}, {moment(note.createdAt).format('DD/MM/YY HH:mm')}
                    </>
                }
            />
            <ListItemSecondaryAction>
                <IconButton onClick={() => handleDelete(note)} edge="end" aria-label="delete">
                    <DeleteIcon />
                </IconButton>
            </ListItemSecondaryAction>
        </ListItem>
    )   
}

ContactNotesDialogListItem.propTypes = {
    note: PropTypes.object.isRequired,
    deleteItem: PropTypes.func.isRequired
}