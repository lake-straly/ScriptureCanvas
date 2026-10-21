import type { CanvasNode, Connection, ScriptureNodeData, StickyNoteData, LexiconNodeData, PromptNodeData } from '../types';

export function generateStudyMarkdown(
  roomTitle: string,
  nodes: Record<string, CanvasNode>,
  connections: Connection[]
): string {
  const dateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const scriptureNodes = Object.values(nodes).filter((n): n is ScriptureNodeData => n.type === 'scripture');
  const stickyNodes = Object.values(nodes).filter((n): n is StickyNoteData => n.type === 'sticky');
  const lexiconNodes = Object.values(nodes).filter((n): n is LexiconNodeData => n.type === 'lexicon');
  const promptNodes = Object.values(nodes).filter((n): n is PromptNodeData => n.type === 'prompt');

  let md = `# 📖 ${roomTitle}\n`;
  md += `*Visual Scripture Study Session • Exported on ${dateStr} via ScriptureCanvas*\n\n`;
  md += `---\n\n`;

  // 1. Biblical Passages
  if (scriptureNodes.length > 0) {
    md += `## 📜 Scripture Passages\n\n`;
    for (const s of scriptureNodes) {
      const { passage, highlights } = s;
      md += `### ${passage.reference} (${passage.translation})\n\n`;

      if (passage.historicalContext) {
        md += `> **Historical & Cultural Context:** ${passage.historicalContext}\n\n`;
      }

      if (passage.keyThemes && passage.keyThemes.length > 0) {
        md += `*Key Themes:* ${passage.keyThemes.map((t) => `\`#${t}\``).join(' ')}\n\n`;
      }

      md += `#### Scripture Text\n\n`;
      for (const v of passage.verses) {
        const verseHighlights = highlights[v.verseNum] || [];
        const hasHighlights = verseHighlights.length > 0;
        
        md += `**[v.${v.verseNum}]** ${v.text}\n\n`;

        if (hasHighlights) {
          for (const h of verseHighlights) {
            const tagStr = h.tag ? `[${h.tag}] ` : '';
            const noteStr = h.note ? ` — *Note:* ${h.note}` : '';
            md += `  - 🖍️ ${tagStr}*Highlighted in ${h.color} by ${h.author}*${noteStr}\n`;
          }
          md += `\n`;
        }
      }
      md += `---\n\n`;
    }
  }

  // 2. Lexicon & Word Studies
  if (lexiconNodes.length > 0) {
    md += `## 🔍 Original Language Word Studies\n\n`;
    for (const l of lexiconNodes) {
      const e = l.entry;
      md += `### ${e.original} (${e.transliteration}) — Strong’s ${e.strongs}\n`;
      md += `- **Language:** ${e.language} (${e.partOfSpeech})\n`;
      md += `- **Definition:** ${e.definition}\n`;
      md += `- **Short Gloss:** ${e.shortDef}\n`;
      if (e.theologicalNote) {
        md += `- **Theological Insight:** ${e.theologicalNote}\n`;
      }
      md += `\n`;
    }
    md += `---\n\n`;
  }

  // 3. Study Notes & Observations
  if (stickyNodes.length > 0) {
    md += `## 📝 Study Notes & Reflections\n\n`;
    for (const n of stickyNodes) {
      const categoryTag = n.category ? `\`${n.category}\`` : '`Note`';
      const refTag = n.targetVerseRef ? ` (*re: ${n.targetVerseRef}*)` : '';
      md += `### ${categoryTag} by ${n.author}${refTag}\n`;
      md += `${n.content}\n\n`;
    }
    md += `---\n\n`;
  }

  // 4. Socratic Q&A Prompts
  if (promptNodes.length > 0) {
    md += `## 💡 Socratic Inquiries & Group Answers\n\n`;
    for (const p of promptNodes) {
      md += `### [${p.category}] ${p.question}\n`;
      if (p.contextHint) {
        md += `*Prompt Hint:* ${p.contextHint}\n\n`;
      }
      if (p.answers.length > 0) {
        md += `**Responses:**\n`;
        for (const a of p.answers) {
          md += `- **${a.author}** (*${a.timestamp}*): ${a.text}\n`;
        }
      } else {
        md += `*No answers recorded yet.*\n`;
      }
      md += `\n`;
    }
    md += `---\n\n`;
  }

  // 5. Hyperlink Graph Connections
  if (connections.length > 0) {
    md += `## 🔗 Theological Connections & Hyperlinks\n\n`;
    for (const c of connections) {
      const source = nodes[c.sourceNodeId];
      const target = nodes[c.targetNodeId];
      const sourceName = source ? (source.type === 'scripture' ? source.passage.reference : source.type) : 'Node';
      const targetName = target ? (target.type === 'scripture' ? target.passage.reference : target.type) : 'Node';
      const typeLabel = c.type.replace(/_/g, ' ');

      md += `- **${sourceName}** ➔ **${targetName}** (${typeLabel})\n`;
      if (c.label) md += `  - *Relation:* ${c.label}\n`;
      if (c.description) md += `  - *Details:* ${c.description}\n`;
    }
    md += `\n`;
  }

  md += `\n*End of study guide. Built with ScriptureCanvas.*`;
  return md;
}

export function downloadStudyMarkdown(roomTitle: string, markdown: string): void {
  const filename = `${roomTitle.toLowerCase().replace(/[^a-z0-9_-]/g, '_')}_study.md`;
  const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
