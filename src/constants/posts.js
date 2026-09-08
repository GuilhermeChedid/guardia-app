export const POST_CATEGORIES = ['Saúde Mental', 'Rede de Apoio', 'Direitos', 'Conscientização'];

export const POSTS = [
    {
        id: 1,
        badge: 'Saúde Mental',
        badgeClass: 'pink',
        time: 'Hoje, 08:00',
        title: 'Cuidar de você é o primeiro passo',
        excerpt: 'Situações de violência e abuso deixam marcas emocionais profundas. Buscar apoio psicológico não é fraqueza — é...',
        image: 'https://images.unsplash.com/photo-1544027993-37dbfe43562a?auto=format&fit=crop&w=800&q=80',
        paragraphs: [
            'Situações de violência e abuso deixam marcas emocionais profundas. Buscar apoio psicológico não é fraqueza — é um ato de coragem e autocuidado.',
            'O CAPS (Centro de Atenção Psicossocial) oferece atendimento gratuito em todo o Brasil. Você merece se sentir bem, segura e acolhida.',
        ],
        likes: 218,
        isLiked: false,
        comments: [
            { author: 'Beatriz A.', avatar: 'B', time: '08:34', text: 'Esse post chegou no momento certo. Obrigada, Guardiã. 💜' },
        ],
    },
    {
        id: 2,
        badge: 'Rede de Apoio',
        badgeClass: 'pink',
        time: 'Hoje, 07:30',
        title: 'Você não está sozinha — juntas somos mais fortes',
        excerpt: 'Construir uma rede de apoio de pessoas de confiança é uma das estratégias mais importantes para se proteger.',
        image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=80',
        paragraphs: [
            'Construir uma rede de apoio de pessoas de confiança é uma das estratégias mais importantes para se proteger e lidar com situações de vulnerabilidade.',
            'Mantenha contato constante com amigas, familiares ou instituições que possam oferecer acolhimento seguro.',
        ],
        likes: 174,
        isLiked: false,
        comments: [
            { author: 'Carla M.', avatar: 'C', time: '07:45', text: 'Muito importante espalhar essa mensagem!' },
            { author: 'Fernanda S.', avatar: 'F', time: '08:12', text: 'Nenhuma de nós está sozinha!' },
        ],
    },
    {
        id: 3,
        badge: 'Direitos',
        badgeClass: 'blue',
        time: '11 ago, 11:00',
        title: 'A Justiça está do seu lado',
        excerpt: 'A legislação brasileira é uma das mais avançadas do mundo na proteção da mulher. Além da Lei Maria da...',
        image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80',
        paragraphs: [
            'A legislação brasileira é uma das mais avançadas do mundo na proteção da mulher. Além da Lei Maria da Penha, existem diversos mecanismos de proteção.',
            'Conheça seus direitos e saiba como recorrer às autoridades competentes sempre que necessário.',
        ],
        likes: 131,
        isLiked: false,
        comments: [],
    },
    {
        id: 4,
        badge: 'Conscientização',
        badgeClass: 'pink',
        time: 'Hoje, 10:00',
        title: 'Reconhecendo sinais de violência doméstica',
        excerpt: 'A violência doméstica nem sempre deixa marcas visíveis. Aprenda a identificar comportamentos abusivos...',
        image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80',
        paragraphs: [
            'A violência doméstica nem sempre deixa marcas visíveis. Aprenda a identificar comportamentos abusivos no dia a dia.',
            'Reconhecer os sinais no início é fundamental para romper ciclos antes que se tornem perigosos.',
        ],
        likes: 95,
        isLiked: false,
        comments: [
            { author: 'Juliana R.', avatar: 'J', time: '10:15', text: 'Informação salva vidas. Parabéns pelo conteúdo!' },
        ],
    },
];