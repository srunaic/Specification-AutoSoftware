import React, { useState } from 'react';
import { Plus, Trash2, Download, FileJson, CheckCircle } from 'lucide-react';
import { supabase } from './supabaseClient';

function App() {
    const [data, setData] = useState({
        type: "system_design",
        title: "아이템 강화 시스템",
        summary: "아이템을 소모 재화로 강화하여 성능을 향상시킨다.",
        rules: {
            max_level: 10,
            success_rate: [
                { level: 1, rate: 1.0 },
                { level: 2, rate: 0.9 }
            ]
        },
        costs: {
            gold: [100, 200, 300],
            material: ["강화석"]
        },
        exceptions: ["강화 실패 시 레벨 하락 없음"]
    });

    const updateSuccessRate = (index, field, value) => {
        const newRates = [...data.rules.success_rate];
        newRates[index][field] = parseFloat(value) || 0;
        setData({ ...data, rules: { ...data.rules, success_rate: newRates } });
    };

    const addSuccessRate = () => {
        const nextLevel = data.rules.success_rate.length + 1;
        setData({
            ...data,
            rules: {
                ...data.rules,
                success_rate: [...data.rules.success_rate, { level: nextLevel, rate: 0.5 }]
            }
        });
    };

    const removeSuccessRate = (index) => {
        const newRates = data.rules.success_rate.filter((_, i) => i !== index);
        setData({ ...data, rules: { ...data.rules, success_rate: newRates } });
    };

    const [aiPrompt, setAiPrompt] = useState('');
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [apiKey, setApiKey] = useState('');
    const [selectedModel, setSelectedModel] = useState('gemini-1.5-flash');
    const [customModel, setCustomModel] = useState('');
    const [selectedTemplate, setSelectedTemplate] = useState('system_design.md.j2');

    const TEMPLATES = [
        { id: 'system_design.md.j2', name: '시스템 기획 (표준)', type: 'system_design' },
        { id: 'event_planning.md.j2', name: '이벤트 기획 (퀘스트)', type: 'event_planning' }
    ];

    const [ollamaUrl, setOllamaUrl] = useState('http://localhost:11434');
    const [ollamaModel, setOllamaModel] = useState('llama3');

    const AI_MODELS = [
        { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash (추천/안정)' },
        { id: 'gemini-1.5-flash-8b', name: 'Gemini 1.5 Flash-8B (가장 빠름)' },
        { id: 'gemini-2.0-flash-exp', name: 'Gemini 2.0 Flash (최신/실험)' },
        { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro (스마트/느림)' },
        { id: 'custom', name: '직접 입력 (Gemini 모델 ID)' },
        { id: 'ollama', name: 'Ollama (Local LLM)' }
    ];

    const generateWithAI = async () => {
        if (!aiPrompt) return alert("AI에게 요청할 내용을 입력해주세요!");

        // Validation based on model type
        if (selectedModel !== 'ollama' && !apiKey) return alert("Gemini API Key를 입력해주세요!");
        if (selectedModel === 'custom' && !customModel) return alert("사용할 모델 ID를 입력해주세요!");
        if (selectedModel === 'ollama') {
            if (!ollamaUrl) return alert("Ollama 서버 주소를 입력해주세요!");
            if (!ollamaModel) return alert("Ollama 모델명을 입력해주세요!");
        }

        const finalModel = selectedModel === 'custom' ? customModel : selectedModel;

        setIsAiLoading(true);
        try {
            // Calling local backend proxy instead of direct Google API
            const response = await fetch('/api/ai/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: aiPrompt,
                    model: finalModel,
                    api_key: apiKey,
                    template_type: TEMPLATES.find(t => t.id === selectedTemplate)?.type || 'system_design',
                    ollama_url: ollamaUrl,
                    ollama_model: ollamaModel
                })
            });

            const result = await response.json();

            if (result.status === "error") {
                throw new Error(result.message);
            }

            setData(result.data);
            alert(`✨ [${result.model_used}] 을 통한 서버 사이드 기획 생성이 완료되었습니다!`);
        } catch (err) {
            console.error("AI Proxy Error:", err);
            alert(`AI 연동 실패 (Server Proxy)\n------------------\n${err.message}`);
        } finally {
            setIsAiLoading(false);
        }
    };

    const handleGenerate = async () => {
        try {
            // Include target template in the data payload
            const payload = { ...data, template_file: selectedTemplate };
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const result = await response.json();
            alert(result.message);
        } catch (error) {
            alert("연결 실패: 서버(main.py)가 실행 중인지 확인하세요.");
        }
    };

    const handleExport = async () => {
        alert("Not implemented in web version");
    };

    const saveToSupabase = async () => {
        alert("Supabase integration is configured but requires an anon key/table to function.");
    };

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
            <div className="glass-card">
                <h1>Spec-Auto Editor <span style={{ fontSize: '14px', color: '#60a5fa', verticalAlign: 'middle' }}>v3.7 AI</span></h1>

                {/* AI Assistant Section (Universal v3.2) */}
                <div style={{ background: 'rgba(96, 165, 250, 0.1)', padding: '16px', borderRadius: '12px', marginBottom: '24px', border: '1px solid rgba(96, 165, 250, 0.2)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <h3 style={{ margin: 0, fontSize: '16px', color: '#60a5fa' }}>🤖 AI 기획 비서 (Universal)</h3>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <select
                                value={selectedModel}
                                onChange={(e) => setSelectedModel(e.target.value)}
                                style={{ width: 'auto', padding: '4px 8px', fontSize: '12px', background: 'rgba(0,0,0,0.3)' }}
                            >
                                {AI_MODELS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label style={{ fontSize: '12px', opacity: 0.7 }}>문서 템플릿</label>
                            <select
                                value={selectedTemplate}
                                onChange={(e) => setSelectedTemplate(e.target.value)}
                                style={{ width: '100%', marginTop: '4px' }}
                            >
                                {TEMPLATES.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Model Specific Inputs */}
                    <div style={{ marginBottom: '12px', padding: '8px', background: 'rgba(0,0,0,0.2)', borderRadius: '6px' }}>
                        {selectedModel === 'custom' && (
                            <input
                                value={customModel}
                                onChange={(e) => setCustomModel(e.target.value)}
                                placeholder="Gemini 모델 ID 입력 (예: gemini-2.0-flash)"
                                style={{ width: '100%', marginBottom: '4px' }}
                            />
                        )}
                        {selectedModel === 'ollama' && (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                <input
                                    value={ollamaUrl}
                                    onChange={(e) => setOllamaUrl(e.target.value)}
                                    placeholder="서버 주소 (기본: http://localhost:11434)"
                                />
                                <input
                                    value={ollamaModel}
                                    onChange={(e) => setOllamaModel(e.target.value)}
                                    placeholder="모델명 (예: llama3, mistral)"
                                />
                            </div>
                        )}
                        {selectedModel !== 'ollama' && (
                            <input
                                type="password"
                                placeholder="Gemini API Key 입력"
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                style={{ width: '100%' }}
                            />
                        )}
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                        <input
                            value={aiPrompt}
                            onChange={(e) => setAiPrompt(e.target.value)}
                            placeholder={selectedModel === 'ollama' ? "로컬 AI에게 요청할 내용 입력..." : "예: 초보자도 이해하기 쉬운 자동 사냥 시스템 기획해줘"}
                            style={{ flex: 1 }}
                        />
                        <button
                            onClick={generateWithAI}
                            disabled={isAiLoading}
                            style={{ background: isAiLoading ? '#666' : (selectedModel === 'ollama' ? '#f59e0b' : '#60a5fa'), width: 'auto', padding: '0 16px' }}
                        >
                            {isAiLoading ? '생성 중...' : '기획 생성'}
                        </button>
                    </div>

                    {selectedModel !== 'ollama' && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>
                                * Gemini 1.5, 2.0 지원 / API 버전 자동 감지
                            </p>
                            <button
                                onClick={async () => {
                                    if (!apiKey) return alert("API 키를 먼저 입력해주세요.");
                                    try {
                                        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
                                        const diagData = await res.json();
                                        if (diagData.error) throw new Error(diagData.error.message);
                                        const modelList = diagData.models.map(m => m.name.split('/').pop()).join(', ');
                                        alert(`✅ 연결 성공! 사용 가능한 모델:\n${modelList}`);
                                    } catch (e) {
                                        alert(`❌ 진단 실패: ${e.message}`);
                                    }
                                }}
                                style={{ width: 'auto', padding: '2px 8px', fontSize: '10px', background: 'rgba(255,255,255,0.1)', border: 'none' }}
                            >
                                API 진단
                            </button>
                        </div>
                    )}
                </div>

                <label>제목</label>
                <input
                    value={data.title}
                    onChange={(e) => setData({ ...data, title: e.target.value })}
                />

                <label>개요</label>
                <textarea
                    rows={3}
                    value={data.summary}
                    onChange={(e) => setData({ ...data, summary: e.target.value })}
                />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3>규칙 설정</h3>
                    {data.rules && (
                        <button className="secondary-button" onClick={() => setData({ ...data, rules: null })} style={{ border: '1px solid rgba(239, 68, 68, 0.2)', padding: '2px 8px' }}>
                            <Trash2 size={14} color="#ef4444" />
                        </button>
                    )}
                </div>
                {!data.rules ? (
                    <button className="secondary-button" onClick={() => setData({ ...data, rules: { max_level: 10, success_rate: [] } })} style={{ width: '100%', marginBottom: '20px' }}>
                        <Plus size={16} /> 규칙 설정 복구
                    </button>
                ) : (
                    <>
                        <label>최대 레벨</label>
                        <input
                            type="number"
                            value={data.rules.max_level}
                            onChange={(e) => setData({ ...data, rules: { ...data.rules, max_level: parseInt(e.target.value) } })}
                        />

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                            <h4>성공 확률 테이블</h4>
                            <button onClick={addSuccessRate} className="secondary-button" style={{ padding: '4px 12px' }}>
                                <Plus size={16} style={{ marginRight: '4px' }} /> 레벨 추가
                            </button>
                        </div>

                        <div style={{ maxHeight: '300px', overflowY: 'auto', paddingRight: '10px' }}>
                            {data.rules.success_rate.map((row, i) => (
                                <div key={i} className="table-row">
                                    <input type="number" placeholder="Lv" value={row.level} onChange={(e) => updateSuccessRate(i, 'level', e.target.value)} />
                                    <input type="number" step="0.1" placeholder="Rate" value={row.rate} onChange={(e) => updateSuccessRate(i, 'rate', e.target.value)} />
                                    <button className="secondary-button" onClick={() => removeSuccessRate(i)} style={{ border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                                        <Trash2 size={16} color="#ef4444" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {/* Costs Section */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px' }}>
                    <h3>비용 설정</h3>
                    {data.costs && (
                        <button className="secondary-button" onClick={() => setData({ ...data, costs: null })} style={{ border: '1px solid rgba(239, 68, 68, 0.2)', padding: '2px 8px' }}>
                            <Trash2 size={14} color="#ef4444" />
                        </button>
                    )}
                </div>
                {!data.costs ? (
                    <button className="secondary-button" onClick={() => setData({ ...data, costs: { gold: [100, 200, 300], material: ["강화석"] } })} style={{ width: '100%', marginBottom: '20px' }}>
                        <Plus size={16} /> 비용 설정 복구
                    </button>
                ) : (
                    <>
                        <label>소모 골드 (콤마로 구분)</label>
                        <input
                            value={data.costs.gold.join(', ')}
                            onChange={(e) => setData({ ...data, costs: { ...data.costs, gold: e.target.value.split(',').map(s => s.trim()) } })}
                        />
                        <label>필요 재료 (콤마로 구분)</label>
                        <input
                            value={data.costs.material.join(', ')}
                            onChange={(e) => setData({ ...data, costs: { ...data.costs, material: e.target.value.split(',').map(s => s.trim()) } })}
                        />
                    </>
                )}

                {/* Exceptions Section */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px' }}>
                    <h3>예외 사항</h3>
                    {data.exceptions && (
                        <button className="secondary-button" onClick={() => setData({ ...data, exceptions: null })} style={{ border: '1px solid rgba(239, 68, 68, 0.2)', padding: '2px 8px' }}>
                            <Trash2 size={14} color="#ef4444" />
                        </button>
                    )}
                </div>
                {!data.exceptions ? (
                    <button className="secondary-button" onClick={() => setData({ ...data, exceptions: ["강화 실패 시 레벨 하락 없음"] })} style={{ width: '100%', marginBottom: '20px' }}>
                        <Plus size={16} /> 예외 사항 복구
                    </button>
                ) : (
                    <textarea
                        rows={3}
                        value={data.exceptions.join('\n')}
                        onChange={(e) => setData({ ...data, exceptions: e.target.value.split('\n') })}
                    />
                )}

                {/* Custom Sections (Flexible) */}
                <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <h3 style={{ margin: 0 }}>커스텀 섹션 추가</h3>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                                onClick={() => {
                                    const newSections = [...(data.custom_sections || []), { id: Date.now(), title: '새 텍스트 섹션', type: 'text', content: '' }];
                                    setData({ ...data, custom_sections: newSections });
                                }}
                                className="secondary-button"
                                style={{ padding: '4px 12px' }}
                            >
                                <Plus size={16} style={{ marginRight: '4px' }} /> 텍스트
                            </button>
                            <button
                                onClick={() => {
                                    const newSections = [...(data.custom_sections || []), { id: Date.now(), title: '새 표 섹션', type: 'table', content: [] }];
                                    setData({ ...data, custom_sections: newSections });
                                }}
                                className="secondary-button"
                                style={{ padding: '4px 12px' }}
                            >
                                <Plus size={16} style={{ marginRight: '4px' }} /> 표(Table)
                            </button>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        {(data.custom_sections || []).map((section, i) => (
                            <div key={section.id} style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <input
                                        value={section.title}
                                        onChange={(e) => {
                                            const newSections = [...data.custom_sections];
                                            newSections[i].title = e.target.value;
                                            setData({ ...data, custom_sections: newSections });
                                        }}
                                        style={{ background: 'transparent', border: 'none', borderBottom: '1px solid #60a5fa', borderRadius: 0, padding: '4px', fontSize: '16px', fontWeight: 'bold', color: '#60a5fa', width: '70%' }}
                                    />
                                    <button
                                        className="secondary-button"
                                        onClick={() => {
                                            const newSections = data.custom_sections.filter((_, idx) => idx !== i);
                                            setData({ ...data, custom_sections: newSections });
                                        }}
                                        style={{ border: '1px solid rgba(239, 68, 68, 0.2)' }}
                                    >
                                        <Trash2 size={16} color="#ef4444" />
                                    </button>
                                </div>

                                {section.type === 'text' ? (
                                    <textarea
                                        rows={3}
                                        value={section.content}
                                        onChange={(e) => {
                                            const newSections = [...data.custom_sections];
                                            newSections[i].content = e.target.value;
                                            setData({ ...data, custom_sections: newSections });
                                        }}
                                        placeholder="내용을 자유롭게 입력하세요..."
                                        style={{ width: '100%' }}
                                    />
                                ) : (
                                    <div>
                                        <button
                                            className="secondary-button"
                                            style={{ width: '100%', marginBottom: '8px', padding: '4px' }}
                                            onClick={() => {
                                                const newSections = [...data.custom_sections];
                                                newSections[i].content.push({ key: '', value: '' });
                                                setData({ ...data, custom_sections: newSections });
                                            }}
                                        >
                                            <Plus size={14} /> 행 추가
                                        </button>
                                        {section.content.map((row, RowIdx) => (
                                            <div key={RowIdx} className="table-row">
                                                <input
                                                    placeholder="항목"
                                                    value={row.key}
                                                    onChange={(e) => {
                                                        const newSections = [...data.custom_sections];
                                                        newSections[i].content[RowIdx].key = e.target.value;
                                                        setData({ ...data, custom_sections: newSections });
                                                    }}
                                                    style={{ flex: 1 }}
                                                />
                                                <input
                                                    placeholder="내용"
                                                    value={row.value}
                                                    onChange={(e) => {
                                                        const newSections = [...data.custom_sections];
                                                        newSections[i].content[RowIdx].value = e.target.value;
                                                        setData({ ...data, custom_sections: newSections });
                                                    }}
                                                    style={{ flex: 2 }}
                                                />
                                                <button
                                                    className="secondary-button"
                                                    onClick={() => {
                                                        const newSections = [...data.custom_sections];
                                                        newSections[i].content = newSections[i].content.filter((_, rI) => rI !== RowIdx);
                                                        setData({ ...data, custom_sections: newSections });
                                                    }}
                                                >
                                                    <Trash2 size={14} color="#ef4444" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{ marginTop: '32px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <button onClick={handleGenerate} style={{ padding: '16px', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center', boxShadow: '0 4px 14px 0 rgba(59, 130, 246, 0.39)' }}>
                        <Download size={22} /> 문서 자동 생성 및 저장 (All-in-One)
                    </button>

                    <button onClick={saveToSupabase} className="secondary-button" style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                        ☁️ Supabase Cloud 동기화
                    </button>
                </div>
            </div>

            <div className="glass-card">
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileJson size={24} color="#60a5fa" /> Data Preview (SSOT)
                </h2>
                <div className="preview-area">
                    <pre>{JSON.stringify(data, null, 2)}</pre>
                </div>

                <div style={{ marginTop: '20px', padding: '16px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', fontWeight: 600 }}>
                        <CheckCircle size={18} /> 자동화 준비 완료
                    </div>
                    <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', margin: '8px 0 0 0' }}>
                        내보낸 JSON 파일은 `main.py`를 통해 즉시 문서/엑셀로 변환 가능합니다.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default App;
