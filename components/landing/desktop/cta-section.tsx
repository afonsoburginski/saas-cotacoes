"use client";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Instagram, MessageCircle } from "lucide-react";
import { Spotlight } from "@/components/ui/spotlight-new";
import Link from "next/link";

const socialLinks = [
  { icon: Instagram, href: "https://www.instagram.com/orcanorte?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==", name: "Instagram", color: "hover:bg-pink-500/20" },
  { icon: MessageCircle, href: "https://wa.me/5566966614628", name: "WhatsApp", color: "hover:bg-green-500/20" }
];

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
      
      <div className="max-w-5xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-8 font-montserrat">
            <Sparkles className="w-4 h-4 text-yellow-300" />
            <span className="text-white/90 text-sm font-medium">
              Mais de 500 empresas e prestadores crescendo com a gente
            </span>
          </div>
          
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight font-marlin">
            Pronto para aumentar
            <br />
            <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
              suas vendas?
            </span>
          </h2>
          
          <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto leading-relaxed font-montserrat">
            Escolha seu plano, crie seu perfil e comece a receber cotações de clientes hoje mesmo. Sem taxas por venda!
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link href="/auth/register">
                <Button 
                  size="lg"
                  className="bg-[#22C55E] text-white hover:bg-[#22C55E]/90 font-semibold px-10 py-6 text-lg rounded-full shadow-xl hover:shadow-2xl transition-all duration-300"
                >
                  Ver Planos e Começar
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </motion.div>
          </div>
          
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-white/70 font-montserrat">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[#22C55E] rounded-full"></div>
              <span className="text-sm">Planos a partir de R$ 99</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[#22C55E] rounded-full"></div>
              <span className="text-sm">Sem taxas por venda</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[#22C55E] rounded-full"></div>
              <span className="text-sm">Cancele quando quiser</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <div className="max-w-5xl mx-auto px-6 py-6 mt-20 relative z-10">
        <div className="flex items-center justify-between">
          {/* Copyright */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-white/70 text-sm font-montserrat"
          >
            © {new Date().getFullYear()} Orça Norte
          </motion.p>

          {/* Social Icons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="flex items-center gap-3"
          >
            {socialLinks.map((social) => (
              <a
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center transition-all duration-300 ${social.color}`}
                aria-label={social.name}
              >
                <social.icon className="w-5 h-5 text-white" />
              </a>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
