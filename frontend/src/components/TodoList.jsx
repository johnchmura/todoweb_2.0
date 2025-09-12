import React, { useRef, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { tasksAPI, userAPI } from '../services/api';
import ExperienceNotis from './ExperienceNotis';
import './TodoList.css';

function TodoList() {
  const { user } = useAuth();
  const canvasRef = useRef(null);
  const circlesRef = useRef([]);
  const [label, setLabel] = useState('');
  const [circleFlag, setCircleFlag] = useState(false);
  const [xpNotifications, setXpNotifications] = useState([]);
  const [tasks, setTasks] = useState([]);

  // Play pop sound
  const playPopSound = () => {
    try {
      // Use the pop sound from the public folder (served by Vite)
      const audio = new Audio('/pop.mp3');
      audio.volume = 0.5; // Medium volume for task completion
      audio.preload = 'auto';
      
      // Play the sound
      const playPromise = audio.play();
      
      if (playPromise !== undefined) {
        playPromise.then(() => {
          console.log('Pop sound played successfully!');
        }).catch(error => {
          console.log('Could not play pop sound:', error);
          // Try to play again with user interaction
          document.addEventListener('click', () => {
            audio.play().catch(e => console.log('Still cannot play:', e));
          }, { once: true });
        });
      }
    } catch (error) {
      console.log('Error creating audio:', error);
    }
  };

  // Load tasks from API
  useEffect(() => {
    if (user) {
      loadTasks();
    }
  }, [user]);

  const loadTasks = async () => {
    try {
      const response = await tasksAPI.getTasks();
      setTasks(response.data);
      // Convert tasks to circles
      circlesRef.current = response.data.map(task => createCircleFromTask(task));
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  };

  const createCircleFromTask = (task) => {
    return new MovingCircle(
      task.x,
      task.y,
      50,
      task.color,
      Math.random(),
      Math.random(),
      task.label,
      'white',
      task.id
    );
  };

  const updateExperiencePoints = async (points) => {
    if (user) {
      try {
        await userAPI.updateExperience(points);
      } catch (error) {
        console.error('Error updating experience:', error);
      }
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    const aspectRatio = 16 / 9;

    function resizeCanvas() {
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;
      const canvasWidth = Math.min(screenWidth - 40, 1200);
      const canvasHeight = Math.min(screenHeight - 200, 1000);

      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationId = null;

    // Galaxy structure - defined once outside the function
    let galaxyStructure = null;

    function initializeGalaxyStructure() {
      if (galaxyStructure) return galaxyStructure;

      galaxyStructure = {
        numArms: 3 + Math.floor(Math.random() * 3), // 3-5 arms
        arms: []
      };

      for (let arm = 0; arm < galaxyStructure.numArms; arm++) {
        galaxyStructure.arms.push({
          angle: (arm * Math.PI * 2) / galaxyStructure.numArms + (Math.random() - 0.5) * 0.5,
          variation: Math.random() * 0.3 + 0.1,
          offset: (Math.random() - 0.5) * 0.8,
          lineWidth: 2 + Math.random() * 3,
          hasBranch: Math.random() > 0.6
        });
      }

      return galaxyStructure;
    }

    function drawGalaxySpiral() {
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const time = Date.now() * 0.001;

      // Initialize galaxy structure once
      const galaxy = initializeGalaxyStructure();

      // Create radial gradient for galaxy center (bigger)
      const centerGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 350);
      centerGradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
      centerGradient.addColorStop(0.2, 'rgba(255, 200, 255, 0.7)');
      centerGradient.addColorStop(0.4, 'rgba(200, 150, 255, 0.5)');
      centerGradient.addColorStop(0.7, 'rgba(100, 50, 200, 0.3)');
      centerGradient.addColorStop(1, 'rgba(50, 25, 100, 0.1)');

      // Draw galaxy center
      ctx.fillStyle = centerGradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 350, 0, Math.PI * 2);
      ctx.fill();

      // Draw spiral arms with stable structure
      galaxy.arms.forEach(arm => {
        const spiralGradient = ctx.createLinearGradient(centerX, centerY, centerX + Math.cos(arm.angle) * 600, centerY + Math.sin(arm.angle) * 600);
        spiralGradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
        spiralGradient.addColorStop(0.3, 'rgba(200, 150, 255, 0.3)');
        spiralGradient.addColorStop(0.6, 'rgba(150, 100, 255, 0.2)');
        spiralGradient.addColorStop(1, 'rgba(100, 50, 200, 0.1)');

        ctx.strokeStyle = spiralGradient;
        ctx.lineWidth = arm.lineWidth;
        ctx.beginPath();

        // Create irregular spiral with stable variations
        for (let i = 0; i < 150; i++) {
          const t = i / 150;
          const radius = t * 500 + Math.sin(t * Math.PI * 4 + arm.offset) * 20;
          const angle = arm.angle + t * (3 + arm.variation) * Math.PI + time * 0.01 +
            Math.sin(t * Math.PI * 6) * 0.2;
          const x = centerX + Math.cos(angle) * radius;
          const y = centerY + Math.sin(angle) * radius;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();

        // Add secondary spiral branches
        if (arm.hasBranch) {
          ctx.strokeStyle = 'rgba(150, 100, 255, 0.15)';
          ctx.lineWidth = 1;
          ctx.beginPath();

          for (let i = 0; i < 80; i++) {
            const t = i / 80;
            const radius = t * 300 + Math.sin(t * Math.PI * 3) * 15;
            const angle = arm.angle + t * 2 * Math.PI + time * 0.005;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;

            if (i === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
          }
          ctx.stroke();
        }
      });

      // Add stars with stable positions
      if (!galaxyStructure.stars) {
        galaxyStructure.stars = [];
        for (let i = 0; i < 400; i++) {
          const arm = Math.floor(Math.random() * galaxy.numArms);
          const armAngle = (arm * Math.PI * 2) / galaxy.numArms;
          const t = Math.random();
          const radius = t * 600 + Math.random() * 100;
          const angle = armAngle + t * 3 * Math.PI + (Math.random() - 0.5) * 0.5;

          galaxyStructure.stars.push({
            x: centerX + Math.cos(angle) * radius,
            y: centerY + Math.sin(angle) * radius,
            size: Math.random() * 3 + 0.5,
            opacity: Math.random() * 0.9 + 0.1,
            color: Math.floor(Math.random() * 4),
            baseAngle: angle,
            baseRadius: radius,
            arm: arm
          });
        }
      }

      // Draw stars with rotation
      galaxyStructure.stars.forEach(star => {
        const armAngle = (star.arm * Math.PI * 2) / galaxy.numArms;
        const angle = star.baseAngle + time * 0.005;
        const x = centerX + Math.cos(angle) * star.baseRadius;
        const y = centerY + Math.sin(angle) * star.baseRadius;

        const starColors = [
          `rgba(255, 255, 255, ${star.opacity})`,
          `rgba(200, 200, 255, ${star.opacity})`,
          `rgba(255, 200, 255, ${star.opacity})`,
          `rgba(200, 255, 255, ${star.opacity})`
        ];

        ctx.fillStyle = starColors[star.color];
        ctx.beginPath();
        ctx.arc(x, y, star.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Add some background stars outside the main galaxy
      if (!galaxyStructure.backgroundStars) {
        galaxyStructure.backgroundStars = [];
        for (let i = 0; i < 100; i++) {
          const angle = Math.random() * Math.PI * 2;
          const distance = 400 + Math.random() * 300;
          galaxyStructure.backgroundStars.push({
            x: centerX + Math.cos(angle) * distance,
            y: centerY + Math.sin(angle) * distance,
            size: Math.random() * 1.5,
            opacity: Math.random() * 0.4 + 0.1,
            baseAngle: angle,
            baseDistance: distance
          });
        }
      }

      // Draw background stars with slow rotation
      galaxyStructure.backgroundStars.forEach(star => {
        const angle = star.baseAngle + time * 0.002;
        const x = centerX + Math.cos(angle) * star.baseDistance;
        const y = centerY + Math.sin(angle) * star.baseDistance;

        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
        ctx.beginPath();
        ctx.arc(x, y, star.size, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw galaxy spiral background
      drawGalaxySpiral();

      circlesRef.current.forEach(circle => {
        circle.move();
        circle.animateOrbit();
      });
      animationId = requestAnimationFrame(animate);
    }

    // Start animation
    animate();

    // Cleanup function to stop animation when component unmounts
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    class MovingCircle {
      constructor(x, y, radius, color, dx = 2, dy = 2, label = '', Lcolor = 'white', taskId = null) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.baseDx = dx >= 0.5 ? -1 : 1;
        this.baseDy = dy >= 0.5 ? -1 : 1;
        this.dx = this.baseDx;
        this.dy = this.baseDy;
        this.label = label;
        this.minis = [];
        this.onClick = null;
        this.onContextMenu = null;
        this.taskId = taskId;
      }

      move() {
        this.x += this.dx;
        this.y += this.dy;

        const marginX = 50;
        const marginY = 50;

        if (this.x + this.radius >= canvas.width - marginX || this.x - this.radius <= marginX) {
          this.dx = -this.dx;
        }
        if (this.y + this.radius >= canvas.height - marginY || this.y - this.radius <= marginY) {
          this.dy = -this.dy;
        }

        this.draw();
      }

      animateOrbit() {
        this.minis.forEach(childCircle => {
          childCircle.move();
        });
      }

      draw() {
        const canvas = canvasRef.current;
        if (canvas != null) {
          const ctx = canvas.getContext('2d');
        }

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();

        // Style for the label text
        ctx.font = 'bold 15px Arial';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.lineWidth = 2;

        // Draw the label text centered within the circle
        ctx.strokeText(this.label, this.x, this.y);
        ctx.fillText(this.label, this.x, this.y);
      }

      addMiniCircle(label) {
        const numMiniCircles = this.minis.length;
        const angleIncrement = (2 * Math.PI) / (numMiniCircles + 1);
        let angle = 0;

        const miniGalaxyColors = [
          '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', '#FF9FF3',
          '#54A0FF', '#5F27CD', '#00D2D3', '#FF9F43', '#10AC84', '#EE5A24'
        ];

        const randomMiniColor = miniGalaxyColors[Math.floor(Math.random() * miniGalaxyColors.length)];

        const orbitCirc = new MiniCircle(
          this.x + this.distanceFromCenter * Math.cos(angle),
          this.y + this.distanceFromCenter * Math.sin(angle),
          20,
          randomMiniColor,
          1,
          1,
          label,
          'white',
          this,
          100
        );

        this.minis.push(orbitCirc);
        this.adjustMinis();
      }

      adjustMinis() {
        const numMiniCircles = this.minis.length - 1;
        const angleIncrement = (2 * Math.PI) / (numMiniCircles + 1);
        let angle = 0;

        this.minis.forEach((miniCircle) => {
          miniCircle.angle = angle;
          miniCircle.move();
          angle += angleIncrement;
        });
      }
    }

    class MiniCircle extends MovingCircle {
      constructor(x, y, radius, color, dx = 2, dy = 2, label, Lcolor = 'black', parent = null, distanceFromCenter = 50) {
        super(x, y, radius, color, dx, dy);
        this.distanceFromCenter = distanceFromCenter;
        this.angle = 0;
        this.parent = parent || null;
        this.label = label;
      }

      move() {
        this.angle += 0.02;
        this.x = this.parent.x + this.distanceFromCenter * Math.cos(this.angle);
        this.y = this.parent.y + this.distanceFromCenter * Math.sin(this.angle);
        this.draw();
      }
    }

    const createCircle = async () => {
      const galaxyColors = [
        '#4A148C', '#1A237E', '#0D47A1', '#006064', '#1B5E20', '#3E2723',
        '#BF360C', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5', '#2196F3',
        '#00BCD4', '#4CAF50', '#FF9800', '#F44336'
      ];

      const randomColor = galaxyColors[Math.floor(Math.random() * galaxyColors.length)];

      const newCircle = new MovingCircle(
        Math.random() * 400 + 600,
        Math.random() * 400 + 300,
        50,
        randomColor,
        Math.random(),
        Math.random(),
        label
      );

      newCircle.onClick = async () => {
        circlesRef.current = circlesRef.current.filter(circle => circle !== newCircle);
        
        // Delete task from API
        if (newCircle.taskId) {
          try {
            await tasksAPI.deleteTask(newCircle.taskId);
          } catch (error) {
            console.error('Error deleting task:', error);
          }
        }
        
        // Play pop sound for task completion
        console.log('Task bubble clicked - playing pop sound!');
        playPopSound();
        updateExperiencePoints(10);
      };

      // Create task in API
      if (user) {
        try {
          const response = await tasksAPI.createTask({
            label: label,
            x: newCircle.x,
            y: newCircle.y,
            color: randomColor
          });
          newCircle.taskId = response.data.id;
        } catch (error) {
          console.error('Error creating task:', error);
        }
      }

      circlesRef.current.push(newCircle);
      setLabel('');
    };

    if (circleFlag) {
      createCircle();
      setCircleFlag(false);
    }

    const handleShiftClick = (e) => {
      if (!e.shiftKey) return;
      e.preventDefault();
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      for (const circle of circlesRef.current) {
        const distance = Math.sqrt(
          Math.pow(mouseX - circle.x, 2) + Math.pow(mouseY - circle.y, 2)
        );
        if (distance <= circle.radius) {
          if (circle.addMiniCircle) {
            circle.addMiniCircle(label);
            setLabel('');
          }
          break;
        }
      }
    };

    document.addEventListener("mousedown", handleShiftClick);

    return () => {
      document.removeEventListener("mousedown", handleShiftClick);
    };

  }, [circleFlag, label, user]);

  const newCircle = () => {
    setCircleFlag(true);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      newCircle();
    }
  };

  const handleCanvasClick = (e) => {
    if (!e.shiftKey) {
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      // Check if any mini circle was clicked
      for (const circle of circlesRef.current) {
        for (const miniCircle of circle.minis) {
          const distance = Math.sqrt(
            Math.pow(mouseX - miniCircle.x, 2) + Math.pow(mouseY - miniCircle.y, 2)
          );
          if (distance <= miniCircle.radius) {
            setXpNotifications(prevNotifications => [
              ...prevNotifications,
              { x: e.clientX, y: e.clientY, points: 5 },
            ]);

            circle.minis = circle.minis.filter(mc => mc !== miniCircle);
            circle.adjustMinis();
            updateExperiencePoints(5);

            // Play pop sound for mini-circle completion
            console.log('Mini-circle clicked - playing pop sound!');
            playPopSound();

            return;
          }
        }
      }

      // Check if any main circle was clicked
      for (const circle of circlesRef.current) {
        const distance = Math.sqrt(
          Math.pow(mouseX - circle.x, 2) + Math.pow(mouseY - circle.y, 2)
        );
        if (distance <= circle.radius) {
          if (circle.onClick) {
            if (circle.minis.length == 0) {
              circle.onClick();
              setXpNotifications(prevNotifications => [
                ...prevNotifications,
                { x: e.clientX, y: e.clientY, points: 10 },
              ]);
            }
          }
          break;
        }
      }
    }
  };

  return (
    <div className="todo">
      {/* Header Section */}
      <div className="todo-header">
        <h1 className="todo-title">Task Manager</h1>
        <p className="todo-subtitle">Click and drag to create interactive task bubbles</p>
      </div>

      {/* Canvas Section */}
      <div className="canvas-container">
        <canvas
          ref={canvasRef}
          width={1200}
          height={1000}
          onClick={handleCanvasClick}
        ></canvas>
        {xpNotifications.map((notification, index) => (
          <ExperienceNotis
            key={index}
            x={notification.x}
            y={notification.y}
            points={notification.points}
          />
        ))}
      </div>

      {/* Input Section */}
      <div className="input-section">
        <div className="input-group">
          <label className="input-label" htmlFor="labelInput">
            Create New Task
          </label>
          <div className="input-wrapper">
            <input
              type="text"
              id="labelInput"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="What needs to be done?"
              className="task-input"
            />
            <button className="create-button" onClick={newCircle} disabled={!label.trim()}>
              <span className="button-text">Create Task</span>
              <span className="button-icon">+</span>
            </button>
          </div>
          <p className="input-hint">Press Enter or click the button to create your task</p>
        </div>
      </div>
    </div>
  );
}

export default TodoList;

