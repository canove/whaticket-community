import React, { useContext, useState } from 'react';

import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import TextField from '@material-ui/core/TextField';
import CloseIcon from '@material-ui/icons/Close';
import Drawer from '@material-ui/core/Drawer';
import Paper from '@material-ui/core/Paper';
import { Search } from '@material-ui/icons';

import { i18n } from '../../translate/i18n';
import { MessageListContext } from '../../context/MessageList/MessageListContext';

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
}));

const SearchDrawer = ({ contact }) => {
  const classes = useStyles();

  const { isOpen, setIsOpen, messagesList } = useContext(MessageListContext);
  const [searchValue, setSearchValue] = useState('');

  const handleChange = (event) => {
    setSearchValue(event.target.value);
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
            value={searchValue}
            onChange={handleChange}
            className={classes.searchInput}
          />
          <IconButton
            className={classes.resetSearch}
            onClick={() => setSearchValue('')}
          >
            <CloseIcon />
          </IconButton>
        </div>
      </div>
    </Drawer>
  );
};

export default SearchDrawer;
