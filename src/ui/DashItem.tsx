import React from "react";

import Grid from '@mui/material/Unstable_Grid2'; // Grid version 2
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';

import { Box } from "@mui/system";
import { Button, CardActions, Typography } from "@mui/material";



const DashItem = ({ title, children, width }) => {

if(!width) {
    width = 1;
}

return <Grid xs={12 * width} sm={4 * width} md={4 * width} lg={2 * width}>
        <Card variant="outlined">
            <CardContent>
                <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                    {title}
                </Typography>
                    {children}
            </CardContent>
        </Card>
    </Grid>
}

export { DashItem }