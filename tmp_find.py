from pathlib import Path
lines=Path('pages/graphnavigator.js').read_text(encoding='utf-8').splitlines()
for i,line in enumerate(lines,1):
    if line.strip().startswith('<div className="toolbar-buttons">'):
        print('found',i)
        for j in range(i-3, i+10):
            print(f"{j:04d}: {lines[j-1].encode('unicode_escape')}")
        break
