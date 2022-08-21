import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { Stack, Box } from '@mui/material';

import { Fragment } from 'react';

function Form(props) {

    function handleChange(e, newValue){
        let field = e.target.id.split('-')[0]
        if (!field){
            return;
        }
        let newSettings = {...props.settings};
        newSettings[field] = newValue; 
        props.setSettings(newSettings);
    }

    return (
        <Stack direction={{xs: "column", md: "row"}} spacing={2}>
            <Box>
            <Autocomplete
                id="cityA"
                value={props.settings.cityA}
                onChange={handleChange}
                options={Object.keys(props.cities)}
                sx={{ width: 300 }}
                renderInput={(params) => <TextField {...params} label="From" name="cityA" />}
            />
            </Box>
            <Box>
                <Autocomplete
                    id="cityB"
                    value={props.settings.cityB}
                    onChange={handleChange}
                    options={props.cities[props.settings.cityA]}
                    sx={{ width: 300 }}
                    renderInput={(params) => <TextField {...params} label="To" />}
                />
            </Box>
        </Stack>
    );
}

export { Form }
