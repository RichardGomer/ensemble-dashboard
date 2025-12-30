/**
 * Store state that represents all the widgets in the interface
 */

import { Atom, WritableAtom, atom, getDefaultStore } from 'jotai';
import { splitAtom } from 'jotai/utils';
import { globalWidgetController } from './WidgetController';
import { ConnectionStateAtom } from './ConnectionState';

import { } from "../widgets/ContextView";
import { WidgetInfo } from '../widgets/WidgetTypes';
import { BatteryCharging50, BatteryChargingFull, BedOutlined, Chair, ChairOutlined, DesktopWindows, DesktopWindowsOutlined, HotTub, Park, Park, ParkOutlined, Stairs, StairsOutlined, WaterDrop } from '@mui/icons-material';


/**
 * Initial state
 */
let initialState: WidgetInfo[] = [
    {
        type: 'contextview',
        params: {
            device: 'global.context',
            field: 'outdoor.temperature',
            title: 'Outdoor Temp',
            pre: '',
            post: '°C',
            icon: ParkOutlined
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
            post: '°C',
            icon: DesktopWindowsOutlined
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
            post: '°C',
            icon: ChairOutlined
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
            post: '°C',
            icon: BedOutlined
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
            field: 'HP-TANK_TEMP_T5',
            title: 'Hot Water Current Temp.',
            pre: '',
            post: '°C',
            icon: WaterDrop,
            colour: (v) => {
                var getClr = () => {
                    if(isNaN(v)) return '';
                    if(v < 40) return 'blue';
                    if(v < 50) return 'orange';
                    return 'red';
                };

                var c = getClr();
                console.log("Colouring with value", v, c);
                return c;
            }
        },
        state: {},
        refreshed: 0,
        refresh: 60,
        refreshing: false,
    },

    {
        type: 'contextchart',
        params: {
            device: 'global.context',
            field: 'outdoor.temperature',
            title: 'Outdoor Temperature',
            chartType: 'line',
            lineType: 'step-after',
            numValues: 24 * 60
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
            title: 'Battery SoC',
            pre: '',
            post: 'KWh',
            icon: BatteryChargingFull,
            maxCapacity: 8,
            dps: 2
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
            field: 'spa-temp',
            title: 'Hot Tub Temp',
            icon: HotTub,
            pre: '',
            post: '°C',
            colour: (v) => {
                    if(isNaN(v)) return '';
                    if(v < 30) return 'blue';
                    if(v < 38) return 'orange';
                    return 'red';
            }
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
        //console.log("Due at ", due, " now ", now, "Overdue?", due < now, "In progress?", widget.refreshing);
        if (due < now && !widget.refreshing) {

            console.log("Begin refresh");

            let factory = globalWidgetController.getFactory(widget.type);

            // Refresh the atom
            ((wAtom : WritableAtom<WidgetInfo, [WidgetInfo], void>) => { // Trap current value of wAtom in a closure

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
