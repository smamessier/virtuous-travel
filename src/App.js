import logo from './logo.svg';
import './App.css';
import { useState, useEffect } from 'react';

import { Form } from './form';
import { Preview } from './preview';
import { templates, genText } from './templates';

import city_list from './data/cities.json';

import { Chip, Button, Divider } from '@mui/material';
import { Container, Stack, Box} from '@mui/material';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';

import { styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import axios from 'axios';

const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
    borderTop: 'none' 
}));

const cities = city_list.cities;
const pairs = city_list.pairs;

function App() {

    const defaultSettings = {
        cityA: 'Paris',
        cityB: 'Amsterdam'
    }

    const defaultText = "I'm a virtuous traveler";

    const [settings, setSettings] = useState(defaultSettings);
    const [text, setText] = useState(defaultText);
    const [tripData, setTripData] = useState({});

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
                <Box>
                    <p>
                        <h1>Virtuous Travel</h1>
                        <h4>Survival kit for the virtuous traveler</h4>
                    </p>
                </Box>
                <Divider style={{width:'100%'}}><Chip label="Your travel cities"></Chip></Divider>
                <Box className="form-item">
                    <Form cities={pairs} settings={settings} setSettings={setSettings}/>
                </Box>
                <Divider style={{width:'100%'}}><Chip label="Your social media post"></Chip></Divider>
                <Preview text={text}/>
                <Divider style={{width:'100%'}}><Chip label="Show the world"></Chip></Divider>
                <Box className="form-item">
                    <Button variant="contained"
                            onClick={() => {navigator.clipboard.writeText(text)}}
                            endIcon={<ContentCopyOutlinedIcon/>}>Copy to clipboard</Button>
                </Box>
            </Box>
        </Container>
    );
}

export default App;
