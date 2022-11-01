import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import {SvgIcon} from "@mui/material";
import {FormGroup, FormControlLabel, Switch} from "@mui/material";
import {ReactComponent as NodeIcon} from "./node.svg";
import {ReactComponent as I2KIcon} from "./i2k.svg";
import {ReactComponent as I2KConnectIcon} from "./i2kconnect.svg";
import {PodRequests} from "./PodRequests";


export default function ButtonAppBar() {
    const [graphical, setGraphical] = React.useState(false);
    const handleOnGraphicalChange = (event:React.ChangeEvent<HTMLInputElement>) => {
        setGraphical(event.target.checked)
    }
    return (
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar>
            <IconButton
                size="large"
                edge="start"
                color="inherit"
                aria-label="menu"
                sx={{ mr: 2 }}
            >
                <SvgIcon><NodeIcon  /></SvgIcon>
            </IconButton>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Cluster Resource Requests
            </Typography>
            <FormGroup>
                <FormControlLabel
                    control={
                      <Switch checked={graphical}
                              onChange={handleOnGraphicalChange}
                              aria-label="graphical switch"/>}
                      label={graphical ? 'Table View' : 'Graphical View'}/>
            </FormGroup>
          </Toolbar>
        </AppBar>
          <Box component="main">
              <PodRequests graphical={graphical}/>
              <div style={{position: "absolute", bottom: 48, right: 48, width: 96, height: 96}}>
                  <IconButton size="large"
                              edge="start"
                              color="inherit"
                              aria-label="menu"
                              sx={{ mr: 2 , display: {xl:"none",lg:"block",md:"block"}}}
                              href="https://i2kconnect.com"
                              target="_blank">
                      <I2KIcon style={{width: 96, height: 96, opacity:"50%"}}/>
                  </IconButton>
              </div>
              <div style={{position: "absolute", bottom: 48, right: 226, width: 226, height: 96}}>
                  <IconButton size="large"
                              edge="start"
                              color="inherit"
                              aria-label="menu"
                              sx={{ mr: 2 ,display: {xs:'none',sm:'none',md:'none',lg:'none',xl:'block'}}}
                              href="https://i2kconnect.com"
                              target="_blank"
                              >
                      <I2KConnectIcon style={{width: 452, height: 96, opacity:"50%"}}/>
                  </IconButton>
              </div>
          </Box>
      </Box>
);
}