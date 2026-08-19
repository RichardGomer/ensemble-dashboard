import { useState, useEffect } from 'react';
import { BaseWidgetInfo, WidgetInfo } from './WidgetTypes';
import { Atom } from 'jotai/vanilla/atom';
import Box from '@mui/material/Box/Box';
import { useAtom } from 'jotai';
import { DashItem } from '../ui/DashItem';
import { Typography } from '@mui/material';

type ClockWidgetState = {
    // No state needed for Clock
}

type ClockParams = {

}

type ClockWidgetInfo = BaseWidgetInfo & {
    params: ClockParams,
    state: ClockWidgetState,
}

declare module "./WidgetTypes" {
    interface WidgetInfoTypeRepo {
        "clock": ClockWidgetInfo
    }
}



export const Clock: React.FC = ({ widgetAtom, factory }: { widgetAtom: Atom<ClockWidgetInfo>, factory: ClockFactory }) => {
    const [time, setTime] = useState<string>('');

    const [widget, setWidget] = useAtom(widgetAtom);

    const title = widget.params.title || "";

    useEffect(() => {

        let format = (date: Date): string => {
            let hours = date.getHours().toString().padStart(2, '0');
            let minutes = date.getMinutes().toString().padStart(2, '0');
            let seconds = date.getSeconds().toString().padStart(2, '0');
            return `${hours}:${minutes}`;
        }

        setTime("--:--");
        
        const interval = setInterval(() => {
            setTime(format(new Date()));
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    return (
        <DashItem title={title} icon={widget.params.icon}>
            <Box sx={{ display: 'flex', gap: 2 }}>
                <Typography variant="h3"><strong>{time}</strong></Typography>
            </Box>
        </DashItem>
    );
};

class ClockFactory {

    getType(): string {
        return 'clock';
    }

    getElement(widgetAtom: Atom<WidgetInfo>, patchState: (Object) => void): React.ReactElement {
        return <Clock widgetAtom={widgetAtom} />;
    }

    updateState(widget: ClockWidgetInfo, patchState: (newState: Partial<ClockWidgetState>) => void) {
        // No data to update for clock
    }

}


export { ClockFactory };