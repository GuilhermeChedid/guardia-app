import React, { useEffect, useState } from 'react';
import {
    Alert,
    View,
    Modal,
    Text,
    TextInput,
    Pressable,
    StyleSheet,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import MobileFrame from '../../components/MobileFrame/MobileFrame';
import { POST_CATEGORIES } from '../../constants/posts';
import { usePosts } from '../../context/PostsContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../services/api';

const logoGuardia = require('../../assets/imagens/logo_guardia.png');

export default function AdminDashboardScreen() {
    const navigation = useNavigation();
    const { posts, updatePost, addPost, deletePost } = usePosts();
    const [isAuthorized, setIsAuthorized] = useState(false);

    // Estados de Navegação Interna
    const [activeTab, setActiveTab] = useState('posts'); // 'posts' | 'usuarios' | 'relatorios'
    const [subView, setSubView] = useState(null); // null | 'novo' | 'editar' | 'visualizar'
    const [selectedPeriod, setSelectedPeriod] = useState('7 dias'); // '7 dias' | '30 dias' | '12 meses'

    // Estados de Formulários / Busca
    const [searchUser, setSearchUser] = useState('');
    const [postTitle, setPostTitle] = useState('Cuidar de você é o primeiro passo');
    const [postCategory, setPostCategory] = useState('Saúde Mental');
    const [isCategoryPickerOpen, setCategoryPickerOpen] = useState(false);
    const [postContent, setPostContent] = useState(
        'Situações de violência e abuso deixam marcas emocionais profundas. Buscar apoio psicológico não é fraqueza — é um ato de coragem e autocuidado.\n\nO CAPS (Centro de Atendimento Psicossocial) oferece atendimento gratuito em todo o Brasil. Você merece se sentir bem, segura e acolhida.'
    );
    const [newPostTitle, setNewPostTitle] = useState('');
    const [newPostCategory, setNewPostCategory] = useState('Conscientização');
    const [newPostContent, setNewPostContent] = useState('');
    const [newPostImage, setNewPostImage] = useState(null);
    const [postImage, setPostImage] = useState(null);
    const [isNewCategoryPickerOpen, setNewCategoryPickerOpen] = useState(false);
    const [isDeleteVisible, setDeleteVisible] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [isUserDeleteVisible, setUserDeleteVisible] = useState(false);
    const [userDeleteTarget, setUserDeleteTarget] = useState(null);
    const [selectedPostId, setSelectedPostId] = useState(null);
    const [adminId, setAdminId] = useState(null);
    const [usersList, setUsersList] = useState([]);
    const [report, setReport] = useState({ total: 0, average: 0, peak: 0, daily: [] });
    const [reportStartDate, setReportStartDate] = useState('');
    const [reportEndDate, setReportEndDate] = useState('');
    const [feedback, setFeedback] = useState(null);

    const showFeedback = (message, type = 'success') => {
        setFeedback({ message, type });
        setTimeout(() => setFeedback(null), 3500);
    };

    useEffect(() => {
        let mounted = true;
        AsyncStorage.getItem('@guardia/auth_user')
            .then((storedUser) => {
                const user = storedUser ? JSON.parse(storedUser) : null;
                if (!user?.is_admin) {
                    navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
                    return;
                }
                if (mounted) setIsAuthorized(true);
            })
            .catch(() => {
                navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
            });
        return () => {
            mounted = false;
        };
    }, [navigation]);

    const loadAdminData = async (id = adminId, period = selectedPeriod, startDate = reportStartDate, endDate = reportEndDate) => {
        if (!id) return;
        try {
            const days = period === '12 meses' ? 365 : period === '30 dias' ? 30 : 7;
            const [usersResponse, reportResponse] = await Promise.all([
                api.get(`/admin/users?admin_id=${id}`),
                api.get(`/admin/reports/sos?admin_id=${id}&days=${days}${startDate ? `&start_date=${startDate.split('/').reverse().join('-')}` : ''}${endDate ? `&end_date=${endDate.split('/').reverse().join('-')}` : ''}`),
            ]);
            setUsersList(usersResponse.data.users);
            setReport(reportResponse.data.report);
        } catch (error) {
            Alert.alert('Erro', error.response?.data?.message || 'Não foi possível carregar os dados administrativos.');
        }
    };

    useEffect(() => {
        AsyncStorage.getItem('@guardia/auth_user')
            .then((stored) => {
                const user = stored ? JSON.parse(stored) : null;
                if (user?.is_admin) {
                    setAdminId(user.id);
                    loadAdminData(user.id);
                }
            })
            .catch((error) => console.error('Erro ao carregar sessão administrativa:', error));
    }, []);

    if (!isAuthorized) {
        return (
            <View style={styles.authorizationLoading}>
                <MaterialCommunityIcons name="shield-lock-outline" size={42} color="#C83C59" />
                <Text style={styles.authorizationLoadingText}>Verificando acesso administrativo...</Text>
            </View>
        );
    }

    const selectedPost = posts.find((post) => post.id === selectedPostId) || posts[0];

    const openEditPost = (post) => {
        setSelectedPostId(post.id);
        setPostTitle(post.title);
        setPostCategory(post.badge);
        setPostContent(post.paragraphs.join('\n\n'));
        setPostImage(post.image);
        setCategoryPickerOpen(false);
        setSubView('editar');
    };

    const openViewPost = (post) => {
        setSelectedPostId(post.id);
        setPostTitle(post.title);
        setPostCategory(post.badge);
        setPostContent(post.paragraphs.join('\n\n'));
        setSubView('visualizar');
    };

    const saveEditedPost = async () => {
        if (!selectedPost) return;

        const paragraphs = postContent.split(/\n\s*\n/).map((paragraph) => paragraph.trim()).filter(Boolean);
        try {
            await updatePost(selectedPost.id, {
                title: postTitle.trim() || selectedPost.title,
                badge: postCategory,
                badgeClass: postCategory === 'Direitos' ? 'blue' : 'pink',
                excerpt: (paragraphs[0] || selectedPost.excerpt).slice(0, 140),
                paragraphs: paragraphs.length > 0 ? paragraphs : selectedPost.paragraphs,
                image: postImage || selectedPost.image,
            });
            setSubView(null);
            showFeedback('Post editado com sucesso!');
        } catch (error) {
            showFeedback(error.response?.data?.message || 'Não foi possível editar o post.', 'error');
        }
    };

    const openNewPost = () => {
        setNewPostTitle('');
        setNewPostCategory('Conscientização');
        setNewPostContent('');
        setNewPostImage(null);
        setNewCategoryPickerOpen(false);
        setSubView('novo');
    };

    const publishNewPost = async () => {
        const title = newPostTitle.trim();
        const paragraphs = newPostContent.split(/\n\s*\n/).map((paragraph) => paragraph.trim()).filter(Boolean);
        if (!title || paragraphs.length === 0) {
            showFeedback('Preencha o título e o conteúdo do post.', 'error');
            return;
        }

        try {
            await addPost({
                id: Date.now(),
                badge: newPostCategory,
                badgeClass: newPostCategory === 'Direitos' ? 'blue' : 'pink',
                time: 'Agora',
                title,
                excerpt: paragraphs[0].slice(0, 140),
                image: newPostImage || posts[0]?.image,
                paragraphs,
                likes: 0,
                isLiked: false,
                comments: [],
            });
            showFeedback('Post criado com sucesso!');
            setSubView(null);
        } catch (error) {
            showFeedback(error.response?.data?.message || 'Não foi possível criar o post.', 'error');
        }
    };

    const pickPostImage = async (forNewPost = true) => {
        const result = await DocumentPicker.getDocumentAsync({
            type: ['image/jpeg', 'image/png'],
            copyToCacheDirectory: true,
            multiple: false,
        });
        if (result.canceled) return;

        const asset = result.assets?.[0];
        const extension = asset?.name?.split('.').pop()?.toLowerCase();
        const allowedExtensions = ['jpg', 'jpeg', 'png'];
        if (!asset || !allowedExtensions.includes(extension)) {
            showFeedback('Formato inválido. Envie uma imagem JPG, JPEG ou PNG de até 5 MB.', 'error');
            return;
        }
        if (asset.size && asset.size > 5 * 1024 * 1024) {
            showFeedback('Imagem muito grande. O tamanho máximo permitido é 5 MB.', 'error');
            return;
        }

        if (forNewPost) setNewPostImage(asset.uri);
        else setPostImage(asset.uri);
        showFeedback('Imagem selecionada com sucesso!');
    };

    const openDeletePost = (post) => {
        setDeleteTarget(post);
        setDeleteVisible(true);
    };

    const confirmDeletePost = async () => {
        if (!deleteTarget) return;
        try {
            await deletePost(deleteTarget.id);
            setDeleteVisible(false);
            setDeleteTarget(null);
            setSubView(null);
            showFeedback('Post excluído com sucesso!');
        } catch (error) {
            showFeedback(error.response?.data?.message || 'Não foi possível excluir o post.', 'error');
        }
    };

    // ==========================================
    // RENDER: TELA DE POSTS (PRINCIPAL)
    // ==========================================
    const renderPostsTab = () => (
        <View style={styles.tabContentContainer}>
            <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>Publicações ({posts.length})</Text>
                <Pressable style={styles.btnAddPost} onPress={openNewPost}>
                    <Text style={styles.btnAddPostText}>+ Novo post</Text>
                </Pressable>
            </View>

            {posts.map((post) => (
                <View key={post.id} style={styles.postCard}>
                    <Image source={{ uri: post.image }} style={styles.postCardImage} resizeMode="cover" />
                    <View style={styles.postCardBody}>
                        <View style={styles.postBadgeRow}>
                            <View style={[styles.categoryBadge, post.badgeClass === 'blue' && styles.categoryBadgeBlue]}>
                                <Text style={[styles.categoryBadgeText, post.badgeClass === 'blue' && styles.categoryBadgeTextBlue]}>
                                    {post.badge}
                                </Text>
                            </View>
                            <Text style={styles.postTimeText}>{post.time}</Text>
                        </View>
                        <Text style={styles.postCardTitle}>{post.title}</Text>
                        <Text style={styles.postCardExcerpt} numberOfLines={2}>{post.excerpt}</Text>
                        <View style={styles.postCardActions}>
                            <View style={styles.statsInfo}>
                                <Text style={styles.statIconText}>♡ {post.likes}</Text>
                                <Text style={styles.statIconText}>💬 {post.comments.length}</Text>
                            </View>
                            <View style={styles.actionButtonsRow}>
                                <Pressable style={[styles.actionBtn, styles.actionBtnVer]} onPress={() => openViewPost(post)}>
                                    <Text style={styles.actionBtnTextVer}>Ver</Text>
                                </Pressable>
                                <Pressable style={[styles.actionBtn, styles.actionBtnEditar]} onPress={() => openEditPost(post)}>
                                    <Text style={styles.actionBtnTextEditar}>Editar</Text>
                                </Pressable>
                                <Pressable style={[styles.actionBtn, styles.actionBtnExcluir]} onPress={() => openDeletePost(post)}>
                                    <Text style={styles.actionBtnTextExcluir}>Excluir</Text>
                                </Pressable>
                            </View>
                        </View>
                    </View>
                </View>
            ))}
        </View>
    );

    // ==========================================
    // RENDER: TELA DE USUÁRIOS
    // ==========================================
    const filteredUsers = usersList.filter((user) => {
        const searchTerm = searchUser.trim().toLowerCase();
        if (!searchTerm) return true;

        return `${user.nome} ${user.email} ${user.cidade || ''}`.toLowerCase().includes(searchTerm);
    });

    const removeUser = (user) => {
        setUserDeleteTarget(user);
        setUserDeleteVisible(true);
    };

    const confirmDeleteUser = async () => {
        if (!userDeleteTarget) return;
        try {
            await api.delete(`/admin/users/${userDeleteTarget.id}`, { data: { admin_id: adminId } });
            setUsersList((current) => current.filter((item) => item.id !== userDeleteTarget.id));
            setUserDeleteVisible(false);
            setUserDeleteTarget(null);
        } catch (error) {
            Alert.alert('Erro', error.response?.data?.message || 'Não foi possível excluir o usuário.');
        }
    };

    const renderUsersTab = () => (
        <View style={styles.tabContentContainer}>
            <Text style={styles.sectionTitle}>Usuários ({filteredUsers.length})</Text>

            <View style={styles.searchContainer}>
                <TextInput
                    value={searchUser}
                    onChangeText={setSearchUser}
                    placeholder="Buscar por nome, e-mail ou cidade..."
                    placeholderTextColor="#666"
                    style={styles.searchInput}
                />
            </View>

            {filteredUsers.map((user) => (
                <View key={user.id} style={styles.userCard}>
                    <View style={styles.userAvatarBox}>
                        <Text style={styles.userAvatarText}>{user.nome.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase()}</Text>
                    </View>
                    <View style={styles.userInfoBox}>
                        <Text style={styles.userName}>{user.nome}</Text>
                        <Text style={styles.userEmail}>{user.email}</Text>
                        <Text style={styles.userMeta}>{user.cidade || 'Cidade não informada'} · {new Date(user.criado_em).toLocaleDateString('pt-BR')}</Text>
                    </View>
                    <Pressable style={styles.userDeleteBtn} onPress={() => removeUser(user)} disabled={user.is_admin}>
                        <MaterialCommunityIcons name="delete-outline" size={18} color="#888" />
                    </Pressable>
                </View>
            ))}
        </View>
    );

    // ==========================================
    // RENDER: TELA DE RELATÓRIOS
    // ==========================================
    const renderReportsTab = () => (
        <View style={styles.tabContentContainer}>
            <Text style={styles.sectionTitle}>Relatório de SOS</Text>

            <View style={styles.filterPillsRow}>
                {['7 dias', '30 dias', '12 meses'].map((p) => (
                    <Pressable
                        key={p}
                        style={[styles.filterPill, selectedPeriod === p && styles.filterPillActive]}
                        onPress={() => { setSelectedPeriod(p); loadAdminData(adminId, p); }}
                    >
                        <Text style={[styles.filterPillText, selectedPeriod === p && styles.filterPillTextActive]}>
                            {p}
                        </Text>
                    </Pressable>
                ))}
            </View>

            <View style={styles.customPeriodCard}>
                <Text style={styles.cardHeaderLabel}>PERÍODO PERSONALIZADO</Text>
                <View style={styles.periodInputsRow}>
                    <View style={styles.periodInputWrapper}>
                        <Text style={styles.periodInputPlaceholder}>De</Text>
                        <TextInput value={reportStartDate} onChangeText={setReportStartDate} placeholder="dd/mm/aaaa" placeholderTextColor="#777" style={styles.periodDateInput} keyboardType="numeric" />
                    </View>
                    <View style={styles.periodInputWrapper}>
                        <Text style={styles.periodInputPlaceholder}>Até</Text>
                        <TextInput value={reportEndDate} onChangeText={setReportEndDate} placeholder="dd/mm/aaaa" placeholderTextColor="#777" style={styles.periodDateInput} keyboardType="numeric" />
                    </View>
                    <Pressable style={styles.applyBtn} onPress={() => loadAdminData(adminId, selectedPeriod, reportStartDate, reportEndDate)}>
                        <Text style={styles.applyBtnText}>Aplicar</Text>
                    </Pressable>
                </View>
            </View>

            <Text style={styles.cardHeaderLabel}>ÚLTIMA SEMANA</Text>
            <View style={styles.metricsRow}>
                <View style={styles.metricCard}>
                    <Text style={styles.metricIcon}>📞</Text>
                    <Text style={styles.metricNumber}>{report.total}</Text>
                    <Text style={styles.metricLabel}>Total SOS</Text>
                </View>
                <View style={styles.metricCard}>
                    <Text style={styles.metricIcon}>⚡</Text>
                    <Text style={styles.metricNumber}>{report.average}</Text>
                    <Text style={styles.metricLabel}>Média/dia</Text>
                </View>
                <View style={styles.metricCard}>
                    <Text style={styles.metricIcon}>📈</Text>
                    <Text style={styles.metricNumber}>{report.peak}</Text>
                    <Text style={styles.metricLabel}>Pico</Text>
                </View>
            </View>

            <View style={styles.chartCard}>
                <Text style={styles.chartTitle}>Acionamentos por período</Text>
                <View style={styles.barsContainer}>
                    {(report.daily || []).map((item, i) => (
                        <View key={i} style={styles.barCol}>
                            {item.count === report.peak && <Text style={styles.barPeakLabel}>{item.count}</Text>}
                            <View
                                style={[
                                    styles.barFill,
                                    { height: report.peak ? Math.max(8, (item.count / report.peak) * 85) : 8 },
                                    item.count === report.peak && styles.barFillHighlight,
                                ]}
                            />
                            <Text style={styles.barDayText}>{new Date(item.day).toLocaleDateString('pt-BR', { weekday: 'short' })}</Text>
                        </View>
                    ))}
                </View>
            </View>
        </View>
    );

    // ==========================================
    // RENDER: SUB-TELA "NOVA PUBLICAÇÃO"
    // ==========================================
    const renderNewPostSubView = () => (
        <View style={styles.tabContentContainer}>
            <Pressable style={styles.backNavRow} onPress={() => setSubView(null)}>
                <Text style={styles.backNavText}>{'< Nova publicação'}</Text>
            </Pressable>

            <View style={styles.formGroup}>
                <Text style={styles.formLabel}>TÍTULO *</Text>
                <TextInput
                    value={newPostTitle}
                    onChangeText={setNewPostTitle}
                    placeholder="Título da publicação"
                    placeholderTextColor="#666"
                    style={styles.formInput}
                />
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.formLabel}>CATEGORIA *</Text>
                <Pressable
                    style={styles.selectDropdown}
                    onPress={() => setNewCategoryPickerOpen((isOpen) => !isOpen)}
                >
                    <Text style={{ color: '#EAEAEA' }}>{newPostCategory}</Text>
                    <Text style={{ color: '#888' }}>{isNewCategoryPickerOpen ? '▲' : '▼'}</Text>
                </Pressable>
                {isNewCategoryPickerOpen && (
                    <View style={styles.categoryOptions}>
                        {POST_CATEGORIES.map((category) => (
                            <Pressable
                                key={category}
                                style={styles.categoryOption}
                                onPress={() => {
                                    setNewPostCategory(category);
                                    setNewCategoryPickerOpen(false);
                                }}
                            >
                                <Text style={styles.categoryOptionText}>{category}</Text>
                            </Pressable>
                        ))}
                    </View>
                )}
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.formLabel}>CONTEÚDO *</Text>
                <TextInput
                    value={newPostContent}
                    onChangeText={setNewPostContent}
                    placeholder="Escreva o conteúdo. Use dois enters para separar parágrafos."
                    placeholderTextColor="#666"
                    multiline
                    numberOfLines={6}
                    style={styles.formTextArea}
                />
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.formLabel}>IMAGEM *</Text>
                <Pressable style={styles.imageUploadBox} onPress={() => pickPostImage(true)}>
                    <Text style={{ fontSize: 24, marginBottom: 8 }}>🖼️</Text>
                    {newPostImage ? (
                        <Image source={{ uri: newPostImage }} style={styles.uploadPreviewImage} resizeMode="cover" />
                    ) : (
                        <>
                            <Text style={styles.uploadTitle}>Toque para selecionar foto</Text>
                            <Text style={styles.uploadSubtitle}>JPG, JPEG ou PNG · máximo 5 MB</Text>
                        </>
                    )}
                </Pressable>
            </View>

            <Pressable style={styles.btnPrimary} onPress={publishNewPost}>
                <Text style={styles.btnPrimaryText}>Publicar</Text>
            </Pressable>
        </View>
    );

    // ==========================================
    // RENDER: SUB-TELA "EDITAR PUBLICAÇÃO"
    // ==========================================
    const renderEditPostSubView = () => (
        <View style={styles.tabContentContainer}>
            <Pressable style={styles.backNavRow} onPress={() => setSubView(null)}>
                <Text style={styles.backNavText}>{'< Editar publicação'}</Text>
            </Pressable>

            <View style={styles.formGroup}>
                <Text style={styles.formLabel}>TÍTULO *</Text>
                <TextInput value={postTitle} onChangeText={setPostTitle} style={styles.formInput} />
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.formLabel}>CATEGORIA *</Text>
                <Pressable
                    style={styles.selectDropdown}
                    onPress={() => setCategoryPickerOpen((isOpen) => !isOpen)}
                >
                    <Text style={{ color: '#EAEAEA' }}>{postCategory}</Text>
                    <Text style={{ color: '#888' }}>{isCategoryPickerOpen ? '▲' : '▼'}</Text>
                </Pressable>
                {isCategoryPickerOpen && (
                    <View style={styles.categoryOptions}>
                        {POST_CATEGORIES.map((category) => (
                            <Pressable
                                key={category}
                                style={styles.categoryOption}
                                onPress={() => {
                                    setPostCategory(category);
                                    setCategoryPickerOpen(false);
                                }}
                            >
                                <Text style={styles.categoryOptionText}>{category}</Text>
                            </Pressable>
                        ))}
                    </View>
                )}
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.formLabel}>CONTEÚDO *</Text>
                <TextInput
                    value={postContent}
                    onChangeText={setPostContent}
                    multiline
                    numberOfLines={8}
                    style={[styles.formTextArea, { height: 130, textAlignVertical: 'top' }]}
                />
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.formLabel}>IMAGEM *</Text>
                <Pressable style={styles.imagePreviewContainer} onPress={() => pickPostImage(false)}>
                    <Image source={{ uri: postImage || selectedPost?.image }} style={styles.previewImageFull} resizeMode="cover" />
                    <View style={styles.removeImageBadge}>
                        <Text style={{ color: '#FFF', fontSize: 12 }}>✕</Text>
                    </View>
                </Pressable>
            </View>

            <Pressable style={styles.btnPrimary} onPress={saveEditedPost}>
                <Text style={styles.btnPrimaryText}>Salvar alterações</Text>
            </Pressable>
        </View>
    );

    // ==========================================
    // RENDER: SUB-TELA "VISUALIZAR POST"
    // ==========================================
    const renderViewPostSubView = () => (
        <View style={styles.tabContentContainer}>
            <View style={styles.viewPostTopBar}>
                <Pressable onPress={() => setSubView(null)} style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={styles.backNavText}>{'< Visualizar post'}</Text>
                </Pressable>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                    <Pressable style={styles.topBarActionBtn} onPress={() => setSubView('editar')}>
                        <Text style={{ color: '#BAC7FF', fontSize: 12 }}>✏️ Editar</Text>
                    </Pressable>
                    <Pressable style={styles.topBarActionBtn} onPress={() => openDeletePost(selectedPost)}>
                        <View style={styles.deleteActionContent}>
                            <MaterialCommunityIcons name="delete-outline" size={16} color="#888" />
                            <Text style={styles.deleteActionText}>Excluir</Text>
                        </View>
                    </Pressable>
                </View>
            </View>

            <View style={styles.postDetailHeader}>
                <View style={[styles.categoryBadge, selectedPost?.badgeClass === 'blue' && styles.categoryBadgeBlue]}>
                    <Text style={[styles.categoryBadgeText, selectedPost?.badgeClass === 'blue' && styles.categoryBadgeTextBlue]}>{postCategory}</Text>
                </View>
                <Text style={styles.postTimeText}>{selectedPost?.time}</Text>
            </View>

            <Text style={styles.viewPostTitle}>{postTitle}</Text>

            <View style={styles.authorRow}>
                <View style={styles.authorAvatar}>
                    <Text style={{ color: '#FFF', fontWeight: 'bold' }}>G</Text>
                </View>
                <View>
                    <Text style={styles.authorName}>Equipe Guardiã</Text>

                    <Text style={styles.authorSub}>Publicação oficial</Text>
                </View>
            </View>

            <Text style={styles.viewPostTextBody}>
                {postContent}
            </Text>

            <Image source={{ uri: selectedPost?.image }} style={styles.viewPostMainImage} resizeMode="cover" />

            <View style={styles.viewPostFooterStats}>
                <Text style={styles.statIconText}>♡ {selectedPost?.likes} curtidas</Text>
                <Text style={styles.statIconText}>💬 {selectedPost?.comments.length} comentários</Text>
            </View>

            <View style={styles.commentsSectionHeader}>
                <Text style={styles.commentsSectionTitle}>
                    COMENTÁRIOS <Text style={{ color: '#D6395B' }}>{selectedPost?.comments.length || 0}</Text>
                </Text>
            </View>

            {selectedPost?.comments.length ? selectedPost.comments.map((comment, index) => (
                <View key={`${comment.author}-${comment.time}-${index}`} style={styles.commentCard}>
                    <View style={styles.commentCardHeader}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <View style={styles.commentAvatar}>
                                <Text style={{ color: '#FFF', fontSize: 12, fontWeight: 'bold' }}>{comment.avatar}</Text>
                            </View>
                            <Text style={styles.commentAuthorName}>{comment.author}</Text>
                        </View>
                        <Text style={styles.commentTime}>{comment.time}</Text>
                    </View>
                    <Text style={styles.commentText}>{comment.text}</Text>
                </View>
            )) : (
                <Text style={styles.emptyCommentsText}>Nenhum comentário nesta publicação.</Text>
            )}
        </View>
    );

    return (
        <MobileFrame backgroundColor="#0B0B0C" useThemeColors={false}>
            {feedback && (
                <View style={[styles.feedbackBanner, feedback.type === 'error' && styles.feedbackBannerError]}>
                    <MaterialCommunityIcons
                        name={feedback.type === 'error' ? 'alert-circle-outline' : 'check-circle-outline'}
                        size={20}
                        color="#FFFFFF"
                    />
                    <Text style={styles.feedbackText}>{feedback.message}</Text>
                </View>
            )}
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={styles.keyboardView}
            >
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollGrow}
                    showsVerticalScrollIndicator={true}
                    keyboardShouldPersistTaps="handled"
                    automaticallyAdjustKeyboardInsets
                >
                    <View style={styles.appContainer}>
                        {/* Top Header / Profile Card */}
                        {subView === null && <View style={styles.topSection}>
                            <View style={[styles.blob, styles.blob1]} />
                            <View style={[styles.blob, styles.blob2]} />

                            <View style={styles.headerContent}>
                                <View style={styles.adminProfileRow}>
                                    <View style={styles.adminShieldBox}>
                                        <Image source={logoGuardia} style={styles.adminLogo} resizeMode="contain" />
                                    </View>
                                    <View style={{ flex: 1, marginLeft: 12 }}>
                                        <Text style={styles.adminBrandTitle}>Guardiã Admin</Text>
                                        <Text style={styles.adminEmailText}>admin@guardiao.com</Text>
                                    </View>
                                    <Pressable
                                        style={styles.exitButton}
                                        onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Login' }] })}
                                    >
                                        <Text style={styles.exitButtonText}>[→ Sair</Text>
                                    </Pressable>
                                </View>

                                {/* Summary KPI Cards */}
                                <View style={styles.kpiRow}>
                                    <View style={styles.kpiCard}>
                                        <Text style={[styles.kpiNumber, { color: '#E8638B' }]}>{posts.length}</Text>
                                        <Text style={styles.kpiLabel}>Publicações</Text>
                                    </View>
                                    <View style={styles.kpiCard}>
                                        <Text style={[styles.kpiNumber, { color: '#64B5F6' }]}>{usersList.length}</Text>
                                        <Text style={styles.kpiLabel}>Usuários</Text>
                                    </View>
                                </View>

                                {/* Tabs Navigation */}
                                <View style={styles.tabsContainer}>
                                    <Pressable
                                        style={[styles.tabBtn, activeTab === 'posts' && subView === null && styles.tabBtnActive]}
                                        onPress={() => { setActiveTab('posts'); setSubView(null); }}
                                    >
                                        <Text style={[styles.tabBtnText, activeTab === 'posts' && subView === null && styles.tabBtnTextActive]}>Posts</Text>
                                    </Pressable>
                                    <Pressable
                                        style={[styles.tabBtn, activeTab === 'usuarios' && subView === null && styles.tabBtnActive]}
                                        onPress={() => { setActiveTab('usuarios'); setSubView(null); }}
                                    >
                                        <Text style={[styles.tabBtnText, activeTab === 'usuarios' && subView === null && styles.tabBtnTextActive]}>Usuários</Text>
                                    </Pressable>
                                    <Pressable
                                        style={[styles.tabBtn, activeTab === 'relatorios' && subView === null && styles.tabBtnActive]}
                                        onPress={() => { setActiveTab('relatorios'); setSubView(null); }}
                                    >
                                        <Text style={[styles.tabBtnText, activeTab === 'relatorios' && subView === null && styles.tabBtnTextActive]}>Relatórios</Text>
                                    </Pressable>
                                </View>
                            </View>
                        </View>}

                        {/* Bottom Content Area */}
                        <View style={[styles.bottomSection, subView !== null && styles.subViewSection]}>
                            {subView === null && activeTab === 'posts' && renderPostsTab()}
                            {subView === null && activeTab === 'usuarios' && renderUsersTab()}
                            {subView === null && activeTab === 'relatorios' && renderReportsTab()}

                            {subView === 'novo' && renderNewPostSubView()}
                            {subView === 'editar' && renderEditPostSubView()}
                            {subView === 'visualizar' && renderViewPostSubView()}
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            <Modal visible={isDeleteVisible} transparent animationType="fade" onRequestClose={() => setDeleteVisible(false)}>
                <View style={styles.deleteModalOverlay}>
                    <View style={styles.deleteDialog}>
                        <View style={styles.deleteDialogIcon}>
                            <MaterialCommunityIcons name="delete-outline" size={30} color="#EF5350" />
                        </View>
                        <Text style={styles.deleteDialogTitle}>Excluir publicação?</Text>
                        <Text style={styles.deleteDialogText}>
                            Esta ação removerá “{deleteTarget?.title}” dos fluxos admin e usuário.
                        </Text>
                        <View style={styles.deleteDialogActions}>
                            <Pressable style={styles.deleteCancelBtn} onPress={() => setDeleteVisible(false)}>
                                <Text style={styles.deleteCancelText}>Cancelar</Text>
                            </Pressable>
                            <Pressable style={styles.deleteConfirmBtn} onPress={confirmDeletePost}>
                                <Text style={styles.deleteConfirmText}>Excluir</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>

            <Modal visible={isUserDeleteVisible} transparent animationType="fade" onRequestClose={() => setUserDeleteVisible(false)}>
                <View style={styles.deleteModalOverlay}>
                    <View style={styles.deleteDialog}>
                        <View style={styles.deleteDialogIcon}>
                            <MaterialCommunityIcons name="account-remove-outline" size={30} color="#EF5350" />
                        </View>
                        <Text style={styles.deleteDialogTitle}>Excluir usuário?</Text>
                        <Text style={styles.deleteDialogText}>
                            Tem certeza que deseja excluir <Text style={{ fontWeight: '700', color: '#EAEAEA' }}>{userDeleteTarget?.nome}</Text>? Todos os dados associados serão removidos permanentemente.
                        </Text>
                        <View style={styles.deleteDialogActions}>
                            <Pressable style={styles.deleteCancelBtn} onPress={() => setUserDeleteVisible(false)}>
                                <Text style={styles.deleteCancelText}>Cancelar</Text>
                            </Pressable>
                            <Pressable style={styles.deleteConfirmBtn} onPress={confirmDeleteUser}>
                                <Text style={styles.deleteConfirmText}>Sim, excluir</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
        </MobileFrame>
    );
}

