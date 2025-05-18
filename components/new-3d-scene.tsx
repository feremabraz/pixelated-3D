'use client';

import { useEffect, useRef } from 'react';
import { useAtom } from 'jotai';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { threeSceneAtom, pixelationAtom, bloomAtom } from '@/lib/atoms';
import { initThreeScene } from '@/lib/three-setup';

export function ThreeScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [sceneState, setSceneState] = useAtom(threeSceneAtom);
  const [pixelation, setPixelation] = useAtom(pixelationAtom);
  const [bloom, setBloom] = useAtom(bloomAtom);

  useEffect(() => {
    if (!containerRef.current) return;

    const { cleanup } = initThreeScene(containerRef.current, {
      pixelation,
      bloom,
    });

    setSceneState({ initialized: true });

    return () => {
      cleanup();
      setSceneState({ initialized: false });
    };
  }, [setSceneState, pixelation, bloom]);

  return (
    <div className="w-full flex flex-col items-center gap-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-4xl aspect-video bg-black rounded-lg overflow-hidden"
        ref={containerRef}
      >
        {sceneState.initialized ? null : (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80">
            <p className="text-lg font-medium">Loading scene...</p>
          </div>
        )}
      </motion.div>

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Rendering Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Pixelation</span>
              <span>{pixelation}</span>
            </div>
            <Slider
              value={[pixelation]}
              min={1}
              max={10}
              step={1}
              onValueChange={(value) => setPixelation(value[0])}
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Bloom Intensity</span>
              <span>{bloom.toFixed(1)}</span>
            </div>
            <Slider
              value={[bloom]}
              min={0}
              max={1}
              step={0.1}
              onValueChange={(value) => setBloom(value[0])}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button
            onClick={() => {
              setPixelation(6);
              setBloom(0.4);
            }}
            variant="outline"
            className="ml-auto"
          >
            Reset
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
