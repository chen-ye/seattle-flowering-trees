import re

with open("src/data.js", "r") as f:
    content = f.read()

# Current format for sci/com: ((source.sciField && p[source.sciField]) || "").trim();
# We want: ((source.sciField && p[source.sciField])?.toString() ?? "").trim();
content = re.sub(
    r'\(\(source\.sciField && p\[source\.sciField\]\) \|\| ""\)\.trim\(\)',
    r'((source.sciField && p[source.sciField])?.toString() ?? "").trim()',
    content
)
content = re.sub(
    r'\(\(source\.commonField && p\[source\.commonField\]\) \|\| ""\)\.trim\(\)',
    r'((source.commonField && p[source.commonField])?.toString() ?? "").trim()',
    content
)

# Current format for cond:
# const condVal = source.condField ? p[source.condField] : "";
# const cond = (condVal !== null && condVal !== undefined ? String(condVal) : "").trim();
# We want: const cond = ((source.condField && p[source.condField])?.toString() ?? "").trim();
content = re.sub(
    r'const condVal = source\.condField \? p\[source\.condField\] : "";\n\s*const cond = \(condVal !== null && condVal !== undefined \? String\(condVal\) : ""\)\.trim\(\);',
    r'const cond = ((source.condField && p[source.condField])?.toString() ?? "").trim();',
    content
)

with open("src/data.js", "w") as f:
    f.write(content)

print("Updated data.js")
