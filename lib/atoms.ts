import { atom } from "jotai"

export const threeSceneAtom = atom<{ initialized: boolean }>({
  initialized: false,
})

export const pixelationAtom = atom<number>(6)
export const bloomAtom = atom<number>(0.4)

export const crystalAnimationAtom = atom<{
  emissiveIntensity: number
  positionY: number
  rotationY: number
}>({
  emissiveIntensity: 0.5,
  positionY: 0.7,
  rotationY: 0,
})
