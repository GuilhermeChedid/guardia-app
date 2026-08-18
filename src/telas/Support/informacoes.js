document.addEventListener('DOMContentLoaded', () => {

    // Base de Dados de Publicações
    const postsData = {
        1: {
            id: 1,
            badge: 'Saúde Mental',
            badgeClass: 'badge-pink',
            time: 'Hoje, 08:00',
            title: 'Cuidar de você é o primeiro passo',
            image: 'https://images.unsplash.com/photo-1544027993-37dbfe43562a?auto=format&fit=crop&w=800&q=80',
            paragraphs: [
                'Situações de violência e abuso deixam marcas emocionais profundas. Buscar apoio psicológico não é fraqueza — é um ato de coragem e autocuidado.',
                'O CAPS (Centro de Atenção Psicossocial) oferece atendimento gratuito em todo o Brasil. Você merece se sentir bem, segura e acolhida.'
            ],
            likes: 218,
            isLiked: false,
            comments: [
                {
                    author: 'Beatriz A.',
                    avatar: 'B',
                    time: '08:34',
                    text: 'Esse post chegou no momento certo. Obrigada, Guardiã. 💜'
                }
            ]
        },
        2: {
            id: 2,
            badge: 'Rede de Apoio',
            badgeClass: 'badge-pink',
            time: 'Hoje, 07:30',
            title: 'Você não está sozinha — juntas somos mais fortes',
            image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=80',
            paragraphs: [
                'Construir uma rede de apoio de pessoas de confiança é uma das estratégias mais importantes para se proteger.',
                'Mantenha contato constante com amigas, familiares ou instituições que possam oferecer acolhimento em momentos de vulnerabilidade.'
            ],
            likes: 174,
            isLiked: false,
            comments: [
                {
                    author: 'Carla M.',
                    avatar: 'C',
                    time: '07:45',
                    text: 'Muito importante espalhar essa mensagem!'
                },
                {
                    author: 'Fernanda S.',
                    avatar: 'F',
                    time: '08:12',
                    text: 'Nenhuma de nós está sozinha! 💪'
                }
            ]
        },
        3: {
            id: 3,
            badge: 'Direitos',
            badgeClass: 'badge-blue',
            time: '11 ago, 11:00',
            title: 'A Justiça está do seu lado',
            image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80',
            paragraphs: [
                'A legislação brasileira é uma das mais avançadas do mundo na proteção da mulher. Além da Lei Maria da Penha, existem diversas medidas protetivas de urgência.',
                'Conheça seus direitos e saiba como recorrer às autoridades competentes sempre que necessário.'
            ],
            likes: 131,
            isLiked: false,
            comments: []
        },
        4: {
            id: 4,
            badge: 'Conscientização',
            badgeClass: 'badge-pink',
            time: 'Hoje, 10:00',
            title: 'Reconhecendo sinais de violência doméstica',
            image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80',
            paragraphs: [
                'A violência doméstica nem sempre deixa marcas visíveis. Aprenda a identificar comportamentos abusivos como controle excessivo e isolamento social.',
                'Reconhecer os sinais no início é fundamental para romper ciclos antes que se tornem perigosos.'
            ],
            likes: 95,
            isLiked: false,
            comments: [
                {
                    author: 'Juliana R.',
                    avatar: 'J',
                    time: '10:15',
                    text: 'Informação salva vidas. Parabéns pelo conteúdo!'
                },
                {
                    author: 'Patrícia L.',
                    avatar: 'P',
                    time: '10:30',
                    text: 'Compartilhando com minhas amigas.'
                },
                {
                    author: 'Amanda V.',
                    avatar: 'A',
                    time: '10:42',
                    text: 'Excelente explicação!'
                }
            ]
        }
    };

    const appScreen = document.getElementById('app-screen');
    const backBtn = document.getElementById('back-btn');

    // Elementos da Tela de Detalhes
    const detailBadge = document.getElementById('detail-badge');
    const detailTime = document.getElementById('detail-time');
    const detailTitle = document.getElementById('detail-title');
    const detailBody = document.getElementById('detail-body');
    const detailImage = document.getElementById('detail-image');
    const detailImageWrapper = detailImage.closest('.detail-image-wrapper');
    const detailHeartPop = detailImageWrapper.querySelector('.heart-pop');
    const detailLikeBtn = document.getElementById('detail-like-btn');
    const detailLikeCount = document.getElementById('detail-like-count');
    const detailCommentCount = document.getElementById('detail-comment-count');
    const commentsList = document.getElementById('comments-list');
    const commentInput = document.getElementById('comment-input');
    const sendCommentBtn = document.getElementById('send-comment-btn');

    let currentPostId = null;

    // Dispara animação de coração gigante na imagem
    function triggerHeartPop(heartElem) {
        heartElem.classList.remove('animate');
        void heartElem.offsetWidth;
        heartElem.classList.add('animate');
    }

    // Renderiza Comentários na Tela de Detalhes
    function renderComments(comments) {
        commentsList.innerHTML = '';
        if (comments.length === 0) {
            commentsList.innerHTML = `<p style="font-size: 12px; color: #71717a; font-style: italic;">Seja a primeira a comentar nesta publicação.</p>`;
            return;
        }

        comments.forEach(c => {
            const item = document.createElement('div');
            item.className = 'comment-item';
            item.innerHTML = `
                <div class="comment-avatar">${c.avatar}</div>
                <div class="comment-bubble">
                    <div class="comment-header">
                        <span class="comment-author">${c.author}</span>
                        <span class="comment-time">${c.time}</span>
                    </div>
                    <p class="comment-text">${c.text}</p>
                </div>
            `;
            commentsList.appendChild(item);
        });
    }

    // Abre a publicação completa
    function openPost(postId) {
        currentPostId = postId;
        const post = postsData[postId];
        if (!post) return;

        detailBadge.textContent = post.badge;
        detailBadge.className = `badge ${post.badgeClass}`;
        detailTime.textContent = post.time;
        detailTitle.textContent = post.title;

        // Renderiza Parágrafos
        detailBody.innerHTML = '';
        post.paragraphs.forEach(pText => {
            const p = document.createElement('p');
            p.textContent = pText;
            detailBody.appendChild(p);
        });

        detailImage.src = post.image;
        detailLikeCount.textContent = post.likes;
        detailCommentCount.textContent = post.comments.length;

        // Estado do botão de curtir
        const likeIcon = detailLikeBtn.querySelector('i');
        if (post.isLiked) {
            detailLikeBtn.classList.add('liked');
            likeIcon.className = 'fa-solid fa-heart';
        } else {
            detailLikeBtn.classList.remove('liked');
            likeIcon.className = 'fa-regular fa-heart';
        }

        renderComments(post.comments);
        appScreen.classList.add('show-detail');
    }

    // Fecha a publicação e volta ao Feed
    function closePost() {
        appScreen.classList.remove('show-detail');
    }

    backBtn.addEventListener('click', closePost);

    // Configura eventos nos Cards do Feed
    document.querySelectorAll('.info-card').forEach(card => {
        const postId = parseInt(card.getAttribute('data-post-id'), 10);
        const imageWrapper = card.querySelector('.card-image-wrapper');
        const heartPop = card.querySelector('.heart-pop');
        const likeBtn = card.querySelector('.like-btn');
        const likeIcon = likeBtn.querySelector('i');
        const likeCount = card.querySelector('.like-count');

        // Alterna curtida
        function toggleLike(force = false) {
            const post = postsData[postId];
            if (!post) return;

            if (force) {
                if (!post.isLiked) {
                    post.isLiked = true;
                    post.likes++;
                }
            } else {
                post.isLiked = !post.isLiked;
                post.likes += post.isLiked ? 1 : -1;
            }

            likeCount.textContent = post.likes;
            if (post.isLiked) {
                likeBtn.classList.add('liked');
                likeIcon.className = 'fa-solid fa-heart';
            } else {
                likeBtn.classList.remove('liked');
                likeIcon.className = 'fa-regular fa-heart';
            }

            // Atualiza tela de detalhe se estiver aberta
            if (currentPostId === postId) {
                detailLikeCount.textContent = post.likes;
                const dIcon = detailLikeBtn.querySelector('i');
                if (post.isLiked) {
                    detailLikeBtn.classList.add('liked');
                    dIcon.className = 'fa-solid fa-heart';
                } else {
                    detailLikeBtn.classList.remove('liked');
                    dIcon.className = 'fa-regular fa-heart';
                }
            }
        }

        likeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleLike();
            if (postsData[postId].isLiked) {
                triggerHeartPop(heartPop);
            }
        });

        // Duplo clique na imagem do feed
        imageWrapper.addEventListener('dblclick', (e) => {
            e.stopPropagation();
            toggleLike(true);
            triggerHeartPop(heartPop);
        });

        // Abrir post ao clicar no card, título ou "Ler mais"
        card.addEventListener('click', (e) => {
            if (e.target.closest('.stat-btn')) return;
            openPost(postId);
        });
    });

    // Curtida na Tela de Detalhes
    detailLikeBtn.addEventListener('click', () => {
        if (!currentPostId) return;
        const post = postsData[currentPostId];
        post.isLiked = !post.isLiked;
        post.likes += post.isLiked ? 1 : -1;

        detailLikeCount.textContent = post.likes;
        const dIcon = detailLikeBtn.querySelector('i');
        if (post.isLiked) {
            detailLikeBtn.classList.add('liked');
            dIcon.className = 'fa-solid fa-heart';
            triggerHeartPop(detailHeartPop);
        } else {
            detailLikeBtn.classList.remove('liked');
            dIcon.className = 'fa-regular fa-heart';
        }

        // Sincroniza card correspondente no feed
        const feedCard = document.querySelector(`.info-card[data-post-id="${currentPostId}"]`);
        if (feedCard) {
            feedCard.querySelector('.like-count').textContent = post.likes;
            const fLikeBtn = feedCard.querySelector('.like-btn');
            const fIcon = fLikeBtn.querySelector('i');
            if (post.isLiked) {
                fLikeBtn.classList.add('liked');
                fIcon.className = 'fa-solid fa-heart';
            } else {
                fLikeBtn.classList.remove('liked');
                fIcon.className = 'fa-regular fa-heart';
            }
        }
    });

    // Duplo clique na imagem de Detalhes
    detailImageWrapper.addEventListener('dblclick', () => {
        if (!currentPostId) return;
        const post = postsData[currentPostId];
        if (!post.isLiked) {
            post.isLiked = true;
            post.likes++;
            detailLikeCount.textContent = post.likes;
            detailLikeBtn.classList.add('liked');
            detailLikeBtn.querySelector('i').className = 'fa-solid fa-heart';

            const feedCard = document.querySelector(`.info-card[data-post-id="${currentPostId}"]`);
            if (feedCard) {
                feedCard.querySelector('.like-count').textContent = post.likes;
                const fLikeBtn = feedCard.querySelector('.like-btn');
                fLikeBtn.classList.add('liked');
                fLikeBtn.querySelector('i').className = 'fa-solid fa-heart';
            }
        }
        triggerHeartPop(detailHeartPop);
    });

    // Adicionar Novo Comentário
    function handleAddComment() {
        const text = commentInput.value.trim();
        if (!text || !currentPostId) return;

        const post = postsData[currentPostId];
        const now = new Date();
        const timeStr = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');

        const newComment = {
            author: 'Você',
            avatar: 'M',
            time: timeStr,
            text: text
        };

        post.comments.push(newComment);
        commentInput.value = '';

        // Atualiza contadores
        detailCommentCount.textContent = post.comments.length;
        const feedCard = document.querySelector(`.info-card[data-post-id="${currentPostId}"]`);
        if (feedCard) {
            feedCard.querySelector('.comment-count').textContent = post.comments.length;
        }

        renderComments(post.comments);
    }

    sendCommentBtn.addEventListener('click', handleAddComment);
    commentInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleAddComment();
        }
    });

});