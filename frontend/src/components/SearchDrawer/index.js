import React, { useContext, useEffect, useState } from 'react';

import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import TextField from '@material-ui/core/TextField';
import CloseIcon from '@material-ui/icons/Close';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import { Button, CircularProgress } from '@material-ui/core';
import Drawer from '@material-ui/core/Drawer';

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
    position: 'relative',
  },

  searchContainer: {
    display: 'flex',
    width: '310px',
    height: '48px',
    justifyContent: 'center',
    alignItems: 'flex-end',
    padding: '0 0.5rem',
    position: 'fixed',
    top: 122,
    backgroundColor: '#ededed',
    zIndex: 50,
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
    marginTop: '3rem',
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

  overlay: {
    position: 'absolute',
    width: '100%',
    top: 48,
    zIndex: 10,
    height: '2rem',
    background:
      'linear-gradient(to top, rgba(237, 237, 237, 0), rgb(237, 237, 237))',
  },

  arrowDown: {
    marginTop: '1rem',
    marginBottom: '5rem',
  },
}));

const SearchDrawer = ({ contact }) => {
  const classes = useStyles();

  const { isOpen, setIsOpen, messagesList, scrollToMessage } =
    useContext(MessageListContext);
  const [foundMessages, setFoundMessages] = useState([]);
  const [searchInputValue, setSearchInputValue] = useState('');
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [limitMult, setLimitMult] = useState(1);

  const limit = 40;
  const showSearch = foundMessages.slice(0, limit * limitMult);
  const hasMore = showSearch.length !== foundMessages.length;

  const normalizeSearchValue = (searchValue) => {
    return searchValue
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  };

  const normalizeSearchInput = normalizeSearchValue(
    searchInputValue.toLocaleLowerCase()
  );

  const handleChange = (event) => {
    setSearchInputValue(event.target.value);
  };

  const highLightMessage = (message) => {
    const trimMessage =
      message.length > 30 ? message.slice(0, 30).trim() + '...' : message;
    const selectedMessage = trimMessage.split(
      new RegExp(`(${normalizeSearchInput})`, 'gi')
    );

    const highLight = selectedMessage.map((selection, i) =>
      normalizeSearchValue(selection) === normalizeSearchInput ? (
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
    if (normalizeSearchInput.length > 1) {
      setIsLoading(true);

      const messages = messagesList.filter((message) => {
        const normalizeMessage = normalizeSearchValue(
          message.body.toLowerCase()
        );

        return normalizeMessage.includes(normalizeSearchInput);
      });
      setFoundMessages(messages);

      setIsLoading(false);
    } else {
      setFoundMessages([]);
    }
  }, [normalizeSearchInput, messagesList]);

  const loadMore = () => {
    setLoadingSearch(true);
    setTimeout(() => {
      setLimitMult((prevNum) => prevNum + 1);
      setLoadingSearch(false);
    }, 800);
  };

  const handleScroll = (e) => {
    if (!hasMore) return;
    const scrollBottom =
      e.currentTarget.scrollHeight -
      e.currentTarget.scrollTop -
      e.currentTarget.clientHeight;

    if (scrollBottom === 0) {
      document.getElementById('content').scrollBottom = 1;
    }

    if (isLoading) {
      return;
    }

    if (scrollBottom < 30) {
      loadMore();
    }
  };

  const renderIcons = () => {
    if (loadingSearch) {
      return <CircularProgress className={classes.arrowDown} size={18} />;
    }

    if (hasMore && !loadingSearch) {
      return <ArrowDropDownIcon className={classes.arrowDown} />;
    }

    return null;
  };

  const handleClose = (closeModal) => {
    if (closeModal) {
      setIsOpen(false);
    }
    setFoundMessages([]);
    setSearchInputValue('');
    setLimitMult(1);
  };

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
        <IconButton onClick={() => handleClose(true)}>
          <CloseIcon />
        </IconButton>
        <Typography style={{ justifySelf: 'center' }}>
          {i18n.t('searchDrawer.header')}
        </Typography>
      </div>

      <div className={classes.content} id="content" onScroll={handleScroll}>
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
            onClick={() => handleClose(false)}
          >
            <CloseIcon />
          </IconButton>
          <div className={classes.overlay} />
        </div>

        <div className={classes.messagesContainer}>
          {isLoading ? (
            <CircularProgress size={24} />
          ) : (
            showSearch.map((message, i) => (
              <Button
                key={i}
                className={classes.messageButton}
                onClick={() => scrollToMessage(message.id)}
              >
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
          {renderIcons()}
        </div>
      </div>
    </Drawer>
  );
};

export default SearchDrawer;
