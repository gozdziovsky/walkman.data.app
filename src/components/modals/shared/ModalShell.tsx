import { motion } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface ModalShellProps {
  onClose: () => void;
  onNext?: () => void;
  onPrev?: () => void;
  onSwipeUp?: () => void;
  direction: number;
  albumId: string;
  isEdit: boolean;
  children: React.ReactNode;
}

export const ModalShell = ({ 
  onClose, onNext, onPrev, onSwipeUp, direction, albumId, isEdit, children 
}: ModalShellProps) => {
  
  const panelVariants = {
    enter: (d: number) => ({
      x: d > 0 ? 150 : (d < 0 ? -150 : 0),
      opacity: 0,
      filter: 'blur(10px)'
    }),
    center: { x: 0, y: 0, opacity: 1, filter: 'blur(0px)' },
    exit: (d: number) => ({
      x: d < 0 ? 150 : (d > 0 ? -150 : 0),
      opacity: 0,
      filter: 'blur(10px)'
    })
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
      className="fixed inset-0 z-[100] bg-black/98 backdrop-blur-xl flex items-end justify-center p-0 md:px-6 lg:px-12" 
      onClick={onClose}
    >
      {!isEdit && (
        <div className="hidden lg:contents">
          {onPrev && <button onClick={(e) => { e.stopPropagation(); onPrev(); }} className="absolute left-8 top-1/2 -translate-y-1/2 p-5 text-white/5 hover:text-brand transition-all active:scale-90"><ChevronLeft size={64} /></button>}
          {onNext && <button onClick={(e) => { e.stopPropagation(); onNext(); }} className="absolute right-8 top-1/2 -translate-y-1/2 p-5 text-white/5 hover:text-brand transition-all active:scale-90"><ChevronRight size={64} /></button>}
        </div>
      )}

      <motion.div 
        key={albumId}
        custom={direction}
        variants={panelVariants}
        initial="enter" animate="center" exit="exit"
        transition={{ 
            x: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
            y: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
            opacity: { duration: 0.3 }
          }}
        drag={!isEdit ? true : false}
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        dragElastic={0}
        onDragEnd={(_, info) => {
          const { offset, velocity } = info;
          const threshold = 80;
          if (Math.abs(offset.x) > Math.abs(offset.y)) {
            if ((offset.x < -threshold || velocity.x < -500) && onNext) onNext();
            else if ((offset.x > threshold || velocity.x > 500) && onPrev) onPrev();
          } else {
            if (offset.y < -threshold && onSwipeUp) onSwipeUp();
            else if (offset.y > threshold || velocity.y > 500) onClose();
          }
        }}
        className="bg-[#0e0e10] w-full max-w-7xl h-[92vh] ... border-white/5 border-b-0 transform-gpu will-change-transform"
        onClick={e => e.stopPropagation()}
      >
        {children}
        <button onClick={onClose} className="absolute top-6 left-6 p-4 bg-black/40 hover:bg-white hover:text-black transition-all rounded-full z-[60]"><X size={20} /></button>
      </motion.div>
    </motion.div>
  );
};