interface Props {
  value: string;
  onChange: (v: string) => void;
  language: string;
  rows?: number;
}

export default function CodeInput({ value, onChange, language, rows = 16 }: Props) {
  return (
    <div className="overflow-hidden rounded-xl border border-white/10">
      <div className="flex items-center justify-between border-b border-white/10 bg-surface-elevated px-4 py-2">
        <span className="font-mono text-xs text-purple-400">{language}</span>
        <span className="text-xs text-slate-500">{value.split("\n").length} lines</span>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        spellCheck={false}
        className="w-full resize-y bg-[#0a0e14] p-4 font-mono text-sm text-slate-200 outline-none"
        placeholder="// Paste your source code here for static analysis..."
      />
    </div>
  );
}
