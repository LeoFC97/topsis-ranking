import { useMemo } from 'react';
import katex from 'katex';
import styles from './MathFormula.module.css';

interface MathFormulaProps {
  latex: string;
  block?: boolean;
  className?: string;
}

export function MathFormula({ latex, block = true, className = '' }: MathFormulaProps) {
  const html = useMemo(
    () =>
      katex.renderToString(latex, {
        throwOnError: false,
        displayMode: block,
      }),
    [latex, block]
  );

  return (
    <div
      className={`${styles.formula} ${block ? styles.block : styles.inline} ${className}`.trim()}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
