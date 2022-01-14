import React, { useEffect } from 'react';
import toastError from "../../errors/toastError";

import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";

import { Button, Divider, } from "@material-ui/core";

const LocationPreview = ({ image, link, description }) => {
    useEffect(() => {}, [image, link, description]);

    const handleLocation = async() => {
        try {
            window.open(link);
        } catch (err) {
            toastError(err);
        }
    }

    return (
		<>
			<div style={{
				minWidth: "250px",
			}}>
				<Grid container spacing={1}>
					<Grid item xs={2}>
						<img src={image} onClick={handleLocation} />
					</Grid>
					{ description && (
					<Grid item xs={9}>
						<Typography style={{ marginTop: "12px", marginLeft: "15px" }} variant="subtitle1" color="primary" gutterBottom>
							<div dangerouslySetInnerHTML={{ __html: description.replace('\\n', '<br />') }}></div>
						</Typography>
					</Grid>
					)}
					<Grid item xs={12}>
						<Divider />
						<Button
							fullWidth
							color="primary"
							onClick={handleLocation}
							disabled={!link}
						>Visualizar</Button>
					</Grid>
				</Grid>
			</div>
		</>
	);

};

export default LocationPreview;