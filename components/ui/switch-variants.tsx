// @refresh reset
"use client"

import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"
import { cn } from "@/lib/utils"

// スイッチタイプの定義
export type SwitchVariant = "solid1" | "solid2" | "solid3" | "solid4" | "solid5" | "solid6" | "solid7" | "solid8"

interface SwitchVariantProps extends React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root> {
  variant?: SwitchVariant
}

// 単色スイッチ1: ブルー
const Solid1Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, onCheckedChange, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      "peer inline-flex h-8 w-14 shrink-0 cursor-pointer items-center rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-gray-300",
      className
    )}
    onCheckedChange={onCheckedChange}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        "pointer-events-none block h-6 w-6 rounded-full bg-white shadow-lg transition-transform data-[state=checked]:translate-x-7 data-[state=unchecked]:translate-x-1"
      )}
    />
  </SwitchPrimitives.Root>
))

// 単色スイッチ2: グリーン
const Solid2Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, onCheckedChange, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      "peer inline-flex h-8 w-14 shrink-0 cursor-pointer items-center rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-gray-300",
      className
    )}
    onCheckedChange={onCheckedChange}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        "pointer-events-none block h-6 w-6 rounded-full bg-white shadow-lg transition-transform data-[state=checked]:translate-x-7 data-[state=unchecked]:translate-x-1"
      )}
    />
  </SwitchPrimitives.Root>
))

// 単色スイッチ3: レッド
const Solid3Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, onCheckedChange, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      "peer inline-flex h-8 w-14 shrink-0 cursor-pointer items-center rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-red-600 data-[state=unchecked]:bg-gray-300",
      className
    )}
    onCheckedChange={onCheckedChange}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        "pointer-events-none block h-6 w-6 rounded-full bg-white shadow-lg transition-transform data-[state=checked]:translate-x-7 data-[state=unchecked]:translate-x-1"
      )}
    />
  </SwitchPrimitives.Root>
))

// 単色スイッチ4: 黒
const Solid4Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, onCheckedChange, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      "peer inline-flex h-8 w-14 shrink-0 cursor-pointer items-center rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-black data-[state=unchecked]:bg-gray-300",
      className
    )}
    onCheckedChange={onCheckedChange}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        "pointer-events-none block h-6 w-6 rounded-full bg-white shadow-lg transition-transform data-[state=checked]:translate-x-7 data-[state=unchecked]:translate-x-1"
      )}
    />
  </SwitchPrimitives.Root>
))

// 単色スイッチ5: グレー
const Solid5Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, onCheckedChange, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      "peer inline-flex h-8 w-14 shrink-0 cursor-pointer items-center rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-gray-600 data-[state=unchecked]:bg-gray-300",
      className
    )}
    onCheckedChange={onCheckedChange}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        "pointer-events-none block h-6 w-6 rounded-full bg-white shadow-lg transition-transform data-[state=checked]:translate-x-7 data-[state=unchecked]:translate-x-1"
      )}
    />
  </SwitchPrimitives.Root>
))

// 単色スイッチ6: 紫
const Solid6Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, onCheckedChange, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      "peer inline-flex h-8 w-14 shrink-0 cursor-pointer items-center rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-purple-600 data-[state=unchecked]:bg-gray-300",
      className
    )}
    onCheckedChange={onCheckedChange}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        "pointer-events-none block h-6 w-6 rounded-full bg-white shadow-lg transition-transform data-[state=checked]:translate-x-7 data-[state=unchecked]:translate-x-1"
      )}
    />
  </SwitchPrimitives.Root>
))

// 単色スイッチ7: イエロー
const Solid7Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, onCheckedChange, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      "peer inline-flex h-8 w-14 shrink-0 cursor-pointer items-center rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-yellow-500 data-[state=unchecked]:bg-gray-300",
      className
    )}
    onCheckedChange={onCheckedChange}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        "pointer-events-none block h-6 w-6 rounded-full bg-white shadow-lg transition-transform data-[state=checked]:translate-x-7 data-[state=unchecked]:translate-x-1"
      )}
    />
  </SwitchPrimitives.Root>
))

// 単色スイッチ8: シアン
const Solid8Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, onCheckedChange, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      "peer inline-flex h-8 w-14 shrink-0 cursor-pointer items-center rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-cyan-500 data-[state=unchecked]:bg-gray-300",
      className
    )}
    onCheckedChange={onCheckedChange}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        "pointer-events-none block h-6 w-6 rounded-full bg-white shadow-lg transition-transform data-[state=checked]:translate-x-7 data-[state=unchecked]:translate-x-1"
      )}
    />
  </SwitchPrimitives.Root>
))

// メインのSwitch コンポーネント
const SwitchVariants = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  SwitchVariantProps
>(({ variant = "solid5", ...props }, ref) => {
  switch (variant) {
    case "solid1":
      return <Solid1Switch {...props} ref={ref} />
    case "solid2":
      return <Solid2Switch {...props} ref={ref} />
    case "solid3":
      return <Solid3Switch {...props} ref={ref} />
    case "solid4":
      return <Solid4Switch {...props} ref={ref} />
    case "solid5":
      return <Solid5Switch {...props} ref={ref} />
    case "solid6":
      return <Solid6Switch {...props} ref={ref} />
    case "solid7":
      return <Solid7Switch {...props} ref={ref} />
    case "solid8":
      return <Solid8Switch {...props} ref={ref} />
    default:
      return <Solid5Switch {...props} ref={ref} />
  }
})

SwitchVariants.displayName = "SwitchVariants"

export { SwitchVariants, Solid1Switch, Solid2Switch, Solid3Switch, Solid4Switch, Solid5Switch, Solid6Switch, Solid7Switch, Solid8Switch }