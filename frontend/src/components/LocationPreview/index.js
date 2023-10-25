import React, { useEffect } from 'react';
import toastError from "../../errors/toastError";

import { Button, Divider, Typography} from "@material-ui/core";

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
				<div>
					<div style={{ float: "left" }}>
						<img src={image} alt="loc" onClick={handleLocation} style={{ width: "100px" }} />
					</div>
					{ description && (
					<div style={{ display: "flex", flexWrap: "wrap" }}>
						<Typography style={{ marginTop: "12px", marginLeft: "15px", marginRight: "15px", float: "left" }} variant="subtitle1" color="primary" gutterBottom>
							<div dangerouslySetInnerHTML={{ __html: description.replace('\\n', '<br />') }}></div>
						</Typography>
					</div>
					)}
					<div style={{ display: "block", content: "", clear: "both" }}></div>
					<div>
						<Divider />
						<Button
							fullWidth
							color="primary"
							onClick={handleLocation}
							disabled={!link}
						>Visualizar</Button>
					</div>
				</div>
			</div>
		</>
	);

};

export default LocationPreview;