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
    const [apiKey, setApiKey] = useState(''); // User-provided API key for security

    const generateWithAI = async () => {
        if (!aiPrompt) return alert("AI에게 요청할 내용을 입력해주세요!");
        if (!apiKey) return alert("Gemini API Key를 입력해주세요! (구글 AI 스튜디오에서 무료 발급 가능)");

        setIsAiLoading(true);
        try {
            const systemPrompt = `You are a professional Game System Designer. 
            Provide a detailed game specification based on the user's request.
            Your response MUST be a single, valid JSON object following this EXACT schema:
            {
              "type": "system_design",
              "title": "Clear Title of the System",
              "summary": "Professional summary of how it works",
              "rules": {
                "max_level": number,
                "success_rate": [{"level": number, "rate": number (0 to 1)}]
              },
              "costs": {
                "gold": number[],
                "material": string[]
              },
              "exceptions": string[]
            }
            Output ONLY the JSON. No markdown backticks, no explanation.`;

            // Using v1 endpoint for better stability in some regions
            const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: `${systemPrompt}\n\nUser Request: ${aiPrompt}` }] }]
                })
            });

            const result = await response.json();

            if (result.error) {
                throw new Error(`${result.error.status}: ${result.error.message}`);
            }

            if (!result.candidates || result.candidates.length === 0) {
                throw new Error("AI가 응답을 생성하지 못했습니다. (내용 필터링이나 API 할당량 문제일 수 있습니다.)");
            }

            const textResponse = result.candidates[0].content.parts[0].text;

            // Clean response (remove code block markers if any)
            const cleanedJson = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
            const aiData = JSON.parse(cleanedJson);

            setData(aiData);
            alert("✨ AI가 기획서 초안 생성을 완료했습니다!");
        } catch (err) {
            console.error(err);
            alert(`AI 연동 에러: ${err.message}\n\n키가 정확한지, 혹은 '비활성화된 모델'인지 확인해주세요.`);
        } finally {
            setIsAiLoading(false);
        }
    };

    const handleExport = async () => {
        // ... (existing code for export)
    };

    const saveToSupabase = async () => {
        alert("Supabase integration is configured but requires an anon key/table to function.");
    };

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
            <div className="glass-card">
                <h1>Spec-Auto Editor <span style={{ fontSize: '14px', color: '#60a5fa', verticalAlign: 'middle' }}>v3.0 AI</span></h1>

                {/* AI Assistant Section */}
                <div style={{ background: 'rgba(96, 165, 250, 0.1)', padding: '16px', borderRadius: '12px', marginBottom: '24px', border: '1px solid rgba(96, 165, 250, 0.2)' }}>
                    <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#60a5fa' }}>🤖 AI 기획 비서 (Beta)</h3>
                    <input
                        type="password"
                        placeholder="Gemini API Key 입력 (저장되지 않음)"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        style={{ marginBottom: '8px', fontSize: '12px' }}
                    />
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <input
                            value={aiPrompt}
                            onChange={(e) => setAiPrompt(e.target.value)}
                            placeholder="예: 초보자도 이해하기 쉬운 자동 사냥 시스템 기획해줘"
                            style={{ flex: 1 }}
                        />
                        <button
                            onClick={generateWithAI}
                            disabled={isAiLoading}
                            style={{ background: isAiLoading ? '#666' : '#60a5fa', width: 'auto', padding: '0 16px' }}
                        >
                            {isAiLoading ? '생성 중...' : '기획 생성'}
                        </button>
                    </div>
                    <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '8px' }}>
                        * Gemini API를 통해 전문적인 기획 테이블을 자동으로 구성합니다.
                    </p>
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

                <h3>규칙 설정</h3>
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

                <div style={{ marginTop: '32px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <button onClick={handleExport} style={{ padding: '16px', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center', boxShadow: '0 4px 14px 0 rgba(59, 130, 246, 0.39)' }}>
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
