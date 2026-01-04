/**
 * Store state that represents all the widgets in the interface
 */

import { WritableAtom, atom, getDefaultStore } from 'jotai';
import { globalWidgetController } from './WidgetController';
import { ConnectionStateAtom } from './ConnectionState';

import initialState from './WidgetSetup';
import { WidgetInfo } from '../widgets/WidgetTypes';

/**
 * Decompose into atoms
 */
const allWidgetsAtom: WritableAtom<WidgetInfo[], [WidgetInfo[]], void> = atom(initialState);

// Create individual atoms you can write to
const createWidgetAtom = (index: number) =>
    atom(
        (get) => get(allWidgetsAtom)[index],
        (get, set, newWidget: WidgetInfo) => {
            const all = get(allWidgetsAtom);
            set(allWidgetsAtom, [...all.slice(0, index), newWidget, ...all.slice(index + 1)]);
        }
    );

const widgetAtomCache = new Map<number, WritableAtom<WidgetInfo, [WidgetInfo], void>>();

const getWidgetAtom = (index: number) => {
    if (!widgetAtomCache.has(index)) {
        widgetAtomCache.set(index, createWidgetAtom(index));
    }
    return widgetAtomCache.get(index)!;
};

const widgetAtomsAtom = atom((get) =>
    Array.from({ length: get(allWidgetsAtom).length }, (_, i) => getWidgetAtom(i))
);

const widgetCountAtom = atom((get) => { return get(allWidgetsAtom).length; })

/**
 * Refresh widgets
 */
const store = getDefaultStore();

let refreshWidgets = () => {

    // Check we're connected first!
    let connectionState = store.get(ConnectionStateAtom);
    if (connectionState.connected === false) {
        console.log("Not connected");
        return;
    }

    // Get the list of all widget atoms
    let widgetAtoms = store.get(widgetAtomsAtom);

    var now = (new Date()).getTime();

    // Find some overdue widgets and refresh them
    for (let wAtom of widgetAtoms) {

        let widget = store.get(wAtom);

        let due = widget.refreshed + widget.refresh * 1000;
        let idStr = widget.type + " " + widget.params.title ? (" '" + widget.params.title + "'") : "";
        console.debug(idStr, "Due at ", due, " now ", now, "Overdue?", due < now);
        if (widget.refresh > 0 && due < now) {

            let factory = globalWidgetController.getFactory(widget.type);

            // Refresh the atom
            ((wAtom: WritableAtom<WidgetInfo, [WidgetInfo], void>) => { // Trap current value of wAtom in a closure

                let getState = (): WidgetInfo => {
                    return store.get(wAtom);
                }

                // Restart the refresh timer
                store.set(wAtom, {
                    ...(getState()),
                    refreshed: (new Date()).getTime()
                });

                // This function will patch new state values into the widget as it exists at the time
                // the new stuff is received
                const patchState = (updatedState) => {

                    let oldState = getState();

                    let newState = {
                        ...oldState,
                        state: {
                            ...oldState.state,
                            ...updatedState
                        }
                    }

                    //console.log("  + Old state", idStr, oldState.state);
                    //console.log("  + Applying new state to widget", idStr, newState);

                    store.set(wAtom, newState);
                }

                factory.updateState(widget, patchState, getState);

            })(wAtom);

        }

    }
}

console.log("Begin the refresher");



declare global {
    interface Window {
        autorefresherinterval: number;
    }
}


// Clear any old interval, mostly used when parcel is doing reloads!
if (window.autorefresherinterval) {
    console.log("Clearing old interval", window.autorefresherinterval)
    window.clearInterval(window.autorefresherinterval);
}

window.autorefresherinterval = window.setInterval(() => refreshWidgets(), 5000);

/**
 * TODO: Persistence /should/ be achieveable by saving/restoring to some sort of data store device in
 * the ensemble mesh itself. Even just a json store?
 */
export { allWidgetsAtom, widgetAtomsAtom, widgetCountAtom };
