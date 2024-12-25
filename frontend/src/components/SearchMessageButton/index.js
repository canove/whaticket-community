import React, { useContext } from 'react';
import { Search } from '@material-ui/icons';
import { Button } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { MessageListContext } from '../../context/MessageList/MessageListContext';

const useStyles = makeStyles((theme) => ({
  searchButton: {
    border: 'none',
    backgroundColor: 'transparent',
    minWidth: '40px',
    marginRight: '0',
  },
}));

const SearchMessageButton = () => {
  const classes = useStyles();
  const { setIsOpen, drawerOpen, setDrawerOpen } =
    useContext(MessageListContext);
  const handleClose = () => {
    if (!drawerOpen) {
      setIsOpen(true);
    }
    setDrawerOpen(false);
    setTimeout(() => {
      setIsOpen(true);
    }, 500);
  };
  return (
    <Button onClick={handleClose} className={classes.searchButton}>
      <Search />
    </Button>
  );
};

export default SearchMessageButton;
