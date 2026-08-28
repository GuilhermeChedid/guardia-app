import React, { useMemo, useRef, useState } from 'react';
import {
    Animated,
    Image,
    Platform,
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
            {
                author: 'Beatriz A.',
                avatar: 'B',
                time: '08:34',
                text: 'Esse post chegou no momento certo. Obrigada, Guardiã. 💜',
            },
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
            {
                author: 'Carla M.',
                avatar: 'C',
                time: '07:45',
                text: 'Muito importante espalhar essa mensagem!',
            },
            {
                author: 'Fernanda S.',
                avatar: 'F',
                time: '08:12',
                text: 'Nenhuma de nós está sozinha!',
            },
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
            {
                author: 'Juliana R.',
                avatar: 'J',
                time: '10:15',
                text: 'Informação salva vidas. Parabéns pelo conteúdo!',
            },
        ],
    },
];

const CATEGORIES = ['Todas', 'Saúde Mental', 'Rede de Apoio', 'Direitos', 'Conscientização'];

// Componente isolado para o Card do Post gerenciar sua própria animação de curtida
function PostCard({ post, onToggleLike, onPress }) {
    const scaleAnim = useRef(new Animated.Value(0)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    const handleLikeClick = (e) => {
        if (e && e.stopPropagation) e.stopPropagation();
        const willBeLiked = !post.isLiked;
        onToggleLike(post.id);

        if (willBeLiked) {
            scaleAnim.setValue(0.3);
            opacityAnim.setValue(1);

            Animated.parallel([
                Animated.spring(scaleAnim, {
                    toValue: 1.2,
                    friction: 4,
                    tension: 50,
                    useNativeDriver: true,
                }),
                Animated.timing(opacityAnim, {
                    toValue: 0,
                    duration: 600,
                    delay: 200,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    };

    return (
        <Pressable style={styles.card} onPress={onPress}>
            <View style={styles.cardMetaRow}>
                <Text style={[styles.badge, post.badgeClass === 'blue' ? styles.badgeBlue : styles.badgePink]}>
                    {post.badge}
                </Text>
                <Text style={styles.cardTime}>{post.time}</Text>
            </View>
            <Text style={styles.cardTitle}>{post.title}</Text>
            <Text style={styles.cardExcerpt}>{post.excerpt}</Text>

            {/* Container da imagem com o coração flutuante no centro */}
            <View style={styles.imageContainer}>
                <Image source={{ uri: post.image }} style={styles.cardImage} />
                <Animated.View
                    style={[
                        styles.floatingHeartWrapper,
                        {
                            transform: [{ scale: scaleAnim }],
                            opacity: opacityAnim,
                        },
                    ]}
                    pointerEvents="none"
                >
                    <MaterialCommunityIcons name="heart" size={68} color="#C83C59" />
                </Animated.View>
            </View>

            <View style={styles.cardFooter}>
                <Pressable style={styles.statBtn} onPress={handleLikeClick}>
                    <MaterialCommunityIcons
                        name={post.isLiked ? 'heart' : 'heart-outline'}
                        size={18}
                        color={post.isLiked ? '#C83C59' : '#94A3B8'}
                    />
                    <Text style={styles.statText}>{post.likes}</Text>
                </Pressable>
                <View style={styles.statBtn}>
                    <MaterialCommunityIcons name="comment-outline" size={18} color="#94A3B8" />
                    <Text style={styles.statText}>{post.comments.length}</Text>
                </View>
                <View style={styles.readMoreBtn}>
                    <Text style={styles.readMore}>Ler mais</Text>
                    <MaterialCommunityIcons name="arrow-right" size={14} color="#C83C59" />
                </View>
            </View>
        </Pressable>
    );
}

export default function InformacoesScreen() {
    const [posts, setPosts] = useState(INITIAL_POSTS);
    const [detailId, setDetailId] = useState(null);
    const [commentInput, setCommentInput] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Todas');

    // Animação para a tela de detalhes
    const detailScaleAnim = useRef(new Animated.Value(0)).current;
    const detailOpacityAnim = useRef(new Animated.Value(0)).current;

    const detailPost = useMemo(() => posts.find((p) => p.id === detailId) || null, [posts, detailId]);

    const filteredPosts = useMemo(() => {
        return posts.filter((post) => {
            const matchesCategory = selectedCategory === 'Todas' || post.badge === selectedCategory;
            const matchesSearch =
                post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [posts, searchQuery, selectedCategory]);

    const toggleLike = (postId, e) => {
        if (e && e.stopPropagation) e.stopPropagation();
        setPosts((prev) =>
            prev.map((post) => {
                if (post.id !== postId) return post;
                const nextLiked = !post.isLiked;
                return {
                    ...post,
                    isLiked: nextLiked,
                    likes: post.likes + (nextLiked ? 1 : -1),
                };
            })
        );
    };

    const handleDetailLike = (e) => {
        if (!detailPost) return;
        const willBeLiked = !detailPost.isLiked;
        toggleLike(detailPost.id, e);

        if (willBeLiked) {
            detailScaleAnim.setValue(0.3);
            detailOpacityAnim.setValue(1);

            Animated.parallel([
                Animated.spring(detailScaleAnim, {
                    toValue: 1.2,
                    friction: 4,
                    tension: 50,
                    useNativeDriver: true,
                }),
                Animated.timing(detailOpacityAnim, {
                    toValue: 0,
                    duration: 600,
                    delay: 200,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    };

    const addComment = () => {
        if (!detailPost || !commentInput.trim()) return;
        const now = new Date();
        const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        const newComment = {
            author: 'Você',
            avatar: 'M',
            time,
            text: commentInput.trim(),
        };

        setPosts((prev) =>
            prev.map((p) =>
                p.id === detailPost.id
                    ? { ...p, comments: [...p.comments, newComment] }
                    : p
            )
        );
        setCommentInput('');
    };

    return (
        <MobileFrame backgroundColor="#0C0D10">
            {Platform.OS === 'web' && (
                <style dangerouslySetInnerHTML={{
                    __html: `
                    ::-webkit-scrollbar {
                        width: 5px;
                        height: 5px;
                    }
                    ::-webkit-scrollbar-track {
                        background: #0C0D10;
                    }
                    ::-webkit-scrollbar-thumb {
                        background: #272A35;
                        border-radius: 4px;
                    }
                    ::-webkit-scrollbar-thumb:hover {
                        background: #3F4455;
                    }
                `}} />
            )}
            <View style={styles.screen}>
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.containerContent}
                    showsVerticalScrollIndicator={true}
                >
                    {!detailPost ? (
                        <>
                            <View style={styles.header}>
                                <Text style={styles.pageTitle}>Informações</Text>
                                <Text style={styles.badgeOfficial}>Oficial Guardiã</Text>
                            </View>

                            <View style={styles.searchContainer}>
                                <MaterialCommunityIcons name="magnify" size={18} color="#71717A" style={styles.searchIcon} />
                                <TextInput
                                    style={styles.searchInput}
                                    placeholder="Pesquisar publicações..."
                                    placeholderTextColor="#71717A"
                                    value={searchQuery}
                                    onChangeText={setSearchQuery}
                                />
                                {searchQuery ? (
                                    <Pressable onPress={() => setSearchQuery('')}>
                                        <MaterialCommunityIcons name="close-circle" size={16} color="#71717A" />
                                    </Pressable>
                                ) : null}
                            </View>

                            <View style={styles.filterRow}>
                                {CATEGORIES.map((cat) => (
                                    <Pressable
                                        key={cat}
                                        style={[styles.filterChip, selectedCategory === cat && styles.filterChipActive]}
                                        onPress={() => setSelectedCategory(cat)}
                                    >
                                        <Text style={[styles.filterChipText, selectedCategory === cat && styles.filterChipTextActive]}>
                                            {cat}
                                        </Text>
                                    </Pressable>
                                ))}
                            </View>

                            {filteredPosts.length === 0 ? (
                                <View style={styles.emptyState}>
                                    <MaterialCommunityIcons name="file-search-outline" size={36} color="#71717A" />
                                    <Text style={styles.emptyStateText}>Nenhuma publicação encontrada.</Text>
                                </View>
                            ) : (
                                filteredPosts.map((post) => (
                                    <PostCard
                                        key={post.id}
                                        post={post}
                                        onToggleLike={toggleLike}
                                        onPress={() => setDetailId(post.id)}
                                    />
                                ))
                            )}
                        </>
                    ) : (
                        <>
                            <View style={styles.detailHeader}>
                                <Pressable style={styles.backBtn} onPress={() => setDetailId(null)}>
                                    <MaterialCommunityIcons name="chevron-left" size={22} color="#FFFFFF" />
                                </Pressable>
                                <Text style={styles.detailHeaderTitle}>Publicação</Text>
                                <View style={styles.backSpacer} />
                            </View>

                            <View style={styles.cardMetaRow}>
                                <Text style={[styles.badge, detailPost.badgeClass === 'blue' ? styles.badgeBlue : styles.badgePink]}>
                                    {detailPost.badge}
                                </Text>
                                <Text style={styles.cardTime}>{detailPost.time}</Text>
                            </View>
                            <Text style={styles.detailTitle}>{detailPost.title}</Text>

                            <View style={styles.authorRow}>
                                <View style={styles.authorAvatar}>
                                    <Text style={styles.authorAvatarText}>G</Text>
                                </View>
                                <View>
                                    <Text style={styles.authorName}>Equipe Guardiã</Text>
                                    <Text style={styles.authorRole}>Publicação oficial</Text>
                                </View>
                            </View>

                            {detailPost.paragraphs.map((paragraph, idx) => (
                                <Text key={idx} style={styles.detailParagraph}>{paragraph}</Text>
                            ))}

                            {/* Imagem de detalhes com animação de coração */}
                            <View style={styles.imageContainer}>
                                <Image source={{ uri: detailPost.image }} style={styles.detailImage} />
                                <Animated.View
                                    style={[
                                        styles.floatingHeartWrapper,
                                        {
                                            transform: [{ scale: detailScaleAnim }],
                                            opacity: detailOpacityAnim,
                                        },
                                    ]}
                                    pointerEvents="none"
                                >
                                    <MaterialCommunityIcons name="heart" size={68} color="#C83C59" />
                                </Animated.View>
                            </View>

                            <View style={styles.detailStatsRow}>
                                <Pressable style={styles.statBtn} onPress={handleDetailLike}>
                                    <MaterialCommunityIcons
                                        name={detailPost.isLiked ? 'heart' : 'heart-outline'}
                                        size={18}
                                        color={detailPost.isLiked ? '#C83C59' : '#94A3B8'}
                                    />
                                    <Text style={styles.statText}>{detailPost.likes}</Text>
                                </Pressable>
                                <View style={styles.statBtn}>
                                    <MaterialCommunityIcons name="comment-outline" size={18} color="#94A3B8" />
                                    <Text style={styles.statText}>{detailPost.comments.length}</Text>
                                </View>
                            </View>

                            <View style={styles.divider} />

                            <Text style={styles.commentsTitle}>COMENTÁRIOS</Text>

                            {detailPost.comments.length === 0 ? (
                                <Text style={styles.emptyComment}>Seja a primeira a comentar nesta publicação.</Text>
                            ) : (
                                detailPost.comments.map((comment, idx) => (
                                    <View key={idx} style={styles.commentItem}>
                                        <View style={styles.commentAvatar}>
                                            <Text style={styles.commentAvatarText}>{comment.avatar}</Text>
                                        </View>
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
                                <View style={styles.commentUserAvatar}>
                                    <Text style={styles.commentUserAvatarText}>M</Text>
                                </View>
                                <View style={styles.commentInputWrap}>
                                    <TextInput
                                        value={commentInput}
                                        onChangeText={setCommentInput}
                                        placeholder="Escreva um comentário..."
                                        placeholderTextColor="#71717A"
                                        style={styles.commentInput}
                                    />
                                    <Pressable style={styles.sendBtn} onPress={addComment}>
                                        <MaterialCommunityIcons name="send" size={15} color="#FFFFFF" />
                                    </Pressable>
                                </View>
                            </View>
                        </>
                    )}
                </ScrollView>
            </View>
            <BottomNav active="Informacoes" />
        </MobileFrame>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        width: '100%',
        backgroundColor: '#0C0D10',
        ...(Platform.OS === 'web' && {
            position: 'relative',
            overflow: 'hidden',
        }),
    },
    scrollView: {
        flex: 1,
        width: '100%',
        ...(Platform.OS === 'web' && {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            overflowY: 'auto',
            overflowX: 'hidden',
        }),
    },
    containerContent: {
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 120,
    },
    header: {
        paddingTop: 8,
        paddingBottom: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    pageTitle: {
        fontSize: 26,
        fontWeight: '700',
        color: '#F8FAFC',
    },
    badgeOfficial: {
        color: '#C83C59',
        fontSize: 12,
        fontWeight: '600',
        backgroundColor: '#1E1217',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#3A1E26',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#111318',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#1C1E24',
        paddingHorizontal: 12,
        height: 44,
        marginBottom: 12,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        color: '#F8FAFC',
        fontSize: 13,
    },
    filterRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 16,
    },
    filterChip: {
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 20,
        backgroundColor: '#111318',
        borderWidth: 1,
        borderColor: '#1C1E24',
        height: 32,
        justifyContent: 'center',
        alignItems: 'center',
    },
    filterChipActive: {
        backgroundColor: '#C83C59',
        borderColor: '#C83C59',
    },
    filterChipText: {
        color: '#94A3B8',
        fontSize: 12,
        fontWeight: '600',
    },
    filterChipTextActive: {
        color: '#FFFFFF',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
    },
    emptyStateText: {
        color: '#71717A',
        fontSize: 14,
        marginTop: 8,
        textAlign: 'center',
    },
    card: {
        backgroundColor: '#111318',
        borderRadius: 16,
        padding: 14,
        borderWidth: 1,
        borderColor: '#1C1E24',
        marginBottom: 14,
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
        color: '#71717A',
        fontSize: 11,
    },
    cardTitle: {
        color: '#F8FAFC',
        fontSize: 17,
        fontWeight: '700',
        marginBottom: 8,
        lineHeight: 22,
    },
    cardExcerpt: {
        color: '#94A3B8',
        fontSize: 13,
        lineHeight: 18,
        marginBottom: 12,
    },
    imageContainer: {
        position: 'relative',
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    cardImage: {
        width: '100%',
        height: 170,
        borderRadius: 12,
    },
    detailImage: {
        width: '100%',
        height: 210,
        borderRadius: 14,
        marginTop: 6,
        marginBottom: 16,
    },
    floatingHeartWrapper: {
        position: 'absolute',
        zIndex: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#1C1E24',
        paddingTop: 10,
    },
    statBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 16,
        gap: 6,
    },
    statText: {
        color: '#94A3B8',
        fontSize: 13,
        fontWeight: '600',
    },
    readMoreBtn: {
        marginLeft: 'auto',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    readMore: {
        color: '#C83C59',
        fontSize: 12,
        fontWeight: '600',
    },
    detailHeader: {
        height: 52,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    backBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#1C1E24',
        alignItems: 'center',
        justifyContent: 'center',
    },
    backSpacer: {
        width: 36,
    },
    detailHeaderTitle: {
        flex: 1,
        textAlign: 'center',
        color: '#F8FAFC',
        fontSize: 16,
        fontWeight: '700',
    },
    detailTitle: {
        color: '#F8FAFC',
        fontSize: 22,
        fontWeight: '700',
        marginBottom: 14,
        lineHeight: 28,
    },
    authorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        gap: 10,
    },
    authorAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#C83C59',
    },
    authorAvatarText: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: 14,
    },
    authorName: {
        color: '#F8FAFC',
        fontWeight: '600',
        fontSize: 13,
    },
    authorRole: {
        color: '#71717A',
        fontSize: 11,
    },
    detailParagraph: {
        color: '#CBD5E1',
        fontSize: 14,
        lineHeight: 22,
        marginBottom: 12,
    },
    detailStatsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 14,
    },
    divider: {
        height: 1,
        backgroundColor: '#1C1E24',
        marginBottom: 16,
    },
    commentsTitle: {
        color: '#94A3B8',
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 0.6,
        marginBottom: 14,
    },
    emptyComment: {
        color: '#71717A',
        fontStyle: 'italic',
        fontSize: 13,
        marginBottom: 16,
    },
    commentItem: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 12,
    },
    commentAvatar: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#272A35',
        alignItems: 'center',
        justifyContent: 'center',
    },
    commentAvatarText: {
        color: '#F8FAFC',
        fontSize: 12,
        fontWeight: '700',
    },
    commentUserAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#C83C59',
        alignItems: 'center',
        justifyContent: 'center',
    },
    commentUserAvatarText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '700',
    },
    commentBubble: {
        flex: 1,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#1C1E24',
        backgroundColor: '#111318',
        padding: 10,
    },
    commentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    commentAuthor: {
        forgroundColor: '#F8FAFC',
        fontWeight: '600',
        fontSize: 12,
    },
    commentTime: {
        color: '#71717A',
        fontSize: 11,
    },
    commentText: {
        color: '#CBD5E1',
        fontSize: 13,
        lineHeight: 18,
    },
    addCommentBox: {
        marginTop: 14,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    commentInputWrap: {
        flex: 1,
        height: 44,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#1C1E24',
        backgroundColor: '#111318',
        flexDirection: 'row',
        alignItems: 'center',
        paddingRight: 6,
        paddingLeft: 4,
    },
    commentInput: {
        flex: 1,
        color: '#F8FAFC',
        paddingHorizontal: 10,
        fontSize: 13,
    },
    sendBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#C83C59',
    },
});