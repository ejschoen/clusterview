import React,  {Component} from 'react';
import {CardHeader, CardContent, Card } from '@mui/material';
import Grid2 from '@mui/material/Unstable_Grid2';
import {Table,TableBody,TableCell,TableRow,TableHead,TableFooter} from "@mui/material";
import { createTheme, ThemeProvider } from '@mui/material/styles';
// @ts-ignore
import { BP2D } from 'binpackingjs';
import '@mui/lab/themeAugmentation';
import './PodRequests.css'

const { Bin, Box, Packer } = BP2D;

const MiB = 1024*1024;


const theme = createTheme({
    components: {
        MuiTableFooter: {
            styleOverrides: {
                root: {
                    '&.MuiTableFooter-root .MuiTableCell-root': {
                        fontSize: "1.0rem",
                        fontWeight: 700
                    }
                }
            }
        }
    }
})

const namespaceColors = [
    "#7f0000", "#560027", "#12005e", "#000063", "#000051", "#002171", "#002f6c", "#00363a", "#00251a",
    "#c43e00", "#870000"
];

const graphicalNamespaceColors = [
    '#8c510a','#bf812d','#dfc27d','#f6e8c3','#f5f5f5','#c7eae5','#80cdc1','#35978f','#01665e'
];

type PodRequest = {
    Name: string,
    Namespace: string,
    CPU: number,
    Memory: number
}

type NodeCapacity = {
    Memory: number,
    CPU: number
}

type PodData = {
    Capacity: NodeCapacity,
    Pods: [PodRequest]
};

interface PodMap<T> {
    [index: string]: T
}
type PodRequestsState = {
    namespaceColors: {[namespace: string]: string},
    graphicalNamespaceColors: {[namespace: string]: string},
    requests: PodMap<PodData>
}

type PodRequestsProps = {
    graphical?: boolean
}


export class PodRequests extends Component<PodRequestsProps,PodRequestsState> {
    constructor(props:PodRequestsProps) {
        super(props);
        this.state = {
            namespaceColors: {},
            graphicalNamespaceColors: {},
            requests: {}
        }
    }

    assignNamespaceColors = (requests: PodMap<PodData>) => {
        let colors: {[namespace:string]:string} = {};
        let graphicalColors: {[namespace: string]: string} = {};
        Object.keys(requests).forEach((node) => {
            let data:PodData = requests[node];
            data.Pods.forEach((request:PodRequest)=> {
                let namespace = request.Namespace;
                if (!colors[namespace]) {
                    colors[namespace] = namespaceColors[Object.keys(colors).length % namespaceColors.length];
                    graphicalColors[namespace] = graphicalNamespaceColors[Object.keys(colors).length % namespaceColors.length];
                }
            })
        })
        this.setState({namespaceColors: colors, graphicalNamespaceColors: graphicalColors});
    }

    componentDidMount() {
        fetch("/podrequests").then((data) => data.json())
            .then((requests) => {
                this.assignNamespaceColors(requests);
                this.setState({requests: requests})
            })
    }

