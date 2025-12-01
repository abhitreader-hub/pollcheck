import React, { useState, useEffect } from 'react';
import { 
  Flower2, 
  Hand, 
  Sun, 
  Moon, 
  Umbrella, 
  Briefcase 
} from 'lucide-react';

interface Candidate {
  id: number;
  name: string;
  symbol: React.ReactNode;
  party: string;
}

export const PracticeVoting: React.FC = () => {
  const [votedId, setVotedId] = useState<number | null>(null);
  const [showSlip, setShowSlip] = useState(false);
  const [locked, setLocked] = useState(false);
  const [printProgress, setPrintProgress] = useState(0);
  const [isPrinting, setIsPrinting] = useState(false);
  const [slipFalling, setSlipFalling] = useState(false);

  const candidates: Candidate[] = [
    { id: 1, name: "सावली सुनील कुरुप", party: "Shiv Sena", symbol: <img src="/shivsenalogo.png" alt="Shiv Sena" className="w-10 h-10 object-contain" /> },
    { id: 2, name: "xxx", party: "xxx", symbol: <Hand size={32} className="text-blue-600" /> },
    { id: 3, name: "xxx", party: "xxx", symbol: <Sun size={32} className="text-yellow-500" /> },
  ];

  const handleVote = (id: number) => {
    if (locked) return;
    
    setVotedId(id);
    setLocked(true);
    setShowSlip(true);
    setIsPrinting(true);
    setPrintProgress(0);
    setSlipFalling(false);

    // Play a beep sound first
    let audioContext: AudioContext | null = null;
    try {
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.frequency.value = 1000; // 1000 Hz beep
        oscillator.type = 'square';
        gainNode.gain.value = 0.1;
        oscillator.start();
        setTimeout(() => oscillator.stop(), 500); // Short beep
    } catch (e) {
        // Audio might fail if context not allowed, ignore
    }

    // Play thermal printer sound during printing
    let printerOscillator: OscillatorNode | null = null;
    let printerGain: GainNode | null = null;
    try {
        if (!audioContext) {
          audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        printerOscillator = audioContext.createOscillator();
        printerGain = audioContext.createGain();
        
        // Create white noise-like sound for printer
        printerOscillator.type = 'sawtooth';
        printerOscillator.frequency.value = 150;
        printerGain.gain.value = 0.02;
        
        printerOscillator.connect(printerGain);
        printerGain.connect(audioContext.destination);
        
        // Start printer sound after beep
        setTimeout(() => {
          printerOscillator?.start();
        }, 500);
    } catch (e) {
        // Audio might fail
    }

    // Simulate printing progress - receipt prints over 2 seconds
    let progress = 0;
    const printInterval = setInterval(() => {
      progress += 2;
      setPrintProgress(progress);
      if (progress >= 100) {
        clearInterval(printInterval);
        setIsPrinting(false);
        
        // Stop printer sound
        try {
          printerOscillator?.stop();
        } catch (e) {}
        
        // After printing completes, wait 4 seconds then slip falls
        setTimeout(() => {
          setSlipFalling(true);
          
          // Reset after slip falls
          setTimeout(() => {
            setVotedId(null);
            setShowSlip(false);
            setLocked(false);
            setPrintProgress(0);
            setSlipFalling(false);
          }, 1000);
        }, 4000);
      }
    }, 40); // Updates every 40ms for smooth animation

    return () => clearInterval(printInterval);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in-up">
      <div className="text-center space-y-2 bg-gradient-to-r from-orange-50 via-white to-orange-50 p-6 rounded-xl border-2 border-orange-200">
        <h2 className="text-2xl font-bold text-gray-900">Practice Voting (EVM Demo)</h2>
        <p className="text-gray-500">For Lanja Nagar Panchayat Elections</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-start justify-center">
        {/* Ballot Unit */}
        <div className="bg-white rounded-xl shadow-2xl border-4 border-orange-400 w-full max-w-lg overflow-hidden relative">
          <div className="bg-orange-50 p-3 border-b-2 border-orange-300 text-center font-mono font-bold text-orange-700">
            BALLOT UNIT
          </div>
          
          <div className="divide-y-2 divide-gray-200">
            {candidates.map((candidate) => (
              <div key={candidate.id} className="flex items-center h-20 bg-white">
                {/* Serial No */}
                <div className="w-12 h-full flex items-center justify-center font-bold text-xl text-gray-800 border-r border-gray-200 bg-gray-50">
                  {candidate.id}
                </div>
                
                {/* Name & Party */}
                <div className="flex-1 px-4 flex flex-col justify-center border-r border-gray-200">
                  <span className="font-bold text-gray-900 leading-tight">{candidate.name}</span>
                  <span className="text-xs text-gray-500 font-mono">{candidate.party}</span>
                </div>

                {/* Symbol */}
                <div className="w-20 h-full flex items-center justify-center border-r border-gray-200 p-2">
                  {candidate.symbol}
                </div>

                {/* Light & Button Area */}
                <div className="w-32 h-full flex items-center justify-between px-3 bg-gray-50">
                  {/* LED Lamp */}
                  <div className={`w-4 h-4 rounded-full border border-red-800 transition-all duration-200 ${votedId === candidate.id ? 'bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.8)]' : 'bg-red-900/20'}`} />
                  
                  {/* Blue Button */}
                  <button
                    onClick={() => handleVote(candidate.id)}
                    disabled={locked}
                    className={`
                      h-10 w-16 rounded-md shadow-inner transition-all duration-100 active:scale-95
                      flex items-center justify-center
                      ${locked 
                        ? 'bg-blue-800 cursor-not-allowed opacity-80' 
                        : 'bg-blue-600 hover:bg-blue-700 cursor-pointer shadow-lg shadow-blue-900/20'
                      }
                    `}
                    aria-label={`Vote for ${candidate.name}`}
                  >
                    <div className="w-8 h-1 bg-white/20 rounded-full"></div>
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="bg-orange-50 p-2 text-center text-xs text-orange-600 font-mono border-t-2 border-orange-300 font-semibold">
            {locked ? "VOTE REGISTERED - PLEASE WAIT" : "READY TO VOTE"}
          </div>
        </div>

        {/* VVPAT Simulator (Visual Feedback) */}
        <div className="w-full max-w-xs md:w-64 bg-gray-800 rounded-xl shadow-2xl border-4 border-orange-500 overflow-hidden flex flex-col h-96">
            <div className="bg-gradient-to-r from-orange-600 to-orange-500 p-2 text-center text-white font-mono text-xs font-bold border-b border-orange-400">
                VVPAT DISPLAY
            </div>
            
            <div className="flex-1 relative bg-black flex items-center justify-center p-4 overflow-hidden">
                {/* Printing indicator */}
                {isPrinting && (
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10">
                    <span className="text-green-400 font-mono text-[10px] animate-pulse">● PRINTING...</span>
                  </div>
                )}
                
                {/* The Glass Window */}
                <div className="w-full h-40 bg-white/5 border border-white/10 rounded relative overflow-hidden">
                    {showSlip && votedId && (
                        <div 
                          className={`absolute inset-x-0 bg-gradient-to-b from-gray-50 to-white flex flex-col items-center justify-start space-y-2 transition-all ease-out ${slipFalling ? 'duration-700 translate-y-[200%] opacity-0' : 'duration-100'}`}
                          style={{
                            top: 0,
                            height: '100%',
                            clipPath: `inset(0 0 ${100 - printProgress}% 0)`,
                            boxShadow: isPrinting ? '0 2px 8px rgba(0,0,0,0.3)' : 'none',
                          }}
                        >
                            {/* Receipt content with thermal paper look */}
                            <div className="w-full flex flex-col items-center space-y-1 pt-1 px-3">
                                {/* Perforated top edge */}
                                <div className="w-full flex justify-center gap-1 mb-1">
                                  {[...Array(12)].map((_, i) => (
                                    <div key={i} className="w-1 h-0.5 bg-gray-300 rounded-full"></div>
                                  ))}
                                </div>
                                
                                <span 
                                  className="text-xl font-bold text-black border-2 border-black rounded-full w-7 h-7 flex items-center justify-center"
                                  style={{ opacity: printProgress > 20 ? 1 : 0, transition: 'opacity 0.15s' }}
                                >
                                    {votedId}
                                </span>
                                <div 
                                  className="transform scale-110"
                                  style={{ opacity: printProgress > 40 ? 1 : 0, transition: 'opacity 0.15s' }}
                                >
                                    {candidates.find(c => c.id === votedId)?.symbol}
                                </div>
                                <div 
                                  className="text-center"
                                  style={{ opacity: printProgress > 65 ? 1 : 0, transition: 'opacity 0.15s' }}
                                >
                                    <p className="font-bold text-black text-xs leading-tight">{candidates.find(c => c.id === votedId)?.name}</p>
                                    <p className="font-mono text-black text-[10px]">{candidates.find(c => c.id === votedId)?.party}</p>
                                </div>
                                
                                {/* Perforated bottom edge */}
                                <div 
                                  className="w-full flex justify-center gap-1 mt-1"
                                  style={{ opacity: printProgress > 90 ? 1 : 0, transition: 'opacity 0.15s' }}
                                >
                                  {[...Array(12)].map((_, i) => (
                                    <div key={i} className="w-1 h-0.5 bg-gray-300 rounded-full"></div>
                                  ))}
                                </div>
                            </div>
                            
                            {/* Print head line effect */}
                            {isPrinting && (
                              <div 
                                className="absolute left-0 right-0 h-1 pointer-events-none"
                                style={{ 
                                  top: `${printProgress}%`,
                                  background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.15), rgba(0,0,0,0.3), rgba(0,0,0,0.15), transparent)',
                                }}
                              />
                            )}
                        </div>
                    )}
                    {!showSlip && (
                        <div className="absolute inset-0 flex items-center justify-center text-gray-600 font-mono text-xs">
                           SCREEN DARK
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-gray-900 p-4">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <div className={`w-2 h-2 rounded-full ${locked ? 'bg-green-500 animate-pulse' : 'bg-green-900'}`}></div>
                        <div className="text-[10px] text-gray-400">BUSY</div>
                    </div>
                    <div className="space-y-1 text-right">
                        <div className={`w-2 h-2 rounded-full bg-red-500 ml-auto`}></div>
                        <div className="text-[10px] text-gray-400">ON</div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};