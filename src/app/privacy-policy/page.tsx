import Link from "next/link";
import { Bullets, F, LegalPage, Rows, Section, legalMetadata } from "@/components/legal";

const TITLE = "Privacy policy";
const DESCRIPTION =
  "How KindBridge collects, uses, shares and protects personal information, what other members can see, how long records are kept, and how to close your account or exercise your rights.";

export const metadata = legalMetadata({ title: TITLE, description: DESCRIPTION, path: "/privacy-policy" });

export default function PrivacyPolicy() {
  return (
    <LegalPage title={TITLE} path="/privacy-policy" description={DESCRIPTION}>
      <Section title="Who we are">
        <p>
          KindBridge is operated by <F k="legalName" />, <F k="postalAddress" />. This policy explains how we handle personal
          information when you use the KindBridge app, website and support services. Contact <F k="privacyEmail" /> about
          privacy. Our Grievance Officer is <F k="grievanceName" />, <F k="grievanceContact" />.
        </p>
      </Section>

      <Section title="Information we collect">
        <Rows
          rows={[
            ["Account and eligibility", "Email address, password hash, email verification records, confirmation that you are at least 18, rules and terms acceptance, account status and timezone. Used to create and secure accounts, verify email and apply eligibility rules."],
            ["Profile and community", "Username, chosen avatar, biography, skills offered and needed, availability, community membership and approval records. Used to show your community profile and help members find relevant help."],
            ["Optional private details", "First name, phone number, photo link and preferred meeting spot, if you enter them. Used only so you can share a specific detail with a member you choose."],
            ["Community activity", "Listings, proposals, agreed session terms, schedules, exchange messages, reviews and thank-you notes. Used to arrange and record exchanges."],
            ["Help-coin activity", "Balances, reservations, grants, transfers, refunds, corrections and related exchange references. Used to operate help coins and keep accurate records."],
            ["Safety and support", "Reports, blocks, support messages, dispute information, moderator decisions and audit records. Used to investigate concerns, enforce the rules and protect the community."],
            ["Technical information", "Session identifiers, a preference cookie and the request logs our hosting and email providers keep. Used to keep you signed in, remember preferences and keep the service reliable and secure."],
          ]}
        />
        <p>Please don&apos;t put home addresses, sensitive personal information, passwords or other people&apos;s private information in listings, messages or reviews.</p>
      </Section>

      <Section title="How we use information">
        <p>
          We use information for the purposes above, to send verification and necessary service emails, respond to support
          requests, prevent misuse, resolve disputes and meet legal obligations. We ask for any consent the law requires before
          an optional use. Withdrawing consent doesn&apos;t affect earlier lawful processing; some processing is necessary to
          provide an account or an exchange.
        </p>
      </Section>

      <Section title="Who can see information">
        <p>
          Other members of your community can see what is meant for the community: your username, avatar, profile, listings and
          published reviews. Exchange participants see their session terms and conversation. A private thank-you note is for its
          recipient only.
        </p>
        <p>
          Optional private details are never shown to other members unless you share a particular detail with a particular member
          through <strong>Share details</strong>. You can revoke future access in <strong>Privacy &amp; sharing</strong>, but
          revoking can&apos;t retrieve copies or screenshots someone already saved. A photo link loads from its external host,
          which may receive technical request information.
        </p>
        <p>
          Authorised staff, organizers and moderators can access information needed for their duties, such as membership
          approval, support and safety investigations. Exchange messages are not end-to-end encrypted.
        </p>
        <p>We use these service providers to run KindBridge:</p>
        <Rows
          rows={[
            ["Vercel — hosting", "Runs the website and app; processes requests and keeps operational logs."],
            ["Supabase — database", "Stores account, profile, exchange, message, ledger and safety records."],
            ["Resend — email", "Delivers verification and service emails; processes your email address and delivery records."],
          ]}
        />
        <p>
          Providers must protect personal information under contract. We may disclose information where the law requires it, to
          address fraud or threats, to enforce our rights, or in a business transfer with appropriate protections. We do not sell
          personal information and do not use it for advertising or cross-app tracking.
        </p>
      </Section>

      <Section title="Where information is stored">
        <p>
          Our primary database is in <F k="databaseRegion" />. Our providers may process information in <F k="processingCountries" />.
          Where information crosses borders, we apply the safeguards the law requires. Contact us for details.
        </p>
      </Section>

      <Section title="Cookies and device permissions">
        <p>
          We use two cookies: <code>kb_session</code> keeps you signed in for up to 30 days and is removed when you sign out, and{" "}
          <code>kb_theme</code> remembers your light or dark appearance choice for up to a year. We use no advertising or
          analytics cookies.
        </p>
        <p>KindBridge doesn&apos;t request access to your location, contacts, microphone or camera. Meeting spots are typed in, and photos are added as links.</p>
      </Section>

      <Section title="How long we keep information">
        <Rows
          rows={[
            ["Active account and profile", <>While your account is active; <F k="inactiveAccountPolicy" />.</>],
            ["Verification records and expired sessions", <F k="authRecordRetention" key="a" />],
            ["Optional private details", "Until you remove them or close your account."],
            ["Listings, messages, reviews and other content", <F k="contentRetention" key="c" />],
            ["Exchange and help-coin records", <F k="ledgerRetention" key="l" />],
            ["Safety reports, disputes and audit records", <F k="safetyRetention" key="s" />],
            ["Hosting, security and email logs", <F k="logRetention" key="g" />],
            ["Backups", <>Expire within <F k="backupExpiry" />.</>],
          ]}
        />
      </Section>

      <Section title="Closing your account" id="closing-your-account">
        <p>
          You can close your account in <strong>Settings &amp; support → Close my account</strong>, or follow the steps on{" "}
          <Link href="/delete-account" className="font-semibold text-teal-700 underline">Delete your account</Link>. Open exchanges
          need to be completed or cancelled first.
        </p>
        <p>When you close your account we:</p>
        <Bullets
          items={[
            "delete your optional private details and custom skills, and end all your signed-in sessions;",
            "revoke every detail you shared with other members and close your open listings;",
            "replace your username, display name and email address so the account no longer identifies you;",
            "keep the pseudonymised exchange, message, review, help-coin and safety records linked to it only for the periods above, so other members' balances and any disputes stay accurate.",
          ]}
        />
        <p>
          We aim to complete deletion requests within <F k="deletionCompletionPeriod" />. Help coins have no cash value and
          can&apos;t be redeemed when an account closes. Contact <F k="privacyEmail" /> for help.
        </p>
      </Section>

      <Section title="Your choices and rights">
        <p>
          You can edit your profile and private details, change preferences, revoke sharing and close your account. Depending on
          applicable law, including India&apos;s Digital Personal Data Protection Act, 2023, you may also ask to access, correct or
          erase your information, withdraw consent or nominate someone to exercise your rights. Contact <F k="privacyEmail" />; we
          may verify your identity in a proportionate way. You can also contact our Grievance Officer above or the relevant
          authority. We will never ask for your password or verification code.
        </p>
      </Section>

      <Section title="Security">
        <p>
          We use access controls, hashed passwords, hashed session tokens, encrypted connections (HTTPS) and audited
          administrative actions. No online service can guarantee absolute security. Report a suspected privacy or security issue
          to <F k="privacyEmail" />.
        </p>
      </Section>

      <Section title="Adults only">
        <p>
          KindBridge is for people aged 18 and over. We don&apos;t knowingly provide accounts to children. If you believe a child
          has an account or their information was provided to us, contact <F k="childSafetyEmail" />.
        </p>
      </Section>

      <Section title="Changes and contact">
        <p>
          We will post updates here with a new effective date, and give notice or ask for consent where the law requires.
          Privacy requests: <F k="privacyEmail" />. Service support: <F k="supportEmail" />. Postal address: <F k="postalAddress" />.
        </p>
      </Section>
    </LegalPage>
  );
}
