# Data Processing Agreement — Template (DPA)

> Companion to the AgriSphere templates (`OFFTAKE-PROGRAMME-MOU`,
> `SERVICE-LEVEL-AGREEMENT`, `STARTER-PREMIUM-TERMS`,
> `TOURISM-LISTING-AGREEMENT`). This is a **template for professional
> review** — not legal advice, not a filing-ready contract. The entity
> operating AgriSphere must have a lawyer adapt it to its jurisdiction
> (Botswana data-protection context, GDPR/UK GDPR where EU/UK parties are
> involved) before signature.
>
> Language is deliberately universal — no confessional or Arabic content —
> consistent with the platform's standing compliance rule.
>
> Places to fill are marked `[Party A]`, `[Party B]`, `[date]`, `[·]`.

---

**Data Processing Agreement**

between

**[Party A — full legal name, registration number, address]**
("AgriSphere Operator" / "Processor")

and

**[Party B — full legal name or trading name, contact]**
("Customer" / "Controller")

Date: **[date]**

## 1. Background
1.1 The Processor operates AgriSphere, a farmer-support platform that
processes personal data on behalf of users and of organisations that
subscribe to its workspaces (holdings, geo-trace consignments, programme
deliveries, evidence files, alert subscriptions, and similar).
1.2 The Customer wishes to use an AgriSphere workspace and, in doing so,
may make personal data available to the Processor. This agreement sets the
terms on which the Processor handles that data.
1.3 The parties intend this agreement to satisfy the requirement for a
written data-processing arrangement under applicable law, including — where
it applies to the parties — the GDPR/UK GDPR (Art. 28) and any national
data-protection legislation in force at the Customer's or the Processor's
place of establishment.

## 2. Definitions
2.1 "**Personal data**", "**processing**", "**controller**", "**processor**",
"**data subject**" have the meanings given in applicable data-protection law.
2.2 "**Workspace data**" means personal data the Customer (or its members,
producers, suppliers or employees) records in, uploads to, or generates
through the AgriSphere workspace, including names, phone numbers, holding
coordinates, delivery and evidence records, and account histories.
2.3 "**Platform rules**" means the public honesty, privacy and content
rules of AgriSphere as published in its repository and on its trust page,
as amended from time to time with notice to the Customer.

## 3. Roles
3.1 The Customer is the **controller** (or an authorised processor acting
for its controller) of Workspace data. The Processor is the **processor**.
3.2 Where the Customer itself processes data on behalf of third parties
(e.g. individual producers in a co-op workspace), the Customer confirms it
has the authority to do so and has informed those individuals as required.

## 4. What the Processor will and will not do
4.1 The Processor will process Workspace data only:
   (a) to operate and support the workspace and the platform features the
       Customer uses;
   (b) to comply with law or a valid order of a competent authority;
   (c) as otherwise instructed in writing by the Customer.
4.2 The Processor will **not**:
   (a) sell, rent or otherwise monetise Workspace data;
   (b) use Workspace data for advertising or profiling beyond the features
       the Customer uses;
   (c) combine Workspace data across customers for any purpose other than
       anonymised, aggregate statistics that contain no personal data and
       no raw text;
   (d) transfer Workspace data outside the jurisdiction(s) disclosed in the
       Processor's privacy notice without a lawful transfer basis.
4.3 Consent-first features stay consent-first: holding geo-records,
sharing of records with named accounts, alert subscriptions and photo
submissions each require the data subject's own consent, and every such
consent is revocable through the platform.

## 5. Data subjects' rights
5.1 The Processor maintains technical means for data subjects to:
   (a) **export** their data (`GET /api/me/export`); and
   (b) **delete** their account and data (`DELETE /api/me`), which removes
       session data, records, memberships and stored photo files.
5.2 The Processor will assist the Customer, at the Customer's reasonable
request and cost, to respond to data-subject requests that the Customer
cannot fulfil through the platform's self-service tools.
5.3 Erasure is immediate and not reversible; both parties accept this as
the designed behaviour and will say so in their own privacy notices.

## 6. Security
6.1 The Processor maintains appropriate technical and organisational
measures, including: encrypted transport (HTTPS), header-based web security,
token-protected admin surfaces, dependency-free rate limiting on sensitive
endpoints, persistent storage on the platform's production disk, automatic
backups, and per-account capability headers for authorisation.
6.2 Security measures are described in the Processor's public audit and
runbook documents; the Processor will notify the Customer without undue
delay of a personal-data breach affecting Workspace data.

## 7. Sub-processors
7.1 The Processor may engage sub-processors (e.g. hosting, SMS delivery,
optional LLM provider) only:
   (a) with a written contract imposing duties at least as protective as
       this agreement; and
   (b) after notice to the Customer (a list is available on request).
7.2 Optional LLM mode is **off by default**; when enabled it sends only the
current question plus retrieved knowledge to the provider and the Customer
must be able to disable it.

## 8. Retention & deletion
8.1 On termination of the workspace, or on the Customer's written request,
the Processor will delete Workspace data within **[·]** days, except where
law or the platform's backup regime requires a longer period (backups are
kept a maximum of **[·]** days and are themselves deletable).
8.2 The Customer may download its Workspace data at any time before
deletion using the platform's export functions.

## 9. Audits
9.1 On **[·] days'** written notice and no more than once per **[·]**,
the Customer (or its regulator-appointed auditor) may audit the Processor's
compliance with this agreement, at the Customer's cost, subject to
confidentiality and to not disrupting operations.
9.2 The Processor publishes an audit and governance log; to the extent it
covers the matters in this agreement it counts towards the audit right.

## 10. Liability & indemnity
10.1 Each party remains liable for its own acts and omissions under
applicable data-protection law.
10.2 The Processor is not liable for the accuracy of user-declared records,
for certification outcomes, or for decisions the Customer or third parties
take on the basis of self-declared readiness files (see Platform rules).
10.3 **[Party A]/[Party B] — insert negotiated limitation-of-liability and
indemnity clauses here after professional review. Do not sign without them.**

## 11. Term & termination
11.1 This agreement starts on the date above and continues while the
Customer uses the workspace.
11.2 Either party may terminate on **[·] days'** written notice; deletion
obligations (clause 8) survive termination.

## 12. Governing law
12.1 This agreement is governed by the laws of **[Botswana / ·]** and the
parties submit to the exclusive jurisdiction of its courts **[· — adapt]**.

## 13. Signatures
**For the Processor** — name/role/signature/date
**For the Customer** — name/role/signature/date

---

*Repository note: amend `docs/COMPLIANCE.md §6` pointer text when this
template is executed so the live compliance doc reflects reality.*
