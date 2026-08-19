import React, { useMemo, useState } from 'react';
import {
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import MobileFrame from '../../components/MobileFrame/MobileFrame';
import BottomNav from '../../components/BottomNav/BottomNav';

const INITIAL_POSTS = [
    {
        id: 1,
        badge: 'Saude Mental',
        badgeClass: 'pink',
        time: 'Hoje, 08:00',
        title: 'Cuidar de voce e o primeiro passo',
        excerpt: 'Situacoes de violencia e abuso deixam marcas emocionais profundas. Buscar apoio psicologico nao e fraqueza — e...',
        image: 'https://images.unsplash.com/photo-1544027993-37dbfe43562a?auto=format&fit=crop&w=800&q=80',
        paragraphs: [
            'Situacoes de violencia e abuso deixam marcas emocionais profundas. Buscar apoio psicologico nao e fraqueza — e um ato de coragem e autocuidado.',
            'O CAPS oferece atendimento gratuito em todo o Brasil. Voce merece se sentir bem, segura e acolhida.',
        ],
        likes: 218,
        isLiked: false,
        comments: [{ author: 'Beatriz A.', avatar: 'B', time: '08:34', text: 'Esse post chegou no momento certo. Obrigada, Guardia.' }],
    },
    {
        id: 2,
        badge: 'Rede de Apoio',
        badgeClass: 'pink',
        time: 'Hoje, 07:30',
        title: 'Voce nao esta sozinha — juntas somos mais fortes',
        excerpt: 'Construir uma rede de apoio de pessoas de confianca e uma das estrategias mais importantes para se proteger.',
        image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=80',
        paragraphs: [
            'Construir uma rede de apoio de pessoas de confianca e uma das estrategias mais importantes para se proteger.',
            'Mantenha contato constante com amigas, familiares ou instituicoes que possam oferecer acolhimento.',
        ],
        likes: 174,
        isLiked: false,
        comments: [
            { author: 'Carla M.', avatar: 'C', time: '07:45', text: 'Muito importante espalhar essa mensagem!' },
            { author: 'Fernanda S.', avatar: 'F', time: '08:12', text: 'Nenhuma de nos esta sozinha!' },
        ],
    },
    {
        id: 3,
        badge: 'Direitos',
        badgeClass: 'blue',
        time: '11 ago, 11:00',
        title: 'A Justica esta do seu lado',
        excerpt: 'A legislacao brasileira e uma das mais avancadas do mundo na protecao da mulher. Alem da Lei Maria da...',
        image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80',
        paragraphs: [
            'A legislacao brasileira e uma das mais avancadas do mundo na protecao da mulher.',
            'Conheca seus direitos e saiba como recorrer as autoridades competentes sempre que necessario.',
        ],
        likes: 131,
        isLiked: false,
        comments: [],
    },
    {
        id: 4,
        badge: 'Conscientizacao',
        badgeClass: 'pink',
        time: 'Hoje, 10:00',
        title: 'Reconhecendo sinais de violencia domestica',
        excerpt: 'A violencia domestica nem sempre deixa marcas visiveis. Aprenda a identificar comportamentos abusivos...',
        image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80',
        paragraphs: [
            'A violencia domestica nem sempre deixa marcas visiveis. Aprenda a identificar comportamentos abusivos.',
            'Reconhecer os sinais no inicio e fundamental para romper ciclos antes que se tornem perigosos.',
        ],
        likes: 95,
        isLiked: false,
        comments: [
            { author: 'Juliana R.', avatar: 'J', time: '10:15', text: 'Informacao salva vidas. Parabens pelo conteudo!' },
            { author: 'Patricia L.', avatar: 'P', time: '10:30', text: 'Compartilhando com minhas amigas.' },
            { author: 'Amanda V.', avatar: 'A', time: '10:42', text: 'Excelente explicacao!' },
        ],
    },
];

export default function InformacoesScreen() {
    const [posts, setPosts] = useState(INITIAL_POSTS);
    const [detailId, setDetailId] = useState(null);
    const [commentInput, setCommentInput] = useState('');

    const detailPost = useMemo(() => posts.find((p) => p.id === detailId) || null, [posts, detailId]);

    const toggleLike = (postId, forceLike = false) => {
        setPosts((prev) =>
            prev.map((post) => {
                if (post.id !== postId) return post;
                if (forceLike) {
                    if (post.isLiked) return post;
                    return { ...post, isLiked: true, likes: post.likes + 1 };
                }
                const nextLiked = !post.isLiked;
                return { ...post, isLiked: nextLiked, likes: post.likes + (nextLiked ? 1 : -1) };
            }),
        );
    };

    const addComment = () => {
        if (!detailPost || !commentInput.trim()) return;
        const now = new Date();
        const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        const newComment = { author: 'Voce', avatar: 'M', time, text: commentInput.trim() };
        setPosts((prev) => prev.map((p) => (p.id === detailPost.id ? { ...p, comments: [...p.comments, newComment] } : p)));
        setCommentInput('');
    };

    return (
        <MobileFrame backgroundColor="#0C0D10">
            {!detailPost ? (
                <View style={styles.screen}>
                    <View style={styles.header}>
                        <Text style={styles.pageTitle}>Informacoes</Text>
                        <Text style={styles.badgeOfficial}>Oficial Guardia</Text>
                    </View>

                    <ScrollView style={styles.feed} contentContainerStyle={styles.feedContent}>
                        {posts.map((post) => (
                            <Pressable key={post.id} style={styles.card} onPress={() => setDetailId(post.id)}>
                                <View style={styles.cardMetaRow}>
                                    <Text style={[styles.badge, post.badgeClass === 'blue' ? styles.badgeBlue : styles.badgePink]}>{post.badge}</Text>
                                    <Text style={styles.cardTime}>{post.time}</Text>
                                </View>
                                <Text style={styles.cardTitle}>{post.title}</Text>
                                <Text style={styles.cardExcerpt}>{post.excerpt}</Text>
                                <Image source={{ uri: post.image }} style={styles.cardImage} />

                                <View style={styles.cardFooter}>
                                    <Pressable style={styles.statBtn} onPress={() => toggleLike(post.id)}>
                                        <MaterialCommunityIcons name={post.isLiked ? 'heart' : 'heart-outline'} size={18} color={post.isLiked ? '#FF3366' : '#94A3B8'} />
                                        <Text style={styles.statText}>{post.likes}</Text>
                                    </Pressable>
                                    <View style={styles.statBtn}>
                                        <MaterialCommunityIcons name="comment-outline" size={18} color="#94A3B8" />
                                        <Text style={styles.statText}>{post.comments.length}</Text>
                                    </View>
                                    <Text style={styles.readMore}>Ler mais</Text>
                                </View>
                            </Pressable>
                        ))}
                    </ScrollView>
                </View>
            ) : (
                <View style={styles.screen}>
                    <View style={styles.detailHeader}>
                        <Pressable style={styles.backBtn} onPress={() => setDetailId(null)}>
                            <MaterialCommunityIcons name="chevron-left" size={20} color="#FFFFFF" />
                        </Pressable>
                        <Text style={styles.detailHeaderTitle}>Publicacao</Text>
                        <View style={styles.backSpacer} />
                    </View>

                    <ScrollView style={styles.feed} contentContainerStyle={styles.detailContent}>
                        <View style={styles.cardMetaRow}>
                            <Text style={[styles.badge, detailPost.badgeClass === 'blue' ? styles.badgeBlue : styles.badgePink]}>{detailPost.badge}</Text>
                            <Text style={styles.cardTime}>{detailPost.time}</Text>
                        </View>
                        <Text style={styles.detailTitle}>{detailPost.title}</Text>

                        <View style={styles.authorRow}>
                            <View style={styles.authorAvatar}><Text style={styles.authorAvatarText}>G</Text></View>
                            <View>
                                <Text style={styles.authorName}>Equipe Guardia</Text>
                                <Text style={styles.authorRole}>Publicacao oficial</Text>
                            </View>
                        </View>

                        {detailPost.paragraphs.map((paragraph) => (
                            <Text key={paragraph} style={styles.detailParagraph}>{paragraph}</Text>
                        ))}

                        <Pressable onLongPress={() => toggleLike(detailPost.id, true)}>
                            <Image source={{ uri: detailPost.image }} style={styles.detailImage} />
                        </Pressable>

                        <View style={styles.detailStatsRow}>
                            <Pressable style={styles.statBtn} onPress={() => toggleLike(detailPost.id)}>
                                <MaterialCommunityIcons name={detailPost.isLiked ? 'heart' : 'heart-outline'} size={18} color={detailPost.isLiked ? '#FF3366' : '#94A3B8'} />
                                <Text style={styles.statText}>{detailPost.likes}</Text>
                            </Pressable>
                            <View style={styles.statBtn}>
                                <MaterialCommunityIcons name="comment-outline" size={18} color="#94A3B8" />
                                <Text style={styles.statText}>{detailPost.comments.length}</Text>
                            </View>
                        </View>

                        <Text style={styles.commentsTitle}>COMENTARIOS</Text>

                        {detailPost.comments.length === 0 ? (
                            <Text style={styles.emptyComment}>Seja a primeira a comentar nesta publicacao.</Text>
                        ) : (
                            detailPost.comments.map((comment, idx) => (
                                <View key={`${comment.author}-${idx}`} style={styles.commentItem}>
                                    <View style={styles.commentAvatar}><Text style={styles.commentAvatarText}>{comment.avatar}</Text></View>
                                    <View style={styles.commentBubble}>
                                        <View style={styles.commentHeader}>
                                            <Text style={styles.commentAuthor}>{comment.author}</Text>
                                            <Text style={styles.commentTime}>{comment.time}</Text>
                                        </View>
                                        <Text style={styles.commentText}>{comment.text}</Text>
                                    </View>
                                </View>
                            ))
                        )}

                        <View style={styles.addCommentBox}>
                            <View style={styles.commentAvatar}><Text style={styles.commentAvatarText}>M</Text></View>
                            <View style={styles.commentInputWrap}>
                                <TextInput
                                    value={commentInput}
                                    onChangeText={setCommentInput}
                                    placeholder="Escreva um comentario..."
                                    placeholderTextColor="#71717A"
                                    style={styles.commentInput}
                                />
                                <Pressable style={styles.sendBtn} onPress={addComment}>
                                    <MaterialCommunityIcons name="send" size={16} color="#FFFFFF" />
                                </Pressable>
                            </View>
                        </View>
                    </ScrollView>
                </View>
            )}

            <BottomNav active="Informacoes" />
        </MobileFrame>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: '#0C0D10',
        paddingBottom: 88,
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    pageTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: '#F8FAFC',
    },
    badgeOfficial: {
        color: '#94A3B8',
        fontSize: 12,
    },
    feed: {
        flex: 1,
    },
    feedContent: {
        paddingHorizontal: 16,
        paddingBottom: 18,
        gap: 14,
    },
    card: {
        backgroundColor: '#111318',
        borderRadius: 18,
        padding: 14,
        borderWidth: 1,
        borderColor: '#1C1E24',
    },
    cardMetaRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    badge: {
        borderRadius: 999,
        fontSize: 11,
        fontWeight: '600',
        paddingHorizontal: 10,
        paddingVertical: 4,
        overflow: 'hidden',
        color: '#FFFFFF',
    },
    badgePink: {
        backgroundColor: '#C83C59',
    },
    badgeBlue: {
        backgroundColor: '#2563EB',
    },
    cardTime: {
        color: '#94A3B8',
        fontSize: 11,
    },
    cardTitle: {
        color: '#F8FAFC',
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 8,
    },
    cardExcerpt: {
        color: '#CBD5E1',
        fontSize: 13,
        lineHeight: 19,
        marginBottom: 12,
    },
    cardImage: {
        width: '100%',
        height: 180,
        borderRadius: 14,
        marginBottom: 12,
    },
    cardFooter: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 14,
        gap: 6,
    },
    statText: {
        color: '#CBD5E1',
        fontSize: 13,
        fontWeight: '600',
    },
    readMore: {
        marginLeft: 'auto',
        color: '#E2E8F0',
        fontSize: 12,
        fontWeight: '600',
    },
    detailHeader: {
        height: 56,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#1C1E24',
    },
    backBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    backSpacer: {
        width: 32,
    },
    detailHeaderTitle: {
        flex: 1,
        textAlign: 'center',
        color: '#F8FAFC',
        fontSize: 16,
        fontWeight: '700',
    },
    detailContent: {
        padding: 16,
        paddingBottom: 16,
    },
    detailTitle: {
        color: '#F8FAFC',
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 12,
    },
    authorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 14,
        gap: 10,
    },
    authorAvatar: {
        width: 34,
        height: 34,
        borderRadius: 17,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#C83C59',
    },
    authorAvatarText: {
        color: '#FFFFFF',
        fontWeight: '700',
    },
    authorName: {
        color: '#F8FAFC',
        fontWeight: '600',
        fontSize: 13,
    },
    authorRole: {
        color: '#94A3B8',
        fontSize: 11,
    },
    detailParagraph: {
        color: '#CBD5E1',
        fontSize: 14,
        lineHeight: 22,
        marginBottom: 10,
    },
    detailImage: {
        width: '100%',
        height: 220,
        borderRadius: 14,
        marginTop: 8,
        marginBottom: 14,
    },
    detailStatsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 14,
    },
    commentsTitle: {
        color: '#94A3B8',
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 0.6,
        marginBottom: 10,
    },
    emptyComment: {
        color: '#71717A',
        fontStyle: 'italic',
        marginBottom: 12,
    },
    commentItem: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 10,
    },
    commentAvatar: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#334155',
        alignItems: 'center',
        justifyContent: 'center',
    },
    commentAvatarText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '700',
    },
    commentBubble: {
        flex: 1,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#1F2937',
        backgroundColor: '#111827',
        padding: 10,
    },
    commentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    commentAuthor: {
        color: '#F8FAFC',
        fontWeight: '600',
        fontSize: 12,
    },
    commentTime: {
        color: '#9CA3AF',
        fontSize: 11,
    },
    commentText: {
        color: '#CBD5E1',
        fontSize: 13,
        lineHeight: 18,
    },
    addCommentBox: {
        marginTop: 10,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    commentInputWrap: {
        flex: 1,
        height: 44,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#1F2937',
        backgroundColor: '#111827',
        flexDirection: 'row',
        alignItems: 'center',
        paddingRight: 6,
    },
    commentInput: {
        flex: 1,
        color: '#F8FAFC',
        paddingHorizontal: 12,
        fontSize: 13,
    },
    sendBtn: {
        width: 30,
        height: 30,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#C83C59',
    },
});
