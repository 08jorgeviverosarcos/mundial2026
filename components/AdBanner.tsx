import React, { useEffect, useRef } from 'react';

interface AdBannerProps {
  className?: string;
  slotId?: string; // If you have specific ad units created in AdSense
}

export const AdBanner: React.FC<AdBannerProps> = ({ className, slotId = "1234567890" }) => {
  const adRef = useRef<HTMLModElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    // Prevent double initialization in React Strict Mode which can cause errors
    if (initialized.current) return;
    
    // Check if ad has already been filled (AdSense adds data-ad-status attribute)
    if (adRef.current && adRef.current.getAttribute('data-ad-status')) return;

    try {
      // Cast window to any to access adsbygoogle array
      const adsbygoogle = (window as any).adsbygoogle || [];
      // Only push if we haven't already
      adsbygoogle.push({});
      initialized.current = true;
    } catch (err) {
      console.error('AdSense error:', err);
    }
  }, []);

  return (
    <div className={`w-full flex justify-center my-6 overflow-hidden min-h-[100px] bg-black/20 backdrop-blur-sm rounded-lg border border-white/5 items-center relative ${className}`}>
        {/* Using the client ID found in index.html */}
         <ins className="adsbygoogle"
             ref={adRef}
             style={{ display: 'block', width: '100%' }}
             data-ad-client="ca-pub-3464238874870656" 
             data-ad-slot={slotId}
             data-ad-format="auto"
             data-full-width-responsive="true"></ins>
        
        <span className="text-[10px] text-gray-600 absolute pointer-events-none font-mono">
            Advertisement Space
        </span>
    </div>
  );
};