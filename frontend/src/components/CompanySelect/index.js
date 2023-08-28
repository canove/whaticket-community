import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import Chip from "@material-ui/core/Chip";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";

const useStyles = makeStyles(theme => ({
	chips: {
		display: "flex",
		flexWrap: "wrap",
	},
	chip: {
		margin: 2,
	},
}));

const CompanySelect = ({ selectedCompanyIds, onChange }) => {
	const classes = useStyles();
	const [companies, setCompanies] = useState([]);

    useEffect(() => {
        (async () => {
            try {
                const { data } = await api.get(`/companies`); 
                setCompanies(data);
            } catch (err) {
                toastError(err);
            }
        })();
    }, []);

	const handleChange = e => {
		onChange(e.target.value);
	};

	return (
		<div style={{ marginTop: 6 }}>
			<FormControl fullWidth margin="dense" variant="outlined">
				<InputLabel>{i18n.t("companySelect.inputLabel")}</InputLabel>
				<Select
					multiple
					labelWidth={60}
					value={selectedCompanyIds}
					onChange={handleChange}
					MenuProps={{
						anchorOrigin: {
							vertical: "bottom",
							horizontal: "left",
						},
						transformOrigin: {
							vertical: "top",
							horizontal: "left",
						},
						getContentAnchorEl: null,
					}}
					renderValue={selected => (
						<div className={classes.chips}>
							{selected?.length > 0 &&
								selected.map(id => {
									const company = companies.find(q => q.id === id);
									return company ? (
										<Chip
											key={id}
											style={{ backgroundColor: company.color }}
											variant="outlined"
											label={company.name}
											className={classes.chip}
										/>
									) : null;
								})}
						</div>
					)}
				>
					{companies.map(company => (
						<MenuItem key={company.id} value={company.id}>
							{company.name}
						</MenuItem>
					))}
				</Select>
			</FormControl>
		</div>
	);
};

export default CompanySelect;
