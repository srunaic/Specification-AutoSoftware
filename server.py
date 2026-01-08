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
    output_dir = 'outputs'
    os.makedirs(output_dir, exist_ok=True)

    try:
        # Generate Markdown
        md_gen = MarkdownGenerator(template_folder)
        md_path = os.path.join(output_dir, 'design_doc.md')
        md_gen.generate(data, 'system_design.md.j2', md_path)

        # Generate CSV
        csv_gen = CSVGenerator()
        csv_gen.generate(data, output_dir)

        # Generate Excel
        excel_gen = ExcelGenerator()
        excel_path = os.path.join(output_dir, 'design_doc.xlsx')
        excel_gen.generate(data, excel_path)

        # Open the output folder
        os.startfile(os.path.abspath(output_dir))

        return jsonify({"status": "success", "message": "Files generated and folder opened!"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

def open_browser():
    webbrowser.open_new('http://127.0.0.1:5000/')

if __name__ == '__main__':
    Timer(1, open_browser).start()
    app.run(port=5000)
