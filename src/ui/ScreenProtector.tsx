import { useEffect, useState } from 'react';
import { Box } from '@mui/material';

interface ScreenProtectorProps {
    children: React.ReactNode;
    interval?: number;
}

export const ScreenProtector: React.FC<ScreenProtectorProps> = ({ 
    children, 
    interval = 30000 
}) => {
    

    const range = 5; // percentage range for padding
    const maxChange = 2;

    const [offset, setOffset] = useState({ x: range / 2, y: range / 2 });

    useEffect(() => {
        const timer = setInterval(() => {
            setOffset(prev => ({
                x: Math.max(0, Math.min(range, prev.x + (Math.random() - 0.5) * maxChange)),
                y: Math.max(0, Math.min(range, prev.y + (Math.random() - 0.5) * maxChange)),
            }));
        }, interval);

        return () => clearInterval(timer);
    }, [interval]);

    return (
        <Box
            sx={{
                paddingLeft: `${offset.x}%`,
                paddingTop: `${offset.y}%`,
                paddingRight: `${range-offset.x}%`,
                paddingBottom: `${range-offset.y}%`,
                transition: `padding 1s ease-in-out`,
                width: "100%"  ,
                "& > *": {
                    width: `${100-range}%`,
                }
            }}
        >
            {children}
        </Box>
    );
};