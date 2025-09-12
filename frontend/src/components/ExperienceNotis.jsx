import React, { useEffect, useState } from 'react';
import './ExperienceNotis.css';

function ExperienceNotis({ x, y, points }) {
  const [visible, setVisible] = useState(true);
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, 2000);

    const fadeTimer = setTimeout(() => {
      setOpacity(0);
    }, 1500);

    return () => {
      clearTimeout(timer);
      clearTimeout(fadeTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className="experience-notification"
      style={{
        left: x - 30,
        top: y - 20,
        opacity: opacity,
        transform: `translateY(${opacity === 1 ? 0 : -20}px)`,
        transition: 'all 0.5s ease-out'
      }}
    >
      +{points} XP
    </div>
  );
}

export default ExperienceNotis;

