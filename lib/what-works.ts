// Content for /learning/what-works: a plain-language summary of what the
// research says about education, exercise, sleep, nutrition, gut health,
// supplements and complementary therapies for neurodivergent people.
//
// Every item cites systematic reviews, meta-analyses or guidelines checked
// in October 2026. Keep ratings conservative: when reviews disagree, use
// the lower rating and say so in the summary.

export type Rating = "strong" | "good" | "mixed" | "uncertain" | "not-supported" | "dangerous"

export const RATINGS: Record<Rating, { label: string; description: string }> = {
  strong: { label: "Strong evidence", description: "Many good-quality studies agree." },
  good: { label: "Good evidence", description: "Several reviews show a benefit; some details still uncertain." },
  mixed: { label: "Small or mixed", description: "Small effects, small trials, or reviews that disagree." },
  uncertain: { label: "Uncertain", description: "Too few good studies to say." },
  "not-supported": { label: "Not supported", description: "Good trials show no clear benefit." },
  dangerous: { label: "Dangerous", description: "No benefit and real risk of harm. Avoid." },
}

export interface Source {
  label: string
  url: string
}

export interface Item {
  id: string
  title: string
  conditions: string
  rating: Rating
  summary: string
  practical: string
  sources: Source[]
}

export interface Section {
  id: string
  title: string
  intro: string
  items: Item[]
}

export const REVIEWED_ON = "October 2026"

