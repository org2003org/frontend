import { Chip } from '@mui/material';
import { labelStyles } from '../constants/backlog.constants';

export default function LabelChip({ label }: { label: string }) {
    const cfg = labelStyles[label.toLowerCase()] ?? { color: '#667085', bg: '#F2F4F7' };
    return (
        <Chip
            label={label}
            size="small"
            sx={{
                height: 20,
                borderRadius: '6px',
                bgcolor: cfg.bg,
                color: cfg.color,
                fontWeight: 600,
                fontSize: 13,
                '& .MuiChip-label': { px: 0.9 },
            }}
        />
    );
}