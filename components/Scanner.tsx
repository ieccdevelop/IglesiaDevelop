
import React, { useEffect, useRef, useState } from 'react';

interface ScannerProps {
  onScan: (isbn: string) => void;
  onClose: () => void;
}

const Scanner: React.FC<ScannerProps> = ({ onScan, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let intervalId: number;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        // Use BarcodeDetector if available (Chrome/Android)
        // @ts-ignore
        if ('BarcodeDetector' in window) {
          // @ts-ignore
          const detector = new BarcodeDetector({ formats: ['ean_13', 'isbn_10', 'isbn_13'] });
          intervalId = window.setInterval(async () => {
            if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
              try {
                const barcodes = await detector.detect(videoRef.current);
                if (barcodes.length > 0) {
                  onScan(barcodes[0].rawValue);
                  stopCamera();
                }
              } catch (e) {
                // Ignore detector errors
              }
            }
          }, 500);
        } else {
          setError("Tu navegador no soporta escaneo nativo de códigos de barras. Por favor, introduce el ISBN manualmente.");
        }
      } catch (err) {
        setError("No se pudo acceder a la cámara.");
      }
    };

    const stopCamera = () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      clearInterval(intervalId);
    };

    startCamera();
    return () => stopCamera();
  }, [onScan]);

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center">
      <div className="relative w-full h-3/4 flex items-center justify-center">
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 border-2 border-white/30 pointer-events-none flex items-center justify-center">
          <div className="w-64 h-40 border-4 border-indigo-500 rounded-lg animate-pulse" />
        </div>
      </div>
      
      <div className="p-6 w-full bg-slate-900 text-white flex flex-col items-center gap-4">
        <p className="text-center font-medium">Encuadra el código de barras del libro</p>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button 
          onClick={onClose}
          className="px-8 py-3 bg-red-600 hover:bg-red-700 rounded-full font-semibold transition-colors"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
};

export default Scanner;
