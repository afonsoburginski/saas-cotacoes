"use client"

import { useState, useEffect } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { cn } from "@/lib/utils"

export interface LoadingState {
  text: string
}

const CheckIcon = ({ className }: { className?: string }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={cn("w-6 h-6", className)}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
    </svg>
  )
}

const CheckFilled = ({ className }: { className?: string }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={cn("w-6 h-6", className)}
    >
      <path
        fillRule="evenodd"
        d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
        clipRule="evenodd"
      />
    </svg>
  )
}

interface LoaderCoreProps {
  loadingStates: LoadingState[]
  value?: number
}

const LoaderCore = ({ loadingStates, value = 0 }: LoaderCoreProps) => {
  return (
    <div className="flex relative justify-start max-w-xl mx-auto flex-col mt-40">
      {loadingStates.map((loadingState, index) => {
        const distance = Math.abs(index - value)
        const opacity = Math.max(1 - distance * 0.2, 0)

        return (
          <motion.div
            key={index}
            className={cn("text-left flex gap-2 mb-4")}
            initial={{ opacity: 0, y: -(value * 40) }}
            animate={{ opacity: opacity, y: -(value * 40) }}
            transition={{ duration: 0.5 }}
          >
            <div>
              {index > value && <CheckIcon className="text-muted-foreground" />}
              {index <= value && (
                <CheckFilled className={cn("text-muted-foreground", value === index && "text-primary opacity-100")} />
              )}
            </div>
            <span className={cn("text-foreground", value === index && "text-primary opacity-100")}>
              {loadingState.text}
            </span>
          </motion.div>
        )
      })}
    </div>
  )
}

export interface MultiStepLoaderProps {
  loadingStates: LoadingState[]
  loading?: boolean
  duration?: number
  loop?: boolean
}

export const MultiStepLoader = ({ loadingStates, loading, duration = 2000, loop = true }: MultiStepLoaderProps) => {
  const [currentState, setCurrentState] = useState(0)

  useEffect(() => {
    if (!loading) {
      setCurrentState(0)
      return
    }

    const timeout = setTimeout(() => {
      setCurrentState((prevState) => {
        if (prevState === loadingStates.length - 1) {
          return loop ? 0 : prevState
        }
        return prevState + 1
      })
    }, duration)

    return () => clearTimeout(timeout)
  }, [currentState, loading, loop, loadingStates.length, duration])

  return (
    <AnimatePresence mode="wait">
      {loading && (
        <motion.div
          initial={{
            opacity: 0,
            scale: 0.9,
          }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          exit={{
            opacity: 0,
            scale: 1.1,
          }}
          transition={{
            duration: 0.4,
            ease: "easeInOut",
          }}
          className="w-full h-full fixed inset-0 z-[100] flex items-center justify-center backdrop-blur-2xl bg-background/80"
        >
          <div className="h-96 relative">
            <LoaderCore value={currentState} loadingStates={loadingStates} />
          </div>

          <div className="bg-gradient-to-t inset-x-0 z-20 bottom-0 bg-background h-full absolute [mask-image:radial-gradient(900px_at_center,transparent_30%,white)]" />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
