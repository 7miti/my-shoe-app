import React, { useEffect, useRef, useState } from 'react';
import { Camera, X, ImageIcon, Zap, AlertCircle } from 'lucide-react';

interface ScannerProps {
    onCapture: (base64: string) => void;
    onClose: () => void;
}

export default function CameraScanner({ onCapture, onClose }: ScannerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        startCamera();
        return () => {
            stopCamera();
        };
    }, []);

    const startCamera = async () => {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            setErrorMsg("Camera API is not supported in this browser. Please use the Gallery upload below.");
            return;
        }

        try {
            const s = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            });
            setStream(s);
            if (videoRef.current) {
                videoRef.current.srcObject = s;
            }
        } catch (err: any) {
            console.warn("Camera with environment facing mode failed, falling back to default video:", err);
            try {
                // Fallback to any available camera if 'environment' constraint fails
                const fallbackStream = await navigator.mediaDevices.getUserMedia({
                    video: true
                });
                setStream(fallbackStream);
                if (videoRef.current) {
                    videoRef.current.srcObject = fallbackStream;
                }
            } catch (fallbackErr: any) {
                console.error("Camera access denied or unavailable", fallbackErr);
                let friendlyMsg = "Camera not available. Please allow permissions or use Gallery upload.";
                
                if (fallbackErr.name === 'NotReadableError' || (fallbackErr.message && fallbackErr.message.toLowerCase().includes("start video source"))) {
                    friendlyMsg = "Your camera is in use by another application (like Zoom or Teams) or blocked by hardware. Please close it or use the Gallery upload button below.";
                } else if (fallbackErr.name === 'NotAllowedError' || fallbackErr.name === 'PermissionDeniedError') {
                    friendlyMsg = "Camera permission was denied. Please allow access in browser settings or use the Gallery upload button below.";
                }
                
                setErrorMsg(friendlyMsg);
            }
        }
    };

    const stopCamera = () => {
        stream?.getTracks().forEach(t => t.stop());
    };

    const captureFrame = () => {
        if (!videoRef.current) return;
        const video = videoRef.current;
        const canvas = document.createElement('canvas');
        
        // Downscale large images to speed up AI processing significantly
        const MAX_DIMENSION = 800;
        let width = video.videoWidth;
        let height = video.videoHeight;
        
        if (width > height && width > MAX_DIMENSION) {
            height *= MAX_DIMENSION / width;
            width = MAX_DIMENSION;
        } else if (height > MAX_DIMENSION) {
            width *= MAX_DIMENSION / height;
            height = MAX_DIMENSION;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.drawImage(video, 0, 0, width, height);
            const base64 = canvas.toDataURL('image/jpeg', 0.6); // 60% quality for faster upload
            stopCamera();
            onCapture(base64);
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onloadend = () => {
            if (typeof reader.result === 'string') {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_DIMENSION = 800;
                    let width = img.width;
                    let height = img.height;
                    
                    if (width > height && width > MAX_DIMENSION) {
                        height *= MAX_DIMENSION / width;
                        width = MAX_DIMENSION;
                    } else if (height > MAX_DIMENSION) {
                        width *= MAX_DIMENSION / height;
                        height = MAX_DIMENSION;
                    }
                    
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                        ctx.drawImage(img, 0, 0, width, height);
                        const base64 = canvas.toDataURL('image/jpeg', 0.6);
                        stopCamera();
                        onCapture(base64);
                    }
                };
                img.src = reader.result;
            }
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">
            {/* Top Bar */}
            <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10 bg-gradient-to-b from-black/50 to-transparent">
                <button onClick={onClose} className="p-2 bg-[#161618]/80 border border-white/5 rounded-full text-white backdrop-blur">
                    <X size={24} />
                </button>
                <div className="text-white text-xs font-medium uppercase tracking-widest flex items-center px-4 py-2 bg-[#161618]/80 border border-white/5 rounded-full backdrop-blur">
                    Align Label Here
                </div>
                <div className="w-10"></div> {/* Spacer for symmetry */}
            </div>

            {/* Viewfinder */}
            <div className="flex-1 relative bg-[#0a0a0b] flex items-center justify-center overflow-hidden">
                {errorMsg ? (
                    <div className="flex flex-col items-center justify-center p-8 text-center bg-[#161618] rounded-3xl border border-white/5 mx-6 z-20">
                        <AlertCircle className="text-red-400 w-12 h-12 mb-4" />
                        <p className="text-white font-medium mb-2">Camera Error</p>
                        <p className="text-gray-400 text-sm leading-relaxed">{errorMsg}</p>
                    </div>
                ) : (
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                )}
                
                {/* Overlay guides */}
                <div className="absolute inset-x-8 inset-y-32 border-2 border-[#6366f1]/50 rounded-3xl flex flex-col justify-between pointer-events-none">
                    <div className="flex justify-between -mt-1 -mx-1">
                        <div className="w-8 h-8 border-t-4 border-l-4 border-[#6366f1] rounded-tl-xl"></div>
                        <div className="w-8 h-8 border-t-4 border-r-4 border-[#6366f1] rounded-tr-xl"></div>
                    </div>
                    <div className="flex justify-between -mb-1 -mx-1">
                        <div className="w-8 h-8 border-b-4 border-l-4 border-[#6366f1] rounded-bl-xl"></div>
                        <div className="w-8 h-8 border-b-4 border-r-4 border-[#6366f1] rounded-br-xl"></div>
                    </div>
                </div>
            </div>

            {/* Bottom Controls */}
            <div className="h-32 bg-[#0a0a0b] pb-8 px-8 flex items-center justify-between border-t border-white/5">
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="p-4 bg-[#161618] hover:bg-[#1c1c1f] rounded-full text-white flex items-center justify-center border border-white/5 transition-colors"
                >
                    <ImageIcon size={24} />
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        accept="image/*" 
                        capture="environment" // Suggest using camera natively on mobile file picker if possible, though 'accept' triggers gallery usually
                        className="hidden" 
                        onChange={handleFileUpload} 
                    />
                </button>

                <button 
                    onClick={captureFrame} 
                    disabled={!!errorMsg}
                    className="w-20 h-20 bg-transparent rounded-full border-4 border-white flex items-center justify-center shadow-lg active:scale-95 transition-transform disabled:opacity-50 group"
                >
                    <div className="w-16 h-16 rounded-full bg-white group-active:scale-90 transition-transform"></div>
                </button>

                {/* Dummy flash button for aesthetic/future-use */}
                <button className="p-4 bg-[#161618] rounded-full text-gray-600 flex items-center justify-center border border-white/5 cursor-not-allowed">
                    <Zap size={24} />
                </button>
            </div>
        </div>
    );
}
