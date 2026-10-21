import type { MessageKey } from "./en"
import * as auth from "./messages/auth"
import * as common from "./messages/common"
import * as about from "./messages/about"
import * as donate from "./messages/donate"
import * as advocacy from "./messages/advocacy"
import * as community from "./messages/community"
import * as directory from "./messages/directory"

// Portuguese (European spelling, as used in Angola, Mozambique, Cabo Verde,
// Guinea-Bissau and São Tomé). Draft machine translation (2026-10-21): have a
// native speaker review it before relying on it. Missing keys fall back to English.
export const pt: Partial<Record<MessageKey, string>> = {
  "plan.disclaimer":
    "Este {plan} é uma ferramenta de planeamento e acompanhamento. Não é um documento legal e não substitui o plano ou o processo oficiais da sua escola ou autoridade educativa.",
  "plan.fullPlan": "{plan} completo",
  "plan.title": "{plan} de {name}",
  "plan.quarterlyReview": "Revisão trimestral do {plan}",
  "settings.localisation.title": "País, idioma e contexto educativo",
  "settings.localisation.help": "Usado apenas para ajustar palavras como o nome do plano. A ANDA funciona da mesma forma em todo o lado.",
  "state.saveFailed": "Algo não foi guardado. As suas informações continuam aqui. Tente novamente.",
  "state.loadFailed": "Não foi possível carregar isto agora. As suas informações estão seguras. Tente novamente.",
  "dashboard.empty.title": "O seu percurso começa aqui.",

  "i18n.language": "Idioma",
  "i18n.draftNotice":
    "Esta página foi traduzida automaticamente e pode conter erros. Algumas partes ainda estão em inglês.",

  "nav.about": "Sobre",
  "nav.resources": "Recursos",
  "nav.selfTest": "Ferramenta de autoavaliação",
  "nav.iep": "Gerador de PEI",
  "nav.findSupport": "Encontrar apoio",
  "nav.appsTools": "Apps e ferramentas",
  "nav.learning": "Aprender",
  "nav.community": "Comunidade",
  "nav.advocacy": "Advocacia",
  "nav.research": "Investigação",
  "nav.news": "Notícias",
  "nav.signIn": "Entrar",
  "nav.donate": "Doar",
  "nav.displaySettings": "Definições de visualização e sensoriais",
  "nav.displaySettingsShort": "Definições de visualização",
  "nav.openMenu": "Abrir menu",
  "nav.closeMenu": "Fechar menu",

  "footer.tagline":
    "Capacitamos pessoas neurodivergentes em toda a África através da sensibilização, da educação e de sistemas de apoio inclusivos.",
  "footer.contact": "Perguntas ou pedidos sobre os seus dados:",
  "footer.getSupport": "Obter apoio",
  "footer.learn": "Aprender",
  "footer.community": "Comunidade",
  "footer.selfCheck": "Autoavaliação",
  "footer.supportPlans": "Planos de apoio",
  "footer.findSupport": "Encontrar apoio",
  "footer.appsTools": "Apps e ferramentas",
  "footer.learning": "Aprender",
  "footer.whatWorks": "O que funciona?",
  "footer.newsResearch": "Notícias e investigação",
  "footer.research": "Investigação",
  "footer.forum": "Fórum",
  "footer.advocacy": "Advocacia",
  "footer.about": "Sobre a ANDA",
  "footer.donate": "Doar",
  "footer.familyStart": "A ANDA e o",
  "footer.familyMiddle": "são produtos do",
  "footer.privacy": "Política de privacidade",
  "footer.terms": "Termos de utilização",
  "footer.guidelines": "Regras da comunidade",
  "footer.a11yStatement": "Declaração de acessibilidade",
  "footer.a11ySettings": "Definições de acessibilidade",
  "footer.contactLink": "Contacto",
  "footer.rights": "Todos os direitos reservados. ANDA: Aliança Africana para a Neurodiversidade.",

  "home.heroTitle": "Compreender cada mente.",
  "home.heroTitleAccent": "Apoiar cada percurso.",
  "home.heroText":
    "A ANDA ajuda pessoas, famílias, educadores e profissionais a transformar a avaliação da neurodiversidade em apoio prático, objetivos com significado e progresso mensurável.",
  "home.start": "Começar com o NeuRafiki",
  "home.explore": "Explorar a ANDA",
  "home.loopHint": "Toque num passo do ciclo para ver o que acontece aí.",
  "home.statsLabel": "O que vai encontrar",
  "home.statsIntro": "Já reunidos para si:",
  "home.statsOrganisations": "{n} organizações de apoio",
  "home.statsPapers": "{n} artigos de investigação em acesso aberto",
  "home.statsBooks": "{n} livros e livros de histórias",
  "home.statsApps": "{n} apps",
  "home.statsAnd": "e",
  "home.pathwaysTitle": "Por onde gostaria de começar?",
  "home.ecosystemTitle": "Tudo num só lugar",
  "home.ecosystemText":
    "De uma primeira avaliação a um plano que um professor pode seguir, com as pessoas e as evidências para o apoiar.",
  "home.whyTitle": "Feito para a realidade do apoio em África",
  "home.whyText":
    "Muitas vezes não há um especialista por perto, ainda não há diagnóstico e a ligação é lenta. A ANDA foi feita para isso.",
  "home.joinTitle": "Junte-se ao movimento pela neurodiversidade em África",
  "home.joinText":
    "Seja neurodivergente, cuidador, educador ou ativista, há um lugar para si na nossa comunidade.",
  "home.joinStart": "Comece o seu percurso",
  "home.joinDonate": "Apoie a nossa missão",

  "home.eco.selfCheck": "Autoavaliação",
  "home.eco.selfCheckText":
    "Uma verificação rápida e gratuita de traços neurodivergentes, ligada ao NeuRafiki para o rastreio completo.",
  "home.eco.findSupport": "Encontrar apoio",
  "home.eco.findSupportText":
    "Escolas, terapeutas, grupos de apoio e linhas de ajuda em toda a África, filtráveis por condição.",
  "home.eco.plans": "Planos de apoio",
  "home.eco.plansText":
    "Planos passo a passo com objetivos, estratégias e revisões, partilhados com as pessoas que ajudam.",
  "home.eco.learning": "Aprender",
  "home.eco.learningText": "Cursos, livros de histórias, desenhos animados e o guia O que funciona? sobre as evidências.",
  "home.eco.news": "Notícias e investigação",
  "home.eco.newsText": "Notícias africanas e investigação em acesso aberto sobre neurodivergência, atualizadas todos os dias.",
  "home.eco.apps": "Apps e ferramentas",
  "home.eco.appsText": "Tecnologias de apoio e apps, avaliadas pela comunidade.",
  "home.eco.community": "Comunidade",
  "home.eco.communityText": "Partilhe experiências e encontre apoio de pares em espaços moderados.",
  "home.eco.advocacy": "Advocacia",
  "home.eco.advocacyText": "Recursos para defender escolas e políticas inclusivas.",

  "home.commit.noDiagnosis": "Não é preciso diagnóstico",
  "home.commit.noDiagnosisText":
    "Crie um perfil de apoio e um plano a partir do que já vê em casa ou na sala de aula, e acrescente avaliações quando as tiver.",
  "home.commit.senses": "Os seus sentidos, as suas definições",
  "home.commit.sensesText":
    "Cores calmas ou vivas, texto maior, menos movimento e mais contraste, definidos uma vez e mantidos em todas as páginas.",
  "home.commit.free": "Gratuito onde importa",
  "home.commit.freeText":
    "O diretório de apoio, a biblioteca de investigação, o guia O que funciona? e as sugestões do companheiro não custam nada.",

  "home.step.assess": "Avaliar",
  "home.step.assessText":
    "Um rastreio guiado e aprofundado: autismo, PHDA, aprendizagem, motricidade, sensorial e funções executivas. É um rastreio, não um diagnóstico.",
  "home.step.assessAction": "Ver o que o rastreio abrange",
  "home.step.understand": "Compreender",
  "home.step.understandText":
    "Resultados em linguagem simples, área a área, com um companheiro que explica o que significam e o que perguntar aos profissionais.",
  "home.step.understandAction": "Abrir o NeuRafiki",
  "home.step.plan": "Planear",
  "home.step.planText":
    "Transforme o que aprendeu num plano de apoio: pontos fortes, o que ajuda e objetivos com um ponto de partida, uma meta e uma data de revisão.",
  "home.step.planAction": "Criar um plano de apoio",
  "home.step.support": "Apoiar",
  "home.step.supportText":
    "Reúna pais, professores e terapeutas numa só equipa e encontre escolas, terapeutas e grupos perto de si.",
  "home.step.supportAction": "Encontrar apoio",
  "home.step.measure": "Medir",
  "home.step.measureText":
    "Registe o progresso com um toque e veja-o em palavras calmas: a melhorar, estável ou a precisar de atenção.",
  "home.step.measureAction": "Abrir o seu painel",
  "home.step.adapt": "Adaptar",
  "home.step.adaptText":
    "Veja o que mudou, faça uma nova verificação com o NeuRafiki e ajuste o plano com base no que as evidências mostram.",
  "home.step.adaptAction": "Ver o que funciona",
  ...auth.pt,
  ...common.pt,
  ...about.pt,
  ...donate.pt,
  ...advocacy.pt,
  ...community.pt,
  ...directory.pt,
}
