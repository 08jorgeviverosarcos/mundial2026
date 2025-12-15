import React, { useEffect, useRef } from 'react';

interface AdBannerProps {
  className?: string;
  slotId?: string; // If you have specific ad units created in AdSense
}

export const AdBanner: React.FC<AdBannerProps> = ({ className, slotId = "1234567890" }) => {
  const adRef = useRef<HTMLModElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    // Retry logic to ensure the element has width before initializing the ad.
    // This prevents the "No slot size for availableWidth=0" error which happens
    // when AdSense tries to render in a hidden or non-layouted container.
    const attemptInit = () => {
        if (initialized.current) return;
        if (!adRef.current) return;

        // If ad is already initialized (Google adds attributes), skip
        if (adRef.current.getAttribute('data-ad-status')) {
            initialized.current = true;
            return;
        }

        // Critical Check: If width is 0, wait and retry.
        if (adRef.current.offsetWidth === 0) {
            setTimeout(attemptInit, 100);
            return;
        }

        try {
            const adsbygoogle = (window as any).adsbygoogle || [];
            adsbygoogle.push({});
            initialized.current = true;
        } catch (err) {
            console.error('AdSense error:', err);
        }
    };

    // Initial delay to allow React to paint the DOM
    const timer = setTimeout(attemptInit, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`w-full flex justify-center my-6 overflow-hidden min-h-[100px] bg-black/20 backdrop-blur-sm rounded-lg border border-white/5 items-center relative ${className}`}>
        {/* Ad Unit */}
         <ins className="adsbygoogle relative z-10"
             ref={adRef}
             style={{ display: 'block', width: '100%' }}
             data-ad-client="ca-pub-3464238874870656" 
             data-ad-slot={slotId}
             data-ad-format="auto"
             data-full-width-responsive="true"></ins>
        
        {/* Placeholder Background Text */}
        <span className="text-[10px] text-gray-600 absolute pointer-events-none font-mono z-0">
            Advertisement Space
        </span>
    </div>
  );
};