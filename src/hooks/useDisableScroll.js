import { useEffect, useRef } from "react";

export const useDisableScroll = (isActive) => {
  const scrollYRef = useRef(0);

  useEffect(() => {
    if (isActive) {
      scrollYRef.current = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollYRef.current}px`;
      document.body.style.width = "100%";
    } else {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      window.scrollTo(0, scrollYRef.current);
    }
  }, [isActive]);
};
