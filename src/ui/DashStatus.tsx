
import { PrimitiveAtom, Atom, atom, useAtom } from "jotai";

import { widgetCountAtom } from "../state/WidgetState";
import { ConnectionStateAtom } from "../state/ConnectionState";

import { Box } from "@mui/system";
import { Chip } from "@mui/material";

const DashStatus = () => {
    return <Box sx={{ display: 'flex', gap: 1 }}>
        <WidgetCounter />
        <ConnInfo />
    </Box>
}

const WidgetCounter = () => {
    const [wcount] = useAtom(widgetCountAtom);

    return (
        <Chip label={`${wcount} widgets`} />
    )
}

const ConnInfo = () => {
    const [connection] = useAtom(ConnectionStateAtom);

    return (
        <Chip label={connection.connected ? "Connected to " + (connection.proxyId ? connection.proxyId + " at " : "") + connection.url : "Disconnected"} />
    )
}

export default DashStatus;