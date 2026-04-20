import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface TypewriterTextProps {
  phrases: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseDuration?: number;
  className?: string;
}

export function TypewriterText({
  phrases,
  typingSpeed = 100,
  deletingSpeed = 50,
  pauseDuration = 2000,
  className = "",
}: TypewriterTextProps) {
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

   
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    const currentPhrase = phrases[currentPhraseIndex];

    if (isDeleting) {
      if (currentText.length === 0) {
        setIsDeleting(false);
        setCurrentPhraseIndex((prev) => (prev + 1) % phrases.length);
      } else {
        timeout = setTimeout(() => {
          setCurrentText(currentPhrase.substring(0, currentText.length - 1));
        }, deletingSpeed);
      }
    } else {
      if (currentText.length === currentPhrase.length) {
        timeout = setTimeout(() => {
          setIsDeleting(true);
        }, pauseDuration);
      } else {
        timeout = setTimeout(() => {
          setCurrentText(currentPhrase.substring(0, currentText.length + 1));
        }, typingSpeed);
      }
    }

    return () => clearTimeout(timeout);
  }, [currentText, isDeleting, currentPhraseIndex, phrases, typingSpeed, deletingSpeed, pauseDuration]);

  return (
    <span className={`inline-flex items-center ${className}`}>
      {currentText}
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ repeat: Infinity, duration: 0.8 }}
        className="inline-block w-[3px] h-[1.1em] bg-current ml-[2px] mb-[-2px]"
      />
    </span>
  );
}
