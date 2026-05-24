import { motion } from 'framer-motion'

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#020408] z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-6"
      >
        <div className="relative">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            className="w-16 h-16 rounded-full border-2 border-transparent border-t-cyan-400 border-r-purple-500"
          />
          <div className="absolute inset-2 rounded-full bg-[#020408] flex items-center justify-center">
            <span className="text-cyan-400 font-black text-lg">YE</span>
          </div>
        </div>
        <p className="text-slate-500 text-sm tracking-widest uppercase">Loading YoJaz Elite</p>
      </motion.div>
    </div>
  )
}
