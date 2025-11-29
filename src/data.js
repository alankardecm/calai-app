export const userProfile = {
  name: "Alan", // Assuming user name or generic
  stats: {
    age: "35-45",
    height: "1.75-1.80m",
    weight: "100-110kg",
    bodyFat: "30-35%",
    goalWeight: "90-95kg",
    goalBodyFat: "15-18%"
  },
  goals: [
    "Perder 0.8-1kg de gordura por semana",
    "Manter/ganhar massa muscular",
    "Secar barriga e firmar peito em 12 semanas"
  ]
};

export const workouts = [
  {
    id: "push",
    day: "Segunda",
    title: "Push (Peito, Ombro, Tríceps)",
    exercises: [
      { name: "Supino Reto (Máquina ou Halteres)", sets: 4, reps: "8-12" },
      { name: "Supino Inclinado (Halteres)", sets: 3, reps: "10-12" },
      { name: "Crucifixo (Máquina ou Cabo)", sets: 3, reps: "12-15" },
      { name: "Elevação Lateral (Halteres)", sets: 4, reps: "12-15" },
      { name: "Tríceps Pulley", sets: 3, reps: "12" },
      { name: "Tríceps Testa", sets: 3, reps: "12" }
    ]
  },
  {
    id: "pull",
    day: "Terça",
    title: "Pull (Costas, Bíceps)",
    exercises: [
      { name: "Puxada Frente ou Pulley", sets: 4, reps: "8-12" },
      { name: "Remada Curvada (Halteres ou Máquina)", sets: 4, reps: "10-12" },
      { name: "Remada Baixa (Cabo)", sets: 3, reps: "12-15" },
      { name: "Face Pull (Cabo)", sets: 3, reps: "15" },
      { name: "Rosca Direta", sets: 3, reps: "12" },
      { name: "Rosca Martelo", sets: 3, reps: "12" }
    ]
  },
  {
    id: "rest1",
    day: "Quarta",
    title: "Descanso Ativo / Cardio",
    exercises: [
      { name: "Caminhada Rápida ou Esteira Inclinada", sets: "1", reps: "40-60 min" }
    ]
  },
  {
    id: "legs",
    day: "Quinta",
    title: "Legs (Pernas + Core)",
    exercises: [
      { name: "Agachamento Livre ou Hack", sets: 4, reps: "8-12" },
      { name: "Leg Press ou Afundo", sets: 4, reps: "10-12" },
      { name: "Cadeira Extensora", sets: 3, reps: "12-15" },
      { name: "Mesa Flexora", sets: 3, reps: "12-15" },
      { name: "Panturrilha em Pé", sets: 4, reps: "15-20" },
      { name: "Abdominal Prancha", sets: 3, reps: "Máx" },
      { name: "Elevação de Pernas", sets: 3, reps: "15" }
    ]
  },
  {
    id: "fullbody",
    day: "Sexta/Sábado",
    title: "Full Body (Metabólico + Fraquezas)",
    exercises: [
      { name: "Supino Reto", sets: 3, reps: "8" },
      { name: "Remada Curvada", sets: 3, reps: "10" },
      { name: "Agachamento ou Leg Press", sets: 3, reps: "10" },
      { name: "Desenvolvimento Ombro", sets: 3, reps: "12" },
      { name: "HIIT (Esteira/Bike)", sets: "8-10 rounds", reps: "30s sprint / 90s lento" }
    ]
  }
];

export const dietPlan = {
  macros: {
    protein: "200-220g",
    carbs: "150-200g",
    fats: "60-80g",
    calories: "2100-2300 kcal"
  },
  meals: [
    {
      id: "breakfast",
      name: "Café da Manhã",
      calories: "500 kcal",
      items: [
        "6 claras + 2 ovos inteiros",
        "50g aveia com whey ou pasta de amendoim light",
        "1 fruta (maçã ou morango)"
      ]
    },
    {
      id: "snack1",
      name: "Lanche da Manhã",
      calories: "300 kcal",
      items: [
        "1 scoop whey + 30g aveia OR",
        "200g iogurte grego zero + 15g pasta de amendoim"
      ]
    },
    {
      id: "lunch",
      name: "Almoço",
      calories: "600-650 kcal",
      items: [
        "200g frango grelhado / patinho / peixe",
        "100-150g arroz integral ou batata-doce",
        "Salada à vontade + 10ml azeite",
        "100g brócolis/couve/abobrinha"
      ]
    },
    {
      id: "snack2",
      name: "Lanche da Tarde",
      calories: "300 kcal",
      items: [
        "150g cottage zero ou queijo minas light",
        "10g castanhas ou 1 fatia pão integral + peito de peru"
      ]
    },
    {
      id: "dinner",
      name: "Jantar",
      calories: "500 kcal",
      items: [
        "200g frango/peixe/patinho",
        "Salada grande + 10ml azeite",
        "100g batata-doce ou abóbora"
      ]
    }
  ]
};
