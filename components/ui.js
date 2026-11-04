// ui.js — shared CannaPlan UI components built on the theme.

import React, { useContext } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  StatusBar,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomTabBarHeightContext } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, useStyles, fonts, space, radius } from '../theme/theme';

// ---------- Layout ----------

export function Screen({ children, scroll = true, header, footer, contentStyle, scrollRef }) {
  const { theme } = useTheme();
  const s = useStyles(makeStyles);
  // Inside the tab navigator the tab bar already sits above Android's nav bar.
  // Stand-alone screens reserve the bottom safe area themselves, so content and
  // footers stop above the system buttons instead of scrolling behind them.
  const inTabs = useContext(BottomTabBarHeightContext) !== undefined;
  const edges = inTabs ? ['top'] : ['top', 'bottom'];
  return (
    <SafeAreaView style={s.screen} edges={edges}>
      <StatusBar
        barStyle={theme.mode === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={theme.bg}
      />
      {header}
      {scroll ? (
        <ScrollView
          ref={scrollRef}
          style={{ flex: 1 }}
          contentContainerStyle={[s.content, contentStyle]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[s.content, { flex: 1 }, contentStyle]}>{children}</View>
      )}
      {footer ? <View style={s.footer}>{footer}</View> : null}
    </SafeAreaView>
  );
}

export function Header({ title, subtitle, onBack, right }) {
  const { theme } = useTheme();
  const s = useStyles(makeStyles);
  return (
    <View style={s.header}>
      {onBack ? (
        <Pressable onPress={onBack} hitSlop={12} style={s.headerBack} accessibilityLabel="Back">
          <Ionicons name="chevron-back" size={24} color={theme.text} />
        </Pressable>
      ) : null}
      <View style={{ flex: 1 }}>
        <Text style={s.headerTitle} numberOfLines={1}>{title}</Text>
        {subtitle ? <Text style={s.headerSubtitle} numberOfLines={1}>{subtitle}</Text> : null}
      </View>
      {right}
    </View>
  );
}

// Wordmark used once, on the home screen.
export function Wordmark({ size = 26 }) {
  const { theme } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Image source={require('../assets/leaf.png')} style={{ width: size, height: size, tintColor: theme.accent, marginRight: 10 }} />
      <Text style={{ fontFamily: fonts.brand, fontSize: size * 0.85, color: theme.text, letterSpacing: 1 }}>CANNAPLAN</Text>
    </View>
  );
}

// ---------- Containers ----------

export function Card({ children, style, onPress, accentColor }) {
  const s = useStyles(makeStyles);
  const inner = (
    <>
      {accentColor ? <View style={[s.cardAccent, { backgroundColor: accentColor }]} /> : null}
      {children}
    </>
  );
  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [s.card, style, pressed && s.pressed]}>
        {inner}
      </Pressable>
    );
  }
  return <View style={[s.card, style]}>{inner}</View>;
}

export function SectionTitle({ children, action }) {
  const s = useStyles(makeStyles);
  return (
    <View style={s.sectionRow}>
      <Text style={s.sectionTitle}>{children}</Text>
      {action}
    </View>
  );
}

// ---------- Text ----------

export function T({ children, variant = 'body', color, style, ...rest }) {
  const { theme } = useTheme();
  const v = textVariants(theme)[variant];
  return <Text style={[v, color && { color }, style]} {...rest}>{children}</Text>;
}

const textVariants = (t) => ({
  display: { fontFamily: fonts.bold, fontSize: 28, color: t.text, letterSpacing: -0.5 },
  title: { fontFamily: fonts.semibold, fontSize: 20, color: t.text },
  heading: { fontFamily: fonts.semibold, fontSize: 16, color: t.text },
  body: { fontFamily: fonts.regular, fontSize: 15, color: t.text, lineHeight: 21 },
  muted: { fontFamily: fonts.regular, fontSize: 14, color: t.textMuted, lineHeight: 20 },
  small: { fontFamily: fonts.medium, fontSize: 12, color: t.textMuted },
  label: { fontFamily: fonts.semibold, fontSize: 12, color: t.textMuted, letterSpacing: 0.8, textTransform: 'uppercase' },
  number: { fontFamily: fonts.bold, fontSize: 20, color: t.text },
});

// ---------- Controls ----------

export function Button({ title, onPress, variant = 'primary', icon, disabled, style, compact }) {
  const { theme } = useTheme();
  const s = useStyles(makeStyles);
  const v = {
    primary: { bg: theme.accent, fg: theme.onAccent, border: theme.accent },
    secondary: { bg: 'transparent', fg: theme.text, border: theme.border },
    ghost: { bg: 'transparent', fg: theme.accent, border: 'transparent' },
    danger: { bg: theme.dangerSoft, fg: theme.danger, border: 'transparent' },
  }[variant];
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        s.button,
        compact && s.buttonCompact,
        { backgroundColor: v.bg, borderColor: v.border },
        (pressed || disabled) && { opacity: disabled ? 0.4 : 0.75 },
        style,
      ]}
    >
      {icon ? <Ionicons name={icon} size={18} color={v.fg} style={{ marginRight: title ? 8 : 0 }} /> : null}
      {title ? <Text style={[s.buttonText, { color: v.fg }]}>{title}</Text> : null}
    </Pressable>
  );
}

