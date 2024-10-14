const ProfileImage = ({ profileImage, setProfileImage }) => {

    const handleImageUpload = (event) => {
      const file = event.target.files?.[0];
      if (file) {
        const imageUrl = URL.createObjectURL(file);
        setProfileImage(imageUrl);
      }
    };
  
    const handleImageRemove = () => {
      setProfileImage(null);
    };
  
    return (
      <div>
        <Avatar src={profileImage} alt="Profile Image" style={{ width: 100, height: 100 }}>
          {!profileImage && 'U'}
        </Avatar>
  
        <div>
          <input
            accept="image/*"
            id="upload-image"
            type="file"
            style={{ display: 'none' }}
            onChange={handleImageUpload}
          />
          <label htmlFor="upload-image">
            <IconButton color="primary" aria-label="upload picture" component="span">
              <PhotoCamera />
            </IconButton>
          </label>
  
          {profileImage && (
            <IconButton color="secondary" aria-label="remove picture" onClick={handleImageRemove}>
              <DeleteIcon />
            </IconButton>
          )}
        </div>
      </div>
    );
  };
  