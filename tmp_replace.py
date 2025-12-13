from pathlib import Path
text=Path('pages/graphnavigator.js').read_text(encoding='utf-8')
needle='            <div className=\"toolbar-buttons\">\r\n'
start=text.rfind(needle)
if start==-1:
    raise SystemExit('not found start')
end=text.index('          </div>',start)
block=text[start:end]
new_block="""            <div className=\"toolbar-buttons\">\r\n              <Tooltip title=\"Refresh\">\r\n                <span className=\"toolbar-tooltip-span\">\r\n                  <button className=\"toolbar-btn\" onClick={() => setReloadKey(k => k + 1)} disabled={loading}>\r\n                    {loading ? '...' : '↻'}\r\n                  </button>\r\n                </span>\r\n              </Tooltip>\r\n              <Tooltip title=\"Clear filters\">\r\n                <span className=\"toolbar-tooltip-span\">\r\n                  <button\r\n                    className=\"toolbar-btn\"\r\n                    onClick={() => {\r\n                      setSelectedType('');\r\n                      setTypeFilters([]);\r\n                      setNodeQuery('');\r\n                      setHighlightedIds([]);\r\n                      setFocusNodeId(null);\r\n                    }}\r\n                  >\r\n                    ƒo\u0007\r\n                  </button>\r\n                </span>\r\n              </Tooltip>\r\n              <Tooltip title=\"Help\">\r\n                <span className=\"toolbar-tooltip-span\">\r\n                  <IconButton\r\n                    size=\"small\"\r\n                    onClick={() => setInfoOpen(true)}\r\n                    sx={{ color: 'var(--text)' }}\r\n                  >\r\n                    <InfoOutlinedIcon fontSize=\"small\" />\r\n                  </IconButton>\r\n                </span>\r\n              </Tooltip>\r\n            </div>"""
text=text[:start]+new_block+text[end:]
Path('pages/graphnavigator.js').write_text(text,encoding='utf-8')
