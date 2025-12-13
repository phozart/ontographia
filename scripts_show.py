from pathlib import Path
lines=Path('pages/graphnavigator.js').read_text(encoding='utf-8').splitlines()
needle='Tooltip title="Refresh"'
for i,line in enumerate(lines,1):
    if needle in line:
        for j in range(i-6, i+10):
            print(f"{j:04d}: {lines[j-1].encode('unicode_escape')}")
        break
