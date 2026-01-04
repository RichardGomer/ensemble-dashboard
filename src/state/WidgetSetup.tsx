import { } from "../widgets/ContextView";
import { WidgetInfo } from '../widgets/WidgetTypes';
import { AutoMode, BatteryChargingFull, BedOutlined, Bedtime, ChairOutlined, DesktopWindows, DesktopWindowsOutlined, ElectricBolt, Grass, HotTub, LightMode, Nightlife, ParkOutlined, RollerShades, RollerShadesClosed, SolarPower, WaterDrop } from '@mui/icons-material';

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
            field: 'temp-office',
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
            field: 'temp-lounge',
            title: 'Temp Lounge',
            pre: '',
            post: '°C',
            icon: ChairOutlined
        },
        state: {},
        refreshed: 0,
        refresh: 300
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
            device: 'global.context',
            field: 'outdoor.temperature',
            title: 'Outdoor Temperature',
            chartType: 'line',
            lineType: 'step-after',
            numValues: 24 * 60
        },
        state: {},
        refreshed: 0,
        refresh: 60
    },

    {
        type: 'contextchart',
        params: {
            device: 'global.context',
            field: 'electariff',
            title: 'Electricity Tariff',
            chartType: 'line',
            lineType: 'stepAfter',
            numValues: 96,
            colour: '#ff0'
        },
        state: {},
        refreshed: 0,
        refresh: 60
    },

    {
        type: 'schedulechart',
        params: {
            device: 'heatpump.context',
            field: 'heatplan',
            title: 'Heating Plan',
            chartType: 'line',
            lineType: 'stepAfter',
            numValues: 1,
            colour: 'rgba(255, 0, 153, 1)'
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
            maxCapacity: 8,
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
        refresh: 60
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
    }
];

export default initialState;