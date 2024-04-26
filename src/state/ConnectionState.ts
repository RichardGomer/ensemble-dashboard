/**
 * Store state that represents ensemble mesh connection status
 */

import { atom, createStore, getDefaultStore } from 'jotai';

type ConnectionState = {
    connected: boolean,
    proxyId: string
}

let initialState : ConnectionState = {
    connected: false,
    proxyId: ''
}

let ConnectionStateAtom = atom(initialState);

/**
 * We can write into Jotai state from outside the react tree, by accessing the Store
 */
const defaultStore = getDefaultStore();

/**
 * Set up the connection to Ensemble
 */

import { EnsembleConnector } from "./EnsembleConnector"

const ensembleClient = new EnsembleConnector('ws://127.0.0.1:31075');
ensembleClient.ready().then(
    () => { // Success
        defaultStore.set(ConnectionStateAtom, (currentState) => {
            return {
                ...currentState,
                connected: true
            }
        })
    }
);


export { ConnectionStateAtom, ensembleClient };

