import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const PageTransitionEffect = ({ targetPath }) => {
  const [showAnimation, setShowAnimation] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setShowAnimation(true);

    // Delay chuyển trang sau 2s (thời gian animation)
    const timer = setTimeout(() => {
      setShowAnimation(false);
      if (targetPath) {
        navigate(targetPath); // Điều hướng sau khi animation hoàn thành
      }
    }, 2000); // Delay 2 giây

    return () => clearTimeout(timer); // Cleanup
  }, [targetPath, navigate]);

  return showAnimation ? <div className="flowAnimation"></div> : null;
};

export default PageTransitionEffect;
