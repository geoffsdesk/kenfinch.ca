"""Import Ken's CRM export into the site's `crm_contacts` collection.

Reads the segmented CSV produced from the kvCORE export (columns: segment, first, last,
email, phone, last_activity_year, source, status, deal_type, score, unsubscribed,
know_them, past_client, exclude) and POSTs it in batches to /api/dashboard/contacts.

Usage:
    set DASHBOARD_PASSWORD=...            (PowerShell: $env:DASHBOARD_PASSWORD="...")
    python scripts/import-contacts.py C:\\path\\contacts_all_segmented.csv [--review C:\\path\\ken_review_sphere.csv] [--site https://www.kenfinch.ca] [--dry-run]

The optional review sheet is Ken's copy of the sphere list with `know_them`, `past_client`
and `exclude` filled in; its answers override the base file (matched by email, else phone).

Consent basis per segment (CASL):
    idx-prospect  -> express   (registered on the search site with the consent checkbox)
    sphere        -> implied   (existing relationship) only when Ken marked know_them=yes; otherwise unknown (not emailed)
    active-lead   -> express   (asked Ken for help)
    past-client   -> implied   (existing business relationship)
Contacts tagged Unsubscribed in the export are imported as excluded.
"""
import argparse, csv, json, os, re, sys, urllib.request

def yes(v):
    return (v or '').strip().lower() in ('yes', 'y', 'true', '1', 'x')

def digits(v):
    return re.sub(r'\D', '', v or '')[-10:]

def load(path):
    with open(path, encoding='utf-8-sig', newline='') as f:
        return list(csv.DictReader(f))

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('csv')
    ap.add_argument('--review')
    ap.add_argument('--site', default='https://www.kenfinch.ca')
    ap.add_argument('--batch', default='kvcore-2026-09')
    ap.add_argument('--all-express', action='store_true', help='Whole export came from a double opt-in CRM: mark every contact express consent')
    ap.add_argument('--dry-run', action='store_true')
    a = ap.parse_args()
    pw = os.environ.get('DASHBOARD_PASSWORD')
    if not pw and not a.dry_run:
        sys.exit('Set DASHBOARD_PASSWORD in the environment.')

    review = {}
    if a.review:
        for r in load(a.review):
            key = (r.get('email') or '').strip().lower() or digits(r.get('phone'))
            if key:
                review[key] = r

    rows = []
    stats = {'skipped': 0, 'unknown_consent': 0}
    for r in load(a.csv):
        email = (r.get('email') or '').strip().lower()
        if email and not re.match(r"^[a-z0-9!#$%&'*+/=?^_`{|}~.-]+@[a-z0-9-]+(\.[a-z0-9-]+)+$", email):
            stats['bad_email'] = stats.get('bad_email', 0) + 1
            email = ''  # keep the contact as phone-only rather than reject the whole batch
        phone = (r.get('phone') or '').strip()
        if not email and len(digits(phone)) < 10:
            stats['skipped'] += 1
            continue
        rv = review.get(email or digits(phone), {})
        seg = (r.get('segment') or 'sphere').strip()
        know = yes(rv.get('know_them', r.get('know_them')))
        past = yes(rv.get('past_client', r.get('past_client')))
        exclude = yes(rv.get('exclude', r.get('exclude'))) or yes(r.get('unsubscribed'))
        if a.all_express:
            basis, src = 'express', 'kvCORE double opt-in record (confirmed by Geoff 2026-09-13)'
        elif seg == 'idx-prospect':
            basis, src = 'express', 'Registered on search.neighbourhoodexpertteam.com (consent checkbox)'
        elif seg == 'active-lead':
            basis, src = 'express', 'Asked Ken for help (active/new lead)'
        elif past:
            basis, src = 'implied', 'Past client (existing business relationship)'
        elif know:
            basis, src = 'implied', 'Personal relationship confirmed by Ken'
        else:
            basis, src = 'unknown', 'Sphere import, not yet reviewed by Ken'
            stats['unknown_consent'] += 1
        tags = [t for t in [r.get('deal_type', '').strip(), f"score-{r.get('score','').strip()}" if r.get('score') else ''] if t]
        rows.append({
            'firstName': (r.get('first') or '').strip()[:80],
            'lastName': (r.get('last') or '').strip()[:80],
            'email': email,
            'phone': phone[:30],
            'segment': seg if seg in ('sphere', 'idx-prospect', 'active-lead', 'past-client') else 'sphere',
            'consentBasis': basis,
            'consentSource': src,
            'lastActivityYear': (r.get('last_activity_year') or '').strip()[:4],
            'source': (r.get('source') or '').strip()[:120],
            'tags': tags[:20],
            'exclude': exclude,
            'pastClient': past,
        })

    print(f"prepared {len(rows)} rows; skipped {stats['skipped']} (no email or phone); {stats.get('bad_email', 0)} invalid emails blanked (kept as phone-only); {stats['unknown_consent']} sphere contacts await Ken's review (imported, not emailed)")
    if a.dry_run:
        print(json.dumps(rows[:2], indent=2))
        return

    url = a.site.rstrip('/') + '/api/dashboard/contacts'
    total = {'created': 0, 'updated': 0, 'skipped': 0}
    for i in range(0, len(rows), 400):
        chunk = rows[i:i + 400]
        req = urllib.request.Request(url, data=json.dumps({'password': pw, 'op': 'import', 'batch': a.batch, 'rows': chunk}).encode(), headers={'Content-Type': 'application/json'})
        try:
            with urllib.request.urlopen(req, timeout=120) as resp:
                out = json.load(resp)
        except urllib.error.HTTPError as e:
            sys.exit(f"batch {i // 400 + 1} failed: HTTP {e.code}: {e.read().decode('utf-8', 'replace')[:500]}")
        for k in total:
            total[k] += out.get(k, 0)
        print(f"batch {i // 400 + 1}: {out}")
    print('done', total)

if __name__ == '__main__':
    main()
