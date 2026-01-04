import { useState, useEffect } from 'react';
import { BaseWidgetInfo } from './WidgetTypes';


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



export const Clock: React.FC = () => {
    const [time, setTime] = useState<string>('');

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
        <div className="clock">
            <h2>{time || '--'}</h2>
        </div>
    );
};

class ClockFactory {

    getType(): string {
        return 'clock';
    }

    getElement(): React.FC {
        return Clock;
    }

    updateState(widget: ClockWidgetInfo, patchState: (newState: Partial<ClockWidgetState>) => void) {
        // No data to update for clock
    }

}


export { ClockFactory };