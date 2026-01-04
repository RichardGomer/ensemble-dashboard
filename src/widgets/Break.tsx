import { Box } from '@mui/material';
import { BaseWidgetInfo, WidgetInfo } from './WidgetTypes';
import { Atom } from 'jotai/vanilla/atom';
import { WidgetFactory } from '../state/WidgetController';

type BreakWidgetInfo = BaseWidgetInfo & {

}

declare module "./WidgetTypes" {
    interface WidgetInfoTypeRepo {
        "break": BreakWidgetInfo
    }
}




const Break: React.FC = () => {
    return <Box sx={{ width: '100%' }} />;
};


class BreakFactory implements WidgetFactory {

    getType(): string {
        return 'break';
    }

    getElement(widgetAtom: Atom<WidgetInfo>, patchState: (Object) => void): React.ReactElement {
        return <Break />;
    }

    updateState(state: WidgetInfo, patchState: (Object) => void): void {
        // No state to update for Break widget
    }
}


export { BreakFactory };