import { useAtom, PrimitiveAtom } from "jotai";
import { BaseWidgetInfo } from "./WidgetTypes";
import { WidgetFactory, globalWidgetController } from "../state/WidgetController";
import { ensembleClient } from "../state/ConnectionState"

import { Button, CircularProgress, Icon } from "@mui/material";

import { DashItem } from "../ui/DashItem"

import {FlashOn, FlashOff} from "@mui/icons-material"
import { useCallback } from "react";


// Create a specific widget type - state and parameters

type ToggleSwitchParams = {
    fOn: () => void,
    fOff: () => void,
    getState: Promise<'on' | 'off'>,
    title: string
};

type ToggleSwitchState = {
    state: 'on' | 'off',
};

type ToggleSwitchWidgetInfo = BaseWidgetInfo & {
    params: ToggleSwitchParams,
    state: ToggleSwitchState
}

declare module "./WidgetTypes" {
    interface WidgetInfoTypeRepo {
        "toggleswitch": ToggleSwitchWidgetInfo
    }
}

const ToggleSwitch = ({ widgetAtom, factory }: { widgetAtom: PrimitiveAtom<ToggleSwitchWidgetInfo>, factory: WidgetFactory }) => {

    const [widget, setWidget] = useAtom(widgetAtom);

    const title = widget.params.title

    const icon = widget.state.state == 'on' ? <FlashOn /> : <FlashOff />;
    const text = widget.state.state == 'on' ? 'On' : 'Off';

    const toggle = useCallback(() => {

        if (widget.state.state == 'on') {
            widget.params.fOff();
        } else {
            widget.params.fOn();
        }

        factory.updateState(widget, 
            () => {
                return {}
            },
            (newState) => {
                setWidget(newState);
            }
        );
        
    }, [widget]);


    return <DashItem title={title}>
        <Button onClick={toggle}>{icon}{text}</Button>
    </DashItem>

}

class ToggleSwitchFactory implements WidgetFactory {

    getType(): string {
        return 'contextview';
    }

    getElement(widgetAtom: PrimitiveAtom<ToggleSwitchWidgetInfo>) {
        return ToggleSwitch({ widgetAtom, factory: this });
    }

    /**
     * Fetch updated state for this widget and apply it using the provided setter
     */
    updateState(widget: ToggleSwitchWidgetInfo, patchState: (state: ToggleSwitchState) => void) {



        widget.params.getState.then(patchState);
    }

}

export { ToggleSwitchFactory }

