import { Boxes, KeyRound } from 'lucide-react';
import { SignInPage } from '@enterprise-ui/react';

export const title = 'Sign-in page';
export const description = 'Try avery / secret. Other combinations show one generic error, so the page does not reveal which accounts exist. Fields use password-manager friendly autocomplete.';
export const frame = true;

export default function SignInPageBasic() {
  return (
    <div style={{ height: 640 }}>
      <SignInPage
        standalone={false}
        productName="Procurement"
        logo={<Boxes />}
        providers={[{ id: 'sso', label: 'Sign in with company account', icon: <KeyRound /> }]}
        forgotPasswordHref="#reset"
        onSubmit={(c) => new Promise((resolve) => setTimeout(() => resolve(c.username === 'avery' && c.password === 'secret' ? undefined : 'The user name or password is incorrect.'), 500))}
        footer={<span>© 2026 Contoso · <a href="#privacy">Privacy</a> · <a href="#terms">Terms</a></span>}
      />
    </div>
  );
}
