import { memo, useCallback, useEffect, useMemo, useState } from "react";

const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === "undefined") return initialValue;
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`LocalStorage error for key ${key}:`, error);
      return initialValue;
    }
  });

  const setValue = useCallback(
    (valueOrUpdater) => {
      setStoredValue((prev) => {
        const value =
          typeof valueOrUpdater === "function"
            ? valueOrUpdater(prev)
            : valueOrUpdater;
        if (typeof window !== "undefined") {
          window.localStorage.setItem(key, JSON.stringify(value));
        }
        return value;
      });
    },
    [key],
  );

  return [storedValue, setValue];
};

const normalize = (text) =>
  String(text || "")
    .toLowerCase()
    .replace(/[.,!?;:]/g, "")
    .replace(/[\-–]/g, "")
    .replace(/'/g, "")
    .replace(/\s+/g, " ")
    .trim();

const fuzzyMatch = (user, expected, tolerance = 0.88) => {
  const userNorm = normalize(user);
  const expectedNorm = normalize(expected);
  if (!userNorm || !expectedNorm) return false;
  if (userNorm === expectedNorm) return true;
  const userWords = userNorm.split(" ");
  const expectedWords = expectedNorm.split(" ");
  const matchedWords = expectedWords.filter((word) => userWords.includes(word));
  return matchedWords.length / expectedWords.length >= tolerance;
};

const isAnswerCorrect = (user, expected, level) =>
  level === "band65" ? fuzzyMatch(user, expected, 0.82) : normalize(user) === normalize(expected);

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
};

