import React from 'react';
import { Text } from 'react-native';

export const normalizePostContent = (title = '', content = '') => {
    const normalizedTitle = title.trim();
    const paragraphs = String(content)
        .split(/\n\s*\n/)
        .map((paragraph) => paragraph.trim())
        .filter(Boolean);

    if (paragraphs[0]?.replace(/\*\*/g, '').trim() === normalizedTitle) {
        paragraphs.shift();
    }

    return paragraphs;
};

export const renderMarkdownText = (value = '', style) => {
    const parts = String(value).split(/(\*\*[^*]+\*\*)/g);
    return (
        <Text style={style}>
            {parts.map((part, index) => {
                const match = part.match(/^\*\*(.+)\*\*$/s);
                return match ? (
                    <Text key={index} style={{ fontWeight: 'bold' }}>{match[1]}</Text>
                ) : part;
            })}
        </Text>
    );
};
