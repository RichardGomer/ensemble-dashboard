/**
 * Some handy comparator functions for use in widgets - especially the match functions in ActionButton
 */

const Comparators = {
    eq: (a: any, b: any) => a === b,
    neq: (a: any, b: any) => a !== b,
    lt: (a: any, b: any) => a < b,
    lte: (a: any, b: any) => a <= b,
    gt: (a: any, b: any) => a > b,
    gte: (a: any, b: any) => a >= b,
    arrContains: (a: any[], b: any) => a.includes(b),
    strContains: (a: string, b: string) => a.indexOf(b) >= 0,
}

function wrapComparator(comp: (a: any, b: any) => boolean, fixedValue: any) {
    return (testValue: any) => {
        return comp(testValue, fixedValue);
    }
}

const getComp = {
    eq:  (value: any) => wrapComparator(Comparators.eq, value),
    neq:  (value: any) => wrapComparator(Comparators.neq, value),
    lt: (value: any) => wrapComparator(Comparators.lt, value),
    lte: (value: any) => wrapComparator(Comparators.lte, value),
    gt: (value: any) => wrapComparator(Comparators.gt, value),
    gte: (value: any) => wrapComparator(Comparators.gte, value),
    arrContains: (value: any) => wrapComparator(Comparators.arrContains, value),
    strContains: (value: any) => wrapComparator(Comparators.strContains, value),
}

export default getComp;