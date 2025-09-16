import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './Achievements.css';

const ACHIEVEMENTS = [
  {
    id: 'first_task',
    title: 'First Steps',
    description: 'Complete your first task',
    icon: '🌟',
    xpReward: 50,
    condition: (stats) => stats.tasksCompleted >= 1,
    unlocked: false
  },
  {
    id: 'task_master',
    title: 'Task Master',
    description: 'Complete 10 tasks',
    icon: '⚡',
    xpReward: 100,
    condition: (stats) => stats.tasksCompleted >= 10,
    unlocked: false
  },
  {
    id: 'speed_demon',
    title: 'Speed Demon',
    description: 'Complete 5 tasks in one day',
    icon: '🚀',
    xpReward: 150,
    condition: (stats) => stats.tasksToday >= 5,
    unlocked: false
  },
  {
    id: 'streak_master',
    title: 'Streak Master',
    description: 'Complete tasks for 7 consecutive days',
    icon: '🔥',
    xpReward: 200,
    condition: (stats) => stats.streakDays >= 7,
    unlocked: false
  },
  {
    id: 'level_5',
    title: 'Rising Star',
    description: 'Reach level 5',
    icon: '⭐',
    xpReward: 300,
    condition: (stats) => stats.level >= 5,
    unlocked: false
  },
  {
    id: 'level_10',
    title: 'Galaxy Explorer',
    description: 'Reach level 10',
    icon: '🌌',
    xpReward: 500,
    condition: (stats) => stats.level >= 10,
    unlocked: false
  },
  {
    id: 'mini_task_expert',
    title: 'Detail Oriented',
    description: 'Complete 25 mini-tasks',
    icon: '🎯',
    xpReward: 100,
    condition: (stats) => stats.miniTasksCompleted >= 25,
    unlocked: false
  },
  {
    id: 'calendar_enthusiast',
    title: 'Calendar Enthusiast',
    description: 'Add notes to 10 different days',
    icon: '📅',
    xpReward: 150,
    condition: (stats) => stats.calendarNotes >= 10,
    unlocked: false
  }
];

export default function Achievements() {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState(ACHIEVEMENTS);
  const [showModal, setShowModal] = useState(false);
  const [newAchievement, setNewAchievement] = useState(null);
  const [stats, setStats] = useState({
    tasksCompleted: 0,
    tasksToday: 0,
    streakDays: 0,
    level: 1,
    miniTasksCompleted: 0,
    calendarNotes: 0
  });

  useEffect(() => {
    if (user) {
      // Calculate user stats
      const userStats = {
        tasksCompleted: user.total_tasks_completed || 0,
        tasksToday: user.tasks_today || 0,
        streakDays: user.streak_days || 0,
        level: Math.floor((user.experience_points || 0) / 100) + 1,
        miniTasksCompleted: user.mini_tasks_completed || 0,
        calendarNotes: user.calendar_notes_count || 0
      };
      setStats(userStats);

      // Check for new achievements
      checkAchievements(userStats);
    }
  }, [user]);

  const checkAchievements = (userStats) => {
    const updatedAchievements = achievements.map(achievement => {
      const isUnlocked = achievement.condition(userStats);
      const wasUnlocked = achievement.unlocked;
      
      if (isUnlocked && !wasUnlocked) {
        // New achievement unlocked!
        setNewAchievement(achievement);
        setShowModal(true);
        
        // Add XP reward
        if (user) {
          // This would typically call an API to update user XP
          console.log(`Achievement unlocked: ${achievement.title}! +${achievement.xpReward} XP`);
        }
      }
      
      return { ...achievement, unlocked: isUnlocked };
    });
    
    setAchievements(updatedAchievements);
  };

  const closeModal = () => {
    setShowModal(false);
    setNewAchievement(null);
  };

  const unlockedAchievements = achievements.filter(a => a.unlocked);
  const lockedAchievements = achievements.filter(a => !a.unlocked);

  return (
    <div className="achievements-container">
      <h2>Achievements</h2>
      
      <div className="achievements-stats">
        <div className="stat-item">
          <span className="stat-number">{unlockedAchievements.length}</span>
          <span className="stat-label">Unlocked</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{achievements.length}</span>
          <span className="stat-label">Total</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{Math.round((unlockedAchievements.length / achievements.length) * 100)}%</span>
          <span className="stat-label">Progress</span>
        </div>
      </div>

      <div className="achievements-grid">
        {achievements.map(achievement => (
          <div 
            key={achievement.id} 
            className={`achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}`}
          >
            <div className="achievement-icon">
              {achievement.unlocked ? achievement.icon : '🔒'}
            </div>
            <div className="achievement-content">
              <h3 className="achievement-title">{achievement.title}</h3>
              <p className="achievement-description">{achievement.description}</p>
              <div className="achievement-reward">
                +{achievement.xpReward} XP
              </div>
            </div>
            {achievement.unlocked && (
              <div className="achievement-badge">✓</div>
            )}
          </div>
        ))}
      </div>

      {/* Achievement Unlocked Modal */}
      {showModal && newAchievement && (
        <div className="achievement-modal-overlay" onClick={closeModal}>
          <div className="achievement-modal" onClick={e => e.stopPropagation()}>
            <div className="achievement-modal-content">
              <div className="achievement-modal-icon">
                {newAchievement.icon}
              </div>
              <h2>Achievement Unlocked!</h2>
              <h3>{newAchievement.title}</h3>
              <p>{newAchievement.description}</p>
              <div className="achievement-modal-reward">
                +{newAchievement.xpReward} XP
              </div>
              <button className="achievement-modal-button" onClick={closeModal}>
                Awesome!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
