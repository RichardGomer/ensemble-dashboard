/**
 * Fetch and display an agenda from one or more ics files
 */
import { Atom, useAtom } from "jotai";
import { WidgetFactory, globalWidgetController } from "../state/WidgetController";
import { ensembleClient } from "../state/ConnectionState"

import { Box, CircularProgress, Typography } from "@mui/material";

import { DashItem } from "../ui/DashItem"
import { BaseWidgetInfo, WidgetInfo } from "./WidgetTypes"; 
import { ReactElement } from "@types/react";

type AgendaState = {
    events: any[]
}

type CalItem = {
    url: string,
    name: string,
    colour: string
}

type AgendaParams = {
    calendars: CalItem[],
    maxDays: number,
    title: string
}

type AgendaWidgetInfo = BaseWidgetInfo & {
    params: AgendaParams,
    state: AgendaState,
}


class AgendaFactory implements WidgetFactory {

    getType(): string {
        return "agenda";
    }

    getElement(widgetAtom: Atom<WidgetInfo>): ReactElement {
        return <Agenda widgetAtom={widgetAtom as Atom<AgendaWidgetInfo>} factory={this} />
    }

    updateState(state: WidgetInfo, patchState: (Object: any) => void): void {
        const agendaState = state as AgendaWidgetInfo;
        const calendars = agendaState.params.calendars;

        Promise.all(
            calendars.map(cal =>
                fetch(cal.url)
                    .then(res => res.text())
                    .then(ics => ({ name: cal.name, colour: cal.colour, ics }))
            )
        ).then(results => {
            const events = results.flatMap(cal =>
                parseICS(cal.ics).map(event => ({ ...event, calendar: cal.name, colour: cal.colour }))
            );
            patchState({ events });
        }).catch(err => console.error("Failed to fetch calendars:", err));
    }


    
}

/**
 * The react componenet
 */
const Agenda = ({ widgetAtom, factory } : { widgetAtom: Atom<AgendaWidgetInfo>, factory: WidgetFactory }) => {

    const [widget, setWidget] = useAtom(widgetAtom);

    console.log("Rendering Agenda", widget);

    return <DashItem title={widget.params.title}>                   
        <Typography variant="h6">Agenda Widget - to be implemented</Typography>
    </DashItem>
}

export { AgendaFactory, AgendaWidgetInfo }