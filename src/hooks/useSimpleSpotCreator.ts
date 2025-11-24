import { useState, useRef } from 'react';
import { db } from '../lib/supabase/db';
import { sanitize } from '../lib/validation';
import { Spot, Difficulty } from '../types';

export const useSimpleSpotCreator = (
  currentUser: any,
  setView: any,
  setToast: any,
  setSelectedSpot: any
) => {
  const [isCreating, setIsCreating] = useState(false);
  const isCreatingRef = useRef(false);
  
  const [points, setPoints] = useState<Array<{lat: number; lng: number}>>([]);
  const [spotName, setSpotName] = useState('');

  const startCreating = () => {
    setIsCreating(true);
    isCreatingRef.current = true;
    setPoints([]);
    setSpotName('');
    setView('create');
  };

  const cancelCreating = () => {
    setIsCreating(false);
    isCreatingRef.current = false;
    setPoints([]);
    setSpotName('');
    setView('map');
  };

  const handleMapClick = (e: any) => {
    if (!isCreatingRef.current) return;
    const point = { lat: e.latlng.lat, lng: e.latlng.lng };
    setPoints(prev => [...prev, point]); // ВСЁ. ПРОСТО ДОБАВЛЯЕМ ТОЧКУ.
  };

  const finishCreating = async () => {
    if (points.length < 2) {
      alert('Нужно минимум 2 точки!');
      return;
    }
    if (!spotName.trim()) {
      alert('Введите название спота!');
      return;
    }

    const name = sanitize(spotName.trim());
    const difficulty = points.length > 15 ? Difficulty.HARD : points.length > 8 ? Difficulty.MEDIUM : Difficulty.EASY;

    const newSpot: Spot = {
      id: `spot_${Date.now()}`,
      name,
      creatorId: currentUser.id,
      creatorName: currentUser.username,
      points,
      difficulty,
      likes: 0,
      likedBy: [],
      comments: 0,
      commentsList: [],
      runs: [],
      driftScore: 0
    };

    try {
        await db.createSpot(newSpot);
        
        cancelCreating();
        setSelectedSpot(newSpot);
        setToast({ 
            id: `sys-${Date.now()}`,
            type: 'system',
            title: 'Готово!', 
            message: `Спот "${name}" создан!`,
            timestamp: Date.now(),
            isRead: true
        });
        setTimeout(() => setToast(null), 3000);
    } catch (e) {
        console.error(e);
        alert('Ошибка при сохранении');
    }
  };

  return {
    isCreating,
    points,
    spotName,
    setSpotName,
    startCreating,
    cancelCreating,
    finishCreating,
    handleMapClick
  };
};