import { } from "../widgets/ContextView";
import { WidgetInfo } from '../widgets/WidgetTypes';
import { AccessTime, AutoMode, BatteryChargingFull, BedOutlined, Bedtime, ChairOutlined, DesktopWindows, DesktopWindowsOutlined, ElectricBolt, Grass, HotTub, 
    LightMode, Nightlife, ParkOutlined, RollerShades, RollerShadesClosed, SolarPower, WaterDrop, Warning, LocalFireDepartment, Kitchen, FlightTakeoff } from '@mui/icons-material';

import { colourScale, clrBadGood } from '../colour';

import Comparators from '../comparators';
import { ActionButtonGetStateFromAction } from '../widgets/ActionButton';

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
        refresh: 300
    },
    {
        type: 'contextview',
        params: {
            device: 'global.context',
            field: 'temperature.office',
            title: 'Temp Office',
            pre: '',
            post: '°C',
            icon: DesktopWindowsOutlined
        },
        state: {},
        refreshed: 0,
        refresh: 300
    },
    {
        type: 'contextview',
        params: {
            device: 'global.context',
            field: 'temperature.kitchen',
            title: 'Temp Kitchen',
            pre: '',
            post: '°C',
            icon: Kitchen
        },
        state: {},
        refreshed: 0,
        refresh: 300
    },
    {
        type: 'contextview',
        params: {
            device: 'global.context',
            field: 'temperature.landing',
            title: 'Temp Landing',
            pre: '',
            post: '°C',
            icon: BedOutlined
        },
        state: {},
        refreshed: 0,
        refresh: 300
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
                if (isNaN(v)) return '';
                if (v < 40) return 'blue';
                if (v < 50) return 'orange';
                return 'red';
            }
        },
        state: {},
        refreshed: 0,
        refresh: 30
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
                if (isNaN(v)) return '';
                if (v < 30) return 'blue';
                if (v < 38) return 'orange';
                return 'red';
            }
        },
        state: {},
        refreshed: 0,
        refresh: 300
    },

    {
        type: 'contextchart',
        params: {
            title: 'Outdoor Temperature',
            data: [{
                device: 'global.context',
                field: 'outdoor.temperature',
                chartType: 'line',
                lineType: 'step-after',
                numValues: 24 * 60
            }]
        },
        state: {},
        refreshed: 0,
        refresh: 60
    },

    {
        type: 'contextchart',
        params: {
            title: 'Electricity Tariff',
            data: [{
                device: 'global.context',
                field: 'electariff',

                chartType: 'line',
                lineType: 'stepAfter',
                numValues: 96,
                colour: '#ff0'
            }]
        },
        state: {},
        refreshed: 0,
        refresh: 60
    },

    {
        type: 'schedulechart',
        params: {
            title: 'Heating Plan',
            data: [{
                device: 'heatpump.context',
                field: 'heatplan',
                chartType: 'line',
                lineType: 'stepAfter',
                numValues: 1,
                colour: 'rgb(153, 58, 115)'
            },
            {
                device: 'heatpump.context',
                field: 'hotwaterplan',
                chartType: 'line',
                lineType: 'stepAfter',
                numValues: 1,
                colour: 'rgb(41, 142, 209)'
            }
        ]
        },
        state: {},
        refreshed: 0,
        refresh: 60
    },


    /**
     * Force a break
     */
    {
        type: 'break',
        params: {
        },
        state: {},
        refreshed: 0,
        refresh: 0
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
            maxCapacity: 16,
            dps: 2,
            colour: (v: number) => {
                return colourScale(0, 8, clrBadGood, v);
            }
        },
        state: {},
        refreshed: 0,
        refresh: 60
    },
    {
        type: 'contextview',
        params: {
            device: 'global.context',
            field: 'inverter.load',
            title: 'Electrical Load',
            pre: '',
            post: 'W',
            icon: ElectricBolt,
            dps: 2
        },
        state: {},
        refreshed: 0,
        refresh: 10
    },
    {
        type: 'contextview',
        params: {
            device: 'global.context',
            field: 'inverter.solar',
            title: 'Solar Power',
            pre: '',
            post: 'W',
            icon: SolarPower,
            dps: 2
        },
        state: {},
        refreshed: 0,
        refresh: 10
    },

    {
        type: 'clock',
        params: {
            title: 'Current Time',
            icon: AccessTime
        },
        state: {},
        refreshed: 0,
        refresh: 1
    },

    {
        type: 'actionbutton',
        params: {
            actions: [
                {
                    title: 'Auto',
                    icon: AutoMode,
                    device: 'heatpump.actions',
                    action: 'clearBoost',
                    args: {},
                    matchState: Comparators.eq('auto')
                },
                {
                    title: 'Boost',
                    icon: LocalFireDepartment,
                    device: 'heatpump.actions',
                    action: 'boost',
                    args: {},
                    matchState: Comparators.eq('boost')
                },
                {
                    title: 'Holiday',
                    icon: FlightTakeoff,
                    device: 'heatpump.actions',
                    action: 'setHoliday',
                    args: {},
                    matchState: Comparators.eq('holiday')
                }
            ],
            title: 'Heating Mode',
            delayTime: 2000,
            resetTime: 5000,
            numValues: 4,
            fetchState: ActionButtonGetStateFromAction('heatpump.actions', 'getMode', [], 'mode')
        },
        state: {},
        refreshed: 0,
        refresh: 30
    },


    /**
     * Force a break
     */
    {
        type: 'break',
        params: {
        },
        state: {},
        refreshed: 0,
        refresh: 0
    },


    /**
     * Freddie
     */
    {
        type: 'dogmeds',
        params: {
            device: 'global.context',
            title: 'Freddie',
            foodField: 'dog.food',
            medField: 'dog.med',
            foodAfterFoodHrs: 8,
            foodAfterMedHrs: 1,
            medAfterFoodHrs: 2.5,
            medIntervalHrs: 10,
            resetTime: 2500,
            numValues: 4
        },
        state: {},
        refreshed: 0,
        refresh: 30
    },


    /**
     * Action Buttons
     */
    {
        type: 'actionbutton',
        params: {
            actions: [
                {
                    title: 'Lights Off',
                    icon: Bedtime,
                    device: 'lighting.actions',
                    action: 'off',
                    args: {},
                }
            ],
            title: 'All Lights Off',
            resetTime: 2500
        },
        state: {},
        refreshed: 0,
        refresh: 0
    },
    {
        type: 'actionbutton',
        params: {
            actions: [
                {
                    title: 'Auto',
                    icon: AutoMode,
                    device: 'lighting.actions',
                    action: 'set_default',
                    args: {},
                    matchState: Comparators.eq('___default')
                },
                {
                    title: 'Cosy',
                    icon: Bedtime,
                    device: 'lighting.actions',
                    action: 'set_cosy',
                    args: {},
                    matchState: Comparators.eq('cosy')
                },
                {
                    title: 'Violet',
                    icon: Nightlife,
                    device: 'lighting.actions',
                    action: 'set_violet',
                    args: {},
                    matchState: Comparators.eq('violet')
                },
                {
                    title: 'Autumn',
                    icon: Grass,
                    device: 'lighting.actions',
                    action: 'set_autumn',
                    args: {},
                    matchState: Comparators.eq('autumn')
                },
            ],
            title: 'Lighting Scheme',
            delayTime: 2000,
            resetTime: 5000,
            fetchState: ActionButtonGetStateFromAction('lighting.actions', 'get_scheme', [], 'scheme')
        },
        state: {},
        refreshed: 0,
        refresh: 10
    },
    {
        type: 'actionbutton',
        params: {
            actions: [
                {
                    title: 'Auto',
                    icon: AutoMode,
                    device: 'blinds.actions',
                    action: 'clear_blinds',
                    args: {},
                    matchState: Comparators.eq('auto')
                },
                {
                    title: 'Closed',
                    icon: RollerShadesClosed,
                    device: 'blinds.actions',
                    action: 'set_blinds',
                    args: {
                        position: 100
                    },
                    matchState: Comparators.eq('closed')
                },
                {
                    title: 'Open',
                    icon: RollerShades,
                    device: 'blinds.actions',
                    action: 'set_blinds',
                    args: {
                        position: 0
                    },
                    matchState: Comparators.eq('open')
                }
            ],
            title: "Roller Blinds",
            delayTime: 2000,
            resetTime: 5000,
            fetchState: ActionButtonGetStateFromAction('blinds.actions', 'get_blind_mode', [], 'mode')
        },
        state: {},
        refreshed: 0,
        refresh: 30
    },
    // Break
    {
        type: 'break',
        params: {
        },
        state: {},
        refreshed: 0,
        refresh: 0
    },

    // Window status warnings
    {
        type: 'contextview',
        params: {
            requireNumber: false,
            device: 'global.context',
            field: 'window.office.main',
            title: 'Office Window',
            pre: '',
            post: '',
            icon: Warning,
            process: WindowStatusProcess
        },
        state: {},
        refreshed: 0,
        refresh: 10
    },

    {
        type: 'contextview',
        params: {
            requireNumber: false,
            device: 'global.context',
            field: 'window.office.small',
            title: 'Office Window Small',
            pre: '',
            post: '',
            icon: Warning,
            process: WindowStatusProcess
        },
        state: {},
        refreshed: 0,
        refresh: 10
    },

    {
        type: 'contextview',
        params: {
            requireNumber: false,
            device: 'global.context',
            field: 'window.kitchen.front',
            title: 'Kitchen Window Front',
            pre: '',
            post: '',
            icon: Warning,
            process: WindowStatusProcess
        },
        state: {},
        refreshed: 0,
        refresh: 10
    },

    {
        type: 'contextview',
        params: {
            requireNumber: false,
            device: 'global.context',
            field: 'window.kitchen.rear',
            title: 'Kitchen Window Rear',
            pre: '',
            post: '',
            icon: Warning,
            process: WindowStatusProcess
        },
        state: {},
        refreshed: 0,
        refresh: 10
    }
];


function WindowStatusProcess(value: any): { value: string, colour?: string, display?: boolean, pre?: string, post?: string, isError?: boolean } {
    //console.log("WindowStatusProcess", value);
    if (value === 'open') {
        return { value: 'Open', colour: 'red', display: true, isError: true };
    } else if (value === 'closed') {
        return { value: 'Closed', colour: 'green', display: false };
    } else {
        return { value: '??', colour: 'orange', display: true };
    }
}

export default initialState;
