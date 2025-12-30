/**
 * Widget types
 */

interface BaseWidgetInfo {
    //id: string,
    type: string,
    params: any, // Arbitrary options
    state: any, // Arbitrary widget state,
    refresh: number, // Interval that this widget should be refreshed at
    refreshed: number, // Timestamp that this widget was last refreshed
    refreshing: boolean // Indicate whether the widget is being updated currently
}

interface WidgetInfoTypeRepo {};

/**
 * Do something like this in every widget module to add to WidgetInfoTypeRepo
 *
type ExampleWidgetParams = { 'fooArg': string };
type ExampleWidgetState = { 'barArg': Number };
interface WidgetInfoTypeRepo {
    "examplewidget": { // We don't actually use this string, it just needs to be unique
        params: ExampleWidgetParams,
        state: ExampleWidgetState | {}
    }
}
 */


/**
 * Create a union of all the widget types
 */
type BuildUnion<T> = {
    [K in keyof T]: ({ type: K } & T[K])
}[keyof T]

type WidgetInfo = BuildUnion<WidgetInfoTypeRepo>



export { WidgetInfoTypeRepo, BaseWidgetInfo, WidgetInfo }
