filepath = r"d:\KSOM\Website\Web Apps\Payslip\payslip.git\payslip-ui\src\pages\Paybill.jsx"
with open(filepath, 'r', encoding='utf-8') as f:
    lines = f.readlines()

output_filepath = r"d:\KSOM\Website\Web Apps\Payslip\payslip.git\scratch\search_numfmt_out.txt"
with open(output_filepath, 'w', encoding='utf-8') as out_f:
    for i, line in enumerate(lines, 1):
        if 'inp =' in line or 'function inp' in line or 'const inp' in line:
            out_f.write(f"{i}: {line.strip()}\n")


