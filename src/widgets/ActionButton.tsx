import { useAtom, Atom } from "jotai";
import { WidgetFactory, globalWidgetController } from "../state/WidgetController";
import { ensembleClient } from "../state/ConnectionState"

import { Box, Button, CircularProgress, IconButton, patch, Typography } from "@mui/material";

import { DashItem } from "../ui/DashItem"
import { BaseWidgetInfo, WidgetInfo } from "./WidgetTypes";
import { Home } from "@mui/icons-material";
import { useEffect, useState } from "react";


type ActionButtonState = {
    state: Number,
    lastSend: Number,
    pressing: Boolean
}

type ActionButtonActionSpec = {
    device: string,
    action: string,
    args?: Object,
    title: string,
    icon: typeof Home, // Easier to just sniff the type of a real icon than try to work out how tf MUI does anything...
    matchState: (testValue : any) => boolean, // A function that can be used to match the current state to this action
}

type ActionButtonParams = {
    actions: ActionButtonActionSpec[]
    title: string,
    resetTime?: number,
    delayTime: number, // How long to wait for another press before sending the action
    fetchState?: (actions : ActionButtonActionSpec[]) => Promise<number>, // A callback to pick up the current state from the server; must return the index of the relevant action
}

type ActionButtonWidgetInfo = BaseWidgetInfo & {
    params: ActionButtonParams,
    state: ActionButtonState,
}

declare module "./WidgetTypes" {
    interface WidgetInfoTypeRepo {
        "actionbutton": ActionButtonWidgetInfo
    }
}


/**
 * The react componenet
 */
const ActionButton = ({ widgetAtom, factory, patchState }: { widgetAtom: Atom<ActionButtonWidgetInfo>, factory: WidgetFactory, patchState: (Object) => void }) => {

    const [widget, setWidget] = useAtom(widgetAtom);

    const [lastTimeout, setLastTimeout] = useState(null);

    /**
     * Force a re-render after the reset time has elapsed so that the spinner goes away
     */
    const [, forceUpdate] = useState({});

    useEffect(() => {
        if (!widget.params.resetTime || !widget.state.lastSend) {
            return;
        }
        
        const timeElapsed = Date.now() - widget.state.lastSend;
        const timeRemaining = widget.params.resetTime - timeElapsed;
        
        if (timeRemaining > 0) {
            const timer = setTimeout(() => {
                forceUpdate({}); // Force re-render
            }, timeRemaining);
            
            return () => clearTimeout(timer);
        }
    }, [widget.state.lastSend, widget.params.resetTime]);



    //console.log("Rendering ActionButton", widget);

    // For single-action buttons, we can disable some things:
    if(widget.params.actions.length == 1) {
        widget.params.delayTime = 0;
    }

    // Sort the state out
    if(typeof widget.state.state !== 'number' || widget.state.state < 0 || widget.state.state >= widget.params.actions.length) {
        widget.state.state = 0;
    }

    // When the button is pressed, we cycle through the possible actions
    // After the button has been unpressed for delayTime ms, we send the action to the server
    const nextState = () => {
        let newState = (widget.state.state + 1) % widget.params.actions.length;
        console.log("Next state is", newState);

        if(lastTimeout !== null) {
            clearTimeout(lastTimeout);
        }

        patchState({ state: newState, pressing: true });
        let toid = setTimeout(applyAction, widget.params.delayTime, newState);
        setLastTimeout(toid);
    }

    const applyAction = (stateNumber: number) => {

        const actionSpec = widget.params.actions[stateNumber];

        console.log("Sending action", actionSpec);
        debugger;

        patchState({lastSend: Date.now(), pressing: false, state: stateNumber});

        ensembleClient.send(actionSpec.device, actionSpec.action, actionSpec.args)
        .then((reply) => {
            
        })
        .catch((rejected) => {
            console.error("Got an exception", rejected);
        });
    }

    const title = widget.params.title

    // If we've sent an action recently, show a spinner
    const now = Date.now();
    let isActive = false;
    if (widget.params.resetTime && widget.state.lastSend) {
        if (now - widget.state.lastSend < widget.params.resetTime) {
            isActive = true;
        }
    }

    // Otherwise show the button and the selected state
    const active = widget.params.actions[widget.state.state];

    let button = <IconButton size="medium" 
        onClick={() => {
            nextState();
        }}>
        
        {active.icon ? <active.icon fontSize="large" sx={{ marginRight: '0.3em'}} /> : <></>}
        {active.title ? <Typography>{active.title}</Typography> : <></>}
    </IconButton>

    return <DashItem title={title}>
        <Box sx={{ display: 'flex', gap: 2, flexBasis: '100%', justifyContent: 'center' }}>
            {isActive ? <CircularProgress /> : button}
        </Box>
    </DashItem>

}

/**
 * The component factory and state controller
 */
class ActionButtonFactory implements WidgetFactory {

    getType(): string {
        return 'actionbutton';
    }

    getElement(widgetAtom: Atom<ActionButtonWidgetInfo>, patchState : (newState: Object) => void) {
        return ActionButton({ widgetAtom, factory: this, patchState });
    }

    /**
     * Fetch updated state for this widget and apply it using the provided setter
     */
    updateState(widget: ActionButtonWidgetInfo, patchState: (newState: Object) => void, getState?: () => WidgetInfo) {

        let p = widget.params;

        /**
         * If we have a fetchState callback, use it to pick the active state for the button
         */
        if(p.fetchState !== false) {
            console.log("ActionButton fetching state using fetchState callback", p.fetchState);

            p.fetchState(p.actions).then(async (currentState) => {
                
                // If the button is in use, bail
                var state = await getState();

                if(state.state.pressing) {
                    console.log("ActionButton fetchState: button is being pressed, not updating state");
                    return;
                }

                if(state.state.lastSend > Date.now() - (p.resetTime || 10)) {
                    console.log("ActionButton fetchState: button is in reset period, not updating state");
                    return;
                }

                // Compare the current state to the match functions for each action to find the right one
                let stateIndex = 0;
                for(let i = 0; i < p.actions.length; i++) {
                    if(p.actions[i].matchState(currentState)) {
                        stateIndex = i;
                        break;
                    }
                }

                console.debug("ActionButton fetched state", currentState, "mapped to index", stateIndex);

                patchState({ state: stateIndex });

            }).catch((err) => {
                console.error("ActionButton fetchState error", err);
            });
        }
    }
}

/**
 * A convenience function to create a getState function for an ActionButton which sends an action to the server and waits for the reply
 * @param deviceName
 * @param action 
 * @param args 
 * @returns 
 */
function ActionButtonGetStateFromAction(deviceName: string, action: string, args: string[], replyArg: string) : any {

    return async () => {
        console.log("ActionButtonGetStateFromAction sending fetch", deviceName, action, args);
        return await ensembleClient.send(deviceName, action, args)
                    .then((reply) => {
                        console.debug("ActionButton getState action reply", reply);
                        return reply.args[replyArg];
                    })
                    .catch((rejected) => {
                        console.error("Got an exception in response to our action", rejected);
                        return null;
                    });
    }

}


export { ActionButtonFactory, ActionButton, ActionButtonGetStateFromAction }
