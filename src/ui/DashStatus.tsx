
import { PrimitiveAtom, Atom, atom, useAtom } from "jotai";

import { widgetCountAtom } from "../state/WidgetState";
import { ConnectionStateAtom } from "../state/ConnectionState";

import { Box } from "@mui/system";
import { Chip } from "@mui/material";

const DashStatus = () => {
    return <Box sx={{ display: 'flex', gap: 1 }}>
        <ConnInfo />
    </Box>
}


const ConnInfo = () => {
    const [connection] = useAtom(ConnectionStateAtom);

    return (
        <Chip 
            label={connection.connected ? "Connected to " + (connection.proxyId ? connection.proxyId + " at " : "") + connection.url : "Disconnected"}
            icon={<Box sx={{ width: 8, height: 8, borderRadius: '50%', marginLeft: "10px !important", backgroundColor: connection.connected ? '#5ef263ff' : '#ff4538ff' }} />}
        />)
}

export default DashStatus;