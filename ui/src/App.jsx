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

    const handleExport = async () => {
        // 1. Browser JSON Download (Backup)
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${data.title.replace(/\s/g, '_')}_data.json`;
        a.click();
        URL.revokeObjectURL(url);

        // 2. Attempt Local Generation (EXE Mode)
        try {
            const response = await fetch('http://127.0.0.1:5000/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const result = await response.json();
            if (result.status === 'success') {
                alert("🚀 로컬 문서 생성이 완료되었습니다!\nWord, Excel, Markdown 파일이 생성된 폴더가 열립니다.");
            }
        } catch (err) {
            console.log("Web mode: Local server not detected.");
            alert("JSON 파일이 다운로드되었습니다. (웹 버전에서는 로컬 문서 자동 생성이 제한됩니다.)");
        }
    };

    const saveToSupabase = async () => {
        alert("Supabase integration is configured but requires an anon key/table to function.");
    };

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
            <div className="glass-card">
                <h1>Spec-Auto Editor <span style={{ fontSize: '14px', color: '#60a5fa', verticalAlign: 'middle' }}>v2.0</span></h1>

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
