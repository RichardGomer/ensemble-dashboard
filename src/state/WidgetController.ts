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
    getElement(widgetAtom : Atom<WidgetInfo>, patchState : (patchObj: Object, key?: PropertyKey) => void) : ReactElement;

    /**
     * Fetch updated state information for the given widget. This method is called routinely when a refresh is due.
     * 
     * This likely needs to go and fetch updated information from somewhere.
     * 
     * @param state: The WidgetInfo object for the widget in question
     * @param patchState: A function that will be called with the new state data to apply it to the widget
     */
    updateState(state: WidgetInfo, patchState : (patchObj: Object, key?: PropertyKey) => void, getState?: () => WidgetInfo) : void;
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
     */
    public getStatePatcher(atom: WritableAtom<WidgetInfo, [WidgetInfo], void>) : (patchObj: Partial<WidgetInfo>, key?: PropertyKey) => void {

        const store = getDefaultStore();


        return (patchObj: Partial<WidgetInfo>, key?: PropertyKey) => {
            let getAtomData = () : WidgetInfo => {
                return store.get(atom);
            }

            // If key is set, only patch that bit of the original state
            let newState;
            if (key !== undefined) {

                newState = {
                    ...getAtomData().state
                };

                newState[key] = {
                    ...newState[key],
                    ...patchObj
                };

            } else {
                newState = {
                    ...getAtomData().state,
                    ...patchObj
                };
            }

            store.set(atom, {
                ...getAtomData(),
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

