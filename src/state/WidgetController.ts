/**
 * A high-level controller for working with Widgets of different types
 */

import { Atom, useAtom } from "jotai";
import { WidgetInfo } from "./WidgetState";
import { ReactElement } from "react";


interface WidgetFactory {
    getType() : string;

    /**
     * Get a React element to represent the widget in the UI
     */
    getElement(widgetAtom : Atom<WidgetInfo>) : ReactElement;

    /**
     * Update state information for the given widget.
     * This likely needs to go and fetch updated information from somewhere.
     * 
     * @param state: The WidgetInfo object for the widget in question
     * @param patchState: A function that will be called with the new state data to apply it to the widget
     */
    updateState(state: WidgetInfo, patchState : (Object) => void) : void;
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
     * Get a react component from a WidgetInfo atom
     */
    public getElement(atom : Atom<WidgetInfo>) : ReactElement {
        const [info] = useAtom(atom);

        const type = info.type;

        const factory = this.getFactory(type);

        return factory.getElement(atom);
    }

}

const globalWidgetController = new WidgetController();

export { globalWidgetController, WidgetFactory };

