"use client";
import { useState } from "react";
import { AuthDialog } from "@/components/auth/auth-dialog";
import { Button } from "@/components/ui/button";
import { ArrowRight, Instagram, MessageCircle } from "lucide-react";
import Link from "next/link";

const socialLinks = [
  { icon: Instagram, href: "https://www.instagram.com/orcanorte?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==", name: "Instagram", color: "hover:bg-pink-500/30" },
  { icon: MessageCircle, href: "https://wa.me/5566966614628", name: "WhatsApp", color: "hover:bg-green-500/30" }
];

export function CTASectionMobile() {
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  
  return (
    <>
    <section className="py-8 px-4 bg-[#0052FF] text-white">
      <div className="max-w-md mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1 mb-4 border border-white/20 font-montserrat">
          <span className="text-white/90 text-xs font-medium">
            +500 empresas crescendo
          </span>
        </div>
        
        {/* Heading */}
        <h2 className="text-xl font-bold text-white mb-2 leading-tight font-marlin">
          Pronto para aumentar
          <br />
          <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
            suas vendas?
          </span>
        </h2>
        
        {/* Description */}
        <p className="text-xs text-white/80 mb-5 px-4 font-montserrat">
          Escolha seu plano e comece hoje. Sem taxas!
        </p>
        
        {/* CTA Button */}
        <Button 
          onClick={() => setAuthDialogOpen(true)}
          size="lg"
          className="w-full bg-[#22C55E] text-white hover:bg-[#22C55E]/90 font-semibold py-4 text-sm rounded-full border-0 active:scale-95 transition-transform mb-6"
        >
          Ver Planos e Começar
          <ArrowRight className="ml-2 w-4 h-4" />
        </Button>
        
        {/* Benefits */}
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-white/70 mb-8 font-montserrat">
          <div className="flex items-center gap-1.5">
            <div className="w-1 h-1 bg-[#22C55E] rounded-full"></div>
            <span className="text-xs">A partir de R$ 99</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-1 h-1 bg-[#22C55E] rounded-full"></div>
            <span className="text-xs">Sem taxas</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-1 h-1 bg-[#22C55E] rounded-full"></div>
            <span className="text-xs">Cancele quando quiser</span>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-5 border-t border-white/10">
          <div className="flex flex-col items-center gap-4">
            {/* Social Icons */}
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-11 h-11 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center transition-all duration-300 ${social.color} active:scale-95`}
                  aria-label={social.name}
                >
                  <social.icon className="w-5 h-5 text-white" />
                </a>
              ))}
            </div>
            
            {/* Copyright */}
            <p className="text-white/60 text-xs font-montserrat">
              © {new Date().getFullYear()} Orça Norte
            </p>
          </div>
        </div>
      </div>
    </section>
    
    <AuthDialog 
      open={authDialogOpen} 
      onOpenChange={setAuthDialogOpen}
      mode="login"
    />
    </>
  );
}