const styles = StyleSheet.create({
    authorizationLoading: {
        flex: 1,
        minHeight: '100%',
        backgroundColor: '#0C0D10',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    authorizationLoadingText: {
        color: '#FFFFFF',
        fontSize: 15,
        marginTop: 14,
        textAlign: 'center',
    },
    keyboardView: { flex: 1 },
    scrollGrow: { flexGrow: 1 },
    appContainer: { flex: 1, backgroundColor: '#0B0B0C' },
    scrollView: { flex: 1 },
    topSection: {
        backgroundColor: '#4A1224',
        paddingTop: 20,
        paddingBottom: 16,
        position: 'relative',
        overflow: 'hidden',
    },
    blob: { position: 'absolute', borderRadius: 999, backgroundColor: 'rgba(166, 43, 79, 0.45)' },
    blob1: { width: 250, height: 250, top: -50, left: -100 },
    blob2: { width: 380, height: 380, top: -120, right: -150, backgroundColor: 'rgba(133, 22, 50, 0.7)' },
    headerContent: { paddingHorizontal: 20, zIndex: 2 },
    adminProfileRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    adminShieldBox: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    adminLogo: {
        width: 36,
        height: 36,
    },
    adminBrandTitle: { fontSize: 18, fontWeight: '700', color: '#FFFFFF' },
    adminEmailText: { fontSize: 12, color: 'rgba(255,255,255,0.6)' },
    exitButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    exitButtonText: { color: '#FFF', fontSize: 12 },
    kpiRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
    kpiCard: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.25)',
        borderRadius: 12,
        padding: 14,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
        alignItems: 'center',
    },
    kpiNumber: { fontSize: 24, fontWeight: '700', marginBottom: 2 },
    kpiLabel: { fontSize: 12, color: '#A0A0A5' },
    tabsContainer: { flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 24, padding: 4 },
    tabBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 20 },
    tabBtnActive: { backgroundColor: '#A62B4F' },
    tabBtnText: { color: '#A0A0A5', fontSize: 13, fontWeight: '600' },
    tabBtnTextActive: { color: '#FFFFFF' },
    bottomSection: { backgroundColor: '#0B0B0C', paddingHorizontal: 20, paddingTop: 24, paddingBottom: 30 },
    subViewSection: { flex: 1, paddingTop: 24, paddingBottom: 40 },
    deleteModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 },
    deleteDialog: { width: '100%', maxWidth: 360, backgroundColor: '#171719', borderRadius: 20, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: '#2A2A2E' },
    deleteDialogIcon: { width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(239,83,80,0.12)', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
    deleteDialogTitle: { color: '#FFF', fontSize: 19, fontWeight: '700', marginBottom: 10 },
    deleteDialogText: { color: '#A0A0A5', fontSize: 13, lineHeight: 20, textAlign: 'center', marginBottom: 22 },
    deleteDialogActions: { flexDirection: 'row', gap: 10, width: '100%' },
    deleteCancelBtn: { flex: 1, borderRadius: 10, borderWidth: 1, borderColor: '#3A3A3F', paddingVertical: 12, alignItems: 'center' },
    deleteCancelText: { color: '#B0B0B5', fontSize: 13, fontWeight: '600' },
    deleteConfirmBtn: { flex: 1, borderRadius: 10, backgroundColor: '#B83B4A', paddingVertical: 12, alignItems: 'center' },
    deleteConfirmText: { color: '#FFF', fontSize: 13, fontWeight: '700' },
    feedbackBanner: { position: 'absolute', top: 16, left: 16, right: 16, zIndex: 20, elevation: 20, minHeight: 48, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, backgroundColor: '#2E8B57', flexDirection: 'row', alignItems: 'center', gap: 8 },
    feedbackBannerError: { backgroundColor: '#B83B4A' },
    feedbackText: { flex: 1, color: '#FFFFFF', fontSize: 13, fontWeight: '600' },
    tabContentContainer: { width: '100%' },
    sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    sectionTitle: { fontSize: 16, fontWeight: '600', color: '#FFFFFF', marginBottom: 12 },
    btnAddPost: { backgroundColor: '#A62B4F', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
    btnAddPostText: { color: '#FFF', fontSize: 13, fontWeight: '600' },
    postCard: { backgroundColor: '#171719', borderRadius: 16, marginBottom: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#222' },
    postCardImage: { width: '100%', height: 140 },
    postCardBody: { padding: 14 },
    postBadgeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    categoryBadge: { backgroundColor: '#4A1224', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    categoryBadgeText: { color: '#E8638B', fontSize: 11, fontWeight: '600' },
    categoryBadgeBlue: { backgroundColor: '#172B4A' },
    categoryBadgeTextBlue: { color: '#64B5F6' },
    categoryOptions: { backgroundColor: '#171719', borderRadius: 10, borderWidth: 1, borderColor: '#222', marginTop: 6, overflow: 'hidden' },
    categoryOption: { paddingHorizontal: 12, paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: '#222' },
    categoryOptionText: { color: '#EAEAEA', fontSize: 13 },
    postTimeText: { fontSize: 11, color: '#777' },
    postCardTitle: { fontSize: 15, fontWeight: '700', color: '#FFFFFF', marginBottom: 6 },
    postCardExcerpt: { fontSize: 12, color: '#999', marginBottom: 14, lineHeight: 18 },
    postCardActions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#222', paddingTop: 10 },
    statsInfo: { flexDirection: 'row', gap: 12 },
    statIconText: { fontSize: 12, color: '#888' },
    actionButtonsRow: { flexDirection: 'row', gap: 8 },
    actionBtn: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 20, borderWidth: 1 },
    actionBtnVer: { borderColor: '#4CAF50' },
    actionBtnEditar: { borderColor: '#7986CB' },
    actionBtnExcluir: { borderColor: '#EF5350' },
    actionBtnTextVer: { color: '#4CAF50', fontSize: 12, fontWeight: '600' },
    actionBtnTextEditar: { color: '#7986CB', fontSize: 12, fontWeight: '600' },
    actionBtnTextExcluir: { color: '#EF5350', fontSize: 12, fontWeight: '600' },
    searchContainer: { marginBottom: 16 },
    searchInput: { backgroundColor: '#171719', borderRadius: 12, height: 46, paddingHorizontal: 16, color: '#FFF', fontSize: 13, borderWidth: 1, borderColor: '#222' },
    userCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#171719', borderRadius: 12, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: '#222' },
    userAvatarBox: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#4A1224', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    userAvatarText: { color: '#E8638B', fontSize: 12, fontWeight: 'bold' },
    userInfoBox: { flex: 1 },
    userName: { fontSize: 13, fontWeight: '600', color: '#FFF', marginBottom: 2 },
    userEmail: { fontSize: 11, color: '#888', marginBottom: 2 },
    userMeta: { fontSize: 10, color: '#555' },
    userDeleteBtn: { padding: 6 },
    emptyUsersText: { color: '#888', fontSize: 13, textAlign: 'center', paddingVertical: 24 },
    filterPillsRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
    filterPill: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16, backgroundColor: '#171719', borderWidth: 1, borderColor: '#222' },
    filterPillActive: { backgroundColor: '#A62B4F', borderColor: '#A62B4F' },
    filterPillText: { fontSize: 12, color: '#888' },
    filterPillTextActive: { color: '#FFF', fontWeight: '600' },
    customPeriodCard: { backgroundColor: '#171719', borderRadius: 14, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: '#222' },
    cardHeaderLabel: { fontSize: 10, fontWeight: '700', color: '#777', marginBottom: 8, letterSpacing: 0.5 },
    periodInputsRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
    periodInputWrapper: { flex: 1, backgroundColor: '#111', borderRadius: 8, padding: 8, borderWidth: 1, borderColor: '#222' },
    periodInputPlaceholder: { fontSize: 10, color: '#555', marginBottom: 2 },
    periodDateVal: { fontSize: 11, color: '#888' },
    periodDateInput: { color: '#EAEAEA', fontSize: 11, padding: 0, marginTop: 4 },
    applyBtn: { backgroundColor: '#222', paddingHorizontal: 12, paddingVertical: 12, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
    applyBtnText: { color: '#CCC', fontSize: 12, fontWeight: '600' },
    metricsRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
    metricCard: { flex: 1, backgroundColor: '#171719', borderRadius: 12, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: '#222' },
    metricIcon: { fontSize: 14, marginBottom: 4 },
    metricNumber: { fontSize: 18, fontWeight: '700', color: '#FFF', marginBottom: 2 },
    metricLabel: { fontSize: 10, color: '#777' },
    chartCard: { backgroundColor: '#171719', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#222' },
    chartTitle: { fontSize: 13, fontWeight: '600', color: '#FFF', marginBottom: 20 },
    barsContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 110, paddingBottom: 4 },
    barCol: { alignItems: 'center', flex: 1 },
    barPeakLabel: { fontSize: 10, color: '#E8638B', fontWeight: 'bold', marginBottom: 4 },
    barFill: { width: 18, backgroundColor: '#2A1A22', borderRadius: 4, marginBottom: 6 },
    barFillHighlight: { backgroundColor: '#A62B4F' },
    barDayText: { fontSize: 10, color: '#777' },
    backNavRow: { marginBottom: 16 },
    backNavText: { color: '#888', fontSize: 13, fontWeight: '500' },
    formGroup: { marginBottom: 16 },
    formLabel: { fontSize: 10, fontWeight: '700', color: '#888', marginBottom: 6, letterSpacing: 0.5 },
    formInput: { backgroundColor: '#171719', borderRadius: 10, height: 46, paddingHorizontal: 12, color: '#FFF', fontSize: 13, borderWidth: 1, borderColor: '#222' },
    selectDropdown: { backgroundColor: '#171719', borderRadius: 10, height: 46, paddingHorizontal: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#222' },
    formTextArea: { backgroundColor: '#171719', borderRadius: 10, padding: 12, color: '#FFF', fontSize: 13, borderWidth: 1, borderColor: '#222', height: 100, textAlignVertical: 'top' },
    imageUploadBox: { backgroundColor: '#171719', borderRadius: 10, height: 110, borderWidth: 1, borderColor: '#222', borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center' },
    uploadPreviewImage: { width: '100%', height: '100%', borderRadius: 10 },
    uploadTitle: { fontSize: 12, color: '#AAA', fontWeight: '500', marginBottom: 2 },
    uploadSubtitle: { fontSize: 10, color: '#666' },
    btnPrimary: { backgroundColor: '#A62B4F', borderRadius: 12, height: 48, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
    btnPrimaryText: { color: '#FFF', fontSize: 14, fontWeight: '600' },
    imagePreviewContainer: { position: 'relative', borderRadius: 10, overflow: 'hidden', height: 120, borderWidth: 1, borderColor: '#222' },
    previewImageFull: { width: '100%', height: '100%' },
    removeImageBadge: { position: 'absolute', top: 8, right: 8, width: 24, height: 24, borderRadius: 12, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
    viewPostTopBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    topBarActionBtn: { paddingHorizontal: 10, paddingVertical: 4, backgroundColor: '#171719', borderRadius: 8, borderWidth: 1, borderColor: '#222' },
    deleteActionContent: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    deleteActionText: { color: '#888', fontSize: 12 },
    postDetailHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    viewPostTitle: { fontSize: 18, fontWeight: '700', color: '#FFF', marginBottom: 12 },
    authorRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 10 },
    authorAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#A62B4F', justifyContent: 'center', alignItems: 'center' },
    authorName: { fontSize: 12, fontWeight: '600', color: '#FFF' },
    authorSub: { fontSize: 10, color: '#777' },
    viewPostTextBody: { fontSize: 13, color: '#CCC', lineHeight: 20, marginBottom: 16 },
    viewPostMainImage: { width: '100%', height: 160, borderRadius: 12, marginBottom: 16 },
    viewPostFooterStats: { flexDirection: 'row', gap: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#222', marginBottom: 16 },
    commentsSectionHeader: { marginBottom: 12 },
    commentsSectionTitle: { fontSize: 12, fontWeight: '700', color: '#888', letterSpacing: 0.5 },
    commentCard: { backgroundColor: '#171719', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#222' },
    commentCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    commentAvatar: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#333', justifyContent: 'center', alignItems: 'center' },
    commentAuthorName: { fontSize: 12, fontWeight: '600', color: '#FFF' },
    commentTime: { fontSize: 10, color: '#666' },
    commentText: { fontSize: 12, color: '#BBB', lineHeight: 18 },
    emptyCommentsText: { color: '#888', fontSize: 12, fontStyle: 'italic', marginBottom: 16 },
});