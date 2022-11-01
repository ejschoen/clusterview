import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import {ReactComponent as I2KIcon} from "./i2k.svg";
import {ReactComponent as I2KConnectIcon} from "./i2kconnect.svg";
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
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
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
