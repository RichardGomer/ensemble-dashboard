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

    constructor(wsurl : string) {

        this.readyPromise = new Promise((resolve, reject) => {
            try {
                this.connect(wsurl, ()=>{resolve(true);});
            } catch(e) {
                console.error(e);
                reject(e);
            }
        });


    }

    /**
     * Set up the websocket
     */
    connect(wsurl: string, then) {
        this.sock = new WebSocket(wsurl);

        if(this.sock === null) {
            throw "Failed to create websocket";
        }

        this.sock.onclose = (e: CloseEvent) : any => {
            console.log("Websocket was closed");
        };

        this.sock.onmessage = (m: MessageEvent) => {
            console.log("Received message", m);
            this.receive(m.data);
        };

        this.sock.onerror = (e: Event) => {
            console.log("Websocket error", e);
            this.sock.close();
        }

        this.sock.onopen = (e: Event) => {
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
     * Send a command to the endpoint
     * The command will be packaged up and sent just like any other eiot command, 
     * so may be routed between nodes.
     * 
     * A promise is returned, which resolves if a reply is received; and is rejected
     * if an exception is received.
     */
    send(target: string, action: string, args: CommandArgs) : Promise<Command> {

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
            console.log("Received ensemble proxy information. Proxy ID: " + cmd.args.handlerName);
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