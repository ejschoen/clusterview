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
import {useCookies} from "react-cookie";


export default function ButtonAppBar() {
    const [cookies, setCookie] = useCookies(['graphical']);
    const [graphical, setGraphical] = React.useState(cookies.graphical);
    const handleOnGraphicalChange = (event:React.ChangeEvent<HTMLInputElement>) => {
        setCookie('graphical', event.target.checked, {path:'/'});
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

          </Box>

      </Box>
);
}