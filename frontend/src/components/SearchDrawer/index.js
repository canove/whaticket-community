import React, { useContext, useEffect, useState } from 'react';

import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import TextField from '@material-ui/core/TextField';
import CloseIcon from '@material-ui/icons/Close';
import { Button, CircularProgress } from '@material-ui/core';
import Drawer from '@material-ui/core/Drawer';
import Paper from '@material-ui/core/Paper';
import { Search } from '@material-ui/icons';

import { i18n } from '../../translate/i18n';
import { MessageListContext } from '../../context/MessageList/MessageListContext';
import formatDate from '../../utils/formatDate';

const drawerWidth = 320;

const useStyles = makeStyles((theme) => ({
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerPaper: {
    width: drawerWidth,
    display: 'flex',
    borderTop: '1px solid rgba(0, 0, 0, 0.12)',
    borderRight: '1px solid rgba(0, 0, 0, 0.12)',
    borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  },
  header: {
    display: 'flex',
    borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
    backgroundColor: '#eee',
    alignItems: 'center',
    padding: theme.spacing(0, 1),
    minHeight: '73px',
    justifyContent: 'flex-start',
  },
  content: {
    display: 'flex',
    backgroundColor: '#eee',
    flexDirection: 'column',
    padding: '8px 0px 8px 8px',
    height: '100%',
    overflowY: 'scroll',
    ...theme.scrollbarStyles,
  },

  searchContainer: {
    display: 'flex',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'flex-end',
    padding: '0 0.5rem',
  },

  searchInput: {
    width: '100%',
  },

  resetSearch: {
    margin: '0',
    padding: '0',
  },

  messagesContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginTop: '2rem',
  },

  messageButton: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    width: '100%',
    height: '80px',
    borderBottom: '0.5px solid #9c9c9c',
    borderRadius: '0',
    textTransform: 'none',
    padding: '1rem 0.5rem',
  },

  date: {
    margin: '0',
    fontSize: '13px',
    opacity: '70%',
  },

  messageSection: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    width: '100%',
  },

  message: {
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    width: '100%',
  },

  userName: {
    marginRight: '0.3rem',
  },

  highlightMessage: {
    backgroundColor: 'yellow',
  },
}));

const SearchDrawer = ({ contact }) => {
  const classes = useStyles();

  const { isOpen, setIsOpen, messagesList } = useContext(MessageListContext);
  const [foundMessages, setFoundMessages] = useState([]);
  const [searchInputValue, setSearchInputValue] = useState('');
  const [loading, setIsLoading] = useState(false);

  const handleChange = (event) => {
    setSearchInputValue(event.target.value.toLowerCase());
  };

  console.log(foundMessages);

  const highLightMessage = (message) => {
    const trimMessage =
      message.length > 30 ? message.slice(0, 30).trim() + '...' : message;
    const selectedMessage = trimMessage.split(
      new RegExp(`(${searchInputValue})`, 'gi')
    );

    const highLight = selectedMessage.map((selection, i) =>
      selection.toLowerCase() === searchInputValue ? (
        <span className={classes.highlightMessage} key={i}>
          {selection}
        </span>
      ) : (
        <span key={i}>{selection}</span>
      )
    );

    return highLight;
  };

  useEffect(() => {
    if (searchInputValue.length > 1) {
      setTimeout(() => {
        const messages = messagesList.filter((message) =>
          message.body.toLowerCase().includes(searchInputValue)
        );
        setFoundMessages(messages);
      }, 1000);
    } else {
      setFoundMessages([]);
    }
  }, [searchInputValue, messagesList]);

  return (
    <Drawer
      className={classes.drawer}
      variant="persistent"
      anchor="right"
      open={isOpen}
      PaperProps={{ style: { position: 'absolute' } }}
      BackdropProps={{ style: { position: 'absolute' } }}
      ModalProps={{
        container: document.getElementById('drawer-container'),
        style: { position: 'absolute' },
      }}
      classes={{
        paper: classes.drawerPaper,
      }}
    >
      <div className={classes.header}>
        <IconButton onClick={() => setIsOpen(false)}>
          <CloseIcon />
        </IconButton>
        <Typography style={{ justifySelf: 'center' }}>
          {i18n.t('searchDrawer.header')}
        </Typography>
      </div>

      <div className={classes.content}>
        <div className={classes.searchContainer}>
          <TextField
            id="standard-basic"
            label="Procurar"
            variant="standard"
            value={searchInputValue}
            onChange={handleChange}
            className={classes.searchInput}
          />
          <IconButton
            className={classes.resetSearch}
            onClick={() => setSearchInputValue('')}
          >
            <CloseIcon />
          </IconButton>
        </div>

        <div className={classes.messagesContainer}>
          {loading ? (
            <CircularProgress size={24} />
          ) : (
            foundMessages.map((message, i) => (
              <Button key={i} className={classes.messageButton}>
                <div className={classes.messageSection}>
                  <p className={classes.date}>
                    {formatDate(message.createdAt)}
                  </p>
                  <div className={classes.message}>
                    <span className={classes.userName}>
                      {message.contact ? `${message.contact.name}:` : 'Você:'}
                    </span>
                    <span>{highLightMessage(message.body)}</span>
                  </div>
                </div>
              </Button>
            ))
          )}
        </div>
      </div>
    </Drawer>
  );
};

export default SearchDrawer;
