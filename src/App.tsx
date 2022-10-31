import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import {SvgIcon} from "@mui/material";
import {FormGroup, FormControlLabel, Switch} from "@mui/material";
import {ReactComponent as NodeIcon} from "./node.svg";
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
                <SvgIcon><NodeIcon className="Node=Logo" /></SvgIcon>
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