import { useAtom, Atom } from "jotai";
import { WidgetFactory, globalWidgetController } from "../state/WidgetController";
import { ensembleClient } from "../state/ConnectionState"

import { Box, CircularProgress, Typography } from "@mui/material";

import { DashItem } from "../ui/DashItem"
import { BaseWidgetInfo, WidgetInfo } from "./WidgetTypes";
import VertCapacity from "../ui/components/VertCapacity";



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

    //console.log("Rendering ContextView", widget);

    let dps = 1; // Decimal places
    if (widget.params.dps) {
        dps = widget.params.dps;
    }
    let round = Math.round(parseFloat(widget.state.value) * 10 ** dps) / 10 ** dps;
    let strVal = round.toString();
    
    const title = widget.params.title

    var clrSpot = <></>;
    var elCap = <></>

    const colour = !isNaN(round) && widget.params.colour ? widget.params.colour(round) : 'transparent';

    if (widget.params.maxCapacity && !isNaN(round)) {
        let capacity = round;
        let pc = Math.min(100, Math.max(0, Math.round((capacity / widget.params.maxCapacity) * 100)));
        elCap = <VertCapacity percentage={pc} fillColor={colour} />;
    } else if(widget.params.colour && !isNaN(round)) {
        clrSpot = <Box sx={{ width: 30, height: 30, borderRadius: '50%', backgroundColor: colour, border: '2px solid #999;', alignSelf: 'center' }} />;
    }

    let elVal = <></>
    if(!isNaN(round)) {
        elVal = <Typography variant="h3">
            <span style={{ opacity: 0.3 }}>{widget.params.pre}</span>
            {strVal}
            <span style={{ opacity: 0.3, fontSize: '0.6em', verticalAlign: 'super' }}>{widget.params.post}</span>
        </Typography>
    } else {
        elVal = <CircularProgress />
    }


    return <DashItem title={title} icon={widget.params.icon}>
        <Box sx={{ display: 'flex', gap: 2 }}>
            {(elVal)}
            {elCap}
            {clrSpot}
        </Box>
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

        ensembleClient.send(p.device, 'getContext', { 'field': p.field })
            .then((reply) => {
                console.debug("Received context for ", p.field, reply.args);
                if (reply.args.values.length > 0)
                    patchState({ value: reply.args.values[0].value, exception: false });
                else
                    patchState({ value: false, exception: true });
            })
            .catch((rejected) => {
                //console.error("Got an exception", rejected);
                patchState({ value: false, exception: true });
            });

    }

}

export { ContextViewFactory }

