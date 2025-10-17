"use client"

import Image from "next/image"

export function TopbarMobile() {
  return (
    <header className="bg-[#0052FF] sticky top-0 z-50 w-full relative overflow-hidden">
      {/* Texture overlay */}
      <div 
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: 'url(/texture.png)',
          backgroundSize: '150px 150px',
          backgroundRepeat: 'repeat',
          mixBlendMode: 'overlay'
        }}
      />
      <div className="py-3 flex items-center justify-center relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 relative overflow-hidden flex-shrink-0">
            <Image
              src="/logo-white.png"
              alt="Orça Norte"
              fill
              className="object-contain"
            />
          </div>
          <span className="font-bold text-lg text-white font-montserrat leading-none">
            Orça Norte
          </span>
        </div>
      </div>
    </header>
  )
}

