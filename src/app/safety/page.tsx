import Link from "next/link";
import { F, LegalPage, Section, legalMetadata } from "@/components/legal";

const TITLE = "Community and child-safety standards";
const DESCRIPTION =
  "KindBridge safety standards: adults only, everyday help only, respectful conduct, zero tolerance for child sexual abuse and exploitation, how to meet safely, and how to report, block and appeal.";

export const metadata = legalMetadata({ title: "Safety standards", description: DESCRIPTION, path: "/safety" });

export default function Safety() {
  return (
    <LegalPage title="Safety standards" path="/safety" description={DESCRIPTION}>
      <p>
        These are KindBridge&apos;s community and child-safety standards. Operator: <F k="legalName" />. Support: <F k="supportEmail" />.
        Child-safety contact: <F k="childSafetyEmail" />. See also the <Link href="/rules" className="font-semibold text-teal-700 underline">community rules</Link>.
      </p>

      <Section title="Who may join">
        <p>
          KindBridge is for adults aged 18 and over. Community approval is not a background check, professional certification or
          guarantee of safety. Don&apos;t invite children to create accounts or let anyone use your account.
        </p>
      </Section>

      <Section title="Everyday help only">
        <p>
          Offer only help you can safely provide. Medical, legal, financial, hazardous, regulated, childcare and personal-care
          services, and private-home visits, are not allowed. Arrange help online or in an agreed shared space. Never ask for an
          account password, PIN, financial credential or one-time code.
        </p>
      </Section>

      <Section title="Respect other members">
        <p>
          Harassment, discrimination, hate, threats, stalking, bullying, scams, impersonation, spam, sexual solicitation, explicit
          sexual content, non-consensual intimate images, dangerous or illegal activity and intellectual-property infringement are
          prohibited. Don&apos;t publish private information about yourself or anyone else in listings or reviews, or pressure anyone
          to share contact details, move off the app or continue an uncomfortable interaction.
        </p>
      </Section>

      <Section title="Child safety: zero tolerance" id="child-safety">
        <p>
          Child sexual abuse and exploitation are prohibited, including child sexual abuse material (CSAM), grooming,
          sexualisation of minors, solicitation, sextortion, trafficking and attempts to arrange exploitative contact. This applies
          to text, images, links, profiles, messages and all other content. Being an adults-only service doesn&apos;t excuse content
          or conduct involving harm to a child.
        </p>
        <p>
          Report suspected child exploitation through <strong>Report a problem</strong> in the app or to <F k="childSafetyEmail" />.
          Identify the account, listing, message or exchange and describe the concern. Don&apos;t download, forward or attach
          illegal images. If a child is in immediate danger, contact local emergency services (112 in India) or the Childline
          helpline (1098).
        </p>
        <p>
          We assess reports, restrict access to suspected prohibited material and take account action. We preserve only necessary
          evidence securely and report confirmed CSAM and other matters to the relevant authorities as the law requires. Authorised
          staff handle these cases under a restricted process; members shouldn&apos;t investigate or confront suspects.
        </p>
      </Section>

      <Section title="Honest exchanges and coins">
        <p>
          Agree task details before accepting, communicate changes, confirm only help you actually received and write fair reviews.
          Don&apos;t fake exchanges, buy or sell help coins, demand cash, trade reviews or abuse starter grants. Use the dispute
          controls for incomplete or contested help.
        </p>
      </Section>

      <Section title="Meet safely">
        <p>
          Choose a common area such as a clubhouse, library or coworking lounge. Tell someone you trust where you&apos;re going,
          arrange your own travel and leave if you feel unsafe. Don&apos;t share your home address. KindBridge doesn&apos;t provide
          emergency response or guarantee member conduct.
        </p>
      </Section>

      <Section title="Reporting, blocking and appeals">
        <p>
          Use <strong>Report a problem</strong> for a profile, listing, message, review or exchange. <strong>Block</strong> stops
          new proposals and messages from a member; completion, cancellation, dispute and reporting actions on existing exchanges
          stay available. Manage blocks in <strong>Privacy &amp; sharing → Blocked accounts</strong>.
        </p>
        <p>
          We aim to triage ordinary reports within one business day during support hours (<F k="supportHours" />). Urgent safety
          cases are escalated. This isn&apos;t round-the-clock monitoring. We may remove content, restrict features or suspend or
          close accounts. To ask for a review, email <F k="supportEmail" /> with your case reference.
        </p>
      </Section>
    </LegalPage>
  );
}
