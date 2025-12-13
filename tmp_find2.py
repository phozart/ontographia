from pathlib import Path
lines=Path('pages/graphnavigator.js').read_text(encoding='utf-8').splitlines()
count=0
for i,line in enumerate(lines,1):
    if 'className="toolbar-buttons"' in line:
        count+=1
        if count==2:
            print('found second',i)
            for j in range(i-3, i+10):
                print(f"{j:04d}: {lines[j-1].encode('unicode_escape')}")
            break
