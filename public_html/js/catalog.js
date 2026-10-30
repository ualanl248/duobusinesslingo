window.BLOCK_CATALOG = [
    { id: 'workplace_pro', name: 'Inglés para el Trabajo', desc: 'Correos, reuniones y vocabulario profesional.', icon: 'W', image: 'https://images.unsplash.com/photo-1556761175-4b46a572b786?auto=format&fit=crop&w=1200&q=80' },
    { id: 'travel_ready', name: 'Inglés para Viajar', desc: 'Frases útiles, reservas, emergencias y cultura.', icon: 'T', image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80' },
    { id: 'academic_boost', name: 'Inglés Académico', desc: 'Ensayos, abstracts y vocabulario universitario.', icon: 'A', image: 'https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&w=1200&q=80' },
    { id: 'social_conversation', name: 'Club de Conversación', desc: 'Temas cotidianos, slang útil y expresiones naturales.', icon: 'C', image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=80' },
    { id: 'pronunciation_lab', name: 'Pronunciación y Fluidez', desc: 'Patrones sonoros, ritmo y claridad al hablar.', icon: 'P', image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=80' },
    { id: 'listening_real', name: 'Listening en la Vida Real', desc: 'Audios diarios, acentos y comprensión rápida.', icon: 'L', image: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=1200&q=80' },
    { id: 'writing_clinic', name: 'Writing Profesional', desc: 'Estructura correos y reportes sin errores.', icon: 'E', image: 'https://images.unsplash.com/photo-1529070538774-1843cb3265df?auto=format&fit=crop&w=1200&q=80' },
    { id: 'reading_focus', name: 'Lectura y Vocabulario', desc: 'Comprensión rápida y ampliación de palabras.', icon: 'R', image: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1200&q=80' },
    { id: 'fast_track', name: 'Ruta Intensiva', desc: 'Plan corto y frecuente para avanzar rápido.', icon: 'F', image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80' },
    { id: 'steady_growth', name: 'Hábito Diario', desc: 'Rutina ligera para mantener constancia.', icon: 'H', image: 'https://images.unsplash.com/photo-1504384764586-bb4cdc1707b0?auto=format&fit=crop&w=1200&q=80' },
    { id: 'presentations_story', name: 'Presentaciones y Storytelling', desc: 'Estructura ideas y gana seguridad al exponer.', icon: 'S', image: 'https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=1200&q=80' },
    { id: 'interview_ready', name: 'Entrevistas y CV', desc: 'Responde preguntas típicas y mejora tu pitch.', icon: 'I', image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80' }
];

window.BLOCK_ID_MAP = {
    workplace_pro: 1,
    travel_ready: 2,
    academic_boost: 3,
    social_conversation: 4,
    pronunciation_lab: 5,
    listening_real: 6,
    writing_clinic: 7,
    reading_focus: 8,
    fast_track: 9,
    steady_growth: 10,
    presentations_story: 11,
    interview_ready: 12
};

window.BLOCK_TRANSLATIONS = {
    ES: {}, // Usa default
    EN: {
        workplace_pro: { name: 'English for Work', desc: 'Emails, meetings and professional vocabulary.' },
        travel_ready: { name: 'English for Travel', desc: 'Useful phrases, reservations and emergencies.' },
        academic_boost: { name: 'Academic English', desc: 'Essays, abstracts and university vocabulary.' },
        social_conversation: { name: 'Conversation Club', desc: 'Daily topics, slang and natural expressions.' },
        pronunciation_lab: { name: 'Pronunciation & Flow', desc: 'Sound patterns, rhythm and clarity.' },
        listening_real: { name: 'Real Life Listening', desc: 'Daily audio, accents and quick comprehension.' },
        writing_clinic: { name: 'Professional Writing', desc: 'Structure emails and reports without errors.' },
        reading_focus: { name: 'Reading & Vocabulary', desc: 'Quick comprehension and word expansion.' },
        fast_track: { name: 'Fast Track', desc: 'Short, frequent plan to advance quickly.' },
        steady_growth: { name: 'Daily Habit', desc: 'Light routine to maintain consistency.' },
        presentations_story: { name: 'Presentations', desc: 'Structure ideas and gain confidence.' },
        interview_ready: { name: 'Interviews & CV', desc: 'Answer typical questions and improve your pitch.' }
    },
    PT: {
        workplace_pro: { name: 'Inglês para o Trabalho', desc: 'E-mails, reuniões e vocabulário profissional.' },
        travel_ready: { name: 'Inglês para Viajar', desc: 'Frases úteis, reservas e emergências.' },
        academic_boost: { name: 'Inglês Acadêmico', desc: 'Ensaios, abstracts e vocabulário universitário.' },
        social_conversation: { name: 'Clube de Conversação', desc: 'Tópicos diários, gírias e expressões naturais.' },
        pronunciation_lab: { name: 'Pronúncia e Fluidez', desc: 'Padrões sonoros, ritmo e clareza.' },
        listening_real: { name: 'Listening na Vida Real', desc: 'Áudios diários, sotaques e compreensão rápida.' },
        writing_clinic: { name: 'Writing Profissional', desc: 'Estrutura e-mails e relatórios sem erros.' },
        reading_focus: { name: 'Leitura e Vocabulário', desc: 'Compreensão rápida e expansão de palavras.' },
        fast_track: { name: 'Rota Intensiva', desc: 'Plano curto e frequente para avançar rápido.' },
        steady_growth: { name: 'Hábito Diário', desc: 'Rotina leve para manter a constância.' },
        presentations_story: { name: 'Apresentações', desc: 'Estruture ideias e ganhe segurança.' },
        interview_ready: { name: 'Entrevistas e CV', desc: 'Responda perguntas típicas e melhore seu pitch.' }
    }
};
