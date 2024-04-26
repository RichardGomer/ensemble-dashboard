import { useAtom, Atom } from "jotai";
import { WidgetFactory, globalWidgetController } from "../state/WidgetController";
import { ensembleClient } from "../state/ConnectionState"

import { CircularProgress } from "@mui/material";

import { DashItem } from "../ui/DashItem"
import { BaseWidgetInfo, WidgetInfo } from "./WidgetTypes";
import { ContextViewFactory } from "./ContextView";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';



type ContextChartState = {
    value: { time: number, value: number }[]
    
}

type ContextChartParams = {
    device: string,
    field: string,
    numValues: number,
    title: string,
    chartType: 'bar' | 'line'
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

    const title = widget.params.title


    let chart : JSX.Element;
    if(widget.state.value) {

        console.log("Values", widget.state.value);

        widget.state.value.map((v) => {
            let d = new Date(); d.setTime(v.time * 1000);
            v.dateStr = d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0');
        });

        let dNow = new Date();
        let nowStr = dNow.getHours().toString().padStart(2, '0') + ':' + dNow.getMinutes().toString().padStart(2, '0');
        

        chart = (
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={widget.state.value}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="dateStr" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="value" stroke="#111111" />
                    <ReferenceLine x={nowStr} label="Now" />
                </LineChart>

            </ResponsiveContainer>
        );
    } else {
        chart = <CircularProgress />
    }

    return <DashItem title={title} width={3}>{chart}</DashItem>

}

/**
 * The component factory and state controller
 */
class ContextChartFactory implements WidgetFactory  {

    getType(): string {
        return 'contextchart';
    }

    getElement(widgetAtom: Atom<ContextChartWidgetInfo>) {
        return ContextChart({ widgetAtom, factory: this });
    }

    updateState(widget: ContextChartWidgetInfo, patchState: (newState: ContextChartState) => void) {

        let p = widget.params;

        ensembleClient.send(p.device, 'getContext', { 'field': p.field, 'num': p.numValues }).then((reply) => {
            console.log("Received context", reply.args);
            if(reply.args.values.length > 0)
                patchState({value: reply.args.values});
            else
                patchState({value: []});
        }, (rejected) => {
            console.error("Got an exception", rejected);
        });

    }

}

export { ContextChartFactory }