export const SECTIONS: Section[] = [
  {
    id: "learning",
    title: "Learning and parenting support",
    intro: "The approaches with the strongest evidence are about how children are taught and supported every day.",
    items: [
      {
        id: "structured-literacy",
        title: "Structured literacy (systematic phonics) for dyslexia",
        conditions: "Dyslexia, reading difficulties",
        rating: "strong",
        summary:
          "Explicit, step-by-step teaching of letter sounds and how they combine gives the largest reading gains. Programmes that work share the same pattern: short sessions of about 30 minutes, 3 to 5 times a week, kept up over months, by a trained teacher.",
        practical:
          "Ask the school for a structured phonics programme with frequent short sessions. Practice at home in short daily bursts works better than long, occasional sessions.",
        sources: [
          {
            label: "British Dyslexia Association: scoping review of dyslexia-friendly teaching",
            url: "https://cdn.bdadyslexia.org.uk/uploads/documents/Advice/Webinar-Training/Scoping_Review_of_the_Evidence_Base_for_Dyslexia-friendly_classroom_teaching.pdf?v=1554822879",
          },
        ],
      },
      {
        id: "parent-mediated-autism",
        title: "Parent-led early support for autism",
        conditions: "Autism",
        rating: "strong",
        summary:
          "Approaches where parents learn to build communication and play skills into everyday routines (known as naturalistic developmental behavioural interventions) are among the most effective, evidence-based supports for young autistic children. A network meta-analysis of 32 randomised trials compared them.",
        practical:
          "Look for parent coaching programmes. The WHO Caregiver Skills Training programme is free and has been run in Kenya, Ethiopia, Uganda, Zambia and Egypt.",
        sources: [
          {
            label: "Network meta-analysis of parent-mediated interventions (2024)",
            url: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC11044316/",
          },
          {
            label: "WHO Caregiver Skills Training in Ethiopia",
            url: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6927066/",
          },
        ],
      },
      {
        id: "adhd-parent-training",
        title: "Parent training for ADHD",
        conditions: "ADHD",
        rating: "strong",
        summary:
          "The UK's national clinical guideline (NICE NG87) recommends group parent-training programmes as the first treatment for children under 5 with ADHD, before any medication.",
        practical:
          "Group programmes teach consistent routines, clear instructions and praise. They also help parents feel less alone.",
        sources: [
          {
            label: "NHS trust summary of NICE NG87 ADHD treatment recommendations",
            url: "https://eput.nhs.uk/wp-content/uploads/2025/04/section-6-treatment-of-adhd-feb-2020.pdf",
          },
        ],
      },
    ],
  },
  {
    id: "body",
    title: "Exercise and sleep",
    intro: "Low-cost, everyday changes with good evidence behind them.",
    items: [
      {
        id: "exercise",
        title: "Regular physical exercise",
        conditions: "ADHD, autism",
        rating: "good",
        summary:
          "Many reviews find that exercise improves attention, self-control and working memory in children with ADHD, and social communication, executive function and motor skills in autistic children. Programmes lasting 10 weeks or more give the most consistent results.",
        practical:
          "Aim for active play or sport most days and keep it going for months. Games that need quick decisions (football, tag, skipping games) may help self-control; running, swimming and cycling may help working memory.",
        sources: [
          {
            label: "Exercise and autism: meta-analysis of randomised trials (2025)",
            url: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC11903732/",
          },
          {
            label: "Exercise and executive function in autism: three-level meta-analysis",
            url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC13430442/",
          },
          {
            label: "Exercise and ADHD: network meta-analysis of exercise types",
            url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC10080114/",
          },
          {
            label: "Seven meta-analyses on exercise and ADHD (ADHD Evidence)",
            url: "https://www.adhdevidence.org/blog/seven-new-meta-analyses-suggest-wide-range-of-benefits-from-exercise-for-persons-with-adhd",
          },
        ],
      },
      {
        id: "melatonin",
        title: "Melatonin for sleep problems",
        conditions: "Autism, ADHD",
        rating: "good",
        summary:
          "Melatonin helps many autistic children fall asleep faster, with few side effects in trials. Results for waking in the night are less consistent.",
        practical:
          "Start with a regular bedtime routine and less screen time before bed. Use melatonin only with a doctor's or pharmacist's advice on dose and timing. Store it out of reach: accidental overdoses in children have increased.",
        sources: [
          {
            label: "Melatonin for insomnia in autistic children: meta-analysis (2023)",
            url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC10166641/",
          },
          {
            label: "Melatonin in autism: meta-analysis (2011)",
            url: "https://pubmed.ncbi.nlm.nih.gov/21518346/",
          },
          {
            label: "Melatonin in autism and ADHD: review of randomised trials",
            url: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7325410/",
          },
        ],
      },
    ],
  },
  {
    id: "nutrition",
    title: "Nutrition and supplements",
    intro:
      "A balanced diet matters for every child, but no diet or supplement treats autism or ADHD on its own. Some can help a little; check with a health worker first, and don't stop prescribed medication.",
    items: [
      {
        id: "iron",
        title: "Iron, when levels are low",
        conditions: "ADHD",
        rating: "mixed",
        summary:
          "In small trials of children with ADHD and low iron, iron supplements showed moderate to large effects on hyperactivity, though the differences weren't statistically significant. The case for checking iron levels rests mainly on ADHD research.",
        practical:
          "Iron deficiency is common in many African countries. Ask for a ferritin (iron store) blood test before giving iron. Too much iron is harmful, so only supplement under a health worker's guidance.",
        sources: [
          {
            label: "Iron supplementation in neurodevelopmental disorders: meta-analysis",
            url: "https://psychiatryonline.org/doi/10.1176/appi.neuropsych.20230081",
          },
        ],
      },
      {
        id: "omega-3",
        title: "Omega-3 (fish oil)",
        conditions: "ADHD, autism",
        rating: "mixed",
        summary:
          "In ADHD, omega-3 has a small effect, about a third of the effect of medication. In autism, reviews disagree: some find no effect, others find small benefits for irritability, communication or hyperactivity.",
        practical:
          "Eating fish such as sardines or mackerel is a good food choice anyway. Supplements may help a little, but they aren't a replacement for other support.",
        sources: [
          {
            label: "Omega-3 and ADHD: meta-analysis summary (Carlat Report)",
            url: "https://www.thecarlatreport.com/the-carlat-child-psychiatry-report/are-omega-3s-effective-adhd",
          },
          {
            label: "Omega-3 in autism: updated meta-analysis (Nutrients)",
            url: "https://www.mdpi.com/2072-6643/18/17/2821",
          },
          {
            label: "Omega-3 in autism: meta-analysis (2025)",
            url: "https://www.sciencedirect.com/science/article/abs/pii/S3050656525001142",
          },
        ],
      },
      {
        id: "vitamin-d",
        title: "Vitamin D (alongside ADHD medication)",
        conditions: "ADHD",
        rating: "mixed",
        summary:
          "Added to ADHD medication, vitamin D gave a small improvement in ADHD scores across four trials, but the quality of evidence was low to very low.",
        practical: "Outdoor play gives sunlight and exercise together. Supplement only if a test shows low vitamin D.",
        sources: [
          {
            label: "Vitamin D for ADHD: meta-analysis of randomised trials",
            url: "https://pubmed.ncbi.nlm.nih.gov/31368773/",
          },
        ],
      },
      {
        id: "micronutrients",
        title: "Broad multivitamin and mineral formulas",
        conditions: "ADHD",
        rating: "mixed",
        summary:
          "Some trials of broad-spectrum vitamin and mineral formulas found improvements in mood regulation and irritability in children and adults with ADHD, with little effect on hyperactivity.",
        practical: "Formulas used in trials are specific and often costly. Discuss with a health worker before buying.",
        sources: [
          {
            label: "Nutrition in ADHD and neurodivergence: review",
            url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC12343232/",
          },
          {
            label: "MADDY trial protocol (micronutrients for ADHD)",
            url: "https://cdn.clinicaltrials.gov/large-docs/22/NCT03252522/Prot_SAP_001.pdf",
          },
        ],
      },
      {
        id: "elimination-diets",
        title: "Elimination diets for ADHD",
        conditions: "ADHD",
        rating: "mixed",
        summary:
          "A strict 'few-foods' diet produced large effects in some children, but it is very hard to follow and experts disagree on how strong the evidence is. The UK guideline advises against cutting out colourings and additives as a general treatment.",
        practical:
          "If you think certain foods affect behaviour, keep a food and behaviour diary first, and involve a dietitian before restricting your child's diet.",
        sources: [
          {
            label: "Diet and ADHD: review of meta-analyses (PLOS ONE, 2017)",
            url: "https://journals.plos.org/plosone/article?id=10.1371%2Fjournal.pone.0169277",
          },
          {
            label: "NHS trust summary of NICE NG87 (diet advice)",
            url: "https://eput.nhs.uk/wp-content/uploads/2025/04/section-6-treatment-of-adhd-feb-2020.pdf",
          },
        ],
      },
      {
        id: "gfcf",
        title: "Gluten-free and casein-free (dairy-free) diet for autism",
        conditions: "Autism",
        rating: "not-supported",
        summary:
          "Randomised trials show no clear benefit for core autism traits, and the diet can cause gut side effects. One review found possible benefits, but most of its studies weren't properly blinded.",
        practical:
          "Not recommended unless a doctor has diagnosed coeliac disease or a milk allergy. Restrictive diets can leave children short of nutrients.",
        sources: [
          {
            label: "Gluten- and casein-free diet in autism: meta-analysis (2021)",
            url: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7912271/",
          },
          {
            label: "Gluten- and casein-free diet in autism: systematic review (2018)",
            url: "https://pubmed.ncbi.nlm.nih.gov/28612113/",
          },
          {
            label: "Cochrane review: gluten- and casein-free diet for autism",
            url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC3540005/",
          },
        ],
      },
    ],
  },
  {
    id: "gut",
    title: "Gut health",
    intro: "Stomach problems are common in autistic children and deserve proper medical attention.",
    items: [
      {
        id: "gut-symptoms",
        title: "Probiotics and prebiotics for gut symptoms",
        conditions: "Autism",
        rating: "mixed",
        summary:
          "Across 19 trials, gut-focused treatments (mostly probiotics) eased stomach symptoms such as constipation and pain in autistic children.",
        practical:
          "Constipation and stomach pain can affect sleep and behaviour. See a health worker; fibre, water and activity are the first steps.",
        sources: [
          {
            label: "Gut microbiota interventions and GI symptoms in autism (Autism Research, 2025)",
            url: "https://onlinelibrary.wiley.com/doi/10.1002/aur.70091",
          },
        ],
      },
      {
        id: "gut-behaviour",
        title: "Probiotics or stool (faecal) transplants to change autism or ADHD",
        conditions: "Autism, ADHD",
        rating: "not-supported",
        summary:
          "For autism traits and behaviour, pooled trials show no reliable effect. Stool transplant studies are mostly unblinded, so their results can't be trusted yet.",
        practical: "Be wary of anyone selling gut treatments as an autism or ADHD cure.",
        sources: [
          {
            label: "Gut microbiota therapy for autism and ADHD: meta-analysis (2025)",
            url: "https://pubmed.ncbi.nlm.nih.gov/41037658/",
          },
          {
            label: "Gut microbiota interventions in autism (Nutrition Reviews, 2025)",
            url: "https://pubmed.ncbi.nlm.nih.gov/40298931/",
          },
          {
            label: "Interventions targeting the gut microbiota in autism (Gut Microbes, 2025)",
            url: "https://www.tandfonline.com/doi/full/10.1080/19490976.2025.2499580",
          },
        ],
      },
    ],
  },
  {
    id: "complementary",
    title: "Complementary and natural therapies",
    intro: "Some can be enjoyable and calming; few have strong evidence behind them.",
    items: [
      {
        id: "music-therapy",
        title: "Music therapy",
        conditions: "Autism",
        rating: "good",
        summary:
          "A 2022 Cochrane review found music therapy probably improves overall progress, reduces the severity of autism-related difficulties and improves quality of life, without extra side effects (moderate certainty).",
        practical: "Look for a trained music therapist. Singing, rhythm and music games at home are a good way to connect too.",
        sources: [
          {
            label: "Cochrane review: music therapy for autistic people (2022, abstract)",
            url: "https://cochranelibrary.com/cdsr/doi/10.1002/14651858.CD004381.pub4/pdf/CDSR/CD004381/CD004381_abstract.pdf",
          },
          {
            label: "GAMUT summary of the 2022 Cochrane update",
            url: "https://gamut.w.uib.no/?p=3627",
          },
        ],
      },
      {
        id: "yoga-mindfulness-acupuncture",
        title: "Yoga, mindfulness, massage and acupuncture",
        conditions: "Autism, ADHD",
        rating: "uncertain",
        summary:
          "Studies are small and low quality, so it's unclear whether these help with autism or ADHD themselves. Yoga and mindfulness may reduce anxiety.",
        practical: "Fine to try if your child enjoys them, but not instead of support that has evidence behind it.",
        sources: [
          {
            label: "US National Center for Complementary and Integrative Health: autism",
            url: "https://www.nccih.nih.gov/health/tips/things-to-know-about-complementary-health-approaches-for-asd",
          },
          {
            label: "Association for Science in Autism Treatment: complementary medicine",
            url: "https://asatonline.org/for-parents/becoming-a-savvy-consumer/complementary-alternative-medicine/",
          },
        ],
      },
    ],
  },
  {
    id: "dangerous",
    title: "Dangerous “cures” to avoid",
    intro:
      "Autism and ADHD are not diseases to be cured. These treatments are still promoted online and in messaging groups. They don't work and they can kill.",
    items: [
      {
        id: "mms",
        title: "MMS, CD or “Miracle Mineral Solution” (chlorine dioxide, a bleach)",
        conditions: "Sold as an autism cure",
        rating: "dangerous",
        summary:
          "Drinking it or giving it as an enema has caused severe vomiting and diarrhoea, life-threatening low blood pressure and acute liver failure. There is no evidence it helps autistic people.",
        practical: "Never give it. If a child has swallowed it, get medical help immediately.",
        sources: [
          {
            label: "NBC News: FDA warns drinking bleach will not cure autism",
            url: "https://www.nbcnews.com/health/health-news/drinking-bleach-will-not-cure-cancer-or-autism-fda-warns-n1041636",
          },
          {
            label: "Association for Science in Autism Treatment: bleach therapy",
            url: "https://asatonline.org/for-parents/learn-more-about-specific-treatments/bleach-therapy/",
          },
        ],
      },
      {
        id: "chelation",
        title: "Chelation (“detox” to remove metals)",
        conditions: "Sold as an autism cure",
        rating: "dangerous",
        summary:
          "There is no evidence it helps autistic people. A child died in 2005 when a chelating drug stopped their heart.",
        practical: "Avoid. Only used in hospitals for real, confirmed metal poisoning.",
        sources: [
          {
            label: "NCCIH: complementary approaches for autism",
            url: "https://www.nccih.nih.gov/health/tips/things-to-know-about-complementary-health-approaches-for-asd",
          },
          {
            label: "AMA Journal of Ethics: avoiding non-evidence-based autism treatments",
            url: "https://journalofethics.ama-assn.org/article/complementary-and-alternative-treatments-autism-part-2-identifying-and-avoiding-non-evidence-based/2015-04",
          },
        ],
      },
      {
        id: "hyperbaric",
        title: "Hyperbaric oxygen therapy",
        conditions: "Sold as an autism treatment",
        rating: "dangerous",
        summary: "There is no evidence it helps autistic people, and it carries risks. US regulators have warned against it for autism.",
        practical: "Avoid for autism. It's a real hospital treatment for other conditions, such as diving injuries.",
        sources: [
          {
            label: "NCCIH: complementary approaches for autism",
            url: "https://www.nccih.nih.gov/health/tips/things-to-know-about-complementary-health-approaches-for-asd",
          },
        ],
      },
    ],
  },
]
