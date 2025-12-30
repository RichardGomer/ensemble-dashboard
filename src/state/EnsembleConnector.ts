/**
 * Some simple javascript bindings for ensemble iot
 */

type ReplyList = {
    [key: string]: Function
}

type CommandArgs = {
    [key: string]: any
}

type Command = {
    id: string,
    source: string,
    target: string,
    action: string,
    args: CommandArgs,
    expires: Number,
    follows: string|false
}

/**
 * Connect to an ensemble broker using the websocket interface
 */
class EnsembleConnector {

    replies : ReplyList = {};
    exceptions : ReplyList = {};

    sock : WebSocket;

    readyPromise : Promise<Boolean>;

    connected : boolean = false;
    url : string = "";
    proxyId : string = "";

    constructor(wsurl : string) {

        this.readyPromise = new Promise((resolve, reject) => {
            window.setTimeout(() => {
                try {
                    this.connect(wsurl, ()=>{
                        this.connected = true;
                        resolve(true);
                    }, reject);
                } catch(e) {
                    console.error("caught exception during connect", e);
                    reject(e);
                }
            }, 100);
        });

    }

    /**
     * Set up the websocket
     */
    connect(wsurl: string, then, reject) {
        this.sock = new WebSocket(wsurl);

        this.url = wsurl;

        if(this.sock === null) {
            throw "Failed to create websocket";
        }

        this.sock.onclose = (e: CloseEvent) : any => {
            this.connected = false;
            console.debug("Websocket was closed");
        };

        this.sock.onmessage = (m: MessageEvent) => {
            console.debug("Received message", m);
            this.receive(m.data);
        };

        this.sock.onerror = (e: Event) => {
            console.debug("Websocket error", e);
            reject(e);
        }

        this.sock.onopen = (e: Event) => {
            console.debug("Websocket connected");
            then();
        }
    }

    /**
     * Return a promise that waits for the websocket to be ready
     */
    ready() : Promise<Boolean> {

        return this.readyPromise;

    }

    /**
     * Get the proxy ID once connected, using a promise
     */
    private proxyIdResolve: (id: string) => void;
    private proxyIdPromise: Promise<string> = new Promise<string>((resolve, reject) => {
        this.proxyIdResolve = resolve;

        if(this.proxyId != '') {
            resolve(this.proxyId);
        }
    });

    getProxyId() : Promise<string>  {
        return this.proxyIdPromise;
    }

    setProxyId(id: string) {
        this.proxyId = id;
        console.log("Received ensemble proxy information. Proxy ID: " + id);
        if(this.proxyIdResolve) {
            this.proxyIdResolve(id);
        }
    }

    /**
     * Send a command to the endpoint
     * The command will be packaged up and sent just like any other eiot command, 
     * so may be routed between nodes.
     * 
     * A promise is returned, which resolves if a reply is received; and is rejected
     * if an exception is received.
     */
    send(target: string, action: string, args: CommandArgs) : Promise<Command> {

        if(!this.connected) {
            return Promise.reject("Not connected");
        } else {
            console.log("Websocket is connected, sending command");
        }

        let cmd : Command = {
            'id': Math.floor(Math.random() * 1000000000000).toString(),
            'source': '', // This field needs to be present, but the websocket proxy will set it to something meaningful
            'target': target,
            'action': action,
            'args': args,
            'expires': Math.ceil(Date.now() / 1000 + 60),
            'follows': false
        }

        let res = new Promise<Command>((resolve, reject) => {
            this.replies[cmd.id] = resolve;
            this.exceptions[cmd.id] = reject;
    
            console.log("Send", cmd);

            let job = JSON.stringify(cmd);
            this.sock.send(job);
        });

        return res;
    }

    receive (data: string) {
        let ob = JSON.parse(data);

        let cmd : Command = {
            id: ob.id,
            source: ob.source,
            target: ob.target,
            action: ob.action,
            args: ob.args,
            expires: ob.expires,
            follows: ob.follows
        }


        if(cmd.action == 'status') {
            this.setProxyId(cmd.args.handlerName);
            return;
        }

        if(typeof cmd.follows != 'string') {
            console.log("Orphaned command received, ignoring", cmd);
            return;
        }

        if(cmd.action == '_reply') {
            if(typeof this.replies[cmd.follows] != 'undefined') {
                this.replies[cmd.follows](cmd);
                delete this.replies[cmd.follows];

                if(this.exceptions[cmd.follows]) {
                    delete this.exceptions[cmd.follows];
                }
            }
        } else if(cmd.action == '_exception') {
            if(typeof this.exceptions[cmd.follows] != 'undefined') {
                this.exceptions[cmd.follows](cmd);
                delete this.exceptions[cmd.follows];

                if(this.replies[cmd.follows]) {
                    delete this.replies[cmd.follows];
                }
            }
        }
    }

}


export { EnsembleConnector };