import Link from "next/link";
import { F, LegalPage, Rows, Section, legalMetadata } from "@/components/legal";

const TITLE = "Support";
const DESCRIPTION =
  "Get help with KindBridge: membership, email verification, exchanges, help coins, reporting a problem, privacy and account deletion. Contacts, support hours and the Grievance Officer.";

export const metadata = legalMetadata({ title: "Help and support", description: DESCRIPTION, path: "/support" });

const link = "font-semibold text-teal-700 underline";

export default function Support() {
  return (
    <LegalPage title={TITLE} path="/support" description={DESCRIPTION}>
      <p>
        Need help with membership, email verification, exchanges, help coins, reporting or closing your account? Email{" "}
        <F k="supportEmail" />. Include the exchange or case reference, a short description and your device and browser if you know
        them. <strong>Never send passwords, PINs or verification codes.</strong>
      </p>

      <Section title="Contacts">
        <Rows
          rows={[
            ["Support", <F k="supportEmail" key="s" />],
            ["Support hours", <F k="supportHours" key="h" />],
            ["Report triage", "Ordinary reports are triaged within one business day during support hours."],
            ["Report in the app", <>Settings &amp; support → Report a problem</>],
            ["Privacy and account deletion", <><F k="privacyEmail" /> · <Link href="/delete-account" className={link}>Delete your account</Link></>],
            ["Child safety", <F k="childSafetyEmail" key="c" />],
            ["Grievance Officer", <><F k="grievanceName" />, <F k="grievanceContact" /></>],
            ["Operator", <><F k="legalName" />, <F k="postalAddress" /></>],
          ]}
        />
      </Section>

      <Section title="Common questions">
        <p>
          Answers about help coins, privacy, who can join and what happens when an exchange goes wrong are on{" "}
          <Link href="/how-it-works" className={link}>How it works</Link>. Read the <Link href="/rules" className={link}>community rules</Link>{" "}
          and <Link href="/safety" className={link}>safety standards</Link> for what&apos;s allowed.
        </p>
      </Section>

      <Section title="In an emergency">
        <p>KindBridge is not an emergency service. If someone is in immediate danger, contact local emergency services (112 in India).</p>
      </Section>
    </LegalPage>
  );
}
