import { Suspense } from "react";
import { PrimitiveAtom, Atom, atom, useAtom } from "jotai";

import { widgetAtomsAtom, widgetCountAtom } from "../state/WidgetState";

import { WidgetInfo } from "../widgets/WidgetTypes";

import { globalWidgetController } from "../state/WidgetController";

import Grid from '@mui/material/Grid';

import { AppBar, Box, Paper, Toolbar, Typography } from "@mui/material";

/**
 * Import all our different widgets
 */

import { ContextViewFactory } from "../widgets/ContextView";
import { ContextChartFactory } from "../widgets/ContextChart";
import { ToggleSwitchFactory } from "../widgets/ToggleSwitch";

import { ConnectionStateAtom } from "../state/ConnectionState";

globalWidgetController.registerType(new ContextViewFactory());
globalWidgetController.registerType(new ContextChartFactory());
globalWidgetController.registerType(new ToggleSwitchFactory());



const WidgetList = () => {
    const [widgetAtoms] = useAtom(widgetAtomsAtom);

    return (
        <>
            {widgetAtoms.map((widgetAtom) => (
                <WidgetHolder widgetAtom={widgetAtom} key={`${widgetAtom}`} />
            ))}
        </>
    );
}

const WidgetHolder = ( { widgetAtom } : { widgetAtom: Atom<WidgetInfo>, key: string }) => {

    const [widget] = useAtom(widgetAtom);

    /**
     * Get an actual widget from the WidgetController factory
     */
    const component = globalWidgetController.getElement(widgetAtom);

    return <>{component}</>
}

import DashStatus from "./DashStatus";

import HouseIcon from '@mui/icons-material/Home';

const Dashboard = () => {

    const [connection] = useAtom(ConnectionStateAtom);

    let body;
    if(connection.connected) {
        body = <WidgetList />;
    } else {
        body = <>{connection.error ? connection.errorStr : "Connecting to Ensemble Mesh"}</>;
    }

    return <Suspense fallback="Loading...">
        <div className="App">
            
            <Paper sx={{"padding": "10px", "& > *": { margin: "10px"}}}>
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <HouseIcon /> 7 Chapel Close
                        </Box>
                    </Typography>
                    <DashStatus />
                </Toolbar>
            </AppBar>
            <Grid container spacing={1}>
                    {body}
            </Grid>
            </Paper>
        </div>
    </Suspense>;
};



export default Dashboard;