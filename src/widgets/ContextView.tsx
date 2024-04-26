import { useAtom, Atom } from "jotai";
import { WidgetFactory, globalWidgetController } from "../state/WidgetController";
import { ensembleClient } from "../state/ConnectionState"

import { CircularProgress, Typography } from "@mui/material";

import { DashItem } from "../ui/DashItem"
import { BaseWidgetInfo, WidgetInfo } from "./WidgetTypes";



type ContextViewState = {
    value: string
}

type ContextViewParams = {
    device: string,
    field: string,
    pre: string,
    post: string,
    title: string
}

type ContextViewWidgetInfo = BaseWidgetInfo & {
    params: ContextViewParams,
    state: ContextViewState,
}

declare module "./WidgetTypes" {
    interface WidgetInfoTypeRepo {
        "contextview": ContextViewWidgetInfo
    }
}


/**
 * The react componenet
 */
const ContextView = ({ widgetAtom, factory }: { widgetAtom: Atom<ContextViewWidgetInfo>, factory: WidgetFactory }) => {

    const [widget, setWidget] = useAtom(widgetAtom);

    let round = Math.round(parseFloat(widget.state.value));
    let val = isNaN(round) ? widget.state.value : round.toString();


    const value = widget.state.value ? ( widget.params.pre + val + widget.params.post ) : <CircularProgress />
    const title = widget.params.title

    return <DashItem title={title}>
        <Typography variant="h3">{value}</Typography>
        </DashItem>

}

/**
 * The component factory and state controller
 */
class ContextViewFactory implements WidgetFactory {

    getType(): string {
        return 'contextview';
    }

    getElement(widgetAtom: Atom<ContextViewWidgetInfo>) {
        return ContextView({ widgetAtom, factory: this });
    }

    /**
     * Fetch updated state for this widget and apply it using the provided setter
     */
    updateState(widget: ContextViewWidgetInfo, patchState: (newState: Object) => void) {

        let p = widget.params;

        ensembleClient.send(p.device, 'getContext', { 'field': p.field }).then((reply) => {
            console.log("Received context", reply.args);
            if(reply.args.values.length > 0)
                patchState({value: reply.args.values[0].value});
            else
                patchState({value: '--'});
        }, (rejected) => {
            console.error("Got an exception", rejected);
        });

    }

}

export { ContextViewFactory }

