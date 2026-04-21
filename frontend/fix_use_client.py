import os, re

DIRS = ['c:\\greeguard_complete\\frontend\\src']
for d in DIRS:
    for r, _, files in os.walk(d):
        for f in files:
            if f.endswith(('.tsx', '.ts')):
                p = os.path.join(r, f)
                try:
                    with open(p, 'r', encoding='utf-8') as file:
                        c = file.read()
                except Exception:
                    continue
                
                # Check if file has use client but not at beginning
                client_match = re.search(r'[\'"]use client[\'"];?', c)
                if client_match:
                    match_str = client_match.group(0)
                    if c.strip().find(match_str) > 0:
                        # It is not at the very beginning
                        c = c.replace(match_str, '', 1)
                        c = match_str + '\n' + c.lstrip()
                        with open(p, 'w', encoding='utf-8') as file:
                            file.write(c)
                        print(f"Fixed use client in {p}")
