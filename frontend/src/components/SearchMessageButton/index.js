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
  const { setIsOpen } = useContext(MessageListContext);
  return (
    <Button onClick={() => setIsOpen(true)} className={classes.searchButton}>
      <Search />
    </Button>
  );
};

export default SearchMessageButton;
