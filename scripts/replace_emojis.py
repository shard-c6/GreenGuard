import os, re

EMOJI_MAP = {
    '🌱': 'Sprout',
    '🌍': 'Globe',
    '📧': 'Mail',
    '📸': 'Camera',
    '🌿': 'Leaf',
    '📍': 'MapPin',
    '🔔': 'Bell',
    '💧': 'Droplets',
    '☀️': 'SunMedium'
}

DIRS = ['c:\\greeguard_complete\\frontend\\src']

for d in DIRS:
    for r, _, files in os.walk(d):
        for f in files:
            if f.endswith(('.tsx', '.ts')):
                p = os.path.join(r, f)
                try:
                    with open(p, 'r', encoding='utf-8') as file:
                        content = file.read()
                except UnicodeDecodeError:
                    continue  # skip files that aren't utf-8

                needed = set()
                for e, t in EMOJI_MAP.items():
                    if e in content:
                        needed.add(t)
                        if e == '📧': 
                            content = content.replace(e, f'<{t} className="inline-block w-12 h-12 mb-4 mx-auto text-emerald-500" />')
                        else: 
                            content = content.replace(e, f'<{t} className="inline-block w-5 h-5 mr-1 align-text-bottom" />')
                
                if needed:
                    has_lucide = re.search(r'import\s+{([^}]+)}\s+from\s+([\'"])lucide-react\2', content)
                    if has_lucide:
                        existing = [x.strip() for x in has_lucide.group(1).split(',')]
                        all_needed = list(set(existing + list(needed)))
                        # Rebuild import
                        new_import = f'import {{ {", ".join(all_needed)} }} from "lucide-react"'
                        content = content.replace(has_lucide.group(0), new_import)
                    else:
                        imports = f'import {{ {", ".join(needed)} }} from "lucide-react";\n'
                        content = imports + content
                    
                    with open(p, 'w', encoding='utf-8') as file:
                        file.write(content)
                    print(f"Updated {p}")
