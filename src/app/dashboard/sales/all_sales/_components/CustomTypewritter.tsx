import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

const TextAnimation = ({
  start = false,
  messages,
}: {
  start?: boolean;
  messages: any;
}) => {
  const [text, setText] = useState("");
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (start) {
      const interval = setInterval(() => {
        handleNext();
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [index]);

  useEffect(() => {
    setText(messages[0]);
  }, []);

  const handleNext = () => {
    setIndex((prev) => (prev + 1) % messages.length);
    setText(messages[(index + 1) % messages.length]);
  };

  return (
    <div>
      <AnimatePresence mode="wait">
        <motion.div
          key={text}
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {text}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default TextAnimation;
