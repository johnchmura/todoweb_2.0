import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';
import './ProgressBar.css';

export default function ProgressBar() {
  const { user } = useAuth();
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [cumulXP, setCumulXP] = useState(0);
  const [neededXP, setNeededXP] = useState(100);
  const [level, setLevel] = useState(1);
  const [currentXP, setCurrentXP] = useState(0);
  const [previousLevel, setPreviousLevel] = useState(1);

  useEffect(() => {
    if (user) {
      const experiencePoints = user.experience_points || 0;
      setCurrentXP(experiencePoints);

      // Check if the user has enough XP to level up
      const newLevel = Math.floor(experiencePoints / 100) + 1;
      if (newLevel > level) {
        setCumulXP(neededXP);
        setLevel(newLevel);
        setNeededXP(neededXP * 2);
        setPreviousLevel(newLevel);
      }

      // Calculate the progress percentage
      const percentage = ((experiencePoints - cumulXP) / (neededXP - cumulXP)) * 100;
      setProgressPercentage(Math.max(0, Math.min(100, percentage)));
    }
  }, [user, neededXP, cumulXP]);

  return (
    <div className="progress-container">
      <div className="progress-bar-center-container">
        <div className="progress-bar-container">
          <div
            className="progress-bar"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>
      <span className="progress-text">
        {`Level ${level} (${currentXP} XP)`}
      </span>
    </div>
  );
}