    renderAsBinPacking = (requests: PodMap<PodData>) => {
        return Object.keys(requests).map((key: string) => {
            let data:PodData = requests[key];
            let nodeMemory = Math.max(data.Capacity.Memory/MiB, 1.0);
            let nodeCPU = Math.max(data.Capacity.CPU, 0.01);
            let nodeBin = new Bin(nodeCPU,nodeMemory);
            let podBoxes = data.Pods.map((pod)=> new Box(pod.CPU, pod.Memory/MiB));
            let packer = new Packer([nodeBin]);
            let scaleX = 1.0/1.0;
            let scaleY = 1.0/10.0;
            packer.pack(podBoxes);
            let packedBin = packer.bins[0];

            return (
                <Grid2 key={key} xs={6} sm={4} md={4} lg={3}>
                    <Card variant="outlined" raised={true}>
                        <CardHeader title={`${key}: ${Math.round(nodeMemory)}Mi, ${nodeCPU}m`}></CardHeader>
                        <CardContent sx={{width: nodeCPU*scaleX, height: nodeMemory*scaleY}}>
                            <svg width={nodeCPU*scaleX} height={nodeMemory*scaleY}>
                                {
                                    packedBin.boxes.map((box: typeof Box, boxId: number) => {
                                        let index = podBoxes.indexOf(box);
                                        let namespace="";
                                        let title="";
                                        let memory=0;
                                        let CPU = 0;
                                        if (index != -1) {
                                            let pod:PodRequest = data.Pods[index];
                                            namespace = pod.Namespace;
                                            let name = pod.Name;
                                            title = `${namespace}/${name}`;
                                            memory = pod.Memory;
                                            CPU = pod.CPU;
                                        }

                                        return (<rect key={`${boxId}`}
                                                      width={box.width}
                                                      height={box.height}
                                                      x = {box.x}
                                                      y = {box.y}
                                                      transform={`scale(${scaleX} ${scaleY})`}
                                                      style={{stroke: "#000", fill: this.state.graphicalNamespaceColors[namespace]||"#fff"}}>
                                                <title>{`${title}: ${Math.round(memory/MiB)}Mi, ${CPU}m`}</title>
                                            </rect>
                                    )
                                })}
                            </svg>
                        </CardContent>
                    </Card>
                </Grid2>
            )
        })
        return(<div></div>)
    }

    renderAsTables = (requests: PodMap<PodData>) => {
        return Object.keys(requests).map((key)=> {
            let data:PodData = requests[key];
            let totalMemory: number = 0;
            let totalCPU: number = 0;
            data.Pods.sort((x:PodRequest,y:PodRequest) => {
                let s1 = `${x.Namespace}/${x.Name}`;
                let s2 = `${y.Namespace}/${y.Name}`;
                return s1.localeCompare(s2);
            })
            return (
                <Grid2 key={key} xs={6} sm={4} md={4} lg={3}>
                    <Card variant="outlined" >
                        <CardHeader title={key}></CardHeader>
                        <Table component={CardContent} sx={{maxWidth: 600, minWidth: 300}}>
                            <TableHead >
                                <TableRow><TableCell>Pod</TableCell><TableCell>Memory</TableCell><TableCell>CPU</TableCell></TableRow>
                            </TableHead>
                            <TableBody>
                                {
                                    data.Pods.map(request => {
                                        totalMemory += request.Memory/MiB;
                                        totalCPU += request.CPU;
                                        let color = this.state.namespaceColors[request.Namespace];
                                        return (
                                            <TableRow key={`${request.Namespace}/${request.Name}`}>
                                                <TableCell sx={{color: color}}>{`${request.Namespace}/${request.Name}`}</TableCell>
                                                <TableCell sx={{color: color, textAlign: "right"}}>{`${request.Memory/MiB}`}</TableCell>
                                                <TableCell sx={{color: color, textAlign: "right"}}>{`${request.CPU}`}</TableCell>
                                            </TableRow>
                                        )})
                                }
                            </TableBody>
                            <TableFooter>
                                <TableRow>
                                    <TableCell >Total</TableCell>
                                    <TableCell sx={{textAlign: "right"}}>{`${totalMemory}`}</TableCell>
                                    <TableCell sx={{textAlign: "right"}}>{`${totalCPU}`}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell >Capacity</TableCell>
                                    <TableCell sx={{textAlign: "right"}}>{`${Math.round(data.Capacity.Memory/MiB)}`}</TableCell>
                                    <TableCell sx={{textAlign: "right"}}>{`${data.Capacity.CPU}`}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell >Free</TableCell>
                                    <TableCell sx={{textAlign: "right"}}>{`${Math.round(data.Capacity.Memory/MiB-totalMemory)}`}</TableCell>
                                    <TableCell sx={{textAlign: "right"}}>{`${data.Capacity.CPU-totalCPU}`}</TableCell>
                                </TableRow>
                            </TableFooter>
                        </Table>
                    </Card>
                </Grid2>)})
    };

    render() {
        return (
            <ThemeProvider theme={theme}>
                <Grid2 container spacing={2}>
                {
                    (this.props.graphical) ? this.renderAsBinPacking(this.state.requests) : this.renderAsTables(this.state.requests)
                }
            </Grid2>
            </ThemeProvider>
        )
    }
}