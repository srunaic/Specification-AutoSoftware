# Spec-Auto AI: 게임 디자이너를 위한 자동 기획 및 문서 생성 도구

Spec-Auto AI는 게임 기획자가 AI를 활용하여 복잡한 시스템 기획서를 작성하고, 이를 마크다운(Markdown), 워드(Docx), 엑셀(Excel) 등 다양한 형식의 기획 문서로 즉시 변환할 수 있도록 돕는 강력한 자동화 에디터입니다.

## 🚀 주요 기능

### 1. 지능형 AI 기획 비서 (Universal AI Assistant)
*   **멀티 모델 지원:** Google Gemini (1.5 Flash, 1.5 Pro, 2.0 Flash) 및 로컬 환경의 Ollama(Llama3, Mytral 등)를 모두 지원합니다.
*   **서버 사이드 프록시:** API 키 보안을 위해 백엔드(Flask)에서 AI 요청을 중개하며, 안정적인 연결 진단 기능을 제공합니다.
*   **템플릿 기반 생성:** '시스템 기획(표준)', '이벤트 기획(퀘스트)' 등 용도에 맞는 맞춤형 AI 결과물을 생성합니다.

### 2. 유연한 커스텀 섹션 (Flexible Sections)
*   **레이아웃 컨트롤:** 규칙 설정, 비용 설정, 예외 사항 등 기본 섹션을 자유롭게 삭제하거나 복구할 수 있습니다.
*   **다양한 섹션 타입:** 자유로운 글 작성을 위한 '텍스트 섹션'과 구조적 데이터 관리를 위한 '표(Table) 섹션'을 무제한으로 추가할 수 있습니다.
*   **완전한 자유도:** 섹션 제목 수정, 행 추가/삭제 등을 통해 기획서의 구조를 마음대로 설계할 수 있습니다.

### 3. 멀티 포맷 자동 문서 생성 (All-in-One Export)
*   **Markdown:** Github 및 Notion 등에 최적화된 마크다운 문서 생성.
*   **Word (Docx):** 공식 보고 및 아카이빙을 위한 워드 문서 자동 변환.
*   **Excel:** 기획 데이터를 수치화하여 관리할 수 있는 데이터 시트 생성.
*   **구조적 저장:** 날짜 및 기획 제목별로 폴더를 자동 생성하여 문서들을 체계적으로 관리합니다.

### 4. 사용자 친화적 에디터 (Modern UI/UX)
*   **Glassmorphism 디자인:** 현대적이고 세련된 투명 배경 UI.
*   **실시간 데이터 프리뷰:** 편집 중인 기획 데이터를 JSON 형태로 즉시 확인 가능 (SSOT 원칙 준수).
*   **독립 실행형 파일:** Python 설치 없이도 사용 가능한 단일 `.exe` 실행 파일 제공.

---

## 🛠 기술 스택

*   **Frontend:** React.js, Vite, Lucide-React (Icons)
*   **Backend:** Python 3.13, Flask, Jinja2 (Templating)
*   **Data/Doc Processing:** Pandas, Openpyxl, Python-Docx
*   **AI:** Google Generative AI (Gemini API), Ollama (Local LLM)
*   **Packaging:** PyInstaller (Single Executable Build)
*   **Deployment:** Cloudflare Pages (UI), Github Actions (CI/CD)

---

## 📈 개발 히스토리 및 주요 마일스톤

1.  **Phase 1: 기반 시스템 구축**
    *   Flask 백엔드와 마크다운 템플릿 엔진(Jinja2) 설계.
    *   Excel 및 Word 생성 코어 로직 구현.
2.  **Phase 2: AI 통합 및 UI 고도화**
    *   Vite + React 기반의 현대적인 Glassmorphism UI 개발.
    *   Gemini API 연동 및 서버 사이드 프록시 구현.
3.  **Phase 3: Ollama 및 템플릿 시스템 확장**
    *   로컬 AI(Ollama) 지원 추가 (오프라인 환경 대응).
    *   기획서 템플릿 선택 시스템(시스템 기획 / 이벤트 기획) 도입.
4.  **Phase 4: 유연한 에디터 기능 완성 (Flex Edition)**
    *   `custom_fields`에서 진화된 `custom_sections` 도입.
    *   기본 섹션 삭제/복구 기능 및 텍스트/표 타입 섹션 추가 기능 구현.
    *   `SpecAuto_AI_FlexEdition.exe` 최종 빌드 완료.

---

## 🔧 주요 이슈 해결 과정 (Troubleshooting)

*   **Flask 앱 초기화 오류:** PyInstaller 빌드 과정에서 발생한 Flask 인스턴스 참조 누락 문제를 해결하여 실행 파일 내에서도 안정적으로 서버가 동작하도록 수정했습니다.
*   **Cloudflare 배포 설정:** `wrangler.toml` 및 디렉토리 구조 최적화를 통해 React UI를 성공적으로 클라우드에 배포했습니다.
*   **정적 자원 누락:** PyInstaller 빌드 시 `ui/dist` 및 `templates` 폴더가 포함되지 않던 문제를 `--add-data` 옵션 최적화를 통해 해결했습니다.
*   **프론트엔드-백엔드 연동:** 웹 버전과 로컬 버전 간의 통신 방식 차이를 조율하고, placeholder로 남아있던 문서 생성 버튼을 실제 API와 연결했습니다.

---

## 📂 설치 및 사용 방법

1.  **실행 파일 사용 (추천):** `dist/SpecAuto_AI_FlexEdition.exe` 파일을 실행합니다.
2.  **소스 코드 실행:**
    ```bash
    # 종속성 설치
    pip install -r requirements.txt
    cd ui && npm install

    # 실행
    python server.py (백엔드)
    npm run dev (프론트엔드 - ui 폴더 내)
    ```

**Note:** AI 기능을 사용하려면 Gemini API Key가 있거나 로컬에 Ollama가 설치되어 있어야 합니다.
