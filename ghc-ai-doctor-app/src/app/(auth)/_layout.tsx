import { useEffect, useCallback } from 'react';
import { TouchableWithoutFeedback, View, StyleSheet } from 'react-native';
import { Stack, router, useNavigationContainerRef } from 'expo-router';
import { preventScreenCaptureAsync, allowScreenCaptureAsync } from 'expo-screen-capture';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSkeleton } from '@/components';

/**
 * Protected route layout for authenticated screens.
 * Checks session on mount and redirects to login if not authenticated.
 * Tracks user interaction (tap, scroll, navigation) to reset inactivity timer (Story 2.4).
 * Prevents screenshots on all authenticated screens (Story 2.5).
 * The login screen (src/app/index.tsx) is intentionally excluded — it contains no patient data.
 */
export default function AuthLayout() {
  const { isAuthenticated, isLoading, resetInactivityTimer } = useAuth();

  // Prevent screenshots only while authenticated (Story 2.5).
  // Uses the imperative API so the FLAG_SECURE window flag is only active when
  // isAuthenticated is true — avoids setting it during the unauthenticated/loading
  // render window before the redirect fires.
  // The login screen is outside (auth)/ so it is naturally excluded.
  useEffect(() => {
    if (isAuthenticated) {
      preventScreenCaptureAsync();
      return () => {
        allowScreenCaptureAsync();
      };
    }
  }, [isAuthenticated]);

  // Reset timer on any tap within authenticated screens
  const handleUserInteraction = useCallback(() => {
    resetInactivityTimer();
  }, [resetInactivityTimer]);

  // D1: Also reset timer on scroll/swipe gestures
  const handleScroll = useCallback(() => {
    resetInactivityTimer();
  }, [resetInactivityTimer]);

  // Reset timer on navigation events (screen changes count as activity).
  // Patch: use navigationRef.current to access the navigator instance,
  // and guard unsubscribe to avoid calling undefined() on cleanup.
  const navigationRef = useNavigationContainerRef();
  useEffect(() => {
    const nav = navigationRef.current;
    if (!nav) return;

    const unsubscribe = nav.addListener('state', () => {
      resetInactivityTimer();
    });

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [navigationRef, resetInactivityTimer]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated, isLoading]);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <TouchableWithoutFeedback onPress={handleUserInteraction}>
      {/* D1: onStartShouldSetResponder on View captures scroll/swipe gesture starts
          without consuming them (returns false), so child ScrollViews still handle them */}
      <View
        style={styles.container}
        onStartShouldSetResponder={() => {
          handleScroll();
          return false;
        }}
      >
        <Stack screenOptions={{ headerShown: false }} />
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
