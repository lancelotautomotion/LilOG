/* Typewriter — faithful port of the provided typewriter.tsx logic to
   browser React (framer-motion cursor replaced by a CSS blink). Same props:
   text (string|string[]), speed, initialDelay, waitTime, deleteSpeed, loop,
   showCursor, hideCursorOnType, cursorChar, className, cursorClassName. */
(function () {
  const { useEffect, useState } = React;

  function Typewriter({
    text,
    speed = 50,
    initialDelay = 0,
    waitTime = 2000,
    deleteSpeed = 30,
    loop = true,
    className = "",
    showCursor = true,
    hideCursorOnType = false,
    cursorChar = "|",
    cursorClassName = "cursor",
  }) {
    const [displayText, setDisplayText] = useState("");
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);
    const [currentTextIndex, setCurrentTextIndex] = useState(0);

    const texts = Array.isArray(text) ? text : [text];

    useEffect(() => {
      let timeout;
      const currentText = texts[currentTextIndex];

      const startTyping = () => {
        if (isDeleting) {
          if (displayText === "") {
            setIsDeleting(false);
            if (currentTextIndex === texts.length - 1 && !loop) return;
            setCurrentTextIndex((prev) => (prev + 1) % texts.length);
            setCurrentIndex(0);
            timeout = setTimeout(() => {}, waitTime);
          } else {
            timeout = setTimeout(() => {
              setDisplayText((prev) => prev.slice(0, -1));
            }, deleteSpeed);
          }
        } else {
          if (currentIndex < currentText.length) {
            timeout = setTimeout(() => {
              setDisplayText((prev) => prev + currentText[currentIndex]);
              setCurrentIndex((prev) => prev + 1);
            }, speed);
          } else if (texts.length > 1) {
            timeout = setTimeout(() => {
              setIsDeleting(true);
            }, waitTime);
          }
        }
      };

      if (currentIndex === 0 && !isDeleting && displayText === "") {
        timeout = setTimeout(startTyping, initialDelay);
      } else {
        startTyping();
      }

      return () => clearTimeout(timeout);
      // eslint-disable-next-line
    }, [currentIndex, displayText, isDeleting, speed, deleteSpeed, waitTime, currentTextIndex, loop]);

    const typing =
      currentIndex < texts[currentTextIndex].length || isDeleting;

    return (
      <span className={"typewriter " + className}>
        <span>{displayText}</span>
        {showCursor && (
          <span
            className={
              cursorClassName +
              (hideCursorOnType && typing ? " hidden" : "")
            }
          >
            {cursorChar}
          </span>
        )}
      </span>
    );
  }

  window.Typewriter = Typewriter;
})();
