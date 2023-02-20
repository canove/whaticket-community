import React, { useEffect } from "react";
import { FormControl, InputLabel, MenuItem, Select, TextField } from "@material-ui/core";

const types = [
    {
        name: "Nome",
        value: "name"
    },
    {
        name: "CPF",
        value: "documentNumber"
    },
    {
        name: "Telefone",
        value: "phoneNumber"
    },
    {
        name: "Var 1",
        value: "var1"
    },
    {
        name: "Var 2",
        value: "var2"
    },
    {
        name: "Var 3",
        value: "var3"
    },
    {
        name: "Var 4",
        value: "var4"
    },
    {
        name: "Var 5",
        value: "var5"
    },
    {
        name: "Custom Param",
        value: "custom"
    }
];

const ParamsSelect = ({ param, value, onChange }) => {
    const getValue = () => {
        if (types.some(type => type.value === value)) return value || "";

        return "custom";
    }

    const handleChange = (e, param) => {
        onChange(e, param);
    }

    return (
        <>
            <FormControl
                fullWidth 
                variant="outlined" 
                style={{ marginTop: "10px" }}
            >
                <InputLabel id="param-type-select-label">
                    {param}
                </InputLabel>
                <Select
                    labelId="param-type-select-label"
                    id="param-type-select"
                    label={param}
                    value={getValue()}
                    onChange={(e) => handleChange(e, param)}
                    fullWidth
                >
                    <MenuItem value={""} disabled>Parametros:</MenuItem>
                    { types.map(type => (
                        <MenuItem key={type.value} value={type.value}>{type.name}</MenuItem>
                    ))}
                </Select>
            </FormControl>
            { (getValue() === "custom") && 
                <TextField
                    label={param}
                    autoFocus
                    variant="outlined"
                    margin="dense"
                    fullWidth
                    value={value || ""}
                    onChange={(e) => {
                        handleChange(e, param)
                    }}
                />
            }
        </>
    )
}

export default ParamsSelect;