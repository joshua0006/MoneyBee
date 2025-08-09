import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { verifyBiometrics, isBiometricAvailable } from '@/utils/biometricAuth';
import { mobileService } from '@/utils/mobileService';

interface AppLockGateProps {
  onUnlocked: () => void;
}

export const AppLockGate: React.FC<AppLockGateProps> = ({ onUnlocked }) => {
  const [show, setShow] = useState(false);
  const [attempting, setAttempting] = useState(false);

  useEffect(() => {
    const settingsRaw = localStorage.getItem('mobileSettings');
    const enabled = settingsRaw ? (JSON.parse(settingsRaw).biometricAuth === true) : false;

    const init = async () => {
      if (!enabled || !mobileService.isMobile) return;
      const { available } = await isBiometricAvailable();
      if (!available) return; // don't block if not available
      setShow(true);
      setAttempting(true);
      const ok = await verifyBiometrics('Unlock your expense tracker');
      setAttempting(false);
      if (ok) {
        mobileService.successHaptic();
        setShow(false);
        onUnlocked();
      }
    };

    init();

    const onVisibility = async () => {
      if (document.visibilityState === 'visible') {
        await init();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [onUnlocked]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <Card className="w-[90%] max-w-sm shadow-xl">
        <CardContent className="p-6 text-center space-y-4">
          <div className="text-lg font-semibold">Unlock MoneyBee</div>
          <p className="text-sm text-muted-foreground">Authenticate to continue</p>
          <Button disabled={attempting} onClick={async () => {
            setAttempting(true);
            const ok = await verifyBiometrics('Unlock your expense tracker');
            setAttempting(false);
            if (ok) {
              mobileService.successHaptic();
              setShow(false);
              onUnlocked();
            } else {
              mobileService.errorHaptic();
            }
          }}>
            {attempting ? 'Waiting…' : 'Unlock'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
