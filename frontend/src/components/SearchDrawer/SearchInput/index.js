import React from 'react';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import TextField from '@material-ui/core/TextField';

const SearchInput = ({ searchValue, handleChange, setSearchValue }) => {
  return (
    <div>
      <TextField
        id="standard-basic"
        label="Procurar"
        variant="standard"
        value={searchValue}
        onChange={handleChange}
      />
      <IconButton onClick={() => setSearchValue('')}>
        <CloseIcon />
      </IconButton>
    </div>
  );
};

export default SearchInput;
