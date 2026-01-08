import json
import argparse
import os
from core.generators import MarkdownGenerator, CSVGenerator

def main():
    parser = argparse.ArgumentParser(description="Specification AutoSoftware CLI")
    parser.add_argument("--input", required=True, help="Path to the input JSON file")
    args = parser.parse_args()

    if not os.path.exists(args.input):
        print(f"Error: Input file {args.input} not found.")
        return

    with open(args.input, 'r', encoding='utf-8') as f:
        data = json.load(f)

    # Directories
    template_dir = 'templates'
    output_dir = 'outputs'
    
    # 1. Generate Markdown
    print("Generating Markdown...")
    md_gen = MarkdownGenerator(template_dir)
    md_path = os.path.join(output_dir, 'design_doc.md')
    md_gen.generate(data, 'system_design.md.j2', md_path)
    print(f"Markdown generated: {md_path}")

    # 2. Generate CSV
    print("Generating CSV tables...")
    from core.generators import CSVGenerator, ExcelGenerator
    csv_gen = CSVGenerator()
    csv_paths = csv_gen.generate(data, output_dir)
    for path in csv_paths:
        print(f"CSV generated: {path}")

    # 3. Generate Excel
    print("Generating Excel sheet...")
    excel_gen = ExcelGenerator()
    excel_path = os.path.join(output_dir, 'design_doc.xlsx')
    excel_gen.generate(data, excel_path)
    print(f"Excel generated: {excel_path}")

    print("\nAll tasks completed successfully!")

if __name__ == "__main__":
    main()
