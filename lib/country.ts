// Which African country a visitor is in, for local context on reviewed answers (scripts/064).
// Order: the person's own choice (?country=XX), then Vercel's country header. ANDA never reads or stores
// the IP address: Vercel's edge works out the country and passes only its two-letter code.
// Names match the directory's `resources.country` values and lib/africa-map.ts.

export const AFRICAN_COUNTRIES: Record<string, string> = {
  DZ: "Algeria", AO: "Angola", BJ: "Benin", BW: "Botswana", BF: "Burkina Faso", BI: "Burundi", CV: "Cabo Verde",
  CM: "Cameroon", CF: "Central African Republic", TD: "Chad", KM: "Comoros", CI: "Côte d'Ivoire",
  CD: "Democratic Republic of the Congo", DJ: "Djibouti", EG: "Egypt", GQ: "Equatorial Guinea", ER: "Eritrea",
  SZ: "Eswatini", ET: "Ethiopia", GA: "Gabon", GH: "Ghana", GN: "Guinea", GW: "Guinea-Bissau", KE: "Kenya",
  LS: "Lesotho", LR: "Liberia", LY: "Libya", MG: "Madagascar", MW: "Malawi", ML: "Mali", MR: "Mauritania",
  MU: "Mauritius", MA: "Morocco", MZ: "Mozambique", NA: "Namibia", NE: "Niger", NG: "Nigeria",
  CG: "Republic of the Congo", RW: "Rwanda", ST: "São Tomé and Príncipe", SN: "Senegal", SC: "Seychelles",
  SL: "Sierra Leone", SO: "Somalia", ZA: "South Africa", SS: "South Sudan", SD: "Sudan", TZ: "Tanzania",
  GM: "The Gambia", TG: "Togo", TN: "Tunisia", UG: "Uganda", ZM: "Zambia", ZW: "Zimbabwe",
}

const valid = (code: string | null | undefined): string | null => {
  const c = (code ?? "").trim().toUpperCase()
  return c in AFRICAN_COUNTRIES ? c : null
}

/** "none" in the query switches local context off for this view. */
export function resolveCountry(chosen: string | null | undefined, headers: { get(name: string): string | null }): string | null {
  if ((chosen ?? "").toLowerCase() === "none") return null
  return valid(chosen) ?? valid(headers.get("x-vercel-ip-country"))
}

export const countryName = (code: string | null) => (code ? AFRICAN_COUNTRIES[code] ?? null : null)
