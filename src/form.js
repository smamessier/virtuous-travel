import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { Stack, Box, Slider, FormGroup } from '@mui/material';
import { Typography } from '@mui/material';

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

    function handleDayChange(e, value){
        let newSettings = {...props.settings};
        newSettings['travelDays'] = value; 
        props.setSettings(newSettings);

    }

    return (
        <Fragment>
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
        <Box sx={{ width: 300 }}>
            <Typography>Number of days traveled: {props.settings.travelDays}</Typography>
            <Slider name="travelDays"
                    aria-label="Number of travel days" value={props.settings.travelDays}
                    onChange={handleDayChange}
                    defaultValue={5} step={1} marks min={1} max={30}/>
        </Box>
        </Fragment>
    );
}

export { Form }
