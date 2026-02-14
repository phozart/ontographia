// components/ui/ConfirmDialog.js
// Reusable confirmation dialog component

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';

/**
 * ConfirmDialog - A reusable confirmation dialog
 *
 * @param {Object} props
 * @param {boolean} props.open - Whether the dialog is open
 * @param {string} props.title - Dialog title
 * @param {string} props.message - Confirmation message
 * @param {string} [props.confirmText='Confirm'] - Text for confirm button
 * @param {string} [props.cancelText='Cancel'] - Text for cancel button
 * @param {string} [props.confirmColor='primary'] - Color for confirm button
 * @param {Function} props.onConfirm - Callback when confirmed
 * @param {Function} props.onCancel - Callback when cancelled
 * @param {boolean} [props.loading=false] - Whether an action is in progress
 */
export default function ConfirmDialog({
  open,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmColor = 'primary',
  onConfirm,
  onCancel,
  loading = false,
}) {
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      maxWidth="xs"
      fullWidth
      PaperProps={{ sx: { borderRadius: 2 } }}
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{message}</DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onCancel} disabled={loading}>
          {cancelText}
        </Button>
        <Button
          variant="contained"
          color={confirmColor}
          onClick={onConfirm}
          disabled={loading}
        >
          {loading ? 'Processing...' : confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
