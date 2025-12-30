import { Box, SxProps, Theme } from '@mui/material';

interface VertCapacityProps {
    percentage: number;
    height?: number;
    width?: number;
    fillColor?: string;
    backgroundColor?: string;
    showLabel?: boolean;
    sx?: SxProps<Theme>;
}

export const VertCapacity: React.FC<VertCapacityProps> = ({
    percentage,
    width = 40,
    fillColor = '#eee',
    backgroundColor = '#333',
    sx,
}) => {
    const clampedPercentage = Math.max(0, Math.min(100, percentage));

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, ...sx }}>
            <Box
                sx={{
                    position: 'relative',
                    width: `${width}px`,
                    backgroundColor,
                    border: '2px solid #999',
                    borderRadius: '4px',
                    overflow: 'hidden',
                    height: '100%'
                }}
            >
                <Box
                    sx={{
                        position: 'absolute',
                        bottom: 0,
                        width: '100%',
                        height: `${clampedPercentage}%`,
                        backgroundColor: fillColor,
                        transition: 'height 0.3s ease',
                    }}
                />
            </Box>
        </Box>
    );
};

export default VertCapacity;