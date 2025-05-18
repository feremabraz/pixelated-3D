"use client"

import { useAtom } from "jotai"
import { pixelationAtom, bloomAtom } from "@/lib/atoms"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"

export function Controls() {
  const [pixelation, setPixelation] = useAtom(pixelationAtom)
  const [bloom, setBloom] = useAtom(bloomAtom)

  return (
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
          <Slider value={[pixelation]} min={1} max={10} step={1} onValueChange={(value) => setPixelation(value[0])} />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Bloom Intensity</span>
            <span>{bloom.toFixed(1)}</span>
          </div>
          <Slider value={[bloom]} min={0} max={1} step={0.1} onValueChange={(value) => setBloom(value[0])} />
        </div>
      </CardContent>
      <CardFooter>
        <Button
          onClick={() => {
            setPixelation(6)
            setBloom(0.4)
          }}
          variant="outline"
          className="ml-auto"
        >
          Reset
        </Button>
      </CardFooter>
    </Card>
  )
}
