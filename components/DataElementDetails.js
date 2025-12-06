import React from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import MoreVertIcon from '@mui/icons-material/MoreVert';

function Row({ label, value }) {
  return (
    <Grid container spacing={1}>
      <Grid item xs={4}>
        <Typography variant="body2" color="text.secondary" fontWeight={600}>
          {label}
        </Typography>
      </Grid>
      <Grid item xs={8}>
        <Typography variant="body2">{value || '—'}</Typography>
      </Grid>
    </Grid>
  );
}

export default function DataElementDetails({ element, onEdit }) {
  if (!element) {
    return (
      <Box p={2} aria-label="No element selected">
        <Typography variant="body2" color="text.secondary">
          Select an element to see details.
        </Typography>
      </Box>
    );
  }

  const attrs = element.attributes || {};

  return (
    <Card elevation={2} aria-label="Element details">
      <CardHeader
        title={element.label || element.name}
        subheader={element.description || 'No description provided.'}
        action={
          <Stack direction="row" spacing={1}>
            <Tooltip title="Edit metadata">
              <IconButton size="small" onClick={() => onEdit?.(element.id)}>
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="More actions">
              <IconButton size="small">
                <MoreVertIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        }
      />
      <Divider />
      <CardContent>
        <Stack spacing={1.5}>
          <Row label="Data flow element" value={attrs.dataFlowName || element.name} />
          <Row label="Type" value={element.typeName} />
          <Row label="Layer" value={element.layer} />
          <Row label="Color" value={attrs.color || '—'} />
          <Row label="Format" value={attrs.format} />
          <Row label="Example" value={attrs.example} />
          <Row label="Mandatory" value={attrs.mandatory ? 'YES' : 'NO'} />
        </Stack>
        {!attrs.dataFlowName && !attrs.ldmName && !attrs.format && !attrs.example && attrs.mandatory === undefined && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            No metadata defined yet.
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}
