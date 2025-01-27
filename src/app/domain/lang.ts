export const MemoryRows = 16;
export const MemoryCols = 8;
export const MemorySize = MemoryRows * MemoryCols;
const InitPointer = MemoryCols * 8;
export const ProgramSize = MemorySize - InitPointer;

export class MemoryByte {
    private value: number;
    private emo: string;

    constructor() {
        this.value = 0;
        this.emo = '';
    }

    getVal(): number {
        return this.value;
    }
    getEmo(): string {
        return this.emo;
    }
    setVal(val: number): void {
        this.value = val;
    }
    setEmo(emo: string): void {
        this.emo = emo;
    }

    assign(b: MemoryByte) {
        this.value = b.getVal();
        this.emo = b.getEmo();
    }

    isMovable(): boolean {
        return this.emo === '😭';
    }

    isBlock(): boolean {
        return this.emo === '🧱' || this.emo === '😭';
    }
}

class Memory {
    private memory: MemoryByte[];

    constructor() {
        this.memory = Array(MemorySize).fill(0).map(() => new MemoryByte());
    }

    get(index: number): MemoryByte {
        if (index < 0 || index >= MemorySize) {
            throw new Error('Memory index out of bounds');
        }
        return this.memory[index];
    }

    at(row: number, col: number): MemoryByte {
        return this.get(row * MemoryCols + col);
    }

    length(): number {
        return this.memory.length;
    }

    copy(): MemoryByte[] {
        return this.memory.map(b => {
            const copy = new MemoryByte();
            copy.assign(b);
            return copy;
        });
    }
}


export class Language {
    private memory: Memory;
    private pointer: number;

    constructor() {
        this.memory = new Memory();
        this.pointer = InitPointer;
    }

    init(programText: string, memory: MemoryByte[]) {
        if (memory.length > MemorySize) {
            throw new Error('Memory size exceeded');
        }
        memory.forEach((b, index) => {
            const m = this.memory.get(index);
            m.setEmo(b.getEmo());
            m.setVal(b.getVal());
        });
        for (let i = InitPointer; i < MemorySize; i++) {
            this.memory.get(i).setEmo('');
            this.memory.get(i).setVal(0);
        }
        const segmenter = new Intl.Segmenter("ja", { granularity: "grapheme" });
        const ops = [...segmenter.segment(programText)];
        if (ops.length > ProgramSize) {
            throw new Error('Program size exceeded');  
        }
        ops.forEach((op, index) => {
            this.memory.get(index + InitPointer).setEmo(op.segment);
        })
        this.pointer = InitPointer;
    }

    step() {
        if (this.pointer >= this.memory.length()) {
            return;
        }
        const op = this.memory.get(this.pointer).getEmo();
        this.pointer++;
        switch (op) {
            case '👈️':
                this.opMove(-1);
                break;
            case '👇️':
                this.opMove(MemoryCols);
                break;
            case '👆️':
                this.opMove(-MemoryCols);
                break;
            case '👉️':
                this.opMove(1);
                break;
        }
    }

    opMove(delta: number) {
        if (delta > 0) {
            for (let i = MemorySize - 1; i >= 0; i--) {
                const b = this.memory.get(i);
                if (b.isMovable()) {
                    const next = this.memory.get(i + delta);
                    if (next.isBlock()) {
                        continue;
                    }
                    next.setEmo(b.getEmo());
                    b.setEmo('');
                }
            }
        } else {
            for (let i = 0; i < MemorySize; i++) {
                const b = this.memory.get(i);
                if (b.isMovable()) {
                    const next = this.memory.get(i + delta);
                    if (next.isBlock()) {
                        continue;
                    }
                    next.setEmo(b.getEmo());
                    b.setEmo('');
                }
            }
        }
    }

    copyMemory(): MemoryByte[] {
        return this.memory.copy();
    }

    getPointer(): number {
        return this.pointer;
    }
}
