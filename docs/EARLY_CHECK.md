# Early development check (12 to 36 months)

`/check` (`lib/early-check.ts`, `app/check/`). Free, no sign-in, no AI. Answers stay in the browser: nothing is sent to
ANDA or stored, because they are about young children.

## What it is, and isn't

A first step for families in Africa and the global south who are wondering about a young child. It ends in one of three
next steps, with no score or risk level:

| Result | When |
|---|---|
| **See a professional soon** | Any red flag: lost skills; no words at 16+ months; no two-word phrases at 24+ months; not responding to their name together with no pointing or showing |
| **A professional check is a good idea** | 3 or more concerns ("sometimes" counts as half), or not walking at 18+ months |
| **Check again in 3 months** | Otherwise; the page says a carer's own worry always outweighs a reassuring result |

Hearing and walking get their own advice. The result page is printable, to take to a clinic, and links to the directory,
the reviewed answers on assessment and early signs, and the CDC milestone checklists.

It is **not validated**. It must not be described as a screening instrument with known accuracy until a study is done.

## Sources and licences

| Source | How it is used |
|---|---|
| M-CHAT-R/F (Robins, Fein, Barton) | Reference for **which areas** early autism screening covers (shared attention, response to name, pointing, showing, pretend play, imitation, loss of skills). No item is copied or reworded. Its licence requires permission for commercial or digital use, translation or changed items ([mchatscreen.com](https://www.mchatscreen.com/)). A licensed, validated M-CHAT can be added later if permission is granted |
| Filipek et al., Neurology (2000); Hyman et al., AAP clinical report, Pediatrics (2020) | Red flags (no words by 16 months, no two-word phrases by 24 months, any loss of skills) and the weight given to a carer's concern |
| Lancet Commission on autism (2021); Franz et al., Autism Research (2017) | Late identification across sub-Saharan Africa; the case for a low-cost first step that leads to a professional |
| US CDC, Learn the Signs. Act Early. (public domain) | Linked from the result page for milestones across all areas |
| WHO GSED, MDAT, ASQ-3, SCQ, PEDS | Not used. Options for a validation study or a later licensed tool |

## Adapted for the context

- **Eye contact:** many children are taught not to look straight at elders. The question asks only about looking to
  share during play, and says so.
- **Local examples:** goats, birds, aeroplanes, motorbikes; carrying a "baby" on the back; cooking with an empty pot;
  generators and drums for sound sensitivity; sticks, bottles and cloth count as toys.
- **Many carers:** "Who is answering" includes grandparents, relatives, nannies and teachers; "Not sure" is allowed and
  the result tells them to ask someone who sees the child more.
- **Languages:** words count in any home language, and the question says that more than one language doesn't cause delay.
- **Low literacy and low bandwidth:** one short question per screen, large buttons, read aloud with the device's own
  voice (no download), no images, nothing to install.
- **Corrected age** for babies born more than 3 weeks early: the page tells carers to ask a health worker.

## Before calling it a screening tool: validation plan

1. Translate (forward and back) into priority languages, with native speakers; test that carers understand each question.
2. With a university or hospital partner, have carers of children aged 12 to 36 months complete the check, and have a
   blinded clinician assess every child flagged plus a sample of those not flagged.
3. Measure sensitivity, specificity and positive predictive value by country and language; adjust items and the
   threshold (`CONCERNS_FOR_CHECK`), then publish the method and results.
4. Until then, keep the wording "check" and "next steps", never "risk score" or "screening result".
