/**
 * This is like a ContextChart, but it expects a JSON schedule rather than a series of data points from the context broker
 */

import { ContextChartFactory, ContextChartWidgetInfo } from './ContextChart';

declare module "./WidgetTypes" {
    interface WidgetInfoTypeRepo {
        "schedulechart": ContextChartWidgetInfo
    }
}


class ScheduleChartFactory extends ContextChartFactory {

    public getType(): string {
        return 'schedulechart';
    }   

    protected getDataFromReply(values: any[]): { time: number, value: number }[] {
        let data: { time: number, value: number }[] = [];

        console.log("ScheduleChartFactory: parsing schedule from reply", values);

        if (values.length > 0) {
            // The schedule is in values[0].value as a JSON string
            let scheduleStr = values[0].value;
            console.log("  + schedule string:", scheduleStr);

            try {
                let schedule = JSON.parse(scheduleStr);
                console.log("  + parsed schedule:", schedule);

                Object.keys(schedule).forEach((key: string) => {
                    let time = Number(key);
                    let entry = schedule[key];
                    if(time > 0) // Skip the starting value
                        data.push({ time: time, value: entry});
                });
            } catch (e) {
                console.error("Failed to parse schedule JSON", e);
            }
        }

        console.log("  + extracted data:", data);

        return data;
    }

}


export { ScheduleChartFactory }