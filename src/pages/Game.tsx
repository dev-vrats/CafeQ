import React, { useEffect, useRef, useState } from 'react';
import { GlassCard } from '../components/GlassCard';
import { Button } from '../components/Button';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export const Game: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let cupX = canvas.width / 2;
    const cupWidth = 60;
    const cupHeight = 40;
    let beans: { x: number, y: number, speed: number }[] = [];
    let currentScore = 0;
    let isGameOver = false;

    // Handle input
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      cupX = e.clientX - rect.left;
    };
    const handleTouchMove = (e: TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      cupX = e.touches[0].clientX - rect.left;
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('touchmove', handleTouchMove);

    const spawnBean = () => {
      if (Math.random() < 0.05) {
        beans.push({
          x: Math.random() * (canvas.width - 20) + 10,
          y: -20,
          speed: 2 + Math.random() * 3 + (currentScore * 0.1) // gets faster
        });
      }
    };

    const drawCup = () => {
      ctx.fillStyle = '#90353D';
      // simple cup shape
      ctx.beginPath();
      ctx.moveTo(cupX - cupWidth/2, canvas.height - 10);
      ctx.lineTo(cupX + cupWidth/2, canvas.height - 10);
      ctx.lineTo(cupX + cupWidth/2 + 10, canvas.height - cupHeight);
      ctx.lineTo(cupX - cupWidth/2 - 10, canvas.height - cupHeight);
      ctx.fill();
    };

    const drawBeans = () => {
      ctx.fillStyle = '#6E2830';
      beans.forEach(bean => {
        ctx.beginPath();
        ctx.arc(bean.x, bean.y, 8, 0, Math.PI * 2);
        ctx.fill();
      });
    };

    const update = () => {
      if (isGameOver) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      spawnBean();

      beans.forEach((bean, index) => {
        bean.y += bean.speed;
        
        // collision
        if (bean.y + 8 >= canvas.height - cupHeight && bean.y <= canvas.height - 10) {
          if (bean.x > cupX - cupWidth/2 - 10 && bean.x < cupX + cupWidth/2 + 10) {
            // caught
            beans.splice(index, 1);
            currentScore++;
            setScore(currentScore);
          }
        }

        // missed
        if (bean.y > canvas.height) {
          isGameOver = true;
          setGameOver(true);
        }
      });

      drawCup();
      drawBeans();

      animationId = requestAnimationFrame(update);
    };

    update();

    return () => {
      cancelAnimationFrame(animationId);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  return (
    <div className="min-h-screen p-6 flex flex-col items-center bg-bg-cream pt-12">
      <div className="w-full max-w-md flex items-center gap-4 mb-8">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="!p-2">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-3xl font-bold">Bean Drop</h1>
      </div>

      <GlassCard className="p-4 w-full max-w-md flex flex-col items-center relative">
        <div className="absolute top-6 right-6 font-bold text-maroon text-2xl z-10">
          {score}
        </div>
        <canvas 
          ref={canvasRef} 
          width={320} 
          height={400} 
          className="bg-white/50 rounded-xl border border-glass-border w-full max-w-[320px] touch-none"
        />
        
        {gameOver && (
          <div className="absolute inset-0 bg-black/60 rounded-[24px] flex flex-col items-center justify-center text-white p-6 z-20 backdrop-blur-sm">
            <h2 className="text-4xl font-bold mb-2">Game Over!</h2>
            <p className="text-xl mb-6">Score: {score}</p>
            <div className="flex gap-4">
              <Button onClick={() => window.location.reload()} variant="primary">Play Again</Button>
              <Button onClick={() => navigate(-1)} variant="secondary">Back to Order</Button>
            </div>
          </div>
        )}
      </GlassCard>
      
      <p className="text-sm text-text-muted mt-6 max-w-xs text-center">
        Catch the coffee beans in your cup! Drag or swipe to move. Miss one and it's game over!
      </p>
    </div>
  );
};
