import { ReactNode } from "react";

import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';

import { Box } from "@mui/system";
import { Button, CardActions, Typography } from "@mui/material";
import { SvgIcon } from "@mui/material";

import { HotTub } from "@mui/icons-material";

const DashItem = ({ title, icon, children, width, sx }: { title: String, icon?: typeof HotTub, children: ReactNode, width?: number, sx?: Object }) => {

    if (!width) {
        width = 1;
    }

    return <Grid size={{ xs: 12 * width, sm: 4 * width, md: 4 * width, lg: 2 * width }}>

        <Card variant="outlined" sx={sx}>
            <CardContent>

                <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                    {title}
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                    {icon && <SvgIcon component={icon} sx={{ fontSize: 40, marginRight: "20px", opacity: 0.4 }} /> }
                    {children}
                </Box>

            </CardContent>
        </Card>
    </Grid>
}

export { DashItem }