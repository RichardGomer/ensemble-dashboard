import { useAtom, Atom } from "jotai";
import { WidgetFactory } from "../state/WidgetController";
import { ensembleClient } from "../state/ConnectionState"

import { Box, Button, CircularProgress, Typography } from "@mui/material";
import { Restaurant, Medication } from "@mui/icons-material";

import { DashItem } from "../ui/DashItem"
import { BaseWidgetInfo, WidgetInfo } from "./WidgetTypes";
import { useEffect, useState } from "react";


type DogMedsState = {
    foodTimes: number[], // Unix seconds
    medTimes: number[],  // Unix seconds
    lastSend: number,
    error: boolean,
    errorStr: string
}

type DogMedsParams = {
    title: string,
    device: string,
    foodField: string,
    medField: string,
    numValues: number,      // How many context values to fetch per field
    foodAfterMedHrs: number, // Food must be >= this long after Vetmedin
    medAfterFoodHrs: number, // Vetmedin must be >= this long after food
    medIntervalHrs: number,  // Vetmedin must be >= this long after the last dose
    resetTime?: number       // How long to show the spinner after a press
}

type DogMedsWidgetInfo = BaseWidgetInfo & {
    params: DogMedsParams,
    state: DogMedsState,
}

declare module "./WidgetTypes" {
    interface WidgetInfoTypeRepo {
        "dogmeds": DogMedsWidgetInfo
    }
}

const HOUR = 3600;

const formatTime = (unix: number) => {
    const d = new Date(unix * 1000);
    const hm = d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0');
    return d.toDateString() === new Date().toDateString() ? hm : d.toLocaleDateString(undefined, { weekday: 'short' }) + ' ' + hm;
};

const latest = (times?: number[]) => (times && times.length > 0) ? Math.max(...times) : 0;

/**
 * The react component
 */
