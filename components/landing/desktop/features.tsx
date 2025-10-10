"use client";
import { motion } from "framer-motion";
import { Store, TrendingUp, Users, BarChart3, Video, Rocket, ArrowRight } from "lucide-react";

const features = [
  {
    icon: Users,
    title: "Receba Cotações Diárias",
    description: "Clientes interessados entram em contato direto com você.",
    color: "bg-gradient-to-br from-[#0052FF] to-[#0052FF]/80",
    size: "large"
  },
  {
    icon: Store,
    title: "Perfil Profissional",
    description: "Cadastre produtos com fotos, preços e descrições completas.",
    color: "bg-[#0052FF]",
    size: "small"
  },
  {
    icon: TrendingUp,
    title: "Divulgação Automática",
    description: "Promovemos sua empresa para novos clientes todos os dias.",
    color: "bg-[#0052FF]",
    size: "small"
  },
  {
    icon: Video,
    title: "Vídeos Promocionais",
    description: "Publique vídeos dos produtos e aumente conversões.",
    color: "bg-gradient-to-br from-[#0052FF] to-[#3B82F6]",
    size: "medium"
  },
  {
    icon: BarChart3,
    title: "Relatórios Completos",
    description: "Acompanhe visualizações, cotações recebidas e conversões.",
    color: "bg-[#0052FF]",
    size: "small"
  },
  {
    icon: Rocket,
    title: "0% de Taxa por Venda",
    description: "Todo o lucro é seu. Pague apenas a assinatura mensal.",
    color: "bg-[#0052FF]",
    size: "small"
  }
];

export function Features() {
  return (
    <section className="py-12 px-6 bg-white">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 font-marlin">
            Tudo que sua Empresa Precisa
          </h2>
          <p className="text-sm text-gray-600 font-montserrat">
            Recursos principais da plataforma
          </p>
        </motion.div>

        {/* Grid Simples 3x2 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              viewport={{ once: true }}
              className="group relative overflow-hidden rounded-xl border border-gray-200 p-5 bg-white hover:border-[#0052FF]/30 hover:scale-[1.02] transition-all duration-300"
            >
              <div className="flex items-start gap-3">
                <div className={`${feature.color} rounded-lg p-2.5 w-11 h-11 flex-shrink-0`}>
                  <feature.icon className="w-full h-full text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-bold text-gray-900 mb-1 font-marlin">
                    {feature.title}
                  </h3>
                  <p className="text-xs text-gray-600 leading-relaxed font-montserrat">
                    {feature.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
