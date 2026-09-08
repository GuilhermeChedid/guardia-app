import React, { createContext, useContext, useMemo, useState } from 'react';
import { useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { POSTS } from '../constants/posts';

const PostsContext = createContext(null);
const POSTS_STORAGE_KEY = '@guardia/posts';

export function PostsProvider({ children }) {
    const [posts, setPosts] = useState(POSTS);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        AsyncStorage.getItem(POSTS_STORAGE_KEY)
            .then((storedPosts) => {
                if (storedPosts) setPosts(JSON.parse(storedPosts));
            })
            .catch(() => undefined)
            .finally(() => setLoaded(true));
    }, []);

    useEffect(() => {
        if (loaded) AsyncStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify(posts));
    }, [posts, loaded]);

    const updatePost = (postId, changes) => {
        setPosts((currentPosts) =>
            currentPosts.map((post) => (post.id === postId ? { ...post, ...changes } : post))
        );
    };

    const addPost = (post) => {
        setPosts((currentPosts) => [post, ...currentPosts]);
    };

    const deletePost = (postId) => {
        setPosts((currentPosts) => currentPosts.filter((post) => post.id !== postId));
    };

    const value = useMemo(() => ({ posts, updatePost, addPost, deletePost }), [posts]);

    return <PostsContext.Provider value={value}>{children}</PostsContext.Provider>;
}

export function usePosts() {
    const context = useContext(PostsContext);
    if (!context) throw new Error('usePosts must be used inside PostsProvider');
    return context;
}
