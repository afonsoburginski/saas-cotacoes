"use client";
import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Carlos Mendes",
    role: "Proprietário",
    company: "Depósito São Paulo",
    content: "Desde que me cadastrei, minhas vendas aumentaram 40%. A plataforma traz clientes qualificados direto para minha loja.",
    rating: 5,
    avatar: "/placeholder-user.jpg"
  },
  {
    name: "Ana Rodrigues",
    role: "Construtora",
    company: "Construindo Sonhos",
    content: "Economizo mais de R$ 8.000 por obra comparando preços. Encontro tudo que preciso em um só lugar.",
    rating: 5,
    avatar: "/placeholder-user.jpg"
  },
  {
    name: "Roberto Lima",
    role: "Gerente",
    company: "Casa & Construção",
    content: "Excelente para lojistas! Recebo pedidos diários e consigo gerenciar meu estoque de forma inteligente.",
    rating: 5,
    avatar: "/placeholder-user.jpg"
  }
];

export function Testimonials() {
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
            Lojistas e Construtores Aprovam
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Mais de 5.000 lojistas e 15.000 construtores já fazem parte da nossa comunidade
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300"
            >
              <div className="absolute top-6 right-6 text-[#0052FF]/20 group-hover:text-[#0052FF]/40 transition-colors duration-300">
                <Quote className="w-8 h-8" />
              </div>
              
              <div className="flex items-center mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              
              <p className="text-gray-700 mb-6 leading-relaxed italic">
                "{testimonial.content}"
              </p>
              
              <div className="flex items-center">
                <div className="w-12 h-12 bg-[#0052FF] rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                  {testimonial.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                  <p className="text-sm text-gray-600">{testimonial.role}</p>
                  <p className="text-sm text-[#0052FF] font-medium">{testimonial.company}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
