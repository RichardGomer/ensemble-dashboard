import { Suspense } from "react";
import { PrimitiveAtom, Atom, atom, useAtom } from "jotai";

import { widgetAtomsAtom, widgetCountAtom } from "../state/WidgetState";

import { WidgetInfo } from "../widgets/WidgetTypes";

import { globalWidgetController } from "../state/WidgetController";

import Grid from '@mui/material/Grid';

import { AppBar, Box, IconButton, Paper, Toolbar, Typography } from "@mui/material";

/**
 * Import all our different widgets
 */

import { ContextViewFactory } from "../widgets/ContextView";
import { ContextChartFactory } from "../widgets/ContextChart";
import { ScheduleChartFactory } from "../widgets/ScheduleChart";
import { ActionButtonFactory } from "../widgets/ActionButton";
import { BreakFactory } from "../widgets/Break";

import { ConnectionStateAtom } from "../state/ConnectionState";

globalWidgetController.registerType(new ContextViewFactory());
globalWidgetController.registerType(new ContextChartFactory());
globalWidgetController.registerType(new ScheduleChartFactory());
globalWidgetController.registerType(new ActionButtonFactory());
globalWidgetController.registerType(new BreakFactory());


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

import { Home, Fullscreen, FullscreenExit, Schedule } from "@mui/icons-material";
import { useState, useEffect } from "react";

const Dashboard = () => {

    const [connection] = useAtom(ConnectionStateAtom);

    let body;
    if(connection.connected) {
        body = <WidgetList />;
    } else {
        body = <>{connection.error ? connection.errorStr : "Connecting to Ensemble Mesh"}</>;
    }

    // Inside Dashboard component, add this state:
    const [isFullscreen, setIsFullscreen] = useState(false);

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener("fullscreenchange", handleFullscreenChange);
        return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
    }, []);

    return <Suspense fallback="Loading...">
        <div className="App">
            
            <Paper sx={{ overflow: 'hidden' }}>
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Home /> Alex, Richard and Freddie's House
                        </Box>
                    </Typography>
                    <IconButton
                        onClick={() => {
                            if (!document.fullscreenElement) {
                                document.documentElement.requestFullscreen();
                            } else {
                                document.exitFullscreen();
                            }
                        }}
                        style={{ marginRight: '16px', padding: '8px 16px' }}>

                        {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
                    </IconButton>
                    <DashStatus />
                </Toolbar>
            </AppBar>
            <Grid container spacing={1} sx={{"padding": "10px"}}>
                    {body}
            </Grid>
            </Paper>
        </div>
    </Suspense>;
};



export default Dashboard;