const DogMeds = ({ widgetAtom, factory, patchState }: { widgetAtom: Atom<DogMedsWidgetInfo>, factory: WidgetFactory, patchState: (newState: Object) => void }) => {

    const [widget] = useAtom(widgetAtom);
    const p = widget.params;

    // Re-render periodically so blocks expire without waiting for a refresh
    const [, forceUpdate] = useState({});
    useEffect(() => {
        const timer = setInterval(() => forceUpdate({}), 30000);
        return () => clearInterval(timer);
    }, []);

    // Re-render when the spinner should go away
    useEffect(() => {
        if (!p.resetTime || !widget.state.lastSend) return;
        const remaining = p.resetTime - (Date.now() - widget.state.lastSend);
        if (remaining > 0) {
            const timer = setTimeout(() => forceUpdate({}), remaining);
            return () => clearTimeout(timer);
        }
    }, [widget.state.lastSend, p.resetTime]);

    const foodTimes = widget.state.foodTimes || [];
    const medTimes = widget.state.medTimes || [];

    const now = Date.now() / 1000;
    const lastFood = latest(foodTimes);
    const lastMed = latest(medTimes);

    // Work out what blocks each button
    const feedBlocks: string[] = [];
    if (lastMed && now < lastMed + p.foodAfterMedHrs * HOUR) {
        feedBlocks.push("Blocked by vetmedin at " + formatTime(lastMed));
    }

    const medBlocks: string[] = [];
    if (lastFood && now < lastFood + p.medAfterFoodHrs * HOUR) {
        medBlocks.push("Blocked by food at " + formatTime(lastFood));
    }
    if (lastMed && now < lastMed + p.medIntervalHrs * HOUR) {
        medBlocks.push("Blocked by vetmedin at " + formatTime(lastMed));
    }

    const record = (field: string, key: 'foodTimes' | 'medTimes') => {
        const t = Math.floor(Date.now() / 1000);
        const current = key === 'foodTimes' ? foodTimes : medTimes;

        // Optimistic update; the next refresh will pick up the real value
        patchState({ [key]: [...current, t], lastSend: Date.now() });

        console.log("DogMeds recording", field, "at", t, "; device is ", p.device);

        ensembleClient.send(p.device, 'updateContext', { field: field, value: 1, time: t })
            .then(() => { })
            .catch((rejected) => {
                console.log("DogMeds got an exception", rejected);
            });
    };

    // If we've sent an action recently, show a spinner
    let isActive = false;
    if (p.resetTime && widget.state.lastSend && Date.now() - widget.state.lastSend < p.resetTime) {
        isActive = true;
    }

    // History for the last 24 hours, newest first
    const cutoff = now - 24 * HOUR;
    const history = [
        ...foodTimes.map((t) => ({ t, label: 'Food' })),
        ...medTimes.map((t) => ({ t, label: 'Vetmedin' })),
    ].filter((h) => h.t >= cutoff).sort((a, b) => b.t - a.t);

    const column = (blocks: string[], onClick: () => void, Icon: typeof Restaurant, label: string) => (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
            <Button size="large" variant="contained" color="success" disabled={blocks.length > 0 || isActive} onClick={onClick}
                startIcon={<Icon fontSize="large" />}>
                {label}
            </Button>
            {blocks.map((b, i) => <Typography key={i} variant="caption" color="error">{b}</Typography>)}
        </Box>
    );

    let content;
    if (!widget.state.foodTimes || !widget.state.medTimes) {
        content = <CircularProgress />;
    } else {
        content = <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, flexBasis: '100%' }}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                {isActive ? <CircularProgress /> : <>
                    {column(feedBlocks, () => record(p.foodField, 'foodTimes'), Restaurant, 'Feed')}
                    {column(medBlocks, () => record(p.medField, 'medTimes'), Medication, 'Vetmedin')}
                </>}
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 3, justifyContent: 'flex-start' }}>
                {history.length === 0 && <Typography variant="caption" color="text.secondary">Nothing in the last 24 hours</Typography>}
                {history.map((h) => (
                    <Box key={h.label + h.t} sx={{ textAlign: 'left' }}>
                        <Typography variant="body2">{h.label}</Typography>
                        <Typography variant="caption" color="text.secondary">{formatTime(h.t)}</Typography>
                    </Box>
                ))}
            </Box>
        </Box>;
    }

    return <DashItem title={p.title} width={2}>{content}</DashItem>
}

/**
 * The component factory and state controller
 */
class DogMedsFactory implements WidgetFactory {

    getType(): string {
        return 'dogmeds';
    }

    getElement(widgetAtom: Atom<DogMedsWidgetInfo>, patchState: (newState: Object) => void) {
        return DogMeds({ widgetAtom, factory: this, patchState });
    }

    /**
     * Fetch updated state for this widget and apply it using the provided setter
     */
    updateState(widget: DogMedsWidgetInfo, patchState: (newState: Object) => void, getState?: () => WidgetInfo) {

        const p = widget.params;

        const fetchField = (field: string, key: 'foodTimes' | 'medTimes') => {
            ensembleClient.send(p.device, 'getContext', { 'field': field, 'num': p.numValues })
                .then((reply) => {
                    console.debug("DogMeds received context", field, reply.args.values);

                    const times: number[] = (reply.args.values || [])
                        .filter((v: any) => v.value !== false && v.value !== null && v.value !== undefined)
                        .map((v: any) => Number(v.time))
                        .sort((a: number, b: number) => a - b);

                    patchState({ [key]: times, error: false });
                })
                .catch(async (rejected) => {
                    // Field not set means no history; mark as loaded so the spinner clears
                    const state = await getState?.();
                    if (!state?.state?.[key]) {
                        patchState({ [key]: [] });
                    }
                });
        };

        fetchField(p.foodField, 'foodTimes');
        fetchField(p.medField, 'medTimes');
    }
}

export { DogMedsFactory, DogMeds, DogMedsWidgetInfo }