import { React, Suspense } from "react";
import { PrimitiveAtom, Atom, atom, useAtom } from "jotai";

import { widgetAtomsAtom, widgetCountAtom, WidgetInfo } from "../state/WidgetState";

import "./styles.css";
import { globalWidgetController } from "../state/WidgetController";

import Grid from '@mui/material/Unstable_Grid2'; // Grid version 2


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




const WidgetCounter = () => {
    const [wcount] = useAtom(widgetCountAtom);

    return (
        <>
            {wcount} widgets
        </>
    )
}

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

const Dashboard = () => {

    const [connection] = useAtom(ConnectionStateAtom);

    let body;
    if(connection.connected) {
        body = <WidgetList />;
    } else {
        body = <>Connecting to Ensemble Mesh</>;
    }

    return <Suspense fallback="Loading...">
        <div className="App">
            <WidgetCounter />
            <Grid container spacing={2}>
                
                {body}
            </Grid>
        </div>
    </Suspense>
});

export default Dashboard;