import { useState } from 'react';
import { OtpInput } from '@enterprise-ui/react';

export const title = 'Verification code';
export const description = 'Typing moves to the next box, Backspace goes back and pasting fills every box. Phones can fill the code from an SMS. Try 123456.';

export default function OtpInputBasic() {
  const [error, setError] = useState<string | undefined>();
  const [ok, setOk] = useState(false);
  return (
    <div style={{ display: 'grid', gap: 8 }}>
      <OtpInput
        label="Enter the 6-digit code we sent to +49 151 ••• 678"
        error={error}
        onChange={() => setError(undefined)}
        onComplete={(code) => (code === '123456' ? setOk(true) : setError('That code is not valid. Check it and try again.'))}
      />
      {ok && <p role="status" style={{ margin: 0 }}>Verified.</p>}
    </div>
  );
}
