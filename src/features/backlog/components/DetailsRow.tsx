import type { ReactNode } from 'react';
import { Box, Typography } from '@mui/material';
import { muted } from '../constants/backlog.constants';

export default function DetailsRow({
    icon,
    label,
    children,
}: {
    icon?: ReactNode;
    label: string;
    children: ReactNode;
}) {
    return (
        <Box sx={{ mb: 2.6 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.7, mb: 1 }}>
                {icon}
                <Typography sx={{ color: muted, fontSize: 13, fontWeight: 700 }}>
                    {label}
                </Typography>
            </Box>

            {children}
        </Box>
    );
}