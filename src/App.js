import logo from './logo.svg';
import './App.css';
import { useState, useEffect } from 'react';

import { Form } from './form';
import { Preview } from './preview';
import { templates, genText } from './templates';

import city_list from './data/cities.json';
import vtLogo from './logo.png';

import { Chip, Button, Divider } from '@mui/material';
import { Container, Stack, Box } from '@mui/material';
import { FormControl, FormControlLabel, FormLabel, RadioGroup } from '@mui/material';
import { Radio, Slider } from '@mui/material';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';

import { styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import axios from 'axios';

const cities = city_list.cities;
const pairs = city_list.pairs;

function App() {

    const defaultSettings = {
        cityA: 'Genoa',
        cityB: 'Stockholm',
        travelDays: 5,
        templateId: 'default',
        bias: 1.0
    }

    const defaultText = "I'm a virtuous traveler";

    const [settings, setSettings] = useState(defaultSettings);
    const [text, setText] = useState(defaultText);
    const [tripData, setTripData] = useState({});

    function handleTemplateChange(e, value){
        const newSettings = {...settings}
        newSettings.templateId = value
        setSettings(newSettings)
    }

    function handleBiasChange(e, value){
        const newSettings = {...settings}
        newSettings.bias = value
        setSettings(newSettings)
    }

    function biasDescription(bias){
        if (bias < 0.8){
            return `${bias}. I work in the Aeronautics industry`
        }
        if (bias > 1.2){
            return `${bias}. Planet matters more than data accuracy`
        }
        return bias.toFixed(1)
    }


    useEffect(() => {
        let templateId = settings.templateId || 'default';
        let newText = genText(templates[templateId], settings, tripData); 
        setText(newText);

        axios.get(`/trip_data/${settings.cityA.toLowerCase()}-${settings.cityB.toLowerCase()}.json`).then(response => {
            setTripData(response.data);
        })
    }, [settings])

    useEffect(() => {
        let templateId = settings.templateId || 'default';
        let newText = genText(templates[templateId], settings, tripData); 
        setText(newText);
        
    }, [tripData])


    return (
        <Container>
            <Box container>
                <Box style={{ textAlign: "center"}}>
                <img src={vtLogo} width="80%" style={{maxWidth:600}}/>
        {/*<p>
                        <h1>Virtuous Travel</h1>
                        <h4>Survival kit for the virtuous traveler</h4>
                    </p>*/}
                </Box>
                <Divider style={{width:'100%'}}><Chip label="Your travel cities"></Chip></Divider>
                <Box className="form-item">
                    <Form cities={pairs} settings={settings} setSettings={setSettings}/>
                </Box>

                <Divider style={{width:'100%'}}><Chip label="Your custom settings"></Chip></Divider>
                <FormControl>
                <Stack direction={{xs: "column", md: "row"}} spacing={2}>
                    <Box sx={{ padding:2, borderRight: [0,0,'1px dashed grey'] }}>
                        <FormLabel id="style-radio-group-label">Social style</FormLabel>
                        <RadioGroup
                            aria-labelledby="style-radio-group-label"
                            defaultValue="classic"
                            name="radio-buttons-group"
                            value={settings.templateId}
                            onChange={handleTemplateChange}
                        >
                            <FormControlLabel value='default' control={<Radio />} label="Classic virtous" />
                            <FormControlLabel value='friends' control={<Radio />} label="Virtuous loner" />
                        </RadioGroup>
                    </Box>
                    <Box sx={{ padding:2, width:['80%',400]}}>
                        <FormLabel id="truth-radio-group-label">Air emission bias: {biasDescription(settings.bias)}</FormLabel>
                        <Slider name="truthBias"
                                aria-label="Bias factor" value={settings.bias}
                                onChange={handleBiasChange}
                                valueLabelDisplay='auto'
                                defaultValue={1.0} step={0.1} marks min={0.5} max={1.5}/>
                        { (settings.bias == 1.0) && <p><b>
                            CO2 emissions are calculated with a politically neutral model.
                            </b></p>}
                        { (settings.bias < 1) && <p><b>
                            CO2 emissions of air travel will be underestimated by {((1-settings.bias)*100).toFixed(0)}%
                            </b></p>}
                        { (settings.bias > 1) && <p><b>
                            CO2 emissions of air travel will be overestimated by {((settings.bias-1)*100).toFixed(0)}%
                            </b></p>}

                    </Box>
                </Stack>
                </FormControl>

                <Divider style={{width:'100%'}}><Chip label="Your social media post"></Chip></Divider>
                <Preview text={text}/>
                <Divider style={{width:'100%'}}><Chip label="Show the world"></Chip></Divider>
                <Box className="form-item">
                    <p>Share your virtuous travel post with the world! This feature is compatible with all social media platforms including
                       Twitter, LinkedIn, Facebook, Tiktok, Instagram and ... Google+.</p>
                    <Button variant="contained"
                            onClick={() => {navigator.clipboard.writeText(text)}}
                            endIcon={<ContentCopyOutlinedIcon/>}>Copy to clipboard</Button>
                </Box>
            </Box>
        </Container>
    );
}

export default App;
