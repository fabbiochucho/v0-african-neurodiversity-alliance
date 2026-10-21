// Small strings shared across pages. French and Portuguese are drafts
// (machine translation, 2026-10-21, awaiting review).
export const en = {
  "common.allPathways": "All pathways",
  "common.step": "Step {n}",
  "common.legalEnglishApplies":
    "This page is only available in English. The English version is the one that applies.",
}

type Draft = Partial<Record<keyof typeof en, string>>

export const fr: Draft = {
  "common.allPathways": "Tous les parcours",
  "common.step": "Étape {n}",
  "common.legalEnglishApplies":
    "Cette page n'existe qu'en anglais. C'est la version anglaise qui s'applique.",
}

export const pt: Draft = {
  "common.allPathways": "Todos os percursos",
  "common.step": "Passo {n}",
  "common.legalEnglishApplies": "Esta página só está disponível em inglês. A versão em inglês é a que se aplica.",
}