const shuffleArray = (array) => {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const initialPracticeState = {
  p1Answers: {},
  p1Feedback: {},
  p1ReflectionAnswers: {},
  p1ReflectionFeedback: null,
  p1ReflectionChecked: false,
  p2ParagraphAnswers: Array(10).fill(""),
  p2ParagraphFeedback: [],
  p2CohesionAnswers: {},
  p2CohesionFeedback: {},
  p2LinkerJudgementAnswers: {},
  p2LinkerJudgementFeedback: null,
  p2LinkerJudgementChecked: false,
  p2LinkerJudgementHint: null,
  p3Writing: "",
  p3Submitted: false,
  p3Reflection: ["", "", ""],
};

const processData = {
  bamboo: {
    title: "Bamboo Fabric",
    task: "The diagram below shows how fabric is manufactured from bamboo.",
    image:
      "https://i0.wp.com/ieltspracticeonline.com/wp-content/uploads/2025/07/Writing-Task-1-BHow-fabric-is-manufactured-from-bamboo.png",
    video: "/videos/bamboo-fabric.mp4",
    steps: [
      ["People plant bamboo plants in spring.", "Bamboo plants are planted in spring.", "bamboo plants / plant / spring"],
      ["People harvest bamboo plants in autumn.", "Bamboo plants are harvested in autumn.", "bamboo plants / harvest / autumn"],
      ["A machine cuts bamboo plants into strips.", "Bamboo plants are cut into strips.", "bamboo plants / cut / strips"],
      ["A machine crushes the strips to make liquid pulp.", "The strips are crushed to make liquid pulp.", "strips / crush / liquid pulp"],
      ["A filter separates long fibres from the liquid.", "Long fibres are separated from the liquid by a filter.", "long fibres / separate / liquid / filter"],
      ["People add water and amine oxide to soften the fibres.", "Water and amine oxide are added to soften the fibres.", "water and amine oxide / add / soften fibres"],
      ["People spin fibres to make yarn.", "Fibres are spun to make yarn.", "fibres / spin / yarn"],
      ["People weave yarn to make fabric.", "Yarn is woven to make fabric.", "yarn / weave / fabric"],
      ["People use fabric to make clothes.", "Fabric is used to make clothes.", "fabric / use / clothes"],
    ],
    band65: [
      ["Bamboo plants are planted in spring.", "Replace 'planted' with a more formal verb.", "Bamboo plants are cultivated in spring."],
      ["Bamboo is harvested in autumn.", "Add how the harvesting is shown in the diagram.", "Bamboo is harvested manually in autumn."],
      ["Bamboo is cut into strips.", "Add an adverb to show machine processing and describe the strips as narrow.", "Bamboo is mechanically cut into narrow strips."],
      ["The strips are crushed.", "Use ', doing sth' to show the result of the action.", "The strips are crushed, producing liquid pulp."],
      ["The liquid pulp passes through a filter.", "Use a which-clause to explain the function of the filter.", "The liquid pulp passes through a filter, which extracts long fibres from the remaining liquid."],
      ["Fabric is made into clothes.", "Use 'finished fabric' and add examples from the diagram.", "The finished fabric is made into clothing items such as T-shirts and socks."],
    ],
    p2Band55: {
      text: [[0, ", bamboo plants are planted in spring. Bamboo plants are "], [1, " harvested in autumn. "], [2, " that, bamboo plants are cut into strips. "], [3, " is to crush the strips to make liquid pulp. "], [4, ", long fibres are separated from the liquid by a filter. In the "], [5, " stage, water and amine oxide are added to soften the fibres. The fibres are "], [6, " spun to make yarn. "], [7, ", yarn is woven to make fabric."]],
      answers: ["First", "then", "After", "The following stage", "Next", "next", "then", "Finally"],
    },
  },
  sugar: {
    title: "Sugar Canes",
    task: "The diagram below shows how sugar is produced from sugar canes.",
    image:
      "https://daxue-oss.koocdn.com/upload/ti/sardine/2521000-2522000/2521817/3395c3236ee34b9089e15f2ce4dfc9a9.png",
    video: "/videos/sugar-canes.mp4",
    steps: [
      ["Farmers grow sugar canes for 12-18 months.", "Sugar canes are grown for 12-18 months.", "sugar canes / grow / 12-18 months"],
      ["Workers or machines harvest the sugar canes.", "The sugar canes are harvested by workers or machines.", "sugar canes / harvest / workers or machines"],
      ["Machines crush the sugar canes to make juice.", "The sugar canes are crushed to make juice.", "sugar canes / crush / juice"],
      ["A limestone filter purifies the juice.", "The juice is purified by a limestone filter.", "juice / purify / limestone filter"],
      ["An evaporator turns the juice into syrup.", "The juice is turned into syrup by an evaporator.", "juice / turn / syrup / evaporator"],
      ["A centrifuge separates sugar crystals from the syrup.", "Sugar crystals are separated from the syrup by a centrifuge.", "sugar crystals / separate / syrup / centrifuge"],
      ["A machine dries and cools the sugar.", "The sugar is dried and cooled by a machine.", "sugar / dry and cool / machine"],
    ],
    band65: [
      ["Sugar canes are grown for 12-18 months.", "Replace 'grown' with a more formal verb.", "Sugar canes are cultivated for 12-18 months."],
      ["Sugar canes are harvested by workers or machines.", "Use 'either...or...' and add the adverbs 'manually' and 'mechanically'.", "Sugar canes are harvested either manually by workers or mechanically by machines."],
      ["The sugar canes are crushed.", "Use ', doing sth' to show the result of the action.", "The sugar canes are crushed, producing juice."],
      ["The juice passes through a limestone filter.", "Use 'in order to' to explain the purpose of filtering.", "The juice passes through a limestone filter in order to remove impurities."],
      ["The syrup is placed in a centrifuge.", "Use a which-clause to explain the function of the centrifuge.", "The syrup is placed in a centrifuge, which separates sugar crystals from the remaining liquid."],
      ["The sugar is dried and cooled.", "Add the detail about where this happens.", "The sugar is dried and cooled in a large container."],
    ],
    p2Band55: {
      text: [[0, ", sugar canes are grown for 12-18 months. The sugar canes are "], [1, " harvested by workers or machines. "], [2, " that, the sugar canes are crushed to make juice. "], [3, ", the juice is purified by a limestone filter. In the "], [4, " stage, the juice is turned into syrup by an evaporator. "], [5, " is to separate sugar crystals from the syrup by a centrifuge. "], [6, ", the sugar is dried and cooled by a machine."]],
      answers: ["First", "then", "After", "Next", "next", "The following stage", "Finally"],
    },
  },
  noodles: {
    title: "Instant Noodles",
    task: "The diagram below shows the manufacturing process for instant noodles.",
    image:
      "https://daxue-oss.koocdn.com/upload/ti/sardine/2493000-2494000/2493115/259d8b9f612e40819d37e0fb928b572f.png",
    video: "/videos/instant-noodles.mp4",
    steps: [
      ["A truck transports flour from storage silos.", "Flour is transported from storage silos by truck.", "flour / transport / storage silos / truck"],
      ["Workers mix flour with water and oil in a mixer.", "Flour is mixed with water and oil in a mixer.", "flour / mix / water and oil / mixer"],
      ["Rollers press the dough into sheets.", "The dough is pressed into sheets by rollers.", "dough / press / sheets / rollers"],
      ["Machines cut the dough sheets into strips.", "The dough sheets are cut into strips.", "dough sheets / cut / strips"],
      ["Machines make the dough strips into noodle discs.", "The dough strips are made into noodle discs.", "dough strips / make / noodle discs"],
      ["Machines cook the noodle discs in oil and dry them.", "The noodle discs are cooked in oil and then dried.", "noodle discs / cook / oil / dry"],
      ["Machines put noodle discs, vegetables and spices into cups.", "The noodle discs, vegetables and spices are put into cups.", "noodle discs vegetables spices / put / cups"],
      ["Machines label and seal the cups.", "The cups are labelled and sealed.", "cups / label and seal"],
    ],
    band65: [
      ["Flour is transported from storage silos by truck.", "Add the destination shown in the diagram.", "Flour is transported from storage silos to the production line by truck."],
      ["Flour is mixed with water and oil in a mixer.", "Use 'in order to' to explain the purpose of mixing.", "Flour is mixed with water and oil in a mixer in order to form dough."],
      ["The dough is pressed into sheets by rollers.", "Use 'pass through' and a which-clause to explain the function of the rollers.", "The dough passes through rollers, which press it into sheets."],
      ["The dough sheets are cut into strips.", "Replace 'cut' with a more precise verb.", "The dough sheets are sliced into strips."],
      ["The dough strips are shaped.", "Use ', doing sth' to show the result of the action.", "The dough strips are shaped, producing noodle discs."],
      ["The noodle discs, vegetables and spices are put into cups.", "Replace 'put' with a more natural verb and use 'together with'.", "The noodle discs are placed into cups together with vegetables and spices."],
    ],
    p2Band55: {
      text: [[0, ", flour is transported from storage silos by truck. Flour is "], [1, " mixed with water and oil in a mixer. "], [2, ", the dough is pressed into sheets by rollers. "], [3, " that, the dough sheets are cut into strips. "], [4, " is to make the dough strips into noodle discs. In the "], [5, " stage, the noodle discs are cooked in oil and then dried. The noodle discs, vegetables and spices are "], [6, " put into cups. "], [7, ", the cups are labelled and sealed."]],
      answers: ["First", "then", "Next", "After", "The following stage", "next", "then", "Finally"],
    },
  },
  recycling: {
    title: "Plastic Bottle Recycling",
    task: "The diagram below shows the process for recycling plastic bottles.",
    image: "https://images.writing9.com/646839d3f987923ffa686b743b1950f9.png",
    video: "/videos/plastic-bottle-recycling.mp4",
    steps: [
      ["People put plastic bottles in recycling bins.", "Plastic bottles are placed in recycling bins.", "plastic bottles / place / recycling bins"],
      ["A truck collects and transports plastic bottles.", "Plastic bottles are collected and transported by truck.", "plastic bottles / collect and transport / truck"],
      ["Workers sort plastic bottles in a recycling centre.", "Plastic bottles are sorted in a recycling centre.", "plastic bottles / sort / recycling centre"],
      ["Machines compress plastic bottles into blocks.", "Plastic bottles are compressed into blocks.", "plastic bottles / compress / blocks"],
      ["Machines crush the blocks and wash the pieces.", "The blocks are crushed and the pieces are washed.", "blocks / crush / pieces / wash"],
      ["Machines produce plastic pellets.", "Plastic pellets are produced.", "plastic pellets / produce"],
      ["People heat the pellets to form raw material.", "The pellets are heated to form raw material.", "pellets / heat / raw material"],
      ["People pack the raw material.", "The raw material is packed.", "raw material / pack"],
      ["Factories produce end products.", "End products are produced.", "end products / produce"],
    ],
    band65: [
      ["Plastic bottles are put in recycling bins.", "Replace 'put' with a more natural verb.", "Plastic bottles are placed in recycling bins."],
      ["Plastic bottles are collected by a collection truck.", "Use a which-clause to show the truck's function.", "Plastic bottles are collected by a collection truck, which transports them to a recycling centre."],
      ["Plastic bottles are sorted in a recycling centre.", "Use 'conveyor belt', 'manually' and 'recyclable'.", "In a recycling centre, recyclable bottles are manually sorted on a conveyor belt."],
      ["The blocks are crushed into small pieces.", "Use 'pass through' and add the machine detail from the diagram.", "The blocks pass through a grinder and are crushed into small pieces."],
      ["The small pieces are washed.", "Add the purpose of washing.", "The small pieces are washed to remove dirt and impurities."],
      ["The cleaned pieces are processed.", "Use ', doing sth' to show the result of the action.", "The cleaned pieces are processed, producing plastic pellets."],
      ["The pellets are heated to form raw material.", "Replace 'form' with a more formal verb.", "The pellets are heated and converted into raw material."],
      ["End products are produced.", "Use 'end products, including...' and include examples from the diagram.", "End products, including T-shirts, bags, pencils and containers, are produced."],
    ],
    p2Band55: {
      text: [[0, ", plastic bottles are placed in recycling bins. "], [1, " that, the plastic bottles are collected and transported by truck. "], [2, " is to sort the plastic bottles in a recycling centre. "], [3, ", the plastic bottles are compressed into blocks. The blocks are "], [4, " crushed and the pieces are washed. In the "], [5, " stage, plastic pellets are produced. The pellets are "], [6, " heated to form raw material. "], [7, ", end products are produced."]],
      answers: ["First", "After", "The following stage", "Next", "then", "next", "then", "Finally"],
    },
  },
};

Object.entries(processData).forEach(([key, item]) => {
  item.steps = item.steps.map(([active, passive, prompt6]) => ({ active, passive, prompt6 }));
  item.band65 = item.band65.map(([prompt, task, answer]) => ({ prompt, task, answer }));
});

const band55PassiveCorrectionTasks = {
  bamboo: [
    {
      prompt: "Bamboo plants planted in spring.",
      answer: "Bamboo plants are planted in spring.",
      instruction: "Correct the passive sentence.",
    },
    {
      prompt: "Bamboo plants were harvested in autumn.",
      answer: "Bamboo plants are harvested in autumn.",
      instruction: "Correct the passive sentence.",
    },
    {
      prompt: "Bamboo plants is cut to make narrow strips.",
      answer: "Bamboo plants are cut to make narrow strips.",
      instruction: "Correct the passive sentence.",
    },
  ],
  sugar: [
    {
      prompt: "Sugar canes is grown for 12-18 months.",
      answer: "Sugar canes are grown for 12-18 months.",
      instruction: "Correct the passive sentence.",
    },
    {
      prompt: "The sugar canes harvested by workers or machines.",
      answer: "The sugar canes are harvested by workers or machines.",
      instruction: "Correct the passive sentence.",
    },
    {
      prompt: "The sugar canes were crushed to make juice.",
      answer: "The sugar canes are crushed to make juice.",
      instruction: "Correct the passive sentence.",
    },
  ],
  noodles: [
    {
      prompt: "Flour mixed with water and oil in a mixer.",
      answer: "Flour is mixed with water and oil in a mixer.",
      instruction: "Correct the passive sentence.",
    },
    {
      prompt: "The dough is press into sheets by rollers.",
      answer: "The dough is pressed into sheets by rollers.",
      instruction: "Correct the passive sentence.",
    },
    {
      prompt: "Water and oil was mixed with flour in a mixer.",
      answer: "Water and oil are mixed with flour in a mixer.",
      instruction: "Correct the passive sentence.",
    },
  ],
  recycling: [
    {
      prompt: "Plastic bottles were placed in recycling bins.",
      answer: "Plastic bottles are placed in recycling bins.",
      instruction: "Correct the passive sentence.",
    },
    {
      prompt: "Plastic bottles are place in recycling bins.",
      answer: "Plastic bottles are placed in recycling bins.",
      instruction: "Correct the passive sentence.",
    },
    {
      prompt: "Plastic bottles is sorted in a recycling centre.",
      answer: "Plastic bottles are sorted in a recycling centre.",
      instruction: "Correct the passive sentence.",
    },
  ],
};

const band6ProcessCorrectionTasks = {
  bamboo: [
    {
      prompt: "Bamboo plants are cutted to make narrow strips.",
      answer: "Bamboo plants are cut to make narrow strips.",
      instruction: "Correct the process sentence.",
    },
    {
      prompt: "Bamboo plants are harvested in autumn by worker.",
      answer: "Bamboo plants are harvested by workers in autumn.",
      instruction: "Correct the process sentence.",
    },
    {
      prompt: "The plants are cut and crushing to make narrow strips.",
      answer: "The plants are cut and crushed to make narrow strips.",
      instruction: "Correct the process sentence.",
    },
  ],
  sugar: [
    {
      prompt: "Sugar canes are grown for 12-18 month.",
      answer: "Sugar canes are grown for 12-18 months.",
      instruction: "Correct the process sentence.",
    },
    {
      prompt: "The sugar canes are harvested by worker or machine.",
      answer: "The sugar canes are harvested by workers or machines.",
      instruction: "Correct the process sentence.",
    },
    {
      prompt: "The sugar canes are crushed make juice.",
      answer: "The sugar canes are crushed to make juice.",
      instruction: "Correct the process sentence.",
    },
  ],
  noodles: [
    {
      prompt: "Flour is transported from storage silos by a truck.",
      answer: "Flour is transported from storage silos by truck.",
      instruction: "Correct the process sentence.",
    },
    {
      prompt: "Flour is mixed water and oil in a mixer to form dough.",
      answer: "Flour is mixed with water and oil in a mixer to form dough.",
      instruction: "Correct the process sentence.",
    },
    {
      prompt: "The dough is pressd by rollers to form sheets.",
      answer: "The dough is pressed by rollers to form sheets.",
      instruction: "Correct the process sentence.",
    },
  ],
  recycling: [
    {
      prompt: "Plastic bottles are placed in recycling bin.",
      answer: "Plastic bottles are placed in recycling bins.",
      instruction: "Correct the process sentence.",
    },
    {
      prompt: "Plastic bottles are collected and transport by truck.",
      answer: "Plastic bottles are collected and transported by truck.",
      instruction: "Correct the process sentence.",
    },
    {
      prompt: "Plastic bottle are sorted in a recycling centre.",
      answer: "Plastic bottles are sorted in a recycling centre.",
      instruction: "Correct the process sentence.",
    },
  ],
};

const sentenceUpgradeReflectionOptions = [
  ["relativeClause", 'Use a relative clause, such as "which..." or "where...".', true],
  ["purposePhrase", 'Use a purpose phrase, such as "in order to...".', true],
  ["participleResult", 'Use ", doing sth" to show the result of an action.', true],
  ["diagramDetails", "Add useful diagram details, such as tools, machines, materials, locations or final examples.", true],
  ["preciseWords", "Replace basic words with more precise words.", true],
  ["personalOpinions", "Add personal opinions about whether the process is good or bad.", false],
  ["inventSteps", "Invent extra steps that are not shown in the diagram.", false],
  ["complicatedWords", "Use complicated words even if they do not fit the diagram.", false],
].map(([id, text, correct]) => ({ id, text, correct }));

const band55LinkerJudgementTasks = {
  bamboo: [
    ["bambooThenMiddle", "The fibres are then spun to make yarn.", true, "'Then' can be used in the middle of a passive sentence, usually after the be-verb."],
    ["bambooAfterThat", "After, bamboo plants are cut into strips.", false, "Use 'After that,' to connect the next step. Do not use 'After,' alone here."],
    ["bambooFollowingStage", "The following stage is to crush the strips.", true, "After 'is to', use the base form of a verb, such as 'crush'."],
  ],
  sugar: [
    ["sugarThenBeginning", "Then, the sugar canes are harvested.", true, "'Then' can be used at the beginning of a sentence to show the next step."],
    ["sugarInNextStage", "In the next stage, the juice is turned into syrup.", true, "After 'In the next stage,', use a complete sentence."],
    ["sugarIsToWrongForm", "The following stage is to separated sugar crystals.", false, "After 'is to', use the base verb. Use 'separate', not 'separated'."],
  ],
  noodles: [
    ["noodlesThenBeginning", "Then, the dough is pressed into sheets.", true, "'Then' can be placed at the beginning of a sentence."],
    ["noodlesAfterThatComplete", "After that, the dough sheets are cut into strips.", true, "'After that,' is a complete linker for moving to the next step."],
    ["noodlesInNextStageWrong", "In the next stage is to make the dough strips into noodle discs.", false, "Do not mix 'In the next stage, ...' and 'The next stage is to...'."],
  ],
  recycling: [
    ["recyclingNextStageComplete", "In the next stage, plastic pellets are produced.", true, "'In the next stage,' should be followed by a complete sentence."],
    ["recyclingNextStageIsTo", "The next stage is to heat the pellets.", true, "'The next stage is to + base verb' is correct."],
    ["recyclingAfterWrong", "After, the plastic bottles are compressed into blocks.", false, "Use 'After that,' instead of 'After,' when linking to the next step."],
  ],
};

Object.keys(band55LinkerJudgementTasks).forEach((key) => {
  band55LinkerJudgementTasks[key] = band55LinkerJudgementTasks[key].map(([id, statement, answer, hint]) => ({
    id,
    statement,
    answer,
    hint,
  }));
});

const p2Band6Tasks = {
  bamboo: [
    {
      type: "fill",
      sentence: "In the i______ stage, bamboo plants are planted in spring.",
      answer: "initial",
    },
    {
      type: "fill",
      sentence: "Bamboo plants are t______ harvested in autumn.",
      answer: "then",
    },
    {
      type: "fill",
      sentence: "A______ that, bamboo plants are cut into strips.",
      answer: "After",
    },
    {
      type: "fill",
      sentence: "The f______ stage is to crush the strips to make liquid pulp.",
      answer: "following",
    },
    {
      type: "fill",
      sentence:
        "A__________, long fibres are separated from the liquid by a filter.",
      answer: "Afterwards",
    },
    {
      type: "fill",
      sentence:
        "S__________, water and amine oxide are added to soften the fibres.",
      answer: "Subsequently",
    },
    {
      type: "choice",
      prompt: "Which pronoun should replace 'Bamboo plants'?",
      parts: [
        "Bamboo plants are planted in spring.",
        "Bamboo plants are harvested in autumn.",
      ],
      options: ["it", "they", "them"],
      answer: "they",
    },
    {
      type: "choice",
      prompt: "Can these two steps be combined using 'after being done'?",
      parts: [
        "The strips are crushed to make liquid pulp.",
        "Long fibres are separated from the liquid by a filter.",
      ],
      options: [
        "Yes, because the subject is the same.",
        "No, because the subject changes from strips to long fibres.",
      ],
      answer: "No, because the subject changes from strips to long fibres.",
    },
    {
      type: "combine",
      prompt: "Combine using 'and then'. Use a pronoun to avoid repetition.",
      parts: [
        "Bamboo plants are harvested in autumn.",
        "Bamboo plants are cut into strips.",
      ],
      answer:
        "Bamboo plants are harvested in autumn, and then they are cut into strips.",
    },
    {
      type: "combine",
      prompt: "Combine using 'before being done'.",
      parts: ["The fibres are softened.", "The fibres are spun to make yarn."],
      answer: "The fibres are softened before being spun to make yarn.",
    },
    {
      type: "combine",
      prompt: "Combine using 'after being done'.",
      parts: [
        "Yarn is woven into fabric.",
        "The fabric is used to make clothes.",
      ],
      answer:
        "The fabric is used to make clothes after being woven from yarn.",
    },
  ],
  sugar: [
    {
      type: "fill",
      sentence:
        "In the i______ stage, sugar canes are grown for 12-18 months.",
      answer: "initial",
    },
    {
      type: "fill",
      sentence:
        "The sugar canes are t______ harvested by workers or machines.",
      answer: "then",
    },
    {
      type: "fill",
      sentence: "A______ that, the sugar canes are crushed to make juice.",
      answer: "After",
    },
    {
      type: "fill",
      sentence:
        "A__________, the juice is purified by a limestone filter.",
      answer: "Afterwards",
    },
    {
      type: "fill",
      sentence:
        "In the n______ stage, the juice is turned into syrup by an evaporator.",
      answer: "next",
    },
    {
      type: "fill",
      sentence:
        "The f______ stage is to separate sugar crystals from the syrup by a centrifuge.",
      answer: "following",
    },
    {
      type: "choice",
      prompt: "Which pronoun should replace 'Sugar canes'?",
      parts: [
        "Sugar canes are grown for 12-18 months.",
        "Sugar canes are harvested by workers or machines.",
      ],
      options: ["it", "they", "them"],
      answer: "they",
    },
    {
      type: "choice",
      prompt:
        "Complete the sentence with 'before being' or 'after being'. Do not change the sentence order.",
      parts: [
        "Sugar canes are grown for 12-18 months _____ harvested by workers or machines.",
      ],
      options: ["before being", "after being"],
      answer: "before being",
    },
    {
      type: "combine",
      prompt: "Combine using 'and then'. Use a pronoun to avoid repetition.",
      parts: [
        "Sugar canes are harvested by workers or machines.",
        "Sugar canes are crushed to make juice.",
      ],
      answer:
        "Sugar canes are harvested by workers or machines, and then they are crushed to make juice.",
    },
    {
      type: "combine",
      prompt: "Combine using 'before being done'.",
      parts: [
        "The juice is purified by a limestone filter.",
        "The juice is turned into syrup by an evaporator.",
      ],
      answer:
        "The juice is purified by a limestone filter before being turned into syrup by an evaporator.",
    },
    {
      type: "combine",
      prompt: "Combine using 'after being done'.",
      parts: [
        "Sugar crystals are separated from the syrup by a centrifuge.",
        "Sugar crystals are dried and cooled by a machine.",
      ],
      answer:
        "Sugar crystals are dried and cooled by a machine after being separated from the syrup by a centrifuge.",
    },
  ],
  noodles: [
    {
      type: "fill",
      sentence:
        "In the i______ stage, flour is transported from storage silos by truck.",
      answer: "initial",
    },
    {
      type: "fill",
      sentence: "Flour is t______ mixed with water and oil in a mixer.",
      answer: "then",
    },
    {
      type: "fill",
      sentence: "N______, the dough is pressed into sheets by rollers.",
      answer: "Next",
    },
    {
      type: "fill",
      sentence: "A______ that, the dough sheets are cut into strips.",
      answer: "After",
    },
    {
      type: "fill",
      sentence:
        "The f______ stage is to make the dough strips into noodle discs.",
      answer: "following",
    },
    {
      type: "fill",
      sentence: "S__________, the noodle discs are cooked in oil and dried.",
      answer: "Subsequently",
    },
    {
      type: "choice",
      prompt: "Which pronoun should replace 'The cups'?",
      parts: ["The cups are labelled.", "The cups are sealed."],
      options: ["it", "they", "them"],
      answer: "they",
    },
    {
      type: "choice",
      prompt: "Can these two steps be combined using 'after being done'?",
      parts: [
        "The dough sheets are cut into strips.",
        "The dough strips are made into noodle discs.",
      ],
      options: [
        "Yes, because the subject is exactly the same.",
        "No, because the subject changes from dough sheets to dough strips.",
      ],
      answer:
        "No, because the subject changes from dough sheets to dough strips.",
    },
    {
      type: "combine",
      prompt: "Combine using 'and then'. Use a pronoun to avoid repetition.",
      parts: [
        "Flour is transported from storage silos by truck.",
        "Flour is mixed with water and oil in a mixer.",
      ],
      answer:
        "Flour is transported from storage silos by truck, and then it is mixed with water and oil in a mixer.",
    },
    {
      type: "combine",
      prompt: "Combine using 'after being done'.",
      parts: [
        "Flour is transported from storage silos by truck.",
        "Flour is mixed with water and oil in a mixer.",
      ],
      answer:
        "Flour is mixed with water and oil in a mixer after being transported from storage silos by truck.",
    },
    {
      type: "combine",
      prompt: "Combine using 'before being done'.",
      parts: [
        "The noodle discs are cooked in oil.",
        "The noodle discs are dried.",
      ],
      answer: "The noodle discs are cooked in oil before being dried.",
    },
  ],
  recycling: [
    {
      type: "fill",
      sentence: "F______, plastic bottles are placed in recycling bins.",
      answer: "First",
    },
    {
      type: "fill",
      sentence:
        "A______ that, plastic bottles are collected and transported by truck.",
      answer: "After",
    },
    {
      type: "fill",
      sentence:
        "The f______ stage is to sort the plastic bottles in a recycling centre.",
      answer: "following",
    },
    {
      type: "fill",
      sentence: "N______, plastic bottles are compressed into blocks.",
      answer: "Next",
    },
    {
      type: "fill",
      sentence: "The blocks are t______ crushed and the pieces are washed.",
      answer: "then",
    },
    {
      type: "fill",
      sentence: "In the n______ stage, plastic pellets are produced.",
      answer: "next",
    },
    {
      type: "choice",
      prompt: "Which pronoun should replace 'The blocks'?",
      parts: ["The blocks are crushed.", "The blocks are washed."],
      options: ["it", "they", "them"],
      answer: "they",
    },
    {
      type: "choice",
      prompt:
        "Complete the sentence with 'before being' or 'after being'. Do not change the sentence order.",
      parts: [
        "Plastic bottles are sorted in a recycling centre _____ compressed into blocks.",
      ],
      options: ["before being", "after being"],
      answer: "before being",
    },
    {
      type: "combine",
      prompt: "Combine using 'and then'. Use a pronoun to avoid repetition.",
      parts: [
        "Plastic bottles are placed in recycling bins.",
        "Plastic bottles are collected and transported by truck.",
      ],
      answer:
        "Plastic bottles are placed in recycling bins, and then they are collected and transported by truck.",
    },
    {
      type: "combine",
      prompt: "Combine using 'before being done'.",
      parts: [
        "Plastic pellets are produced.",
        "Plastic pellets are heated to form raw material.",
      ],
      answer:
        "Plastic pellets are produced before being heated to form raw material.",
    },
    {
      type: "combine",
      prompt: "Combine using 'after being done'.",
      parts: [
        "The raw material is packed.",
        "The raw material is used to produce end products.",
      ],
      answer:
        "The raw material is used to produce end products after being packed.",
    },
  ],
};

const p2Band65Tasks = {
  bamboo: [
    {
      type: "correction",
      prompt: "Correct the 'Once ... has/have been done' error.",
      sentence:
        "Once the strips have crushed into liquid pulp, the pulp passes through a filter.",
      answer:
        "Once the strips have been crushed into liquid pulp, the pulp passes through a filter.",
    },
    {
      type: "correction",
      prompt: "Correct the cohesive device error.",
      sentence:
        "The fibres are softened with water and amine oxide, which they are spun into yarn.",
      answer:
        "The fibres are softened with water and amine oxide, after which they are spun into yarn.",
    },
    {
      type: "correction",
      prompt: "Correct the singular/plural reference error.",
      sentence:
        "Fibres are spun into yarn, which are then woven into bamboo fabric.",
      answer:
        "Fibres are spun into yarn, which is then woven into bamboo fabric.",
    },
    {
      type: "correction",
      prompt: "Correct the 'followed by' structure.",
      sentence:
        "The softened fibres are spun into yarn, followed by the yarn is woven into fabric.",
      answer:
        "The softened fibres are spun into yarn, followed by the weaving of this yarn into fabric.",
    },
    {
      type: "combine",
      prompt: "Use 'Once ... has/have been done, ...' to connect two steps.",
      parts: [
        "Bamboo is harvested manually in autumn.",
        "It is mechanically cut into narrow strips.",
      ],
      answer:
        "Once the bamboo has been harvested manually in autumn, it is mechanically cut into narrow strips.",
    },
    {
      type: "combine",
      prompt: "Combine using 'before being done'.",
      parts: ["The fibres are softened.", "They are spun into yarn."],
      answer: "The fibres are softened before being spun into yarn.",
    },
    {
      type: "combine",
      prompt: "Combine using 'after which'.",
      parts: [
        "Bamboo is mechanically cut into narrow strips.",
        "The strips are crushed into liquid pulp.",
      ],
      answer:
        "Bamboo is mechanically cut into narrow strips, after which the strips are crushed into liquid pulp.",
    },
    {
      type: "combine",
      prompt: "Combine using 'which are then done'.",
      parts: [
        "Long fibres are extracted by a filter.",
        "They are softened with water and amine oxide.",
      ],
      answer:
        "Long fibres are extracted by a filter, which are then softened with water and amine oxide.",
    },
    {
      type: "combine",
      prompt: "Combine using 'followed by + noun phrase'.",
      parts: [
        "Bamboo plants are cultivated in spring.",
        "The manual harvesting of bamboo in autumn.",
      ],
      answer:
        "Bamboo plants are cultivated in spring, followed by the manual harvesting of bamboo in autumn.",
    },
  ],
  sugar: [
    {
      type: "correction",
      prompt: "Correct the 'Once ... has/have been done' error.",
      sentence:
        "Once the sugar canes has been harvested, they are crushed to produce juice.",
      answer:
        "Once the sugar canes have been harvested, they are crushed to produce juice.",
    },
    {
      type: "correction",
      prompt: "Correct the singular/plural reference error.",
      sentence:
        "The juice is turned into syrup, which are then placed in a centrifuge.",
      answer:
        "The juice is turned into syrup, which is then placed in a centrifuge.",
    },
    {
      type: "correction",
      prompt: "Correct the 'followed by' structure.",
      sentence:
        "The juice is turned into syrup, followed by sugar crystals are separated in a centrifuge.",
      answer:
        "The juice is turned into syrup, followed by the separation of sugar crystals in a centrifuge.",
    },
    {
      type: "correction",
      prompt: "Correct the 'after which' clause.",
      sentence:
        "The syrup is placed in a centrifuge, after which are separated sugar crystals.",
      answer:
        "The syrup is placed in a centrifuge, after which sugar crystals are separated.",
    },
    {
      type: "combine",
      prompt: "Use 'Once ... has/have been done, ...' to connect two steps.",
      parts: [
        "The sugar canes are grown for 12-18 months.",
        "They are harvested by workers or machines.",
      ],
      answer:
        "Once the sugar canes have been grown for 12-18 months, they are harvested by workers or machines.",
    },
    {
      type: "combine",
      prompt: "Combine using 'before being done'.",
      parts: [
        "The juice is purified by a limestone filter.",
        "It is turned into syrup by an evaporator.",
      ],
      answer:
        "The juice is purified by a limestone filter before being turned into syrup by an evaporator.",
    },
    {
      type: "combine",
      prompt: "Combine using 'after which'.",
      parts: [
        "The sugar canes are crushed to produce juice.",
        "The juice passes through a limestone filter.",
      ],
      answer:
        "The sugar canes are crushed to produce juice, after which the juice passes through a limestone filter.",
    },
    {
      type: "combine",
      prompt: "Combine using 'which are then done'.",
      parts: [
        "Sugar crystals are separated from the syrup by a centrifuge.",
        "The crystals are dried and cooled.",
      ],
      answer:
        "Sugar crystals are separated from the syrup by a centrifuge, which are then dried and cooled.",
    },
    {
      type: "combine",
      prompt: "Combine using 'followed by + noun phrase'.",
      parts: [
        "Sugar canes are harvested by workers or machines.",
        "The crushing of the sugar canes to produce juice.",
      ],
      answer:
        "Sugar canes are harvested by workers or machines, followed by the crushing of the sugar canes to produce juice.",
    },
  ],
  noodles: [
    {
      type: "correction",
      prompt: "Correct the 'after which' clause.",
      sentence: "The noodle discs are cooked in oil, after which are dried.",
      answer:
        "The noodle discs are cooked in oil, after which they are dried.",
    },
    {
      type: "correction",
      prompt: "Correct the relative clause.",
      sentence:
        "Flour is mixed with water and oil in a mixer, which dough is formed.",
      answer:
        "Flour is mixed with water and oil in a mixer, where dough is formed.",
    },
    {
      type: "correction",
      prompt: "Correct the singular/plural reference error.",
      sentence:
        "The dough is pressed into sheets, which is then cut into strips.",
      answer:
        "The dough is pressed into sheets, which are then cut into strips.",
    },
    {
      type: "correction",
      prompt: "Correct the 'followed by' structure.",
      sentence:
        "The dough sheets are cut into strips, followed by the strips are shaped into noodle discs.",
      answer:
        "The dough sheets are cut into strips, followed by the formation of these strips into noodle discs.",
    },
    {
      type: "combine",
      prompt: "Use 'Once ... has/have been done, ...' to connect two steps.",
      parts: [
        "Flour is transported from storage silos by truck.",
        "It is mixed with water and oil in a mixer.",
      ],
      answer:
        "Once the flour has been transported from storage silos by truck, it is mixed with water and oil in a mixer.",
    },
    {
      type: "combine",
      prompt: "Combine using 'before being done'.",
      parts: ["The noodle discs are cooked in oil.", "They are dried."],
      answer:
        "The noodle discs are cooked in oil before being dried.",
    },
    {
      type: "combine",
      prompt: "Combine using 'after which'.",
      parts: [
        "Flour is mixed with water and oil to form dough.",
        "The dough is pressed into sheets by rollers.",
      ],
      answer:
        "Flour is mixed with water and oil to form dough, after which the dough is pressed into sheets by rollers.",
    },
    {
      type: "combine",
      prompt: "Combine using 'which are then done'.",
      parts: [
        "The dough sheets are cut into strips.",
        "The strips are shaped into noodle discs.",
      ],
      answer:
        "The dough sheets are cut into strips, which are then shaped into noodle discs.",
    },
    {
      type: "combine",
      prompt: "Combine using 'followed by + noun phrase'.",
      parts: [
        "The noodle discs are dried.",
        "The placing of the discs into cups with vegetables and spices.",
      ],
      answer:
        "The noodle discs are dried, followed by the placing of the discs into cups with vegetables and spices.",
    },
  ],
  recycling: [
    {
      type: "correction",
      prompt: "Correct the 'Once ... has/have been done' error.",
      sentence: "Once the blocks has been crushed, the pieces are washed.",
      answer:
        "Once the blocks have been crushed, the pieces are washed.",
    },
    {
      type: "correction",
      prompt: "Correct the subject-reference problem.",
      sentence:
        "Plastic bottles are compressed into blocks before being crushed and washed.",
      answer:
        "Plastic bottles are compressed into blocks, after which the blocks are crushed and the pieces are washed.",
    },
    {
      type: "correction",
      prompt: "Correct the 'after which' clause.",
      sentence:
        "Plastic pellets are produced, after which are heated to form raw material.",
      answer:
        "Plastic pellets are produced, after which they are heated to form raw material.",
    },
    {
      type: "correction",
      prompt: "Correct the singular/plural reference error.",
      sentence:
        "Plastic pellets are produced, which is then heated to form raw material.",
      answer:
        "Plastic pellets are produced, which are then heated to form raw material.",
    },
    {
      type: "combine",
      prompt: "Use 'Once ... has/have been done, ...' to connect two steps.",
      parts: [
        "Plastic bottles are collected and transported by truck.",
        "They are sorted in a recycling centre.",
      ],
      answer:
        "Once the plastic bottles have been collected and transported by truck, they are sorted in a recycling centre.",
    },
    {
      type: "combine",
      prompt: "Combine using 'before being done'.",
      parts: [
        "The raw material is packed.",
        "It is used to produce end products.",
      ],
      answer:
        "The raw material is packed before being used to produce end products.",
    },
    {
      type: "combine",
      prompt: "Combine using 'after which'.",
      parts: [
        "Plastic bottles are sorted in a recycling centre.",
        "They are compressed into blocks.",
      ],
      answer:
        "Plastic bottles are sorted in a recycling centre, after which they are compressed into blocks.",
    },
    {
      type: "combine",
      prompt: "Combine using 'which are then done'.",
      parts: [
        "The pieces are washed.",
        "They are processed into plastic pellets.",
      ],
      answer:
        "The pieces are washed, which are then processed into plastic pellets.",
    },
    {
      type: "combine",
      prompt: "Combine using 'followed by + noun phrase'.",
      parts: [
        "The pellets are heated to form raw material.",
        "The packing of the raw material.",
      ],
      answer:
        "The pellets are heated to form raw material, followed by the packing of the raw material.",
    },
  ],
};

Object.entries(processData).forEach(([key, item]) => {
  item.p2Band6 = p2Band6Tasks[key];
  item.p2Band65 = p2Band65Tasks[key];
});

const createErrorRules = () => [
  { id: "g1", type: "grammar", pattern: /\b(are|is)\s+(place|collect|sort|compress|harvest|spin|produce|pack|label|seal|crush|wash|dry|cool)\b(?!\w)/gi, message: "Use passive form: be + past participle, e.g. are placed / are collected." },
  { id: "g2", type: "grammar", pattern: /\b(fibres|bottles|pellets|crystals|plants)\s+is\b/gi, message: "Use a plural verb with plural nouns, e.g. fibres are / bottles are." },
  { id: "l2", type: "lexis", pattern: /plastic\s+balls/gi, message: "Use 'plastic pellets', not 'plastic balls'." },
  { id: "sp1", type: "spelling", pattern: /botles|bottels/gi, message: "Spelling: use 'bottles'." },
  { id: "sp2", type: "spelling", pattern: /recyling|recylcing/gi, message: "Spelling: use 'recycling'." },
  { id: "sp5", type: "spelling", pattern: /produts|prodcts/gi, message: "Spelling: use 'products'." },
];

const Card = memo(({ title, children }) => (
  <div className="rounded-2xl border bg-white p-5 shadow-sm">
    <h2 className="mb-4 text-xl font-bold text-slate-900">{title}</h2>
    {children}
  </div>
));

const Tab = memo(({ value, label, activePractice, onSelect }) => (
  <button
    onClick={() => onSelect(value)}
    role="tab"
    aria-selected={activePractice === value}
    className={`rounded-xl px-4 py-2 text-sm font-semibold ${
      activePractice === value ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-700"
    }`}
  >
    {label}
  </button>
));

export default function IELTSProcessTrainerFullSystem() {
  const [processKey, setProcessKey] = useState("bamboo");
  const [level, setLevel] = useState("band55");
  const [activePractice, setActivePractice] = useState("practice1");
  const [scoreMap, setScoreMap] = useLocalStorage("ielts-process-scores", {});
  const [practiceState, setPracticeState] = useState(initialPracticeState);
  const [dragItem, setDragItem] = useState(null);
  const [p1Hint, setP1Hint] = useState({ index: null, text: "" });
  const [p2Hint, setP2Hint] = useState({ index: null, text: "" });
  const [videoStarted, setVideoStarted] = useState(false);
  const [videoEnded, setVideoEnded] = useState(false);
  const [writingHint, setWritingHint] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiFeedback, setAiFeedback] = useState(null);
  const [p3TimerStarted, setP3TimerStarted] = useState(false);
  const [p3ElapsedSeconds, setP3ElapsedSeconds] = useState(0);
  const suggestedWritingSeconds = 20 * 60;
  const [band55SelfCheckVisible, setBand55SelfCheckVisible] = useState(false);
  const [band55Checklist, setBand55Checklist] = useState({
    passiveVoice: false,
    cohesiveDevices: false,
    correctOrder: false,
  });
  const [band55Evidence, setBand55Evidence] = useState({
    passiveVoice: "",
    cohesiveDevices: "",
  });
  const [band6SelfCheckVisible, setBand6SelfCheckVisible] = useState(false);
  const [band6Checklist, setBand6Checklist] = useState({
    cohesiveDevices: false,
    pronouns: false,
    structure: false,
  });
  const [band6Evidence, setBand6Evidence] = useState({
    cohesiveDevices: "",
    pronouns: "",
    structure: "",
  });
  const [band65SelfCheckVisible, setBand65SelfCheckVisible] = useState(false);
  const [band65Checklist, setBand65Checklist] = useState({
    details: false,
    complexStructure: false,
    stageLogic: false,
  });
  const [band65Evidence, setBand65Evidence] = useState({
    details: "",
    practice1: "",
    practice2: "",
  });

  const current = processData[processKey];
  const currentBand55LinkerJudgementTasks =
    band55LinkerJudgementTasks[processKey] || [];
  const scoreKey = `${processKey}-${level}`;
  const earned = scoreMap[scoreKey] || { p1: false, p2: false, p3: false };
  const totalScore = (earned.p1 ? 2 : 0) + (earned.p2 ? 3 : 0) + (earned.p3 ? 5 : 0);
  const achievement = totalScore < 4 ? "Bronze" : totalScore < 10 ? "Silver" : "Gold";
  const minWords = level === "band55" ? 70 : level === "band6" ? 80 : 100;
  const maxWords = level === "band55" ? 80 : level === "band6" ? 100 : 120;

  useEffect(() => {
    if (!p3TimerStarted) return undefined;
    const timer = setInterval(() => setP3ElapsedSeconds((prev) => prev + 1), 1000);
    return () => clearInterval(timer);
  }, [p3TimerStarted]);

  const resetAllPracticeStates = useCallback(() => {
    setPracticeState(initialPracticeState);
    setP1Hint({ index: null, text: "" });
    setP2Hint({ index: null, text: "" });
    setVideoStarted(false);
    setVideoEnded(false);
    setWritingHint("");
    setAiFeedback(null);
    setAiLoading(false);
    setDragItem(null);
    setP3TimerStarted(false);
    setP3ElapsedSeconds(0);
    setBand55SelfCheckVisible(false);
    setBand55Checklist({
      passiveVoice: false,
      cohesiveDevices: false,
      correctOrder: false,
    });
    setBand55Evidence({
      passiveVoice: "",
      cohesiveDevices: "",
    });
    setBand6SelfCheckVisible(false);
    setBand6Checklist({
      cohesiveDevices: false,
      pronouns: false,
      structure: false,
    });
    setBand6Evidence({
      cohesiveDevices: "",
      pronouns: "",
      structure: "",
    });
    setBand65SelfCheckVisible(false);
    setBand65Checklist({
      details: false,
      complexStructure: false,
      stageLogic: false,
    });
    setBand65Evidence({
      details: "",
      practice1: "",
      practice2: "",
    });
  }, []);

  const award = useCallback(
    (practice) => {
      setScoreMap((prev) => {
        const currentEarned = prev[scoreKey] || { p1: false, p2: false, p3: false };
        if (currentEarned[practice]) return prev;
        return { ...prev, [scoreKey]: { ...currentEarned, [practice]: true } };
      });
    },
    [scoreKey, setScoreMap],
  );

  const practice1Tasks = useMemo(() => {
    if (level === "band55") {
      const correctionTasks = band55PassiveCorrectionTasks[processKey] || [];
      return [
        ...correctionTasks,
        ...current.steps.slice(3).map((step) => ({
          prompt: step.active,
          answer: step.passive,
          instruction: "Rewrite the active sentence in the passive voice.",
        })),
      ];
    }
    if (level === "band6") {
      const correctionTasks = band6ProcessCorrectionTasks[processKey] || [];
      return [
        ...correctionTasks,
        ...current.steps.slice(3).map((step) => ({
          prompt: step.prompt6,
          answer: step.passive,
          instruction: "Use the words and the diagram to write a complete passive sentence.",
        })),
      ];
    }
    return current.band65.map((item) => ({
      prompt: item.prompt,
      answer: item.answer,
      instruction: item.task,
    }));
  }, [current, level, processKey]);

  const getPractice1Sections = useCallback(() => {
    if (level === "band55") {
      return [
        {
          title: "Part A - Correct Passive Voice Errors",
          description:
            "Tasks 1-3 help you notice common passive voice errors, such as missing be-verbs, wrong past participles and subject-verb agreement problems.",
          tasks: practice1Tasks.slice(0, 3),
          startIndex: 0,
        },
        {
          title: "Part B - Rewrite Active Sentences in the Passive Voice",
          description:
            "Rewrite the remaining active sentences in the passive voice. Keep useful details such as time, tools, materials and results.",
          tasks: practice1Tasks.slice(3),
          startIndex: 3,
        },
      ];
    }

    if (level === "band6") {
      return [
        {
          title: "Part A - Correct Process Sentence Errors",
          description:
            "Tasks 1-3 help you notice common process-sentence errors, such as passive form, subject-verb agreement, verb patterns and common prepositions.",
          tasks: practice1Tasks.slice(0, 3),
          startIndex: 0,
        },
        {
          title: "Part B - Write Complete Passive Sentences",
          description:
            "Use the keywords and the diagram to write complete passive sentences. Pay attention to tools, materials, results and prepositions.",
          tasks: practice1Tasks.slice(3),
          startIndex: 3,
        },
      ];
    }

    return [
      {
        title: "Sentence Upgrade Tasks",
        description:
          "Upgrade the basic sentences by using more precise words, useful diagram details, relative clauses, purpose phrases or result structures.",
        tasks: practice1Tasks,
        startIndex: 0,
      },
    ];
  }, [level, practice1Tasks]);

  const p1ReflectionOptions = useMemo(
    () => (level === "band65" ? shuffleArray(sentenceUpgradeReflectionOptions) : []),
    [level, processKey],
  );

  const checkP1 = useCallback(
    (index) => {
      const ok = isAnswerCorrect(practiceState.p1Answers[index] || "", practice1Tasks[index].answer, level);
      setPracticeState((prev) => ({ ...prev, p1Feedback: { ...prev.p1Feedback, [index]: ok } }));
      const allCorrect = practice1Tasks.every((task, i) =>
        isAnswerCorrect(practiceState.p1Answers[i] || "", task.answer, level),
      );
      const reflectionCorrect =
        level !== "band65" ||
        (practiceState.p1ReflectionChecked &&
          sentenceUpgradeReflectionOptions.every((option) => {
            const selected = Boolean(practiceState.p1ReflectionAnswers[option.id]);
            return selected === option.correct;
          }));
      if (allCorrect && reflectionCorrect) award("p1");
    },
    [
      award,
      level,
      practice1Tasks,
      practiceState.p1Answers,
      practiceState.p1ReflectionAnswers,
      practiceState.p1ReflectionChecked,
    ],
  );

  const getP1Hint = useCallback(
    (index) => {
      if (level === "band55") {
        const hintMap = {
          bamboo: [
            "Check whether the sentence has the correct be-verb before the past participle.",
            "Check the tense. A process description usually uses present simple passive, not past simple passive.",
            "Check subject-verb agreement. Is the subject singular or plural?",
          ],
          sugar: [
            "Check subject-verb agreement. Is the subject singular or plural?",
            "Check whether the sentence has the correct be-verb before the past participle.",
            "Check the tense. A process description usually uses present simple passive, not past simple passive.",
          ],
          noodles: [
            "Check whether the sentence has the correct be-verb before the past participle.",
            "Check the verb form after the be-verb. A passive sentence needs a past participle.",
            "Check subject-verb agreement. Does the subject refer to one thing or more than one thing?",
          ],
          recycling: [
            "Check the tense. A process description usually uses present simple passive, not past simple passive.",
            "Check the verb form after the be-verb. A passive sentence needs a past participle.",
            "Check subject-verb agreement. Is the subject singular or plural?",
          ],
        };

        if (index < 3) {
          setP1Hint({
            index,
            text:
              hintMap[processKey]?.[index] ||
              "Check present simple passive: subject + be-verb + past participle.",
          });
        } else {
          setP1Hint({
            index,
            text:
              "Rewrite the active sentence in the passive voice. First identify the object, then make it the new subject. Check the be-verb and past participle.",
          });
        }
        return;
      }

      if (level === "band6") {
        const hintMap = {
          bamboo: [
            "Check whether this verb has a regular or irregular past participle.",
            "Check the position of the by-phrase and whether the noun after it should be singular or plural.",
            "Check the two verbs after the be-verb. In a parallel passive structure, both verbs should use the same form.",
          ],
          sugar: [
            "Check the countable noun after the number range.",
            "Check whether the nouns after the by-phrase should be singular or plural.",
            "Check whether the sentence has two verbs. If the second action shows purpose, think about the correct verb pattern.",
          ],
          noodles: [
            "Check the transport expression after by. Is it describing a method of transport or one specific vehicle?",
            "Check the verb pattern. Does this verb need a preposition before the materials?",
            "Check the spelling of the past participle after the be-verb.",
          ],
          recycling: [
            "Check the countable noun at the end of the sentence. Is one container meant, or more than one?",
            "Check the second verb in the passive structure. After 'are collected and ...', should the second verb stay in base form?",
            "Check the countable noun and subject-verb agreement. Does the subject refer to one bottle or many bottles?",
          ],
        };

        if (index < 3) {
          setP1Hint({
            index,
            text:
              hintMap[processKey]?.[index] ||
              "Check the process sentence carefully: verb form, noun form, by-phrase, and verb pattern.",
          });
        } else {
          setP1Hint({
            index,
            text:
              "Use the keywords to write a complete passive sentence. Check the subject, be-verb, past participle, tools, materials and purpose phrase.",
          });
        }
        return;
      }

      setP1Hint({
        index,
        text: `Task ${index + 1}: ${practice1Tasks[index].instruction}`,
      });
    },
    [level, processKey, practice1Tasks],
  );

  const checkP1Reflection = useCallback(() => {
    const feedback = {};
    sentenceUpgradeReflectionOptions.forEach((option) => {
      feedback[option.id] = Boolean(practiceState.p1ReflectionAnswers[option.id]) === option.correct;
    });
    const reflectionCorrect = Object.values(feedback).every(Boolean);
    const allCorrect = practice1Tasks.every((task, i) =>
      isAnswerCorrect(practiceState.p1Answers[i] || "", task.answer, level),
    );
    setPracticeState((prev) => ({ ...prev, p1ReflectionFeedback: feedback, p1ReflectionChecked: true }));
    if (reflectionCorrect && allCorrect) award("p1");
  }, [award, level, practice1Tasks, practiceState.p1Answers, practiceState.p1ReflectionAnswers]);

  const linkerOptions = ["After", "Next", "then", "Finally", "The following stage", "next", "First"];

  const dropToBlank = useCallback(
    (index) => {
      if (!dragItem) return;
      const value = typeof dragItem === "string" ? dragItem : dragItem.value;
      if (!value) return;
      setPracticeState((prev) => {
        const copy = [...prev.p2ParagraphAnswers];
        copy[index] = value;
        return { ...prev, p2ParagraphAnswers: copy };
      });
    },
    [dragItem],
  );

  const returnBlankToBox = useCallback(() => {
    if (!dragItem || dragItem.type !== "blank") return;
    setPracticeState((prev) => {
      const copy = [...prev.p2ParagraphAnswers];
      copy[dragItem.index] = "";
      return { ...prev, p2ParagraphAnswers: copy };
    });
    setDragItem(null);
  }, [dragItem]);

  const checkParagraph = useCallback(() => {
    const feedback = current.p2Band55.answers.map((answer, i) => practiceState.p2ParagraphAnswers[i] === answer);
    setPracticeState((prev) => ({ ...prev, p2ParagraphFeedback: feedback }));
    const paragraphCorrect = feedback.length > 0 && feedback.every(Boolean);
    const judgementTasks = band55LinkerJudgementTasks[processKey] || [];
    const judgementCorrect =
      level !== "band55" ||
      (practiceState.p2LinkerJudgementChecked &&
        judgementTasks.every((task) => {
          const selected = practiceState.p2LinkerJudgementAnswers?.[task.id];
          return selected === task.answer;
        }));
    if (paragraphCorrect && judgementCorrect) award("p2");
  }, [
    award,
    current,
    level,
    practiceState.p2LinkerJudgementAnswers,
    practiceState.p2LinkerJudgementChecked,
    practiceState.p2ParagraphAnswers,
    processKey,
  ]);

  const checkP2LinkerJudgement = useCallback(() => {
    const tasks = band55LinkerJudgementTasks[processKey] || [];
    const feedback = {};
    tasks.forEach((task) => {
      const selected = practiceState.p2LinkerJudgementAnswers?.[task.id];
      feedback[task.id] = selected === task.answer;
    });
    const judgementCorrect = tasks.every((task) => {
      const selected = practiceState.p2LinkerJudgementAnswers?.[task.id];
      return selected === task.answer;
    });
    const paragraphCorrect =
      practiceState.p2ParagraphFeedback.length > 0 &&
      practiceState.p2ParagraphFeedback.every(Boolean);
    setPracticeState((prev) => ({
      ...prev,
      p2LinkerJudgementFeedback: feedback,
      p2LinkerJudgementChecked: true,
    }));
    if (level === "band55" && paragraphCorrect && judgementCorrect) award("p2");
  }, [
    award,
    level,
    practiceState.p2LinkerJudgementAnswers,
    practiceState.p2ParagraphFeedback,
    processKey,
  ]);

  const getCohesionTasks = useCallback(() => {
    return level === "band6" ? current.p2Band6 : current.p2Band65;
  }, [level, current]);

  const cohesionTasks = useMemo(() => getCohesionTasks(), [getCohesionTasks]);

  const getPractice2Sections = useCallback(() => {
    const tasks = getCohesionTasks();

    if (level === "band65") {
      return [
        {
          title: "Part A - Correct Cohesive Structure Errors",
          description:
            "Correct common errors in complex cohesive structures, such as 'Once ... has/have been done', 'after which', 'which is/are then done', 'where' clauses and 'followed by + noun phrase'.",
          tasks: tasks.filter((task) => task.type === "correction"),
        },
        {
          title: "Part B - Combine the Sentences",
          description:
            "Combine the sentence pairs using the target structures. Keep the meaning clear and make sure the grammar after each cohesive device is correct.",
          tasks: tasks.filter((task) => task.type !== "correction"),
        },
      ];
    }

    return [
      {
        title: "Practice Tasks",
        description:
          level === "band6"
            ? "Complete the cohesive devices, analyse sentence relationships and combine the sentence pairs."
            : "",
        tasks,
      },
    ];
  }, [getCohesionTasks, level]);

  const checkCohesion = useCallback(
    (index) => {
      const tasks = getCohesionTasks();
      const ok = isAnswerCorrect(practiceState.p2CohesionAnswers[index] || "", tasks[index].answer, level);
      setPracticeState((prev) => ({ ...prev, p2CohesionFeedback: { ...prev.p2CohesionFeedback, [index]: ok } }));
      const allCorrect = tasks.every((task, i) =>
        isAnswerCorrect(practiceState.p2CohesionAnswers[i] || "", task.answer, level),
      );
      if (allCorrect) award("p2");
    },
    [award, getCohesionTasks, level, practiceState.p2CohesionAnswers],
  );

  const getP2Hint = useCallback(
    (index = null) => {
      if (level === "band55") {
        setP2Hint({
          index: null,
          text:
            "Look at the position of the blank: sentence beginning, after a be-verb, after 'After', or inside 'In the ___ stage'.",
        });
        return;
      }

      const tasks = getCohesionTasks();
      const task = tasks[index];
      if (!task) return;

      if (level === "band6") {
        if (task.type === "fill") {
          setP2Hint({
            index,
            text:
              "Use the first letter, capitalisation and sentence position. For example, 't______' after a be-verb usually means 'then', while 'A______ that' means 'After that'.",
          });
          return;
        }

        if (task.type === "choice") {
          const prompt = task.prompt || "";

          if (prompt.includes("pronoun")) {
            setP2Hint({
              index,
              text:
                "Check whether the noun is singular or plural. Use 'it' for one thing, 'they' for plural subjects, and 'them' for plural objects.",
            });
          } else if (prompt.includes("before") || prompt.includes("after")) {
            setP2Hint({
              index,
              text:
                "Keep the sentence order unchanged. Choose 'before being' or 'after being' according to which action happens first.",
            });
          } else {
            setP2Hint({
              index,
              text:
                "Check the relationship between the two steps: subject reference, step order and whether the same item continues through both actions.",
            });
          }

          return;
        }

        const prompt = task.prompt || "";

        if (prompt.includes("and then")) {
          setP2Hint({
            index,
            text:
              "Join the two actions with ', and then'. Replace the repeated noun with 'it', 'they' or 'them'.",
          });
        } else if (prompt.includes("before being")) {
          setP2Hint({
            index,
            text:
              "Use 'before being + past participle' when the first action happens earlier and the same item continues to the next step.",
          });
        } else if (prompt.includes("after being")) {
          setP2Hint({
            index,
            text:
              "Put the later action in the main clause, then use 'after being + past participle' to show the earlier action.",
          });
        } else {
          setP2Hint({
            index,
            text:
              "Check whether the same subject continues. If it does, you can combine the steps with 'and then', 'before being' or 'after being'.",
          });
        }

        return;
      }

      if (level === "band65") {
        if (task.type === "correction") {
          const sentence = task.sentence || "";
          const prompt = task.prompt || "";

          if (prompt.includes("Once")) {
            setP2Hint({
              index,
              text:
                "Use 'Once + subject + has/have been + past participle'. Check both 'has/have' and 'been'.",
            });
          } else if (prompt.includes("subject-reference")) {
            setP2Hint({
              index,
              text:
                "Check whether the subject before and after 'being' is the same. If the subject changes, use another structure such as 'after which'.",
            });
          } else if (prompt.includes("after which")) {
            setP2Hint({
              index,
              text:
                "After 'after which', use a complete clause with a clear subject, such as 'they are...' or 'the sheets are...'.",
            });
          } else if (prompt.includes("singular/plural")) {
            setP2Hint({
              index,
              text:
                "Check what 'which' refers to. Use 'which is' for one thing or an uncountable product, and 'which are' for plural things.",
            });
          } else if (prompt.includes("followed by")) {
            setP2Hint({
              index,
              text:
                "After 'followed by', use a noun phrase, such as 'the compression of...' or 'the weaving of...'. Do not use a full clause.",
            });
          } else if (
            prompt.includes("relative clause") ||
            sentence.includes("mixer")
          ) {
            setP2Hint({
              index,
              text:
                "Use 'where' when you refer to a place, container or machine where an action happens. Use 'which' when you refer to a thing.",
            });
          } else {
            setP2Hint({
              index,
              text:
                "Check the cohesive structure carefully. Make sure the connector matches the grammar after it.",
            });
          }
          return;
        }

        const prompt = task.prompt || "";

        if (prompt.includes("Once")) {
          setP2Hint({
            index,
            text:
              "Use 'Once + subject + has/have been + past participle' to show that one step is completed before the next step starts.",
          });
        } else if (prompt.includes("before being")) {
          setP2Hint({
            index,
            text:
              "Use 'before being + past participle' when the same item goes through two actions in order.",
          });
        } else if (prompt.includes("after which")) {
          setP2Hint({
            index,
            text:
              "Use 'after which' when the next action happens after the whole previous step. After it, write a complete clause.",
          });
        } else if (prompt.includes("which is") || prompt.includes("which are")) {
          setP2Hint({
            index,
            text:
              "Use 'which is/are then + past participle' when the result of the first step becomes the thing processed in the next step. Check singular/plural carefully.",
          });
        } else if (prompt.includes("followed by")) {
          setP2Hint({
            index,
            text:
              "After 'followed by', use a noun phrase, such as 'the compression of...' or 'the packing of...'. Do not use a full clause.",
          });
        } else {
          setP2Hint({
            index,
            text:
              "Check subject reference, step order and the grammar required by the target cohesive structure.",
          });
        }
        return;
      }

      setP2Hint({
        index,
        text:
          "Check subject reference, step order and whether the same item continues through both actions.",
      });
    },
    [getCohesionTasks, level],
  );

  const wordCount = useMemo(
    () => (practiceState.p3Writing.trim() ? practiceState.p3Writing.trim().split(/\s+/).length : 0),
    [practiceState.p3Writing],
  );

  const finalReflectionQuestions =
    level === "band55"
      ? [
          "What passive voice pattern did you check or correct?",
          "What cohesive device did you use to show the order clearly?",
          "What will you check first next time?",
        ]
      : level === "band6"
        ? [
            "What sentence-combining structure did you use or improve?",
            "What repeated noun did you replace with a pronoun?",
            "What will you check first next time?",
          ]
        : [
            "What sentence-upgrade expression did you use or improve?",
            "What cohesive structure from Practice 2 did you use or improve?",
            "What will you check first next time?",
          ];

  const selfCheckComplete = useMemo(() => {
    if (level === "band55") {
      return (
        band55Checklist.passiveVoice &&
        band55Checklist.cohesiveDevices &&
        band55Checklist.correctOrder &&
        band55Evidence.passiveVoice.trim().length > 0 &&
        band55Evidence.cohesiveDevices.trim().length > 0
      );
    }
    if (level === "band6") {
      return (
        band6Checklist.cohesiveDevices &&
        band6Checklist.pronouns &&
        band6Checklist.structure &&
        band6Evidence.cohesiveDevices.trim().length > 0 &&
        band6Evidence.pronouns.trim().length > 0 &&
        band6Evidence.structure.trim().length > 0
      );
    }
    return (
      band65Checklist.details &&
      band65Checklist.complexStructure &&
      band65Checklist.stageLogic &&
      band65Evidence.details.trim().length > 0 &&
      band65Evidence.practice1.trim().length > 0 &&
      band65Evidence.practice2.trim().length > 0
    );
  }, [
    level,
    band55Checklist,
    band55Evidence,
    band6Checklist,
    band6Evidence,
    band65Checklist,
    band65Evidence,
  ]);

  const aiChecked = Boolean(aiFeedback);
  const aiErrors = aiFeedback?.errors || [];
  const aiHasNoErrors = aiChecked && aiErrors.length === 0;
  const finalReflectionComplete = practiceState.p3Reflection.every((item) => item.trim());

  const runLocalAICheck = useCallback(() => {
    const errors = [];
    createErrorRules(processKey).forEach((rule) => {
      const matches = practiceState.p3Writing.match(rule.pattern);
      if (matches?.length) {
        errors.push({
          id: rule.id,
          type: rule.type,
          message: rule.message,
          examples: rule.examples || [],
        });
      }
    });
    if (wordCount < minWords) {
      errors.push({
        id: "task-word-count-low",
        type: "task",
        message: `Your paragraph is too short. Aim for at least ${minWords} words for this level.`,
        examples: [],
      });
    }
    if (wordCount > maxWords + 20) {
      errors.push({
        id: "task-word-count-high",
        type: "task",
        message: `Your paragraph may be too long. Try to keep it close to ${minWords}-${maxWords} words.`,
        examples: [],
      });
    }
    return errors;
  }, [maxWords, minWords, practiceState.p3Writing, processKey, wordCount]);

  const getAIFeedback = useCallback(async () => {
    if (!practiceState.p3Writing.trim()) {
      setWritingHint("Please write your body paragraph before using AI Check.");
      return;
    }
    if (!selfCheckComplete) {
      setWritingHint("Please complete the self-checklist and copy examples from your paragraph before using AI Check.");
      return;
    }
    setWritingHint("");
    setAiLoading(true);
    try {
      let errors = [];
      try {
        const response = await fetch("/api/ai-feedback", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            processKey,
            level,
            writing: practiceState.p3Writing,
            instruction:
              "Only identify error categories and brief error labels. Do not rewrite the paragraph or provide corrected sentences.",
          }),
        });
        if (response.ok) {
          const data = await response.json();
          errors = Array.isArray(data.errors) ? data.errors : [];
          setAiFeedback({
            checkedAt: new Date().toISOString(),
            errors,
            source: data.source || "chatgpt",
            model: data.model,
          });
        } else {
          const data = await response.json().catch(() => ({}));
          const message =
            data.error && data.error !== "fetch failed"
              ? data.error
              : "ChatGPT connection failed. Please check the network connection, VPN/proxy settings, or OpenAI API access, then try again.";
          setAiFeedback({
            checkedAt: new Date().toISOString(),
            errors: [
              {
                id: "ai-check-unavailable",
                type: "system",
                message,
                examples: [],
              },
            ],
            source: "chatgpt",
          });
        }
      } catch (error) {
        setAiFeedback({
          checkedAt: new Date().toISOString(),
          errors: [
            {
              id: "ai-check-unavailable",
              type: "system",
              message:
                "AI Check could not connect to ChatGPT. Please check the API key, network connection or proxy settings, then try again.",
              examples: [],
            },
          ],
          source: "chatgpt",
        });
      }
    } finally {
      setAiLoading(false);
    }
  }, [level, practiceState.p3Writing, processKey, selfCheckComplete]);

  const showSelfCheck = useCallback(() => {
    if (!practiceState.p3Writing.trim()) {
      setWritingHint("Please write your body paragraph first.");
      return;
    }
    setWritingHint("");
    if (level === "band55") {
      setBand55SelfCheckVisible(true);
    } else if (level === "band6") {
      setBand6SelfCheckVisible(true);
    } else {
      setBand65SelfCheckVisible(true);
    }
  }, [level, practiceState.p3Writing]);

  const submitPractice3 = useCallback(() => {
    if (!aiHasNoErrors) {
      setWritingHint(
        "Please revise your paragraph and run AI Check again. You can submit only when the current checker finds no issues, but final human review is still recommended.",
      );
      return;
    }
    if (!finalReflectionComplete) {
      setWritingHint("Please complete the Final Reflection before submitting.");
      return;
    }
    award("p3");
    setWritingHint("Practice 3 submitted successfully. You earned 5 points.");
  }, [aiHasNoErrors, award, finalReflectionComplete]);

  const renderPractice1 = () => {
    const practice1Sections = getPractice1Sections();

    return (
      <Card
        title={
          level === "band55"
            ? "Practice 1 - Active to Passive"
            : level === "band6"
              ? "Practice 1 - Passive Voice"
              : "Practice 1 - Sentence Upgrade"
        }
      >
        <p className="mb-4 text-sm text-slate-600">
          Complete Practice 1 to earn 2 points.
          {level === "band55" &&
            " First correct passive voice errors, then rewrite active sentences in the passive voice."}
          {level === "band6" &&
            " First correct process-sentence errors, then use the words and the diagram to write complete passive sentences."}
          {level === "band65" &&
            " You also need to pass the Sentence Upgrade Reflection."}
        </p>

        <div className="space-y-6">
          {practice1Sections.map((section) => (
            <div key={section.title} className="rounded-2xl border bg-white p-4">
              <div className="mb-4 rounded-xl bg-slate-50 p-3">
                <p className="font-bold text-slate-800">{section.title}</p>
                <p className="mt-1 text-sm text-slate-600">
                  {section.description}
                </p>
              </div>

              <div className="space-y-4">
                {section.tasks.map((task, localIndex) => {
                  const i = section.startIndex + localIndex;

                  return (
                    <div key={i} className="rounded-xl border bg-slate-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        {level === "band55" && i < 3
                          ? `Correction Task ${i + 1}`
                          : level === "band55"
                            ? `Passive Task ${i + 1}`
                            : level === "band6" && i < 3
                              ? `Correction Task ${i + 1}`
                              : level === "band6"
                                ? `Passive Sentence Task ${i + 1}`
                                : `Task ${i + 1}`}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-700">
                        {task.instruction}
                      </p>
                      <p className="mt-2 rounded-lg bg-white p-3">
                        {task.prompt}
                      </p>
                      <input
                        value={practiceState.p1Answers[i] || ""}
                        onChange={(e) =>
                          setPracticeState((prev) => ({
                            ...prev,
                            p1Answers: {
                              ...prev.p1Answers,
                              [i]: e.target.value,
                            },
                          }))
                        }
                        className="mt-3 w-full rounded-xl border p-2"
                        placeholder="Write your answer here..."
                        aria-label={`Answer for task ${i + 1}`}
                      />
                      <div className="mt-3 flex gap-2">
                        <button
                          type="button"
                          onClick={() => checkP1(i)}
                          className="rounded-xl bg-green-600 px-3 py-2 text-sm font-semibold text-white"
                        >
                          Check
                        </button>
                        <button
                          type="button"
                          onClick={() => getP1Hint(i)}
                          className="rounded-xl border bg-white px-3 py-2 text-sm font-semibold"
                        >
                          Hint
                        </button>
                      </div>
                      {p1Hint.index === i && p1Hint.text && (
                        <div className="mt-3 rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700">
                          {p1Hint.text}
                        </div>
                      )}
                      {practiceState.p1Feedback[i] !== undefined && (
                        <div
                          className={`mt-3 rounded-xl p-3 text-sm ${
                            practiceState.p1Feedback[i]
                              ? "bg-green-50 text-green-700"
                              : "bg-red-50 text-red-700"
                          }`}
                        >
                          {practiceState.p1Feedback[i]
                            ? "Correct."
                            : `Suggested answer: ${task.answer}`}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {level === "band65" && (
          <div className="mt-5 rounded-2xl border bg-purple-50 p-4">
            <p className="font-bold text-purple-900">
              Sentence Upgrade Reflection
            </p>
            <p className="mt-1 text-sm text-purple-800">
              Look back at Practice 1. Which methods are useful for upgrading
              process-diagram sentences? Tick all suitable choices.
            </p>
            <div className="mt-3 space-y-2 text-sm text-purple-900">
              {p1ReflectionOptions.map((option) => {
                const checked = Boolean(
                  practiceState.p1ReflectionAnswers?.[option.id],
                );
                const feedback =
                  practiceState.p1ReflectionFeedback?.[option.id];
                return (
                  <label
                    key={option.id}
                    className={`flex gap-2 rounded-xl border p-3 ${
                      feedback === undefined
                        ? "bg-white"
                        : feedback
                          ? "border-green-300 bg-green-50 text-green-800"
                          : "border-red-300 bg-red-50 text-red-800"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) =>
                        setPracticeState((prev) => ({
                          ...prev,
                          p1ReflectionAnswers: {
                            ...prev.p1ReflectionAnswers,
                            [option.id]: e.target.checked,
                          },
                          p1ReflectionChecked: false,
                          p1ReflectionFeedback: null,
                        }))
                      }
                    />
                    <span>{option.text}</span>
                  </label>
                );
              })}
            </div>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={checkP1Reflection}
                className="rounded-xl bg-green-600 px-3 py-2 text-sm font-semibold text-white"
              >
                Check Reflection
              </button>
            </div>
            {practiceState.p1ReflectionChecked && (
              <div
                className={`mt-3 rounded-xl p-3 text-sm ${
                  sentenceUpgradeReflectionOptions.every((option) => {
                    const selected = Boolean(
                      practiceState.p1ReflectionAnswers?.[option.id],
                    );
                    return selected === option.correct;
                  })
                    ? "bg-green-50 text-green-700"
                    : "bg-red-50 text-red-700"
                }`}
              >
                {sentenceUpgradeReflectionOptions.every((option) => {
                  const selected = Boolean(
                    practiceState.p1ReflectionAnswers?.[option.id],
                  );
                  return selected === option.correct;
                })
                  ? "Correct. These are suitable ways to upgrade process-diagram sentences."
                  : "Check again. Some options are not suitable for IELTS process diagrams."}
              </div>
            )}
            {!earned.p1 && (
              <p className="mt-3 text-xs text-purple-800">
                To earn 2 points for Practice 1, complete all sentence-upgrade
                tasks correctly and pass this reflection check.
              </p>
            )}
          </div>
        )}
      </Card>
    );
  };

  const renderBlank = (index) => {
    const checked = practiceState.p2ParagraphFeedback.length > 0;
    const ok = practiceState.p2ParagraphFeedback[index];
    const currentAnswer = practiceState.p2ParagraphAnswers[index] || "";
    return (
      <span
        draggable={Boolean(currentAnswer)}
        onDragStart={() =>
          currentAnswer &&
          setDragItem({ type: "blank", index, value: currentAnswer })
        }
        onDragOver={(e) => e.preventDefault()}
        onDrop={() => dropToBlank(index)}
        role="textbox"
        aria-label={`Blank ${index + 1} for linker word`}
        aria-readonly="true"
        className={`mx-1 inline-flex min-h-[28px] min-w-[105px] items-center justify-center rounded border-b-2 px-2 text-center align-middle ${
          checked ? (ok ? "border-green-500 bg-green-50 text-green-700" : "border-red-500 bg-red-50 text-red-700") : "border-slate-600 bg-white"
        } ${currentAnswer ? "cursor-grab" : ""}`}
      >
        {currentAnswer || "\u00A0"}
      </span>
    );
  };

  const renderBand55Paragraph = () => (
    <p className="leading-10">
      {current.p2Band55.text.map((chunk, i) => (
        <span key={i}>
          {renderBlank(chunk[0])}
          {chunk[1]}
        </span>
      ))}
    </p>
  );

  const renderBand55Practice2 = () => {
    return (
      <Card title="Practice 2 - COHESIVE DEVICES">
        <p className="mb-4 text-sm text-slate-600">
          Complete Practice 2 to earn 3 points. Part A asks you to drag cohesive
          devices into the process paragraph. Part B asks you to judge whether
          the linker sentences are correct.
        </p>
        <div className="rounded-2xl border bg-white p-4">
          <div className="mb-4 rounded-xl bg-slate-50 p-3">
            <p className="font-bold text-slate-800">
              Part A - Drag Cohesive Devices
            </p>
            <p className="mt-1 text-sm text-slate-600">
              In the text below some words are missing. Drag words from the box
              below to the appropriate place in the text. To undo an answer
              choice, drag the word back to the box below the text.
            </p>
          </div>
          <div className="rounded-2xl border bg-slate-50 p-5">
            {renderBand55Paragraph()}
          </div>
          <div
            className="mt-4 flex flex-wrap gap-2 rounded-2xl border bg-white p-4"
            onDragOver={(e) => e.preventDefault()}
            onDrop={returnBlankToBox}
          >
            {linkerOptions.map((option) => (
              <div
                key={option}
                draggable
                onDragStart={() =>
                  setDragItem({ type: "option", value: option })
                }
                role="button"
                tabIndex={0}
                className="cursor-grab rounded-xl border bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700"
              >
                {option}
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => getP2Hint()}
              className="rounded-xl border bg-white px-3 py-2 text-sm font-semibold"
            >
              Hint
            </button>
            <button
              type="button"
              onClick={checkParagraph}
              className="rounded-xl bg-green-600 px-3 py-2 text-sm font-semibold text-white"
            >
              Check Drag Task
            </button>
            <button
              type="button"
              onClick={resetAllPracticeStates}
              className="rounded-xl border bg-white px-3 py-2 text-sm font-semibold"
            >
              Reset
            </button>
          </div>
          {p2Hint.text && (
            <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700">
              {p2Hint.text}
            </div>
          )}
          {practiceState.p2ParagraphFeedback.length > 0 && (
            <div className="mt-4 grid gap-2 sm:grid-cols-2 md:grid-cols-4">
              {practiceState.p2ParagraphFeedback.map((ok, i) => (
                <div
                  key={i}
                  className={`rounded-xl border p-3 text-sm ${
                    ok
                      ? "bg-green-50 text-green-700"
                      : "bg-red-50 text-red-700"
                  }`}
                >
                  Blank {i + 1}: {ok ? "Correct" : "Check again"}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="mt-5 rounded-2xl border bg-white p-4">
          <div className="mb-4 rounded-xl bg-slate-50 p-3">
            <p className="font-bold text-slate-800">
              Part B - Linker Position Check
            </p>
            <p className="mt-1 text-sm text-slate-600">
              Decide whether each sentence is correct. Focus on linker position,
              "then", "After that", and the difference between "In the next
              stage, ..." and "The next stage is to...".
            </p>
          </div>
          <div className="space-y-3 text-sm text-slate-800">
            {currentBand55LinkerJudgementTasks.map((task, index) => {
              const selected =
                practiceState.p2LinkerJudgementAnswers?.[task.id];
              const feedback =
                practiceState.p2LinkerJudgementFeedback?.[task.id];
              const showHint =
                practiceState.p2LinkerJudgementHint === task.id;
              return (
                <div
                  key={task.id}
                  className={`rounded-xl border p-3 ${
                    feedback === undefined
                      ? "bg-slate-50"
                      : feedback
                        ? "border-green-300 bg-green-50 text-green-800"
                        : "border-red-300 bg-red-50 text-red-800"
                  }`}
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Statement {index + 1}
                  </p>
                  <p className="mt-1 rounded-lg bg-white p-3">
                    {task.statement}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setPracticeState((prev) => ({
                          ...prev,
                          p2LinkerJudgementAnswers: {
                            ...prev.p2LinkerJudgementAnswers,
                            [task.id]: true,
                          },
                          p2LinkerJudgementChecked: false,
                          p2LinkerJudgementFeedback: null,
                        }))
                      }
                      className={`rounded-xl border px-3 py-2 text-sm font-semibold ${
                        selected === true
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "bg-white text-slate-700"
                      }`}
                    >
                      True
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setPracticeState((prev) => ({
                          ...prev,
                          p2LinkerJudgementAnswers: {
                            ...prev.p2LinkerJudgementAnswers,
                            [task.id]: false,
                          },
                          p2LinkerJudgementChecked: false,
                          p2LinkerJudgementFeedback: null,
                        }))
                      }
                      className={`rounded-xl border px-3 py-2 text-sm font-semibold ${
                        selected === false
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "bg-white text-slate-700"
                      }`}
                    >
                      False
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setPracticeState((prev) => ({
                          ...prev,
                          p2LinkerJudgementHint:
                            prev.p2LinkerJudgementHint === task.id
                              ? null
                              : task.id,
                        }))
                      }
                      className="rounded-xl border bg-white px-3 py-2 text-sm font-semibold"
                    >
                      Hint
                    </button>
                  </div>
                  {showHint && (
                    <div className="mt-2 rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700">
                      {task.hint}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={checkP2LinkerJudgement}
              className="rounded-xl bg-green-600 px-3 py-2 text-sm font-semibold text-white"
            >
              Check Linker Position
            </button>
          </div>
          {practiceState.p2LinkerJudgementChecked && (
            <div
              className={`mt-3 rounded-xl p-3 text-sm ${
                currentBand55LinkerJudgementTasks.every((task) => {
                  const selected =
                    practiceState.p2LinkerJudgementAnswers?.[task.id];
                  return selected === task.answer;
                })
                  ? "bg-green-50 text-green-700"
                  : "bg-red-50 text-red-700"
              }`}
            >
              {currentBand55LinkerJudgementTasks.every((task) => {
                const selected =
                  practiceState.p2LinkerJudgementAnswers?.[task.id];
                return selected === task.answer;
              })
                ? "Correct. You understand the basic positions and structures of process linkers."
                : "Check again. Use the hints to review linker position and 'is to + verb'."}
            </div>
          )}
          {!earned.p2 && (
            <p className="mt-3 text-xs text-slate-600">
              To earn 3 points for Practice 2, complete both Part A and Part B
              correctly.
            </p>
          )}
        </div>
      </Card>
    );
  };

  const renderPractice2 = () => {
    if (level === "band55") {
      return renderBand55Practice2();
    }

    const tasks = getCohesionTasks();
    const practice2Sections = getPractice2Sections();

    return (
      <Card title="Practice 2 - COHESIVE DEVICES">
        {level === "band6" && (
          <p className="mb-4 text-sm text-slate-600">
            Complete Practice 2 to earn 3 points. Complete the missing cohesive
            devices, analyse sentence relationships and combine the sentence
            pairs.
          </p>
        )}

        {level === "band65" && (
          <p className="mb-4 text-sm text-slate-600">
            Complete Practice 2 to earn 3 points. Part A asks you to correct
            common cohesive-structure errors. Part B asks you to combine
            sentence pairs using target cohesive structures.
          </p>
        )}

        <div className="space-y-6">
          {practice2Sections.map((section) => (
            <div key={section.title} className="rounded-2xl border bg-white p-4">
              <div className="mb-4 rounded-xl bg-slate-50 p-3">
                <p className="font-bold text-slate-800">{section.title}</p>
                <p className="mt-1 text-sm text-slate-600">
                  {section.description}
                </p>
              </div>

              <div className="space-y-4">
                {section.tasks.map((task) => {
                  const i = tasks.indexOf(task);

                  return (
                    <div key={i} className="rounded-xl border bg-slate-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Task {i + 1}
                      </p>

                      {task.type === "fill" ? (
                        <p className="mt-2 rounded-lg bg-white p-3">
                          {task.sentence}
                        </p>
                      ) : task.type === "choice" ? (
                        <div className="mt-2 rounded-lg bg-white p-3">
                          <p className="font-semibold">{task.prompt}</p>
                          {task.parts?.map((part, index) => (
                            <p key={index} className="mt-1">
                              {task.parts.length > 1 ? `${index + 1}. ` : ""}
                              {part}
                            </p>
                          ))}
                          <div className="mt-3 space-y-2">
                            {task.options.map((option) => (
                              <button
                                key={option}
                                type="button"
                                onClick={() =>
                                  setPracticeState((prev) => ({
                                    ...prev,
                                    p2CohesionAnswers: {
                                      ...prev.p2CohesionAnswers,
                                      [i]: option,
                                    },
                                  }))
                                }
                                className={`block w-full rounded-xl border p-2 text-left text-sm ${
                                  practiceState.p2CohesionAnswers[i] === option
                                    ? "border-blue-500 bg-blue-50 text-blue-700"
                                    : "bg-white"
                                }`}
                              >
                                {option}
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : task.type === "correction" ? (
                        <div className="mt-2 rounded-lg bg-white p-3">
                          <p className="font-semibold">{task.prompt}</p>
                          <p className="mt-2">{task.sentence}</p>
                        </div>
                      ) : (
                        <div className="mt-2 rounded-lg bg-white p-3">
                          <p className="font-semibold">{task.prompt}</p>
                          <p>1. {task.parts[0]}</p>
                          <p>2. {task.parts[1]}</p>
                        </div>
                      )}

                      {p2Hint.index === i && p2Hint.text && (
                        <div className="mt-2 rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700">
                          {p2Hint.text}
                        </div>
                      )}

                      {task.type !== "choice" && (
                        <input
                          value={practiceState.p2CohesionAnswers[i] || ""}
                          onChange={(e) =>
                            setPracticeState((prev) => ({
                              ...prev,
                              p2CohesionAnswers: {
                                ...prev.p2CohesionAnswers,
                                [i]: e.target.value,
                              },
                            }))
                          }
                          className="mt-3 w-full rounded-xl border p-2"
                          placeholder="Write your answer here..."
                        />
                      )}

                      <div className="mt-3 flex gap-2">
                        <button
                          type="button"
                          onClick={() => checkCohesion(i)}
                          className="rounded-xl bg-green-600 px-3 py-2 text-sm font-semibold text-white"
                        >
                          Check
                        </button>
                        <button
                          type="button"
                          onClick={() => getP2Hint(i)}
                          className="rounded-xl border bg-white px-3 py-2 text-sm font-semibold"
                        >
                          Hint
                        </button>
                      </div>

                      {practiceState.p2CohesionFeedback[i] !== undefined && (
                        <div
                          className={`mt-3 rounded-xl p-3 text-sm ${
                            practiceState.p2CohesionFeedback[i]
                              ? "bg-green-50 text-green-700"
                              : "bg-red-50 text-red-700"
                          }`}
                        >
                          {practiceState.p2CohesionFeedback[i]
                            ? "Correct."
                            : `Suggested answer: ${task.answer}`}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  };

  const renderAIFeedback = () => {
    if (!aiChecked) return null;
    if (aiErrors.length === 0) {
      return (
        <div className="mt-4 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm font-semibold text-green-700">
          AI Check did not find any language issues. Complete the Final
          Reflection and click Submit Practice 3 to earn 5 points.
        </div>
      );
    }
    return (
      <div className="mt-4 rounded-2xl border border-yellow-200 bg-yellow-50 p-4">
        <p className="font-bold text-yellow-900">AI Check Results</p>
        <p className="mt-1 text-sm text-yellow-800">
          ChatGPT has found some likely language issues. Please revise your
          paragraph by yourself, then run AI Check again. Corrections are not
          provided.
        </p>
        <div className="mt-3 space-y-2">
          {aiErrors.map((error, index) => (
            <div key={`${error.id}-${index}`} className="rounded-xl bg-white p-3">
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                {error.type || "language"}
              </p>
              <p className="mt-1 text-sm text-slate-800">{error.message}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderBand55SelfCheck = () => {
    if (!band55SelfCheckVisible) return null;
    return (
      <div className="mt-5 rounded-2xl border bg-white p-4">
        <p className="font-semibold">Self-checklist</p>
        <p className="mt-1 text-sm text-slate-600">
          Tick each item and copy one example from your paragraph before AI Check.
        </p>
        <div className="mt-3 space-y-3">
          <label className="flex gap-2 rounded-xl border bg-slate-50 p-3 text-sm">
            <input
              type="checkbox"
              checked={band55Checklist.passiveVoice}
              onChange={(e) =>
                setBand55Checklist((prev) => ({
                  ...prev,
                  passiveVoice: e.target.checked,
                }))
              }
            />
            <span>I used present simple passive voice to describe steps.</span>
          </label>
          <input
            value={band55Evidence.passiveVoice}
            onChange={(e) =>
              setBand55Evidence((prev) => ({
                ...prev,
                passiveVoice: e.target.value,
              }))
            }
            className="w-full rounded-xl border p-2 text-sm"
            placeholder="Copy one passive voice example from your paragraph."
          />
          <label className="flex gap-2 rounded-xl border bg-slate-50 p-3 text-sm">
            <input
              type="checkbox"
              checked={band55Checklist.cohesiveDevices}
              onChange={(e) =>
                setBand55Checklist((prev) => ({
                  ...prev,
                  cohesiveDevices: e.target.checked,
                }))
              }
            />
            <span>I used basic cohesive devices to show the order clearly.</span>
          </label>
          <input
            value={band55Evidence.cohesiveDevices}
            onChange={(e) =>
              setBand55Evidence((prev) => ({
                ...prev,
                cohesiveDevices: e.target.value,
              }))
            }
            className="w-full rounded-xl border p-2 text-sm"
            placeholder="Copy one cohesive device from your paragraph."
          />
          <label className="flex gap-2 rounded-xl border bg-slate-50 p-3 text-sm">
            <input
              type="checkbox"
              checked={band55Checklist.correctOrder}
              onChange={(e) =>
                setBand55Checklist((prev) => ({
                  ...prev,
                  correctOrder: e.target.checked,
                }))
              }
            />
            <span>I described the steps in the correct order.</span>
          </label>
        </div>
      </div>
    );
  };

  const renderBand6SelfCheck = () => {
    if (!band6SelfCheckVisible) return null;
    return (
      <div className="mt-5 rounded-2xl border bg-white p-4">
        <p className="font-semibold">Self-checklist</p>
        <p className="mt-1 text-sm text-slate-600">
          Tick each item and copy one example from your paragraph before AI Check.
        </p>
        <div className="mt-3 space-y-3">
          <label className="flex gap-2 rounded-xl border bg-slate-50 p-3 text-sm">
            <input
              type="checkbox"
              checked={band6Checklist.cohesiveDevices}
              onChange={(e) =>
                setBand6Checklist((prev) => ({
                  ...prev,
                  cohesiveDevices: e.target.checked,
                }))
              }
            />
            <span>I used cohesive devices to connect neighbouring steps.</span>
          </label>
          <input
            value={band6Evidence.cohesiveDevices}
            onChange={(e) =>
              setBand6Evidence((prev) => ({
                ...prev,
                cohesiveDevices: e.target.value,
              }))
            }
            className="w-full rounded-xl border p-2 text-sm"
            placeholder="Copy one cohesive device from your paragraph."
          />
          <label className="flex gap-2 rounded-xl border bg-slate-50 p-3 text-sm">
            <input
              type="checkbox"
              checked={band6Checklist.pronouns}
              onChange={(e) =>
                setBand6Checklist((prev) => ({
                  ...prev,
                  pronouns: e.target.checked,
                }))
              }
            />
            <span>I used a pronoun to avoid repeating the same noun.</span>
          </label>
          <input
            value={band6Evidence.pronouns}
            onChange={(e) =>
              setBand6Evidence((prev) => ({
                ...prev,
                pronouns: e.target.value,
              }))
            }
            className="w-full rounded-xl border p-2 text-sm"
            placeholder="Copy one pronoun example, such as it / they / them."
          />
          <label className="flex gap-2 rounded-xl border bg-slate-50 p-3 text-sm">
            <input
              type="checkbox"
              checked={band6Checklist.structure}
              onChange={(e) =>
                setBand6Checklist((prev) => ({
                  ...prev,
                  structure: e.target.checked,
                }))
              }
            />
            <span>
              I used at least one sentence-combining structure from Practice 2.
            </span>
          </label>
          <input
            value={band6Evidence.structure}
            onChange={(e) =>
              setBand6Evidence((prev) => ({
                ...prev,
                structure: e.target.value,
              }))
            }
            className="w-full rounded-xl border p-2 text-sm"
            placeholder="Copy one combined sentence from your paragraph."
          />
        </div>
      </div>
    );
  };

  const renderBand65SelfCheck = () => {
    if (!band65SelfCheckVisible) return null;
    return (
      <div className="mt-5 rounded-2xl border bg-white p-4">
        <p className="font-semibold">Self-checklist</p>
        <p className="mt-1 text-sm text-slate-600">
          Tick each item and copy one example from your paragraph before AI Check.
        </p>
        <div className="mt-3 space-y-3">
          <label className="flex gap-2 rounded-xl border bg-slate-50 p-3 text-sm">
            <input
              type="checkbox"
              checked={band65Checklist.details}
              onChange={(e) =>
                setBand65Checklist((prev) => ({
                  ...prev,
                  details: e.target.checked,
                }))
              }
            />
            <span>
              I included specific diagram details, such as tools, machines,
              materials, locations or final examples.
            </span>
          </label>
          <input
            value={band65Evidence.details}
            onChange={(e) =>
              setBand65Evidence((prev) => ({
                ...prev,
                details: e.target.value,
              }))
            }
            className="w-full rounded-xl border p-2 text-sm"
            placeholder="Copy one specific diagram detail from your paragraph."
          />
          <label className="flex gap-2 rounded-xl border bg-slate-50 p-3 text-sm">
            <input
              type="checkbox"
              checked={band65Checklist.complexStructure}
              onChange={(e) =>
                setBand65Checklist((prev) => ({
                  ...prev,
                  complexStructure: e.target.checked,
                }))
              }
            />
            <span>
              I used at least one sentence-upgrade expression from Practice 1.
            </span>
          </label>
          <input
            value={band65Evidence.practice1}
            onChange={(e) =>
              setBand65Evidence((prev) => ({
                ...prev,
                practice1: e.target.value,
              }))
            }
            className="w-full rounded-xl border p-2 text-sm"
            placeholder="Copy one sentence-upgrade expression from your paragraph."
          />
          <label className="flex gap-2 rounded-xl border bg-slate-50 p-3 text-sm">
            <input
              type="checkbox"
              checked={band65Checklist.stageLogic}
              onChange={(e) =>
                setBand65Checklist((prev) => ({
                  ...prev,
                  stageLogic: e.target.checked,
                }))
              }
            />
            <span>
              I used at least one cohesive structure from Practice 2 and grouped
              neighbouring steps logically.
            </span>
          </label>
          <input
            value={band65Evidence.practice2}
            onChange={(e) =>
              setBand65Evidence((prev) => ({
                ...prev,
                practice2: e.target.value,
              }))
            }
            className="w-full rounded-xl border p-2 text-sm"
            placeholder="Copy one cohesive structure from your paragraph."
          />
        </div>
      </div>
    );
  };

  const renderPractice3 = () => {
    return (
      <Card title="Practice 3 - BODY PARAGRAPH WRITING">
        <p className="mb-3 text-sm text-slate-600">
          Practice 3 is worth 5 points. Write your body paragraph, complete the
          self-checklist, pass AI Check, complete Final Reflection, and click
          Submit Practice 3 to earn the points.
        </p>
        <div className="rounded-2xl border bg-slate-50 p-4 text-sm text-slate-700">
          <p className="font-semibold">Writing target</p>
          <p className="mt-1">
            Write {minWords}-{maxWords} words within 20 minutes. Start from the
            main process steps. You do not need to write the introduction or
            overview in this practice.
          </p>
          <p className="mt-1">
            Timer:{" "}
            <span
              className={
                p3ElapsedSeconds > suggestedWritingSeconds
                  ? "font-bold text-red-600"
                  : "font-bold text-slate-800"
              }
            >
              {formatTime(p3ElapsedSeconds)}
            </span>{" "}
            / 20:00
          </p>
        </div>
        <textarea
          value={practiceState.p3Writing}
          onChange={(e) => {
            const value = e.target.value;
            setPracticeState((prev) => ({
              ...prev,
              p3Writing: value,
              p3Submitted: false,
            }));
            if (!p3TimerStarted && value.trim().length > 0) {
              setP3TimerStarted(true);
            }
            setAiFeedback(null);
          }}
          rows={10}
          className="mt-4 w-full rounded-2xl border p-4"
          placeholder="Write your body paragraph here..."
        />
        <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-600">
          <span>
            Word count:{" "}
            <strong
              className={
                wordCount < minWords || wordCount > maxWords + 20
                  ? "text-red-600"
                  : "text-green-700"
              }
            >
              {wordCount}
            </strong>
          </span>
          <span>
            Target: {minWords}-{maxWords} words
          </span>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={showSelfCheck}
            className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
          >
            Submit for Self-check
          </button>
          <button
            type="button"
            onClick={getAIFeedback}
            disabled={aiLoading}
            className={`rounded-xl px-4 py-2 text-sm font-semibold text-white ${
              aiLoading
                ? "cursor-not-allowed bg-slate-400"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {aiLoading ? "Checking..." : "AI Check"}
          </button>
        </div>
        {writingHint && (
          <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700">
            {writingHint}
          </div>
        )}
        {level === "band55" && renderBand55SelfCheck()}
        {level === "band6" && renderBand6SelfCheck()}
        {level === "band65" && renderBand65SelfCheck()}
        {renderAIFeedback()}
        {aiHasNoErrors && (
          <div className="mt-5 rounded-2xl border bg-white p-4">
            <p className="font-semibold">Final Reflection</p>
            <p className="mt-1 text-sm text-slate-600">
              Complete the reflection after your paragraph has passed AI Check.
              Focus on what you checked, revised or improved.
            </p>
            <div className="mt-3 space-y-2">
              {practiceState.p3Reflection.map((item, i) => (
                <input
                  key={i}
                  value={item}
                  onChange={(e) =>
                    setPracticeState((prev) => {
                      const copy = [...prev.p3Reflection];
                      copy[i] = e.target.value;
                      return { ...prev, p3Reflection: copy };
                    })
                  }
                  className="w-full rounded-xl border p-2"
                  placeholder={finalReflectionQuestions[i]}
                />
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={submitPractice3}
                disabled={earned.p3}
                className={`rounded-xl px-4 py-2 text-sm font-semibold text-white ${
                  earned.p3
                    ? "cursor-not-allowed bg-slate-400"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {earned.p3
                  ? "Submitted - +5 points earned"
                  : "Submit Practice 3"}
              </button>
            </div>
          </div>
        )}
      </Card>
    );
  };

  const renderAnimationLeadIn = () => {
    if (!videoEnded) {
      return (
        <Card title="Animation Lead-in">
          <p className="mb-4 text-sm text-slate-600">
            Watch the process animation first. The process diagram will appear
            after the video finishes.
          </p>
          <div className="overflow-hidden rounded-2xl border bg-black">
            <video
              className="w-full"
              controls
              preload="metadata"
              onPlay={() => setVideoStarted(true)}
              onEnded={() => setVideoEnded(true)}
            >
              <source src={current.video} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
          {!videoStarted && (
            <p className="mt-3 text-sm text-slate-500">
              Click the video to start watching.
            </p>
          )}
        </Card>
      );
    }

    return (
      <Card title={current.title}>
        <p className="text-sm text-slate-600">{current.task}</p>
        <div className="mt-4 overflow-hidden rounded-2xl border bg-white">
          <img
            src={current.image}
            alt={`${current.title} process diagram`}
            className="max-h-[520px] w-full object-contain"
          />
        </div>
        <div className="mt-4 rounded-2xl border bg-green-50 p-4 text-sm text-green-700">
          Animation completed. You can now use the process diagram to complete
          the practice tasks.
        </div>
      </Card>
    );
  };

  return (
    <main className="min-h-screen bg-slate-50 p-4 text-slate-900 md:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="rounded-3xl border bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">IELTS Process Writing Trainer</h1>
              <p className="mt-2 max-w-3xl text-sm text-slate-600">Practise IELTS Academic Writing Task 1 process diagrams through sentence-level training, cohesive-device practice and timed body paragraph writing.</p>
            </div>
            <div className="rounded-2xl border bg-blue-50 p-4 text-sm">
              <p className="font-semibold text-blue-900">Current achievement</p>
              <p className="mt-1 text-lg font-bold text-blue-700">Score: {totalScore} / 10 - {achievement}</p>
              <div className="mt-3 flex flex-wrap gap-2 text-sm">
                {[
                  ["p1", "Practice 1", "2"],
                  ["p2", "Practice 2", "3"],
                  ["p3", "Practice 3", "5"],
                ].map(([key, label, points]) => (
                  <span key={key} className={`rounded-full px-3 py-1 font-semibold ${earned[key] ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-600"}`}>
                    {label}: {earned[key] ? `+${points} earned` : `${points} points`}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="process-select" className="text-sm font-semibold text-slate-700">Choose a process diagram</label>
              <select
                id="process-select"
                value={processKey}
                onChange={(e) => {
                  setProcessKey(e.target.value);
                  resetAllPracticeStates();
                }}
                className="mt-2 w-full rounded-xl border bg-white p-3 text-sm"
              >
                {Object.entries(processData).map(([key, item]) => <option key={key} value={key}>{item.title}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="level-select" className="text-sm font-semibold text-slate-700">Choose your target level</label>
              <select
                id="level-select"
                value={level}
                onChange={(e) => {
                  setLevel(e.target.value);
                  resetAllPracticeStates();
                }}
                className="mt-2 w-full rounded-xl border bg-white p-3 text-sm"
              >
                <option value="band55">Band 5.5</option>
                <option value="band6">Band 6</option>
                <option value="band65">Band 6.5</option>
              </select>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
          {renderAnimationLeadIn()}
          <div className="space-y-4">
            {!videoEnded ? (
              <Card title="Practice locked">
                <p className="text-sm text-slate-600">
                  Please watch the animation first. The practice tasks will be
                  unlocked after the video finishes.
                </p>
              </Card>
            ) : (
              <>
                <div role="tablist" aria-label="Practice tabs" className="flex flex-wrap gap-2 rounded-2xl border bg-white p-3 shadow-sm">
                  <Tab value="practice1" label="Practice 1" activePractice={activePractice} onSelect={setActivePractice} />
                  <Tab value="practice2" label="Practice 2" activePractice={activePractice} onSelect={setActivePractice} />
                  <Tab value="practice3" label="Practice 3" activePractice={activePractice} onSelect={setActivePractice} />
                </div>
                {activePractice === "practice1" && renderPractice1()}
                {activePractice === "practice2" && renderPractice2()}
                {activePractice === "practice3" && renderPractice3()}
              </>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