export function IconButton({ icon, onPress, label }) {
  const { theme } = useTheme();
  const s = useStyles(makeStyles);
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [s.iconButton, pressed && s.pressed]} accessibilityLabel={label}>
      <Ionicons name={icon} size={20} color={theme.text} />
      {label ? <Text style={s.iconButtonLabel}>{label}</Text> : null}
    </Pressable>
  );
}

export function Chip({ label, selected, onPress, icon }) {
  const { theme } = useTheme();
  const s = useStyles(makeStyles);
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [s.chip, selected && s.chipSelected, pressed && s.pressed]}
      accessibilityRole="button"
      accessibilityState={{ selected }}
    >
      {icon ? <Ionicons name={icon} size={14} color={selected ? theme.onAccent : theme.textMuted} style={{ marginRight: 6 }} /> : null}
      <Text style={[s.chipText, selected && s.chipTextSelected]}>{label}</Text>
    </Pressable>
  );
}

// options: array of strings or { label, value }
export function ChipGroup({ options, value, onChange }) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -4 }}>
      {options.map((o) => {
        const opt = typeof o === 'string' ? { label: o, value: o } : o;
        return (
          <View key={opt.value} style={{ padding: 4 }}>
            <Chip label={opt.label} selected={value === opt.value} onPress={() => onChange(opt.value)} />
          </View>
        );
      })}
    </View>
  );
}

export function Field({ label, hint, error, children }) {
  const { theme } = useTheme();
  return (
    <View style={{ marginBottom: space.lg }}>
      {label ? <T variant="label" style={{ marginBottom: space.sm }}>{label}</T> : null}
      {children}
      {error ? <T variant="small" color={theme.danger} style={{ marginTop: 6 }}>{error}</T> : null}
      {!error && hint ? <T variant="small" style={{ marginTop: 6 }}>{hint}</T> : null}
    </View>
  );
}

export function Input(props) {
  const { theme } = useTheme();
  const s = useStyles(makeStyles);
  return <TextInput placeholderTextColor={theme.textFaint} {...props} style={[s.input, props.style]} />;
}

// ---------- Data display ----------

export const phaseColor = (theme, kind) => theme.phase[kind] || theme.textMuted;

export function PhaseBadge({ kind, label }) {
  const { theme } = useTheme();
  const s = useStyles(makeStyles);
  const c = phaseColor(theme, kind);
  return (
    <View style={[s.badge, { backgroundColor: c + '26' }]}>
      <View style={[s.badgeDot, { backgroundColor: c }]} />
      <Text style={[s.badgeText, { color: c, flexShrink: 1 }]} numberOfLines={1}>{label}</Text>
    </View>
  );
}

// segments: [{ kind, weeks }], progress: 0..1
export function PhaseProgress({ segments, progress = 0, height = 8 }) {
  const { theme } = useTheme();
  const total = segments.reduce((n, sgm) => n + sgm.weeks, 0) || 1;
  const pct = Math.max(0, Math.min(1, progress));
  return (
    <View>
      <View style={{ flexDirection: 'row', height, borderRadius: height, overflow: 'hidden', backgroundColor: theme.surfaceAlt }}>
        {segments.map((sgm, i) => (
          <View
            key={i}
            style={{ flex: sgm.weeks / total, backgroundColor: phaseColor(theme, sgm.kind), opacity: 0.85, marginRight: i < segments.length - 1 ? 2 : 0 }}
          />
        ))}
      </View>
      <View style={{ position: 'absolute', left: `${pct * 100}%`, top: -4, marginLeft: -2, width: 4, height: height + 8, borderRadius: 2, backgroundColor: theme.text }} />
    </View>
  );
}

export function InfoPill({ icon, text }) {
  const { theme } = useTheme();
  const s = useStyles(makeStyles);
  return (
    <View style={s.infoPill}>
      <Ionicons name={icon} size={14} color={theme.textMuted} style={{ marginRight: 6 }} />
      <Text style={s.infoPillText}>{text}</Text>
    </View>
  );
}

export function ListRow({ icon, title, subtitle, onPress, right, danger }) {
  const { theme } = useTheme();
  const s = useStyles(makeStyles);
  const color = danger ? theme.danger : theme.text;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [s.listRow, pressed && onPress && s.pressed]}>
      {icon ? <Ionicons name={icon} size={20} color={danger ? theme.danger : theme.textMuted} style={{ marginRight: 14 }} /> : null}
      <View style={{ flex: 1 }}>
        <Text style={[s.listTitle, { color }]}>{title}</Text>
        {subtitle ? <Text style={s.listSubtitle}>{subtitle}</Text> : null}
      </View>
      {right !== undefined ? right : onPress ? <Ionicons name="chevron-forward" size={18} color={theme.textFaint} /> : null}
    </Pressable>
  );
}

