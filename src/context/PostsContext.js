import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';
import { POSTS } from '../constants/posts';

const PostsContext = createContext(null);

const formatCommentTime = (value) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);

    const now = new Date();
    const isSameDay = date.toDateString() === now.toDateString();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();
    const time = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    if (isSameDay) return `Hoje, ${time}`;
    if (isYesterday) return `Ontem, ${time}`;
    return `${date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}, ${time}`;
};

const getSafePostImage = (post) => {
    const image = post.imagem_url;
    if (typeof image === 'string' && image.trim() && !image.startsWith('blob:')) {
        return image;
    }
    return POSTS.find((item) => item.badge === post.categoria)?.image || POSTS[0].image;
};

const mapPost = (post) => ({
    ...post,
    title: post.titulo,
    badge: post.categoria,
    excerpt: post.conteudo?.split(/\n\s*\n/)[0]?.slice(0, 140) || '',
    paragraphs: post.conteudo?.split(/\n\s*\n/).filter(Boolean) || [],
    image: getSafePostImage(post),
    time: post.data_publicacao ? new Date(post.data_publicacao).toLocaleString('pt-BR') : 'Agora',
    likes: post.curtidas_count || 0,
    isLiked: post.is_liked,
    comments: (post.comentarios || [])
        .filter((comment) => comment.id)
        .map((comment) => ({ ...comment, time: formatCommentTime(comment.time) })),
});

export function PostsProvider({ children }) {
    const [posts, setPosts] = useState([]);
    const [user, setUser] = useState(null);

    const getCurrentUser = useCallback(async () => {
        const stored = await AsyncStorage.getItem('@guardia/auth_user');
        const currentUser = stored ? JSON.parse(stored) : null;
        setUser(currentUser);
        return currentUser;
    }, []);

    const refreshPosts = useCallback(async () => {
        const currentUser = await getCurrentUser();
        if (!currentUser?.id) return;
        const response = await api.get(`/posts?usuario_id=${currentUser.id}`);
        setPosts(response.data.posts.map(mapPost));
    }, [getCurrentUser]);

    useEffect(() => {
        refreshPosts().catch((error) => console.error('Erro ao carregar posts:', error));
    }, [refreshPosts]);

    const updatePost = async (postId, changes) => {
        const currentUser = await getCurrentUser();
        if (!currentUser?.id) throw new Error('Sessão de usuário não encontrada.');
        if (changes.isLiked !== undefined) {
            await api.post(`/posts/${postId}/like`, { usuario_id: currentUser.id });
        } else {
            await api.put(`/posts/${postId}`, {
                usuario_id: currentUser.id,
                titulo: changes.title,
                categoria: changes.badge,
                conteudo: (changes.paragraphs || []).join('\n\n'),
                imagem_url: changes.image,
            });
        }
        await refreshPosts();
    };

    const addPost = async (post) => {
        const currentUser = await getCurrentUser();
        if (!currentUser?.id) throw new Error('Sessão de usuário não encontrada.');
        await api.post('/posts', {
            usuario_id: currentUser.id,
            titulo: post.title,
            categoria: post.badge,
            conteudo: post.paragraphs.join('\n\n'),
            imagem_url: post.image,
        });
        await refreshPosts();
    };

    const deletePost = async (postId) => {
        const currentUser = await getCurrentUser();
        if (!currentUser?.id) throw new Error('Sessão de usuário não encontrada.');
        await api.delete(`/posts/${postId}`, { data: { usuario_id: currentUser.id } });
        await refreshPosts();
    };

    const addComment = async (postId, texto) => {
        const currentUser = await getCurrentUser();
        if (!currentUser?.id) throw new Error('Sessão de usuário não encontrada.');
        await api.post(`/posts/${postId}/comments`, { usuario_id: currentUser.id, texto });
        await refreshPosts();
    };

    const value = useMemo(() => ({
        posts, updatePost, addPost, deletePost, addComment, refreshPosts,
    }), [posts, getCurrentUser, refreshPosts]);

    return <PostsContext.Provider value={value}>{children}</PostsContext.Provider>;
}

export function usePosts() {
    const context = useContext(PostsContext);
    if (!context) throw new Error('usePosts must be used inside PostsProvider');
    return context;
}
