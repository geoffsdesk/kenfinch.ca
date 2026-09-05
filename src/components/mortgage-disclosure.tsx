import { MORTGAGE, REAL_ESTATE, CONTACT } from '@/lib/site';

/**
 * Compliance block for mortgage-related pages (FSRA / MBLAA advertising
 * rules): brokerage authorized name + licence number, and the licensed
 * individual's approved title. Also restates the RECO brokerage so both
 * regulators' requirements are met on every page that mentions both roles.
 */
export function MortgageDisclosure({ className = '' }: { className?: string }) {
  return (
    <p className={`text-xs leading-relaxed text-muted-foreground ${className}`}>
      {CONTACT.name}, {MORTGAGE.title}. Mortgage services provided through {MORTGAGE.brokerage},
      FSRA Brokerage Licence #{MORTGAGE.brokerageLicence}. Real estate services provided by {CONTACT.name},{' '}
      {REAL_ESTATE.title}, {REAL_ESTATE.brokerage}. {REAL_ESTATE.disclaimer} A mortgage pre-approval is not a
      commitment to lend. Rates, terms, and approval are subject to lender criteria and may change without notice.
    </p>
  );
}
