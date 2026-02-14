// components/ba/blocks/TableBlock.js
// Table block component with editable cells

import { useState, useRef } from 'react';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

export default function TableBlock({ content, onChange, onDelete, isEditing }) {
  const { headers = ['Column 1', 'Column 2'], rows = [['', '']] } = content || {};
  const [focusCell, setFocusCell] = useState(null);

  const handleHeaderChange = (colIndex, value) => {
    const newHeaders = [...headers];
    newHeaders[colIndex] = value;
    onChange({ ...content, headers: newHeaders });
  };

  const handleCellChange = (rowIndex, colIndex, value) => {
    const newRows = rows.map((row, ri) =>
      ri === rowIndex
        ? row.map((cell, ci) => (ci === colIndex ? value : cell))
        : row
    );
    onChange({ ...content, rows: newRows });
  };

  const addColumn = () => {
    const newHeaders = [...headers, `Column ${headers.length + 1}`];
    const newRows = rows.map((row) => [...row, '']);
    onChange({ ...content, headers: newHeaders, rows: newRows });
  };

  const removeColumn = (colIndex) => {
    if (headers.length <= 1) return;
    const newHeaders = headers.filter((_, i) => i !== colIndex);
    const newRows = rows.map((row) => row.filter((_, i) => i !== colIndex));
    onChange({ ...content, headers: newHeaders, rows: newRows });
  };

  const addRow = () => {
    const newRow = headers.map(() => '');
    onChange({ ...content, rows: [...rows, newRow] });
  };

  const removeRow = (rowIndex) => {
    if (rows.length <= 1) return;
    const newRows = rows.filter((_, i) => i !== rowIndex);
    onChange({ ...content, rows: newRows });
  };

  const handleKeyDown = (e, rowIndex, colIndex) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const nextCol = colIndex + 1;
      if (nextCol < headers.length) {
        setFocusCell({ row: rowIndex, col: nextCol });
      } else if (rowIndex + 1 < rows.length) {
        setFocusCell({ row: rowIndex + 1, col: 0 });
      } else {
        // Add new row
        addRow();
        setTimeout(() => setFocusCell({ row: rowIndex + 1, col: 0 }), 0);
      }
    }
  };

  if (!isEditing) {
    return (
      <div className="block-table-view">
        <table className="block-table">
          <thead>
            <tr>
              {headers.map((header, i) => (
                <th key={i}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri}>
                {row.map((cell, ci) => (
                  <td key={ci}>{cell || '-'}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="block-table-edit">
      <div className="table-controls">
        <button className="table-btn" onClick={addColumn} type="button">
          <AddIcon fontSize="small" /> Column
        </button>
        <button className="table-btn" onClick={addRow} type="button">
          <AddIcon fontSize="small" /> Row
        </button>
      </div>

      <div className="table-wrapper">
        <table className="editable-table">
          <thead>
            <tr>
              {headers.map((header, ci) => (
                <th key={ci}>
                  <div className="header-cell">
                    <input
                      type="text"
                      value={header}
                      onChange={(e) => handleHeaderChange(ci, e.target.value)}
                      className="header-input"
                    />
                    {headers.length > 1 && (
                      <button
                        className="remove-col-btn"
                        onClick={() => removeColumn(ci)}
                        type="button"
                        title="Remove column"
                      >
                        <RemoveIcon fontSize="small" />
                      </button>
                    )}
                  </div>
                </th>
              ))}
              <th className="actions-col"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri}>
                {row.map((cell, ci) => (
                  <td key={ci}>
                    <input
                      type="text"
                      value={cell}
                      onChange={(e) => handleCellChange(ri, ci, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, ri, ci)}
                      className="cell-input"
                      autoFocus={focusCell?.row === ri && focusCell?.col === ci}
                    />
                  </td>
                ))}
                <td className="actions-col">
                  {rows.length > 1 && (
                    <button
                      className="remove-row-btn"
                      onClick={() => removeRow(ri)}
                      type="button"
                      title="Remove row"
                    >
                      <RemoveIcon fontSize="small" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
