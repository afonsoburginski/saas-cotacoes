"use client";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import Image from "next/image";

const footerLinks = [
  { name: "Contato", href: "#" },
  { name: "Privacidade", href: "#" },
  { name: "Termos", href: "#" }
];

const socialLinks = [
  { icon: Facebook, href: "#", name: "Facebook" },
  { icon: Twitter, href: "#", name: "Twitter" },
  { icon: Instagram, href: "#", name: "Instagram" },
  { icon: Linkedin, href: "#", name: "LinkedIn" }
];

export function LandingFooter() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="flex items-center gap-3"
          >
            <div className="w-8 h-8 relative overflow-hidden">
              <Image 
                src="/logo-white.png" 
                alt="Orça Norte"
                fill
                className="object-contain"
              />
            </div>
            <span className="font-bold text-xl">Orça Norte</span>
          </motion.div>

          {/* Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="flex items-center gap-6"
          >
            {footerLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
              >
                {link.name}
              </a>
            ))}
          </motion.div>

          {/* Copyright */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-gray-400 text-sm"
          >
            © {new Date().getFullYear()} Orça Norte
          </motion.p>
        </div>
      </div>
    </footer>
  );
}
