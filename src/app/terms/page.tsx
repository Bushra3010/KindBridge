import Link from "next/link";
import { F, LegalPage, Section, legalMetadata } from "@/components/legal";

const TITLE = "Terms of use";
const DESCRIPTION =
  "The terms for using KindBridge: eligibility, everyday community help, help coins, cancellations and disputes, content and conduct, moderation, account closure and governing law.";

export const metadata = legalMetadata({ title: TITLE, description: DESCRIPTION, path: "/terms" });

const link = "font-semibold text-teal-700 underline";

export default function Terms() {
  return (
    <LegalPage title={TITLE} path="/terms" description={DESCRIPTION}>
      <Section title="1. Agreement and operator">
        <p>
          These Terms govern KindBridge, operated by <F k="legalName" />, <F k="postalAddress" />. By accepting them and using
          the service you agree to follow them and our <Link href="/rules" className={link}>community rules</Link> and{" "}
          <Link href="/safety" className={link}>safety standards</Link>. Our <Link href="/privacy-policy" className={link}>privacy policy</Link>{" "}
          explains how we handle information. Contact <F k="supportEmail" /> with questions and <F k="privacyEmail" /> for privacy requests.
        </p>
      </Section>

      <Section title="2. Eligibility and accounts">
        <p>
          You must be at least 18 and able to enter a binding agreement. Community availability and membership approval may be
          limited. Keep your account information accurate and your password secure, and tell us about unauthorised use. Don&apos;t
          impersonate others, evade restrictions or create accounts to obtain extra starter coins. Email verification confirms you
          control an email address; it is not a background check or a certification of identity, expertise or safety.
        </p>
      </Section>

      <Section title="3. Community help">
        <p>
          KindBridge helps members offer and request everyday help. Members agree the task, duration, format, time and coin amount
          before an exchange is accepted. Don&apos;t claim qualifications you don&apos;t have or offer prohibited services. We
          don&apos;t guarantee the availability, quality, suitability or outcome of another member&apos;s help.
        </p>
        <p>
          During the pilot, help takes place online or in an agreed shared space. Private-home visits and medical, legal, financial,
          hazardous, regulated, childcare and personal-care services are not allowed. KindBridge is not an emergency service: stop
          any interaction that feels unsafe and contact local emergency services if needed.
        </p>
      </Section>

      <Section title="4. Help coins">
        <p>
          Help coins are internal, non-cash units that record community exchanges. They can&apos;t be bought, sold, withdrawn,
          redeemed for money or transferred outside an exchange. They are not an investment, a bank balance or a promise of income.
          Starter grants and community limits follow the rules shown in the app.
        </p>
        <p>
          Accepting an exchange reserves the agreed coins. Completion, cancellation, an agreed partial settlement or a
          moderator&apos;s dispute decision settles or releases them. Don&apos;t create sham exchanges, manipulate reviews or
          exploit an error. We may correct wrong balances and investigate misuse, keeping appropriate records and explaining
          relevant decisions.
        </p>
        <p>KindBridge does not currently sell coins, subscriptions or boosts. If paid features are introduced, their price and terms will be shown before purchase.</p>
      </Section>

      <Section title="5. Cancellations and disputes">
        <p>
          Use the exchange controls to reschedule or cancel, and the dispute and report tools if help is incomplete, unsafe or
          contested. Coin refunds or partial settlements follow the exchange outcome; there are no cash refunds. We may review the
          exchange terms, relevant messages and supporting information to resolve records. Moderation doesn&apos;t remove your legal
          rights or replace courts or emergency services.
        </p>
      </Section>

      <Section title="6. Content and conduct">
        <p>
          You keep your rights in content you submit. You give <F k="legalName" /> a non-exclusive, royalty-free permission to host,
          display, transmit and process it only as needed to operate, secure and moderate KindBridge. This ends when the content is
          deleted, except for limited retention described in the privacy policy.
        </p>
        <p>
          Don&apos;t post unlawful, threatening, hateful, sexually exploitative, harassing, fraudulent, infringing or
          privacy-invasive material. Child sexual abuse or exploitation, grooming, sexual solicitation of minors, intimate-image
          abuse and threats of violence are prohibited. Never share passwords, PINs, one-time codes, home addresses or someone
          else&apos;s private details.
        </p>
      </Section>

      <Section title="7. Privacy and voluntary sharing">
        <p>
          Use a username that doesn&apos;t reveal private information. Optional private details are shared only through Share
          details, with members you choose. You can revoke future in-app access but can&apos;t retrieve copies a recipient saved.
          Don&apos;t copy, publish or misuse another member&apos;s details. Authorised staff may access messages and support records
          for legitimate operational and safety purposes.
        </p>
      </Section>

      <Section title="8. Moderation and appeals">
        <p>
          We may remove or restrict content, limit interactions, suspend accounts or end access for rule breaches, credible safety
          concerns, fraud or legal requirements. Where appropriate we explain why and offer a review: email <F k="supportEmail" /> with
          your case reference. Urgent safety actions may happen before notice. Moderation can&apos;t guarantee that all harmful
          conduct is prevented.
        </p>
      </Section>

      <Section title="9. Closing your account and service changes">
        <p>
          You can close your account in Settings or as described on <Link href="/delete-account" className={link}>Delete your account</Link>.
          Unused help coins have no cash value when an account closes. We may change or discontinue the service with notice where
          practicable and as required by law, and will handle pending exchanges and information requests fairly.
        </p>
      </Section>

      <Section title="10. Availability and responsibility">
        <p>
          We aim to run a reliable service but can&apos;t guarantee uninterrupted operation or every member&apos;s conduct. To the
          extent the law allows, the service is provided as available, without guarantees beyond those stated here. Nothing in these
          Terms excludes liability or remedies that can&apos;t lawfully be excluded, including mandatory consumer protections.
        </p>
      </Section>

      <Section title="11. Law, complaints and updates">
        <p>
          These Terms are governed by <F k="governingLaw" />, and disputes are heard by <F k="courts" />, subject to any mandatory
          right to bring a claim elsewhere. Grievance Officer: <F k="grievanceName" />, <F k="grievanceContact" />. We will publish
          material changes with a new effective date and give notice or ask for renewed acceptance where required.
        </p>
      </Section>
    </LegalPage>
  );
}
