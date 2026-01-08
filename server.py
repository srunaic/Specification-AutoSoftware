import os
import sys
import webbrowser
from threading import Timer
from flask import Flask, request, jsonify, send_from_directory
from core.generators import MarkdownGenerator, CSVGenerator, ExcelGenerator

# Determine if running as a script or frozen EXE
if getattr(sys, 'frozen', False):
    template_folder = os.path.join(sys._MEIPASS, 'templates')
    static_folder = os.path.join(sys._MEIPASS, 'ui', 'dist')
else:
    template_folder = 'templates'
    static_folder = 'ui/dist'

app = Flask(__name__, static_folder=static_folder, template_folder=template_folder)

@app.route('/')
def serve_index():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory(app.static_folder, path)

@app.route('/api/generate', methods=['POST'])
def generate():
    data = request.json
    from datetime import datetime
    
    # 1. Structure Folders: outputs/YYYY-MM-DD/Title/
    date_str = datetime.now().strftime('%Y-%m-%d')
    title_sanitized = data.get('title', 'Untitled').replace(' ', '_')
    base_output_dir = os.path.join('outputs', date_str, title_sanitized)
    data_dir = os.path.join(base_output_dir, 'data_tables')
    
    os.makedirs(base_output_dir, exist_ok=True)
    os.makedirs(data_dir, exist_ok=True)

    try:
        # 2. Generate Markdown (Root)
        md_gen = MarkdownGenerator(template_folder)
        md_path = os.path.join(base_output_dir, f"{title_sanitized}_Spec.md")
        md_gen.generate(data, 'system_design.md.j2', md_path)

        # 3. Generate Word Document (Root)
        from core.generators import DocxGenerator
        docx_gen = DocxGenerator()
        docx_path = os.path.join(base_output_dir, f"{title_sanitized}_Spec.docx")
        docx_gen.generate(data, docx_path)

        # 4. Generate CSV (Data Folder)
        csv_gen = CSVGenerator()
        csv_gen.generate(data, data_dir)

        # 5. Generate Excel (Data Folder)
        excel_gen = ExcelGenerator()
        excel_path = os.path.join(data_dir, f"{title_sanitized}_Data.xlsx")
        excel_gen.generate(data, excel_path)

        # 6. Save Source JSON (Root)
        import json
        with open(os.path.join(base_output_dir, 'source_data.json'), 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)

        # Open the specific output folder
        os.startfile(os.path.abspath(base_output_dir))

        return jsonify({"status": "success", "message": f"'{title_sanitized}' 문서 생성이 완료되었습니다!"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

def open_browser():
    webbrowser.open_new('http://127.0.0.1:5000/')

if __name__ == '__main__':
    Timer(1, open_browser).start()
    app.run(port=5000)
