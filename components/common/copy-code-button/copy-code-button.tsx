'use client';

import { IconCheck, IconCopy } from '@tabler/icons-react';
import { useCallback, useState } from 'react';

import styles from './copy-code-button.module.css';

type CopyCodeButtonProps = {
  code: string;
};

export function CopyCodeButton({ code }: CopyCodeButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }, [code]);

  return (
    <button
      className={styles.copyBtn}
      type="button"
      onClick={handleCopy}
      aria-label="Copy code"
    >
      {copied ? <IconCheck size={13} /> : <IconCopy size={13} />}
    </button>
  );
}
