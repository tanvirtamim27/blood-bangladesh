import type { ReactNode } from "react";

export default function RichText({ text }: { text: string }) {
  const lines = text.split(/\r?\n/);
  const out: ReactNode[] = [];
  let list: string[] = [];

  const flush = (key: number) => {
    if (list.length) {
      const items = list;
      out.push(
        <ul key={`ul-${key}`} className="list-disc space-y-1 pl-6">
          {items.map((x, i) => (
            <li key={i}>{x}</li>
          ))}
        </ul>,
      );
      list = [];
    }
  };

  lines.forEach((raw, i) => {
    const line = raw.trim();
    if (line.startsWith("- ")) {
      list.push(line.slice(2));
      return;
    }
    flush(i);
    if (!line) return;
    if (line.endsWith(":")) {
      out.push(
        <h3 key={i} className="pt-2 text-lg font-semibold text-red-600">
          {line}
        </h3>,
      );
    } else {
      out.push(<p key={i}>{line}</p>);
    }
  });
  flush(lines.length);

  return <div className="space-y-3 leading-relaxed">{out}</div>;
}