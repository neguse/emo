'use client';

import { useState, useRef, useEffect } from "react";
import { MemoryRows, MemoryCols, Language, MemoryByte } from "./domain/lang";


const keys : string[] = [
    '👈️',
    '👇️',
    '👆️',
    '👉️',
    '←',
];

function Memory({memory, pointer}: {memory: MemoryByte[], pointer: number}) {
    const rows = [];

    // header
    const header = [];
    header.push(
        <th key={-1}>
            {' '}
        </th>
    );
    for (let col = 0; col < MemoryCols; col++) {
        header.push(
            <th key={col}>
                {col}
            </th>
        );
    }

    for (let row = 0; row < MemoryRows; row++) {
        const cols = [];
        cols.push(
            <td key={-1} className="cell">
                {row}
            </td>
        );
        for (let col = 0; col < MemoryCols; col++) {
            const index = row * MemoryCols + col;
            if (index >= memory.length) {
                break;
            }
            const isPointer = index === pointer;
            cols.push(
                <td key={col} className={isPointer ? "cell pointer" : "cell"}>
                    {memory[index].getEmo()}
                </td>
            );
        }
        rows.push(
            <tr key={row}>
                {cols}
            </tr>);
    }
    return (
        <table className="memory">
            <thead>
                <tr>
                    {header}
                </tr>
            </thead>
            <tbody>
                {rows}
            </tbody>
        </table>
    );
}

function Program({text, onChange, canEdit}: {text: string, onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void, canEdit: boolean}) {
    return (
        <textarea className="program" value={text} onChange={onChange} readOnly={!canEdit}>
        </textarea>
    );
}

function Keyboard({onKey, canPress}: { onKey: (key: string) => void, canPress: boolean }) {
    return (
            <div className='keyboard'>
                {keys.map((key) => (
                    <button className='key' key={key} onClick={() => onKey(key)} disabled={!canPress}>
                        {key}
                    </button>
                ))}
            </div>
    );
};

function Debug({onReset, onStep}: {onReset: () => void, onStep: () => void}) {
    return (
        <div className='debug'>
            <button className='reset' onClick={onReset}>
            ⏹️
            </button>
            <button className='step' onClick={onStep}>
            ▶️
            </button>
        </div>
    );
}

function initMemory() : MemoryByte[] {
    const emos = [
        '🧱', '🧱', '🧱', '🧱', '🧱', '🧱', '🧱', '🧱',
        '🧱', '', '', '', '', '😭', '', '🧱',
        '🧱', '', '', '', '', '', '', '🧱',
        '🧱', '', '', '', '', '', '', '🧱',
        '🧱', '', '', '', '', '', '', '🧱',
        '🧱', '', '', '', '', '😭', '', '🧱',
        '🧱', '', '', '', '', '', '', '🧱',
        '🧱', '🧱', '🧱', '🧱', '🧱', '🧱', '🧱', '🧱',
    ];
    return emos.map((emo) => {
        const b = new MemoryByte();
        b.setEmo(emo);
        return b;
    });
}

export default function Editor() {
    const [memory, setMemory] = useState<MemoryByte[]>([]);
    const [pointer, setPointer] = useState(0);
    const [text, setText] = useState<string>('');
    const [playing, setPlaying] = useState(false);
    const lang = useRef(new Language());

    function onKey(key: string) {
        if (key === '←') {
            setText(text.slice(0, -1));
            return;
        }
        setText(text + key);
    }
    function initLang() {
        lang.current.init(text, initMemory());
        setMemory(lang.current.copyMemory());
        setPointer(lang.current.getPointer());
    }
    function onReset() {
        initLang();
        setPlaying(false);
    }
    function onStep() {
        setPlaying(true);
        lang.current.step();
        setMemory(lang.current.copyMemory());
        setPointer(lang.current.getPointer());
    }
    useEffect(() => {
        onReset();
    }, [lang]);
    useEffect(() => {
        if (!playing) {
            lang.current.init(text, initMemory());
            setMemory(lang.current.copyMemory());
            setPointer(lang.current.getPointer());
        }
    }, [playing, text, lang]);
    
    return (
        <div>
            <Memory memory={memory} pointer={pointer} />
            <Program text={text} onChange={(e) => setText(e.target.value)} canEdit={!playing} />
            <Keyboard onKey={onKey} canPress={!playing} />
            <Debug onReset={onReset} onStep={onStep} />
        </div>
    );
}