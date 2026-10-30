import Link from "next/link";
import { Bullets, F, LegalPage, Section, legalMetadata } from "@/components/legal";

const TITLE = "Delete your account";
const DESCRIPTION =
  "How to close your KindBridge account and request deletion of your personal information, in the app or by email, and what is removed or kept.";

export const metadata = legalMetadata({ title: "Delete your KindBridge account", description: DESCRIPTION, path: "/delete-account" });

const link = "font-semibold text-teal-700 underline";

export default function DeleteAccount() {
  return (
    <LegalPage title={TITLE} path="/delete-account" description={DESCRIPTION}>
      <p>KindBridge is operated by <F k="legalName" />. You can close your account and request deletion of your personal information in either of these ways.</p>

      <Section title="In the app">
        <ol className="list-decimal space-y-1.5 pl-5">
          <li><Link href="/login" className={link}>Sign in</Link> and open <strong>Profile → Settings &amp; support</strong>.</li>
          <li>Finish or cancel any open exchanges.</li>
          <li>Tap <strong>Close my account</strong>, read the explanation and confirm.</li>
        </ol>
      </Section>

      <Section title="By email">
        <p>
          If you can&apos;t sign in, email <F k="privacyEmail" /> from your registered email address with the subject
          &ldquo;Delete my KindBridge account&rdquo;. We&apos;ll confirm the request is yours before acting on it. Never send your
          password, verification code or identity documents.
        </p>
      </Section>

      <Section title="What happens next">
        <p>We aim to complete deletion within <F k="deletionCompletionPeriod" />. When your account is closed we:</p>
        <Bullets
          items={[
            "delete your optional private details (first name, phone, photo link, meeting spot) and custom skills;",
            "sign you out everywhere and revoke every detail you shared with other members;",
            "close your open listings;",
            "replace your username, display name and email address so the account no longer identifies you.",
          ]}
        />
        <p>
          Pseudonymised exchange, message, review, help-coin and safety records are kept for the periods in our{" "}
          <Link href="/privacy-policy#closing-your-account" className={link}>privacy policy</Link> so other members&apos; balances and
          any disputes stay accurate. Backups expire within <F k="backupExpiry" />. Other members may keep copies they saved outside
          KindBridge.
        </p>
        <p>Help coins can&apos;t be redeemed for cash. A closed account can&apos;t be restored.</p>
        <p>Questions: <F k="privacyEmail" />. Operator address: <F k="postalAddress" />.</p>
      </Section>
    </LegalPage>
  );
}
