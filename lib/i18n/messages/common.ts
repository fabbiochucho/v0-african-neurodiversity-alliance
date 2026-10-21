// Small strings shared across pages. French and Portuguese are drafts
// (machine translation, 2026-10-21, awaiting review).
export const en = {
  "common.allPathways": "All pathways",
  "common.step": "Step {n}",
  "common.legalEnglishApplies":
    "This page is only available in English. The English version is the one that applies.",
  "map.label": "Map of Africa. Countries with listings can be selected.",
  "map.none": "{name}: no listings yet",
  "map.count": "{name}: {count}",
}

type Draft = Partial<Record<keyof typeof en, string>>

export const fr: Draft = {
  "common.allPathways": "Tous les parcours",
  "common.step": "Étape {n}",
  "common.legalEnglishApplies":
    "Cette page n'existe qu'en anglais. C'est la version anglaise qui s'applique.",
  "map.label": "Carte de l'Afrique. Les pays avec des fiches peuvent être sélectionnés.",
  "map.none": "{name} : aucune fiche pour l'instant",
  "map.count": "{name} : {count}",
}

export const pt: Draft = {
  "common.allPathways": "Todos os percursos",
  "common.step": "Passo {n}",
  "common.legalEnglishApplies": "Esta página só está disponível em inglês. A versão em inglês é a que se aplica.",
  "map.label": "Mapa de África. Os países com registos podem ser selecionados.",
  "map.none": "{name}: ainda sem registos",
  "map.count": "{name}: {count}",
}
