import logo from './logo.svg';
import './App.css';
import { useState, useEffect } from 'react';

import { Form } from './form';
import { Preview } from './preview';
import templates from './templates';

import { Chip, Button, Divider } from '@mui/material';
import { Container, Stack, Box} from '@mui/material';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';

import { styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';

const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
    borderTop: 'none' 
}));


function App() {

    const cities = [
        "Paris",
        "Madrid",
        "New York"
    ]

    const defaultSettings = {
        cityA: cities[0],
        cityB: cities[1]
    }

    const defaultText = "I'm a virtuous traveler";

    const [settings, setSettings] = useState(defaultSettings);
    const [text, setText] = useState(defaultText);

    useEffect(() => {
        let templateId = settings.templateId || 'default';
        setText(templates[templateId](settings)); 
    }, [settings])


    return (
        <Container>
            <Box container>
                <Box>
                    <p>
                        <h1>Virtuous Travel</h1>
                        <h4>Toolkit for the virtuous traveler</h4>
                    </p>
                </Box>
                <Divider style={{width:'100%'}}><Chip label="Your travel cities"></Chip></Divider>
                <Box className="form-item">
                    <Form cities={cities} settings={settings} setSettings={setSettings}/>
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
