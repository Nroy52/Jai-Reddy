import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lock, AlertTriangle } from 'lucide-react';

interface PasscodeGateProps {
  onUnlock: (passcode: string) => void;
  onCancel?: () => void;
}

export function PasscodeGate({ onUnlock, onCancel }: PasscodeGateProps) {
  const [passcode, setPasscode] = useState('');
  const [confirmPasscode, setConfirmPasscode] = useState('');
  const [error, setError] = useState('');

  const handleUnlock = () => {
    if (passcode.length < 4) {
      setError('Passcode must be at least 4 characters');
      return;
    }

    if (passcode !== confirmPasscode) {
      setError('Passcodes do not match');
      return;
    }

    // Store in sessionStorage (never localStorage!)
    sessionStorage.setItem('raghava:session:passcode', passcode);
    onUnlock(passcode);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleUnlock();
    }
  };

  return (
    <Dialog open={true} onOpenChange={() => onCancel?.()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Set Session Passcode
          </DialogTitle>
          <DialogDescription>
            Create a passcode to encrypt your passwords for this session only. This passcode will not be stored permanently.
          </DialogDescription>
        </DialogHeader>

        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Demo Mode:</strong> This encryption is for demonstration only. Do not use for real sensitive data.
          </AlertDescription>
        </Alert>

        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="passcode">Passcode (min 4 characters)</Label>
            <Input
              id="passcode"
              type="password"
              value={passcode}
              onChange={(e) => {
                setPasscode(e.target.value);
                setError('');
              }}
              onKeyDown={handleKeyDown}
              placeholder="Enter passcode"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm">Confirm Passcode</Label>
            <Input
              id="confirm"
              type="password"
              value={confirmPasscode}
              onChange={(e) => {
                setConfirmPasscode(e.target.value);
                setError('');
              }}
              onKeyDown={handleKeyDown}
              placeholder="Re-enter passcode"
            />
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <div className="flex gap-2 pt-2">
            <Button onClick={handleUnlock} className="flex-1">
              Unlock Password Manager
            </Button>
            {onCancel && (
              <Button variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>

          <p className="text-xs text-muted-foreground">
            This passcode is only valid for this browser session and will be cleared when you close the tab.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
