import { useAtom, Atom } from "jotai";
import { WidgetFactory, globalWidgetController } from "../state/WidgetController";
import { ensembleClient } from "../state/ConnectionState"

import { CircularProgress } from "@mui/material";

import { DashItem } from "../ui/DashItem"
import { BaseWidgetInfo } from "./WidgetTypes";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import Exception from "./Exception";
import { ReactNode } from "react";
import { useTheme } from "@mui/material/styles";



type ContextChartState = {
    values: Record<number, { time: number, value: number, dateStr?: string }[]>
    error: boolean,
    errorStr: string
}

type ContextChartParams = {
    title: string, 
    data: Record<number, {
        device: string,
        field: string,
        numValues: number,
        chartType: 'bar' | 'line',
        lineType: string // The lineType to use for the recharts <Line> element: https://recharts.org/en-US/api/Line
    }>
};


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

    const [widget, setWidget] : [ContextChartWidgetInfo, (newState: Partial<ContextChartWidgetInfo>) => void] = useAtom(widgetAtom);

    const title = widget.params.title;

    // Inside the ContextChart component, after the title declaration:
    const theme = useTheme();

    //console.debug("Rendering ContextChart", title, "with state", widget.state);

    let chart: ReactNode;
    if (widget.state.values) {
    
        let formatDate = (d: Date) => {
            return d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0');
        };

        let dNow = new Date();
        let nowStr = formatDate(dNow);

        // Process each data item into a <Line> element, and also format the time values into date strings for the tooltip
        let graphlines = Object.entries(widget.params.data).map(([id, d]) => {

            if (!widget.state.values[id] || widget.state.values[id].length === 0) {
                console.warn("No data for field " + id, widget.state.values);
                return null;
            }
        
            let values = widget.state.values[id];
            //console.log("Chart Values", widget.params.data[id].field, values);

            if (values.length === 0) return;

            values.map((v) => {
                if (v.dateStr) return; // Already formatted

                let d = new Date(); d.setTime(v.time * 1000);
                v.dateStr = formatDate(d);
            });

            const stroke = widget.params.data[id].colour || theme.palette.primary.main;
            return <Line 
                key={id} 
                type={widget.params.data[id].lineType} 
                dataKey={id} 
                name={widget.params.data[id].field}
                stroke={stroke} 
                strokeWidth={2} 
                dot={false}
                connectNulls={true}
            />
        });


        // Transform data from Record<id, Array<{time, value}>> to Array<{time, id1: value, id2: value, ...}>
        const timeMap = new Map<number, Record<string, number>>();
        
        Object.entries(widget.state.values).forEach(([id, dataPoints]) => {
            dataPoints.forEach(point => {
                if (!timeMap.has(point.time)) {
                    timeMap.set(point.time, { time: point.time });
                }
                timeMap.get(point.time)![id] = point.value;
            });
        });
        
        const chartData = Array.from(timeMap.values()).sort((a, b) => a.time - b.time);


        let lines = <>
            {graphlines}
            <ReferenceLine x={Math.floor(Date.now() / 1000)} stroke={theme.palette.error.main} strokeDasharray="3 3" label="Now" />
        </>

        chart = (
            <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData}>
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
                    <Legend />
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

    updateState(widget: ContextChartWidgetInfo, patchState: (newState: Partial<ContextChartState>, key?: PropertyKey) => void) {

        let p = widget.params;

        for (let [id, d] of Object.entries(p.data) as [string, ContextChartParams['data'][number]][]) {

            ((fieldID) => { // Trap current value of id in a closure

                ensembleClient.send(d.device, 'getContext', { 'field': d.field, 'num': d.numValues })
                    .then((reply) => {
                        //console.debug("Chart received context", d.field, "maxValues", d.numValues, reply.args.values);

                        if (reply.args.values.length > 0) {

                            let values = this.getDataFromReply(reply.args.values);

                            //console.debug("  + Filtered values", values);

                            patchState({ [fieldID]: values }, 'values');
                        }
                    })
                    .catch((rejected) => {
                        console.error("Chart got an exception", rejected);
                        if (rejected.args && rejected.args.message)
                            patchState({ error: true, errorStr: rejected.args.message });
                    });

            })(id);
        }
    }

    protected getDataFromReply(values: any[]): { time: number, value: number }[] {
        let data: { time: number, value: number }[] = [];

        values.forEach((v) => {
            if (v.value !== false && v.value !== null && v.value !== undefined)
                data.push({ time: v.time, value: v.value });
        });

        return data;
    }

}

export { ContextChartFactory, ContextChartWidgetInfo }

