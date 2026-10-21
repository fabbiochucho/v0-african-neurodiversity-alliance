import type { MessageKey } from "./en"
import * as auth from "./messages/auth"

// French. Draft machine translation (2026-10-21): have a native speaker
// review it before relying on it. Missing keys fall back to English.
export const fr: Partial<Record<MessageKey, string>> = {
  "i18n.language": "Langue",
  "i18n.draftNotice":
    "Cette page a été traduite automatiquement et peut contenir des erreurs. Certaines parties sont encore en anglais.",

  "nav.about": "À propos",
  "nav.resources": "Ressources",
  "nav.selfTest": "Outil d'auto-évaluation",
  "nav.iep": "Générateur de PEI",
  "nav.findSupport": "Trouver de l'aide",
  "nav.appsTools": "Applis et outils",
  "nav.learning": "Apprendre",
  "nav.community": "Communauté",
  "nav.advocacy": "Plaidoyer",
  "nav.research": "Recherche",
  "nav.news": "Actualités",
  "nav.signIn": "Se connecter",
  "nav.donate": "Faire un don",
  "nav.displaySettings": "Réglages d'affichage et sensoriels",
  "nav.displaySettingsShort": "Réglages d'affichage",
  "nav.openMenu": "Ouvrir le menu",
  "nav.closeMenu": "Fermer le menu",

  "footer.tagline":
    "Nous donnons aux personnes neurodivergentes de toute l'Afrique les moyens d'agir grâce à la sensibilisation, à l'éducation et à des systèmes de soutien inclusifs.",
  "footer.contact": "Questions ou demandes concernant vos données :",
  "footer.getSupport": "Trouver de l'aide",
  "footer.learn": "Apprendre",
  "footer.community": "Communauté",
  "footer.selfCheck": "Auto-évaluation",
  "footer.supportPlans": "Plans de soutien",
  "footer.findSupport": "Trouver de l'aide",
  "footer.appsTools": "Applis et outils",
  "footer.learning": "Apprendre",
  "footer.whatWorks": "Qu'est-ce qui marche ?",
  "footer.newsResearch": "Actualités et recherche",
  "footer.research": "Recherche",
  "footer.forum": "Forum",
  "footer.advocacy": "Plaidoyer",
  "footer.about": "À propos d'ANDA",
  "footer.donate": "Faire un don",
  "footer.familyStart": "ANDA et",
  "footer.familyMiddle": "sont des produits de",
  "footer.privacy": "Politique de confidentialité",
  "footer.terms": "Conditions d'utilisation",
  "footer.guidelines": "Règles de la communauté",
  "footer.a11yStatement": "Déclaration d'accessibilité",
  "footer.a11ySettings": "Réglages d'accessibilité",
  "footer.contactLink": "Contact",
  "footer.rights": "Tous droits réservés. ANDA : Alliance africaine pour la neurodiversité.",

  "home.heroTitle": "Comprendre chaque esprit.",
  "home.heroTitleAccent": "Soutenir chaque parcours.",
  "home.heroText":
    "ANDA aide les personnes, les familles, les enseignants et les professionnels à transformer l'évaluation de la neurodiversité en soutien concret, en objectifs utiles et en progrès mesurables.",
  "home.start": "Commencer avec NeuRafiki",
  "home.explore": "Découvrir ANDA",
  "home.loopHint": "Touchez une étape de la boucle pour voir ce qui s'y passe.",
  "home.statsLabel": "Ce que vous trouverez",
  "home.statsIntro": "Déjà réunis pour vous :",
  "home.statsOrganisations": "{n} organisations de soutien",
  "home.statsPapers": "{n} articles de recherche en libre accès",
  "home.statsBooks": "{n} livres et livres d'histoires",
  "home.statsApps": "{n} applis",
  "home.statsAnd": "et",
  "home.pathwaysTitle": "Par où voulez-vous commencer ?",
  "home.ecosystemTitle": "Tout au même endroit",
  "home.ecosystemText":
    "D'une première évaluation à un plan qu'un enseignant peut suivre, avec les personnes et les preuves pour l'appuyer.",
  "home.whyTitle": "Conçu pour la réalité du soutien en Afrique",
  "home.whyText":
    "Souvent, il n'y a pas de spécialiste à proximité, pas encore de diagnostic et une connexion lente. ANDA est conçu pour cela.",
  "home.joinTitle": "Rejoignez le mouvement pour la neurodiversité en Afrique",
  "home.joinText":
    "Que vous soyez neurodivergent, aidant, enseignant ou militant, vous avez votre place dans notre communauté.",
  "home.joinStart": "Commencer votre parcours",
  "home.joinDonate": "Soutenir notre mission",

  "home.eco.selfCheck": "Auto-évaluation",
  "home.eco.selfCheckText":
    "Un bilan rapide et gratuit des traits neurodivergents, relié à NeuRafiki pour le dépistage complet.",
  "home.eco.findSupport": "Trouver de l'aide",
  "home.eco.findSupportText":
    "Écoles, thérapeutes, groupes de soutien et lignes d'écoute dans toute l'Afrique, filtrables par condition.",
  "home.eco.plans": "Plans de soutien",
  "home.eco.plansText":
    "Des plans étape par étape avec objectifs, stratégies et bilans, partagés avec les personnes qui aident.",
  "home.eco.learning": "Apprendre",
  "home.eco.learningText": "Cours, livres d'histoires, dessins animés et le guide Qu'est-ce qui marche ? sur les preuves.",
  "home.eco.news": "Actualités et recherche",
  "home.eco.newsText": "Actualités africaines et recherche en libre accès sur la neurodivergence, mises à jour chaque jour.",
  "home.eco.apps": "Applis et outils",
  "home.eco.appsText": "Technologies d'assistance et applis, notées par la communauté.",
  "home.eco.community": "Communauté",
  "home.eco.communityText": "Partagez vos expériences et trouvez le soutien de vos pairs dans des espaces modérés.",
  "home.eco.advocacy": "Plaidoyer",
  "home.eco.advocacyText": "Des ressources pour défendre des écoles et des politiques inclusives.",

  "home.commit.noDiagnosis": "Aucun diagnostic nécessaire",
  "home.commit.noDiagnosisText":
    "Créez un profil de soutien et un plan à partir de ce que vous voyez déjà à la maison ou en classe, puis ajoutez les évaluations quand vous les avez.",
  "home.commit.senses": "Vos sens, vos réglages",
  "home.commit.sensesText":
    "Couleurs calmes ou vives, texte plus grand, moins d'animations et plus de contraste, réglés une fois et gardés sur chaque page.",
  "home.commit.free": "Gratuit là où ça compte",
  "home.commit.freeText":
    "L'annuaire de soutien, la bibliothèque de recherche, le guide Qu'est-ce qui marche ? et les suggestions du compagnon ne coûtent rien.",

  "home.step.assess": "Évaluer",
  "home.step.assessText":
    "Un dépistage guidé et approfondi : autisme, TDAH, apprentissage, motricité, sensoriel et fonctions exécutives. C'est un dépistage, pas un diagnostic.",
  "home.step.assessAction": "Voir ce que couvre le dépistage",
  "home.step.understand": "Comprendre",
  "home.step.understandText":
    "Des résultats en langage simple, domaine par domaine, avec un compagnon qui explique leur sens et quoi demander aux professionnels.",
  "home.step.understandAction": "Ouvrir NeuRafiki",
  "home.step.plan": "Planifier",
  "home.step.planText":
    "Transformez ce que vous avez appris en plan de soutien : forces, ce qui aide, et des objectifs avec un point de départ, une cible et une date de bilan.",
  "home.step.planAction": "Créer un plan de soutien",
  "home.step.support": "Soutenir",
  "home.step.supportText":
    "Réunissez parents, enseignants et thérapeutes dans une même équipe, et trouvez des écoles, des thérapeutes et des groupes près de chez vous.",
  "home.step.supportAction": "Trouver de l'aide",
  "home.step.measure": "Mesurer",
  "home.step.measureText":
    "Notez les progrès en un geste et voyez-les en mots apaisants : en progrès, stable ou à surveiller.",
  "home.step.measureAction": "Ouvrir votre tableau de bord",
  "home.step.adapt": "Adapter",
  "home.step.adaptText":
    "Voyez ce qui a changé, refaites le point avec NeuRafiki et ajustez le plan selon ce que les preuves montrent.",
  "home.step.adaptAction": "Voir ce qui marche",
  ...auth.fr,
}
