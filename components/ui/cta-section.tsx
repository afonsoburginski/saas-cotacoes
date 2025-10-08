"use client";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { Spotlight } from "@/components/ui/spotlight-new";
import Link from "next/link";

export function CTASection() {
  return (
    <section className="py-20 px-6 relative overflow-hidden" style={{ backgroundColor: "rgb(0 82 255 / var(--tw-bg-opacity, 1))" }}>
      {/* Spotlight animation overlay */}
      <Spotlight 
        className="z-1"
        gradientFirst="radial-gradient(68.54% 68.72% at 55.02% 31.46%, hsla(210, 100%, 85%, .08) 0, hsla(210, 100%, 55%, .02) 50%, hsla(210, 100%, 45%, 0) 80%)"
        gradientSecond="radial-gradient(50% 50% at 50% 50%, hsla(210, 100%, 85%, .06) 0, hsla(210, 100%, 55%, .02) 80%, transparent 100%)"
        gradientThird="radial-gradient(50% 50% at 50% 50%, hsla(210, 100%, 85%, .04) 0, hsla(210, 100%, 45%, .02) 80%, transparent 100%)"
        translateY={-350}
        width={560}
        height={1380}
        smallWidth={240}
        duration={7}
        xOffset={100}
      />
      
      {/* Background overlay */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundColor: "rgb(0 82 255 / var(--tw-bg-opacity, 1))",
          borderRadius: "inherit"
        }}
      />

      {/* Vertical lines grid */}
      <div className="absolute inset-0 flex justify-between pointer-events-none z-0">
        {Array.from({ length: 24 }).map((_, i) => {
          const distanceFromCenter = Math.abs(i - 11.5) / 11.5;
          const opacity = Math.max(0, distanceFromCenter * 0.4);
          return (
            <div
              key={i}
              className="w-px h-full"
              style={{
                background: `linear-gradient(to bottom, transparent 0%, rgba(255, 255, 255, ${opacity}) 50%, transparent 100%)`
              }}
            />
          );
        })}
      </div>

      {/* Noise Texture Overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          opacity: 0.15,
          backgroundImage:
            "url(https://framerusercontent.com/images/6mcf62RlDfRfU61Yg5vb2pefpi4.png)",
          backgroundRepeat: "repeat",
          backgroundPosition: "left top",
          backgroundSize: "128px auto",
          borderRadius: "inherit",
        }}
      />
      
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-8">
            <Sparkles className="w-4 h-4 text-yellow-300" />
            <span className="text-white/90 text-sm font-medium">
              Mais de 5.000 lojistas e 15.000 construtores conectados
            </span>
          </div>
          
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Sua obra merece os
            <br />
            <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
              melhores preços!
            </span>
          </h2>
          
          <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto leading-relaxed">
            Consumidores economizam milhares. Fornecedores vendem mais. 
            Junte-se à maior plataforma de materiais de construção do Brasil!
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link href="/auth/register">
                <Button 
                  size="lg"
                  className="bg-white text-[#0052FF] hover:bg-gray-100 font-semibold px-8 py-4 text-lg rounded-full shadow-xl hover:shadow-2xl transition-all duration-300"
                >
                  Começar como Consumidor
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link href="/auth/register">
                <Button 
                  size="lg"
                  className="bg-[#22C55E] text-white hover:bg-[#22C55E]/90 font-semibold px-8 py-4 text-lg rounded-full shadow-xl hover:shadow-2xl transition-all duration-300"
                >
                  Sou Fornecedor
                </Button>
              </Link>
            </motion.div>
          </div>
          
          <div className="mt-8 flex items-center justify-center gap-8 text-white/70">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[#22C55E] rounded-full"></div>
              <span className="text-sm">Consumidor sempre grátis</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[#22C55E] rounded-full"></div>
              <span className="text-sm">Fornecedores: 14 dias grátis</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[#22C55E] rounded-full"></div>
              <span className="text-sm">Suporte especializado</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
