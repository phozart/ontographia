from pathlib import Path
lines=Path('pages/graphnavigator.js').read_text(encoding='utf-8').splitlines()
for i in range(420,460):
    print(f"{i+1:04d}: {lines[i]}")
