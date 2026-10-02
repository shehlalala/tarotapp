import { memo, useCallback } from 'react';
import { FlatList, Pressable, StyleSheet, View, type ListRenderItem } from 'react-native';
import { t } from '../i18n';
import { CARD_ASPECT, space } from '../theme';
import { CardBack } from './CardBack';

interface Props {
  deck: string[];
  slotted: ReadonlyArray<string | null>;
  cardWidth: number;
  onPick: (id: string) => void;
}

/** How much of each card shows under the next one in the fanned row. */
const VISIBLE_FRACTION = 0.55;

/**
 * The face-down deck as an overlapping, horizontally scrolling row. Slotted
 * cards leave a gap so the rest of the deck does not jump around.
 */
export function Deck({ deck, slotted, cardWidth, onPick }: Props) {
  const step = cardWidth * VISIBLE_FRACTION;
  const height = cardWidth / CARD_ASPECT;

  const renderItem = useCallback<ListRenderItem<string>>(
    ({ item, index }) => (
      <DeckCard
        id={item}
        index={index}
        total={deck.length}
        width={cardWidth}
        step={step}
        hidden={slotted.includes(item)}
        onPick={onPick}
      />
    ),
    [deck.length, cardWidth, step, slotted, onPick],
  );

  return (
    <FlatList
      data={deck}
      extraData={slotted}
      keyExtractor={(id) => id}
      renderItem={renderItem}
      horizontal
      showsHorizontalScrollIndicator={false}
      style={{ flexGrow: 0, height: height + space.lg }}
      contentContainerStyle={styles.content}
      getItemLayout={(_, index) => ({ length: step, offset: step * index, index })}
      initialNumToRender={20}
      windowSize={7}
    />
  );
}

interface DeckCardProps {
  id: string;
  index: number;
  total: number;
  width: number;
  step: number;
  hidden: boolean;
  onPick: (id: string) => void;
}

const DeckCard = memo(function DeckCard({ id, index, total, width, step, hidden, onPick }: DeckCardProps) {
  return (
    // Each cell is `step` wide; the card overflows to the right under the next one.
    <View style={{ width: step }}>
      {hidden ? null : (
        <Pressable
          onPress={() => onPick(id)}
          accessibilityRole="button"
          accessibilityLabel={t('a11y.deckCard', { n: index + 1, total })}
          accessibilityHint={t('a11y.deckCardHint')}
          style={({ pressed }) => [{ width }, pressed && styles.pressed]}
        >
          <CardBack width={width} />
        </Pressable>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  content: { paddingHorizontal: space.md, paddingTop: space.md, alignItems: 'flex-start' },
  pressed: { transform: [{ translateY: -10 }] },
});
