import { useAtom, Atom } from "jotai";
import { WidgetFactory, globalWidgetController } from "../state/WidgetController";
import { ensembleClient } from "../state/ConnectionState"

import { CircularProgress } from "@mui/material";

import { DashItem } from "../ui/DashItem"
import { BaseWidgetInfo, WidgetInfo } from "./WidgetTypes";
import { ContextViewFactory } from "./ContextView";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import Exception from "./Exception";
import { ReactNode } from "react";
import { useTheme } from "@mui/material/styles";



type ContextChartState = {
    value: { time: number, value: number }[]
    error: boolean,
    errorStr: string
}

type ContextChartParams = {
    device: string,
    field: string,
    numValues: number,
    title: string,
    chartType: 'bar' | 'line',
    lineType: string // The lineType to use for the recharts <Line> element: https://recharts.org/en-US/api/Line
}

type ContextChartWidgetInfo = BaseWidgetInfo & {
    params: ContextChartParams,
    state: ContextChartState,
}

declare module "./WidgetTypes" {
    interface WidgetInfoTypeRepo {
        "contextchart": ContextChartWidgetInfo
    }
}


/**
 * The react componenet
 */
const ContextChart = ({ widgetAtom, factory }: { widgetAtom: Atom<ContextChartWidgetInfo>, factory: WidgetFactory }) => {

    const [widget, setWidget] = useAtom(widgetAtom);

    let round = Math.round(parseFloat(widget.state.value));
    let val = isNaN(round) ? widget.state.value : round.toString();

    const title = widget.params.title;

    // Inside the ContextChart component, after the title declaration:
    const theme = useTheme();


    let chart: ReactNode;
    if (widget.state.value) {

        console.log("Values", widget.params.field, widget.state.value);

        const stroke = widget.params.colour || theme.palette.primary.main;

        let formatDate = (d: Date) => {
            return d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0');
        };

        widget.state.value.map((v) => {

            if (v.dateStr) return; // Already formatted

            let d = new Date(); d.setTime(v.time * 1000);
            v.dateStr = formatDate(d);
        });

        let dNow = new Date();
        let nowStr = formatDate(dNow);

        let lines = <>
            <Line type={widget.params.lineType} dataKey="value" stroke={stroke} strokeWidth={2} dot={false} />
            <ReferenceLine x={Math.floor(Date.now() / 1000)} stroke={theme.palette.error.main} strokeDasharray="3 3" label="Now" />
        </>

        chart = (
            <ResponsiveContainer width="100%" height={200}>
                <LineChart data={widget.state.value}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                        dataKey="time"
                        domain={['dataMin', 'dataMax']}
                        type="number"
                        scale="time"
                        tickFormatter={(unixTime) => {
                            const date = new Date(unixTime * 1000);
                            return formatDate(date);
                        }} />
                    <YAxis />
                    <Tooltip contentStyle={{ backgroundColor: theme.palette.background.paper, border: `1px solid ${theme.palette.divider}` }} 
                    labelFormatter={(label) => { return formatDate(new Date(label * 1000)); }}
                    />

                    {lines}
                </LineChart>

            </ResponsiveContainer>
        );
    } else if (widget.state.error) {
        chart = <Exception message={widget.state.errorStr} />
    } else {
        chart = <CircularProgress />
    }

    return <DashItem title={title} width={2}>{chart}</DashItem>

}

/**
 * The component factory and state controller
 */
class ContextChartFactory implements WidgetFactory {

    getType(): string {
        return 'contextchart';
    }

    getElement(widgetAtom: Atom<ContextChartWidgetInfo>) {
        return ContextChart({ widgetAtom, factory: this });
    }

    updateState(widget: ContextChartWidgetInfo, patchState: (newState: Partial<ContextChartState>) => void) {

        let p = widget.params;

        ensembleClient.send(p.device, 'getContext', { 'field': p.field, 'num': p.numValues })
            .then((reply) => {
                console.debug("Received context", p.field, "maxValues", p.numValues, reply.args.values);

                if (reply.args.values.length > 0) {
                    
                    let values = this.getDataFromReply(reply.args.values);

                    console.debug("  + Filtered values", values);
                    patchState({ value: values });
                }
                else
                    patchState({ value: [] });
            })
            .catch((rejected) => {
                //console.error("Got an exception", rejected);
                if (rejected.args.message)
                    patchState({ error: true, errorStr: rejected.args.message });
            });
    }

    protected getDataFromReply(values: any[]): { time: number, value: number }[] {
        let data: { time: number, value: number }[] = [];

        values.forEach((v) => {
            if(v.value !== false && v.value !== null && v.value !== undefined)
                data.push({ time: v.time, value: v.value });
        });

        return data;
    }

}

export { ContextChartFactory, ContextChartWidgetInfo }

