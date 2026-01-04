/**
 * A high-level controller for working with Widgets of different types
 */

import { Atom, getDefaultStore, useAtom, WritableAtom } from "jotai";
import { ReactElement } from "react";
import { WidgetInfo } from "../widgets/WidgetTypes";


interface WidgetFactory {
    getType() : string;

    /**
     * Get a React element to represent the widget in the UI
     * 
     * @param widgetAtom: An atom representing the WidgetInfo for the widget
     * @param patchState: A function that can be used to update the widget state atom
     */
    getElement(widgetAtom : Atom<WidgetInfo>, patchState : (Object) => void) : ReactElement;

    /**
     * Fetch updated state information for the given widget. This method is called routinely when a refresh is due.
     * 
     * This likely needs to go and fetch updated information from somewhere.
     * 
     * @param state: The WidgetInfo object for the widget in question
     * @param patchState: A function that will be called with the new state data to apply it to the widget
     */
    updateState(state: WidgetInfo, patchState : (Object) => void, getState?: () => WidgetInfo) : void;
}

type WidgetState = Object;


class WidgetController {

    private types : WidgetFactory[] = [];

    public registerType(f : WidgetFactory) {
        this.types.push(f);
    }

    public getFactory(type : string) : WidgetFactory {

        type = type.toLowerCase();

        for(var f of this.types) {
            if(f.getType().toLowerCase() == type) {
                return f;
            }
        }

        throw "WidgetFactory for type '" + type + "' not found";
    }

    /**
     * Get a convenience function that can patch state into the given widget atom
     * @param atom: the atom that contains the Widget configuration and state
     * @returns a patching function
     * 
     * NB: there is a similar function in WidgetController.ts for handling routine refreshes, which additionally records refresh time etc.
     */
    public getStatePatcher(atom: WritableAtom<WidgetInfo, [WidgetInfo], void>) : (patchObj: Partial<WidgetInfo>) => void {

        const store = getDefaultStore();

        return (patchObj: Partial<WidgetInfo>) => {
            let getState = () : WidgetInfo => {
                return store.get(atom);
            }

            const newState = {
                ...getState().state,
                ...patchObj
            };

            store.set(atom, {
                ...getState(),
                state: newState
            });
        };
    }

    /**
     * Get a react component from a WidgetInfo atom
     */
    public getElement(atom : WritableAtom<WidgetInfo, [WidgetInfo], void>) : ReactElement {

        const store = getDefaultStore();

        const [info, setInfo] = useAtom(atom);

        const type = info.type;

        const factory = this.getFactory(type);

        // Create a patching function that the element can use to update its own state
        const patchState = this.getStatePatcher(atom);

        return factory.getElement(atom, patchState);
    }

}

const globalWidgetController = new WidgetController();

export { globalWidgetController, WidgetFactory };

