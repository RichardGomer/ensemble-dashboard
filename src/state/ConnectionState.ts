/**
 * Store state that represents ensemble mesh connection status
 */

import { atom, createStore, getDefaultStore } from 'jotai';

type ConnectionState = {
    connected: boolean,
    url: string,
    proxyId: string,
    error: boolean,
    errorStr: string
}

let initialState: ConnectionState = {
    connected: false,
    url: '',
    proxyId: '',
    error: false,
    errorStr: ''
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

const ensembleClient = new EnsembleConnector('ws://10.0.0.8:31075');

function updateConn() {
    defaultStore.set(ConnectionStateAtom, (currentState) => {
        return {
            ...currentState,
            connected: true,
            url: ensembleClient.url
        }
    })
};

ensembleClient.getProxyId().then( (id) => {
    defaultStore.set(ConnectionStateAtom, (currentState) => {
        return {
            ...currentState,
            proxyId: id
        }
    })
} );

ensembleClient.ready()
    .then( // Success
        () => {
            updateConn();
        }
    )
    .catch( // Failure
        (e) => {
            defaultStore.set(ConnectionStateAtom, (currentState) => {
                return {
                    ...currentState,
                    connected: false,
                    error: true,
                    errorStr: "WebSocket connection failed"
                }
            })
        }
    );


export { ConnectionStateAtom, ensembleClient };

