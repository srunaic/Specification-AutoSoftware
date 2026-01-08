import os
import sys
import webbrowser
import json
from threading import Timer
from datetime import datetime
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import google.generativeai as genai
from core.generators import MarkdownGenerator, CSVGenerator, ExcelGenerator, DocxGenerator

# Determine if running as a script or frozen EXE
if getattr(sys, 'frozen', False):
    template_folder = os.path.join(sys._MEIPASS, 'templates')
    static_folder = os.path.join(sys._MEIPASS, 'ui', 'dist')
else:
    template_folder = 'templates'
    static_folder = 'ui/dist'

app = Flask(__name__, static_folder=static_folder, static_url_path='')
CORS(app) # Enable CORS for development

@app.route('/')
def index():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/api/ai/generate', methods=['POST'])
def ai_generate():
    data = request.json
    api_key = data.get('api_key') or os.environ.get('GEMINI_API_KEY')
    model_name = data.get('model', 'gemini-1.5-flash')
    prompt = data.get('prompt')

    if not api_key:
        return jsonify({"status": "error", "message": "API Key가 필요합니다."}), 400

    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel(model_name)
        
        template_type = data.get('template_type', 'system_design')
        
        # Adjust prompt schema based on template type
        if template_type == 'event_planning':
            schema = """{
              "type": "event_planning",
              "title": "Event Title",
              "summary": "Event summary",
              "rules": { "start_level": number, "end_date": "string" },
              "costs": { "reward_items": string[] },
              "exceptions": string[]
            }"""
        else:
            schema = """{
              "type": "system_design",
              "title": "System Title",
              "summary": "System summary",
              "rules": { "max_level": number, "success_rate": [{"level": number, "rate": number}] },
              "costs": { "gold": number[], "material": string[] },
              "exceptions": string[]
            }"""

        system_prompt = f"You are a professional Game System Designer. Output ONLY a valid JSON object matching this schema: {schema}"
        
        response = model.generate_content(f"{system_prompt}\n\nUser Request: {prompt}")
        
        # Extract JSON from response
        text = response.text
        cleaned_json = text.replace('```json', '').replace('```', '').strip()
        
        return jsonify({
            "status": "success", 
            "data": json.loads(cleaned_json),
            "model_used": model_name
        })
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

# Flask automatically serves files from static_folder if static_url_path is set.
# No need for manual /<path:path> routes in most cases, but we'll add a catch-all for SPA.
@app.errorhandler(404)
def page_not_found(e):
    return send_from_directory(app.static_folder, 'index.html')

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
        # 2. Identify Template
        template_file = data.get('template_file', 'system_design.md.j2')
        
        # 3. Generate Markdown (Root)
        md_gen = MarkdownGenerator(template_folder)
        md_path = os.path.join(base_output_dir, f"{title_sanitized}_Spec.md")
        md_gen.generate(data, template_file, md_path)

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
