"use client";
import { motion } from "framer-motion";
import { Search, Sparkles, ShoppingCart, BarChart3, Shield, Zap } from "lucide-react";

const features = [
  {
    icon: Search,
    title: "Compare Materiais",
    description: "Encontre os melhores preços de cimento, tijolos, telhas e todos os materiais de construção em tempo real.",
    color: "bg-[#0052FF]"
  },
  {
    icon: Sparkles,
    title: "Orçamento Completo",
    description: "Gere orçamentos detalhados para sua obra com materiais agrupados por loja e região.",
    color: "bg-[#0052FF]",
    highlight: true
  },
  {
    icon: ShoppingCart,
    title: "Compra Direta",
    description: "Compre diretamente dos lojistas cadastrados com entrega garantida na sua obra.",
    color: "bg-[#0052FF]"
  },
  {
    icon: BarChart3,
    title: "Histórico de Preços",
    description: "Acompanhe a variação de preços dos materiais e compre no melhor momento.",
    color: "bg-[#0052FF]"
  },
  {
    icon: Shield,
    title: "Lojistas Verificados",
    description: "Todos os lojistas são verificados e avaliados pelos consumidores da plataforma.",
    color: "bg-[#0052FF]"
  },
  {
    icon: Zap,
    title: "Entrega Rápida",
    description: "Receba seus materiais direto na obra com prazos e fretes transparentes.",
    color: "bg-[#0052FF]"
  }
];

export function AnimatedFeatures() {
  return (
    <section className="py-20 px-6 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Tudo para sua Construção
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            A plataforma completa que conecta você aos melhores preços de materiais de construção
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-2xl" 
                   style={{ backgroundImage: `linear-gradient(135deg, var(--tw-gradient-stops))` }} />
              
              <div className={`w-16 h-16 rounded-2xl ${feature.color} p-4 mb-6 group-hover:scale-110 transition-transform duration-300 ${
                feature.highlight ? 'ring-2 ring-[#22C55E] ring-offset-2' : ''
              }`}>
                <feature.icon className="w-8 h-8 text-white" />
              </div>
              
              <h3 className={`text-xl font-bold mb-3 group-hover:text-[#0052FF] transition-colors duration-300 ${
                feature.highlight ? 'text-[#22C55E]' : 'text-gray-900'
              }`}>
                {feature.title}
              </h3>
              
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
