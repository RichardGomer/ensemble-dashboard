/**
 * Store state that represents all the widgets in the interface
 */

import { Atom, WritableAtom, atom, getDefaultStore } from 'jotai';
import { splitAtom } from 'jotai/utils';
import { globalWidgetController } from './WidgetController';
import { ConnectionStateAtom } from './ConnectionState';

import { } from "../widgets/ContextView";
import { WidgetInfo } from '../widgets/WidgetTypes';


/**
 * Initial state
 */
let initialState: WidgetInfo[] = [
    {
        type: 'contextview',
        params: {
            device: 'global.context',
            field: 'spa-temp',
            title: 'Hot Tub Temp',
            pre: '',
            post: '°C',
        },
        state: {},
        refreshed: 0,
        refresh: 300,
        refreshing: false
    },
    {
        type: 'contextview',
        params: {
            device: 'global.context',
            field: 'outdoor.temperature',
            title: 'Outdoor Temp',
            pre: '',
            post: '°C'
        },
        state: {},
        refreshed: 0,
        refresh: 300,
        refreshing: false
    },
    {
        type: 'contextview',
        params: {
            device: 'global.context',
            field: 'temp-office',
            title: 'Temp Office',
            pre: '',
            post: '°C'
        },
        state: {},
        refreshed: 0,
        refresh: 300,
        refreshing: false
    },
    {
        type: 'contextview',
        params: {
            device: 'global.context',
            field: 'temp-lounge',
            title: 'Temp Lounge',
            pre: '',
            post: '°C'
        },
        state: {},
        refreshed: 0,
        refresh: 300,
        refreshing: false
    },
    {
        type: 'contextview',
        params: {
            device: 'global.context',
            field: 'temp-landing',
            title: 'Temp Landing',
            pre: '',
            post: '°C'
        },
        state: {},
        refreshed: 0,
        refresh: 300,
        refreshing: false
    },

    {
        type: 'contextchart',
        params: {
            device: 'global.context',
            field: 'electariff',
            title: 'Electricity Price',
            chartType: 'line',
            lineType: 'stepAfter',
            numValues: 48
        },
        state: {},
        refreshed: 0,
        refresh: 300,
        refreshing: false
    },
    {
        type: 'contextchart',
        params: {
            device: 'global.context',
            field: 'solcast',
            title: 'Solcast',
            chartType: 'line',
            lineType: 'stepAfter',
            numValues: 48
        },
        state: {},
        refreshed: 0,
        refresh: 300,
        refreshing: false
    },
    {
        type: 'contextview',
        params: {
            device: 'global.context',
            field: 'battery.soc',
            title: 'Battery SOC',
            pre: '',
            post: 'KWh'
        },
        state: {},
        refreshed: 0,
        refresh: 300,
        refreshing: false
    },
];

/**
 * Decompose into atoms
 */
const allWidgetsAtom: Atom<WidgetInfo[]> = atom(initialState);

const widgetAtomsAtom: Atom<Atom<WidgetInfo>[]> = splitAtom(allWidgetsAtom);

const widgetCountAtom = atom((get) => { return get(allWidgetsAtom).length; })

/**
 * Refresh widgets
 */
const store = getDefaultStore();

let refreshWidgets = () => {

    let connectionState = store.get(ConnectionStateAtom);

    if(connectionState.connected === false) {
        console.log("Not connected");
        return;
    }


    let widgetAtoms = store.get(widgetAtomsAtom);

    var now = (new Date()).getTime();

    // Find some overdue widgets and refresh them
    for (let wAtom of widgetAtoms) {

        let widget = store.get(wAtom);

        let due = widget.refreshed + widget.refresh * 1000;
        console.log("Due at ", due, " now ", now, "Overdue?", due < now, "In progress?", widget.refreshing);
        if (due < now && !widget.refreshing) {

            console.log("Begin refresh");

            let factory = globalWidgetController.getFactory(widget.type);

            // Refresh the atom
            ((wAtom : Atom<WidgetInfo>) => { // Trap current value of wAtom in a closure

                let getState = () : WidgetInfo => {
                    return store.get(wAtom);
                }

                let setState = (newState: WidgetInfo) => {
                    newState.refreshed = (new Date()).getTime();
                    newState.refreshing = false;
                    store.set(wAtom, newState);
                }

                // Mark the widget as refreshing
                store.set(wAtom, {
                    ...(getState()),
                    refreshing: true
                });

                // This function will patch new state values into the widget as it exists at the time
                // the new stuff is received
                const patchState = (updatedState) => {
                   
                   let oldState = getState();
       
                   let newState = {
                       ...oldState,
                       state: updatedState
                   }
       
                   setState(newState);
                }

                factory.updateState(widget, patchState);

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
if(window.autorefresherinterval) {
    console.log("Clearing old interval", window.autorefresherinterval)
    window.clearInterval(window.autorefresherinterval);
}

window.autorefresherinterval = window.setInterval(() => refreshWidgets(), 5000);

/**
 * TODO: Persistence /should/ be achieveable by saving/restoring to some sort of data store device in
 * the ensemble mesh itself. Even just a json store?
 */
export { allWidgetsAtom, widgetAtomsAtom, widgetCountAtom};
