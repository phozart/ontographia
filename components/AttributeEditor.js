import { useMemo, useState } from 'react';
import { Chip, TextField, Box, Stack, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

export default function AttributeEditor({ attributes, onChange, suggestionKeys = [] }) {
  const [keyInput, setKeyInput] = useState('');
  const [valInput, setValInput] = useState('');

  const suggestions = useMemo(() => {
    const keys = Array.isArray(suggestionKeys) ? suggestionKeys : [];
    return keys.filter(k => k.toLowerCase().includes(keyInput.toLowerCase()) && k !== keyInput);
  }, [suggestionKeys, keyInput]);

  function addPair() {
    if (!keyInput) return;
    const next = { ...(attributes || {}) };
    next[keyInput] = valInput;
    onChange(next);
    setKeyInput('');
    setValInput('');
  }

  function removeKey(key) {
    const next = { ...(attributes || {}) };
    delete next[key];
    onChange(next);
  }

  return (
    <Box sx={{ mt: 1 }}>
      <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
        <TextField
          label="Key"
          size="small"
          value={keyInput}
          onChange={e => setKeyInput(e.target.value)}
          list="attr-suggestions"
        />
        <datalist id="attr-suggestions">
          {suggestions.map(k => (
            <option key={k} value={k} />
          ))}
        </datalist>
        <TextField
          label="Value"
          size="small"
          value={valInput}
          onChange={e => setValInput(e.target.value)}
        />
        <button className="btn-small" type="button" onClick={addPair}>
          Add
        </button>
      </Stack>

      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        {attributes &&
          Object.entries(attributes).map(([k, v]) => (
            <Chip
              key={k}
              label={`${k}: ${v}`}
              onDelete={() => removeKey(k)}
              deleteIcon={<DeleteIcon fontSize="small" />}
            />
          ))}
      </Stack>
    </Box>
  );
}
