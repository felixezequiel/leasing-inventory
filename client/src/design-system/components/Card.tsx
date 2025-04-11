import React from 'react';
import { Card as PaperCard } from 'react-native-paper';
import { StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../themes/ThemeContext';

interface CardProps {
  children: React.ReactNode;
  elevation?: number;
  style?: ViewStyle;
  onPress?: () => void;
}

export const Card = ({
  children,
  elevation = 1,
  style,
  onPress,
  ...props
}: CardProps) => {
  const { theme } = useTheme();
  
  return (
    <PaperCard
      elevation={elevation as any}
      mode="elevated"
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.borderRadius.md,
        },
        style,
      ]}
      onPress={onPress}
      {...props}
    >
      <PaperCard.Content style={styles.content}>
        {children}
      </PaperCard.Content>
    </PaperCard>
  );
};

// Card.Content para conteúdo de card
interface CardContentProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

Card.Content = ({
  children,
  style,
  ...props
}: CardContentProps) => {
  return (
    <PaperCard.Content
      style={[styles.content, style]}
      {...props}
    >
      {children}
    </PaperCard.Content>
  );
};

// Card.Title para títulos de card
interface CardTitleProps {
  title: string;
  subtitle?: string;
  left?: React.ReactNode;
  right?: React.ReactNode;
  style?: ViewStyle;
}

Card.Title = ({
  title,
  subtitle,
  left,
  right,
  style,
  ...props
}: CardTitleProps) => {
  return (
    <PaperCard.Title
      title={title}
      subtitle={subtitle}
      left={() => left}
      right={() => right}
      style={[styles.title, style]}
      {...props}
    />
  );
};

// Card.Actions para ações do card
interface CardActionsProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

Card.Actions = ({
  children,
  style,
  ...props
}: CardActionsProps) => {
  return (
    <PaperCard.Actions
      style={[styles.actions, style]}
      {...props}
    >
      {children}
    </PaperCard.Actions>
  );
};

// Card.Cover para imagens de capa
interface CardCoverProps {
  source: { uri: string } | number;
  style?: ViewStyle;
}

Card.Cover = ({
  source,
  style,
  ...props
}: CardCoverProps) => {
  const { theme } = useTheme();
  
  return (
    <PaperCard.Cover
      source={source}
      style={[
        styles.cover,
        {
          borderTopLeftRadius: theme.borderRadius.md,
          borderTopRightRadius: theme.borderRadius.md,
        },
        style,
      ]}
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 8,
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  title: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  actions: {
    paddingHorizontal: 8,
    justifyContent: 'flex-end',
  },
  cover: {
    height: 200,
  },
}); 