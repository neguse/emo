import { MemoryByte, Language, MemorySize, ProgramSize } from './lang';

describe('MemoryByte', () => {
    it('should initialize with default values', () => {
        const byte = new MemoryByte();
        expect(byte.getVal()).toBe(0);
        expect(byte.getEmo()).toBe('');
    });

    it('should set and get values correctly', () => {
        const byte = new MemoryByte();
        byte.setVal(42);
        byte.setEmo('😊');
        expect(byte.getVal()).toBe(42);
        expect(byte.getEmo()).toBe('😊');
    });

    it('should assign values from another MemoryByte', () => {
        const byte1 = new MemoryByte();
        byte1.setVal(42);
        byte1.setEmo('😊');
        const byte2 = new MemoryByte();
        byte2.assign(byte1);
        expect(byte2.getVal()).toBe(42);
        expect(byte2.getEmo()).toBe('😊');
    });

    it('should correctly identify movable and block states', () => {
        const byte = new MemoryByte();
        expect(byte.isMovable()).toBe(false);
        expect(byte.isBlock()).toBe(false);
        byte.setEmo('😭');
        expect(byte.isMovable()).toBe(true);
        expect(byte.isBlock()).toBe(true);
        byte.setEmo('🧱');
        expect(byte.isMovable()).toBe(false);
        expect(byte.isBlock()).toBe(true);
    });
});

describe('Language', () => {
    it('should initialize with default values', () => {
        const lang = new Language();
        expect(lang.getPointer()).toBe(MemorySize - ProgramSize);
        expect(lang.copyMemory().length).toBe(MemorySize);
    });

    it('should throw error if program size exceeds limit', () => {
        const lang = new Language();
        const programText = '👈️'.repeat(ProgramSize + 1);
        expect(() => lang.init(programText, [])).toThrow('Program size exceeded');
    });

    it('should throw error if memory size exceeds limit', () => {
        const lang = new Language();
        const memory = Array(MemorySize + 1).fill(new MemoryByte());
        expect(() => lang.init('', memory)).toThrow('Memory size exceeded');
    });

    it('should initialize memory and program correctly', () => {
        const lang = new Language();
        const programText = '👈️👇️';
        const memory = Array(MemorySize).fill(0).map(() => new MemoryByte());
        memory[0].setEmo('😊');
        memory[0].setVal(42);
        lang.init(programText, memory);
        expect(lang.copyMemory()[0].getEmo()).toBe('😊');
        expect(lang.copyMemory()[0].getVal()).toBe(42);
        expect(lang.copyMemory()[MemorySize - ProgramSize].getEmo()).toBe('👈️');
        expect(lang.copyMemory()[MemorySize - ProgramSize + 1].getEmo()).toBe('👇️');
    });

    it('should execute step correctly', () => {
        const lang = new Language();
        const programText = '👈️👇️';
        lang.init(programText, []);
        lang.step();
        expect(lang.getPointer()).toBe(MemorySize - ProgramSize + 1);
        lang.step();
        expect(lang.getPointer()).toBe(MemorySize - ProgramSize + 2);
    });

    it('should move memory bytes correctly', () => {
        const lang = new Language();
        const memory = Array(MemorySize).fill(0).map(() => new MemoryByte());
        memory[0].setEmo('😭');
        lang.init('', memory);
        lang.opMove(1);
        expect(lang.copyMemory()[1].getEmo()).toBe('😭');
        expect(lang.copyMemory()[0].getEmo()).toBe('');
    });
});