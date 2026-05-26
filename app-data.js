"use strict";

const STORAGE_KEY = "neuro-exam-state-v1";
const STATUSES = [
  { value: "normal", label: "Normal" },
  { value: "abnormal", label: "Abn" },
  { value: "deferred", label: "Defer" }
];
const STRENGTH_GRADES = ["0", "1", "2", "3", "4", "5", "deferred"];
const REFLEX_GRADES = ["0", "1+", "2+", "3+", "4+", "deferred"];
const PLANTAR_CHOICES = ["downgoing", "upgoing", "mute", "deferred"];
const CLONUS_CHOICES = ["absent", "present", "deferred"];

function item(id, label, normal, abnormal, deferred, defaultStatus = "normal") {
  return { id, label, normal, abnormal, deferred, defaultStatus };
}

function cnStep(id, title, nerve, normalSummary, items) {
  return {
    id,
    section: "Cranial Nerves",
    title,
    meta: nerve,
    deferredSummary: `${title} testing deferred.`,
    normalSummary,
    items
  };
}

const steps = [
  {
    id: "aao",
    section: "Mental",
    title: "AAO",
    deferredSummary: "AAO testing deferred.",
    normalSummary: "Alert and oriented to person, place, time, and situation (AAO x4).",
    items: [
      item("alert", "Alertness", "alert", "altered level of alertness", "alertness deferred"),
      item("person", "Person", "oriented to person", "disoriented to person", "orientation to person deferred"),
      item("place", "Place", "oriented to place", "disoriented to place", "orientation to place deferred"),
      item("time", "Time", "oriented to time", "disoriented to time", "orientation to time deferred"),
      item("situation", "Situation", "oriented to situation", "disoriented to situation", "orientation to situation deferred")
    ]
  },
  {
    id: "speech",
    section: "Mental",
    title: "Speech / Language",
    deferredSummary: "Speech and language testing deferred.",
    normalSummary: "Speech is fluent with intact comprehension, repetition, naming, reading, and writing; no dysarthria.",
    items: [
      item("fluency", "Fluency", "speech fluent", "nonfluent speech", "fluency deferred"),
      item("comprehension", "Comprehension", "comprehension intact", "impaired comprehension", "comprehension deferred"),
      item("repetition", "Repetition", "repetition intact", "impaired repetition", "repetition deferred"),
      item("naming", "Naming", "naming intact", "anomia", "naming deferred"),
      item("reading", "Reading", "reading intact", "alexia", "reading deferred"),
      item("writing", "Writing", "writing intact", "agraphia", "writing deferred"),
      item("dysarthria", "Dysarthria", "no dysarthria", "dysarthria present", "dysarthria assessment deferred")
    ],
    childrenFor: "dysarthria",
    children: [
      item("labial", "Labial /pa/", "labial articulation intact on /pa/", "impaired labial articulation on /pa/", "labial articulation deferred"),
      item("lingual", "Lingual /ta/", "lingual articulation intact on /ta/", "impaired lingual articulation on /ta/", "lingual articulation deferred"),
      item("guttural", "Guttural /ka/", "guttural articulation intact on /ka/", "impaired guttural articulation on /ka/", "guttural articulation deferred"),
      item("rapid", "Rapid alternating /pa-ta-ka/", "rapid alternating movements intact", "impaired rapid alternating movements (dysdiadochokinesis)", "rapid alternating movements deferred")
    ]
  },
  cnStep("cn1", "CN I", "Olfactory", "CN I: smell intact bilaterally.", [
    item("smell", "Smell", "smell intact bilaterally", "anosmia or hyposmia", "olfactory testing deferred")
  ]),
  cnStep("cn2", "CN II", "Optic", "CN II: visual fields full to confrontation; visual acuity grossly intact; no relative afferent pupillary defect (RAPD).", [
    item("fields", "Visual Fields", "visual fields full to confrontation", "visual field deficit", "visual field testing deferred"),
    item("acuity", "Visual Acuity", "visual acuity grossly intact", "decreased visual acuity", "visual acuity deferred"),
    item("rapd", "RAPD", "no relative afferent pupillary defect (RAPD)", "RAPD present", "RAPD testing deferred")
  ]),
  cnStep("cn3", "CN III", "Oculomotor", "CN III: pupils equal, round, and reactive to light (PERRL); accommodation intact; no ptosis.", [
    item("pupils", "Pupils", "pupils equal, round, and reactive to light (PERRL)", "abnormal pupillary response", "pupillary exam deferred"),
    item("accommodation", "Accommodation", "accommodation intact", "impaired accommodation", "accommodation deferred"),
    item("ptosis", "Ptosis", "no ptosis", "ptosis present", "ptosis assessment deferred")
  ]),
  cnStep("cn4", "CN IV", "Trochlear", "CN IV: superior oblique function grossly intact; no vertical diplopia.", [
    item("downin", "Down-and-in Gaze", "down-and-in gaze intact", "impaired down-and-in gaze", "trochlear testing deferred"),
    item("diplopia", "Vertical Diplopia", "no vertical diplopia", "vertical diplopia present", "diplopia assessment deferred")
  ]),
  cnStep("cn5", "CN V", "Trigeminal", "CN V: facial sensation intact in V1-V3 bilaterally; muscles of mastication 5/5.", [
    item("sensation", "V1-V3 Sensation", "facial sensation intact in V1-V3 bilaterally", "facial sensory deficit in V1-V3 distribution", "facial sensation deferred"),
    item("mastication", "Mastication", "masseter and temporalis strength 5/5", "weakness of muscles of mastication", "mastication strength deferred"),
    item("corneal", "Corneal Reflex", "corneal reflex intact", "abnormal corneal reflex", "corneal reflex deferred", "deferred")
  ]),
  cnStep("cn6", "CN VI", "Abducens", "CN VI: lateral gaze intact; extraocular movements intact (EOMI) without abduction deficit or nystagmus.", [
    item("abduction", "Abduction", "lateral gaze intact bilaterally", "abduction deficit", "abduction testing deferred"),
    item("nystagmus", "Nystagmus", "no nystagmus", "nystagmus present", "nystagmus assessment deferred")
  ]),
  cnStep("cn7", "CN VII", "Facial", "CN VII: facial movements symmetric; eye closure and smile intact bilaterally.", [
    item("forehead", "Forehead", "forehead raise symmetric", "asymmetric forehead activation", "forehead testing deferred"),
    item("eyeclose", "Eye Closure", "eye closure strength intact bilaterally", "weak eye closure", "eye closure deferred"),
    item("smile", "Smile", "smile symmetric", "facial droop or asymmetric smile", "smile assessment deferred")
  ]),
  cnStep("cn8", "CN VIII", "Vestibulocochlear", "CN VIII: hearing intact to finger rub bilaterally.", [
    item("hearing", "Hearing", "hearing intact to finger rub bilaterally", "decreased hearing", "hearing testing deferred"),
    item("vestibular", "Vestibular", "no spontaneous nystagmus or vertigo observed", "vestibular abnormality", "vestibular assessment deferred")
  ]),
  cnStep("cn9", "CN IX", "Glossopharyngeal", "CN IX: palate sensation/gag afferent grossly intact when tested; gag reflex deferred unless clinically indicated.", [
    item("palate_sensation", "Palate Sensation", "palate sensation grossly intact", "impaired palate sensation", "palate sensation deferred"),
    item("gag_afferent", "Gag Afferent", "gag afferent limb intact", "abnormal gag afferent limb", "gag reflex deferred", "deferred")
  ]),
  cnStep("cn10", "CN X", "Vagus", "CN X: palate elevates symmetrically, uvula midline, voice clear without dysphonia.", [
    item("palate", "Palate Elevation", "palate elevates symmetrically", "asymmetric palate elevation", "palate elevation deferred"),
    item("uvula", "Uvula", "uvula midline", "uvular deviation", "uvula assessment deferred"),
    item("voice", "Voice", "voice clear without dysphonia", "dysphonia or hoarseness", "voice assessment deferred")
  ]),
  cnStep("cn11", "CN XI", "Spinal Accessory", "CN XI: sternocleidomastoid and trapezius strength 5/5 bilaterally.", [
    item("scm", "SCM", "sternocleidomastoid strength 5/5 bilaterally", "sternocleidomastoid weakness", "SCM strength deferred"),
    item("trapezius", "Trapezius", "trapezius strength 5/5 bilaterally", "trapezius weakness", "trapezius strength deferred")
  ]),
  cnStep("cn12", "CN XII", "Hypoglossal", "CN XII: tongue protrudes midline without atrophy or fasciculations.", [
    item("tongue", "Tongue Midline", "tongue protrudes midline", "tongue deviation", "tongue protrusion deferred"),
    item("atrophy", "Atrophy", "no tongue atrophy", "tongue atrophy present", "tongue atrophy assessment deferred"),
    item("fasciculations", "Fasciculations", "no tongue fasciculations", "tongue fasciculations present", "tongue fasciculations deferred")
  ]),
  {
    id: "tone",
    section: "Motor",
    title: "Tone",
    deferredSummary: "Motor tone testing deferred.",
    normalSummary: "Tone is normal in all extremities.",
    items: [
      item("rue", "Right Upper Extremity", "normal tone in the right upper extremity", "abnormal tone in the right upper extremity", "right upper extremity tone deferred"),
      item("lue", "Left Upper Extremity", "normal tone in the left upper extremity", "abnormal tone in the left upper extremity", "left upper extremity tone deferred"),
      item("rle", "Right Lower Extremity", "normal tone in the right lower extremity", "abnormal tone in the right lower extremity", "right lower extremity tone deferred"),
      item("lle", "Left Lower Extremity", "normal tone in the left lower extremity", "abnormal tone in the left lower extremity", "left lower extremity tone deferred")
    ]
  },
  {
    id: "strength",
    section: "Motor",
    title: "Strength",
    type: "strength",
    deferredSummary: "Motor strength testing deferred."
  },
  {
    id: "sensory",
    section: "Sensory",
    title: "Sensation",
    deferredSummary: "Sensory testing deferred.",
    normalSummary: "Sensation is intact to light touch, pinprick/sharp, vibration, and pressure throughout.",
    items: [
      item("light_touch", "Light Touch", "sensation intact to light touch throughout", "decreased sensation to light touch", "light touch testing deferred"),
      item("sharp", "Sharp / Pinprick", "sensation intact to pinprick/sharp throughout", "decreased sensation to pinprick/sharp", "pinprick/sharp testing deferred"),
      item("vibration", "Vibration", "vibration sense intact", "decreased vibration sense", "vibration testing deferred"),
      item("pressure", "Pressure", "pressure sensation intact", "decreased pressure sensation", "pressure testing deferred")
    ]
  },
  {
    id: "reflexes",
    section: "Reflexes",
    title: "Reflexes",
    type: "reflexes",
    deferredSummary: "Reflex testing deferred."
  },
  {
    id: "cerebellar",
    section: "Cerebellar",
    title: "Coordination",
    deferredSummary: "Cerebellar testing deferred.",
    normalSummary: "No dysmetria on finger-to-nose or heel-to-shin testing; no dysdiadochokinesia.",
    items: [
      item("finger_nose", "Finger-to-Nose", "no dysmetria on finger-to-nose testing", "dysmetria on finger-to-nose testing", "finger-to-nose testing deferred"),
      item("heel_shin", "Heel-to-Shin", "no dysmetria on heel-to-shin testing", "dysmetria on heel-to-shin testing", "heel-to-shin testing deferred"),
      item("ram", "Rapid Alternating Movements", "rapid alternating movements intact", "dysdiadochokinesia", "rapid alternating movements deferred")
    ]
  },
  {
    id: "umn",
    section: "UMN",
    title: "Upper Motor Neuron Signs",
    deferredSummary: "Upper motor neuron sign testing deferred.",
    normalSummary: "No pronator drift; Hoffmann sign negative bilaterally.",
    items: [
      item("pronator", "Pronator Drift", "no pronator drift", "pronator drift present", "pronator drift testing deferred"),
      item("hoffmann", "Hoffmann", "Hoffmann sign negative bilaterally", "Hoffmann sign positive", "Hoffmann testing deferred")
    ]
  }
];

const LIMBS = [
  { id: "rue", label: "RUE", summary: "right upper extremity" },
  { id: "lue", label: "LUE", summary: "left upper extremity" },
  { id: "rle", label: "RLE", summary: "right lower extremity" },
  { id: "lle", label: "LLE", summary: "left lower extremity" }
];

const REFLEX_GROUPS = [
  { id: "biceps", label: "Biceps", root: "C5-C6" },
  { id: "brachioradialis", label: "Brachioradialis", root: "C5-C6" },
  { id: "triceps", label: "Triceps", root: "C7-C8" },
  { id: "patellar", label: "Patellar", root: "L3-L4" },
  { id: "achilles", label: "Achilles", root: "S1-S2" }
];

const sections = [...new Set(steps.map((step) => step.section))];
const app = document.querySelector("#app");
let state = null;
let toastTimer = null;
let connectionState = {
  online: navigator.onLine,
  offlineReady: false,
  installable: false
};
