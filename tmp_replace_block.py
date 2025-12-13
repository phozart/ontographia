from pathlib import Path
lines=Path('pages/graphnavigator.js').read_text(encoding='utf-8').splitlines()
start=562
end=579
new_lines=[
"            <div className=\"toolbar-buttons\">",
"              <Tooltip title=\"Refresh\">",
"                <span className=\"toolbar-tooltip-span\">",
"                  <button className=\"toolbar-btn\" onClick={() => setReloadKey(k => k + 1)} disabled={loading}>",
"                    {loading ? '...' : '↻'}",
"                  </button>",
"                </span>",
"              </Tooltip>",
"              <Tooltip title=\"Clear filters\">",
"                <span className=\"toolbar-tooltip-span\">",
"                  <button",
"                    className=\"toolbar-btn\"",
"                    onClick={() => {",
"                      setSelectedType('');",
"                      setTypeFilters([]);",
"                      setNodeQuery('');",
"                      setHighlightedIds([]);",
"                      setFocusNodeId(null);",
"                    }}",
"                  >",
"                    ƒo\u0007",
"                  </button>",
"                </span>",
"              </Tooltip>",
"              <Tooltip title=\"Help\">",
"                <span className=\"toolbar-tooltip-span\">",
"                  <IconButton",
"                    size=\"small\"",
"                    onClick={() => setInfoOpen(true)}",
"                    sx={{ color: 'var(--text)' }}",
"                  >",
"                    <InfoOutlinedIcon fontSize=\"small\" />",
"                  </IconButton>",
"                </span>",
"              </Tooltip>",
"            </div>"
]
lines[start-1:end]=new_lines
Path('pages/graphnavigator.js').write_text('\n'.join(lines),encoding='utf-8')
