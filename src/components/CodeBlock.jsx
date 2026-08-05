import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

export default function CodeBlock({ code, language }) {
  return (
    <SyntaxHighlighter
      language={language === 'text' ? undefined : language}
      style={vscDarkPlus}
      customStyle={{ margin: 0, padding: '1rem', fontSize: '0.8rem', background: '#0a0e17' }}
      wrapLongLines
    >
      {code}
    </SyntaxHighlighter>
  );
}