export function EmptyState({ title, message, action }) {
  const { theme } = useTheme();
  return (
    <View style={{ alignItems: 'center', paddingVertical: space.xxl, paddingHorizontal: space.lg }}>
      <Image source={require('../assets/leaf.png')} style={{ width: 72, height: 72, tintColor: theme.surfaceAlt, marginBottom: space.lg }} />
      <T variant="title" style={{ textAlign: 'center', marginBottom: 6 }}>{title}</T>
      {message ? <T variant="muted" style={{ textAlign: 'center', marginBottom: space.lg }}>{message}</T> : null}
      {action}
    </View>
  );
}

// ---------- Styles ----------

const makeStyles = (t) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: t.bg },
    content: { paddingHorizontal: space.lg, paddingBottom: space.xxl },
    footer: {
      paddingHorizontal: space.lg,
      paddingTop: space.md,
      paddingBottom: space.lg,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: t.border,
      backgroundColor: t.bg,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: space.lg,
      paddingTop: space.sm,
      paddingBottom: space.md,
      minHeight: 56,
    },
    headerBack: { marginRight: space.sm, marginLeft: -6, padding: 2 },
    headerTitle: { fontFamily: fonts.bold, fontSize: 22, color: t.text, letterSpacing: -0.3 },
    headerSubtitle: { fontFamily: fonts.regular, fontSize: 13, color: t.textMuted, marginTop: 2 },
    card: {
      backgroundColor: t.surface,
      borderRadius: radius.lg,
      padding: space.lg,
      marginBottom: space.md,
      borderWidth: t.mode === 'light' ? StyleSheet.hairlineWidth : 0,
      borderColor: t.border,
      overflow: 'hidden',
    },
    cardAccent: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 4 },
    pressed: { opacity: 0.75 },
    sectionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: space.lg,
      marginBottom: space.sm,
    },
    sectionTitle: { fontFamily: fonts.semibold, fontSize: 12, color: t.textMuted, letterSpacing: 0.8, textTransform: 'uppercase' },
    button: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.md,
      borderWidth: 1,
      paddingVertical: 14,
      paddingHorizontal: space.lg,
    },
    buttonCompact: { paddingVertical: 9, paddingHorizontal: space.md },
    buttonText: { fontFamily: fonts.semibold, fontSize: 15 },
    iconButton: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: space.md,
      borderRadius: radius.md,
      backgroundColor: t.surface,
      marginHorizontal: 4,
    },
    iconButtonLabel: { fontFamily: fonts.medium, fontSize: 12, color: t.textMuted, marginTop: 6 },
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 9,
      paddingHorizontal: 14,
      borderRadius: radius.pill,
      backgroundColor: t.surfaceAlt,
      borderWidth: 1,
      borderColor: t.surfaceAlt,
    },
    chipSelected: { backgroundColor: t.accent, borderColor: t.accent },
    chipText: { fontFamily: fonts.medium, fontSize: 14, color: t.text },
    chipTextSelected: { color: t.onAccent, fontFamily: fonts.semibold },
    input: {
      backgroundColor: t.surfaceAlt,
      borderRadius: radius.md,
      paddingHorizontal: space.lg,
      paddingVertical: 13,
      fontFamily: fonts.regular,
      fontSize: 16,
      color: t.text,
    },
    badge: {
      flexDirection: 'row',
      maxWidth: '100%',
      flexShrink: 1,
      alignItems: 'center',
      alignSelf: 'flex-start',
      paddingVertical: 4,
      paddingHorizontal: 10,
      borderRadius: radius.pill,
    },
    badgeDot: { width: 7, height: 7, borderRadius: 4, marginRight: 6 },
    badgeText: { fontFamily: fonts.semibold, fontSize: 12, letterSpacing: 0.3 },
    infoPill: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: t.surfaceAlt,
      borderRadius: radius.pill,
      paddingVertical: 6,
      paddingHorizontal: 10,
      marginRight: 8,
      marginBottom: 8,
    },
    infoPillText: { fontFamily: fonts.medium, fontSize: 13, color: t.text },
    listRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14 },
    listTitle: { fontFamily: fonts.medium, fontSize: 15 },
    listSubtitle: { fontFamily: fonts.regular, fontSize: 13, color: t.textMuted, marginTop: 2 },
  });

// Brand logo, or a neat initial tile when no logo file is bundled.
export function BrandLogo({ brand, style }) {
  if (brand?.logo) return <Image source={brand.logo} style={[{ width: '100%', height: '100%' }, style]} resizeMode="contain" />;
  return (
    <View style={{ flex: 1, alignSelf: 'stretch', alignItems: 'center', justifyContent: 'center', borderRadius: 6, backgroundColor: '#2C6E2F' }}>
      <Text style={{ fontFamily: fonts.bold, fontSize: 20, color: '#FFFFFF' }}>{(brand?.name || '?').charAt(0).toUpperCase()}</Text>
    </View>
  );
}
