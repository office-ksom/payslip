import os

pages_dir = r"d:\KSOM\Website\Web Apps\Payslip\payslip.git\payslip-ui\src\pages"
files_to_check = ["Paybill.jsx", "SurrenderBill.jsx", "ArrearBill.jsx", "FestivalAllowanceBill.jsx", "ConsolidatedStatement.jsx", "Reports.jsx"]

out_filepath = r"d:\KSOM\Website\Web Apps\Payslip\payslip.git\scratch\search_all_out.txt"
with open(out_filepath, 'w', encoding='utf-8') as out_f:
    for filename in files_to_check:
        filepath = os.path.join(pages_dir, filename)
        if not os.path.exists(filepath):
            continue
        out_f.write(f"=== {filename} ===\n")
        with open(filepath, 'r', encoding='utf-8') as f:
            lines = f.readlines()
        for i, line in enumerate(lines, 1):
            line_str = line.strip()
            # search for rounding, toFixed, toLocaleString, fmt, gross, net, da, hra, basic, etc.
            if any(k in line_str for k in ['toFixed', 'toLocaleString', 'fmt', 'Math.round', 'numFmt']):
                out_f.write(f"{i}: {line_str}\n")
        out_f.write("\n")
print("Done")
